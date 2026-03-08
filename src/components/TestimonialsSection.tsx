import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Joana Macuácua",
    role: "Gestora de Qualidade — Cervejas de Moçambique",
    course: "ISO 9001 – Implementação",
    text: "A formação da ALINVEST foi transformadora. Consegui implementar o SGQ na minha empresa em menos de 3 meses após o curso. Os formadores são excepcionais.",
    rating: 5,
    initials: "JM",
  },
  {
    name: "Fernando Sitoe",
    role: "Coordenador HSE — Sasol Moçambique",
    course: "ISO 45001 – Saúde e Segurança",
    text: "O nível de profundidade e os exercícios práticos superaram as minhas expectativas. Recomendo a todos os profissionais de HSEQ em Moçambique.",
    rating: 5,
    initials: "FS",
  },
  {
    name: "Marta Cossa",
    role: "Directora Executiva — TechStart Moz",
    course: "Gestão de Projectos",
    text: "As metodologias ágeis que aprendi aplicam-se directamente ao dia-a-dia da minha startup. Investimento que valeu cada metical.",
    rating: 5,
    initials: "MC",
  },
  {
    name: "Alberto Mondlane",
    role: "Auditor Interno — Banco BCI",
    course: "Auditoria Interna – ISO 19011",
    text: "A certificação que obtive abriu portas para novas oportunidades. Os templates e ferramentas fornecidos são de uso diário no meu trabalho.",
    rating: 4,
    initials: "AM",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <motion.span
            className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Star className="w-4 h-4" />
            Depoimentos
          </motion.span>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-3">
            O Que Dizem os Nossos Formandos
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Profissionais que transformaram as suas carreiras com as nossas formações.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full border-border shadow-card hover:shadow-card-hover transition-all duration-300 rounded-xl">
                <CardContent className="p-6 sm:p-7">
                  <Quote className="w-8 h-8 text-accent/15 mb-4" />
                  <p className="text-sm text-foreground leading-relaxed mb-5 italic">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`w-4 h-4 ${
                          si < t.rating
                            ? "text-warning fill-warning"
                            : "text-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-sm">
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-heading font-bold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                      <p className="text-xs text-accent font-semibold mt-0.5">{t.course}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
