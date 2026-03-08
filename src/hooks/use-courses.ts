import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type Course, type PaymentPlan } from "@/lib/courses-data";
import type { DBPaymentPlanInstallment } from "@/hooks/use-payment-plans";

/** Fetch active payment plans and convert to Course-compatible format */
async function fetchActivePlans(): Promise<PaymentPlan[]> {
  const { data, error } = await supabase
    .from("payment_plans")
    .select("*")
    .eq("is_active", true)
    .order("is_default", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const installments = Array.isArray(row.installments)
      ? (row.installments as unknown as DBPaymentPlanInstallment[])
      : [];
    return {
      id: row.id,
      label: row.name,
      description: row.description,
      installments: installments.map((inst) => ({
        percentage: inst.percent,
        dueDescription: inst.days_offset === 0 ? "Na inscrição" : `Em ${inst.days_offset} dias`,
      })),
    };
  });
}

export function useCourses() {
  return useQuery({
    queryKey: ["public-courses"],
    queryFn: async (): Promise<Course[]> => {
      // Fetch courses and payment plans in parallel
      const [coursesResult, plans] = await Promise.all([
        supabase
          .from("courses")
          .select("*")
          .eq("is_active", true)
          .order("start_date", { ascending: true }),
        fetchActivePlans(),
      ]);

      if (coursesResult.error) throw coursesResult.error;

      return (coursesResult.data ?? []).map((c) => ({
        id: c.slug,
        title: c.title,
        category: c.category,
        description: c.description,
        duration: c.duration,
        durationWeeks: c.duration_weeks,
        price: Number(c.price),
        currency: c.currency,
        startDate: c.start_date ?? "",
        image: c.image,
        highlights: c.highlights,
        paymentPlans: plans,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCourse(slug: string | undefined) {
  const { data: courses, isLoading, error } = useCourses();
  const course = courses?.find((c) => c.id === slug);
  return { course, isLoading, error };
}
