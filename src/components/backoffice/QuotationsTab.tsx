import { useState, useEffect } from "react";
import {
  Plus, Trash2, Pencil, Save, X, RefreshCw, FileText,
  Send, Copy, Eye, Printer, DollarSign, Percent, Calendar, Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/courses-data";

interface QuotationItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Quotation {
  id: string;
  training_request_id: string | null;
  quotation_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_type: string;
  organization_name: string | null;
  training_topic: string;
  items: QuotationItem[];
  subtotal: number;
  discount_percent: number;
  tax_percent: number;
  total: number;
  currency: string;
  notes: string | null;
  terms: string | null;
  status: string;
  valid_until: string | null;
  created_at: string;
}

interface TrainingRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  client_type: string;
  organization_name: string | null;
  training_topic: string;
  training_details: string | null;
  num_participants: number | null;
  budget_range: string | null;
  status: string;
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Rascunho", variant: "outline" },
  sent: { label: "Enviada", variant: "secondary" },
  accepted: { label: "Aceite", variant: "default" },
  rejected: { label: "Rejeitada", variant: "destructive" },
  expired: { label: "Expirada", variant: "outline" },
};

const emptyItem: QuotationItem = { description: "", quantity: 1, unit_price: 0, total: 0 };

interface Props {
  trainingRequests: TrainingRequest[];
}

