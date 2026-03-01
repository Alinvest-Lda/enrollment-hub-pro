import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Eye, Clock, FileText, Search, MessageCircle, LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatCurrency, getWhatsAppLink } from "@/lib/courses-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type PaymentStatus = "pending" | "approved" | "rejected" | "partial";

interface Enrollment {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string | null;
  course_name: string;
  payment_plan: string;
  amount_due: number;
  total_price: number;
  status: PaymentStatus;
  created_at: string;
  admin_notes: string | null;
}

interface PaymentProof {
  id: string;
  enrollment_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

const statusConfig: Record<PaymentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "outline" },
  approved: { label: "Aprovado", variant: "default" },
  rejected: { label: "Rejeitado", variant: "destructive" },
  partial: { label: "Parcial", variant: "secondary" },
};

const Backoffice = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [proofs, setProofs] = useState<Record<string, PaymentProof[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchEnrollments();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin");
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      await supabase.auth.signOut();
      navigate("/admin");
    }
  };

  const fetchEnrollments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      toast({ title: "Erro", description: "Não foi possível carregar as inscrições.", variant: "destructive" });
    } else {
      setEnrollments((data as Enrollment[]) || []);
    }
    setLoading(false);
  };

  const fetchProofs = async (enrollmentId: string) => {
    if (proofs[enrollmentId]) return;
    const { data } = await supabase
      .from("payment_proofs")
      .select("*")
      .eq("enrollment_id", enrollmentId);
    if (data) {
      setProofs((prev) => ({ ...prev, [enrollmentId]: data as PaymentProof[] }));
    }
  };

  const updateStatus = async (id: string, status: PaymentStatus) => {
    const { error } = await supabase
      .from("enrollments")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível actualizar.", variant: "destructive" });
    } else {
      setEnrollments((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
      toast({ title: "Actualizado", description: `Estado alterado para ${statusConfig[status].label}.` });
    }
  };

  const getProofUrl = async (filePath: string) => {
    const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(filePath, 300);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const filtered = enrollments.filter((e) => {
    const matchesSearch = e.full_name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && e.status === activeTab;
  });

  const counts = {
    all: enrollments.length,
    pending: enrollments.filter((e) => e.status === "pending").length,
    approved: enrollments.filter((e) => e.status === "approved").length,
    rejected: enrollments.filter((e) => e.status === "rejected").length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-3xl font-extrabold">Backoffice</h1>
              <p className="text-muted-foreground">Gestão de inscrições e aprovação de pagamentos</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Sair
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total", value: counts.all },
              { label: "Pendentes", value: counts.pending },
              { label: "Aprovados", value: counts.approved },
              { label: "Rejeitados", value: counts.rejected },
            ].map((stat) => (
              <Card key={stat.label} className="border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-heading font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar por nome ou ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos ({counts.all})</TabsTrigger>
              <TabsTrigger value="pending">Pendentes ({counts.pending})</TabsTrigger>
              <TabsTrigger value="approved">Aprovados ({counts.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejeitados ({counts.rejected})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <Card>
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Aluno</TableHead>
                          <TableHead className="hidden md:table-cell">Curso</TableHead>
                          <TableHead className="hidden sm:table-cell">Plano</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acções</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sem resultados</TableCell></TableRow>
                        ) : (
                          filtered.map((enrollment) => (
                            <TableRow key={enrollment.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{enrollment.full_name}</p>
                                  <p className="text-xs text-muted-foreground">{enrollment.phone}</p>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm">{enrollment.course_name}</TableCell>
                              <TableCell className="hidden sm:table-cell text-sm">{enrollment.payment_plan}</TableCell>
                              <TableCell className="font-heading font-semibold text-sm">{formatCurrency(enrollment.amount_due)}</TableCell>
                              <TableCell>
                                <Badge variant={statusConfig[enrollment.status].variant}>
                                  {statusConfig[enrollment.status].label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="icon" title="Ver detalhes" onClick={() => fetchProofs(enrollment.id)}>
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                      <DialogHeader>
                                        <DialogTitle>{enrollment.full_name}</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-3 text-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                          <div><span className="text-muted-foreground">Email:</span> {enrollment.email}</div>
                                          <div><span className="text-muted-foreground">Telefone:</span> {enrollment.phone}</div>
                                          <div><span className="text-muted-foreground">Empresa:</span> {enrollment.company || "—"}</div>
                                          <div><span className="text-muted-foreground">Curso:</span> {enrollment.course_name}</div>
                                          <div><span className="text-muted-foreground">Plano:</span> {enrollment.payment_plan}</div>
                                          <div><span className="text-muted-foreground">Valor:</span> {formatCurrency(enrollment.amount_due)} / {formatCurrency(enrollment.total_price)}</div>
                                        </div>

                                        <div>
                                          <p className="font-heading font-semibold mb-2">Comprovativos</p>
                                          {(proofs[enrollment.id] || []).length === 0 ? (
                                            <p className="text-muted-foreground text-xs">Nenhum comprovativo encontrado</p>
                                          ) : (
                                            (proofs[enrollment.id] || []).map((proof) => (
                                              <div key={proof.id} className="flex items-center gap-2 bg-muted rounded p-2 mb-1">
                                                <FileText className="w-4 h-4 shrink-0" />
                                                <span className="text-xs flex-1 truncate">{proof.file_name}</span>
                                                <Button variant="ghost" size="sm" onClick={() => getProofUrl(proof.file_path)}>
                                                  <Eye className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            ))
                                          )}
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                          <Button size="sm" onClick={() => updateStatus(enrollment.id, "approved")} className="flex-1">
                                            <Check className="w-4 h-4" /> Aprovar
                                          </Button>
                                          <Button variant="destructive" size="sm" onClick={() => updateStatus(enrollment.id, "rejected")} className="flex-1">
                                            <X className="w-4 h-4" /> Rejeitar
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  {enrollment.status === "pending" && (
                                    <>
                                      <Button variant="ghost" size="icon" onClick={() => updateStatus(enrollment.id, "approved")}>
                                        <Check className="w-4 h-4 text-success" />
                                      </Button>
                                      <Button variant="ghost" size="icon" onClick={() => updateStatus(enrollment.id, "rejected")}>
                                        <X className="w-4 h-4 text-destructive" />
                                      </Button>
                                    </>
                                  )}

                                  <a href={getWhatsAppLink(`Olá ${enrollment.full_name}, referente à sua inscrição no curso ${enrollment.course_name}...`)} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="icon">
                                      <MessageCircle className="w-4 h-4" />
                                    </Button>
                                  </a>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Backoffice;
