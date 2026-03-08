import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const BASE_URL = "https://enrollment-hub-pro.lovable.app";
const DEFAULT_OG_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a8f84d90-375a-45b6-9232-72d7d14aa1ca/id-preview-fba3aed5--fa73bb35-22e6-4b0d-a6eb-2872c39986e3.lovable.app-1772627734154.png";
const SITE_NAME = "ALINVEST";

const SEO = ({
  title,
  description = "Cursos certificados internacionalmente em gestão, normas ISO, HSEQ e liderança. Inscreva-se online com planos de pagamento flexíveis.",
  path = "/",
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Formação Profissional Certificada em Moçambique`;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="pt_MZ" />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
