import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Check, Clock, AlertCircle, X, Banknote, ArrowLeft, Upload, FileText, Eye, Smartphone, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/courses-data";
import { toast } from "@/hooks/use-toast";
import MpesaPaymentStep from "@/components/enrollment/MpesaPaymentStep";

interface Installment {
  id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: string;
  paid_date: string | null;
  payment_method: string | null;
}

interface EnrollmentInfo {
  id: string;
  full_name: string;
  course_name: string;
  total_price: number;
  amount_due: number;
  payment_plan: string;
  status: string;
  phone: string;
}

const statusLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendente", color: "text-yellow-600", icon: Clock },
  paid: { label: "Pago", color: "text-green-600", icon: Check },
  overdue: { label: "Atrasado", color: "text-red-600", icon: AlertCircle },
  cancelled: { label: "Cancelado", color: "text-muted-foreground", icon: X },
};

export default function StudentPayments() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const [enrollment, setEnrollment] = useState<EnrollmentInfo | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [payingInstallment, setPayingInstallment] = useState<number | null>(null);

  useEffect(() => {
    if (!enrollmentId) return;

    const fetchData = async () => {
      setLoading(true);
      // Use edge function to fetch public enrollment data
      const { data: fn, error: fnErr } = await supabase.functions.invoke("public-enrollment-data", {
        body: { enrollment_id: enrollmentId },
      });

      if (fnErr || !fn?.enrollment) {
        setError(true);
        setLoading(false);
        return;
      }

      setEnrollment(fn.enrollment);
      setInstallments(fn.installments || []);
      setLoading(false);
    };

    fetchData();
  }, [enrollmentId]);

  const handleUpload = async (installmentNumber: number, file: File) => {
    if (!enrollmentId) return;
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

    if (!dbError) {
      toast({ title: "Comprovativo enviado com sucesso!" });
    }
    setUploading(null);
  };

  const totalPaid = installments.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = installments.filter((i) => i.status !== "paid" && i.status !== "cancelled").reduce((s, i) => s + Number(i.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </main>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="font-heading text-xl font-bold mb-2">Inscrição não encontrada</h2>
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-lg font-bold">Resumo de Pagamentos</h1>
            <p className="text-xs text-muted-foreground">ALINVEST</p>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Site</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Student info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading font-bold text-lg">{enrollment.full_name}</p>
                <p className="text-sm text-muted-foreground">{enrollment.course_name}</p>
              </div>
              <Badge variant="outline">{enrollment.payment_plan}</Badge>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-heading font-bold">{formatCurrency(enrollment.total_price)}</p>
              </div>
              <div className="bg-green-500/5 rounded-lg p-3">
                <p className="text-xs text-green-600">Pago</p>
                <p className="font-heading font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="bg-yellow-500/5 rounded-lg p-3">
                <p className="text-xs text-yellow-600">Pendente</p>
                <p className="font-heading font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installments */}
        <div className="space-y-3">
          <h2 className="font-heading font-semibold flex items-center gap-2">
            <Banknote className="w-5 h-5 text-primary" />
            Prestações
          </h2>

          {installments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Nenhuma prestação registada ainda.
              </CardContent>
            </Card>
          ) : (
            installments.map((inst) => {
              const statusInfo = statusLabels[inst.status] || statusLabels.pending;
              const StatusIcon = statusInfo.icon;
              const isOverdue = inst.status === "pending" && new Date(inst.due_date) < new Date();

              return (
                <Card key={inst.id} className={isOverdue ? "border-destructive/30" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          inst.status === "paid" ? "bg-green-500/10 text-green-600" : isOverdue ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground"
                        }`}>
                          {inst.installment_number}
                        </div>
                        <div>
                          <p className="font-heading font-semibold">Prestação {inst.installment_number}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Vence: {new Date(inst.due_date).toLocaleDateString("pt-PT")}
                            {isOverdue && <span className="text-destructive font-medium ml-1">(atrasado)</span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-heading font-bold">{formatCurrency(Number(inst.amount))}</p>
                        <Badge variant="outline" className={`text-[10px] ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>

                    {inst.paid_date && (
                      <p className="text-xs text-green-600 mt-1">
                        Pago em: {new Date(inst.paid_date).toLocaleDateString("pt-PT")}
                        {inst.payment_method && ` · ${inst.payment_method}`}
                      </p>
                    )}

                    {inst.status !== "paid" && inst.status !== "cancelled" && (
                      <div className="mt-3 pt-3 border-t border-border space-y-3">
                        {payingInstallment === inst.installment_number ? (
                          <div className="space-y-2">
                            <MpesaPaymentStep
                              enrollmentId={enrollmentId!}
                              phone={enrollment.phone || ""}
                              amount={Number(inst.amount)}
                              reference={`INST-${inst.installment_number}`}
                              onSuccess={() => {
                                toast({ title: "Pagamento confirmado!" });
                                setPayingInstallment(null);
                                // Refresh data
                                supabase.functions.invoke("public-enrollment-data", {
                                  body: { enrollment_id: enrollmentId },
                                }).then(({ data: fn }) => {
                                  if (fn) setInstallments(fn.installments || []);
                                });
                              }}
                              onError={(err) => toast({ title: "Erro", description: err, variant: "destructive" })}
                            />
                            <Button size="sm" variant="ghost" className="text-xs w-full" onClick={() => setPayingInstallment(null)}>
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="default" className="text-xs" onClick={() => setPayingInstallment(inst.installment_number)}>
                              <Smartphone className="w-3.5 h-3.5 mr-1" />
                              Pagar com M-Pesa
                            </Button>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUpload(inst.installment_number, file);
                                  e.target.value = "";
                                }}
                              />
                              <Button size="sm" variant="outline" className="text-xs" asChild>
                                <span>
                                  <Upload className="w-3.5 h-3.5 mr-1" />
                                  {uploading === inst.installment_number ? "A enviar..." : "Enviar Comprovativo"}
                                </span>
                              </Button>
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
