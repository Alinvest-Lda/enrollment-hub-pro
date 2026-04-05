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

const getBackendBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("VITE_BACKEND_BASE_URL não configurado");
  }
  return baseUrl.replace(/\/+$/, "");
};

export async function requestMpesaPayment(payload: MpesaPaymentPayload): Promise<MpesaPaymentResponse> {
  const backendBaseUrl = getBackendBaseUrl();
  const response = await fetch(`${backendBaseUrl}/wp-json/enrollment-hub/v1/mpesa-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data: MpesaPaymentResponse | null = null;
  try {
    data = await response.json();
  } catch {
    // ignored: fallback below
  }

  if (!response.ok) {
    throw new Error(data?.error || `Backend WordPress retornou HTTP ${response.status}`);
  }

  return data || { success: false, error: "Resposta inválida do backend WordPress" };
}
