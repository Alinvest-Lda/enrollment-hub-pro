import { useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/courses-data";
import { supabase } from "@/integrations/supabase/client";
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

  const extractFunctionErrorMessage = async (err: any): Promise<string> => {
    const defaultMessage = "Erro ao processar pagamento";

    try {
      if (typeof err?.context?.json === "function") {
        const payload = await err.context.json();
        if (payload?.error) return payload.error;
        if (payload?.message) return payload.message;
      }
    } catch (parseError) {
      console.warn("Could not parse edge function error payload", parseError);
    }

    if (typeof err?.message === "string" && err.message.trim().length > 0) {
      if (err.message.includes("non-2xx")) {
        return "Pagamento rejeitado pelo M-Pesa. Verifique o número/saldo e tente novamente.";
      }
      return err.message;
    }

    return defaultMessage;
  };

  const handlePayment = async () => {
    if (!mpesaPhone || mpesaPhone.replace(/\D/g, "").length < 9) {
      toast({
        title: "Número inválido",
        description: "Introduza um número M-Pesa válido (84/85/86/87).",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setStatus("processing");

    try {
      const { data, error } = await supabase.functions.invoke("mpesa-payment", {
        body: {
          enrollmentId,
          phone: mpesaPhone,
          amount,
          reference,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setStatus("success");
        onSuccess(data.transactionId || "");
      } else {
        setStatus("error");
        onError(data?.error || "Erro desconhecido");
      }
    } catch (err: any) {
      console.error("M-Pesa payment error:", err);
      setStatus("error");
      const userMessage = await extractFunctionErrorMessage(err);
      onError(userMessage);
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
        />
        <p className="text-xs text-muted-foreground mt-1">
          Apenas números Vodacom (84, 85, 86, 87)
        </p>
      </div>

      {status === "processing" && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20">
          <Loader2 className="w-5 h-5 text-accent animate-spin" />
          <div>
            <p className="text-sm font-medium">A processar pagamento...</p>
            <p className="text-xs text-muted-foreground">
              Verifique o seu telemóvel e confirme com o PIN M-Pesa
            </p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
          <CheckCircle className="w-5 h-5 text-success" />
          <p className="text-sm font-medium text-success">Pagamento confirmado!</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            Falha no pagamento. Tente novamente.
          </p>
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
              Pagar com M-Pesa
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
};

export default MpesaPaymentStep;
