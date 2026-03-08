import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type PaymentStatus = "pending" | "approved" | "rejected" | "partial";
export type EnrollmentSource = "site" | "presencial" | "telefone" | "whatsapp" | "email" | "csv_import" | "outro";

export interface Enrollment {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string | null;
  course_name: string;
  course_id: string;
  payment_plan: string;
  amount_due: number;
  total_price: number;
  status: PaymentStatus;
  created_at: string;
  admin_notes: string | null;
  nuit: string | null;
  message: string | null;
  source: EnrollmentSource;
  payment_method: string | null;
}

export interface PaymentProof {
  id: string;
  enrollment_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

export interface CourseRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  duration_weeks: number;
  price: number;
  currency: string;
  start_date: string | null;
  image: string;
  highlights: string[];
  payment_plan_group: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const statusConfig: Record<PaymentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "outline" },
  approved: { label: "Aprovado", variant: "default" },
  rejected: { label: "Rejeitado", variant: "destructive" },
  partial: { label: "Parcial", variant: "secondary" },
};

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

export function useBackofficeData() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [trainingRequests, setTrainingRequests] = useState<TrainingRequest[]>([]);
  const [proofs, setProofs] = useState<Record<string, PaymentProof[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = async () => {
    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro", description: "Não foi possível carregar as inscrições.", variant: "destructive" });
    } else {
      setEnrollments((data as Enrollment[]) || []);
    }
  };

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os cursos.", variant: "destructive" });
    } else {
      setCourses((data as CourseRow[]) || []);
    }
  };

  const fetchTrainingRequests = async () => {
    const { data, error } = await supabase
      .from("training_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os pedidos.", variant: "destructive" });
    } else {
      setTrainingRequests((data as TrainingRequest[]) || []);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchEnrollments(), fetchCourses(), fetchTrainingRequests()]);
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

  const updateEnrollmentStatus = async (id: string, status: PaymentStatus) => {
    const { error } = await supabase.from("enrollments").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível actualizar.", variant: "destructive" });
    } else {
      setEnrollments((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
      toast({ title: "Actualizado", description: `Estado alterado para ${statusConfig[status].label}.` });

      // Send WhatsApp notification on approval
      if (status === "approved") {
        const enrollment = enrollments.find((e) => e.id === id);
        if (enrollment) {
          sendWhatsAppNotification(enrollment, status).catch((err) =>
            console.error("WhatsApp notification error:", err)
          );
        }
      }
    }
  };

  const sendWhatsAppNotification = async (enrollment: Enrollment, status: PaymentStatus) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) return;

      const message = status === "approved"
        ? `Olá ${enrollment.full_name}! 🎉\n\nA sua inscrição no curso *${enrollment.course_name}* foi *confirmada* com sucesso!\n\nValor: ${enrollment.amount_due} MZN\nRef: ${enrollment.id.substring(0, 8).toUpperCase()}\n\nObrigado por escolher a ALINVEST Academy! Entraremos em contacto com mais detalhes sobre o início do curso.`
        : `Olá ${enrollment.full_name},\n\nEstado da sua inscrição no curso ${enrollment.course_name}: ${statusConfig[status].label}.\n\nRef: ${enrollment.id.substring(0, 8).toUpperCase()}`;

      const { data, error } = await supabase.functions.invoke("whatsapp-send", {
        body: {
          to: enrollment.phone,
          textMessage: message,
        },
      });

      if (error) throw error;
      if (data?.success) {
        toast({ title: "WhatsApp enviado", description: `Mensagem enviada para ${enrollment.full_name}.` });
      } else {
        toast({ title: "WhatsApp", description: data?.error || "Não foi possível enviar.", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("WhatsApp send error:", err);
      toast({ title: "WhatsApp", description: "Falha ao enviar notificação. Verifique as configurações.", variant: "destructive" });
    }
  };

  const updateEnrollmentNotes = async (id: string, notes: string) => {
    const { error } = await supabase.from("enrollments").update({ admin_notes: notes }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível guardar notas.", variant: "destructive" });
    } else {
      setEnrollments((prev) => prev.map((e) => (e.id === id ? { ...e, admin_notes: notes } : e)));
      toast({ title: "Notas guardadas" });
    }
  };

  const deleteEnrollment = async (id: string) => {
    const { error } = await supabase.from("enrollments").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível eliminar.", variant: "destructive" });
    } else {
      setEnrollments((prev) => prev.filter((e) => e.id !== id));
      toast({ title: "Inscrição eliminada" });
    }
  };

  const saveCourse = async (course: Partial<CourseRow> & { slug: string; title: string }) => {
    if (course.id) {
      const { id, created_at, updated_at, ...rest } = course as CourseRow;
      const { error } = await supabase.from("courses").update(rest).eq("id", id);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return false;
      }
      await fetchCourses();
      toast({ title: "Curso actualizado" });
      return true;
    } else {
      const { id, created_at, updated_at, ...rest } = course as any;
      const { error } = await supabase.from("courses").insert(rest);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return false;
      }
      await fetchCourses();
      toast({ title: "Curso criado" });
      return true;
    }
  };

  const deleteCourse = async (id: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Curso eliminado" });
    }
  };

  const toggleCourseActive = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from("courses").update({ is_active }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, is_active } : c)));
      toast({ title: is_active ? "Curso activado" : "Curso desactivado" });
    }
  };

  const updateTrainingRequestStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("training_requests").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível actualizar.", variant: "destructive" });
    } else {
      setTrainingRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast({ title: "Estado actualizado" });
    }
  };

  const updateTrainingRequestNotes = async (id: string, notes: string) => {
    const { error } = await supabase.from("training_requests").update({ admin_notes: notes }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível guardar notas.", variant: "destructive" });
    } else {
      setTrainingRequests((prev) => prev.map((r) => (r.id === id ? { ...r, admin_notes: notes } : r)));
      toast({ title: "Notas guardadas" });
    }
  };

  const deleteTrainingRequest = async (id: string) => {
    const { error } = await supabase.from("training_requests").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível eliminar.", variant: "destructive" });
    } else {
      setTrainingRequests((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Pedido eliminado" });
    }
  };

  const getProofUrl = async (filePath: string) => {
    const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(filePath, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const createManualEnrollment = async (enrollment: {
    full_name: string; email: string; phone: string; company?: string; nuit?: string;
    course_id: string; course_name: string; payment_plan: string;
    amount_due: number; total_price: number; source: EnrollmentSource;
    payment_method?: string; message?: string; admin_notes?: string;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from("enrollments").insert({
      full_name: enrollment.full_name,
      email: enrollment.email,
      phone: enrollment.phone,
      company: enrollment.company || null,
      nuit: enrollment.nuit || null,
      message: enrollment.message || null,
      admin_notes: enrollment.admin_notes || null,
      course_id: enrollment.course_id,
      course_name: enrollment.course_name,
      payment_plan: enrollment.payment_plan as "full" | "60-40" | "60-20-20",
      amount_due: enrollment.amount_due,
      total_price: enrollment.total_price,
      status: "pending" as const,
    } as any);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchEnrollments();
    toast({ title: "Inscrição criada manualmente" });
    return true;
  };

  const bulkImportEnrollments = async (rows: Array<{
    full_name: string; email: string; phone: string; company?: string;
    course_id: string; course_name: string; payment_plan: string;
    amount_due: number; total_price: number; payment_method?: string;
  }>) => {
    const records = rows.map((r) => ({
      full_name: r.full_name,
      email: r.email,
      phone: r.phone,
      company: r.company || null,
      course_id: r.course_id,
      course_name: r.course_name,
      payment_plan: (r.payment_plan || "full") as "full" | "60-40" | "60-20-20",
      amount_due: r.amount_due,
      total_price: r.total_price,
      status: "pending" as const,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from("enrollments").insert(records as any);
    if (error) {
      toast({ title: "Erro na importação", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchEnrollments();
    toast({ title: "Importação concluída", description: `${records.length} inscrições importadas.` });
    return true;
  };

  useEffect(() => { fetchAll(); }, []);

  return {
    enrollments, courses, trainingRequests, proofs, loading,
    fetchProofs, updateEnrollmentStatus, updateEnrollmentNotes, deleteEnrollment,
    saveCourse, deleteCourse, toggleCourseActive, getProofUrl,
    updateTrainingRequestStatus, updateTrainingRequestNotes, deleteTrainingRequest,
    createManualEnrollment, bulkImportEnrollments,
    refetch: fetchAll,
  };
}
