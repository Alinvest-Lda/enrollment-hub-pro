import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, User, Building, Phone, Mail, Users, BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  clientType: z.enum(["individual", "empresa", "ong", "estado"]),
  fullName: z.string().trim().min(3, "Nome obrigatório").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().min(9, "Telefone inválido").max(20),
  organizationName: z.string().max(200).optional(),
  organizationSector: z.string().max(100).optional(),
  numParticipants: z.string().optional(),
  trainingTopic: z.string().trim().min(5, "Descreva o tema do treinamento").max(200),
  trainingDetails: z.string().max(1000).optional(),
  preferredStart: z.string().max(100).optional(),
  budgetRange: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const clientTypes = [
  { value: "individual" as const, label: "Individual", icon: User },
  { value: "empresa" as const, label: "Empresa", icon: Building },
  { value: "ong" as const, label: "ONG", icon: Users },
  { value: "estado" as const, label: "Estado / Gov.", icon: Building },
];

const budgetOptions = [
  { value: "ate-20k", label: "Até 20.000 MZN" },
  { value: "20k-50k", label: "20.000 – 50.000 MZN" },
  { value: "50k-100k", label: "50.000 – 100.000 MZN" },
  { value: "acima-100k", label: "Acima de 100.000 MZN" },
  { value: "a-definir", label: "A definir" },
];

const TrainingRequestSection = () => {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { clientType: "individual" },
  });

  const clientType = watch("clientType");
  const isOrg = clientType !== "individual";

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase.from("training_requests").insert({
        client_type: data.clientType,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        organization_name: data.organizationName || null,
        organization_sector: data.organizationSector || null,
        num_participants: data.numParticipants ? parseInt(data.numParticipants) : null,
        training_topic: data.trainingTopic,
        training_details: data.trainingDetails || null,
        preferred_start: data.preferredStart || null,
        budget_range: data.budgetRange || null,
      });

      if (error) throw error;

      setSubmitted(true);
      reset();
      toast({ title: "Pedido enviado!", description: "Entraremos em contacto em breve." });
    } catch (err: any) {
      toast({ title: "Erro ao enviar", description: err.message || "Tente novamente.", variant: "destructive" });
    }
  };

  return (
    <section id="treinamento-personalizado" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Treinamento Personalizado
          </h2>
          <motion.p
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Não encontrou o que procura? Solicite um treinamento à medida para si, para a sua equipa ou organização.
            Desenvolvemos programas adaptados às suas necessidades específicas.
          </motion.p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-card border border-border rounded-xl shadow-card"
            >
              <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
              <h3 className="font-heading text-xl font-bold mb-2">Pedido Recebido!</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                A nossa equipa irá analisar o seu pedido e entrar em contacto dentro de 48 horas.
              </p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>Enviar outro pedido</Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-card space-y-6">
                {/* Client Type */}
                <div>
                  <Label className="mb-3 block font-heading font-semibold">Tipo de Cliente *</Label>
                  <RadioGroup
                    value={clientType}
                    onValueChange={(val) => setValue("clientType", val as FormData["clientType"])}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                  >
                    {clientTypes.map((ct) => (
                      <label
                        key={ct.value}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border cursor-pointer transition-colors text-center ${
                          clientType === ct.value ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                        }`}
                      >
                        <RadioGroupItem value={ct.value} className="sr-only" />
                        <ct.icon className={`w-5 h-5 ${clientType === ct.value ? "text-accent" : "text-muted-foreground"}`} />
                        <span className="text-xs font-medium">{ct.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tr-name" className="flex items-center gap-1 mb-1.5"><User className="w-3.5 h-3.5" /> Nome Completo *</Label>
                    <Input id="tr-name" {...register("fullName")} placeholder="Seu nome" />
                    {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="tr-email" className="flex items-center gap-1 mb-1.5"><Mail className="w-3.5 h-3.5" /> Email *</Label>
                    <Input id="tr-email" type="email" {...register("email")} placeholder="email@exemplo.com" />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="tr-phone" className="flex items-center gap-1 mb-1.5"><Phone className="w-3.5 h-3.5" /> Telefone *</Label>
                    <Input id="tr-phone" {...register("phone")} placeholder="+258 84 999 9999" />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
                  </div>
                  {isOrg && (
                    <div>
                      <Label htmlFor="tr-org" className="flex items-center gap-1 mb-1.5"><Building className="w-3.5 h-3.5" /> Nome da Organização</Label>
                      <Input id="tr-org" {...register("organizationName")} placeholder="Nome da empresa/organização" />
                    </div>
                  )}
                </div>

                {isOrg && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tr-sector" className="mb-1.5 block">Sector de Actividade</Label>
                      <Input id="tr-sector" {...register("organizationSector")} placeholder="Ex: Energia, Saúde, Construção" />
                    </div>
                    <div>
                      <Label htmlFor="tr-participants" className="flex items-center gap-1 mb-1.5"><Users className="w-3.5 h-3.5" /> Nº de Participantes</Label>
                      <Input id="tr-participants" type="number" min="1" {...register("numParticipants")} placeholder="Ex: 15" />
                    </div>
                  </div>
                )}

                {/* Training Details */}
                <div>
                  <Label htmlFor="tr-topic" className="flex items-center gap-1 mb-1.5"><BookOpen className="w-3.5 h-3.5" /> Tema do Treinamento *</Label>
                  <Input id="tr-topic" {...register("trainingTopic")} placeholder="Ex: ISO 14001, Gestão de Riscos, Excel Avançado" />
                  {errors.trainingTopic && <p className="text-xs text-destructive mt-1">{errors.trainingTopic.message}</p>}
                </div>

                <div>
                  <Label htmlFor="tr-details" className="mb-1.5 block">Detalhes Adicionais</Label>
                  <Textarea id="tr-details" {...register("trainingDetails")} placeholder="Descreva os objectivos, necessidades específicas ou requisitos do treinamento..." rows={3} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tr-start" className="mb-1.5 block">Período Preferido</Label>
                    <Input id="tr-start" {...register("preferredStart")} placeholder="Ex: Março 2026, Flexível" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Orçamento Estimado</Label>
                    <Select onValueChange={(val) => setValue("budgetRange", val)}>
                      <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                      <SelectContent>
                        {budgetOptions.map((b) => (
                          <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" variant="navy" className="w-full" size="lg" disabled={isSubmitting}>
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "A enviar..." : "Enviar Pedido de Treinamento"}
                </Button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrainingRequestSection;
