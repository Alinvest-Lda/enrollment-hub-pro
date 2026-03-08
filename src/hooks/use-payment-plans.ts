import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PaymentPlan } from "@/lib/courses-data";

export interface DBPaymentPlanInstallment {
  number: number;
  percent: number;
  days_offset: number;
  label: string;
}

export interface DBPaymentPlan {
  id: string;
  name: string;
  description: string;
  installments: DBPaymentPlanInstallment[];
  is_default: boolean;
  is_active: boolean;
}

/** Convert DB payment plan to the format used by courses/enrollment */
function toCoursePlan(plan: DBPaymentPlan): PaymentPlan {
  return {
    id: plan.id,
    label: plan.name,
    description: plan.description,
    installments: plan.installments.map((inst) => ({
      percentage: inst.percent,
      dueDescription: inst.days_offset === 0 ? "Na inscrição" : `Em ${inst.days_offset} dias`,
    })),
  };
}

export function usePaymentPlans() {
  return useQuery({
    queryKey: ["payment-plans-active"],
    queryFn: async (): Promise<PaymentPlan[]> => {
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
        return toCoursePlan({ ...row, installments } as DBPaymentPlan);
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}
