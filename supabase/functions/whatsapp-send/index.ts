import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WhatsAppRequest {
  to: string;
  templateName?: string;
  templateLanguage?: string;
  templateParams?: string[];
  textMessage?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, templateName, templateLanguage, templateParams, textMessage } =
      (await req.json()) as WhatsAppRequest;

    if (!to) {
      return new Response(
        JSON.stringify({ success: false, error: "Número de destino obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    if (!accessToken) {
      return new Response(
        JSON.stringify({ success: false, error: "Token WhatsApp não configurado. Configure o WHATSAPP_ACCESS_TOKEN nos segredos." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get phone number ID from settings
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: settingsData } = await serviceClient
      .from("system_settings")
      .select("key, value")
      .in("key", ["whatsapp_phone_number_id"]);

    const phoneNumberId = settingsData?.find((s: any) => s.key === "whatsapp_phone_number_id")?.value;
    if (!phoneNumberId) {
      return new Response(
        JSON.stringify({ success: false, error: "Phone Number ID do WhatsApp não configurado." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone number
    let formattedPhone = to.replace(/\D/g, "");
    if (formattedPhone.length === 9 && /^8[4-7]/.test(formattedPhone)) {
      formattedPhone = "258" + formattedPhone;
    }

    const whatsappUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

    let messagePayload: any;

    if (templateName) {
      messagePayload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage || "pt_BR" },
          ...(templateParams && templateParams.length > 0
            ? {
                components: [
                  {
                    type: "body",
                    parameters: templateParams.map((p) => ({ type: "text", text: p })),
                  },
                ],
              }
            : {}),
        },
      };
    } else if (textMessage) {
      messagePayload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: { body: textMessage },
      };
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Forneça templateName ou textMessage" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("WhatsApp request to:", formattedPhone);

    const response = await fetch(whatsappUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messagePayload),
    });

    const responseData = await response.json();
    console.log("WhatsApp API response:", JSON.stringify(responseData));

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: responseData?.error?.message || `Erro WhatsApp API (${response.status})`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: responseData?.messages?.[0]?.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro ao enviar mensagem WhatsApp" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
