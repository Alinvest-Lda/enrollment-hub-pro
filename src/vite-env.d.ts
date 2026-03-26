/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CMS_PROVIDER?: string;
  readonly VITE_WORDPRESS_API_BASE?: string;
  readonly VITE_WP_ENDPOINT_COURSES?: string;
  readonly VITE_WP_ENDPOINT_TESTIMONIALS?: string;
  readonly VITE_WP_ENDPOINT_FAQS?: string;
  readonly VITE_WP_ENDPOINT_TEAM?: string;
  readonly VITE_WP_ENDPOINT_HERO_STATS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
