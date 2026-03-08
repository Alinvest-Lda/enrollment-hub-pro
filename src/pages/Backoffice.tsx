import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LogOut, Loader2, BookOpen, Users, RefreshCw, GraduationCap,
  BarChart3, Settings, Bell, UserPlus, FileSpreadsheet,
  ChevronLeft, ChevronRight, Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import EnrollmentsTab from "@/components/backoffice/EnrollmentsTab";
import CoursesTab from "@/components/backoffice/CoursesTab";
import TrainingRequestsTab from "@/components/backoffice/TrainingRequestsTab";
import DashboardTab from "@/components/backoffice/DashboardTab";
import ManualEnrollmentForm from "@/components/backoffice/ManualEnrollmentForm";
import CSVImportDialog from "@/components/backoffice/CSVImportDialog";
import SettingsTab from "@/components/backoffice/SettingsTab";
import { useBackofficeData } from "@/hooks/use-backoffice-data";
import RealtimeNotifications from "@/components/backoffice/RealtimeNotifications";
import { supabase } from "@/integrations/supabase/client";

type Section = "dashboard" | "enrollments" | "courses" | "training" | "whatsapp" | "settings";

const navItems: { id: Section; label: string; icon: React.ElementType; shortLabel: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, shortLabel: "Dash" },
  { id: "enrollments", label: "Inscrições", icon: Users, shortLabel: "Inscr." },
  { id: "courses", label: "Cursos", icon: BookOpen, shortLabel: "Cursos" },
  { id: "training", label: "Formações", icon: GraduationCap, shortLabel: "Form." },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, shortLabel: "WhatsApp" },
  { id: "settings", label: "Configurações", icon: Settings, shortLabel: "Config." },
];

const Backoffice = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const data = useBackofficeData();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin"); return; }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");
      if (!roles || roles.length === 0) {
        await supabase.auth.signOut();
        navigate("/admin");
      }
    })();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const enrollmentCounts = {
    total: data.enrollments.length,
    pending: data.enrollments.filter((e) => e.status === "pending").length,
    approved: data.enrollments.filter((e) => e.status === "approved").length,
  };

  const sectionTitle: Record<Section, string> = {
    dashboard: "Dashboard",
    enrollments: "Inscrições",
    courses: "Cursos",
    training: "Pedidos de Formação",
    whatsapp: "Templates WhatsApp",
    settings: "Configurações",
  };

  const handleNavClick = (id: Section) => {
    setSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar — Desktop */}
      <aside
        className={`hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 sticky top-0 h-screen ${
          sidebarCollapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-extrabold tracking-tight text-sidebar-foreground">
                ALINVEST
              </span>
              <Badge variant="outline" className="text-[9px] border-sidebar-border text-sidebar-foreground/60">
                Admin
              </Badge>
            </div>
          ) : (
            <span className="font-heading text-lg font-extrabold text-sidebar-primary mx-auto">A</span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = section === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
                {!sidebarCollapsed && <span>{item.label}</span>}
                {!sidebarCollapsed && item.id === "enrollments" && enrollmentCounts.pending > 0 && (
                  <Badge className="ml-auto text-[10px] h-5 px-1.5 bg-sidebar-primary text-sidebar-primary-foreground">
                    {enrollmentCounts.pending}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-sidebar text-sidebar-foreground shadow-xl flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
              <span className="font-heading text-lg font-extrabold">ALINVEST</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-sidebar-accent">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = section === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    <span>{item.label}</span>
                    {item.id === "enrollments" && enrollmentCounts.pending > 0 && (
                      <Badge className="ml-auto text-[10px] h-5 px-1.5 bg-sidebar-primary text-sidebar-primary-foreground">
                        {enrollmentCounts.pending}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-sidebar-border">
              <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-sidebar-foreground/70">
                <LogOut className="w-4 h-4 mr-2" /> Terminar Sessão
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-heading text-lg font-bold leading-tight">{sectionTitle[section]}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {section === "dashboard" && `${enrollmentCounts.total} inscrições · ${data.courses.length} cursos`}
                {section === "enrollments" && `${enrollmentCounts.pending} pendentes de ${enrollmentCounts.total}`}
                {section === "courses" && `${data.courses.length} cursos registados`}
                {section === "training" && `${data.trainingRequests.length} pedidos`}
                {section === "settings" && "Gerencie a plataforma"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {section === "enrollments" && (
              <>
                <ManualEnrollmentForm courses={data.courses} onSubmit={data.createManualEnrollment} />
                <CSVImportDialog courses={data.courses} onImport={data.bulkImportEnrollments} />
              </>
            )}
            <RealtimeNotifications />
            <Button variant="ghost" size="icon" onClick={data.refetch} title="Actualizar dados" className="hidden sm:flex">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 hidden md:block" />
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Terminar Sessão" className="hidden md:flex">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Stats bar — only on dashboard */}
        {section === "dashboard" && !data.loading && (
          <div className="border-b border-border bg-card/40 px-4 md:px-6 py-3">
            <div className="flex gap-6 overflow-x-auto">
              {[
                { label: "Total", value: enrollmentCounts.total, color: "text-foreground" },
                { label: "Pendentes", value: enrollmentCounts.pending, color: "text-warning" },
                { label: "Aprovados", value: enrollmentCounts.approved, color: "text-success" },
                { label: "Cursos", value: data.courses.length, color: "text-primary" },
                { label: "Formações", value: data.trainingRequests.length, color: "text-accent" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2 shrink-0">
                  <span className={`text-xl font-heading font-bold ${stat.color}`}>{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {data.loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              {section === "dashboard" && (
                <DashboardTab enrollments={data.enrollments} trainingRequests={data.trainingRequests} />
              )}
              {section === "enrollments" && (
                <EnrollmentsTab
                  enrollments={data.enrollments}
                  proofs={data.proofs}
                  fetchProofs={data.fetchProofs}
                  updateStatus={data.updateEnrollmentStatus}
                  updateNotes={data.updateEnrollmentNotes}
                  deleteEnrollment={data.deleteEnrollment}
                  getProofUrl={data.getProofUrl}
                />
              )}
              {section === "courses" && (
                <CoursesTab
                  courses={data.courses}
                  saveCourse={data.saveCourse}
                  deleteCourse={data.deleteCourse}
                  toggleCourseActive={data.toggleCourseActive}
                />
              )}
              {section === "training" && (
                <TrainingRequestsTab
                  requests={data.trainingRequests}
                  updateStatus={data.updateTrainingRequestStatus}
                  updateNotes={data.updateTrainingRequestNotes}
                  deleteRequest={data.deleteTrainingRequest}
                />
              )}
              {section === "settings" && <SettingsTab />}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Backoffice;
