import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Send, MessageCircle, User, Phone, Mail, Building, ArrowLeft } from "lucide-react";
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

const EnrollmentForm = ({ course }: EnrollmentFormProps) => {
  const [step, setStep] = useState<Step>("form");
  const [formData, setFormData] = useState<EnrollmentFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<EnrollmentFormData>({
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

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handlePaymentMethodContinue = async () => {
    if (!paymentMethod || !formData) return;

    if (paymentMethod === "mpesa") {
      // Create enrollment first, then process M-Pesa
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
      // Offline methods → upload proof
      setStep("upload");
    }
  };

  const stepTitle = {
    form: "Formulário de Inscrição",
    "payment-method": "Método de Pagamento",
    mpesa: "Pagamento M-Pesa",
    upload: "Envio de Comprovativo",
    done: "Inscrição Submetida",
  };

  const stepIcon = {
    form: <User className="w-5 h-5 text-accent" />,
    "payment-method": <Send className="w-5 h-5 text-accent" />,
    mpesa: <Send className="w-5 h-5 text-accent" />,
    upload: <Send className="w-5 h-5 text-accent" />,
    done: <CheckCircle className="w-5 h-5 text-success" />,
  };

  const canGoBack = step === "payment-method" || step === "upload";

  return (
    <Card className="shadow-card border-border">
      <CardHeader className="bg-muted/50 border-b border-border">
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          {canGoBack && (
            <button
              onClick={() => setStep(step === "upload" ? "payment-method" : "form")}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {stepIcon[step]} {stepTitle[step]}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="flex items-center gap-1 mb-1.5"><User className="w-3.5 h-3.5" /> Nome Completo *</Label>
                  <Input id="fullName" {...register("fullName")} placeholder="João da Silva" />
                  {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-1 mb-1.5"><Mail className="w-3.5 h-3.5" /> Email *</Label>
                  <Input id="email" type="email" {...register("email")} placeholder="joao@email.com" />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-1 mb-1.5"><Phone className="w-3.5 h-3.5" /> Telefone/WhatsApp *</Label>
                  <Input id="phone" {...register("phone")} placeholder="+258 84 999 9999" />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <Label htmlFor="company" className="flex items-center gap-1 mb-1.5"><Building className="w-3.5 h-3.5" /> Empresa</Label>
                  <Input id="company" {...register("company")} placeholder="Opcional" />
                </div>
              </div>

              <div>
                <Label htmlFor="nuit" className="mb-1.5 block">NUIT (Opcional)</Label>
                <Input id="nuit" {...register("nuit")} placeholder="Número Único de Identificação Tributária" />
              </div>

              <div>
                <Label htmlFor="message" className="mb-1.5 block">Mensagem (Opcional)</Label>
                <Textarea id="message" {...register("message")} placeholder="Alguma dúvida ou informação adicional?" rows={3} />
              </div>

              <div>
                <Label className="mb-2 block font-heading font-semibold">Modalidade de Pagamento *</Label>
                <RadioGroup
                  value={selectedPlanId}
                  onValueChange={(val) => {
                    const event = { target: { name: "paymentPlanId", value: val } };
                    register("paymentPlanId").onChange(event as any);
                  }}
                  className="space-y-2"
                >
                  {course.paymentPlans.map((plan) => (
                    <label key={plan.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedPlanId === plan.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"}`}>
                      <RadioGroupItem value={plan.id} className="mt-0.5" />
                      <div>
                        <p className="font-heading font-semibold text-sm">{plan.label}</p>
                        <p className="text-xs text-muted-foreground">{plan.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                {errors.paymentPlanId && <p className="text-xs text-destructive mt-1">{errors.paymentPlanId.message}</p>}
              </div>

              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm font-heading font-semibold">Resumo do Pagamento Inicial</p>
                <p className="text-2xl font-heading font-bold text-accent mt-1">{formatCurrency(firstInstallment)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedPlan?.installments.length === 1 ? "Pagamento único" : `1ª prestação de ${selectedPlan?.installments.length}`}
                </p>
              </div>

              <Button type="submit" variant="navy" className="w-full" size="lg" disabled={isSubmitting}>
                <Send className="w-4 h-4" />
                Escolher Método de Pagamento
              </Button>
            </motion.form>
          )}

          {step === "payment-method" && (
            <motion.div key="payment-method" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm font-heading font-semibold">Valor a pagar</p>
                <p className="text-2xl font-heading font-bold text-accent mt-1">{formatCurrency(firstInstallment)}</p>
              </div>

              <PaymentMethodStep selected={paymentMethod} onSelect={handlePaymentMethodSelect} />

              <Button
                onClick={handlePaymentMethodContinue}
                variant="navy"
                className="w-full"
                size="lg"
                disabled={!paymentMethod}
              >
                <Send className="w-4 h-4" />
                Continuar
              </Button>
            </motion.div>
          )}

          {step === "mpesa" && formData && enrollmentId && (
            <MpesaPaymentStep
              key="mpesa"
              enrollmentId={enrollmentId}
              phone={formData.phone}
              amount={firstInstallment}
              reference={course.id}
              onSuccess={() => setStep("done")}
              onError={(err) => toast({ title: "Erro M-Pesa", description: err, variant: "destructive" })}
            />
          )}

          {step === "upload" && formData && paymentMethod && (
            <ProofUploadStep
              key="upload"
              paymentMethod={paymentMethod}
              amount={firstInstallment}
              formData={formData}
              courseId={course.id}
              courseName={course.title}
              totalPrice={course.price}
              onSuccess={(id) => {
                setEnrollmentId(id);
                setStep("done");
              }}
            />
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-success" />
              <h3 className="font-heading text-xl font-bold">Inscrição Submetida com Sucesso!</h3>
              {enrollmentId && <p className="text-xs text-muted-foreground font-mono">Ref: {enrollmentId.substring(0, 8).toUpperCase()}</p>}
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {paymentMethod === "mpesa"
                  ? "Pagamento M-Pesa confirmado! Receberá confirmação via WhatsApp em breve."
                  : "O seu comprovativo será analisado pela nossa equipa. Receberá confirmação via WhatsApp em até 24 horas."}
              </p>
              <a
                href={getWhatsAppLink(`Olá, acabei de submeter a minha inscrição para o curso: ${course.title}. Ref: ${enrollmentId?.substring(0, 8).toUpperCase()}`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="whatsapp" size="lg" className="mt-4">
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
