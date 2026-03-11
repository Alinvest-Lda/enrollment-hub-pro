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
    const duration = 2000;
    const step = Math.ceil(target / (duration / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
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
    <section className="relative min-h-[75vh] sm:min-h-[85vh] flex items-center overflow-hidden">
      {/* Background image */}
      <img
        src={heroBg}
        alt="Formação profissional ALINVEST"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-hero-overlay" />

      {/* Subtle decorative elements (reduced from many to 2) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.2) 0%, transparent 60%)" }}
          initial={{ x: "50%", y: "-20%" }}
          animate={{ x: ["50%", "55%", "50%"], y: ["-20%", "-15%", "-20%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--navy-light) / 0.2) 0%, transparent 60%)" }}
          initial={{ x: "-10%", y: "50%" }}
          animate={{ x: ["-10%", "0%", "-10%"], y: ["50%", "45%", "50%"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-14 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-primary-foreground leading-[1.08] mb-6 font-heading">
              Invista no seu{" "}
              <span className="text-gradient">Crescimento</span>{" "}
              <span className="text-gradient">Profissional</span>
            </h1>

            <p className="text-base md:text-lg text-primary-foreground/75 mb-8 max-w-lg leading-relaxed">
              Cursos certificados internacionalmente em gestão, normas ISO, HSEQ e liderança.
              Inscreva-se online e escolha o plano de pagamento que melhor se adapta a si.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-8">
              <a href="#cursos">
                <Button variant="hero" size="xl" className="group">
                  Ver Cursos
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href={getWhatsAppLinkFromNumber(whatsappNumber, "Olá, gostaria de saber mais sobre os cursos disponíveis.")} target="_blank" rel="noopener noreferrer">
                <Button variant="hero-outline" size="xl">
                  Falar no WhatsApp
                </Button>
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8 lg:mb-0">
              {[
                { icon: CheckCircle, label: "Certificação Internacional" },
                { icon: Shield, label: "Formadores Especializados" },
                { icon: GraduationCap, label: "Pagamento Flexível" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2 text-primary-foreground/80"
                >
                  <item.icon className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Mobile stats - visible only on small screens */}
            <div className="grid grid-cols-2 gap-3 lg:hidden">
              {stats.map((stat, i) => {
                const StatIcon = iconMap[stat.icon] || Users;
                return (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="bg-primary-foreground/5 backdrop-blur-sm rounded-xl p-3 text-center border border-primary-foreground/10"
                  >
                    <StatIcon className="w-4 h-4 text-accent mx-auto mb-1" />
                    <p className="text-lg font-extrabold text-primary-foreground font-heading">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-[9px] text-primary-foreground/60 font-medium leading-tight">
                      {stat.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Stats card - desktop only */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex flex-col items-center gap-6"
          >
            <div className="relative w-full max-w-sm">
              <motion.div
                className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/10 blur-xl"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative bg-card/40 backdrop-blur-2xl rounded-2xl border border-primary-foreground/10 overflow-hidden shadow-card">
                <div className="bg-navy-gradient px-6 py-3 border-b border-primary-foreground/10">
                  <div className="flex items-center gap-2 justify-center">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-primary-foreground text-sm font-semibold">Porquê a ALINVEST?</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {stats.map((stat, i) => {
                      const StatIcon = iconMap[stat.icon] || Users;
                      return (
                        <motion.div
                          key={stat.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          className="bg-muted/50 rounded-xl p-3 text-center border border-border/40 transition-colors cursor-default hover:scale-105 duration-200"
                        >
                          <StatIcon className="w-4 h-4 text-accent mx-auto mb-1.5" />
                          <p className="text-xl font-extrabold text-foreground font-heading">
                            <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                          </p>
                          <p className="text-[9px] text-muted-foreground font-medium mt-0.5 leading-tight">
                            {stat.label}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <a href="#cursos" className="block">
                    <Button variant="accent" size="lg" className="w-full group">
                      Começar Agora
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
