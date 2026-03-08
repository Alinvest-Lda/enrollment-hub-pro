import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { Target, Eye, Heart, Users, Award, BookOpen, ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSystemSettings, getWhatsAppUrl } from "@/hooks/use-system-settings";
import { useTeamMembers } from "@/hooks/use-site-content";
import { Skeleton } from "@/components/ui/skeleton";

const values = [
  { icon: Award, title: "Excelência", description: "Compromisso com os mais altos padrões de qualidade em formação e consultoria." },
  { icon: Users, title: "Colaboração", description: "Trabalhamos lado a lado com os nossos clientes para alcançar resultados concretos." },
  { icon: BookOpen, title: "Inovação", description: "Metodologias actualizadas e alinhadas com as melhores práticas internacionais." },
  { icon: Heart, title: "Integridade", description: "Ética e transparência em todas as nossas relações profissionais." },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const AboutUs = () => {
  const { data: settings } = useSystemSettings();
  const { data: team = [], isLoading: teamLoading } = useTeamMembers();
  const whatsappLink = getWhatsAppUrl(settings?.whatsappNumber || "");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Sobre Nós" description="Conheça a ALINVEST — missão, visão, valores e equipa. Consultoria e formação profissional certificada em Moçambique." path="/sobre" />
      <Navbar />

      {/* Hero */}
      <section className="bg-navy-gradient text-primary-foreground py-24 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-20 w-[400px] h-[400px] rounded-full opacity-10 bg-accent blur-3xl" />
          <div className="absolute bottom-10 left-10 w-[300px] h-[300px] rounded-full opacity-5 bg-primary-foreground blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <motion.span
              className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground/80 px-5 py-2 rounded-full text-sm font-semibold mb-6 border border-primary-foreground/10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Sparkles className="w-4 h-4" />
              Quem Somos
            </motion.span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5">Sobre a ALINVEST</h1>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto text-lg leading-relaxed">
              Capacitamos profissionais e organizações em Moçambique através de formação especializada e consultoria de excelência.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L60 34C120 28 240 16 360 12C480 8 600 12 720 16C840 20 960 24 1080 24C1200 24 1320 20 1380 18L1440 16V40H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div {...fadeInUp}>
              <Card className="h-full border-border/60 shadow-card hover:shadow-card-hover transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-accent to-brand-red-light" />
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Target className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="font-heading text-2xl font-bold">Missão</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Desenvolver competências técnicas e de gestão que impulsionem o crescimento sustentável das organizações moçambicanas, através de formação certificada e consultoria especializada alinhada com as normas internacionais.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ duration: 0.6, delay: 0.15 }}>
              <Card className="h-full border-border/60 shadow-card hover:shadow-card-hover transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary to-navy-light" />
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Eye className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="font-heading text-2xl font-bold">Visão</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Ser a referência em formação profissional e consultoria empresarial em Moçambique, reconhecida pela qualidade dos programas, impacto nos resultados dos clientes e contribuição para o desenvolvimento do capital humano nacional.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-section-subtle">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">Os Nossos Valores</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg">Princípios que orientam cada acção e decisão na ALINVEST.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={v.title} {...fadeInUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                  <Card className="h-full text-center border-border/60 shadow-card hover:shadow-card-hover hover:border-accent/15 transition-all duration-300 rounded-2xl group">
                    <CardContent className="p-7">
                      <div className="mx-auto w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/15 transition-colors">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <h3 className="font-heading font-bold text-lg mb-2">{v.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      {(teamLoading || team.length > 0) && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeInUp} className="text-center mb-14">
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">A Nossa Equipa</h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg">Profissionais experientes e dedicados ao sucesso dos nossos formandos.</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {teamLoading
                ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)
                : team.map((member, i) => (
                    <motion.div key={member.id} {...fadeInUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                      <Card className="h-full border-border/60 shadow-card hover:shadow-card-hover transition-all duration-300 rounded-2xl group overflow-hidden">
                        <CardContent className="p-7 text-center">
                          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-5 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                            {member.photo_url ? (
                              <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-10 h-10 text-primary" />
                            )}
                          </div>
                          <h3 className="font-heading font-bold text-lg">{member.name}</h3>
                          <p className="text-sm text-accent font-medium mb-3">{member.role}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
              }
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-navy-gradient text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-20 w-[300px] h-[300px] rounded-full opacity-10 bg-accent blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div {...fadeInUp}>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-5">Pronto para crescer connosco?</h2>
            <p className="text-primary-foreground/70 mb-10 max-w-md mx-auto text-lg">
              Explore os nossos cursos ou entre em contacto para uma formação à medida.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/cursos">
                <Button size="lg" variant="secondary" className="rounded-xl px-8 font-semibold">
                  Ver Cursos <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="whatsapp" className="rounded-xl px-8 font-semibold">
                  <MessageCircle className="w-4 h-4" /> Falar Connosco
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