export default function QuotationsTab({ trainingRequests }: Props) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    client_type: "individual",
    organization_name: "",
    training_topic: "",
    items: [{ ...emptyItem }] as QuotationItem[],
    discount_percent: 0,
    tax_percent: 16,
    notes: "",
    terms: "Cotação válida por 30 dias. Pagamento conforme plano acordado.",
    valid_until: "",
    training_request_id: "",
  });

  const fetchQuotations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotations")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setQuotations((data as unknown as Quotation[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchQuotations(); }, []);

  const calculateTotals = (items: QuotationItem[], discount: number, tax: number) => {
    const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const discountAmount = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (tax / 100);
    const total = afterDiscount + taxAmount;
    return { subtotal, total: Math.round(total * 100) / 100 };
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: string | number) => {
    setForm((prev) => {
      const items = [...prev.items];
      (items[index] as any)[field] = value;
      items[index].total = items[index].quantity * items[index].unit_price;
      return { ...prev, items };
    });
  };

  const addItem = () => setForm((p) => ({ ...p, items: [...p.items, { ...emptyItem }] }));
  const removeItem = (i: number) => setForm((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));

  const openFromRequest = (req: TrainingRequest) => {
    setEditingQuotation(null);
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    setForm({
      client_name: req.full_name,
      client_email: req.email,
      client_phone: req.phone,
      client_type: req.client_type,
      organization_name: req.organization_name || "",
      training_topic: req.training_topic,
      items: [{ description: `Formação: ${req.training_topic}${req.num_participants ? ` (${req.num_participants} participantes)` : ""}`, quantity: req.num_participants || 1, unit_price: 0, total: 0 }],
      discount_percent: 0,
      tax_percent: 16,
      notes: req.training_details || "",
      terms: "Cotação válida por 30 dias. Pagamento conforme plano acordado.",
      valid_until: validUntil.toISOString().split("T")[0],
      training_request_id: req.id,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingQuotation(null);
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    setForm({
      client_name: "", client_email: "", client_phone: "", client_type: "individual",
      organization_name: "", training_topic: "",
      items: [{ ...emptyItem }], discount_percent: 0, tax_percent: 16,
      notes: "", terms: "Cotação válida por 30 dias. Pagamento conforme plano acordado.",
      valid_until: validUntil.toISOString().split("T")[0], training_request_id: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (q: Quotation) => {
    setEditingQuotation(q);
    setForm({
      client_name: q.client_name, client_email: q.client_email, client_phone: q.client_phone,
      client_type: q.client_type, organization_name: q.organization_name || "",
      training_topic: q.training_topic, items: q.items || [{ ...emptyItem }],
      discount_percent: q.discount_percent, tax_percent: q.tax_percent,
      notes: q.notes || "", terms: q.terms || "",
      valid_until: q.valid_until || "", training_request_id: q.training_request_id || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.client_name.trim() || !form.training_topic.trim() || form.items.length === 0) {
      toast({ title: "Erro", description: "Preencha os campos obrigatórios.", variant: "destructive" });
      return;
    }

    const { subtotal, total } = calculateTotals(form.items, form.discount_percent, form.tax_percent);
    const itemsWithTotals = form.items.map((i) => ({ ...i, total: i.quantity * i.unit_price }));

    const payload = {
      client_name: form.client_name.trim(),
      client_email: form.client_email.trim(),
      client_phone: form.client_phone.trim(),
      client_type: form.client_type,
      organization_name: form.organization_name.trim() || null,
      training_topic: form.training_topic.trim(),
      items: itemsWithTotals,
      subtotal,
      discount_percent: form.discount_percent,
      tax_percent: form.tax_percent,
      total,
      notes: form.notes.trim() || null,
      terms: form.terms.trim() || null,
      valid_until: form.valid_until || null,
      training_request_id: form.training_request_id || null,
    };

    if (editingQuotation) {
      const { error } = await supabase.from("quotations").update(payload as any).eq("id", editingQuotation.id);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Cotação actualizada" });
    } else {
      const quotationNumber = `COT-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("quotations").insert({ ...payload, quotation_number: quotationNumber } as any);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Cotação criada" });
    }
    setDialogOpen(false);
    await fetchQuotations();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("quotations").update({ status } as any).eq("id", id);
    if (error) { toast({ title: "Erro", variant: "destructive" }); return; }
    toast({ title: `Estado: ${statusLabels[status]?.label || status}` });
    await fetchQuotations();
  };

  const deleteQuotation = async (id: string) => {
    const { error } = await supabase.from("quotations").delete().eq("id", id);
    if (error) { toast({ title: "Erro", variant: "destructive" }); return; }
    toast({ title: "Cotação eliminada" });
    await fetchQuotations();
  };

  const printQuotation = (q: Quotation) => {
    setPreviewQuotation(q);
    setPreviewOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const { subtotal: formSubtotal, total: formTotal } = calculateTotals(form.items, form.discount_percent, form.tax_percent);

  const filtered = quotations.filter((q) => {
    const s = search.toLowerCase();
    return q.client_name.toLowerCase().includes(s) || q.quotation_number.toLowerCase().includes(s) || q.training_topic.toLowerCase().includes(s);
  });

  if (loading) {
    return <div className="flex items-center justify-center py-16"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Cotações
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie cotações para pedidos de formação</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchQuotations}><RefreshCw className="w-4 h-4" /></Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Nova Cotação</Button>
        </div>
      </div>

      {/* Quick generate from requests */}
      {trainingRequests.filter((r) => r.status === "new" || r.status === "contacted").length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm font-heading font-semibold mb-2">Gerar cotação de pedido pendente:</p>
            <div className="flex flex-wrap gap-2">
              {trainingRequests
                .filter((r) => r.status === "new" || r.status === "contacted")
                .slice(0, 5)
                .map((r) => (
                  <Button key={r.id} variant="outline" size="sm" onClick={() => openFromRequest(r)} className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    {r.full_name} — {r.training_topic.substring(0, 30)}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Input placeholder="Pesquisar cotações..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      {/* List */}
      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Nenhuma cotação encontrada.</p>
        </CardContent></Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Tema</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono text-xs">{q.quotation_number}</TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{q.client_name}</p>
                      <p className="text-xs text-muted-foreground">{q.organization_name || q.client_type}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm max-w-[200px] truncate">{q.training_topic}</TableCell>
                    <TableCell className="font-heading font-bold text-sm">{formatCurrency(q.total)}</TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[q.status]?.variant || "outline"}>
                        {statusLabels[q.status]?.label || q.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => printQuotation(q)} title="Pré-visualizar"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(q)} title="Editar"><Pencil className="w-4 h-4" /></Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8" title="Copiar link de pagamento"
                          onClick={() => {
                            const url = `${window.location.origin}/cotacao/${q.id}`;
                            navigator.clipboard.writeText(url);
                            toast({ title: "Link de pagamento copiado!" });
                          }}
                        >
                          <Link2 className="w-4 h-4" />
                        </Button>
                        <Select value={q.status} onValueChange={(v) => updateStatus(q.id, v)}>
                          <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar cotação {q.quotation_number}?</AlertDialogTitle>
                              <AlertDialogDescription>Irreversível.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteQuotation(q.id)} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingQuotation ? "Editar Cotação" : "Nova Cotação"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Client info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Nome do Cliente *</Label>
                <Input value={form.client_name} onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))} className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs font-medium">Email</Label>
                <Input value={form.client_email} onChange={(e) => setForm((p) => ({ ...p, client_email: e.target.value }))} className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs font-medium">Telefone</Label>
                <Input value={form.client_phone} onChange={(e) => setForm((p) => ({ ...p, client_phone: e.target.value }))} className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs font-medium">Organização</Label>
                <Input value={form.organization_name} onChange={(e) => setForm((p) => ({ ...p, organization_name: e.target.value }))} className="mt-1 h-9" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs font-medium">Tema da Formação *</Label>
                <Input value={form.training_topic} onChange={(e) => setForm((p) => ({ ...p, training_topic: e.target.value }))} className="mt-1 h-9" />
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-heading font-semibold">Itens</Label>
                <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-3 h-3 mr-1" />Adicionar</Button>
              </div>
              <div className="space-y-2">
                {form.items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      {i === 0 && <Label className="text-[10px] text-muted-foreground">Descrição</Label>}
                      <Input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Descrição" className="h-9 text-sm" />
                    </div>
                    <div className="w-20">
                      {i === 0 && <Label className="text-[10px] text-muted-foreground">Qtd</Label>}
                      <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))} className="h-9 text-sm" />
                    </div>
                    <div className="w-28">
                      {i === 0 && <Label className="text-[10px] text-muted-foreground">Preço Unit.</Label>}
                      <Input type="number" min={0} value={item.unit_price} onChange={(e) => updateItem(i, "unit_price", Number(e.target.value))} className="h-9 text-sm" />
                    </div>
                    <div className="w-24 text-right">
                      {i === 0 && <Label className="text-[10px] text-muted-foreground">Total</Label>}
                      <p className="h-9 flex items-center justify-end text-sm font-heading font-semibold">{formatCurrency(item.quantity * item.unit_price)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeItem(i)} disabled={form.items.length === 1}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Desconto (%)</Label>
                <Input type="number" min={0} max={100} value={form.discount_percent} onChange={(e) => setForm((p) => ({ ...p, discount_percent: Number(e.target.value) }))} className="h-9" />
              </div>
              <div>
                <Label className="text-xs">IVA (%)</Label>
                <Input type="number" min={0} value={form.tax_percent} onChange={(e) => setForm((p) => ({ ...p, tax_percent: Number(e.target.value) }))} className="h-9" />
              </div>
              <div>
                <Label className="text-xs">Subtotal</Label>
                <p className="h-9 flex items-center font-heading font-semibold">{formatCurrency(formSubtotal)}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold">Total</Label>
                <p className="h-9 flex items-center font-heading font-bold text-lg text-primary">{formatCurrency(formTotal)}</p>
              </div>
            </div>

            {/* Notes and terms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Validade</Label>
                <Input type="date" value={form.valid_until} onChange={(e) => setForm((p) => ({ ...p, valid_until: e.target.value }))} className="mt-1 h-9" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Notas</Label>
              <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2} className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Termos e Condições</Label>
              <Textarea value={form.terms} onChange={(e) => setForm((p) => ({ ...p, terms: e.target.value }))} rows={2} className="mt-1 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}><Save className="w-4 h-4 mr-1" />{editingQuotation ? "Actualizar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview/Print Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto print:shadow-none">
          {previewQuotation && (
            <div className="space-y-4 print:text-black" id="quotation-print">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-2xl font-extrabold text-primary">ALINVEST</h2>
                  <p className="text-xs text-muted-foreground">Consultoria & Formação</p>
                </div>
                <div className="text-right">
                  <h3 className="font-heading text-lg font-bold">COTAÇÃO</h3>
                  <p className="font-mono text-sm">{previewQuotation.quotation_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(previewQuotation.created_at).toLocaleDateString("pt-PT")}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Cliente</p>
                  <p className="font-semibold">{previewQuotation.client_name}</p>
                  {previewQuotation.organization_name && <p>{previewQuotation.organization_name}</p>}
                  <p className="text-muted-foreground">{previewQuotation.client_email}</p>
                  <p className="text-muted-foreground">{previewQuotation.client_phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Detalhes</p>
                  <p><strong>Tema:</strong> {previewQuotation.training_topic}</p>
                  {previewQuotation.valid_until && (
                    <p><strong>Válida até:</strong> {new Date(previewQuotation.valid_until).toLocaleDateString("pt-PT")}</p>
                  )}
                  <Badge variant={statusLabels[previewQuotation.status]?.variant || "outline"} className="mt-1">
                    {statusLabels[previewQuotation.status]?.label || previewQuotation.status}
                  </Badge>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(previewQuotation.items || []).map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(item.quantity * item.unit_price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(previewQuotation.subtotal)}</span></div>
                  {previewQuotation.discount_percent > 0 && (
                    <div className="flex justify-between text-muted-foreground"><span>Desconto ({previewQuotation.discount_percent}%)</span><span>-{formatCurrency(previewQuotation.subtotal * previewQuotation.discount_percent / 100)}</span></div>
                  )}
                  {previewQuotation.tax_percent > 0 && (
                    <div className="flex justify-between text-muted-foreground"><span>IVA ({previewQuotation.tax_percent}%)</span><span>{formatCurrency((previewQuotation.subtotal - previewQuotation.subtotal * previewQuotation.discount_percent / 100) * previewQuotation.tax_percent / 100)}</span></div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-heading font-bold text-lg"><span>Total</span><span>{formatCurrency(previewQuotation.total)}</span></div>
                </div>
              </div>

              {previewQuotation.notes && (
                <div><p className="text-xs font-semibold mb-1">Notas:</p><p className="text-xs text-muted-foreground">{previewQuotation.notes}</p></div>
              )}
              {previewQuotation.terms && (
                <div><p className="text-xs font-semibold mb-1">Termos:</p><p className="text-xs text-muted-foreground">{previewQuotation.terms}</p></div>
              )}

              <div className="flex gap-2 print:hidden pt-2">
                <Button size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" />Imprimir</Button>
                <Button size="sm" variant="outline" onClick={() => setPreviewOpen(false)}>Fechar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
