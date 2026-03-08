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
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.15) 0%, transparent 70%)" }}
          initial={{ x: "60%", y: "-20%" }}
          animate={{ x: "65%", y: "-15%", scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[350px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)" }}
          initial={{ x: "-10%", y: "60%" }}
          animate={{ x: "-5%", y: "55%", scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute w-[200px] h-[200px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.1) 0%, transparent 70%)" }}
          initial={{ x: "30%", y: "70%" }}
          animate={{ x: "35%", y: "65%", scale: [1, 1.3, 1] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 4 }}
        />
      </div>

      {/* Animated decorative circles */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 rounded-full border-2 border-primary-foreground/[0.08]"
          animate={{ scale: [1, 1.05, 1], rotate: [0, 3, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 right-40 w-48 h-48 rounded-full border border-primary-foreground/[0.08]"
          animate={{ scale: [1, 1.08, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        <motion.div
          className="absolute top-1/2 right-10 w-96 h-96 rounded-full border border-primary-foreground/[0.06]"
          animate={{ scale: [1, 1.03, 1], rotate: [0, 2, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

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
            className="absolute rounded-full bg-primary-foreground/[0.08]"
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
              {/* Animated glow behind card */}
              <motion.div
                className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent/30 to-primary/20 blur-xl"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative bg-primary-foreground/10 backdrop-blur-xl rounded-2xl border border-primary-foreground/10 overflow-hidden">
                {/* Featured highlight banner */}
                <div className="bg-accent/20 backdrop-blur-sm px-6 py-3 border-b border-primary-foreground/5">
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
                        whileHover={{ scale: 1.05, borderColor: "hsl(var(--accent) / 0.3)" }}
                        className="bg-primary-foreground/5 rounded-xl p-3 text-center border border-primary-foreground/5 transition-colors cursor-default"
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
