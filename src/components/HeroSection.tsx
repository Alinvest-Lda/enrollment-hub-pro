import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Shield, CheckCircle, Users, BookOpen, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const HeroSection = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <img src={heroBg} alt="Formação profissional ALINVEST" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
      <div className="absolute inset-0 bg-hero-overlay" />

      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04] pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full border-2 border-primary-foreground" />
        <div className="absolute bottom-32 right-40 w-48 h-48 rounded-full border border-primary-foreground" />
        <div className="absolute top-1/2 right-10 w-96 h-96 rounded-full border border-primary-foreground" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-primary-foreground leading-[1.08] mb-6 font-heading">
              Invista no seu{" "}
              <span className="text-gradient">Crescimento</span>{" "}
              <span className="text-gradient">Profissional</span>
            </h1>

            <p className="text-base md:text-lg text-primary-foreground/75 mb-8 max-w-lg leading-relaxed">
              Cursos certificados internacionalmente em gestão, normas ISO, HSEQ e liderança.
              Inscreva-se online e escolha o plano de pagamento que melhor se adapta a si.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <a href="#cursos">
                <Button variant="hero" size="xl" className="group">
                  Ver Cursos
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="https://wa.me/258849999999?text=Olá, gostaria de saber mais sobre os cursos disponíveis." target="_blank" rel="noopener noreferrer">
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
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent/30 to-primary/20 blur-xl" />
              <div className="relative bg-primary-foreground/10 backdrop-blur-xl rounded-2xl border border-primary-foreground/10 overflow-hidden">
                {/* Featured highlight banner */}
                <div className="bg-accent/20 backdrop-blur-sm px-6 py-3 border-b border-primary-foreground/5">
                  <div className="flex items-center gap-2 justify-center">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-primary-foreground text-sm font-semibold">Porquê a ALINVEST?</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { value: 500, suffix: "+", label: "Profissionais Formados", icon: Users },
                      { value: 25, suffix: "+", label: "Cursos Disponíveis", icon: BookOpen },
                      { value: 98, suffix: "%", label: "Taxa de Aprovação", icon: Award },
                      { value: 5, suffix: "+", label: "Anos de Experiência", icon: Shield },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        className="bg-primary-foreground/5 rounded-xl p-3 text-center border border-primary-foreground/5 hover:border-accent/20 transition-colors"
                      >
                        <stat.icon className="w-4 h-4 text-accent mx-auto mb-1.5" />
                        <p className="text-xl font-extrabold text-primary-foreground font-heading">
                          <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                        </p>
                        <p className="text-[9px] text-primary-foreground/50 font-medium mt-0.5 leading-tight">
                          {stat.label}
                        </p>
                      </motion.div>
                    ))}
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

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L60 52C120 44 240 28 360 22C480 16 600 20 720 26C840 32 960 40 1080 42C1200 44 1320 40 1380 38L1440 36V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
