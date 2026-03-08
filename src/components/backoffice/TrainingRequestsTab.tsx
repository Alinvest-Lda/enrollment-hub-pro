import { useState, useEffect } from "react";
import { Eye, Search, MessageCircle, Trash2, Check, X, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSystemSettings, getWhatsAppLinkFromNumber } from "@/hooks/use-system-settings";
import { exportToCSV, trainingRequestCSVColumns } from "@/lib/csv-export";
import { supabase } from "@/integrations/supabase/client";

export interface TrainingRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  client_type: "individual" | "empresa" | "ong" | "estado";
  organization_name: string | null;
  organization_sector: string | null;
  training_topic: string;
  training_details: string | null;
  num_participants: number | null;
  preferred_start: string | null;
  budget_range: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "Novo", variant: "outline" },
  contacted: { label: "Contactado", variant: "secondary" },
  approved: { label: "Aprovado", variant: "default" },
  rejected: { label: "Rejeitado", variant: "destructive" },
};

const clientTypeLabels: Record<string, string> = {
  individual: "Individual",
  empresa: "Empresa",
  ong: "ONG",
  estado: "Estado",
};

interface Props {
  requests: TrainingRequest[];
  updateStatus: (id: string, status: string) => void;
  updateNotes: (id: string, notes: string) => void;
  deleteRequest: (id: string) => void;
}

export default function TrainingRequestsTab({ requests, updateStatus, updateNotes, deleteRequest }: Props) {
  const { data: settings } = useSystemSettings();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = r.full_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.training_topic.toLowerCase().includes(q);
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && r.status === activeTab;
  });

  const counts = {
    all: requests.length,
    new: requests.filter((r) => r.status === "new").length,
    contacted: requests.filter((r) => r.status === "contacted").length,
    approved: requests.filter((r) => r.status === "approved").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar por nome, email ou tema..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline" size="icon" onClick={() => exportToCSV(filtered, trainingRequestCSVColumns, `pedidos-formacao-${new Date().toISOString().slice(0, 10)}`)} title="Exportar CSV">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos ({counts.all})</TabsTrigger>
          <TabsTrigger value="new">Novos ({counts.new})</TabsTrigger>
          <TabsTrigger value="contacted">Contactados ({counts.contacted})</TabsTrigger>
          <TabsTrigger value="approved">Aprovados ({counts.approved})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Solicitante</TableHead>
                    <TableHead className="hidden md:table-cell">Tema</TableHead>
                    <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sem resultados</TableCell></TableRow>
                  ) : (
                    filtered.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <p className="font-medium text-sm">{req.full_name}</p>
                          <p className="text-xs text-muted-foreground">{req.phone}</p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm max-w-[200px] truncate">{req.training_topic}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{clientTypeLabels[req.client_type] || req.client_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={(statusConfig[req.status] || statusConfig.new).variant}>
                            {(statusConfig[req.status] || statusConfig.new).label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Ver detalhes">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader><DialogTitle>{req.full_name}</DialogTitle></DialogHeader>
                                <div className="space-y-3 text-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div><span className="text-muted-foreground">Email:</span> {req.email}</div>
                                    <div><span className="text-muted-foreground">Telefone:</span> {req.phone}</div>
                                    <div><span className="text-muted-foreground">Tipo:</span> {clientTypeLabels[req.client_type]}</div>
                                    {req.organization_name && <div><span className="text-muted-foreground">Organização:</span> {req.organization_name}</div>}
                                    {req.organization_sector && <div><span className="text-muted-foreground">Sector:</span> {req.organization_sector}</div>}
                                    {req.num_participants && <div><span className="text-muted-foreground">Participantes:</span> {req.num_participants}</div>}
                                    {req.preferred_start && <div><span className="text-muted-foreground">Início preferido:</span> {req.preferred_start}</div>}
                                    {req.budget_range && <div><span className="text-muted-foreground">Orçamento:</span> {req.budget_range}</div>}
                                  </div>

                                  <div>
                                    <p className="font-heading font-semibold mb-1">Tema</p>
                                    <p>{req.training_topic}</p>
                                  </div>

                                  {req.training_details && (
                                    <div>
                                      <p className="font-heading font-semibold mb-1">Detalhes</p>
                                      <p className="whitespace-pre-wrap">{req.training_details}</p>
                                    </div>
                                  )}

                                  <div>
                                    <p className="font-heading font-semibold mb-1">Notas do Admin</p>
                                    <Textarea
                                      value={noteDraft[req.id] ?? req.admin_notes ?? ""}
                                      onChange={(e) => setNoteDraft((prev) => ({ ...prev, [req.id]: e.target.value }))}
                                      placeholder="Adicionar notas..."
                                      rows={2}
                                    />
                                    <Button size="sm" variant="outline" className="mt-1" onClick={() => updateNotes(req.id, noteDraft[req.id] ?? req.admin_notes ?? "")}>
                                      Guardar Notas
                                    </Button>
                                  </div>

                                  <div className="flex gap-2 pt-2">
                                    <Button size="sm" onClick={() => updateStatus(req.id, "contacted")} className="flex-1" variant="secondary">
                                      <MessageCircle className="w-4 h-4" /> Contactado
                                    </Button>
                                    <Button size="sm" onClick={() => updateStatus(req.id, "approved")} className="flex-1">
                                      <Check className="w-4 h-4" /> Aprovar
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => updateStatus(req.id, "rejected")} className="flex-1">
                                      <X className="w-4 h-4" /> Rejeitar
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <a href={getWhatsAppLinkFromNumber(settings?.whatsappNumber || "", `Olá ${req.full_name}, referente ao seu pedido de formação em "${req.training_topic}"...`)} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon"><MessageCircle className="w-4 h-4" /></Button>
                            </a>

                            <Button variant="ghost" size="icon" onClick={() => { if (confirm("Eliminar este pedido?")) deleteRequest(req.id); }}>
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
