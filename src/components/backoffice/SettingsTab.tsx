import { useState, useEffect } from "react";
import { Save, RefreshCw, Settings2, Smartphone, Building2, Banknote, MessageSquare, Globe, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

const categoryConfig: Record<string, { icon: React.ElementType; title: string; description: string }> = {
  general: { icon: Globe, title: "Informações Gerais", description: "Dados da empresa e contactos" },
  whatsapp: { icon: MessageSquare, title: "WhatsApp Business", description: "Configuração da Meta Cloud API" },
  mpesa: { icon: Smartphone, title: "M-Pesa API", description: "Configuração do gateway M-Pesa Vodacom" },
  bank: { icon: Building2, title: "Dados Bancários", description: "Conta para transferências bancárias" },
  emola: { icon: Banknote, title: "e-Mola", description: "Dados para pagamentos e-Mola" },
  payments: { icon: ToggleLeft, title: "Canais de Pagamento", description: "Activar ou desactivar métodos de pagamento" },
};

const SettingsTab = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const categoryOrder = ["general", "payments", "mpesa", "whatsapp", "bank", "emola"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
            {saving ? "A guardar..." : "Guardar Alterações"}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-sm text-warning flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Tem alterações por guardar. Clique em "Guardar Alterações" para aplicar.
        </div>
      )}

      <div className="grid gap-6">
        {categoryOrder.map((category) => {
          const items = groupedSettings[category];
          if (!items || items.length === 0) return null;
          const config = categoryConfig[category] || { icon: Settings2, title: category, description: "" };
          const Icon = config.icon;

          return (
            <Card key={category} className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="font-heading text-base flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  {config.title}
                </CardTitle>
                <CardDescription className="text-xs">{config.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {category === "payments" ? (
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
                            <ToggleRight className="w-6 h-6 text-success" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : category === "mpesa" && items.some((s) => s.key === "mpesa_environment") ? (
                  <div className="space-y-4">
                    {items.map((setting) => (
                      <div key={setting.key}>
                        <Label className="text-sm font-medium mb-1.5 block">{setting.label}</Label>
                        {setting.key === "mpesa_environment" ? (
                          <Select
                            value={editedValues[setting.key] || "sandbox"}
                            onValueChange={(val) => handleChange(setting.key, val)}
                          >
                            <SelectTrigger className="w-full">
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
                            placeholder={setting.description}
                          />
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{setting.description}</p>
                      </div>
                    ))}
                    <Separator />
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs font-heading font-semibold mb-2 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-accent" />
                        Chaves API (Seguras)
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        As chaves API do M-Pesa (API Key e Public Key) estão armazenadas de forma segura como segredos do sistema.
                        Para as alterar, contacte o administrador do sistema.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">MPESA_API_KEY ✓</Badge>
                        <Badge variant="outline" className="text-xs">MPESA_PUBLIC_KEY ✓</Badge>
                        <Badge variant="outline" className="text-xs">MPESA_SERVICE_PROVIDER_CODE ✓</Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map((setting) => (
                      <div key={setting.key}>
                        <Label className="text-sm font-medium mb-1.5 block">{setting.label}</Label>
                        <Input
                          value={editedValues[setting.key] || ""}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                          placeholder={setting.description}
                          type={setting.is_secret ? "password" : "text"}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{setting.description}</p>
                      </div>
                    ))}
                    {category === "whatsapp" && (
                      <>
                        <Separator className="col-span-full" />
                        <div className="col-span-full bg-muted/50 rounded-lg p-4">
                          <p className="text-xs font-heading font-semibold mb-2 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-accent" />
                            Token de Acesso (Seguro)
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            O token de acesso da Meta Cloud API está armazenado como segredo do sistema.
                            Configure-o na secção de segredos para activar o envio automático de mensagens.
                          </p>
                          <Badge variant="outline" className="text-xs">WHATSAPP_ACCESS_TOKEN — Não configurado</Badge>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsTab;
