import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
  AreaChart, Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter, TrendingUp, TrendingDown, Minus, Calendar, FileSpreadsheet, BarChart3, Users } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";
import { Enrollment, TrainingRequest, CourseRow, statusConfig } from "@/hooks/use-backoffice-data";
import { exportToCSV, enrollmentCSVColumns, trainingRequestCSVColumns } from "@/lib/csv-export";
import { formatCurrency } from "@/lib/courses-data";

interface Props {
  enrollments: Enrollment[];
  trainingRequests: TrainingRequest[];
  courses: CourseRow[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(220, 10%, 46%)",
  approved: "hsl(142, 71%, 45%)",
  rejected: "hsl(0, 84%, 60%)",
  partial: "hsl(38, 92%, 50%)",
};

const CHART_COLORS = [
  "hsl(220, 55%, 16%)", "hsl(350, 72%, 45%)", "hsl(38, 92%, 50%)",
  "hsl(142, 71%, 45%)", "hsl(262, 52%, 47%)", "hsl(196, 80%, 44%)",
  "hsl(28, 80%, 52%)", "hsl(312, 60%, 50%)",
];

type Period = "7d" | "30d" | "90d" | "365d" | "all" | "custom";

function isInPeriod(dateStr: string, period: Period, customFrom?: string, customTo?: string): boolean {
  const d = new Date(dateStr);
  if (period === "all") return true;
  if (period === "custom") {
    if (customFrom && d < new Date(customFrom)) return false;
    if (customTo && d > new Date(customTo + "T23:59:59")) return false;
    return true;
  }
  const days = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 }[period]!;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
}

function pctChange(current: number, previous: number): { value: number; direction: "up" | "down" | "flat" } {
  if (previous === 0) return { value: current > 0 ? 100 : 0, direction: current > 0 ? "up" : "flat" };
  const pct = ((current - previous) / previous) * 100;
  return { value: Math.abs(Math.round(pct)), direction: pct > 0 ? "up" : pct < 0 ? "down" : "flat" };
}

const periodLabels: Record<Period, string> = {
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
  "365d": "Último ano",
  all: "Todo o período",
  custom: "Personalizado",
};

