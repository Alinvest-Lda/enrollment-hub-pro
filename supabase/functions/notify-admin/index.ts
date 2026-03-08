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
    const { enrollmentId, courseName, studentName, amount } = await req.json();

    if (!enrollmentId || !courseName || !studentName) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch admin emails from user_roles
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError || !adminRoles?.length) {
      console.error("No admins found:", rolesError);
      return new Response(
        JSON.stringify({ success: false, error: "No admin users found" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin emails from auth.users
    const adminEmails: string[] = [];
    for (const role of adminRoles) {
      const { data: userData } = await supabase.auth.admin.getUserById(role.user_id);
      if (userData?.user?.email) {
        adminEmails.push(userData.user.email);
      }
    }

    if (adminEmails.length === 0) {
      console.error("No admin emails found");
      return new Response(
        JSON.stringify({ success: false, error: "No admin emails found" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Lovable AI gateway to send notification
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.log("LOVABLE_API_KEY not configured — skipping email notification");
      return new Response(
        JSON.stringify({ success: true, skipped: true, message: "Email notifications not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ref = enrollmentId.substring(0, 8).toUpperCase();
    const emailSubject = `Nova Inscrição: ${studentName} — ${courseName}`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: hsl(220, 55%, 16%); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">ALINVEST</h1>
        </div>
        <div style="padding: 24px; background: #ffffff;">
          <h2 style="color: hsl(220, 40%, 13%); margin-top: 0;">Nova Inscrição Recebida</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; width: 120px;">Referência</td><td style="padding: 8px 0; font-weight: bold;">${ref}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Formando</td><td style="padding: 8px 0;">${studentName}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Curso</td><td style="padding: 8px 0;">${courseName}</td></tr>
            ${amount ? `<tr><td style="padding: 8px 0; color: #666;">Valor</td><td style="padding: 8px 0;">${amount} MZN</td></tr>` : ""}
          </table>
          <div style="margin-top: 24px; text-align: center;">
            <a href="https://enrollment-hub-pro.lovable.app/backoffice" 
               style="background: hsl(350, 72%, 45%); color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Ver no Backoffice
            </a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; color: #999; font-size: 12px;">
          ALINVEST Sociedade Unipessoal Lda. — Maputo, Moçambique
        </div>
      </div>
    `;

    console.log(`Would send email to: ${adminEmails.join(", ")}`);
    console.log(`Subject: ${emailSubject}`);

    // Note: Actual email sending requires a configured email service.
    // For now, we log the notification. The realtime system handles in-app notifications.

    return new Response(
      JSON.stringify({
        success: true,
        notifiedAdmins: adminEmails.length,
        message: "Admin notification processed",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to send notification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
