import { useState, useEffect } from "react";
import {
  Save, RefreshCw, Settings2, Smartphone, Building2, Banknote,
  MessageSquare, Globe, Shield, ToggleLeft, ToggleRight,
  Plus, Trash2, Pencil, X, Check,
} from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Setting {
  id: string;
  key: string;
  value: string;
  category: string;
  label: string;
  description: string;
  is_secret: boolean;
}

const categoryConfig: Record<string, { icon: React.ElementType; title: string; description: string; allowAdd: boolean }> = {
  general: { icon: Globe, title: "Informações Gerais", description: "Dados da empresa e contactos", allowAdd: true },
  whatsapp: { icon: MessageSquare, title: "WhatsApp Business", description: "Configuração da Meta Cloud API", allowAdd: true },
  mpesa: { icon: Smartphone, title: "M-Pesa API", description: "Configuração do gateway M-Pesa Vodacom", allowAdd: true },
  bank: { icon: Building2, title: "Contas Bancárias", description: "Contas para transferências bancárias", allowAdd: true },
  emola: { icon: Banknote, title: "e-Mola", description: "Dados para pagamentos e-Mola", allowAdd: true },
  payments: { icon: ToggleLeft, title: "Canais de Pagamento", description: "Activar ou desactivar métodos de pagamento", allowAdd: false },
};

const categoryOrder = ["general", "payments", "mpesa", "whatsapp", "bank", "emola"];

interface NewSettingForm {
  key: string;
  label: string;
  value: string;
  description: string;
  is_secret: boolean;
}

const emptyNewSetting: NewSettingForm = { key: "", label: "", value: "", description: "", is_secret: false };

