import { useState, useEffect, useCallback } from "react";
import {
  Calendar, Upload, Check, Clock, AlertCircle, FileText, Eye,
  Plus, Trash2, Pencil, Save, X, Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/courses-data";

interface Installment {
  id: string;
  enrollment_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: string;
  paid_date: string | null;
  payment_method: string | null;
  admin_notes: string | null;
  created_at: string;
}

interface PaymentProof {
  id: string;
  enrollment_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  installment_number: number;
  created_at: string;
}

interface Props {
  enrollmentId: string;
  paymentPlan: string;
  totalPrice: number;
  amountDue: number;
}

const planInstallments: Record<string, { number: number; percent: number; daysOffset: number }[]> = {
  full: [{ number: 1, percent: 100, daysOffset: 0 }],
  "60-40": [
    { number: 1, percent: 60, daysOffset: 0 },
    { number: 2, percent: 40, daysOffset: 7 },
  ],
  "60-20-20": [
    { number: 1, percent: 60, daysOffset: 0 },
    { number: 2, percent: 20, daysOffset: 15 },
    { number: 3, percent: 20, daysOffset: 20 },
  ],
};

const statusLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendente", color: "text-warning", icon: Clock },
  paid: { label: "Pago", color: "text-success", icon: Check },
  overdue: { label: "Atrasado", color: "text-destructive", icon: AlertCircle },
  cancelled: { label: "Cancelado", color: "text-muted-foreground", icon: X },
};

