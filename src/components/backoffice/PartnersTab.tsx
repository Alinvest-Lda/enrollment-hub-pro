import { useState, useEffect, useCallback } from "react";
import {
  Plus, Pencil, Trash2, Save, Loader2, Upload, ExternalLink,
  GripVertical, ArrowUp, ArrowDown, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  description: string;
  courses_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function PartnersTab() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Partner> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("partners").select("*").order("display_order", { ascending: true });
    if (data) setPartners(data as unknown as Partner[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    const filePath = `partner-logos/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("certificate-examples").upload(filePath, file);
    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("certificate-examples").getPublicUrl(filePath);
    setEditing(p => ({ ...p!, logo_url: urlData.publicUrl }));
    toast({ title: "Logótipo carregado" });
    setUploading(false);
  };

  const savePartner = async () => {
    if (!editing?.name) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    setSaving(true);
    if (isNew) {
      const maxOrder = partners.length > 0 ? Math.max(...partners.map(p => p.display_order)) + 1 : 1;
      const { error } = await supabase.from("partners").insert({ ...editing, display_order: maxOrder } as any);
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Parceiro adicionado" });
    } else {
      const { id, created_at, ...rest } = editing as Partner;
      const { error } = await supabase.from("partners").update(rest as any).eq("id", id);
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Parceiro actualizado" });
    }
    setEditing(null);
    setSaving(false);
    await fetchPartners();
  };

  const deletePartner = async (id: string) => {
    if (!confirm("Eliminar este parceiro?")) return;
    await supabase.from("partners").delete().eq("id", id);
    toast({ title: "Parceiro eliminado" });
    await fetchPartners();
  };

  const toggleActive = async (partner: Partner) => {
    await supabase.from("partners").update({ is_active: !partner.is_active } as any).eq("id", partner.id);
    await fetchPartners();
  };

  const moveOrder = async (partner: Partner, direction: "up" | "down") => {
    const idx = partners.findIndex(p => p.id === partner.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= partners.length) return;
    const other = partners[swapIdx];
    await Promise.all([
      supabase.from("partners").update({ display_order: other.display_order } as any).eq("id", partner.id),
      supabase.from("partners").update({ display_order: partner.display_order } as any).eq("id", other.id),
    ]);
    await fetchPartners();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold">Parceiros ({partners.length})</h3>
        <Button size="sm" onClick={() => { setEditing({ name: "", description: "", logo_url: "", website_url: "", courses_url: "", is_active: true }); setIsNew(true); }}>
          <Plus className="w-4 h-4 mr-1" />Novo Parceiro
        </Button>
      </div>

      {/* Editor */}
      {editing && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{isNew ? "Novo Parceiro" : "Editar Parceiro"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nome *</Label>
                <Input value={editing.name || ""} onChange={e => setEditing(p => ({ ...p!, name: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Website</Label>
                <Input value={editing.website_url || ""} onChange={e => setEditing(p => ({ ...p!, website_url: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            <div>
              <Label className="text-xs">Descrição</Label>
              <Textarea value={editing.description || ""} onChange={e => setEditing(p => ({ ...p!, description: e.target.value }))} rows={2} />
            </div>
            <div>
              <Label className="text-xs">URL de Cursos do Parceiro</Label>
              <Input value={editing.courses_url || ""} onChange={e => setEditing(p => ({ ...p!, courses_url: e.target.value }))} placeholder="https://partner.com/courses" />
              <p className="text-[10px] text-muted-foreground mt-1">Link para a página de cursos na base de dados do parceiro</p>
            </div>

            {/* Logo upload */}
            <div>
              <Label className="text-xs">Logótipo</Label>
              <div className="flex gap-3 items-center mt-1">
                <label className="cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.target.value = ""; }} />
                  <Button size="sm" variant="outline" className="text-xs" asChild>
                    <span><Upload className="w-3.5 h-3.5 mr-1" />{uploading ? "A enviar..." : "Carregar"}</span>
                  </Button>
                </label>
                {editing.logo_url && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-12 rounded border border-border overflow-hidden bg-background p-1">
                      <img src={editing.logo_url} alt="" className="w-full h-full object-contain" />
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => setEditing(p => ({ ...p!, logo_url: "" }))}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={savePartner} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}Guardar
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Partners list */}
      <div className="space-y-2">
        {partners.map((partner, idx) => (
          <Card key={partner.id} className={!partner.is_active ? "opacity-50" : ""}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <Button variant="ghost" size="icon" className="h-5 w-5" disabled={idx === 0} onClick={() => moveOrder(partner, "up")}>
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5" disabled={idx === partners.length - 1} onClick={() => moveOrder(partner, "down")}>
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>

              {partner.logo_url ? (
                <div className="w-12 h-10 rounded border border-border overflow-hidden bg-background p-1 shrink-0">
                  <img src={partner.logo_url} alt={partner.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-12 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                  <span className="font-heading font-bold text-muted-foreground text-sm">{partner.name.charAt(0)}</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-sm">{partner.name}</p>
                <p className="text-xs text-muted-foreground truncate">{partner.description}</p>
                <div className="flex gap-2 mt-1">
                  {partner.website_url && (
                    <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                      <ExternalLink className="w-2.5 h-2.5" />Website
                    </a>
                  )}
                  {partner.courses_url && (
                    <a href={partner.courses_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent hover:underline flex items-center gap-0.5">
                      <ExternalLink className="w-2.5 h-2.5" />Cursos
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={partner.is_active ? "default" : "outline"} className="text-[9px] cursor-pointer" onClick={() => toggleActive(partner)}>
                  {partner.is_active ? "Activo" : "Inactivo"}
                </Badge>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditing({ ...partner }); setIsNew(false); }}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => deletePartner(partner.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {partners.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Nenhum parceiro adicionado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
