import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  course: string;
  text: string;
  rating: number;
  initials: string;
  is_active: boolean;
  display_order: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  display_order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  is_active: boolean;
  display_order: number;
}

export interface HeroStat {
  id: string;
  label: string;
  value: number;
  suffix: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("testimonials" as any) as any)
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return (data || []) as Testimonial[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useFAQs() {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("faqs" as any) as any)
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return (data || []) as FAQ[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("team_members" as any) as any)
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return (data || []) as TeamMember[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useHeroStats() {
  return useQuery({
    queryKey: ["hero-stats"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("hero_stats" as any) as any)
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return (data || []) as HeroStat[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

// Admin versions (include inactive)
export function useAllTestimonials() {
  return useQuery({
    queryKey: ["testimonials-all"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("testimonials" as any) as any)
        .select("*")
        .order("display_order");
      if (error) throw error;
      return (data || []) as Testimonial[];
    },
  });
}

export function useAllFAQs() {
  return useQuery({
    queryKey: ["faqs-all"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("faqs" as any) as any)
        .select("*")
        .order("display_order");
      if (error) throw error;
      return (data || []) as FAQ[];
    },
  });
}

export function useAllTeamMembers() {
  return useQuery({
    queryKey: ["team-members-all"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("team_members" as any) as any)
        .select("*")
        .order("display_order");
      if (error) throw error;
      return (data || []) as TeamMember[];
    },
  });
}

export function useAllHeroStats() {
  return useQuery({
    queryKey: ["hero-stats-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_stats")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return (data || []) as HeroStat[];
    },
  });
}
