import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Eye, Clock, FileText, Search, MessageCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatCurrency, getWhatsAppLink } from "@/lib/courses-data";

type EnrollmentStatus = "pending" | "approved" | "rejected";

interface MockEnrollment {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  courseName: string;
  paymentPlan: string;
  amountDue: number;
  status: EnrollmentStatus;
  submittedAt: string;
  proofFileName: string;
}

const MOCK_ENROLLMENTS: MockEnrollment[] = [
  { id: "INS-001", studentName: "Maria da Conceição", email: "maria@email.com", phone: "+258849001122", courseName: "ISO 9001 – Implementação", paymentPlan: "60% + 40%", amountDue: 15000, status: "pending", submittedAt: "2026-02-28", proofFileName: "comprovativo_maria.pdf" },
  { id: "INS-002", studentName: "Carlos Nhantumbo", email: "carlos@email.com", phone: "+258841234567", courseName: "Gestão de Projectos", paymentPlan: "100%", amountDue: 20000, status: "approved", submittedAt: "2026-02-26", proofFileName: "pagamento_carlos.jpg" },
  { id: "INS-003", studentName: "Ana Machel", email: "ana@email.com", phone: "+258852223344", courseName: "HSE Básico", paymentPlan: "100%", amountDue: 15000, status: "pending", submittedAt: "2026-02-27", proofFileName: "recibo_ana.png" },
  { id: "INS-004", studentName: "Jorge Sitoe", email: "jorge@email.com", phone: "+258843334455", courseName: "ISO 45001", paymentPlan: "60% + 20% + 20%", amountDue: 21000, status: "rejected", submittedAt: "2026-02-25", proofFileName: "prova_jorge.pdf" },
  { id: "INS-005", studentName: "Fátima Mondlane", email: "fatima@email.com", phone: "+258844556677", courseName: "Liderança Executiva", paymentPlan: "60% + 20% + 20%", amountDue: 24000, status: "pending", submittedAt: "2026-02-28", proofFileName: "comp_fatima.jpg" },
];

const statusConfig: Record<EnrollmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "outline" },
  approved: { label: "Aprovado", variant: "default" },
  rejected: { label: "Rejeitado", variant: "destructive" },
};

const Backoffice = () => {
  const [enrollments, setEnrollments] = useState(MOCK_ENROLLMENTS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = enrollments.filter((e) => {
    const matchesSearch = e.studentName.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && e.status === activeTab;
  });

  const updateStatus = (id: string, status: EnrollmentStatus) => {
    setEnrollments((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

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
          <h1 className="font-heading text-3xl font-extrabold mb-2">Backoffice</h1>
          <p className="text-muted-foreground mb-6">Gestão de inscrições e aprovação de pagamentos</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total", value: counts.all, color: "bg-primary text-primary-foreground" },
              { label: "Pendentes", value: counts.pending, color: "bg-warning/10 text-warning" },
              { label: "Aprovados", value: counts.approved, color: "bg-success/10 text-success" },
              { label: "Rejeitados", value: counts.rejected, color: "bg-destructive/10 text-destructive" },
            ].map((stat) => (
              <Card key={stat.label} className="border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-heading font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search & Tabs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Pesquisar por nome ou ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
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
                        <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Sem resultados</TableCell></TableRow>
                      ) : (
                        filtered.map((enrollment) => (
                          <TableRow key={enrollment.id}>
                            <TableCell className="font-mono text-xs">{enrollment.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{enrollment.studentName}</p>
                                <p className="text-xs text-muted-foreground">{enrollment.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm">{enrollment.courseName}</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm">{enrollment.paymentPlan}</TableCell>
                            <TableCell className="font-heading font-semibold text-sm">{formatCurrency(enrollment.amountDue)}</TableCell>
                            <TableCell>
                              <Badge variant={statusConfig[enrollment.status].variant}>
                                {statusConfig[enrollment.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {/* View proof */}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" title="Ver comprovativo">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Comprovativo — {enrollment.studentName}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                      <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
                                        <FileText className="w-8 h-8 text-muted-foreground" />
                                        <div>
                                          <p className="font-medium text-sm">{enrollment.proofFileName}</p>
                                          <p className="text-xs text-muted-foreground">Submetido em {enrollment.submittedAt}</p>
                                        </div>
                                      </div>
                                      <div className="bg-muted/50 rounded-lg h-48 flex items-center justify-center text-muted-foreground text-sm">
                                        Pré-visualização do ficheiro (requer backend)
                                      </div>
                                      <div className="flex gap-2">
                                        <Button variant="default" size="sm" onClick={() => updateStatus(enrollment.id, "approved")} className="flex-1">
                                          <Check className="w-4 h-4" /> Aprovar
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => updateStatus(enrollment.id, "rejected")} className="flex-1">
                                          <X className="w-4 h-4" /> Rejeitar
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                {/* Approve / Reject quick actions */}
                                {enrollment.status === "pending" && (
                                  <>
                                    <Button variant="ghost" size="icon" title="Aprovar" onClick={() => updateStatus(enrollment.id, "approved")}>
                                      <Check className="w-4 h-4 text-success" />
                                    </Button>
                                    <Button variant="ghost" size="icon" title="Rejeitar" onClick={() => updateStatus(enrollment.id, "rejected")}>
                                      <X className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </>
                                )}

                                {/* WhatsApp */}
                                <a href={getWhatsAppLink(`Olá ${enrollment.studentName}, referente à inscrição ${enrollment.id}...`)} target="_blank" rel="noopener noreferrer">
                                  <Button variant="ghost" size="icon" title="WhatsApp">
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
