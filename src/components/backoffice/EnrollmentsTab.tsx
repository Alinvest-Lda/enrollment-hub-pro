import { useState, useMemo } from "react";
import { Check, X, Eye, FileText, MessageCircle, Search, Trash2, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Enrollment, PaymentProof, PaymentStatus, statusConfig } from "@/hooks/use-backoffice-data";
import { formatCurrency, getWhatsAppLink } from "@/lib/courses-data";
import { exportToCSV, enrollmentCSVColumns } from "@/lib/csv-export";

interface Props {
  enrollments: Enrollment[];
  proofs: Record<string, PaymentProof[]>;
  fetchProofs: (id: string) => void;
  updateStatus: (id: string, status: PaymentStatus) => void;
  updateNotes: (id: string, notes: string) => void;
  deleteEnrollment: (id: string) => void;
  getProofUrl: (path: string) => void;
}

export default function EnrollmentsTab({ enrollments, proofs, fetchProofs, updateStatus, updateNotes, deleteEnrollment, getProofUrl }: Props) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [courseFilter, setCourseFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const courseNames = useMemo(() => {
    const names = [...new Set(enrollments.map((e) => e.course_name))];
    return names.sort();
  }, [enrollments]);

  const filtered = useMemo(() => {
    return enrollments.filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch = e.full_name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
      const matchesStatus = activeTab === "all" || e.status === activeTab;
      const matchesCourse = courseFilter === "all" || e.course_name === courseFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const d = new Date(e.created_at);
        const now = new Date();
        if (dateFilter === "7d") matchesDate = now.getTime() - d.getTime() < 7 * 86400000;
        else if (dateFilter === "30d") matchesDate = now.getTime() - d.getTime() < 30 * 86400000;
        else if (dateFilter === "90d") matchesDate = now.getTime() - d.getTime() < 90 * 86400000;
      }

      return matchesSearch && matchesStatus && matchesCourse && matchesDate;
    });
  }, [enrollments, search, activeTab, courseFilter, dateFilter]);

  const counts = {
    all: enrollments.length,
    pending: enrollments.filter((e) => e.status === "pending").length,
    approved: enrollments.filter((e) => e.status === "approved").length,
    rejected: enrollments.filter((e) => e.status === "rejected").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar por nome, email ou ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} title="Filtros">
          <Filter className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => exportToCSV(filtered, enrollmentCSVColumns, `inscricoes-${new Date().toISOString().slice(0, 10)}`)} title="Exportar CSV">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 p-3 bg-muted rounded-lg">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[200px] bg-background"><SelectValue placeholder="Todos os cursos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cursos</SelectItem>
              {courseNames.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[160px] bg-background"><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          {(courseFilter !== "all" || dateFilter !== "all") && (
            <Button variant="ghost" size="sm" onClick={() => { setCourseFilter("all"); setDateFilter("all"); }}>
              Limpar filtros
            </Button>
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
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
                          <p className="font-medium text-sm">{enrollment.full_name}</p>
                          <p className="text-xs text-muted-foreground">{enrollment.phone}</p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{enrollment.course_name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{enrollment.payment_plan}</TableCell>
                        <TableCell className="font-heading font-semibold text-sm">{formatCurrency(enrollment.amount_due)}</TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[enrollment.status].variant}>{statusConfig[enrollment.status].label}</Badge>
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
                                <DialogHeader><DialogTitle>{enrollment.full_name}</DialogTitle></DialogHeader>
                                <div className="space-y-3 text-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div><span className="text-muted-foreground">Email:</span> {enrollment.email}</div>
                                    <div><span className="text-muted-foreground">Telefone:</span> {enrollment.phone}</div>
                                    <div><span className="text-muted-foreground">Empresa:</span> {enrollment.company || "—"}</div>
                                    <div><span className="text-muted-foreground">NUIT:</span> {enrollment.nuit || "—"}</div>
                                    <div><span className="text-muted-foreground">Curso:</span> {enrollment.course_name}</div>
                                    <div><span className="text-muted-foreground">Plano:</span> {enrollment.payment_plan}</div>
                                    <div className="col-span-2"><span className="text-muted-foreground">Valor:</span> {formatCurrency(enrollment.amount_due)} / {formatCurrency(enrollment.total_price)}</div>
                                    </div>

                                  {enrollment.message && (
                                    <div>
                                      <p className="font-heading font-semibold mb-1">Mensagem do Inscrito</p>
                                      <p className="whitespace-pre-wrap text-muted-foreground bg-muted rounded p-2 text-xs">{enrollment.message}</p>
                                    </div>
                                  )}

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

                                  <div>
                                    <p className="font-heading font-semibold mb-1">Notas do Admin</p>
                                    <Textarea
                                      value={noteDraft[enrollment.id] ?? enrollment.admin_notes ?? ""}
                                      onChange={(e) => setNoteDraft((prev) => ({ ...prev, [enrollment.id]: e.target.value }))}
                                      placeholder="Adicionar notas..."
                                      rows={2}
                                    />
                                    <Button size="sm" variant="outline" className="mt-1" onClick={() => updateNotes(enrollment.id, noteDraft[enrollment.id] ?? enrollment.admin_notes ?? "")}>
                                      Guardar Notas
                                    </Button>
                                  </div>

                                  <div className="flex gap-2 pt-2">
                                    <Button size="sm" onClick={() => updateStatus(enrollment.id, "approved")} className="flex-1">
                                      <Check className="w-4 h-4" /> Aprovar
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => updateStatus(enrollment.id, "partial")} className="flex-1">
                                      Parcial
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
                                <Button variant="ghost" size="icon" onClick={() => updateStatus(enrollment.id, "approved")}><Check className="w-4 h-4 text-success" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => updateStatus(enrollment.id, "rejected")}><X className="w-4 h-4 text-destructive" /></Button>
                              </>
                            )}

                            <a href={getWhatsAppLink(`Olá ${enrollment.full_name}, referente à sua inscrição no curso ${enrollment.course_name}...`)} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon"><MessageCircle className="w-4 h-4" /></Button>
                            </a>

                            <Button variant="ghost" size="icon" onClick={() => { if (confirm("Eliminar esta inscrição?")) deleteEnrollment(enrollment.id); }}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
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
    </div>
  );
}
