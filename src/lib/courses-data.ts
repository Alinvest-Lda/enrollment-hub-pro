export type PaymentPlan = {
  id: string;
  label: string;
  description: string;
  installments: { percentage: number; dueDescription: string }[];
};

export type Course = {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  durationWeeks: number;
  price: number;
  currency: string;
  startDate: string;
  image: string;
  highlights: string[];
  paymentPlans: PaymentPlan[];
};

export const PAYMENT_PLANS: Record<string, PaymentPlan[]> = {
  "2-weeks": [
    {
      id: "full",
      label: "100% na Inscrição",
      description: "Pagamento integral no acto da inscrição",
      installments: [{ percentage: 100, dueDescription: "Na inscrição" }],
    },
    {
      id: "60-40",
      label: "60% + 40%",
      description: "60% na inscrição e 40% em 7 dias",
      installments: [
        { percentage: 60, dueDescription: "Na inscrição" },
        { percentage: 40, dueDescription: "Em 7 dias" },
      ],
    },
  ],
  "1-month": [
    {
      id: "full",
      label: "100% na Inscrição",
      description: "Pagamento integral no acto da inscrição",
      installments: [{ percentage: 100, dueDescription: "Na inscrição" }],
    },
    {
      id: "60-20-20",
      label: "60% + 20% + 20%",
      description: "60% na inscrição, 20% em 15 dias, 20% em 20 dias",
      installments: [
        { percentage: 60, dueDescription: "Na inscrição" },
        { percentage: 20, dueDescription: "Em 15 dias" },
        { percentage: 20, dueDescription: "Em 20 dias" },
      ],
    },
  ],
};

export const COURSES: Course[] = [
  {
    id: "iso-9001-implementacao",
    title: "ISO 9001 – Implementação do Sistema de Gestão da Qualidade",
    category: "ISO & Gestão",
    description: "Aprenda a implementar e gerir um Sistema de Gestão da Qualidade conforme a norma ISO 9001, desde a análise de contexto até a auditoria interna.",
    duration: "2 Semanas",
    durationWeeks: 2,
    price: 25000,
    currency: "MZN",
    startDate: "2026-04-15",
    image: "",
    highlights: ["Certificado PECB", "Material didáctico incluído", "Formadores certificados", "Exercícios práticos"],
    paymentPlans: PAYMENT_PLANS["2-weeks"],
  },
  {
    id: "iso-45001-seguranca",
    title: "ISO 45001 – Saúde e Segurança Ocupacional",
    category: "HSEQ",
    description: "Formação completa sobre implementação do sistema de gestão de saúde e segurança no trabalho, primeiros socorros e combate a incêndios.",
    duration: "1 Mês",
    durationWeeks: 4,
    price: 35000,
    currency: "MZN",
    startDate: "2026-04-22",
    image: "",
    highlights: ["Prática em campo", "Certificação internacional", "Instrutores especializados", "Case studies reais"],
    paymentPlans: PAYMENT_PLANS["1-month"],
  },
  {
    id: "gestao-projectos",
    title: "Gestão de Projectos – Metodologias Ágeis e PMI",
    category: "Gestão",
    description: "Domine ferramentas e metodologias de gestão de projectos aplicadas ao contexto empresarial moçambicano e internacional.",
    duration: "2 Semanas",
    durationWeeks: 2,
    price: 20000,
    currency: "MZN",
    startDate: "2026-05-06",
    image: "",
    highlights: ["Metodologia PMI", "Ferramentas digitais", "Projecto final prático", "Networking"],
    paymentPlans: PAYMENT_PLANS["2-weeks"],
  },
  {
    id: "auditoria-interna",
    title: "Auditoria Interna – ISO 19011",
    category: "ISO & Gestão",
    description: "Capacitação em técnicas de auditoria interna conforme a ISO 19011, incluindo planeamento, execução e relatórios de auditoria.",
    duration: "2 Semanas",
    durationWeeks: 2,
    price: 22000,
    currency: "MZN",
    startDate: "2026-05-20",
    image: "",
    highlights: ["Simulações de auditoria", "Templates profissionais", "Certificado de conclusão", "Mentoria pós-curso"],
    paymentPlans: PAYMENT_PLANS["2-weeks"],
  },
  {
    id: "lideranca-executiva",
    title: "Liderança Executiva e Desenvolvimento Organizacional",
    category: "Liderança",
    description: "Programa intensivo de desenvolvimento de competências de liderança para gestores e directores, com foco em tomada de decisão estratégica.",
    duration: "1 Mês",
    durationWeeks: 4,
    price: 40000,
    currency: "MZN",
    startDate: "2026-06-01",
    image: "",
    highlights: ["Coaching individual", "Casos de estudo africanos", "Rede de líderes", "Plano de acção personalizado"],
    paymentPlans: PAYMENT_PLANS["1-month"],
  },
  {
    id: "hse-basico",
    title: "HSE Básico – Saúde, Segurança e Ambiente",
    category: "HSEQ",
    description: "Formação fundamental em saúde, segurança e ambiente para equipas operacionais, cumprindo a legislação moçambicana.",
    duration: "2 Semanas",
    durationWeeks: 2,
    price: 15000,
    currency: "MZN",
    startDate: "2026-04-28",
    image: "",
    highlights: ["Legislação nacional", "Práticas de campo", "Kit de segurança", "Avaliação final"],
    paymentPlans: PAYMENT_PLANS["2-weeks"],
  },
];

export const WHATSAPP_NUMBER = "258849999999";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export function formatCurrency(value: number, currency = "MZN"): string {
  return new Intl.NumberFormat("pt-MZ", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(value) + ` ${currency}`;
}

export function getWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
