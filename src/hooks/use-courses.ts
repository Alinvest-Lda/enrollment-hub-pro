import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_PLANS, type Course } from "@/lib/courses-data";

export function useCourses() {
  return useQuery({
    queryKey: ["public-courses"],
    queryFn: async (): Promise<Course[]> => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: true });

      if (error) throw error;

      return (data ?? []).map((c) => ({
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
        paymentPlans: PAYMENT_PLANS[c.payment_plan_group] ?? PAYMENT_PLANS["2-weeks"],
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
