import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Eye, Heart, Users, Award, BookOpen, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WHATSAPP_LINK } from "@/lib/courses-data";

const values = [
  { icon: Award, title: "Excelência", description: "Compromisso com os mais altos padrões de qualidade em formação e consultoria." },
  { icon: Users, title: "Colaboração", description: "Trabalhamos lado a lado com os nossos clientes para alcançar resultados concretos." },
  { icon: BookOpen, title: "Inovação", description: "Metodologias actualizadas e alinhadas com as melhores práticas internacionais." },
  { icon: Heart, title: "Integridade", description: "Ética e transparência em todas as nossas relações profissionais." },
];

const team = [
  { name: "Dr. António Machava", role: "Director Executivo", bio: "Mais de 15 anos de experiência em consultoria e gestão empresarial em Moçambique e região austral de África." },
  { name: "Eng.ª Márcia Tembe", role: "Directora de Formação", bio: "Especialista em sistemas de gestão ISO com certificação PECB e vasta experiência em formação corporativa." },
  { name: "Dr. Carlos Nhantumbo", role: "Consultor Sénior HSEQ", bio: "Auditor líder certificado com experiência em projectos de petróleo, gás e construção civil." },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-navy-gradient text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-4">Sobre a ALINVEST</h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
              Capacitamos profissionais e organizações em Moçambique através de formação especializada e consultoria de excelência.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div {...fadeInUp}>
              <Card className="h-full border-border shadow-card">
                <CardContent className="p-8">
                  <CollapsibleSection
                    title="Missão"
                    icon={<div className="p-2 rounded-lg bg-accent/10"><Target className="w-5 h-5 text-accent" /></div>}
                  >
                    <p className="text-muted-foreground leading-relaxed">
                      Desenvolver competências técnicas e de gestão que impulsionem o crescimento sustentável das organizações moçambicanas, através de formação certificada e consultoria especializada alinhada com as normas internacionais.
                    </p>
                  </CollapsibleSection>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ duration: 0.6, delay: 0.15 }}>
              <Card className="h-full border-border shadow-card">
                <CardContent className="p-8">
                  <CollapsibleSection
                    title="Visão"
                    icon={<div className="p-2 rounded-lg bg-primary/10"><Eye className="w-5 h-5 text-primary" /></div>}
                  >
                    <p className="text-muted-foreground leading-relaxed">
                      Ser a referência em formação profissional e consultoria empresarial em Moçambique, reconhecida pela qualidade dos programas, impacto nos resultados dos clientes e contribuição para o desenvolvimento do capital humano nacional.
                    </p>
                  </CollapsibleSection>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <CollapsibleSection
            title="Os Nossos Valores"
            icon={<Award className="w-5 h-5 text-accent" />}
            className="mb-8"
          >
            <p className="text-muted-foreground max-w-lg mb-8">Princípios que orientam cada acção e decisão na ALINVEST.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <motion.div key={v.title} {...fadeInUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                    <Card className="h-full text-center border-border shadow-card hover:shadow-card-hover transition-shadow">
                      <CardContent className="p-6">
                        <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="font-heading font-bold text-lg mb-2">{v.title}</h3>
                        <p className="text-sm text-muted-foreground">{v.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CollapsibleSection>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <CollapsibleSection
            title="A Nossa Equipa"
            icon={<Users className="w-5 h-5 text-primary" />}
            className="mb-8"
          >
            <p className="text-muted-foreground max-w-lg mb-8">Profissionais experientes e dedicados ao sucesso dos nossos formandos.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, i) => (
                <motion.div key={member.name} {...fadeInUp} transition={{ duration: 0.5, delay: i * 0.12 }}>
                  <Card className="h-full border-border shadow-card">
                    <CardContent className="p-6 text-center">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-heading font-bold text-lg">{member.name}</h3>
                      <p className="text-sm text-accent font-medium mb-3">{member.role}</p>
                      <p className="text-sm text-muted-foreground">{member.bio}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-gradient text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="font-heading text-3xl font-extrabold mb-4">Pronto para crescer connosco?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
              Explore os nossos cursos ou entre em contacto para uma formação à medida.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/cursos">
                <Button size="lg" variant="secondary">
                  Ver Cursos <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="whatsapp">
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
