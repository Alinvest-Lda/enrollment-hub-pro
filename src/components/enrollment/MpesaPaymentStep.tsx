import { useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/courses-data";
import { requestMpesaPayment } from "@/lib/backend-client";
import { toast } from "@/hooks/use-toast";

interface MpesaPaymentStepProps {
  enrollmentId: string;
  phone: string;
  amount: number;
  reference: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

const MpesaPaymentStep = ({
  enrollmentId,
  phone,
  amount,
  reference,
  onSuccess,
  onError,
}: MpesaPaymentStepProps) => {
  const [mpesaPhone, setMpesaPhone] = useState(phone);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePayment = async () => {
    const normalizedPhone = mpesaPhone.replace(/\D/g, "").replace(/^258/, "");

    if (!/^(84|85|86|87)\d{7}$/.test(normalizedPhone)) {
      toast({
        title: "Número inválido",
        description: "Introduza um número M-Pesa válido com 9 dígitos (84, 85, 86 ou 87).",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setStatus("processing");
    setErrorMessage("");

    try {
      const data = await requestMpesaPayment({
        enrollmentId,
        phone: normalizedPhone,
        amount,
        reference,
      });

      if (data.success && data.transactionId) {
        setStatus("success");
        onSuccess(data.transactionId);
        return;
      }

      const message = data.error || "O M-Pesa não confirmou o pedido. Tente novamente.";
      setStatus("error");
      setErrorMessage(message);
      onError(message);
    } catch (err) {
      console.error("M-Pesa payment error:", err);
      const message =
        err instanceof Error && err.message.trim()
          ? err.message
          : "Não foi possível processar o pagamento. Tente novamente.";
      setStatus("error");
      setErrorMessage(message);
      onError(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      <div className="bg-muted rounded-lg p-4 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <Smartphone className="w-4 h-4 text-accent" />
          <p className="font-heading font-semibold">Pagamento M-Pesa</p>
        </div>
        <p className="text-muted-foreground">
          Será enviado um pedido de pagamento para o seu telemóvel. Confirme com o seu PIN M-Pesa.
        </p>
        <p className="text-lg font-heading font-bold text-accent mt-2">
          {formatCurrency(amount)}
        </p>
      </div>

      <div>
        <Label htmlFor="mpesa-phone" className="mb-1.5 block">
          Número M-Pesa (Vodacom)
        </Label>
        <Input
          id="mpesa-phone"
          value={mpesaPhone}
          onChange={(e) => setMpesaPhone(e.target.value)}
          placeholder="84 999 9999"
          disabled={processing || status === "success"}
          inputMode="tel"
          autoComplete="tel"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Aceitamos 84, 85, 86 ou 87. Também pode introduzir o número com +258.
        </p>
      </div>

      {status === "processing" && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20">
          <Loader2 className="w-5 h-5 text-accent animate-spin" />
          <div>
            <p className="text-sm font-medium">A processar pagamento...</p>
            <p className="text-xs text-muted-foreground">
              Verifique o seu telemóvel e confirme com o PIN M-Pesa.
            </p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
          <CheckCircle className="w-5 h-5 text-success" />
          <div>
            <p className="text-sm font-medium text-success">Pedido M-Pesa confirmado.</p>
            <p className="text-xs text-muted-foreground mt-1">
              A sua inscrição foi registada com sucesso.
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-destructive">Não foi possível concluir o pagamento.</p>
              {errorMessage && (
                <p className="text-xs text-muted-foreground mt-1">{errorMessage}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {status !== "success" && (
        <Button
          onClick={handlePayment}
          variant="navy"
          className="w-full"
          size="lg"
          disabled={processing}
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              A processar...
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4" />
              {status === "error" ? "Tentar novamente" : "Pagar com M-Pesa"}
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
};

export default MpesaPaymentStep;
