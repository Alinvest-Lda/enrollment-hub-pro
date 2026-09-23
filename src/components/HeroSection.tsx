import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Shield, CheckCircle, Users, BookOpen, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSystemSettings, getWhatsAppLinkFromNumber } from "@/hooks/use-system-settings";
import { useHeroStats } from "@/hooks/use-site-content";
import heroBg from "@/assets/hero-bg.jpg";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1800;
    const step = Math.max(1, Math.ceil(target / (duration / 30)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); } else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}{suffix}</span>;
}

const iconMap: Record<string, React.ElementType> = { Users, BookOpen, Award, Shield };
const defaultStats = [
  { id: "1", value: 500, suffix: "+", label: "Profissionais Formados", icon: "Users", display_order: 1, is_active: true },
  { id: "2", value: 25, suffix: "+", label: "Cursos Disponíveis", icon: "BookOpen", display_order: 2, is_active: true },
  { id: "3", value: 98, suffix: "%", label: "Taxa de Aprovação", icon: "Award", display_order: 3, is_active: true },
  { id: "4", value: 5, suffix: "+", label: "Anos de Experiência", icon: "Shield", display_order: 4, is_active: true },
];

const HeroSection = () => {
  const { data: settings } = useSystemSettings();
  const { data: heroStats = [] } = useHeroStats();
  const whatsappNumber = settings?.whatsappNumber || "";
  const stats = heroStats.length > 0 ? heroStats : defaultStats;

  return (
    <section className="relative min-h-[78vh] lg:min-h-[calc(100vh-72px)] flex items-center overflow-hidden">
      <img src={heroBg} alt="Formação profissional ALINVEST" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_78%_28%,hsl(var(--accent)/.18),transparent_28%),radial-gradient(circle_at_12%_85%,hsl(210_80%_55%/.08),transparent_30%)]" />

      <div className="container mx-auto px-4 relative z-10 py-16 lg:py-20">
        <div className="grid lg:grid-cols-[1.08fr_.92fr] gap-12 xl:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .65 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 backdrop-blur-md px-4 py-2 text-xs font-bold tracking-wide text-white/85 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> DESENVOLVIMENTO PROFISSIONAL
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-[4.25rem] font-extrabold text-primary-foreground leading-[1.02] mb-6 font-heading max-w-3xl">
              Aprenda. Aplique. <span className="text-gradient">Avance.</span>
            </h1>
            <p className="text-base md:text-lg xl:text-xl text-primary-foreground/72 mb-9 max-w-xl leading-relaxed">
              Capacitação prática para profissionais que querem transformar conhecimento em resultados no trabalho.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-9">
              <a href="#cursos">
                <Button variant="hero" size="xl" className="group w-full sm:w-auto">
                  Explorar cursos <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href={getWhatsAppLinkFromNumber(whatsappNumber, "Olá, gostaria de saber mais sobre os cursos disponíveis.")} target="_blank" rel="noopener noreferrer">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">Falar no WhatsApp</Button>
              </a>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {[
                { icon: CheckCircle, label: "Conteúdo aplicado" },
                { icon: Shield, label: "Formadores especializados" },
                { icon: GraduationCap, label: "Pagamento flexível" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: .35 + i * .1 }} className="flex items-center gap-2 text-white/78">
                  <item.icon className="w-4 h-4 text-accent" /><span className="text-xs font-semibold">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .65, delay: .15 }}
            className="hidden lg:block">
            <div className="relative max-w-md ml-auto">
              <div className="absolute -inset-6 rounded-[2rem] bg-accent/15 blur-3xl" />
              <div className="relative rounded-[1.75rem] border border-white/15 bg-white/10 backdrop-blur-2xl p-2 shadow-2xl">
                <div className="rounded-[1.35rem] bg-white/95 overflow-hidden">
                  <div className="bg-navy-gradient px-7 py-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/55">ALINVEST</p>
                        <p className="text-lg font-bold text-white mt-1">O próximo passo começa aqui.</p>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-accent/15 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-accent" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-3">
                    {stats.map((stat, i) => {
                      const StatIcon = iconMap[stat.icon] || Users;
                      return (
                        <motion.div key={stat.id} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: .5 + i * .08 }}
                          className="rounded-2xl border border-border bg-secondary/55 p-4 hover:bg-secondary transition-colors">
                          <StatIcon className="w-4 h-4 text-accent mb-2" />
                          <p className="text-2xl font-extrabold text-foreground font-heading"><AnimatedCounter target={stat.value} suffix={stat.suffix} /></p>
                          <p className="text-[10px] text-muted-foreground font-semibold mt-1 leading-tight">{stat.label}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="px-5 pb-5">
                    <a href="#cursos" className="block">
                      <Button variant="accent" size="lg" className="w-full h-12 rounded-xl group">
                        Encontrar o meu curso <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 lg:hidden mt-2">
            {stats.map((stat) => {
              const StatIcon = iconMap[stat.icon] || Users;
              return <div key={stat.id} className="rounded-2xl border border-white/12 bg-white/7 backdrop-blur-md p-3 text-center">
                <StatIcon className="w-4 h-4 text-accent mx-auto mb-1" />
                <p className="text-lg font-extrabold text-white font-heading"><AnimatedCounter target={stat.value} suffix={stat.suffix} /></p>
                <p className="text-[9px] text-white/55 font-semibold leading-tight">{stat.label}</p>
              </div>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
