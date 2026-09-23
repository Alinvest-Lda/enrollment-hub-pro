import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTestimonials } from "@/hooks/use-site-content";
import { Skeleton } from "@/components/ui/skeleton";

const TestimonialsSection = () => {
  const { data: testimonials = [], isLoading } = useTestimonials();
  if (isLoading) return <section className="py-20 lg:py-24 bg-navy-gradient"><div className="container mx-auto px-4"><div className="max-w-2xl mb-10"><Skeleton className="h-4 w-28 mb-4" /><Skeleton className="h-10 w-80 mb-3" /><Skeleton className="h-5 w-96" /></div><div className="grid md:grid-cols-2 gap-5 max-w-5xl"><Skeleton className="h-60 rounded-2xl" /><Skeleton className="h-60 rounded-2xl" /></div></div></section>;
  if (!testimonials.length) return null;

  return (
    <section className="py-20 lg:py-24 bg-navy-gradient text-white relative overflow-hidden">
      <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl mb-10 lg:mb-12">
          <span className="inline-flex items-center gap-2 text-accent text-[10px] font-extrabold uppercase tracking-[.16em] mb-4"><Star className="w-3.5 h-3.5" /> Experiências</span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">A formação precisa fazer sentido no trabalho.</h2>
          <p className="text-white/60 mt-4 text-sm md:text-base leading-relaxed max-w-xl">Experiências de participantes que aplicaram os conhecimentos adquiridos nas suas actividades profissionais.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl">
          {testimonials.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ delay: i * .08, duration: .45 }}>
              <Card className="h-full rounded-2xl border-white/10 bg-white/[.06] backdrop-blur-xl shadow-none">
                <CardContent className="p-6 sm:p-7">
                  <div className="flex items-start justify-between mb-6"><Quote className="w-9 h-9 text-accent/45" /><div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, si) => <Star key={si} className={`w-3.5 h-3.5 ${si < t.rating ? "text-warning fill-warning" : "text-white/15"}`} />)}</div></div>
                  <p className="text-sm text-white/85 leading-relaxed mb-7 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent font-heading font-bold text-xs">{t.initials || t.name.charAt(0)}</div>
                    <div><p className="font-heading font-bold text-sm text-white">{t.name}</p><p className="text-xs text-white/50">{t.role}</p><p className="text-xs text-accent font-semibold mt-0.5">{t.course}</p></div>
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
