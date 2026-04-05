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

function resolveMpesaUrls(environment: string): string[] {
  const mpesaC2bUrlOverride = Deno.env.get("MPESA_C2B_URL")?.trim();
  if (mpesaC2bUrlOverride) {
    return [mpesaC2bUrlOverride];
  }

  return environment === "production"
    ? [
      "https://api.vm.co.mz/ipg/v1x/c2bPayment/singleStage/",
      "https://api.vm.co.mz:18352/ipg/v1x/c2bPayment/singleStage/",
    ]
    : [
      "https://api.sandbox.vm.co.mz/ipg/v1x/c2bPayment/singleStage/",
      "https://api.sandbox.vm.co.mz:18352/ipg/v1x/c2bPayment/singleStage/",
    ];
}

async function generateBearerToken(apiKey: string, publicKey: string): Promise<string> {
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

    // Validate phone
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
      console.error("Missing M-Pesa configuration:", {
        hasApiKey: !!apiKey,
        hasPublicKey: !!publicKey,
        hasServiceProviderCode: !!serviceProviderCode,
      });
      return new Response(
        JSON.stringify({ success: false, error: "Configuração M-Pesa em falta. Verifique as chaves API nas configurações." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get environment setting from DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: settingsData } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", ["mpesa_environment"]);

    const mpesaEnv = settingsData?.find((s: any) => s.key === "mpesa_environment")?.value || "sandbox";

    let bearerToken: string;
    try {
      bearerToken = await generateBearerToken(apiKey, publicKey);
    } catch (cryptoError) {
      console.error("RSA encryption error:", cryptoError);
      return new Response(
        JSON.stringify({ success: false, error: "Erro na encriptação da chave M-Pesa. Verifique a Public Key." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Select endpoints based on environment (with optional override for restricted edge environments)
    const mpesaUrls = resolveMpesaUrls(mpesaEnv);

    const transactionRef = `ENR-${enrollmentId.substring(0, 8).toUpperCase()}`;
    const thirdPartyRef = reference.substring(0, 20);

    const mpesaPayload = {
      input_TransactionReference: transactionRef,
      input_CustomerMSISDN: msisdn,
      input_Amount: amount.toString(),
      input_ThirdPartyReference: thirdPartyRef,
      input_ServiceProviderCode: serviceProviderCode,
    };

    console.log("M-Pesa request:", {
      ...mpesaPayload,
      input_CustomerMSISDN: "***",
      urls: mpesaUrls,
      env: mpesaEnv,
    });

    let mpesaResponse: Response | null = null;
    let mpesaFetchError: unknown = null;
    let selectedEndpoint: string | null = null;

    for (const mpesaUrl of mpesaUrls) {
      try {
        const response = await fetch(mpesaUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearerToken}`,
            Accept: "application/json",
          },
          body: JSON.stringify(mpesaPayload),
        });
        console.log("M-Pesa endpoint reached:", mpesaUrl, "status:", response.status);

        const shouldTryNextEndpoint =
          response.status === 403 ||
          response.status === 404 ||
          response.status >= 500;

        if (shouldTryNextEndpoint) {
          console.warn("M-Pesa endpoint returned retryable status, trying next endpoint:", mpesaUrl, response.status);
          mpesaResponse = response;
          continue;
        }

        mpesaResponse = response;
        selectedEndpoint = mpesaUrl;
        break;
      } catch (fetchError) {
        mpesaFetchError = fetchError;
        console.error("M-Pesa network error for endpoint:", mpesaUrl, fetchError);
      }
    }

    if (!mpesaResponse) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Não foi possível contactar o servidor M-Pesa. Configure MPESA_C2B_URL ou tente novamente.",
          details: String(mpesaFetchError ?? "network_error"),
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!selectedEndpoint) {
      console.warn("M-Pesa request ended with fallback response from last attempted endpoint.");
    }

    let mpesaData: any;
    const responseText = await mpesaResponse.text();
    try {
      mpesaData = JSON.parse(responseText);
    } catch {
      console.error("M-Pesa non-JSON response:", mpesaResponse.status, responseText.substring(0, 500));
      return new Response(
        JSON.stringify({ success: false, error: `Resposta inesperada do M-Pesa (HTTP ${mpesaResponse.status})` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("M-Pesa response:", mpesaResponse.status, JSON.stringify(mpesaData));

    // Check HTTP status first
    if (!mpesaResponse.ok) {
      console.error("M-Pesa HTTP error:", mpesaResponse.status, mpesaData);

      await supabase
        .from("enrollments")
        .update({
          admin_notes: `M-Pesa HTTP ${mpesaResponse.status}. Resposta: ${JSON.stringify(mpesaData).substring(0, 200)}`,
        })
        .eq("id", enrollmentId);

      return new Response(
        JSON.stringify({ success: false, error: `Erro M-Pesa (HTTP ${mpesaResponse.status}). Tente novamente.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isSuccess =
      mpesaData.output_ResponseCode === "INS-0" ||
      mpesaData.output_ResponseCode?.trim() === "INS-0";

    if (isSuccess) {
      await supabase
        .from("enrollments")
        .update({
          status: "approved",
          payment_method: "mpesa",
          admin_notes: `M-Pesa OK. Ref: ${mpesaData.output_TransactionID || transactionRef}. Conv: ${mpesaData.output_ConversationID || "N/A"}`,
        })
        .eq("id", enrollmentId);

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
      await supabase
        .from("enrollments")
        .update({
          admin_notes: `M-Pesa falhou. Código: ${mpesaData.output_ResponseCode}. Desc: ${mpesaData.output_ResponseDesc || "N/A"}`,
        })
        .eq("id", enrollmentId);

      const errorMessages: Record<string, string> = {
        "INS-1": "Erro interno no M-Pesa. Tente novamente.",
        "INS-5": "Transação cancelada pelo utilizador.",
        "INS-6": "Falha na transação. Verifique o saldo.",
        "INS-9": "Tempo de espera esgotado. Tente novamente.",
        "INS-10": "Transação duplicada.",
        "INS-13": "Shortcode inválido.",
        "INS-15": "Valor inválido.",
        "INS-17": "Terceiro inválido.",
        "INS-20": "Referência inválida.",
        "INS-21": "Utilizador não encontrado.",
        "INS-22": "PIN M-Pesa incorreto.",
        "INS-23": "Saldo insuficiente.",
        "INS-24": "Valor abaixo do mínimo.",
        "INS-25": "Valor acima do limite.",
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
    console.error("M-Pesa unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro inesperado ao processar pagamento M-Pesa" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
