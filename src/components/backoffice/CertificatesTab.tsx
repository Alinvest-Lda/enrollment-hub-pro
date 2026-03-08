import { useState, useEffect, useCallback } from "react";
import {
  Award, Plus, Pencil, Trash2, Save, X, Eye, Copy, Search,
  FileText, Check, Loader2, Upload, Globe, Image, QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// --- Types ---
interface CertTemplate {
  id: string;
  name: string;
  description: string;
  background_color: string;
  border_style: string;
  logo_url: string | null;
  example_image_url: string | null;
  header_text: string;
  institution_name: string;
  intro_text: string;
  body_template: string;
  closing_text: string;
  footer_text: string;
  signature_label: string;
  signature_name: string;
  signature2_name: string;
  signature2_label: string;
  variables: string[];
  language: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

interface Certificate {
  id: string;
  certificate_code: string;
  enrollment_id: string | null;
  template_id: string | null;
  student_name: string;
  course_name: string;
  course_duration: string;
  start_date: string | null;
  end_date: string | null;
  issue_date: string;
  language: string;
  trainer_name: string;
  status: string;
  created_at: string;
}

interface Enrollment {
  id: string;
  full_name: string;
  course_name: string;
  status: string;
  total_price: number;
}

const defaultTemplatePt: Omit<CertTemplate, "id" | "created_at"> = {
  name: "",
  description: "",
  background_color: "#ffffff",
  border_style: "classic",
  logo_url: null,
  example_image_url: null,
  header_text: "CERTIFICADO DE CONCLUSÃO",
  institution_name: "ALINVEST S. U. LDA",
  intro_text: "A coordenação de Treinamentos da empresa ALINVEST S. U. LDA, tem a honra de certificar que",
  body_template: "Completou com sucesso o Treinamento de Capacitação em {{course_name}}, com base nas boas práticas e procedimentos previstos na norma, tendo cumprido com sucesso o programa de aulas e exercícios, que comprovam a sua qualificação técnica e profissional.",
  closing_text: "Por esta declaração reflectir a verdade, emitimos o presente certificado.",
  footer_text: "",
  signature_label: "Director Geral",
  signature_name: "",
  signature2_name: "",
  signature2_label: "Formador(a) do Curso",
  variables: ["student_name", "course_name", "duration", "start_date", "end_date"],
  language: "pt",
  is_active: true,
  is_default: false,
};

const defaultTemplateEn: Partial<CertTemplate> = {
  header_text: "CERTIFICATE OF COMPLETION",
  intro_text: "The Training Coordination of ALINVEST S. U. LDA is pleased to certify that",
  body_template: "Has successfully completed the Training Program in {{course_name}}, based on best practices and procedures established by the standard, having successfully completed the program of classes and exercises that demonstrate their technical and professional qualification.",
  closing_text: "In witness whereof, we issue this certificate.",
  signature_label: "General Director",
  signature2_label: "Course Trainer",
};

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `CERT-${new Date().getFullYear()}-${code}`;
}

function getVerificationUrl(code: string) {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/verificar-certificado?code=${encodeURIComponent(code)}`;
}

// --- Certificate Preview Component ---
function CertificatePreview({ template, studentName, courseName, date, trainerName, certificateCode }: {
  template: Partial<CertTemplate>;
  studentName?: string;
  courseName?: string;
  date?: string;
  trainerName?: string;
  certificateCode?: string;
}) {
  const name = studentName || "Seu Nome Completo";
  const course = courseName || "Identificação do Treinamento";
  const code = certificateCode || "CERT-2026-XXXXXX";
  const bodyText = (template.body_template || "").replace("{{course_name}}", course).replace("{{duration}}", "4 semanas").replace("{{start_date}}", "01/01/2026").replace("{{end_date}}", "28/01/2026");
  const hasBackground = !!template.example_image_url;

  return (
    <div
      className="relative rounded-sm overflow-hidden"
      style={{
        aspectRatio: "1.414",
      }}
    >
      {/* Background image or fallback */}
      {hasBackground ? (
        <img
          src={template.example_image_url!}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-muted/30 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Carregue uma imagem de fundo para o certificado</p>
          </div>
        </div>
      )}

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col p-[8%]">
        {/* Header */}
        <div className="text-center mb-[2%]">
          <h2 className="font-heading text-[1.2vw] md:text-base font-extrabold tracking-wider drop-shadow-sm" style={{ color: "#0F1D3A" }}>
            {template.header_text}
          </h2>
        </div>

        {/* Course Title */}
        <div className="text-center mb-[2%]">
          <h3 className="font-heading text-[1vw] md:text-sm italic font-semibold drop-shadow-sm" style={{ color: "#0F1D3A" }}>
            {course}
          </h3>
        </div>

        {/* Intro Text */}
        <p className="text-[0.7vw] md:text-xs text-foreground/80 mb-[2%] leading-relaxed drop-shadow-sm">
          {template.intro_text}
        </p>

        {/* Student Name */}
        <div className="text-center my-[2%]">
          <div className="border-b-2 border-foreground/30 inline-block px-8 pb-1">
            <p className="font-heading text-[1.3vw] md:text-lg font-bold italic drop-shadow-sm" style={{ color: "#0F1D3A" }}>
              {name}
            </p>
          </div>
        </div>

        {/* Body */}
        <p className="text-[0.65vw] md:text-[11px] text-foreground/80 leading-relaxed mb-[1.5%] drop-shadow-sm">
          {bodyText}
        </p>

        {/* Closing */}
        <p className="text-[0.65vw] md:text-[11px] text-foreground/80 mb-[3%] drop-shadow-sm">
          {template.closing_text}
        </p>

        {/* Signatures + QR Code */}
        <div className="mt-auto grid grid-cols-4 gap-2 text-center pt-2">
          <div>
            <div className="border-t border-foreground/40 pt-1 mx-1">
              <p className="text-[0.55vw] md:text-[10px] font-semibold">{template.signature_name || "Nome do Director"}</p>
              <p className="text-[0.45vw] md:text-[8px] text-muted-foreground">{template.signature_label}</p>
            </div>
          </div>
          <div>
            <div className="border-t border-foreground/40 pt-1 mx-1">
              <p className="text-[0.55vw] md:text-[10px] font-semibold">Data de Emissão</p>
              <p className="text-[0.45vw] md:text-[8px] text-muted-foreground">{date || "DD-MM-AAAA"}</p>
            </div>
          </div>
          <div>
            <div className="border-t border-foreground/40 pt-1 mx-1">
              <p className="text-[0.55vw] md:text-[10px] font-semibold">{trainerName || template.signature2_name || "Nome do(a) Formador(a)"}</p>
              <p className="text-[0.45vw] md:text-[8px] text-muted-foreground">{template.signature2_label}</p>
            </div>
          </div>
          {/* QR Code */}
          <div className="flex flex-col items-center justify-center">
            <QRCodeSVG
              value={getVerificationUrl(code)}
              size={48}
              level="M"
              includeMargin={false}
              className="rounded"
            />
            <p className="text-[0.4vw] md:text-[7px] text-muted-foreground mt-0.5 font-mono">{code}</p>
          </div>
        </div>

        {/* Footer */}
        {template.footer_text && (
          <p className="text-[0.4vw] md:text-[8px] text-muted-foreground text-center mt-1">{template.footer_text}</p>
        )}
      </div>
    </div>
  );
}

// --- Main Component ---
export default function CertificatesTab() {
  const [tab, setTab] = useState("templates");
  const [templates, setTemplates] = useState<CertTemplate[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTemplate, setEditTemplate] = useState<Partial<CertTemplate> | null>(null);
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [search, setSearch] = useState("");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [genForm, setGenForm] = useState({
    enrollment_id: "",
    template_id: "",
    student_name: "",
    course_name: "",
    course_duration: "",
    start_date: "",
    end_date: "",
    language: "pt",
    trainer_name: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [t, c, e] = await Promise.all([
      supabase.from("certificate_templates").select("*").order("created_at", { ascending: false }),
      supabase.from("certificates").select("*").order("created_at", { ascending: false }),
      supabase.from("enrollments").select("id, full_name, course_name, status, total_price").eq("status", "approved"),
    ]);
    if (t.data) setTemplates(t.data as unknown as CertTemplate[]);
    if (c.data) setCertificates(c.data as unknown as Certificate[]);
    if (e.data) setEnrollments(e.data as unknown as Enrollment[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleBackgroundUpload = async (file: File) => {
    setUploading(true);
    const filePath = `backgrounds/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("certificate-examples").upload(filePath, file);
    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("certificate-examples").getPublicUrl(filePath);
    setEditTemplate((p) => ({ ...p!, example_image_url: urlData.publicUrl }));
    toast({ title: "Imagem de fundo carregada" });
    setUploading(false);
  };

  const handleLanguageChange = (lang: string) => {
    const defaults = lang === "en" ? defaultTemplateEn : defaultTemplatePt;
    setEditTemplate((p) => ({
      ...p!,
      language: lang,
      header_text: defaults.header_text!,
      intro_text: defaults.intro_text!,
      body_template: defaults.body_template!,
      closing_text: defaults.closing_text!,
      signature_label: defaults.signature_label!,
      signature2_label: defaults.signature2_label!,
    }));
  };

  const saveTemplate = async () => {
    if (!editTemplate?.name) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    setSaving(true);
    if (isNewTemplate) {
      const { error } = await supabase.from("certificate_templates").insert(editTemplate as any);
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Template criado" });
    } else {
      const { id, created_at, ...rest } = editTemplate as CertTemplate;
      const { error } = await supabase.from("certificate_templates").update(rest as any).eq("id", id);
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Template actualizado" });
    }
    setEditTemplate(null);
    setSaving(false);
    await fetchAll();
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Eliminar este template?")) return;
    await supabase.from("certificate_templates").delete().eq("id", id);
    toast({ title: "Template eliminado" });
    await fetchAll();
  };

  const handleEnrollmentSelect = (enrollmentId: string) => {
    const e = enrollments.find((en) => en.id === enrollmentId);
    if (e) setGenForm((prev) => ({ ...prev, enrollment_id: enrollmentId, student_name: e.full_name, course_name: e.course_name }));
  };

  const handleTemplateSelectForGen = (templateId: string) => {
    const t = templates.find((tpl) => tpl.id === templateId);
    setGenForm((prev) => ({ ...prev, template_id: templateId, language: t?.language || "pt" }));
  };

  const generateCertificate = async () => {
    if (!genForm.student_name || !genForm.course_name) {
      toast({ title: "Preencha o nome e o curso", variant: "destructive" }); return;
    }
    setSaving(true);
    const { error } = await supabase.from("certificates").insert({
      certificate_code: generateCode(),
      enrollment_id: genForm.enrollment_id || null,
      template_id: genForm.template_id || null,
      student_name: genForm.student_name,
      course_name: genForm.course_name,
      course_duration: genForm.course_duration,
      start_date: genForm.start_date || null,
      end_date: genForm.end_date || null,
      issue_date: new Date().toISOString().split("T")[0],
      language: genForm.language,
      trainer_name: genForm.trainer_name,
    } as any);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Certificado gerado com sucesso!" });
      setGenerateOpen(false);
      setGenForm({ enrollment_id: "", template_id: "", student_name: "", course_name: "", course_duration: "", start_date: "", end_date: "", language: "pt", trainer_name: "" });
      await fetchAll();
    }
    setSaving(false);
  };

  const revokeCertificate = async (id: string) => {
    if (!confirm("Revogar este certificado?")) return;
    await supabase.from("certificates").update({ status: "revoked" } as any).eq("id", id);
    toast({ title: "Certificado revogado" });
    await fetchAll();
  };

  const deleteCertificate = async (id: string) => {
    if (!confirm("Eliminar permanentemente?")) return;
    await supabase.from("certificates").delete().eq("id", id);
    toast({ title: "Certificado eliminado" });
    await fetchAll();
  };

  const filteredCerts = certificates.filter((c) => {
    const q = search.toLowerCase();
    return c.student_name.toLowerCase().includes(q) || c.course_name.toLowerCase().includes(q) || c.certificate_code.toLowerCase().includes(q);
  });

  const langLabel = (lang: string) => lang === "en" ? "Inglês" : "Português";

  const getTemplateForCert = (cert: Certificate) => {
    if (cert.template_id) return templates.find((t) => t.id === cert.template_id) || null;
    return templates.find((t) => t.is_default) || null;
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="certificates">Certificados ({certificates.length})</TabsTrigger>
          </TabsList>
          {tab === "templates" && (
            <Button size="sm" onClick={() => { setEditTemplate({ ...defaultTemplatePt }); setIsNewTemplate(true); }}>
              <Plus className="w-4 h-4 mr-1" />Novo Template
            </Button>
          )}
          {tab === "certificates" && (
            <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Award className="w-4 h-4 mr-1" />Gerar Certificado</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Gerar Certificado</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Inscrição (opcional)</Label>
                    <Select value={genForm.enrollment_id} onValueChange={handleEnrollmentSelect}>
                      <SelectTrigger><SelectValue placeholder="Selecionar inscrição aprovada" /></SelectTrigger>
                      <SelectContent>
                        {enrollments.map((e) => (
                          <SelectItem key={e.id} value={e.id}>{e.full_name} — {e.course_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Template</Label>
                      <Select value={genForm.template_id} onValueChange={handleTemplateSelectForGen}>
                        <SelectTrigger><SelectValue placeholder="Selecionar template" /></SelectTrigger>
                        <SelectContent>
                          {templates.filter((t) => t.is_active).map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name} ({langLabel(t.language)})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Idioma</Label>
                      <Select value={genForm.language} onValueChange={(v) => setGenForm((p) => ({ ...p, language: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt">🇲🇿 Português</SelectItem>
                          <SelectItem value="en">🇬🇧 English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Nome do Estudante *</Label>
                      <Input value={genForm.student_name} onChange={(e) => setGenForm((p) => ({ ...p, student_name: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Curso / Treinamento *</Label>
                      <Input value={genForm.course_name} onChange={(e) => setGenForm((p) => ({ ...p, course_name: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Nome do(a) Formador(a)</Label>
                      <Input value={genForm.trainer_name} onChange={(e) => setGenForm((p) => ({ ...p, trainer_name: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Duração</Label>
                      <Input value={genForm.course_duration} onChange={(e) => setGenForm((p) => ({ ...p, course_duration: e.target.value }))} placeholder="Ex: 4 semanas" />
                    </div>
                    <div>
                      <Label className="text-xs">Data Início</Label>
                      <Input type="date" value={genForm.start_date} onChange={(e) => setGenForm((p) => ({ ...p, start_date: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Data Fim</Label>
                      <Input type="date" value={genForm.end_date} onChange={(e) => setGenForm((p) => ({ ...p, end_date: e.target.value }))} />
                    </div>
                  </div>
                  <Button onClick={generateCertificate} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Award className="w-4 h-4 mr-1" />}
                    Gerar Certificado
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {editTemplate && (
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{isNewTemplate ? "Novo Template" : "Editar Template"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Nome do Template *</Label>
                    <Input value={editTemplate.name || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Idioma</Label>
                    <Select value={editTemplate.language || "pt"} onValueChange={handleLanguageChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt">🇲🇿 Português</SelectItem>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Descrição</Label>
                    <Input value={editTemplate.description || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, description: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Nome da Instituição</Label>
                    <Input value={editTemplate.institution_name || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, institution_name: e.target.value }))} />
                  </div>
                </div>

                {/* Background image upload */}
                <div>
                  <Label className="text-xs font-medium">Imagem de Fundo do Certificado</Label>
                  <p className="text-[10px] text-muted-foreground mb-1">
                    Carregue a imagem que serve de layout/fundo para o certificado. As informações serão sobrepostas.
                  </p>
                  <div className="flex gap-3 items-start mt-1">
                    <label className="cursor-pointer">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBackgroundUpload(f); e.target.value = ""; }} />
                      <Button size="sm" variant="outline" className="text-xs" asChild>
                        <span><Upload className="w-3.5 h-3.5 mr-1" />{uploading ? "A enviar..." : "Carregar Fundo"}</span>
                      </Button>
                    </label>
                    {editTemplate.example_image_url && (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-16 rounded border border-border overflow-hidden bg-muted">
                          <img src={editTemplate.example_image_url} alt="Fundo" className="w-full h-full object-cover" />
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => setEditTemplate((p) => ({ ...p!, example_image_url: null }))}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />
                <p className="text-xs font-medium text-muted-foreground">Textos do Certificado</p>

                <div>
                  <Label className="text-xs">Título / Cabeçalho</Label>
                  <Input value={editTemplate.header_text || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, header_text: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Texto Introdutório</Label>
                  <Textarea value={editTemplate.intro_text || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, intro_text: e.target.value }))} rows={2} />
                </div>
                <div>
                  <Label className="text-xs">Corpo do Certificado</Label>
                  <Textarea value={editTemplate.body_template || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, body_template: e.target.value }))} rows={4} />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Variáveis: {"{{course_name}}, {{duration}}, {{start_date}}, {{end_date}}"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs">Texto de Encerramento</Label>
                  <Input value={editTemplate.closing_text || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, closing_text: e.target.value }))} />
                </div>

                <Separator />
                <p className="text-xs font-medium text-muted-foreground">Assinaturas</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Nome do Director</Label>
                    <Input value={editTemplate.signature_name || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, signature_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Cargo do Director</Label>
                    <Input value={editTemplate.signature_label || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, signature_label: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Nome do(a) Formador(a)</Label>
                    <Input value={editTemplate.signature2_name || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, signature2_name: e.target.value }))} placeholder="Preenchido ao gerar" />
                  </div>
                  <div>
                    <Label className="text-xs">Cargo do Formador</Label>
                    <Input value={editTemplate.signature2_label || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, signature2_label: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Texto de Rodapé (opcional)</Label>
                  <Input value={editTemplate.footer_text || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, footer_text: e.target.value }))} />
                </div>

                {/* Preview */}
                <Separator />
                <div>
                  <p className="text-xs font-medium mb-2 flex items-center gap-1">
                    Pré-visualização
                    <Badge variant="outline" className="text-[9px] ml-1">
                      <Globe className="w-2.5 h-2.5 mr-0.5" />{langLabel(editTemplate.language || "pt")}
                    </Badge>
                  </p>
                  <CertificatePreview template={editTemplate} />
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveTemplate} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                    Guardar
                  </Button>
                  <Button variant="outline" onClick={() => setEditTemplate(null)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Templates list */}
          <div className="grid gap-3 md:grid-cols-2">
            {templates.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      {t.example_image_url && (
                        <div className="w-14 h-10 rounded border border-border overflow-hidden bg-muted shrink-0">
                          <img src={t.example_image_url} alt="Fundo" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-heading font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.description || t.institution_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant="outline" className="text-[9px]">
                        <Globe className="w-2.5 h-2.5 mr-0.5" />{langLabel(t.language)}
                      </Badge>
                      <Badge variant={t.is_active ? "default" : "outline"} className="text-[10px]">
                        {t.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditTemplate({ ...t }); setIsNewTemplate(false); }}>
                      <Pencil className="w-3 h-3 mr-1" />Editar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => deleteTemplate(t.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {templates.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum template criado.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar por nome, curso ou código..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>

          {/* Certificate preview dialog */}
          <Dialog open={!!previewCert} onOpenChange={(open) => !open && setPreviewCert(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Pré-visualização do Certificado</DialogTitle></DialogHeader>
              {previewCert && (
                <CertificatePreview
                  template={getTemplateForCert(previewCert) || defaultTemplatePt}
                  studentName={previewCert.student_name}
                  courseName={previewCert.course_name}
                  date={new Date(previewCert.issue_date).toLocaleDateString("pt-PT")}
                  trainerName={previewCert.trainer_name}
                  certificateCode={previewCert.certificate_code}
                />
              )}
            </DialogContent>
          </Dialog>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Estudante</TableHead>
                    <TableHead className="hidden md:table-cell">Curso</TableHead>
                    <TableHead className="hidden sm:table-cell">Idioma</TableHead>
                    <TableHead className="hidden sm:table-cell">Emissão</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCerts.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Sem certificados</TableCell></TableRow>
                  ) : (
                    filteredCerts.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-mono text-xs font-bold">{cert.certificate_code}</TableCell>
                        <TableCell className="text-sm font-medium">{cert.student_name}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{cert.course_name}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-[9px]">{cert.language === "en" ? "🇬🇧 EN" : "🇲🇿 PT"}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs">{new Date(cert.issue_date).toLocaleDateString("pt-PT")}</TableCell>
                        <TableCell>
                          <Badge variant={cert.status === "active" ? "default" : "destructive"} className="text-[10px]">
                            {cert.status === "active" ? "Activo" : "Revogado"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" title="Pré-visualizar" onClick={() => setPreviewCert(cert)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Copiar código" onClick={() => { navigator.clipboard.writeText(cert.certificate_code); toast({ title: "Código copiado!" }); }}>
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Copiar link de verificação" onClick={() => { navigator.clipboard.writeText(getVerificationUrl(cert.certificate_code)); toast({ title: "Link de verificação copiado!" }); }}>
                              <QrCode className="w-3.5 h-3.5" />
                            </Button>
                            {cert.status === "active" && (
                              <Button variant="ghost" size="icon" title="Revogar" onClick={() => revokeCertificate(cert.id)}>
                                <X className="w-3.5 h-3.5 text-destructive" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" title="Eliminar" onClick={() => deleteCertificate(cert.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
