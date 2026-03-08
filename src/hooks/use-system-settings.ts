import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SystemSettings {
  whatsappNumber: string;
  companyEmail: string;
  companyAddress: string;
  companyPhone: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankNIB: string;
  emolaNumber: string;
  emolaName: string;
}

const DEFAULTS: SystemSettings = {
  whatsappNumber: "258849999999",
  companyEmail: "info@alinvest-group.com",
  companyAddress: "Maputo, Moçambique",
  companyPhone: "",
  bankName: "",
  bankAccount: "",
  bankNIB: "",
  emolaNumber: "",
  emolaName: "",
};

const KEY_MAP: Record<string, keyof SystemSettings> = {
  whatsapp_number: "whatsappNumber",
  company_email: "companyEmail",
  company_address: "companyAddress",
  company_phone: "companyPhone",
  bank_name: "bankName",
  bank_account: "bankAccount",
  bank_nib: "bankNIB",
  emola_number: "emolaNumber",
  emola_name: "emolaName",
};

export function useSystemSettings() {
  return useQuery({
    queryKey: ["system-settings-public"],
    queryFn: async (): Promise<SystemSettings> => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("key, value")
        .eq("is_secret", false);

      if (error) {
        console.error("Failed to load system settings:", error);
        return { ...DEFAULTS };
      }

      const settings = { ...DEFAULTS };
      (data ?? []).forEach((row: any) => {
        const field = KEY_MAP[row.key];
        if (field && row.value) {
          (settings as any)[field] = row.value;
        }
      });
      return settings;
    },
    staleTime: 1000 * 60 * 10,
  });
}

/** Utility functions derived from settings */
export function getWhatsAppLinkFromNumber(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppUrl(number: string): string {
  return `https://wa.me/${number}`;
}
