import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, Loader2, BookOpen, Users, RefreshCw, GraduationCap, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnrollmentsTab from "@/components/backoffice/EnrollmentsTab";
import CoursesTab from "@/components/backoffice/CoursesTab";
import TrainingRequestsTab from "@/components/backoffice/TrainingRequestsTab";
import DashboardTab from "@/components/backoffice/DashboardTab";
import { useBackofficeData } from "@/hooks/use-backoffice-data";
import { supabase } from "@/integrations/supabase/client";

const Backoffice = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState("dashboard");
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
    rejected: data.enrollments.filter((e) => e.status === "rejected").length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-3xl font-extrabold">Backoffice</h1>
              <p className="text-muted-foreground">Gestão completa do sistema</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={data.refetch}><RefreshCw className="w-4 h-4 mr-1" /> Actualizar</Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" /> Sair</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Inscrições", value: enrollmentCounts.total },
              { label: "Pendentes", value: enrollmentCounts.pending },
              { label: "Aprovados", value: enrollmentCounts.approved },
              { label: "Rejeitados", value: enrollmentCounts.rejected },
              { label: "Cursos", value: data.courses.length },
              { label: "Pedidos Form.", value: data.trainingRequests.length },
            ].map((stat) => (
              <Card key={stat.label} className="border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-heading font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {data.loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs value={section} onValueChange={setSection}>
              <TabsList className="mb-4">
                <TabsTrigger value="dashboard"><BarChart3 className="w-4 h-4 mr-1" /> Dashboard</TabsTrigger>
                <TabsTrigger value="enrollments"><Users className="w-4 h-4 mr-1" /> Inscrições</TabsTrigger>
                <TabsTrigger value="courses"><BookOpen className="w-4 h-4 mr-1" /> Cursos</TabsTrigger>
                <TabsTrigger value="training"><GraduationCap className="w-4 h-4 mr-1" /> Formações</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <DashboardTab enrollments={data.enrollments} trainingRequests={data.trainingRequests} />
              </TabsContent>

              <TabsContent value="enrollments">
                <EnrollmentsTab
                  enrollments={data.enrollments}
                  proofs={data.proofs}
                  fetchProofs={data.fetchProofs}
                  updateStatus={data.updateEnrollmentStatus}
                  updateNotes={data.updateEnrollmentNotes}
                  deleteEnrollment={data.deleteEnrollment}
                  getProofUrl={data.getProofUrl}
                />
              </TabsContent>

              <TabsContent value="courses">
                <CoursesTab
                  courses={data.courses}
                  saveCourse={data.saveCourse}
                  deleteCourse={data.deleteCourse}
                  toggleCourseActive={data.toggleCourseActive}
                />
              </TabsContent>

              <TabsContent value="training">
                <TrainingRequestsTab
                  requests={data.trainingRequests}
                  updateStatus={data.updateTrainingRequestStatus}
                  updateNotes={data.updateTrainingRequestNotes}
                  deleteRequest={data.deleteTrainingRequest}
                />
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Backoffice;
