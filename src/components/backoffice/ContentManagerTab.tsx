import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Star, HelpCircle, Users, BarChart3, Plus, Trash2, Save, Eye, EyeOff, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  useAllTestimonials, useAllFAQs, useAllTeamMembers, useAllHeroStats,
  type Testimonial, type FAQ, type TeamMember, type HeroStat,
} from "@/hooks/use-site-content";

// ─── Generic CRUD helpers ────────────────────────────────────
async function upsertRow(table: string, row: any, queryClient: any, keys: string[]) {
  const { id, created_at, updated_at, ...rest } = row;
  if (id && !id.startsWith("new-")) {
    const { error } = await supabase.from(table).update(rest).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from(table).insert(rest);
    if (error) throw error;
  }
  keys.forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
}

async function deleteRow(table: string, id: string, queryClient: any, keys: string[]) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
  keys.forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
}

async function toggleActive(table: string, id: string, active: boolean, queryClient: any, keys: string[]) {
  const { error } = await supabase.from(table).update({ is_active: active }).eq("id", id);
  if (error) throw error;
  keys.forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
}

// ─── Testimonials Panel ──────────────────────────────────────
function TestimonialsPanel() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useAllTestimonials();
  const [editing, setEditing] = useState<Testimonial | null>(null);

  const handleSave = async () => {
    if (!editing) return;
    try {
      await upsertRow("testimonials", editing, queryClient, ["testimonials-all", "testimonials"]);
      toast({ title: "Testemunho guardado!" });
      setEditing(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este testemunho?")) return;
    try {
      await deleteRow("testimonials", id, queryClient, ["testimonials-all", "testimonials"]);
      toast({ title: "Eliminado!" });
      if (editing?.id === id) setEditing(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await toggleActive("testimonials", id, active, queryClient, ["testimonials-all", "testimonials"]);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const newItem = (): Testimonial => ({
    id: `new-${Date.now()}`, name: "", role: "", course: "", text: "",
    rating: 5, initials: "", is_active: true, display_order: items.length + 1,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground py-4">A carregar...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} testemunhos</p>
        <Button size="sm" onClick={() => setEditing(newItem())}><Plus className="w-4 h-4 mr-1" />Novo</Button>
      </div>

      {editing && (
        <Card className="border-accent">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nome *</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Iniciais</Label>
                <Input value={editing.initials} onChange={(e) => setEditing({ ...editing, initials: e.target.value })} maxLength={3} />
              </div>
              <div>
                <Label className="text-xs">Cargo / Empresa</Label>
                <Input value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Curso</Label>
                <Input value={editing.course} onChange={(e) => setEditing({ ...editing, course: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Depoimento *</Label>
              <Textarea value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Avaliação (1-5)</Label>
                <Input type="number" min={1} max={5} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: parseInt(e.target.value) || 5 })} />
              </div>
              <div>
                <Label className="text-xs">Ordem</Label>
                <Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button size="sm" onClick={handleSave} disabled={!editing.name || !editing.text}><Save className="w-4 h-4 mr-1" />Guardar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border ${item.is_active ? "border-border" : "border-border/50 opacity-60"}`}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {item.initials || item.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground truncate">{item.role} · {item.course}</p>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: item.rating }).map((_, i) => (
                <Star key={i} className="w-3 h-3 text-warning fill-warning" />
              ))}
            </div>
            <Switch checked={item.is_active} onCheckedChange={(v) => handleToggle(item.id, v)} />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(item)}>
              <Save className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAQs Panel ──────────────────────────────────────────────
function FAQsPanel() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useAllFAQs();
  const [editing, setEditing] = useState<FAQ | null>(null);

  const handleSave = async () => {
    if (!editing) return;
    try {
      await upsertRow("faqs", editing, queryClient, ["faqs-all", "faqs"]);
      toast({ title: "FAQ guardada!" });
      setEditing(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar esta FAQ?")) return;
    try {
      await deleteRow("faqs", id, queryClient, ["faqs-all", "faqs"]);
      toast({ title: "Eliminada!" });
      if (editing?.id === id) setEditing(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await toggleActive("faqs", id, active, queryClient, ["faqs-all", "faqs"]);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const newItem = (): FAQ => ({
    id: `new-${Date.now()}`, question: "", answer: "",
    is_active: true, display_order: items.length + 1,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground py-4">A carregar...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} perguntas</p>
        <Button size="sm" onClick={() => setEditing(newItem())}><Plus className="w-4 h-4 mr-1" />Nova</Button>
      </div>

      {editing && (
        <Card className="border-accent">
          <CardContent className="p-4 space-y-3">
            <div>
              <Label className="text-xs">Pergunta *</Label>
              <Input value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Resposta *</Label>
              <Textarea value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} rows={4} />
            </div>
            <div>
              <Label className="text-xs">Ordem</Label>
              <Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })} className="w-24" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button size="sm" onClick={handleSave} disabled={!editing.question || !editing.answer}><Save className="w-4 h-4 mr-1" />Guardar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className={`flex items-start gap-3 p-3 rounded-lg border ${item.is_active ? "border-border" : "border-border/50 opacity-60"}`}>
            <HelpCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{item.question}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.answer}</p>
            </div>
            <Switch checked={item.is_active} onCheckedChange={(v) => handleToggle(item.id, v)} />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(item)}>
              <Save className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Team Panel ──────────────────────────────────────────────
function TeamPanel() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useAllTeamMembers();
  const [editing, setEditing] = useState<TeamMember | null>(null);

  const handleSave = async () => {
    if (!editing) return;
    try {
      await upsertRow("team_members", editing, queryClient, ["team-members-all", "team-members"]);
      toast({ title: "Membro guardado!" });
      setEditing(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este membro?")) return;
    try {
      await deleteRow("team_members", id, queryClient, ["team-members-all", "team-members"]);
      toast({ title: "Eliminado!" });
      if (editing?.id === id) setEditing(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await toggleActive("team_members", id, active, queryClient, ["team-members-all", "team-members"]);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const newItem = (): TeamMember => ({
    id: `new-${Date.now()}`, name: "", role: "", bio: "", photo_url: null,
    is_active: true, display_order: items.length + 1,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground py-4">A carregar...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} membros</p>
        <Button size="sm" onClick={() => setEditing(newItem())}><Plus className="w-4 h-4 mr-1" />Novo</Button>
      </div>

      {editing && (
        <Card className="border-accent">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nome *</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Cargo *</Label>
                <Input value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Biografia</Label>
              <Textarea value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} rows={3} />
            </div>
            <div>
              <Label className="text-xs">URL da Foto (opcional)</Label>
              <Input value={editing.photo_url || ""} onChange={(e) => setEditing({ ...editing, photo_url: e.target.value || null })} placeholder="https://..." />
            </div>
            <div>
              <Label className="text-xs">Ordem</Label>
              <Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })} className="w-24" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button size="sm" onClick={handleSave} disabled={!editing.name}><Save className="w-4 h-4 mr-1" />Guardar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border ${item.is_active ? "border-border" : "border-border/50 opacity-60"}`}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden">
              {item.photo_url ? (
                <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.role}</p>
            </div>
            <Switch checked={item.is_active} onCheckedChange={(v) => handleToggle(item.id, v)} />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(item)}>
              <Save className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Hero Stats Panel ────────────────────────────────────────
function HeroStatsPanel() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useAllHeroStats();
  const [editing, setEditing] = useState<HeroStat | null>(null);

  const handleSave = async () => {
    if (!editing) return;
    try {
      await upsertRow("hero_stats", editing, queryClient, ["hero-stats-all", "hero-stats"]);
      toast({ title: "Estatística guardada!" });
      setEditing(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar esta estatística?")) return;
    try {
      await deleteRow("hero_stats", id, queryClient, ["hero-stats-all", "hero-stats"]);
      toast({ title: "Eliminada!" });
      if (editing?.id === id) setEditing(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await toggleActive("hero_stats", id, active, queryClient, ["hero-stats-all", "hero-stats"]);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const newItem = (): HeroStat => ({
    id: `new-${Date.now()}`, label: "", value: 0, suffix: "+", icon: "Users",
    display_order: items.length + 1, is_active: true,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground py-4">A carregar...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} estatísticas</p>
        <Button size="sm" onClick={() => setEditing(newItem())}><Plus className="w-4 h-4 mr-1" />Nova</Button>
      </div>

      {editing && (
        <Card className="border-accent">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Label *</Label>
                <Input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Valor *</Label>
                <Input type="number" value={editing.value} onChange={(e) => setEditing({ ...editing, value: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label className="text-xs">Sufixo</Label>
                <Input value={editing.suffix} onChange={(e) => setEditing({ ...editing, suffix: e.target.value })} placeholder="+ ou %" />
              </div>
              <div>
                <Label className="text-xs">Ícone</Label>
                <Input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="Users, BookOpen, Award, Shield" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Ordem</Label>
              <Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })} className="w-24" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button size="sm" onClick={handleSave} disabled={!editing.label}><Save className="w-4 h-4 mr-1" />Guardar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border ${item.is_active ? "border-border" : "border-border/50 opacity-60"}`}>
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold text-lg shrink-0">
              {item.value}{item.suffix}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">Ícone: {item.icon}</p>
            </div>
            <Switch checked={item.is_active} onCheckedChange={(v) => handleToggle(item.id, v)} />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(item)}>
              <Save className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Content Manager Tab ────────────────────────────────
const ContentManagerTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold mb-1">Gestor de Conteúdos</h2>
        <p className="text-sm text-muted-foreground">Edite testemunhos, FAQs, equipa e estatísticas exibidos no site público.</p>
      </div>

      <Tabs defaultValue="testimonials" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="testimonials" className="text-xs">
            <Star className="w-3.5 h-3.5 mr-1" />Testemunhos
          </TabsTrigger>
          <TabsTrigger value="faqs" className="text-xs">
            <HelpCircle className="w-3.5 h-3.5 mr-1" />FAQs
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs">
            <Users className="w-3.5 h-3.5 mr-1" />Equipa
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-xs">
            <BarChart3 className="w-3.5 h-3.5 mr-1" />Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="testimonials"><TestimonialsPanel /></TabsContent>
        <TabsContent value="faqs"><FAQsPanel /></TabsContent>
        <TabsContent value="team"><TeamPanel /></TabsContent>
        <TabsContent value="stats"><HeroStatsPanel /></TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagerTab;
