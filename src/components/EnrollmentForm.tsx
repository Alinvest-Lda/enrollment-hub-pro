import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, Send, MessageCircle, User, Phone, Mail, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Course, formatCurrency, getWhatsAppLink } from "@/lib/courses-data";
import { toast } from "@/hooks/use-toast";

const enrollmentSchema = z.object({
  fullName: z.string().min(3, "Nome completo obrigatório").max(100),
  email: z.string().email("Email inválido").max(255),
  phone: z.string().min(9, "Telefone inválido").max(20),
  company: z.string().max(100).optional(),
  nuit: z.string().max(20).optional(),
  paymentPlanId: z.string().min(1, "Seleccione um plano de pagamento"),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

interface EnrollmentFormProps {
  course: Course;
}

const EnrollmentForm = ({ course }: EnrollmentFormProps) => {
  const [step, setStep] = useState<"form" | "upload" | "done">("form");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: { paymentPlanId: course.paymentPlans[0]?.id || "" },
  });

  const selectedPlanId = watch("paymentPlanId");
  const selectedPlan = course.paymentPlans.find((p) => p.id === selectedPlanId);
  const firstInstallment = selectedPlan ? course.price * selectedPlan.installments[0].percentage / 100 : course.price;

  const onSubmit = (data: EnrollmentFormData) => {
    // In production, this would save to database
    console.log("Enrollment data:", data);
    setStep("upload");
    toast({
      title: "Dados guardados!",
      description: "Agora envie o comprovativo de pagamento.",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast({ title: "Formato inválido", description: "Envie uma imagem (JPG, PNG) ou PDF.", variant: "destructive" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Ficheiro muito grande", description: "Máximo 10MB.", variant: "destructive" });
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleUploadSubmit = () => {
    if (!uploadedFile) {
      toast({ title: "Sem ficheiro", description: "Por favor envie o comprovativo.", variant: "destructive" });
      return;
    }
    // In production, this would upload to storage
    console.log("Uploading file:", uploadedFile.name);
    setStep("done");
    toast({ title: "Comprovativo enviado!", description: "A nossa equipa irá verificar e confirmar o seu pagamento." });
  };

  return (
    <Card className="shadow-card border-border">
      <CardHeader className="bg-muted/50 border-b border-border">
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          {step === "form" && <><User className="w-5 h-5 text-accent" /> Formulário de Inscrição</>}
          {step === "upload" && <><Upload className="w-5 h-5 text-accent" /> Envio de Comprovativo</>}
          {step === "done" && <><CheckCircle className="w-5 h-5 text-success" /> Inscrição Submetida</>}
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

              {/* Payment Plan */}
              <div>
                <Label className="mb-2 block font-heading font-semibold">Modalidade de Pagamento *</Label>
                <RadioGroup
                  value={selectedPlanId}
                  onValueChange={(val) => {
                    // react-hook-form workaround
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

              {/* Summary */}
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm font-heading font-semibold">Resumo do Pagamento Inicial</p>
                <p className="text-2xl font-heading font-bold text-accent mt-1">{formatCurrency(firstInstallment)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedPlan?.installments.length === 1 ? "Pagamento único" : `1ª prestação de ${selectedPlan?.installments.length}`}
                </p>
              </div>

              <Button type="submit" variant="navy" className="w-full" size="lg">
                <Send className="w-4 h-4" />
                Prosseguir para Pagamento
              </Button>
            </motion.form>
          )}

          {step === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="bg-muted rounded-lg p-4 text-sm">
                <p className="font-heading font-semibold mb-1">Instruções de Pagamento</p>
                <p className="text-muted-foreground">
                  Efectue o pagamento de <strong className="text-foreground">{formatCurrency(firstInstallment)}</strong> e envie o comprovativo abaixo (imagem ou PDF).
                </p>
                <p className="text-muted-foreground mt-2">
                  Conta: <strong className="text-foreground">Millennium BIM — 000 000 000 000</strong>
                </p>
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

              <Button onClick={handleUploadSubmit} variant="navy" className="w-full" size="lg">
                <Send className="w-4 h-4" />
                Enviar Comprovativo
              </Button>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-success" />
              <h3 className="font-heading text-xl font-bold">Inscrição Submetida com Sucesso!</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                O seu comprovativo será analisado pela nossa equipa. Receberá confirmação via WhatsApp em até 24 horas.
              </p>
              <a
                href={getWhatsAppLink(`Olá, acabei de submeter a minha inscrição para o curso: ${course.title}. Gostaria de confirmar a recepção.`)}
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
