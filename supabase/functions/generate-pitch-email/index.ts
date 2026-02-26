import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { dealershipName, location, email, phone } = await req.json();

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a professional sales copywriter for DealerOps, a modern dealership management platform built for independent UK car dealers. Write personalised, concise pitch emails. 

DealerOps key selling points:
- All-in-one platform: CRM, invoicing, vehicle checks, warranties, aftersales, compliance, and more
- Built specifically for independent UK car dealers
- DVLA integration for instant vehicle lookups
- CRA Shield: Consumer Rights Act compliance engine
- Digital handovers with e-signatures
- Review Booster to grow Google/Trustpilot reviews
- Compliance centre for GDPR, FCA, and trading standards
- 14-day free trial, no card required
- Starts from £49/month

Keep the tone friendly, professional, and not pushy. The email should be 150-200 words max. Include a clear CTA to start a free trial.`,
            },
            {
              role: "user",
              content: `Write a pitch email for: ${dealershipName}${location ? ` in ${location}` : ""}. ${email ? `Their email is ${email}.` : ""} ${phone ? `Their phone is ${phone}.` : ""} Personalise it to their location and dealership name.`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_email",
                description: "Generate a pitch email with subject and body",
                parameters: {
                  type: "object",
                  properties: {
                    subject: {
                      type: "string",
                      description: "Email subject line, under 60 chars",
                    },
                    body: {
                      type: "string",
                      description:
                        "Email body in plain text with line breaks",
                    },
                  },
                  required: ["subject", "body"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "generate_email" },
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, try again shortly" }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Email generation failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiData = await aiResponse.json();
    let emailData = { subject: "", body: "" };

    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        emailData = JSON.parse(toolCall.function.arguments);
      }
    } catch (e) {
      console.error("Failed to parse email:", e);
      return new Response(
        JSON.stringify({ error: "Failed to parse generated email" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ success: true, ...emailData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-pitch-email error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
