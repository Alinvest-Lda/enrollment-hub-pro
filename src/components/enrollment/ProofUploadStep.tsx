import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/courses-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PaymentMethod } from "./PaymentMethodStep";
import { useSystemSettings } from "@/hooks/use-system-settings";

interface ProofUploadStepProps {
  paymentMethod: PaymentMethod;
  amount: number;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    company?: string;
    nuit?: string;
    message?: string;
    paymentPlanId: string;
  };
  courseId: string;
  courseName: string;
  totalPrice: number;
  onSuccess: (enrollmentId: string) => void;
}

const methodLabels: Record<PaymentMethod, string> = {
  mpesa: "M-Pesa",
  emola: "e-Mola",
  bank_transfer: "Transferência Bancária",
};

const ProofUploadStep = ({
  paymentMethod,
  amount,
  formData,
  courseId,
  courseName,
  totalPrice,
  onSuccess,
}: ProofUploadStepProps) => {
  const { data: settings } = useSystemSettings();
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const paymentInstructions: Record<string, { label: string; details: string } | null> = {
    bank_transfer: settings?.bankAccount
      ? { label: "Dados Bancários", details: `${settings.bankName || "Banco"} — Conta: ${settings.bankAccount}${settings.bankNIB ? ` | NIB: ${settings.bankNIB}` : ""}` }
      : null,
    emola: settings?.emolaNumber
      ? { label: "Dados e-Mola", details: `Número e-Mola: ${settings.emolaNumber}${settings.emolaName ? ` | Nome: ${settings.emolaName}` : ""}` }
      : null,
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast({ title: "Formato inválido", description: "Envie JPG, PNG ou PDF.", variant: "destructive" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Ficheiro muito grande", description: "Máximo 10MB.", variant: "destructive" });
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      toast({ title: "Sem ficheiro", description: "Envie o comprovativo.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("fullName", formData.fullName);
      body.append("email", formData.email);
      body.append("phone", formData.phone);
      body.append("company", formData.company || "");
      body.append("nuit", formData.nuit || "");
      body.append("message", formData.message || "");
      body.append("courseId", courseId);
      body.append("courseName", courseName);
      body.append("paymentPlan", formData.paymentPlanId);
      body.append("amountDue", amount.toString());
      body.append("totalPrice", totalPrice.toString());
      body.append("paymentMethod", paymentMethod);
      body.append("file", uploadedFile);

      const { data, error } = await supabase.functions.invoke("submit-enrollment", { body });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Erro desconhecido");

      onSuccess(data.enrollmentId);
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: "Erro ao enviar", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const instructions = paymentInstructions[paymentMethod];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      <div className="bg-muted rounded-lg p-4 text-sm">
        <p className="font-heading font-semibold mb-1">
          Pagamento por {methodLabels[paymentMethod]}
        </p>
        <p className="text-muted-foreground">
          Efectue o pagamento de{" "}
          <strong className="text-foreground">{formatCurrency(amount)}</strong> e envie o
          comprovativo abaixo.
        </p>
        {instructions && (
          <div className="mt-2 p-2 bg-background rounded border border-border">
            <p className="text-xs font-semibold">{instructions.label}</p>
            <p className="text-xs text-muted-foreground">{instructions.details}</p>
          </div>
        )}
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        {uploadedFile ? (
          <div className="flex items-center justify-center gap-2 text-success">
            <FileText className="w-6 h-6" />
            <span className="font-medium text-sm">{uploadedFile.name}</span>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Clique para enviar o comprovativo</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou PDF (máx. 10MB)</p>
          </>
        )}
      </div>

      <Button onClick={handleSubmit} variant="navy" className="w-full" size="lg" disabled={uploading}>
        <Send className="w-4 h-4" />
        {uploading ? "A enviar..." : "Enviar Comprovativo"}
      </Button>
    </motion.div>
  );
};

export default ProofUploadStep;
