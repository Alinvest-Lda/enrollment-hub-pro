import { useState, useEffect } from "react";
import {
  Plus, Trash2, Pencil, Save, X, RefreshCw, DollarSign,
  ToggleLeft, ToggleRight, Copy, Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PlanInstallment {
  number: number;
  percent: number;
  days_offset: number;
  label: string;
}

interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  installments: PlanInstallment[];
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

const emptyInstallment: PlanInstallment = { number: 1, percent: 100, days_offset: 0, label: "Pagamento" };

export default function PaymentPlansTab() {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    installments: [{ ...emptyInstallment }] as PlanInstallment[],
    is_default: false,
  });

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payment_plans")
      .select("*")
      .order("is_default", { ascending: false });
    if (!error) setPlans((data as unknown as PaymentPlan[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => {
    setEditingPlan(null);
    setForm({ name: "", description: "", installments: [{ ...emptyInstallment }], is_default: false });
    setDialogOpen(true);
  };

  const openEdit = (p: PaymentPlan) => {
    setEditingPlan(p);
    setForm({
      name: p.name,
      description: p.description,
      installments: p.installments.length > 0 ? p.installments : [{ ...emptyInstallment }],
      is_default: p.is_default,
    });
    setDialogOpen(true);
  };

  const addInstallment = () => {
    setForm((p) => {
      const next = p.installments.length + 1;
      return { ...p, installments: [...p.installments, { number: next, percent: 0, days_offset: 0, label: `${next}ª prestação` }] };
    });
  };

  const removeInstallment = (i: number) => {
    setForm((p) => ({
      ...p,
      installments: p.installments.filter((_, idx) => idx !== i).map((inst, idx) => ({ ...inst, number: idx + 1 })),
    }));
  };

  const updateInstallment = (index: number, field: keyof PlanInstallment, value: string | number) => {
    setForm((p) => {
      const installments = [...p.installments];
      (installments[index] as any)[field] = value;
      return { ...p, installments };
    });
  };

  const totalPercent = form.installments.reduce((s, i) => s + Number(i.percent), 0);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }
    if (totalPercent !== 100) {
      toast({ title: "Erro", description: `A soma das percentagens deve ser 100% (actual: ${totalPercent}%).`, variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      installments: form.installments,
      is_default: form.is_default,
    };

    if (editingPlan) {
      const { error } = await supabase.from("payment_plans").update(payload as any).eq("id", editingPlan.id);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Plano actualizado" });
    } else {
      const { error } = await supabase.from("payment_plans").insert(payload as any);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Plano criado" });
    }
    setDialogOpen(false);
    await fetchPlans();
  };

  const toggleActive = async (p: PaymentPlan) => {
    const { error } = await supabase.from("payment_plans").update({ is_active: !p.is_active } as any).eq("id", p.id);
    if (!error) { toast({ title: p.is_active ? "Plano desactivado" : "Plano activado" }); await fetchPlans(); }
  };

  const deletePlan = async (id: string) => {
    const { error } = await supabase.from("payment_plans").delete().eq("id", id);
    if (!error) { toast({ title: "Plano eliminado" }); await fetchPlans(); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-16"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Modelos de Pagamento
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Configure planos de pagamento parcelado</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPlans}><RefreshCw className="w-4 h-4" /></Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Novo Plano</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className={`border-border transition-opacity ${!plan.is_active ? "opacity-60" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-base flex items-center gap-2">
                  {plan.name}
                  {plan.is_default && <Badge variant="secondary" className="text-[10px]">Padrão</Badge>}
                  {!plan.is_active && <Badge variant="destructive" className="text-[10px]">Inactivo</Badge>}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleActive(plan)}>
                    {plan.is_active ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(plan)}><Pencil className="w-4 h-4" /></Button>
                  {!plan.is_default && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar "{plan.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>Irreversível.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePlan(plan.id)} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
              <CardDescription className="text-xs">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                {plan.installments.map((inst, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{inst.number}</div>
                      <span className="text-sm">{inst.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="outline" className="text-xs font-mono">{inst.percent}%</Badge>
                      <span className="text-muted-foreground text-xs">
                        {inst.days_offset === 0 ? "No acto" : `+${inst.days_offset} dias`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingPlan ? "Editar Plano" : "Novo Plano de Pagamento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="ex: Plano 50/50" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium">Descrição</Label>
              <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="ex: 50% na inscrição, 50% em 14 dias" className="mt-1" />
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-heading font-semibold">Prestações</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={totalPercent === 100 ? "default" : "destructive"} className="text-xs">
                    <Percent className="w-3 h-3 mr-1" />{totalPercent}%
                  </Badge>
                  <Button variant="outline" size="sm" onClick={addInstallment}><Plus className="w-3 h-3 mr-1" />Adicionar</Button>
                </div>
              </div>
              <div className="space-y-2">
                {form.installments.map((inst, i) => (
                  <div key={i} className="flex gap-2 items-end bg-muted/30 rounded-lg p-2">
                    <div className="flex-1">
                      {i === 0 && <Label className="text-[10px] text-muted-foreground">Rótulo</Label>}
                      <Input value={inst.label} onChange={(e) => updateInstallment(i, "label", e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="w-20">
                      {i === 0 && <Label className="text-[10px] text-muted-foreground">%</Label>}
                      <Input type="number" min={0} max={100} value={inst.percent} onChange={(e) => updateInstallment(i, "percent", Number(e.target.value))} className="h-8 text-sm" />
                    </div>
                    <div className="w-24">
                      {i === 0 && <Label className="text-[10px] text-muted-foreground">Dias</Label>}
                      <Input type="number" min={0} value={inst.days_offset} onChange={(e) => updateInstallment(i, "days_offset", Number(e.target.value))} className="h-8 text-sm" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeInstallment(i)} disabled={form.installments.length === 1}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              {totalPercent !== 100 && (
                <p className="text-xs text-destructive mt-1">A soma deve ser exactamente 100%</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}><Save className="w-4 h-4 mr-1" />{editingPlan ? "Actualizar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