export default function ReportsTab({ enrollments, trainingRequests, courses }: Props) {
  const [period, setPeriod] = useState<Period>("30d");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Filtered data
  const filtered = useMemo(() => {
    return enrollments.filter(e => {
      if (!isInPeriod(e.created_at, period, customFrom, customTo)) return false;
      if (courseFilter !== "all" && e.course_id !== courseFilter) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (sourceFilter !== "all" && e.source !== sourceFilter) return false;
      return true;
    });
  }, [enrollments, period, courseFilter, statusFilter, sourceFilter, customFrom, customTo]);

  const filteredRequests = useMemo(() => {
    return trainingRequests.filter(r => isInPeriod(r.created_at, period, customFrom, customTo));
  }, [trainingRequests, period, customFrom, customTo]);

  // Previous period for comparison
  const previousFiltered = useMemo(() => {
    if (period === "all" || period === "custom") return [];
    const days = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 }[period]!;
    const now = new Date();
    const periodStart = new Date(now); periodStart.setDate(now.getDate() - days);
    const prevStart = new Date(periodStart); prevStart.setDate(periodStart.getDate() - days);
    return enrollments.filter(e => {
      const d = new Date(e.created_at);
      return d >= prevStart && d < periodStart;
    });
  }, [enrollments, period]);

  // KPIs
  const kpis = useMemo(() => {
    const revenue = filtered.filter(e => e.status === "approved").reduce((s, e) => s + e.total_price, 0);
    const pendingRev = filtered.filter(e => e.status === "pending").reduce((s, e) => s + e.amount_due, 0);
    const prevRevenue = previousFiltered.filter(e => e.status === "approved").reduce((s, e) => s + e.total_price, 0);
    const avgTicket = filtered.length > 0 ? filtered.reduce((s, e) => s + e.total_price, 0) / filtered.length : 0;
    const conversionRate = filtered.length > 0 ? (filtered.filter(e => e.status === "approved").length / filtered.length) * 100 : 0;

    return {
      totalEnrollments: filtered.length,
      enrollmentChange: pctChange(filtered.length, previousFiltered.length),
      revenue,
      revenueChange: pctChange(revenue, prevRevenue),
      pendingRevenue: pendingRev,
      avgTicket,
      conversionRate: Math.round(conversionRate),
      trainingRequests: filteredRequests.length,
    };
  }, [filtered, previousFiltered, filteredRequests]);

  // Revenue over time (line chart)
  const revenueTimeline = useMemo(() => {
    const map: Record<string, { approved: number; pending: number; count: number }> = {};
    filtered.forEach(e => {
      const d = new Date(e.created_at);
      const key = period === "7d"
        ? d.toLocaleDateString("pt-MZ", { day: "2-digit", month: "short" })
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { approved: 0, pending: 0, count: 0 };
      map[key].count++;
      if (e.status === "approved") map[key].approved += e.total_price;
      if (e.status === "pending") map[key].pending += e.amount_due;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([name, data]) => ({
      name: period !== "7d" ? (() => { const [y, m] = name.split("-"); return new Date(+y, +m - 1).toLocaleDateString("pt-MZ", { month: "short", year: "2-digit" }); })() : name,
      Confirmada: data.approved,
      Pendente: data.pending,
      Inscrições: data.count,
    }));
  }, [filtered, period]);

  // By course
  const byCourse = useMemo(() => {
    const map: Record<string, { count: number; revenue: number; name: string }> = {};
    filtered.forEach(e => {
      if (!map[e.course_id]) map[e.course_id] = { count: 0, revenue: 0, name: e.course_name };
      map[e.course_id].count++;
      if (e.status === "approved") map[e.course_id].revenue += e.total_price;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 8).map(d => ({
      name: d.name.length > 30 ? d.name.slice(0, 30) + "…" : d.name,
      Inscrições: d.count,
      Receita: d.revenue,
    }));
  }, [filtered]);

  // By status
  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(e => { map[e.status] = (map[e.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // By source
  const bySource = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(e => { map[e.source] = (map[e.source] || 0) + 1; });
    const sourceLabels: Record<string, string> = {
      site: "Website", presencial: "Presencial", telefone: "Telefone",
      whatsapp: "WhatsApp", email: "Email", csv_import: "CSV", outro: "Outro",
    };
    return Object.entries(map).sort(([, a], [, b]) => b - a).map(([name, value]) => ({
      name: sourceLabels[name] || name, value,
    }));
  }, [filtered]);

  // By payment plan
  const byPlan = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(e => { map[e.payment_plan] = (map[e.payment_plan] || 0) + 1; });
    const planLabels: Record<string, string> = { full: "Total", "60-40": "60/40", "60-20-20": "60/20/20" };
    return Object.entries(map).map(([name, value]) => ({ name: planLabels[name] || name, value }));
  }, [filtered]);

  // Top enrolled students
  const topStudents = useMemo(() => {
    const map: Record<string, { name: string; count: number; total: number }> = {};
    filtered.forEach(e => {
      const key = e.email;
      if (!map[key]) map[key] = { name: e.full_name, count: 0, total: 0 };
      map[key].count++;
      map[key].total += e.total_price;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [filtered]);

  const statusLabels: Record<string, string> = { pending: "Pendente", approved: "Aprovado", rejected: "Rejeitado", partial: "Parcial" };

  const uniqueSources = [...new Set(enrollments.map(e => e.source))];

  const handleExportCSV = () => {
    exportToCSV(filtered, enrollmentCSVColumns, `relatorio-inscricoes-${period}`);
  };

  const handleExportTrainingCSV = () => {
    exportToCSV(filteredRequests, trainingRequestCSVColumns, `relatorio-formacoes-${period}`);
  };

  const TrendIcon = ({ change }: { change: { value: number; direction: "up" | "down" | "flat" } }) => {
    if (change.direction === "up") return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
    if (change.direction === "down") return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
    return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Filtros</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <Label className="text-xs">Período</Label>
              <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(periodLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Curso</Label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title.length > 30 ? c.title.slice(0, 30) + "…" : c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Origem</Label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {uniqueSources.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button size="sm" variant="outline" className="h-9 text-xs" onClick={handleExportCSV}>
                <Download className="w-3.5 h-3.5 mr-1" />Exportar CSV
              </Button>
            </div>
          </div>
          {period === "custom" && (
            <div className="grid grid-cols-2 gap-3 mt-3 max-w-sm">
              <div>
                <Label className="text-xs">De</Label>
                <Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="h-9 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Até</Label>
                <Input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="h-9 text-xs" />
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="text-[10px]">
              <Calendar className="w-3 h-3 mr-1" />
              {filtered.length} inscrições no período
            </Badge>
            {(courseFilter !== "all" || statusFilter !== "all" || sourceFilter !== "all") && (
              <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => { setCourseFilter("all"); setStatusFilter("all"); setSourceFilter("all"); }}>
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Receita Confirmada", value: formatCurrency(kpis.revenue), change: kpis.revenueChange },
          { label: "Receita Pendente", value: formatCurrency(kpis.pendingRevenue) },
          { label: "Inscrições", value: String(kpis.totalEnrollments), change: kpis.enrollmentChange },
          { label: "Taxa de Conversão", value: `${kpis.conversionRate}%` },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-xl font-heading font-bold text-foreground">{kpi.value}</p>
                {kpi.change && (
                  <div className="flex items-center gap-1">
                    <TrendIcon change={kpi.change} />
                    <span className={`text-[10px] font-medium ${kpi.change.direction === "up" ? "text-emerald-500" : kpi.change.direction === "down" ? "text-destructive" : "text-muted-foreground"}`}>
                      {kpi.change.value}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional KPIs row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Ticket Médio</p>
            <p className="text-xl font-heading font-bold text-foreground">{formatCurrency(kpis.avgTicket)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pedidos de Formação</p>
            <p className="text-xl font-heading font-bold text-foreground">{kpis.trainingRequests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Cursos Activos</p>
            <p className="text-xl font-heading font-bold text-foreground">{courses.filter(c => c.is_active).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Receita Total (Tudo)</p>
            <p className="text-xl font-heading font-bold text-foreground">
              {formatCurrency(enrollments.filter(e => e.status === "approved").reduce((s, e) => s + e.total_price, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <CollapsibleSection
        title="Gráficos de Análise"
        icon={<BarChart3 className="w-5 h-5 text-accent" />}
      >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue timeline */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Receita ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueTimeline.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Sem dados no período</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueTimeline}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="Confirmada" stackId="1" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="Pendente" stackId="1" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Enrollments over time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Inscrições por Período</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueTimeline.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueTimeline}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="Inscrições" fill="hsl(220, 55%, 16%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* By status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Distribuição por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            {byStatus.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                    label={({ name, value }) => `${statusLabels[name] || name}: ${value}`}>
                    {byStatus.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, statusLabels[String(name)] || name]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* By course revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Receita por Curso</CardTitle>
          </CardHeader>
          <CardContent>
            {byCourse.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={byCourse} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="Receita" fill="hsl(350, 72%, 45%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* By source */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Origem das Inscrições</CardTitle>
          </CardHeader>
          <CardContent>
            {bySource.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={bySource} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {bySource.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* By payment plan */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Planos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            {byPlan.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={byPlan}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Inscrições" fill="hsl(262, 52%, 47%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top students table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-heading">Top Estudantes por Receita</CardTitle>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={handleExportTrainingCSV}>
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />Exportar Formações
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">#</TableHead>
                  <TableHead className="text-xs">Nome</TableHead>
                  <TableHead className="text-xs">Inscrições</TableHead>
                  <TableHead className="text-xs">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topStudents.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">Sem dados</TableCell></TableRow>
                ) : topStudents.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium">{i + 1}</TableCell>
                    <TableCell className="text-sm font-medium">{s.name}</TableCell>
                    <TableCell className="text-sm">{s.count}</TableCell>
                    <TableCell className="text-sm font-semibold">{formatCurrency(s.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
