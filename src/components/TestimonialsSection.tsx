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
  },
  {
    name: "Fernando Sitoe",
    role: "Coordenador HSE — Sasol Moçambique",
    course: "ISO 45001 – Saúde e Segurança",
    text: "O nível de profundidade e os exercícios práticos superaram as minhas expectativas. Recomendo a todos os profissionais de HSEQ em Moçambique.",
    rating: 5,
  },
  {
    name: "Marta Cossa",
    role: "Directora Executiva — TechStart Moz",
    course: "Gestão de Projectos",
    text: "As metodologias ágeis que aprendi aplicam-se directamente ao dia-a-dia da minha startup. Investimento que valeu cada metical.",
    rating: 5,
  },
  {
    name: "Alberto Mondlane",
    role: "Auditor Interno — Banco BCI",
    course: "Auditoria Interna – ISO 19011",
    text: "A certificação que obtive abriu portas para novas oportunidades. Os templates e ferramentas fornecidos são de uso diário no meu trabalho.",
    rating: 4,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
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
              <Card className="h-full border-border shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-accent/20 mb-3" />
                  <p className="text-sm text-foreground leading-relaxed mb-4 italic">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`w-4 h-4 ${si < t.rating ? "text-gold fill-current" : "text-muted-foreground/30"}`}
                        style={si < t.rating ? { color: "hsl(var(--gold))" } : undefined}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                    <p className="text-xs text-accent font-medium mt-0.5">{t.course}</p>
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
