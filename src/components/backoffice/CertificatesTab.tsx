import { useState, useEffect, useCallback } from "react";
import {
  Award, Plus, Pencil, Trash2, Save, X, Eye, Copy, Search,
  FileText, Check, Loader2, Send,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
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
  header_text: string;
  body_template: string;
  footer_text: string;
  signature_label: string;
  signature_name: string;
  variables: string[];
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

const emptyTemplate: Omit<CertTemplate, "id" | "created_at"> = {
  name: "",
  description: "",
  background_color: "#ffffff",
  border_style: "classic",
  logo_url: null,
  header_text: "CERTIFICADO DE CONCLUSÃO",
  body_template: "Certificamos que {{student_name}} concluiu com sucesso o curso {{course_name}}, com a duração de {{duration}}, realizado no período de {{start_date}} a {{end_date}}.",
  footer_text: "",
  signature_label: "Director",
  signature_name: "",
  variables: ["student_name", "course_name", "duration", "start_date", "end_date"],
  is_active: true,
  is_default: false,
};

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `CERT-${new Date().getFullYear()}-${code}`;
}

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
  const [genForm, setGenForm] = useState({
    enrollment_id: "",
    template_id: "",
    student_name: "",
    course_name: "",
    course_duration: "",
    start_date: "",
    end_date: "",
  });
  const [saving, setSaving] = useState(false);

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

  // Template CRUD
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

  // Certificate generation
  const handleEnrollmentSelect = (enrollmentId: string) => {
    const e = enrollments.find((en) => en.id === enrollmentId);
    if (e) {
      setGenForm((prev) => ({
        ...prev,
        enrollment_id: enrollmentId,
        student_name: e.full_name,
        course_name: e.course_name,
      }));
    }
  };

  const generateCertificate = async () => {
    if (!genForm.student_name || !genForm.course_name) {
      toast({ title: "Preencha o nome e o curso", variant: "destructive" });
      return;
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
    } as any);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Certificado gerado com sucesso!" });
      setGenerateOpen(false);
      setGenForm({ enrollment_id: "", template_id: "", student_name: "", course_name: "", course_duration: "", start_date: "", end_date: "" });
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
    if (!confirm("Eliminar este certificado permanentemente?")) return;
    await supabase.from("certificates").delete().eq("id", id);
    toast({ title: "Certificado eliminado" });
    await fetchAll();
  };

  const filteredCerts = certificates.filter((c) => {
    const q = search.toLowerCase();
    return c.student_name.toLowerCase().includes(q) || c.course_name.toLowerCase().includes(q) || c.certificate_code.toLowerCase().includes(q);
  });

  // Preview template
  const previewBody = (template: Partial<CertTemplate>) => {
    let text = template.body_template || "";
    text = text.replace("{{student_name}}", "João Silva");
    text = text.replace("{{course_name}}", "Gestão de Projectos");
    text = text.replace("{{duration}}", "4 semanas");
    text = text.replace("{{start_date}}", "01/01/2026");
    text = text.replace("{{end_date}}", "28/01/2026");
    return text;
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="certificates">Certificados ({certificates.length})</TabsTrigger>
          </TabsList>
          {tab === "templates" && (
            <Button size="sm" onClick={() => { setEditTemplate({ ...emptyTemplate }); setIsNewTemplate(true); }}>
              <Plus className="w-4 h-4 mr-1" />Novo Template
            </Button>
          )}
          {tab === "certificates" && (
            <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Award className="w-4 h-4 mr-1" />Gerar Certificado</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
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
                  <div>
                    <Label className="text-xs">Template</Label>
                    <Select value={genForm.template_id} onValueChange={(v) => setGenForm((p) => ({ ...p, template_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecionar template" /></SelectTrigger>
                      <SelectContent>
                        {templates.filter((t) => t.is_active).map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Nome do Estudante *</Label>
                      <Input value={genForm.student_name} onChange={(e) => setGenForm((p) => ({ ...p, student_name: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Curso *</Label>
                      <Input value={genForm.course_name} onChange={(e) => setGenForm((p) => ({ ...p, course_name: e.target.value }))} />
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
          {/* Edit/Create Template Dialog */}
          {editTemplate && (
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{isNewTemplate ? "Novo Template" : "Editar Template"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Nome *</Label>
                    <Input value={editTemplate.name || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Descrição</Label>
                    <Input value={editTemplate.description || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, description: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Estilo da Borda</Label>
                    <Select value={editTemplate.border_style || "classic"} onValueChange={(v) => setEditTemplate((p) => ({ ...p!, border_style: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classic">Clássico</SelectItem>
                        <SelectItem value="modern">Moderno</SelectItem>
                        <SelectItem value="elegant">Elegante</SelectItem>
                        <SelectItem value="minimal">Minimalista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={editTemplate.background_color || "#ffffff"} onChange={(e) => setEditTemplate((p) => ({ ...p!, background_color: e.target.value }))} className="w-12 h-9 p-1" />
                      <Input value={editTemplate.background_color || "#ffffff"} onChange={(e) => setEditTemplate((p) => ({ ...p!, background_color: e.target.value }))} className="flex-1" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Título do Certificado</Label>
                  <Input value={editTemplate.header_text || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, header_text: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Corpo do Template</Label>
                  <Textarea
                    value={editTemplate.body_template || ""}
                    onChange={(e) => setEditTemplate((p) => ({ ...p!, body_template: e.target.value }))}
                    rows={4}
                    placeholder="Use {{student_name}}, {{course_name}}, {{duration}}, {{start_date}}, {{end_date}}"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Variáveis: {"{{student_name}}, {{course_name}}, {{duration}}, {{start_date}}, {{end_date}}"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Nome do Signatário</Label>
                    <Input value={editTemplate.signature_name || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, signature_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Cargo do Signatário</Label>
                    <Input value={editTemplate.signature_label || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, signature_label: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Texto de Rodapé</Label>
                  <Input value={editTemplate.footer_text || ""} onChange={(e) => setEditTemplate((p) => ({ ...p!, footer_text: e.target.value }))} />
                </div>

                {/* Preview */}
                <Separator />
                <div>
                  <p className="text-xs font-medium mb-2">Pré-visualização:</p>
                  <div
                    className="rounded-lg p-6 text-center space-y-3 border-2"
                    style={{
                      backgroundColor: editTemplate.background_color || "#ffffff",
                      borderStyle: editTemplate.border_style === "modern" ? "solid" : editTemplate.border_style === "elegant" ? "double" : editTemplate.border_style === "minimal" ? "none" : "solid",
                      borderColor: "#c4a265",
                    }}
                  >
                    <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">{editTemplate.header_text}</p>
                    <p className="text-sm leading-relaxed">{previewBody(editTemplate)}</p>
                    {editTemplate.signature_name && (
                      <div className="pt-4">
                        <p className="font-semibold text-sm">{editTemplate.signature_name}</p>
                        <p className="text-xs text-muted-foreground">{editTemplate.signature_label}</p>
                      </div>
                    )}
                    {editTemplate.footer_text && <p className="text-[10px] text-muted-foreground">{editTemplate.footer_text}</p>}
                  </div>
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
                    <div>
                      <p className="font-heading font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.description || "Sem descrição"}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {t.is_default && <Badge variant="secondary" className="text-[10px]">Padrão</Badge>}
                      <Badge variant={t.is_active ? "default" : "outline"} className="text-[10px]">
                        {t.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{t.body_template}</p>
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

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Estudante</TableHead>
                    <TableHead className="hidden md:table-cell">Curso</TableHead>
                    <TableHead className="hidden sm:table-cell">Emissão</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCerts.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sem certificados</TableCell></TableRow>
                  ) : (
                    filteredCerts.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-mono text-xs font-bold">{cert.certificate_code}</TableCell>
                        <TableCell className="text-sm font-medium">{cert.student_name}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{cert.course_name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs">{new Date(cert.issue_date).toLocaleDateString("pt-PT")}</TableCell>
                        <TableCell>
                          <Badge variant={cert.status === "active" ? "default" : "destructive"} className="text-[10px]">
                            {cert.status === "active" ? "Activo" : "Revogado"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" title="Copiar código" onClick={() => { navigator.clipboard.writeText(cert.certificate_code); toast({ title: "Código copiado!" }); }}>
                              <Copy className="w-3.5 h-3.5" />
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