const SettingsTab = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addCategory, setAddCategory] = useState<string | null>(null);
  const [newSetting, setNewSetting] = useState<NewSettingForm>(emptyNewSetting);
  const [addingOpen, setAddingOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ label: string; description: string; is_secret: boolean }>({ label: "", description: "", is_secret: false });

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .order("category", { ascending: true });

    if (error) {
      toast({ title: "Erro", description: "Não foi possível carregar as configurações.", variant: "destructive" });
    } else {
      setSettings((data as unknown as Setting[]) || []);
      const values: Record<string, string> = {};
      (data || []).forEach((s: any) => { values[s.key] = s.value; });
      setEditedValues(values);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const updates = settings
      .filter((s) => editedValues[s.key] !== s.value)
      .map((s) => ({ id: s.id, key: s.key, value: editedValues[s.key] }));

    if (updates.length === 0) {
      toast({ title: "Sem alterações" });
      setSaving(false);
      return;
    }

    let hasError = false;
    for (const update of updates) {
      const { error } = await supabase
        .from("system_settings")
        .update({ value: update.value } as any)
        .eq("id", update.id);
      if (error) {
        console.error("Error updating setting:", update.key, error);
        hasError = true;
      }
    }

    if (hasError) {
      toast({ title: "Erro", description: "Algumas configurações não foram guardadas.", variant: "destructive" });
    } else {
      toast({ title: "Configurações guardadas", description: `${updates.length} campo(s) actualizado(s).` });
      await fetchSettings();
    }
    setSaving(false);
  };

  const handleAddSetting = async () => {
    if (!addCategory || !newSetting.key.trim() || !newSetting.label.trim()) {
      toast({ title: "Erro", description: "Preencha pelo menos a chave e o rótulo.", variant: "destructive" });
      return;
    }

    const sanitizedKey = newSetting.key.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");

    const { error } = await supabase.from("system_settings").insert({
      key: sanitizedKey,
      label: newSetting.label.trim(),
      value: newSetting.value.trim(),
      description: newSetting.description.trim(),
      category: addCategory,
      is_secret: newSetting.is_secret,
    } as any);

    if (error) {
      toast({ title: "Erro", description: error.message.includes("duplicate") ? "Já existe uma configuração com esta chave." : "Não foi possível adicionar.", variant: "destructive" });
    } else {
      toast({ title: "Adicionado", description: `Campo "${newSetting.label}" adicionado com sucesso.` });
      setNewSetting(emptyNewSetting);
      setAddingOpen(false);
      setAddCategory(null);
      await fetchSettings();
    }
  };

  const handleDeleteSetting = async (setting: Setting) => {
    const { error } = await supabase.from("system_settings").delete().eq("id", setting.id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível eliminar.", variant: "destructive" });
    } else {
      toast({ title: "Eliminado", description: `"${setting.label}" foi removido.` });
      await fetchSettings();
    }
  };

  const handleStartEdit = (setting: Setting) => {
    setEditingId(setting.id);
    setEditForm({ label: setting.label, description: setting.description, is_secret: setting.is_secret });
  };

  const handleSaveEdit = async (setting: Setting) => {
    const { error } = await supabase
      .from("system_settings")
      .update({ label: editForm.label, description: editForm.description, is_secret: editForm.is_secret } as any)
      .eq("id", setting.id);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível actualizar.", variant: "destructive" });
    } else {
      toast({ title: "Actualizado" });
      setEditingId(null);
      await fetchSettings();
    }
  };

  const groupedSettings = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const hasChanges = settings.some((s) => editedValues[s.key] !== s.value);

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
            <Settings2 className="w-5 h-5 text-accent" />
            Configurações do Sistema
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie todas as configurações da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSettings}>
            <RefreshCw className="w-4 h-4" />
            Recarregar
          </Button>
          <Button variant="navy" size="sm" onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="w-4 h-4" />
            {saving ? "A guardar..." : "Guardar Valores"}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-sm text-warning flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Tem alterações de valores por guardar. Clique em "Guardar Valores" para aplicar.
        </div>
      )}

      {/* Add Setting Dialog */}
      <Dialog open={addingOpen} onOpenChange={(open) => { setAddingOpen(open); if (!open) setNewSetting(emptyNewSetting); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Adicionar Campo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium">Categoria</Label>
              <p className="text-sm text-muted-foreground">{addCategory ? (categoryConfig[addCategory]?.title || addCategory) : ""}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Chave (identificador único)</Label>
              <Input
                value={newSetting.key}
                onChange={(e) => setNewSetting((p) => ({ ...p, key: e.target.value }))}
                placeholder="ex: bank_account_bci"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Só letras minúsculas, números e underscore</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Rótulo</Label>
              <Input
                value={newSetting.label}
                onChange={(e) => setNewSetting((p) => ({ ...p, label: e.target.value }))}
                placeholder="ex: Conta BCI"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Valor</Label>
              <Input
                value={newSetting.value}
                onChange={(e) => setNewSetting((p) => ({ ...p, value: e.target.value }))}
                placeholder="ex: 123456789"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Descrição</Label>
              <Input
                value={newSetting.description}
                onChange={(e) => setNewSetting((p) => ({ ...p, description: e.target.value }))}
                placeholder="ex: NIB da conta do BCI"
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_secret"
                checked={newSetting.is_secret}
                onChange={(e) => setNewSetting((p) => ({ ...p, is_secret: e.target.checked }))}
                className="rounded border-border"
              />
              <Label htmlFor="is_secret" className="text-sm">Campo secreto (ocultar valor)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddSetting}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Grid */}
      <div className="grid gap-6">
        {categoryOrder.map((category) => {
          const items = groupedSettings[category] || [];
          const config = categoryConfig[category] || { icon: Settings2, title: category, description: "", allowAdd: true };
          const Icon = config.icon;

          return (
            <Card key={category} className="border-border">
              <CardContent className="p-5">
                <CollapsibleSection
                  title={config.title}
                  icon={
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/5">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
                    </div>
                  }
                  defaultOpen={category === "general" || category === "payments"}
                >
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                    {config.allowAdd && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setAddCategory(category); setAddingOpen(true); }}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Adicionar
                      </Button>
                    )}
                  </div>
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum campo configurado. Clique em "Adicionar" para criar.
                  </div>
                ) : category === "payments" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {items.map((setting) => {
                      const isEnabled = editedValues[setting.key] === "true";
                      return (
                        <div
                          key={setting.key}
                          onClick={() => handleChange(setting.key, isEnabled ? "false" : "true")}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isEnabled
                              ? "border-success/40 bg-success/5"
                              : "border-border bg-muted/30"
                          }`}
                        >
                          <div>
                            <p className="font-heading font-semibold text-sm">{setting.label}</p>
                            <p className="text-xs text-muted-foreground">{setting.description}</p>
                          </div>
                          {isEnabled ? (
                            <ToggleRight className="w-6 h-6 text-success shrink-0" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((setting) => {
                      const isEditing = editingId === setting.id;

                      return (
                        <div
                          key={setting.key}
                          className="group flex flex-col sm:flex-row sm:items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                        >
                          <div className="flex-1 space-y-2 min-w-0">
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  value={editForm.label}
                                  onChange={(e) => setEditForm((p) => ({ ...p, label: e.target.value }))}
                                  placeholder="Rótulo"
                                  className="h-8 text-sm"
                                />
                                <Input
                                  value={editForm.description}
                                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                                  placeholder="Descrição"
                                  className="h-8 text-sm"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center gap-2">
                                  <Label className="text-sm font-medium">{setting.label}</Label>
                                  <Badge variant="outline" className="text-[9px] font-mono text-muted-foreground">{setting.key}</Badge>
                                  {setting.is_secret && <Badge variant="secondary" className="text-[9px]">Secreto</Badge>}
                                </div>
                                {setting.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
                                )}
                              </div>
                            )}

                            {/* Value field - only show for mpesa_environment as select */}
                            {setting.key === "mpesa_environment" ? (
                              <Select
                                value={editedValues[setting.key] || "sandbox"}
                                onValueChange={(val) => handleChange(setting.key, val)}
                              >
                                <SelectTrigger className="w-full h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sandbox">Sandbox (Teste)</SelectItem>
                                  <SelectItem value="production">Produção</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                value={editedValues[setting.key] || ""}
                                onChange={(e) => handleChange(setting.key, e.target.value)}
                                placeholder={setting.description || "Valor..."}
                                type={setting.is_secret ? "password" : "text"}
                                className="h-9"
                              />
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1 shrink-0 sm:pt-1">
                            {isEditing ? (
                              <>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSaveEdit(setting)} title="Guardar">
                                  <Check className="w-3.5 h-3.5 text-success" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)} title="Cancelar">
                                  <X className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleStartEdit(setting)}
                                  title="Editar rótulo/descrição"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Eliminar "{setting.label}"?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acção é irreversível. O campo <strong>{setting.key}</strong> será permanentemente removido.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteSetting(setting)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Secure keys info for specific categories */}
                    {category === "mpesa" && (
                      <div className="bg-muted/50 rounded-lg p-4 mt-2">
                        <p className="text-xs font-heading font-semibold mb-2 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-accent" />
                          Chaves API (Seguras)
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          As chaves API do M-Pesa estão armazenadas como segredos do sistema.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">MPESA_API_KEY ✓</Badge>
                          <Badge variant="outline" className="text-xs">MPESA_PUBLIC_KEY ✓</Badge>
                          <Badge variant="outline" className="text-xs">MPESA_SERVICE_PROVIDER_CODE ✓</Badge>
                        </div>
                      </div>
                    )}
                    {category === "whatsapp" && (
                      <div className="bg-muted/50 rounded-lg p-4 mt-2">
                        <p className="text-xs font-heading font-semibold mb-2 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-accent" />
                          Token de Acesso (Seguro)
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          O token de acesso da Meta Cloud API está armazenado como segredo do sistema.
                        </p>
                        <Badge variant="outline" className="text-xs">WHATSAPP_ACCESS_TOKEN ✓</Badge>
                      </div>
                    )}
                  </div>
                )}
                </CollapsibleSection>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsTab;
