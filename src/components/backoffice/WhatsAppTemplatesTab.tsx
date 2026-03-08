import { useState, useEffect } from "react";
import {
  Plus, Trash2, Pencil, X, Check, RefreshCw, MessageSquare,
  Send, Copy, Variable, ToggleLeft, ToggleRight, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  category: string;
  body: string;
  language: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const categoryOptions = [
  { value: "notification", label: "Notificação" },
  { value: "confirmation", label: "Confirmação" },
  { value: "reminder", label: "Lembrete" },
  { value: "marketing", label: "Marketing" },
  { value: "support", label: "Suporte" },
  { value: "other", label: "Outro" },
];

const languageOptions = [
  { value: "pt_BR", label: "Português (BR)" },
  { value: "pt_PT", label: "Português (PT)" },
  { value: "en_US", label: "English (US)" },
  { value: "en", label: "English" },
];

const emptyForm = {
  name: "",
  category: "notification",
  body: "",
  language: "pt_BR",
  variables: "",
};

const WhatsAppTemplatesTab = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("whatsapp_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os templates.", variant: "destructive" });
    } else {
      setTemplates((data as unknown as Template[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const openCreate = () => {
    setEditingTemplate(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditingTemplate(t);
    setForm({
      name: t.name,
      category: t.category,
      body: t.body,
      language: t.language,
      variables: t.variables.join(", "),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.body.trim()) {
      toast({ title: "Erro", description: "Nome e corpo são obrigatórios.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const variables = form.variables
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const payload = {
      name: form.name.trim(),
      category: form.category,
      body: form.body.trim(),
      language: form.language,
      variables,
    };

    if (editingTemplate) {
      const { error } = await supabase
        .from("whatsapp_templates")
        .update(payload as any)
        .eq("id", editingTemplate.id);

      if (error) {
        toast({ title: "Erro", description: "Não foi possível actualizar.", variant: "destructive" });
      } else {
        toast({ title: "Template actualizado" });
        setDialogOpen(false);
        await fetchTemplates();
      }
    } else {
      const { error } = await supabase
        .from("whatsapp_templates")
        .insert(payload as any);

      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Template criado" });
        setDialogOpen(false);
        await fetchTemplates();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (t: Template) => {
    const { error } = await supabase.from("whatsapp_templates").delete().eq("id", t.id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível eliminar.", variant: "destructive" });
    } else {
      toast({ title: "Eliminado", description: `"${t.name}" foi removido.` });
      await fetchTemplates();
    }
  };

  const handleToggleActive = async (t: Template) => {
    const { error } = await supabase
      .from("whatsapp_templates")
      .update({ is_active: !t.is_active } as any)
      .eq("id", t.id);

    if (error) {
      toast({ title: "Erro", variant: "destructive" });
    } else {
      toast({ title: t.is_active ? "Template desactivado" : "Template activado" });
      await fetchTemplates();
    }
  };

  const copyBody = (body: string) => {
    navigator.clipboard.writeText(body);
    toast({ title: "Copiado!" });
  };

  const renderPreview = (body: string, variables: string[]) => {
    let preview = body;
    variables.forEach((v, i) => {
      preview = preview.replace(`{{${i + 1}}}`, `[${v}]`);
    });
    return preview;
  };

  const filtered = filterCategory === "all"
    ? templates
    : templates.filter((t) => t.category === filterCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-success" />
            Templates WhatsApp
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os modelos de mensagem para envio automático via WhatsApp
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categoryOptions.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchTemplates}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Info box about variables */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <p className="font-heading font-semibold text-sm flex items-center gap-1.5 mb-1">
          <Variable className="w-4 h-4 text-primary" />
          Variáveis Dinâmicas
        </p>
        <p className="text-muted-foreground text-xs">
          Use <code className="bg-background px-1 py-0.5 rounded text-xs font-mono">{"{{1}}"}</code>, <code className="bg-background px-1 py-0.5 rounded text-xs font-mono">{"{{2}}"}</code>, etc. no corpo da mensagem para inserir valores dinâmicos como nome do aluno, curso, valor, etc.
        </p>
      </div>

      {/* Templates list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum template encontrado</p>
            <p className="text-sm mt-1">Crie o primeiro template para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((t) => (
            <Card key={t.id} className={`border-border transition-opacity ${!t.is_active ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-heading font-semibold text-sm">{t.name}</h3>
                      <Badge variant="secondary" className="text-[10px]">
                        {categoryOptions.find((c) => c.value === t.category)?.label || t.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{t.language}</Badge>
                      {!t.is_active && <Badge variant="destructive" className="text-[10px]">Inactivo</Badge>}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 font-mono whitespace-pre-wrap">
                      {t.body}
                    </p>

                    {t.variables.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        <Variable className="w-3 h-3 text-muted-foreground" />
                        {t.variables.map((v, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] font-mono">
                            {`{{${i + 1}}}`} = {v}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { setPreviewTemplate(t); setPreviewOpen(true); }}
                      title="Pré-visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyBody(t.body)}
                      title="Copiar"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleActive(t)}
                      title={t.is_active ? "Desactivar" : "Activar"}
                    >
                      {t.is_active ? (
                        <ToggleRight className="w-4 h-4 text-success" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(t)}
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar "{t.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acção é irreversível.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(t)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setDialogOpen(false); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingTemplate ? "Editar Template" : "Novo Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium">Nome do Template</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="ex: confirmacao_inscricao"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Identificador do template (Meta Business)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Idioma</Label>
                <Select value={form.language} onValueChange={(v) => setForm((p) => ({ ...p, language: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Corpo da Mensagem</Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                placeholder={`Olá {{1}}, a sua inscrição no curso {{2}} foi confirmada! Valor: {{3}} MZN. Ref: {{4}}`}
                className="mt-1 min-h-[120px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {"{{1}}"}, {"{{2}}"}, etc. para variáveis dinâmicas
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium">Variáveis (separadas por vírgula)</Label>
              <Input
                value={form.variables}
                onChange={(e) => setForm((p) => ({ ...p, variables: e.target.value }))}
                placeholder="ex: nome, curso, valor, referencia"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Descreva cada variável na ordem: {"{{1}}"} = primeira, {"{{2}}"} = segunda, etc.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "A guardar..." : editingTemplate ? "Actualizar" : "Criar Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Pré-visualização
            </DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-success" />
                  <span className="font-heading font-semibold text-sm">{previewTemplate.name}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {renderPreview(previewTemplate.body, previewTemplate.variables)}
                </p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Categoria:</strong> {categoryOptions.find((c) => c.value === previewTemplate.category)?.label}</p>
                <p><strong>Idioma:</strong> {previewTemplate.language}</p>
                {previewTemplate.variables.length > 0 && (
                  <div>
                    <strong>Variáveis:</strong>
                    <ul className="mt-1 space-y-0.5">
                      {previewTemplate.variables.map((v, i) => (
                        <li key={i} className="font-mono">{`{{${i + 1}}}`} → {v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppTemplatesTab;
