import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CourseRow } from "@/hooks/use-backoffice-data";
import { formatCurrency } from "@/lib/courses-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  courses: CourseRow[];
  saveCourse: (course: Partial<CourseRow> & { slug: string; title: string }) => Promise<boolean>;
  deleteCourse: (id: string) => void;
  toggleCourseActive: (id: string, active: boolean) => void;
}

const emptyCourse: Partial<CourseRow> = {
  slug: "", title: "", category: "", description: "", duration: "2 Semanas",
  duration_weeks: 2, price: 0, currency: "MZN", start_date: null, image: "",
  highlights: [], payment_plan_group: "2-weeks", is_active: true,
};

export default function CoursesTab({ courses, saveCourse, deleteCourse, toggleCourseActive }: Props) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<CourseRow> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [highlightsText, setHighlightsText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditing({ ...emptyCourse });
    setHighlightsText("");
    setDialogOpen(true);
  };

  const openEdit = (course: CourseRow) => {
    setEditing({ ...course });
    setHighlightsText(course.highlights.join("\n"));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editing?.title || !editing?.slug) return;
    const courseData = { ...editing, highlights: highlightsText.split("\n").filter(Boolean) } as CourseRow;
    const ok = await saveCourse(courseData);
    if (ok) { setDialogOpen(false); setEditing(null); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecione um ficheiro de imagem"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem deve ter no máximo 5MB"); return; }

    setUploading(true);
    const slug = editing?.slug || "course";
    const ext = file.name.split(".").pop();
    const filePath = `${slug}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("course-images").upload(filePath, file, { upsert: true });
    if (error) { toast.error("Erro ao enviar imagem"); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("course-images").getPublicUrl(filePath);
    updateField("image", urlData.publicUrl);
    toast.success("Imagem enviada com sucesso");
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateField = (field: string, value: any) => setEditing((prev) => prev ? { ...prev, [field]: value } : prev);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar cursos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Novo Curso</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="hidden sm:table-cell">Duração</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sem cursos</TableCell></TableRow>
              ) : (
                filtered.map((course) => (
                  <TableRow key={course.id} className={!course.is_active ? "opacity-50" : ""}>
                    <TableCell>
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.slug}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant="outline">{course.category}</Badge></TableCell>
                    <TableCell className="font-heading font-semibold text-sm">{formatCurrency(course.price, course.currency)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{course.duration}</TableCell>
                    <TableCell>
                      <Badge variant={course.is_active ? "default" : "secondary"}>{course.is_active ? "Activo" : "Inactivo"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(course)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => toggleCourseActive(course.id, !course.is_active)}>
                          {course.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm("Eliminar este curso?")) deleteCourse(course.id); }}>
                          <Trash2 className="w-4 h-4 text-destructive" />
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar Curso" : "Novo Curso"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Título *</Label>
                  <Input value={editing.title ?? ""} onChange={(e) => updateField("title", e.target.value)} />
                </div>
                <div>
                  <Label>Slug *</Label>
                  <Input value={editing.slug ?? ""} onChange={(e) => updateField("slug", e.target.value)} placeholder="iso-9001-implementacao" />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Input value={editing.category ?? ""} onChange={(e) => updateField("category", e.target.value)} placeholder="ISO & Gestão" />
                </div>
                <div>
                  <Label>Preço (MZN)</Label>
                  <Input type="number" value={editing.price ?? 0} onChange={(e) => updateField("price", Number(e.target.value))} />
                </div>
                <div>
                  <Label>Duração</Label>
                  <Input value={editing.duration ?? ""} onChange={(e) => updateField("duration", e.target.value)} placeholder="2 Semanas" />
                </div>
                <div>
                  <Label>Semanas</Label>
                  <Input type="number" value={editing.duration_weeks ?? 2} onChange={(e) => updateField("duration_weeks", Number(e.target.value))} />
                </div>
                <div>
                  <Label>Data de Início</Label>
                  <Input type="date" value={editing.start_date ?? ""} onChange={(e) => updateField("start_date", e.target.value || null)} />
                </div>
                <div>
                  <Label>Plano de Pagamento</Label>
                  <Select value={editing.payment_plan_group ?? "2-weeks"} onValueChange={(v) => updateField("payment_plan_group", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2-weeks">2 Semanas (100% ou 60/40)</SelectItem>
                      <SelectItem value="1-month">1 Mês (100% ou 60/20/20)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea value={editing.description ?? ""} onChange={(e) => updateField("description", e.target.value)} rows={3} />
              </div>

              <div>
                <Label>Destaques (um por linha)</Label>
                <Textarea value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} rows={4} placeholder="Certificado PECB&#10;Material incluído" />
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={editing.is_active ?? true} onCheckedChange={(v) => updateField("is_active", v)} />
                <Label>Curso activo</Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="flex-1">{editing.id ? "Guardar Alterações" : "Criar Curso"}</Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
