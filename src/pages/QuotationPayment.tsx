import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Check, Clock, AlertCircle, X, Banknote, ArrowLeft, Upload, Smartphone, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/courses-data";
import { toast } from "@/hooks/use-toast";
import MpesaPaymentStep from "@/components/enrollment/MpesaPaymentStep";
import logo from "@/assets/logo.png";

interface QuotationItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface QuotationInfo {
  id: string;
  quotation_number: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  training_topic: string;
  items: QuotationItem[];
  subtotal: number;
  discount_percent: number;
  tax_percent: number;
  total: number;
  currency: string;
  payment_plan: string;
  payment_status: string;
  status: string;
  valid_until: string | null;
}

export default function QuotationPayment() {
  const { quotationId } = useParams<{ quotationId: string }>();
  const [quotation, setQuotation] = useState<QuotationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"select" | "mpesa" | "upload">("select");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!quotationId) return;
    const fetch = async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("quotations")
        .select("*")
        .eq("id", quotationId)
        .maybeSingle();
      if (err || !data) {
        setError(true);
      } else {
        setQuotation(data as unknown as QuotationInfo);
      }
      setLoading(false);
    };
    fetch();
  }, [quotationId]);

  const handleUpload = async (file: File) => {
    if (!quotationId) return;
    setUploading(true);
    const filePath = `quotation-${quotationId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    await supabase.from("payment_proofs").insert({
      enrollment_id: quotationId,
      file_path: filePath,
      file_name: file.name,
      file_type: file.type,
      installment_number: 1,
    } as any);

    toast({ title: "Comprovativo enviado com sucesso!" });
    setUploading(false);
    setPaymentMode("select");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-7 rounded" />
              <div>
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </main>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="font-heading text-xl font-bold mb-2">Cotação não encontrada</h2>
            <p className="text-muted-foreground text-sm mb-6">Verifique o link ou contacte a administração.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/">
                <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Voltar ao site</Button>
              </Link>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Button variant="whatsapp"><MessageCircle className="w-4 h-4 mr-2" />Precisa de ajuda?</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = quotation.payment_status === "paid";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ALINVEST" className="h-7" />
            <div>
              <h1 className="font-heading text-sm font-bold">Pagamento de Cotação</h1>
              <p className="text-[10px] text-muted-foreground font-mono">{quotation.quotation_number}</p>
            </div>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Site</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Client & Quotation Summary */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading font-bold text-lg">{quotation.client_name}</p>
                <p className="text-sm text-muted-foreground">{quotation.training_topic}</p>
              </div>
              <Badge variant={isPaid ? "default" : "outline"}>
                {isPaid ? "Pago" : quotation.status === "accepted" ? "Aceite" : quotation.status}
              </Badge>
            </div>

            <Separator />

            {/* Items */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Itens da Cotação:</p>
              {(quotation.items || []).map((item, i) => (
                <div key={i} className="flex justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">Qtd: {item.quantity} × {formatCurrency(item.unit_price)}</p>
                  </div>
                  <p className="font-heading font-semibold">{formatCurrency(item.quantity * item.unit_price)}</p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(quotation.subtotal)}</span>
              </div>
              {quotation.discount_percent > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Desconto ({quotation.discount_percent}%)</span>
                  <span>-{formatCurrency(quotation.subtotal * quotation.discount_percent / 100)}</span>
                </div>
              )}
              {quotation.tax_percent > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA ({quotation.tax_percent}%)</span>
                  <span>{formatCurrency((quotation.subtotal - quotation.subtotal * quotation.discount_percent / 100) * quotation.tax_percent / 100)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-heading font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(quotation.total)}</span>
              </div>
            </div>

            {quotation.valid_until && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Válida até: {new Date(quotation.valid_until).toLocaleDateString("pt-PT")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payment Section */}
        {!isPaid && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="font-heading font-semibold flex items-center gap-2">
                <Banknote className="w-5 h-5 text-primary" />
                Efectuar Pagamento
              </h2>

              {paymentMode === "select" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setPaymentMode("mpesa")}
                  >
                    <Smartphone className="w-6 h-6 text-primary" />
                    <span className="font-heading font-semibold">Pagar com M-Pesa</span>
                    <span className="text-[10px] text-muted-foreground">Pagamento instantâneo via telemóvel</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setPaymentMode("upload")}
                  >
                    <Upload className="w-6 h-6 text-primary" />
                    <span className="font-heading font-semibold">Enviar Comprovativo</span>
                    <span className="text-[10px] text-muted-foreground">Transferência, e-Mola ou depósito</span>
                  </Button>
                </div>
              )}

              {paymentMode === "mpesa" && (
                <div className="space-y-3">
                  <MpesaPaymentStep
                    enrollmentId={quotation.id}
                    phone={quotation.client_phone}
                    amount={quotation.total}
                    reference={quotation.quotation_number}
                    onSuccess={() => {
                      toast({ title: "Pagamento confirmado!" });
                      setPaymentMode("select");
                    }}
                    onError={(err) => toast({ title: "Erro", description: err, variant: "destructive" })}
                  />
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setPaymentMode("select")}>
                    ← Voltar às opções
                  </Button>
                </div>
              )}

              {paymentMode === "upload" && (
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                    <p className="font-semibold">Dados para transferência:</p>
                    <p className="text-muted-foreground text-xs">
                      Após efectuar o pagamento, carregue o comprovativo abaixo para validação.
                    </p>
                  </div>
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                        e.target.value = "";
                      }}
                    />
                    <Button size="lg" variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "A enviar..." : "Carregar Comprovativo"}
                      </span>
                    </Button>
                  </label>
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setPaymentMode("select")}>
                    ← Voltar às opções
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isPaid && (
          <Card className="border-green-500/30">
            <CardContent className="p-6 text-center">
              <Check className="w-12 h-12 mx-auto text-green-600 mb-3" />
              <h3 className="font-heading text-lg font-bold text-green-600">Pagamento Confirmado</h3>
              <p className="text-sm text-muted-foreground mt-1">O pagamento desta cotação foi registado com sucesso.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
