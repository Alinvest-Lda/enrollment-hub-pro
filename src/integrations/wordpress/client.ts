import { type Course, PAYMENT_PLANS } from "@/lib/courses-data";

type WPRendered = { rendered?: string };

type WPPost = {
  id: number;
  slug?: string;
  title?: WPRendered;
  excerpt?: WPRendered;
  content?: WPRendered;
  acf?: Record<string, unknown>;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
  };
};

type WPEndpointKey = "courses" | "testimonials" | "faqs" | "team" | "heroStats";

const CMS_PROVIDER = (import.meta.env.VITE_CMS_PROVIDER ?? "").toLowerCase();
const WORDPRESS_API_BASE = (import.meta.env.VITE_WORDPRESS_API_BASE ?? "").replace(/\/$/, "");

const ENDPOINTS: Record<WPEndpointKey, string> = {
  courses: import.meta.env.VITE_WP_ENDPOINT_COURSES ?? "course",
  testimonials: import.meta.env.VITE_WP_ENDPOINT_TESTIMONIALS ?? "testimonial",
  faqs: import.meta.env.VITE_WP_ENDPOINT_FAQS ?? "faq",
  team: import.meta.env.VITE_WP_ENDPOINT_TEAM ?? "team-member",
  heroStats: import.meta.env.VITE_WP_ENDPOINT_HERO_STATS ?? "hero-stat",
};

export const isWordPressCmsEnabled = CMS_PROVIDER === "wordpress" && Boolean(WORDPRESS_API_BASE);

function sanitizeHtml(input: string | undefined): string {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, "").trim();
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

async function fetchWordPressCollection(endpoint: string): Promise<WPPost[]> {
  const base = `${WORDPRESS_API_BASE}/wp-json/wp/v2/${endpoint}`;
  const url = new URL(base);
  url.searchParams.set("per_page", "100");
  url.searchParams.set("_embed", "1");

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`WordPress CMS error (${endpoint}): ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as WPPost[];
  return Array.isArray(payload) ? payload : [];
}

export async function fetchWordPressCourses(): Promise<Course[]> {
  const posts = await fetchWordPressCollection(ENDPOINTS.courses);

  return posts.map((post) => {
    const acf = post.acf ?? {};
    const weeks = toNumber(acf.duration_weeks ?? acf.durationWeeks, 2);
    const planKey = weeks >= 4 ? "1-month" : "2-weeks";
    const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "";

    return {
      id: post.slug || String(post.id),
      title: sanitizeHtml(post.title?.rendered),
      category: String(acf.category ?? "Geral"),
      description: sanitizeHtml(post.excerpt?.rendered || post.content?.rendered),
      duration: String(acf.duration ?? `${weeks} semanas`),
      durationWeeks: weeks,
      price: toNumber(acf.price, 0),
      currency: String(acf.currency ?? "MZN"),
      startDate: String(acf.start_date ?? acf.startDate ?? ""),
      image,
      highlights: toStringArray(acf.highlights),
      paymentPlans: PAYMENT_PLANS[planKey],
    };
  });
}

type WPBaseContent = {
  id: string;
  is_active: boolean;
  display_order: number;
};

export type WPTestimonial = WPBaseContent & {
  name: string;
  role: string;
  course: string;
  text: string;
  rating: number;
  initials: string;
};

export async function fetchWordPressTestimonials(): Promise<WPTestimonial[]> {
  const posts = await fetchWordPressCollection(ENDPOINTS.testimonials);
  return posts.map((post, index) => {
    const acf = post.acf ?? {};
    const name = String(acf.name ?? sanitizeHtml(post.title?.rendered) ?? "");
    return {
      id: String(post.id),
      name,
      role: String(acf.role ?? ""),
      course: String(acf.course ?? ""),
      text: String(acf.text ?? sanitizeHtml(post.content?.rendered)),
      rating: toNumber(acf.rating, 5),
      initials: String(acf.initials ?? name.slice(0, 2).toUpperCase()),
      is_active: acf.is_active !== false,
      display_order: toNumber(acf.display_order, index),
    };
  });
}

export type WPFAQ = WPBaseContent & {
  question: string;
  answer: string;
};

export async function fetchWordPressFAQs(): Promise<WPFAQ[]> {
  const posts = await fetchWordPressCollection(ENDPOINTS.faqs);
  return posts.map((post, index) => {
    const acf = post.acf ?? {};
    return {
      id: String(post.id),
      question: String(acf.question ?? sanitizeHtml(post.title?.rendered)),
      answer: String(acf.answer ?? sanitizeHtml(post.content?.rendered)),
      is_active: acf.is_active !== false,
      display_order: toNumber(acf.display_order, index),
    };
  });
}

export type WPTeamMember = WPBaseContent & {
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
};

export async function fetchWordPressTeamMembers(): Promise<WPTeamMember[]> {
  const posts = await fetchWordPressCollection(ENDPOINTS.team);
  return posts.map((post, index) => {
    const acf = post.acf ?? {};
    return {
      id: String(post.id),
      name: String(acf.name ?? sanitizeHtml(post.title?.rendered)),
      role: String(acf.role ?? ""),
      bio: String(acf.bio ?? sanitizeHtml(post.content?.rendered)),
      photo_url: String(acf.photo_url ?? post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "") || null,
      is_active: acf.is_active !== false,
      display_order: toNumber(acf.display_order, index),
    };
  });
}

export type WPHeroStat = WPBaseContent & {
  label: string;
  value: number;
  suffix: string;
  icon: string;
};

export async function fetchWordPressHeroStats(): Promise<WPHeroStat[]> {
  const posts = await fetchWordPressCollection(ENDPOINTS.heroStats);
  return posts.map((post, index) => {
    const acf = post.acf ?? {};
    return {
      id: String(post.id),
      label: String(acf.label ?? sanitizeHtml(post.title?.rendered)),
      value: toNumber(acf.value, 0),
      suffix: String(acf.suffix ?? ""),
      icon: String(acf.icon ?? "users"),
      is_active: acf.is_active !== false,
      display_order: toNumber(acf.display_order, index),
    };
  });
}
