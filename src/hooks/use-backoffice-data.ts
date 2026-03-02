import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type PaymentStatus = "pending" | "approved" | "rejected" | "partial";

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

export function useBackofficeData() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
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

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchEnrollments(), fetchCourses()]);
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

  const getProofUrl = async (filePath: string) => {
    const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(filePath, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  useEffect(() => { fetchAll(); }, []);

  return {
    enrollments, courses, proofs, loading,
    fetchProofs, updateEnrollmentStatus, updateEnrollmentNotes, deleteEnrollment,
    saveCourse, deleteCourse, toggleCourseActive, getProofUrl, refetch: fetchAll,
  };
}