export default function InstallmentTracker({ enrollmentId, paymentPlan, totalPrice, amountDue }: Props) {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Installment>>({});

  const fetchInstallments = useCallback(async () => {
    const { data, error } = await supabase
      .from("installments")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .order("installment_number", { ascending: true });

    if (!error) setInstallments((data as unknown as Installment[]) || []);
  }, [enrollmentId]);

  const fetchProofs = useCallback(async () => {
    const { data } = await supabase
      .from("payment_proofs")
      .select("*")
      .eq("enrollment_id", enrollmentId);
    if (data) setProofs(data as unknown as PaymentProof[]);
  }, [enrollmentId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchInstallments(), fetchProofs()]);
    setLoading(false);
  }, [fetchInstallments, fetchProofs]);

  useEffect(() => { loadData(); }, [loadData]);

  const generateInstallments = async () => {
    const plan = planInstallments[paymentPlan] || planInstallments.full;
    const baseDate = new Date();
    const records = plan.map((p) => {
      const dueDate = new Date(baseDate);
      dueDate.setDate(dueDate.getDate() + p.daysOffset);
      return {
        enrollment_id: enrollmentId,
        installment_number: p.number,
        amount: Math.round((totalPrice * p.percent) / 100),
        due_date: dueDate.toISOString().split("T")[0],
        status: "pending",
      };
    });

    const { error } = await supabase.from("installments").insert(records as any);
    if (error) {
      if (error.message.includes("duplicate")) {
        toast({ title: "Prestações já existem", variant: "destructive" });
      } else {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Prestações geradas" });
      await fetchInstallments();
    }
  };

  const updateInstallment = async (id: string, updates: Record<string, any>) => {
    const { error } = await supabase.from("installments").update(updates as any).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Prestação actualizada" });
      await fetchInstallments();
    }
  };

  const markAsPaid = async (inst: Installment) => {
    await updateInstallment(inst.id, {
      status: "paid",
      paid_date: new Date().toISOString().split("T")[0],
    });
  };

  const deleteInstallment = async (id: string) => {
    const { error } = await supabase.from("installments").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", variant: "destructive" });
    } else {
      toast({ title: "Prestação eliminada" });
      await fetchInstallments();
    }
  };

  const handleFileUpload = async (installmentNumber: number, file: File) => {
    setUploading(installmentNumber);
    const filePath = `${enrollmentId}/installment-${installmentNumber}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
      setUploading(null);
      return;
    }

    const { error: dbError } = await supabase.from("payment_proofs").insert({
      enrollment_id: enrollmentId,
      file_path: filePath,
      file_name: file.name,
      file_type: file.type,
      installment_number: installmentNumber,
    } as any);

    if (dbError) {
      toast({ title: "Erro", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "Comprovativo enviado" });
      await fetchProofs();
    }
    setUploading(null);
  };

  const viewProof = async (filePath: string) => {
    const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(filePath, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const startEdit = (inst: Installment) => {
    setEditingId(inst.id);
    setEditForm({
      amount: inst.amount,
      due_date: inst.due_date,
      status: inst.status,
      paid_date: inst.paid_date,
      payment_method: inst.payment_method,
      admin_notes: inst.admin_notes,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateInstallment(editingId, editForm);
    setEditingId(null);
  };

  const totalPaid = installments.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = installments.filter((i) => i.status !== "paid" && i.status !== "cancelled").reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
          <Banknote className="w-4 h-4 text-primary" />
          Prestações ({paymentPlan})
        </h3>
        {installments.length === 0 && (
          <Button size="sm" variant="outline" onClick={generateInstallments}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Gerar Prestações
          </Button>
        )}
      </div>

      {/* Summary */}
      {installments.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-heading font-bold text-sm">{formatCurrency(totalPrice)}</p>
          </div>
          <div className="bg-success/5 rounded-lg p-2 text-center">
            <p className="text-xs text-success">Pago</p>
            <p className="font-heading font-bold text-sm text-success">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-warning/5 rounded-lg p-2 text-center">
            <p className="text-xs text-warning">Pendente</p>
            <p className="font-heading font-bold text-sm text-warning">{formatCurrency(totalPending)}</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-4">A carregar...</p>
      ) : installments.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>Nenhuma prestação registada.</p>
          <p className="text-xs mt-1">Clique em "Gerar Prestações" para criar automaticamente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {installments.map((inst) => {
            const statusInfo = statusLabels[inst.status] || statusLabels.pending;
            const StatusIcon = statusInfo.icon;
            const instProofs = proofs.filter((p) => p.installment_number === inst.installment_number);
            const isEditing = editingId === inst.id;
            const isOverdue = inst.status === "pending" && new Date(inst.due_date) < new Date();

            return (
              <Card key={inst.id} className={`border ${isOverdue ? "border-destructive/30" : "border-border"}`}>
                <CardContent className="p-3 space-y-2">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        inst.status === "paid" ? "bg-success/10 text-success" : isOverdue ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                      }`}>
                        {inst.installment_number}
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-sm">
                          Prestação {inst.installment_number}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Vence: {new Date(inst.due_date).toLocaleDateString("pt-PT")}
                          {isOverdue && <span className="text-destructive font-medium ml-1">(atrasado)</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <span className="font-heading font-bold text-sm">{formatCurrency(Number(inst.amount))}</span>
                    </div>
                  </div>

                  {inst.paid_date && (
                    <p className="text-xs text-success">
                      Pago em: {new Date(inst.paid_date).toLocaleDateString("pt-PT")}
                      {inst.payment_method && ` · ${inst.payment_method}`}
                    </p>
                  )}

                  {/* Edit form */}
                  {isEditing && (
                    <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Valor</Label>
                          <Input
                            type="number"
                            value={editForm.amount || ""}
                            onChange={(e) => setEditForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Data de Vencimento</Label>
                          <Input
                            type="date"
                            value={editForm.due_date || ""}
                            onChange={(e) => setEditForm((p) => ({ ...p, due_date: e.target.value }))}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Estado</Label>
                          <Select value={editForm.status || "pending"} onValueChange={(v) => setEditForm((p) => ({ ...p, status: v }))}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="paid">Pago</SelectItem>
                              <SelectItem value="overdue">Atrasado</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Data Pagamento</Label>
                          <Input
                            type="date"
                            value={editForm.paid_date || ""}
                            onChange={(e) => setEditForm((p) => ({ ...p, paid_date: e.target.value || null }))}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Método</Label>
                          <Select
                            value={editForm.payment_method || ""}
                            onValueChange={(v) => setEditForm((p) => ({ ...p, payment_method: v }))}
                          >
                            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mpesa">M-Pesa</SelectItem>
                              <SelectItem value="emola">e-Mola</SelectItem>
                              <SelectItem value="bank_transfer">Transferência</SelectItem>
                              <SelectItem value="cash">Numerário</SelectItem>
                              <SelectItem value="other">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Notas</Label>
                        <Textarea
                          value={editForm.admin_notes || ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, admin_notes: e.target.value }))}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}><Save className="w-3.5 h-3.5 mr-1" />Guardar</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
                      </div>
                    </div>
                  )}

                  {/* Proofs for this installment */}
                  {instProofs.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Comprovativos:</p>
                      {instProofs.map((proof) => (
                        <div key={proof.id} className="flex items-center gap-2 bg-muted/50 rounded p-1.5">
                          <FileText className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          <span className="text-xs flex-1 truncate">{proof.file_name}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => viewProof(proof.file_path)}>
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 pt-1">
                      {inst.status !== "paid" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => markAsPaid(inst)}>
                          <Check className="w-3 h-3 mr-1" />
                          Marcar Pago
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => startEdit(inst)}>
                        <Pencil className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(inst.installment_number, file);
                            e.target.value = "";
                          }}
                        />
                        <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                          <span>
                            <Upload className="w-3 h-3 mr-1" />
                            {uploading === inst.installment_number ? "A enviar..." : "Comprovativo"}
                          </span>
                        </Button>
                      </label>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive hover:text-destructive ml-auto"
                        onClick={() => { if (confirm("Eliminar esta prestação?")) deleteInstallment(inst.id); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
