import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Enrollment, TrainingRequest } from "@/hooks/use-backoffice-data";
import { formatCurrency } from "@/lib/courses-data";

interface Props {
  enrollments: Enrollment[];
  trainingRequests: TrainingRequest[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(220, 10%, 46%)",
  approved: "hsl(142, 71%, 45%)",
  rejected: "hsl(0, 84%, 60%)",
  partial: "hsl(38, 92%, 50%)",
};

const CHART_COLORS = ["hsl(220, 55%, 16%)", "hsl(350, 72%, 45%)", "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)", "hsl(262, 52%, 47%)", "hsl(196, 80%, 44%)"];

export default function DashboardTab({ enrollments, trainingRequests }: Props) {
  const stats = useMemo(() => {
    const totalRevenue = enrollments
      .filter((e) => e.status === "approved")
      .reduce((sum, e) => sum + e.total_price, 0);

    const pendingRevenue = enrollments
      .filter((e) => e.status === "pending")
      .reduce((sum, e) => sum + e.amount_due, 0);

    // Enrollments by month
    const byMonth: Record<string, number> = {};
    enrollments.forEach((e) => {
      const d = new Date(e.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    });
    const monthlyData = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => {
        const [y, m] = month.split("-");
        const label = new Date(+y, +m - 1).toLocaleDateString("pt-MZ", { month: "short", year: "2-digit" });
        return { name: label, inscrições: count };
      });

    // By course
    const byCourse: Record<string, number> = {};
    enrollments.forEach((e) => {
      byCourse[e.course_name] = (byCourse[e.course_name] || 0) + 1;
    });
    const courseData = Object.entries(byCourse)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value]) => ({ name: name.length > 25 ? name.slice(0, 25) + "…" : name, value }));

    // Status distribution
    const statusData = Object.entries(
      enrollments.reduce<Record<string, number>>((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const statusLabels: Record<string, string> = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado",
      partial: "Parcial",
    };

    return { totalRevenue, pendingRevenue, monthlyData, courseData, statusData, statusLabels };
  }, [enrollments]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Receita Confirmada</p>
            <p className="text-xl font-heading font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Receita Pendente</p>
            <p className="text-xl font-heading font-bold text-foreground">{formatCurrency(stats.pendingRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Inscrições</p>
            <p className="text-xl font-heading font-bold text-foreground">{enrollments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pedidos Formação</p>
            <p className="text-xl font-heading font-bold text-foreground">{trainingRequests.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly enrollments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Inscrições por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.monthlyData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.monthlyData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="inscrições" fill="hsl(220, 55%, 16%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* By course */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Cursos Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.courseData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.courseData} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(350, 72%, 45%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Distribuição por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.statusData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={stats.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${stats.statusLabels[name] || name}: ${value}`}>
                    {stats.statusData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, stats.statusLabels[String(name)] || name]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
