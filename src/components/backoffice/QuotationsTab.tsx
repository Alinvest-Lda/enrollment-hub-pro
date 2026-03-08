import { useState, useEffect } from "react";
import {
  Plus, Trash2, Pencil, Save, X, RefreshCw, FileText,
  Send, Copy, Eye, Printer, DollarSign, Percent, Calendar, Link2,
  Download, Mail, MessageCircle,
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
import { downloadQuotationPDF, getQuotationWhatsAppMessage, getQuotationEmailSubject, getQuotationEmailBody } from "@/lib/quotation-pdf";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { QRCodeSVG } from "qrcode.react";

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
  created_at: string;
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
  const { data: sysSettings } = useSystemSettings();

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

  // Realtime sync for quotations
  useEffect(() => {
    const channel = supabase
      .channel("quotations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quotations" },
        () => { fetchQuotations(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

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

  const getBankDetails = () => ({
    bankName: sysSettings?.bankName || "",
    bankAccountName: sysSettings?.bankAccountName || "",
    bankAccountNumber: sysSettings?.bankAccountNumber || "",
    bankNIB: sysSettings?.bankNIB || "",
    emolaNumber: sysSettings?.emolaNumber || "",
    emolaName: sysSettings?.emolaName || "",
  });

  const handleDownloadPDF = async (q: Quotation) => {
    await downloadQuotationPDF(q as any, getBankDetails());
    toast({ title: "PDF descarregado!" });
  };

  const getPaymentUrl = (q: Quotation) => `${window.location.origin}/cotacao/${q.id}`;

  const handleShareWhatsApp = (q: Quotation) => {
    const paymentUrl = getPaymentUrl(q);
    const msg = getQuotationWhatsAppMessage(q as any, paymentUrl);
    const url = `https://wa.me/${q.client_phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const handleShareEmail = (q: Quotation) => {
    const paymentUrl = getPaymentUrl(q);
    const subject = getQuotationEmailSubject(q);
    const body = getQuotationEmailBody(q as any, paymentUrl);
    const mailto = `mailto:${encodeURIComponent(q.client_email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_blank");
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
          <p className="text-sm text-muted-foreground mt-1">Crie cotações a partir dos pedidos de formação recebidos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchQuotations}><RefreshCw className="w-4 h-4" /></Button>
          <Button size="sm" variant="outline" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Cotação Manual</Button>
        </div>
      </div>

      {/* Primary: Training Requests as source */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            Pedidos de Formação Pendentes
          </CardTitle>
          <p className="text-xs text-muted-foreground">Selecione um pedido para gerar uma cotação com os dados pré-preenchidos</p>
        </CardHeader>
        <CardContent>
          {trainingRequests.filter(r => r.status === "new" || r.status === "contacted").length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sem pedidos pendentes de cotação.</p>
              <p className="text-xs mt-1">Novos pedidos aparecerão aqui automaticamente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Cliente</TableHead>
                    <TableHead className="text-xs">Tipo</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Tema</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Participantes</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Orçamento</TableHead>
                    <TableHead className="text-xs">Data</TableHead>
                    <TableHead className="text-xs">Acção</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainingRequests
                    .filter(r => r.status === "new" || r.status === "contacted")
                    .map(r => {
                      const hasQuotation = quotations.some(q => q.training_request_id === r.id);
                      return (
                        <TableRow key={r.id} className={hasQuotation ? "opacity-50" : ""}>
                          <TableCell>
                            <p className="text-sm font-medium">{r.full_name}</p>
                            <p className="text-[10px] text-muted-foreground">{r.email}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{r.client_type}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm max-w-[200px] truncate">{r.training_topic}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{r.num_participants || "—"}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{r.budget_range || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at || "").toLocaleDateString("pt-PT")}</TableCell>
                          <TableCell>
                            {hasQuotation ? (
                              <Badge variant="secondary" className="text-[10px]">Cotação criada</Badge>
                            ) : (
                              <Button size="sm" className="h-7 text-xs" onClick={() => openFromRequest(r)}>
                                <FileText className="w-3 h-3 mr-1" />Gerar Cotação
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search existing quotations */}
      <Separator />
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold">Cotações Existentes ({quotations.length})</h3>
        <Input placeholder="Pesquisar cotações..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs h-9" />
      </div>

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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadPDF(q)} title="Download PDF"><Download className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => handleShareWhatsApp(q)} title="Enviar por WhatsApp"><MessageCircle className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShareEmail(q)} title="Enviar por Email"><Mail className="w-4 h-4" /></Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8" title="Copiar link de pagamento"
                          onClick={() => {
                            const url = getPaymentUrl(q);
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

      {/* Preview/Print Dialog - Document Style */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto p-0 print:shadow-none">
          {previewQuotation && (
            <div className="flex flex-col">
              {/* Action bar */}
              <div className="flex flex-wrap gap-2 p-4 border-b bg-muted/30 print:hidden">
                <Button size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" />Imprimir</Button>
                <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(previewQuotation)}><Download className="w-4 h-4 mr-1" />PDF</Button>
                <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => handleShareWhatsApp(previewQuotation)}><MessageCircle className="w-4 h-4 mr-1" />WhatsApp</Button>
                <Button size="sm" variant="outline" onClick={() => handleShareEmail(previewQuotation)}><Mail className="w-4 h-4 mr-1" />Email</Button>
                <div className="ml-auto">
                  <Badge variant={statusLabels[previewQuotation.status]?.variant || "outline"} className="text-xs">
                    {statusLabels[previewQuotation.status]?.label || previewQuotation.status}
                  </Badge>
                </div>
              </div>

              {/* Document Preview */}
              <div className="mx-auto w-full max-w-[210mm] bg-white text-black shadow-lg my-4 print:my-0 print:shadow-none" style={{ minHeight: "297mm", padding: "20mm 18mm" }}>
                {/* Header with logo */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <img src="/assets/logo.png" alt="ALINVEST" className="h-8 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <p className="text-[9px] text-gray-500 tracking-wider mt-1">Consultoria & Formação</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold tracking-tight text-gray-900">COTAÇÃO</h3>
                    <p className="font-mono text-sm text-gray-600 mt-0.5">{previewQuotation.quotation_number}</p>
                    <p className="text-xs text-gray-400 mt-1">Data: {new Date(previewQuotation.created_at).toLocaleDateString("pt-PT")}</p>
                    {previewQuotation.valid_until && (
                      <p className="text-xs text-gray-400">Válida até: {new Date(previewQuotation.valid_until).toLocaleDateString("pt-PT")}</p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gray-200 mb-6" />

                {/* Client + Training topic */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">CLIENTE</p>
                    <p className="font-semibold text-gray-900">{previewQuotation.client_name}</p>
                    {previewQuotation.organization_name && <p className="text-sm text-gray-600">{previewQuotation.organization_name}</p>}
                    {previewQuotation.client_email && <p className="text-sm text-gray-500">{previewQuotation.client_email}</p>}
                    {previewQuotation.client_phone && <p className="text-sm text-gray-500">{previewQuotation.client_phone}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">TEMA DA FORMAÇÃO</p>
                    <p className="font-semibold text-gray-900">{previewQuotation.training_topic}</p>
                  </div>
                </div>

                {/* Items table */}
                <table className="w-full mb-6 text-sm">
                  <thead>
                    <tr className="bg-[#0a2463] text-white">
                      <th className="text-left py-2.5 px-3 font-semibold text-xs">Descrição</th>
                      <th className="text-center py-2.5 px-3 font-semibold text-xs w-16">Qtd</th>
                      <th className="text-right py-2.5 px-3 font-semibold text-xs w-28">Preço Unit.</th>
                      <th className="text-right py-2.5 px-3 font-semibold text-xs w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(previewQuotation.items || []).map((item, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="py-2.5 px-3 text-gray-800">{item.description}</td>
                        <td className="py-2.5 px-3 text-center text-gray-600">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-gray-800">{formatCurrency(item.quantity * item.unit_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                  <div className="w-72 space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-600 px-3">
                      <span>Subtotal</span>
                      <span>{formatCurrency(previewQuotation.subtotal)}</span>
                    </div>
                    {previewQuotation.discount_percent > 0 && (
                      <div className="flex justify-between text-gray-500 px-3">
                        <span>Desconto ({previewQuotation.discount_percent}%)</span>
                        <span>-{formatCurrency(previewQuotation.subtotal * previewQuotation.discount_percent / 100)}</span>
                      </div>
                    )}
                    {previewQuotation.tax_percent > 0 && (
                      <div className="flex justify-between text-gray-500 px-3">
                        <span>IVA ({previewQuotation.tax_percent}%)</span>
                        <span>{formatCurrency((previewQuotation.subtotal - previewQuotation.subtotal * previewQuotation.discount_percent / 100) * previewQuotation.tax_percent / 100)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-2 mt-1 px-3">
                      <div className="flex justify-between font-bold text-lg text-[#0a2463]">
                        <span>Total</span>
                        <span>{formatCurrency(previewQuotation.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {previewQuotation.notes && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-700 mb-1">Notas:</p>
                    <p className="text-xs text-gray-500 whitespace-pre-wrap">{previewQuotation.notes}</p>
                  </div>
                )}

                {/* Terms */}
                {previewQuotation.terms && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-700 mb-1">Termos e Condições:</p>
                    <p className="text-xs text-gray-500 whitespace-pre-wrap">{previewQuotation.terms}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-auto pt-12 border-t border-gray-200 text-center">
                  <p className="text-[10px] text-gray-400">ALINVEST — Consultoria & Formação</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
