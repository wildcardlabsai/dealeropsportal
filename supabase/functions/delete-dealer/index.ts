import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) throw new Error("Unauthorized");

    // Check super admin role
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin");

    if (!roles?.length) throw new Error("Only super admins can delete dealers");

    const { dealer_id } = await req.json();
    if (!dealer_id) throw new Error("dealer_id is required");

    console.log(`[DELETE-DEALER] Starting deletion of dealer ${dealer_id} by ${user.id}`);

    // Get all users associated with this dealer
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("dealer_id", dealer_id);

    const userIds = profiles?.map(p => p.id) || [];

    // Delete in order to respect foreign keys (child tables first)
    const tablesToClean = [
      "aftersales_updates",
      "aftersales_attachments",
      "aftersales_cases",
      "aftersales",
      "cra_case_activities",
      "cra_case_documents",
      "cra_cases",
      "courtesy_loans",
      "courtesy_cars",
      "communication_logs",
      "customer_consents",
      "complaints",
      "compliance_incidents",
      "compliance_documents",
      "data_subject_requests",
      "dealer_feature_flags",
      "dealer_onboarding_events",
      "dealer_preferences",
      "dealer_security_settings",
      "dealer_subscriptions",
      "billing_documents",
      "review_requests",
      "review_platform_links",
      "vehicle_checks",
      "handovers",
      "invoices",
      "warranties",
      "documents",
      "tasks",
      "leads",
      "vehicles",
      "customers",
      "audit_logs",
      "document_templates",
    ];

    for (const table of tablesToClean) {
      const { error } = await supabaseAdmin.from(table).delete().eq("dealer_id", dealer_id);
      if (error) {
        console.log(`[DELETE-DEALER] Warning: could not clean ${table}: ${error.message}`);
      }
    }

    // Delete user roles
    for (const uid of userIds) {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", uid);
    }

    // Delete profiles
    await supabaseAdmin.from("profiles").delete().eq("dealer_id", dealer_id);

    // Delete auth users
    for (const uid of userIds) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
      if (error) console.log(`[DELETE-DEALER] Warning: could not delete auth user ${uid}: ${error.message}`);
    }

    // Delete email outbox entries
    await supabaseAdmin.from("email_outbox").delete().eq("dealer_id", dealer_id);

    // Finally delete the dealer
    const { error: dealerErr } = await supabaseAdmin.from("dealers").delete().eq("id", dealer_id);
    if (dealerErr) throw new Error(`Failed to delete dealer: ${dealerErr.message}`);

    console.log(`[DELETE-DEALER] Successfully deleted dealer ${dealer_id} and ${userIds.length} associated users`);

    return new Response(JSON.stringify({ message: "Dealer and all associated data deleted successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[DELETE-DEALER] Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.message.includes("Unauthorized") || err.message.includes("super admin") ? 403 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
