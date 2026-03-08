import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
interface CircleData {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
}

function RandomCircles() {
  const [circles, setCircles] = useState<CircleData[]>([]);
  const idRef = useState({ current: 0 })[0];

  useEffect(() => {
    const createCircle = (): CircleData => {
      idRef.current += 1;
      return {
        id: idRef.current,
        x: Math.random() * 90 + 5,
        y: Math.random() * 85 + 5,
        size: Math.random() * 120 + 40,
        opacity: Math.random() * 0.08 + 0.04,
        duration: Math.random() * 3 + 2,
      };
    };

    setCircles([createCircle(), createCircle(), createCircle()]);

    const interval = setInterval(() => {
      setCircles((prev) => {
        const next = [...prev];
        if (next.length >= 6) next.shift();
        next.push(createCircle());
        return next;
      });
    }, 1800 + Math.random() * 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {circles.map((c) => (
          <motion.div
            key={c.id}
            className="absolute rounded-full border border-primary-foreground/[0.08]"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: c.size,
              height: c.size,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: c.opacity, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: c.duration, ease: "easeInOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

const iconMap: Record<string, React.ElementType> = { Users, BookOpen, Award, Shield };

const HeroSection = () => {
  const { data: settings } = useSystemSettings();
  const { data: heroStats = [] } = useHeroStats();
  const whatsappNumber = settings?.whatsappNumber || "";
  return (
    <section className="relative min-h-[85vh] sm:min-h-[92vh] flex items-center overflow-hidden">
      {/* Background with subtle zoom animation */}
      <motion.img
        src={heroBg}
        alt="Formação profissional ALINVEST"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: "easeOut" }}
      />
      <div className="absolute inset-0 bg-hero-overlay" />

      {/* Animated floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.35) 0%, transparent 60%)" }}
          initial={{ x: "50%", y: "-30%" }}
          animate={{ x: ["50%", "60%", "50%"], y: ["-30%", "-20%", "-30%"], scale: [1, 1.25, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[550px] h-[550px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.25) 0%, transparent 60%)" }}
          initial={{ x: "-20%", y: "50%" }}
          animate={{ x: ["-20%", "-10%", "-20%"], y: ["50%", "40%", "50%"], scale: [1, 1.3, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--navy-light) / 0.35) 0%, transparent 60%)" }}
          initial={{ x: "20%", y: "60%" }}
          animate={{ x: ["20%", "30%", "20%"], y: ["60%", "50%", "60%"], scale: [1, 1.4, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        {/* Sweeping light beams */}
        <motion.div
          className="absolute w-[200%] h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent 0%, hsl(var(--accent) / 0.2) 50%, transparent 100%)", top: "40%", left: "-50%" }}
          animate={{ x: ["-50%", "50%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-[200%] h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent 0%, hsl(var(--primary-foreground) / 0.12) 50%, transparent 100%)", top: "65%", left: "50%" }}
          animate={{ x: ["50%", "-50%"] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: 2 }}
        />
      </div>

      {/* Random appearing/disappearing circles */}
      <RandomCircles />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { x: "15%", y: "25%", size: 3, delay: 0, dur: 6 },
          { x: "75%", y: "35%", size: 2, delay: 1, dur: 8 },
          { x: "45%", y: "70%", size: 2.5, delay: 2.5, dur: 7 },
          { x: "85%", y: "65%", size: 2, delay: 3, dur: 9 },
          { x: "25%", y: "80%", size: 1.5, delay: 4, dur: 6.5 },
          { x: "55%", y: "15%", size: 2, delay: 1.5, dur: 7.5 },
        ].map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary-foreground/[0.15]"
            style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
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

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-10">
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
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {[
                { icon: CheckCircle, label: "Certificação Internacional" },
                { icon: Shield, label: "Formadores Especializados" },
                { icon: GraduationCap, label: "Pagamento Flexível" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  className="flex items-center gap-2 text-primary-foreground/70"
                >
                  <item.icon className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Stats + CTA card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex flex-col items-center gap-6"
          >
            <div className="relative w-full max-w-sm">
              {/* Animated glow behind card */}
              <motion.div
                className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent/30 to-primary/20 blur-xl"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative bg-card/40 backdrop-blur-2xl rounded-2xl border border-primary-foreground/10 overflow-hidden shadow-card">
                {/* Featured highlight banner */}
                <div className="bg-navy-gradient px-6 py-3 border-b border-primary-foreground/10">
                  <div className="flex items-center gap-2 justify-center">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    >
                      <Sparkles className="w-4 h-4 text-accent" />
                    </motion.div>
                    <span className="text-primary-foreground text-sm font-semibold">Porquê a ALINVEST?</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {(heroStats.length > 0 ? heroStats : [
                      { id: "1", value: 500, suffix: "+", label: "Profissionais Formados", icon: "Users", display_order: 1, is_active: true },
                      { id: "2", value: 25, suffix: "+", label: "Cursos Disponíveis", icon: "BookOpen", display_order: 2, is_active: true },
                      { id: "3", value: 98, suffix: "%", label: "Taxa de Aprovação", icon: "Award", display_order: 3, is_active: true },
                      { id: "4", value: 5, suffix: "+", label: "Anos de Experiência", icon: "Shield", display_order: 4, is_active: true },
                    ]).map((stat, i) => {
                      const StatIcon = iconMap[stat.icon] || Users;
                      return (
                        <motion.div
                          key={stat.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="bg-muted/50 rounded-xl p-3 text-center border border-border/40 transition-colors cursor-default"
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

                  {/* CTA inside card */}
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
