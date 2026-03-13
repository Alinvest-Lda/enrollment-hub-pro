import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type Course, type PaymentPlan } from "@/lib/courses-data";
import type { DBPaymentPlanInstallment } from "@/hooks/use-payment-plans";

interface DBPlanRow {
  id: string;
  name: string;
  description: string;
  installments: unknown;
  is_default: boolean;
  is_active: boolean;
  payment_plan_group: string;
}

function toCoursePlan(row: DBPlanRow): PaymentPlan & { group: string } {
  const installments = Array.isArray(row.installments)
    ? (row.installments as unknown as DBPaymentPlanInstallment[])
    : [];
  return {
    id: row.id,
    label: row.name,
    description: row.description,
    group: row.payment_plan_group ?? "all",
    installments: installments.map((inst) => ({
      percentage: inst.percent,
      dueDescription: inst.days_offset === 0 ? "Na inscrição" : `Em ${inst.days_offset} dias`,
    })),
  };
}

export function useCourses() {
  return useQuery({
    queryKey: ["public-courses"],
    queryFn: async (): Promise<Course[]> => {
      const [coursesResult, plansResult] = await Promise.all([
        supabase
          .from("courses")
          .select("*")
          .eq("is_active", true)
          .order("start_date", { ascending: true }),
        supabase
          .from("payment_plans")
          .select("*")
          .eq("is_active", true)
          .order("is_default", { ascending: false }),
      ]);

      if (coursesResult.error) throw coursesResult.error;
      if (plansResult.error) throw plansResult.error;

      const allPlans = (plansResult.data ?? []).map((row) => toCoursePlan(row as unknown as DBPlanRow));

      return (coursesResult.data ?? []).map((c) => {
        const courseGroup = c.payment_plan_group || "2-weeks";
        // Filter: plans matching the course group OR universal plans ("all")
        const filteredPlans = allPlans
          .filter((p) => p.group === "all" || p.group === courseGroup)
          .map(({ group, ...plan }) => plan);

        return {
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
          paymentPlans: filteredPlans,
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCourse(slug: string | undefined) {
  const { data: courses, isLoading, error } = useCourses();
  const course = courses?.find((c) => c.id === slug);
  return { course, isLoading, error };
}
