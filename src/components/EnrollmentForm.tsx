import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Send, MessageCircle, User, Phone, Mail, Building, ArrowLeft, CreditCard, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Course, formatCurrency, getWhatsAppLink } from "@/lib/courses-data";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PaymentMethodStep, { type PaymentMethod } from "@/components/enrollment/PaymentMethodStep";
import MpesaPaymentStep from "@/components/enrollment/MpesaPaymentStep";
import ProofUploadStep from "@/components/enrollment/ProofUploadStep";

const enrollmentSchema = z.object({
  fullName: z.string().min(3, "Nome completo obrigatório").max(100),
  email: z.string().email("Email inválido").max(255),
  phone: z.string().min(9, "Telefone inválido").max(20),
  company: z.string().max(100).optional(),
  nuit: z.string().max(20).optional(),
  message: z.string().max(500).optional(),
  paymentPlanId: z.string().min(1, "Seleccione um plano de pagamento"),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;
type Step = "form" | "payment-method" | "mpesa" | "upload" | "done";

interface EnrollmentFormProps {
  course: Course;
}

const steps: { key: Step; label: string }[] = [
  { key: "form", label: "Dados" },
  { key: "payment-method", label: "Pagamento" },
  { key: "done", label: "Confirmação" },
];

const EnrollmentForm = ({ course }: EnrollmentFormProps) => {
  const [step, setStep] = useState<Step>("form");
  const [formData, setFormData] = useState<EnrollmentFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isSubmitting } } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: { paymentPlanId: course.paymentPlans[0]?.id || "" },
  });

  const selectedPlanId = watch("paymentPlanId");
  const selectedPlan = course.paymentPlans.find((p) => p.id === selectedPlanId);
  const firstInstallment = selectedPlan ? course.price * selectedPlan.installments[0].percentage / 100 : course.price;

  const onSubmit = (data: EnrollmentFormData) => {
    setFormData(data);
    setStep("payment-method");
    toast({ title: "Dados guardados!", description: "Escolha o método de pagamento." });
  };

  const goBackToForm = () => {
    // Restore form values from saved formData
    if (formData) {
      setValue("fullName", formData.fullName);
      setValue("email", formData.email);
      setValue("phone", formData.phone);
      setValue("company", formData.company || "");
      setValue("nuit", formData.nuit || "");
      setValue("message", formData.message || "");
      setValue("paymentPlanId", formData.paymentPlanId);
    }
    setStep("form");
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handlePaymentMethodContinue = async () => {
    if (!paymentMethod || !formData) return;

    if (paymentMethod === "mpesa") {
      try {
        const body = new FormData();
        body.append("fullName", formData.fullName);
        body.append("email", formData.email);
        body.append("phone", formData.phone);
        body.append("company", formData.company || "");
        body.append("nuit", formData.nuit || "");
        body.append("message", formData.message || "");
        body.append("courseId", course.id);
        body.append("courseName", course.title);
        body.append("paymentPlan", formData.paymentPlanId);
        body.append("amountDue", firstInstallment.toString());
        body.append("totalPrice", course.price.toString());
        body.append("paymentMethod", "mpesa");

        const { data, error } = await supabase.functions.invoke("submit-enrollment", { body });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || "Erro");

        setEnrollmentId(data.enrollmentId);
        setStep("mpesa");
      } catch (err: any) {
        toast({ title: "Erro", description: err.message, variant: "destructive" });
      }
    } else {
      setStep("upload");
    }
  };

  const stepTitle: Record<Step, string> = {
    form: "Formulário de Inscrição",
    "payment-method": "Método de Pagamento",
    mpesa: "Pagamento M-Pesa",
    upload: "Envio de Comprovativo",
    done: "Inscrição Confirmada",
  };

  const canGoBack = step === "payment-method" || step === "upload" || step === "mpesa";

  const handleGoBack = () => {
    if (step === "mpesa" || step === "upload") {
      setStep("payment-method");
    } else if (step === "payment-method") {
      goBackToForm();
    }
  };

  const currentStepIndex = step === "form" ? 0 : step === "done" ? 2 : 1;

  // Summary of user data for payment steps
  const DataSummary = () => {
    if (!formData) return null;
    return (
      <div className="bg-muted/50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wide">Seus Dados</p>
          <button
            onClick={goBackToForm}
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            Editar
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <p><span className="text-muted-foreground">Nome:</span> {formData.fullName}</p>
          <p><span className="text-muted-foreground">Tel:</span> {formData.phone}</p>
          <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
          {formData.company && <p><span className="text-muted-foreground">Empresa:</span> {formData.company}</p>}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-card border-border rounded-xl overflow-hidden">
      {/* Step progress */}
      <div className="flex border-b border-border">
        {steps.map((s, i) => (
          <div
            key={s.key}
            className={`flex-1 py-3 text-center text-xs font-semibold transition-colors ${
              i <= currentStepIndex
                ? "bg-primary/5 text-primary border-b-2 border-primary"
                : "text-muted-foreground bg-muted/30"
            }`}
          >
            <span className="hidden sm:inline">{i + 1}. </span>{s.label}
          </div>
        ))}
      </div>

      <CardHeader className="pb-0 pt-5 px-6">
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          {canGoBack && (
            <button
              onClick={handleGoBack}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {step === "done" ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : (
            <CreditCard className="w-5 h-5 text-accent" />
          )}
          {stepTitle[step]}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.form key="form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="flex items-center gap-1.5 mb-2 text-sm font-medium"><User className="w-3.5 h-3.5 text-muted-foreground" /> Nome Completo *</Label>
                  <Input id="fullName" {...register("fullName")} placeholder="João da Silva" className="rounded-lg" />
                  {errors.fullName && <p className="text-xs text-destructive mt-1.5">{errors.fullName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-1.5 mb-2 text-sm font-medium"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email *</Label>
                  <Input id="email" type="email" {...register("email")} placeholder="joao@email.com" className="rounded-lg" />
                  {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-1.5 mb-2 text-sm font-medium"><Phone className="w-3.5 h-3.5 text-muted-foreground" /> Telefone/WhatsApp *</Label>
                  <Input id="phone" {...register("phone")} placeholder="+258 84 999 9999" className="rounded-lg" />
                  {errors.phone && <p className="text-xs text-destructive mt-1.5">{errors.phone.message}</p>}
                </div>
                <div>
                  <Label htmlFor="company" className="flex items-center gap-1.5 mb-2 text-sm font-medium"><Building className="w-3.5 h-3.5 text-muted-foreground" /> Empresa</Label>
                  <Input id="company" {...register("company")} placeholder="Opcional" className="rounded-lg" />
                </div>
              </div>

              <div>
                <Label htmlFor="nuit" className="mb-2 block text-sm font-medium">NUIT (Opcional)</Label>
                <Input id="nuit" {...register("nuit")} placeholder="Número Único de Identificação Tributária" className="rounded-lg" />
              </div>

              <div>
                <Label htmlFor="message" className="mb-2 block text-sm font-medium">Mensagem (Opcional)</Label>
                <Textarea id="message" {...register("message")} placeholder="Alguma dúvida ou informação adicional?" rows={3} className="rounded-lg" />
              </div>

              <div>
                <Label className="mb-3 block font-heading font-semibold text-sm">Modalidade de Pagamento *</Label>
                <RadioGroup
                  value={selectedPlanId}
                  onValueChange={(val) => {
                    const event = { target: { name: "paymentPlanId", value: val } };
                    register("paymentPlanId").onChange(event as any);
                  }}
                  className="space-y-2"
                >
                  {course.paymentPlans.map((plan) => (
                    <label key={plan.id} className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selectedPlanId === plan.id ? "border-accent bg-accent/5 shadow-sm" : "border-border hover:border-accent/40"}`}>
                      <RadioGroupItem value={plan.id} className="mt-0.5" />
                      <div>
                        <p className="font-heading font-semibold text-sm">{plan.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                {errors.paymentPlanId && <p className="text-xs text-destructive mt-1.5">{errors.paymentPlanId.message}</p>}
              </div>

              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Valor a pagar</p>
                <p className="text-2xl font-heading font-extrabold text-accent">{formatCurrency(firstInstallment)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedPlan?.installments.length === 1 ? "Pagamento único" : `1ª prestação de ${selectedPlan?.installments.length}`}
                </p>
              </div>

              <Button type="submit" variant="navy" className="w-full rounded-lg" size="lg" disabled={isSubmitting}>
                <Send className="w-4 h-4" />
                Escolher Método de Pagamento
              </Button>
            </motion.form>
          )}

          {step === "payment-method" && (
            <motion.div key="payment-method" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="space-y-5">
              <DataSummary />

              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Valor a pagar</p>
                <p className="text-2xl font-heading font-extrabold text-accent">{formatCurrency(firstInstallment)}</p>
              </div>

              <PaymentMethodStep selected={paymentMethod} onSelect={handlePaymentMethodSelect} />

              <Button
                onClick={handlePaymentMethodContinue}
                variant="navy"
                className="w-full rounded-lg"
                size="lg"
                disabled={!paymentMethod}
              >
                <Send className="w-4 h-4" />
                Continuar
              </Button>
            </motion.div>
          )}

          {step === "mpesa" && formData && enrollmentId && (
            <motion.div key="mpesa" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              <DataSummary />
              <MpesaPaymentStep
                enrollmentId={enrollmentId}
                phone={formData.phone}
                amount={firstInstallment}
                reference={course.id}
                onSuccess={() => setStep("done")}
                onError={(err) => toast({ title: "Erro M-Pesa", description: err, variant: "destructive" })}
              />
            </motion.div>
          )}

          {step === "upload" && formData && paymentMethod && (
            <motion.div key="upload" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              <DataSummary />
              <ProofUploadStep
                paymentMethod={paymentMethod}
                amount={firstInstallment}
                formData={formData as { fullName: string; email: string; phone: string; company?: string; nuit?: string; message?: string; paymentPlanId: string }}
                courseId={course.id}
                courseName={course.title}
                totalPrice={course.price}
                onSuccess={(id) => {
                  setEnrollmentId(id);
                  setStep("done");
                }}
              />
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-2">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h3 className="font-heading text-xl font-bold">Inscrição Submetida com Sucesso!</h3>
              {enrollmentId && <p className="text-xs text-muted-foreground font-mono bg-muted inline-block px-3 py-1 rounded-full">Ref: {enrollmentId.substring(0, 8).toUpperCase()}</p>}
              <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                {paymentMethod === "mpesa"
                  ? "Pagamento M-Pesa confirmado! Receberá confirmação via WhatsApp em breve."
                  : "O seu comprovativo será analisado pela nossa equipa. Receberá confirmação via WhatsApp em até 24 horas."}
              </p>
              <a
                href={getWhatsAppLink(`Olá, acabei de submeter a minha inscrição para o curso: ${course.title}. Ref: ${enrollmentId?.substring(0, 8).toUpperCase()}`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="whatsapp" size="lg" className="mt-4 rounded-lg">
                  <MessageCircle className="w-4 h-4" />
                  Acompanhar no WhatsApp
                </Button>
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default EnrollmentForm;
