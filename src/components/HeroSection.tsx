import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <img
        src={heroBg}
        alt="Formação profissional ALINVEST"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-hero-overlay" />

      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground border border-accent-foreground/20 px-4 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm">
              <Award className="w-4 h-4" />
              Parceiro Oficial PECB em Moçambique
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-[1.1] mb-6 font-heading">
              Invista no seu{" "}
              <span className="text-gradient">Crescimento Profissional</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-lg leading-relaxed">
              Cursos certificados em gestão, ISO, HSEQ e liderança.
              Inscreva-se online e pague de forma flexível.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#cursos">
                <Button variant="hero" size="xl">
                  Ver Cursos
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
              <a href="https://wa.me/258849999999?text=Olá, gostaria de saber mais sobre os cursos disponíveis." target="_blank" rel="noopener noreferrer">
                <Button variant="hero-outline" size="xl">
                  Falar no WhatsApp
                </Button>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap gap-6 sm:gap-10 mt-14 pt-8 border-t border-primary-foreground/10"
          >
            {[
              { icon: GraduationCap, label: "Certificação Internacional" },
              { icon: Shield, label: "Formadores Especializados" },
              { icon: Award, label: "Pagamento Flexível" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-primary-foreground/80">
                <div className="p-2 rounded-lg bg-accent/20 backdrop-blur-sm">
                  <item.icon className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
