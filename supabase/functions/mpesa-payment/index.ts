import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MpesaC2BRequest {
  enrollmentId: string;
  phone: string;
  amount: number;
  reference: string;
}

/**
 * Generates bearer token for M-Pesa API using RSA public key encryption.
 * Vodacom M-Pesa Mozambique uses the public key to encrypt the API key,
 * which is then base64-encoded and sent as a Bearer token.
 */
async function generateBearerToken(apiKey: string, publicKey: string): Promise<string> {
  // Decode the PEM public key
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = publicKey
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "spki",
    binaryDer,
    { name: "RSA-OAEP", hash: "SHA-1" },
    false,
    ["encrypt"]
  );

  const encoded = new TextEncoder().encode(apiKey);
  const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, cryptoKey, encoded);
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { enrollmentId, phone, amount, reference } =
      (await req.json()) as MpesaC2BRequest;

    // Validate inputs
    if (!enrollmentId || !phone || !amount || !reference) {
      return new Response(
        JSON.stringify({ success: false, error: "Campos obrigatórios em falta" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phone: must be 258XXXXXXXXX (12 digits) or 84/85/86/87 XXXXXXX
    const cleanPhone = phone.replace(/\D/g, "");
    let msisdn = cleanPhone;
    if (cleanPhone.length === 9 && /^8[4-7]/.test(cleanPhone)) {
      msisdn = "258" + cleanPhone;
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith("258")) {
      msisdn = cleanPhone;
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Número de telefone M-Pesa inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("MPESA_API_KEY");
    const publicKey = Deno.env.get("MPESA_PUBLIC_KEY");
    const serviceProviderCode = Deno.env.get("MPESA_SERVICE_PROVIDER_CODE");

    if (!apiKey || !publicKey || !serviceProviderCode) {
      console.error("Missing M-Pesa configuration");
      return new Response(
        JSON.stringify({ success: false, error: "Configuração M-Pesa em falta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bearerToken = await generateBearerToken(apiKey, publicKey);

    // M-Pesa C2B (Customer to Business) API call
    // Using Vodacom Mozambique sandbox/production endpoint
    const mpesaUrl = "https://api.sandbox.vm.co.mz:18352/ipg/v1x/c2bPayment/singleStage/";

    const transactionRef = `ENR-${enrollmentId.substring(0, 8).toUpperCase()}`;
    const thirdPartyRef = reference.substring(0, 20);

    const mpesaPayload = {
      input_TransactionReference: transactionRef,
      input_CustomerMSISDN: msisdn,
      input_Amount: amount.toString(),
      input_ThirdPartyReference: thirdPartyRef,
      input_ServiceProviderCode: serviceProviderCode,
    };

    console.log("M-Pesa request:", { ...mpesaPayload, input_CustomerMSISDN: "***" });

    const mpesaResponse = await fetch(mpesaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
        Origin: "*",
      },
      body: JSON.stringify(mpesaPayload),
    });

    const mpesaData = await mpesaResponse.json();
    console.log("M-Pesa response:", mpesaData);

    // M-Pesa response codes: INS-0 = success
    const isSuccess =
      mpesaData.output_ResponseCode === "INS-0" ||
      mpesaData.output_ResponseCode === "INS-0 ";

    // Update enrollment in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (isSuccess) {
      const { error: updateError } = await supabase
        .from("enrollments")
        .update({
          status: "approved",
          payment_method: "mpesa",
          admin_notes: `M-Pesa Ref: ${mpesaData.output_TransactionID || transactionRef}. Código: ${mpesaData.output_ResponseCode}`,
        })
        .eq("id", enrollmentId);

      if (updateError) {
        console.error("Error updating enrollment:", updateError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          transactionId: mpesaData.output_TransactionID,
          conversationId: mpesaData.output_ConversationID,
          message: "Pagamento M-Pesa processado com sucesso",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Payment failed — keep enrollment as pending
      const { error: updateError } = await supabase
        .from("enrollments")
        .update({
          admin_notes: `M-Pesa falhou. Código: ${mpesaData.output_ResponseCode}. Desc: ${mpesaData.output_ResponseDesc || "N/A"}`,
        })
        .eq("id", enrollmentId);

      if (updateError) {
        console.error("Error updating enrollment:", updateError);
      }

      // Map common M-Pesa error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        "INS-1": "Erro interno no M-Pesa. Tente novamente.",
        "INS-5": "Transação cancelada pelo utilizador.",
        "INS-6": "Falha na transação. Verifique o saldo.",
        "INS-9": "Tempo de espera esgotado. Tente novamente.",
        "INS-10": "Valor duplicado. Já existe uma transação similar.",
        "INS-13": "Shortcode inválido.",
        "INS-15": "Valor inválido.",
        "INS-17": "Terceiro inválido.",
        "INS-20": "Referência de transação inválida.",
        "INS-21": "Utilizador não encontrado.",
        "INS-22": "PIN M-Pesa incorreto.",
        "INS-23": "Saldo insuficiente.",
        "INS-24": "Valor abaixo do mínimo.",
        "INS-25": "Valor acima do limite permitido.",
      };

      const userMessage =
        errorMessages[mpesaData.output_ResponseCode?.trim()] ||
        `Pagamento M-Pesa falhou (${mpesaData.output_ResponseCode || "erro desconhecido"})`;

      return new Response(
        JSON.stringify({ success: false, error: userMessage }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("M-Pesa error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro ao processar pagamento M-Pesa" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
