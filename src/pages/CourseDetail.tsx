import { useParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { ArrowLeft, Clock, Calendar, CheckCircle, MessageCircle, Shield, Award } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/courses-data";
import { useSystemSettings, getWhatsAppLinkFromNumber } from "@/hooks/use-system-settings";
import { useCourse } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnrollmentForm from "@/components/EnrollmentForm";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { course, isLoading } = useCourse(id);
  const { data: settings } = useSystemSettings();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="py-16 container mx-auto px-4 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-64 w-full mt-8" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center px-4"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-heading font-bold mb-3">Curso não encontrado</h1>
            <p className="text-muted-foreground mb-6">O curso que procura pode ter sido removido ou não existe.</p>
            <Link to="/"><Button className="rounded-lg">Voltar aos cursos</Button></Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const whatsappMsg = `Olá, gostaria de obter mais informações sobre o curso: ${course.title}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={course.title}
        description={`${course.description.substring(0, 150)}. Inscreva-se online na ALINVEST.`}
        path={`/curso/${id}`}
        ogImage={undefined}
      />
      <Navbar />

      {/* Hero with image background */}
      <section className="relative bg-navy-gradient text-primary-foreground py-20 overflow-hidden">
        {course.image && (
          <div className="absolute inset-0">
            <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
          </div>
        )}

        {/* Decorative orb */}
        <div className="absolute top-10 right-10 w-[300px] h-[300px] rounded-full opacity-10 bg-accent blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/60 hover:text-primary-foreground mb-8 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Voltar aos cursos
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="secondary" className="mb-4 backdrop-blur-sm bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">{course.category}</Badge>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 max-w-3xl leading-tight">{course.title}</h1>
            <p className="text-primary-foreground/75 max-w-2xl mb-8 text-base md:text-lg leading-relaxed">{course.description}</p>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-2 bg-primary-foreground/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary-foreground/10">
                  <Clock className="w-4 h-4" /> {course.duration}
                </span>
                {course.startDate && (
                  <span className="flex items-center gap-2 bg-primary-foreground/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary-foreground/10">
                    <Calendar className="w-4 h-4" /> Início: {new Date(course.startDate).toLocaleDateString("pt-MZ", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                )}
              </div>
              <span className="font-heading font-extrabold text-2xl md:text-3xl text-accent">{formatCurrency(course.price)}</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L60 34C120 28 240 16 360 12C480 8 600 12 720 16C840 20 960 24 1080 24C1200 24 1320 20 1380 18L1440 16V40H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-card">
              <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                O que vai aprender
              </h3>
              <ul className="space-y-3">
                {course.highlights.map((h, i) => (
                  <motion.li
                    key={h}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    {h}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-card">
              <h3 className="font-heading text-lg font-bold mb-4">Modalidades de Pagamento</h3>
              <div className="space-y-3">
                {course.paymentPlans.map((plan) => (
                  <div key={plan.id} className="bg-muted/50 rounded-xl p-4 border border-border/40">
                    <p className="font-heading font-semibold text-sm">{plan.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                    <div className="mt-2.5 space-y-1">
                      {plan.installments.map((inst, i) => (
                        <p key={i} className="text-xs text-foreground flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                          {inst.percentage}% ({formatCurrency(course.price * inst.percentage / 100)}) — {inst.dueDescription}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <a href={getWhatsAppLinkFromNumber(settings?.whatsappNumber || "", whatsappMsg)} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" className="w-full rounded-xl" size="lg">
                <MessageCircle className="w-4 h-4" />
                Tirar dúvidas no WhatsApp
              </Button>
            </a>
          </motion.div>

          {/* Right content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <EnrollmentForm course={course} />
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetail;
