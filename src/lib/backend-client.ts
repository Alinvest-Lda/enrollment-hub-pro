export interface MpesaPaymentPayload {
  enrollmentId: string;
  phone: string;
  amount: number;
  reference: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  error?: string;
  message?: string;
  transactionId?: string;
  conversationId?: string;
}

const REQUEST_TIMEOUT_MS = 30_000;

const getBackendBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("O serviço de pagamento não está configurado. Contacte a ALINVEST.");
  }

  return baseUrl.replace(/\/+$/, "");
};

export async function requestMpesaPayment(
  payload: MpesaPaymentPayload,
): Promise<MpesaPaymentResponse> {
  const backendBaseUrl = getBackendBaseUrl();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${backendBaseUrl}/wp-json/enrollment-hub/v1/mpesa-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      },
    );

    let data: MpesaPaymentResponse | null = null;

    try {
      data = await response.json();
    } catch {
      // Keep the HTTP error below when the backend does not return JSON.
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          `O serviço de pagamento devolveu HTTP ${response.status}.`,
      );
    }

    if (!data) {
      throw new Error("Resposta inválida do serviço de pagamento.");
    }

    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        "O pedido demorou demasiado tempo. Verifique o seu telemóvel e tente novamente.",
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
