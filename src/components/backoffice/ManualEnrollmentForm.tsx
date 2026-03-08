import { useState } from "react";
import { UserPlus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CourseRow, EnrollmentSource } from "@/hooks/use-backoffice-data";

const PROVINCES = [
  "Maputo Cidade", "Maputo Província", "Gaza", "Inhambane",
  "Sofala", "Manica", "Tete", "Zambézia",
  "Nampula", "Cabo Delgado", "Niassa",
];

const sources: { value: EnrollmentSource; label: string }[] = [
  { value: "presencial", label: "Presencial" },
  { value: "telefone", label: "Telefone" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "outro", label: "Outro" },
];

interface Props {
  courses: CourseRow[];
  onSubmit: (data: {
    full_name: string; email: string; phone: string; company?: string; nuit: string; province: string;
    course_id: string; course_name: string; payment_plan: string;
    amount_due: number; total_price: number; source: EnrollmentSource;
    payment_method?: string; message?: string; admin_notes?: string;
  }) => Promise<boolean>;
}

export default function ManualEnrollmentForm({ courses, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", company: "", nuit: "", province: "",
    course_id: "", payment_plan: "full",
    amount_due: "", source: "presencial" as EnrollmentSource,
    payment_method: "", message: "", admin_notes: "",
  });

  const selectedCourse = courses.find((c) => c.id === form.course_id);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.phone || !form.course_id || !form.nuit || !form.province) return;
    setLoading(true);
    const ok = await onSubmit({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      company: form.company || undefined,
      nuit: form.nuit,
      province: form.province,
      course_id: selectedCourse?.slug || form.course_id,
      course_name: selectedCourse?.title || "",
      payment_plan: form.payment_plan,
      amount_due: form.amount_due ? parseFloat(form.amount_due) : (selectedCourse?.price || 0),
      total_price: selectedCourse?.price || 0,
      source: form.source,
      payment_method: form.payment_method || undefined,
      message: form.message || undefined,
      admin_notes: form.admin_notes || undefined,
    });
    setLoading(false);
    if (ok) {
      setOpen(false);
      setForm({
        full_name: "", email: "", phone: "", company: "", nuit: "", province: "",
        course_id: "", payment_plan: "full",
        amount_due: "", source: "presencial",
        payment_method: "", message: "", admin_notes: "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="w-4 h-4 mr-1" /> Inscrição Manual
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nova Inscrição Manual</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nome Completo *</Label>
              <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <Label>Telefone *</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+258 84 999 9999" />
            </div>
            <div>
              <Label>Empresa</Label>
              <Input value={form.company} onChange={(e) => update("company", e.target.value)} />
            </div>
            <div>
              <Label>NUIT *</Label>
              <Input value={form.nuit} onChange={(e) => update("nuit", e.target.value)} placeholder="Número de Identificação Tributária" />
            </div>
            <div>
              <Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Província *</Label>
              <Select value={form.province} onValueChange={(v) => update("province", v)}>
                <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Origem *</Label>
              <Select value={form.source} onValueChange={(v) => update("source", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Curso *</Label>
              <Select value={form.course_id} onValueChange={(v) => update("course_id", v)}>
                <SelectTrigger><SelectValue placeholder="Seleccione o curso" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plano de Pagamento</Label>
              <Select value={form.payment_plan} onValueChange={(v) => update("payment_plan", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">100% Integral</SelectItem>
                  <SelectItem value="60-40">60% + 40%</SelectItem>
                  <SelectItem value="60-20-20">60% + 20% + 20%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor Pago / Devido</Label>
              <Input type="number" value={form.amount_due} onChange={(e) => update("amount_due", e.target.value)} placeholder={selectedCourse ? String(selectedCourse.price) : "0"} />
            </div>
            <div>
              <Label>Método de Pagamento</Label>
              <Select value={form.payment_method} onValueChange={(v) => update("payment_method", v)}>
                <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="emola">e-Mola</SelectItem>
                  <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                  <SelectItem value="cartao">Cartão Visa/Mastercard</SelectItem>
                  <SelectItem value="numerario">Numerário</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Mensagem / Observações</Label>
            <Textarea value={form.message} onChange={(e) => update("message", e.target.value)} rows={2} />
          </div>

          <div>
            <Label>Notas do Admin</Label>
            <Textarea value={form.admin_notes} onChange={(e) => update("admin_notes", e.target.value)} rows={2} placeholder="Notas internas..." />
          </div>

          <Button onClick={handleSubmit} disabled={loading || !form.full_name || !form.email || !form.phone || !form.course_id || !form.nuit || !form.province} className="w-full">
            {loading ? "A criar..." : "Criar Inscrição"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
