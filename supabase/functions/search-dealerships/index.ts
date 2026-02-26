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
    // Auth check – super admin only
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

    const { query, searchType, radius } = await req.json();
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Search query is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 1: Use Firecrawl to search for dealerships
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "Firecrawl not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let searchQuery = "";
    if (searchType === "postcode") {
      searchQuery = `independent used car dealerships near ${query} within ${radius || 25} miles UK phone number email address`;
    } else {
      searchQuery = `independent used car dealerships in ${query} UK phone number email address`;
    }

    console.log("Searching with Firecrawl:", searchQuery);

    const firecrawlResponse = await fetch(
      "https://api.firecrawl.dev/v1/search",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 25,
          lang: "en",
          country: "gb",
          scrapeOptions: { formats: ["markdown"] },
        }),
      }
    );

    const firecrawlData = await firecrawlResponse.json();

    if (!firecrawlResponse.ok) {
      console.error("Firecrawl error:", firecrawlData);
      return new Response(
        JSON.stringify({
          error: firecrawlData.error || "Search failed",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results = firecrawlData.data || [];
    console.log(`Found ${results.length} raw results`);

    // Step 2: Use AI to extract structured dealership data from results
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resultsText = results
      .slice(0, 25)
      .map(
        (r: any, i: number) =>
          `Result ${i + 1}:\nTitle: ${r.title || "N/A"}\nURL: ${r.url || "N/A"}\nDescription: ${r.description || "N/A"}\nContent: ${(r.markdown || "").slice(0, 1500)}`
      )
      .join("\n\n---\n\n");

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
              content: `You are an expert at extracting business contact information from web search results. Extract independent car dealership details. Only include actual dealerships (not aggregators like AutoTrader, CarGurus, etc). For each dealership found, extract: name, location, phone, email, website. If information is not available, use null.`,
            },
            {
              role: "user",
              content: `Extract all independent car dealerships from these search results. Return ONLY the structured data.\n\n${resultsText}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_dealerships",
                description:
                  "Extract dealership contact details from search results",
                parameters: {
                  type: "object",
                  properties: {
                    dealerships: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          location: { type: "string" },
                          phone: { type: "string" },
                          email: { type: "string" },
                          website: { type: "string" },
                        },
                        required: ["name"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["dealerships"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "extract_dealerships" },
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "AI extraction failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiData = await aiResponse.json();
    let dealerships: any[] = [];

    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        dealerships = parsed.dealerships || [];
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e);
    }

    console.log(`Extracted ${dealerships.length} dealerships`);

    return new Response(
      JSON.stringify({ success: true, dealerships }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("search-dealerships error:", error);
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
