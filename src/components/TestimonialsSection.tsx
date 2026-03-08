import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTestimonials } from "@/hooks/use-site-content";
import { Skeleton } from "@/components/ui/skeleton";

const TestimonialsSection = () => {
  const { data: testimonials = [], isLoading } = useTestimonials();

  if (isLoading) {
    return (
      <section className="py-24 bg-section-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-5xl mx-auto">
            {[1, 2].map((i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-section-subtle relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.03] bg-accent blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-flex items-center gap-2 bg-accent/8 text-accent px-5 py-2 rounded-full text-sm font-semibold mb-5 border border-accent/10"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Star className="w-4 h-4" />
            Depoimentos
          </motion.span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            O Que Dizem os Nossos Formandos
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg">
            Profissionais que transformaram as suas carreiras com as nossas formações.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className="h-full border-border/60 shadow-card hover:shadow-card-hover transition-all duration-300 rounded-xl bg-card">
                <CardContent className="p-7 sm:p-8">
                  <div className="flex items-start justify-between mb-5">
                    <Quote className="w-10 h-10 text-accent/10" />
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star
                          key={si}
                          className={`w-4 h-4 ${
                            si < t.rating
                              ? "text-warning fill-warning"
                              : "text-muted-foreground/15"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed mb-6 italic">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center text-primary font-heading font-bold text-sm">
                      {t.initials || t.name.charAt(0)}
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
