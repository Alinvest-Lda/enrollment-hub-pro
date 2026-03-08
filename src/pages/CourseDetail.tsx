import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, CheckCircle, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, getWhatsAppLink } from "@/lib/courses-data";
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
          <div className="text-center">
            <h1 className="text-2xl font-heading font-bold mb-4">Curso não encontrado</h1>
            <Link to="/"><Button>Voltar aos cursos</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const whatsappMsg = `Olá, gostaria de obter mais informações sobre o curso: ${course.title}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="bg-navy-gradient text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary-foreground/70 hover:text-primary-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar aos cursos
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="secondary" className="mb-3">{course.category}</Badge>
            <h1 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">{course.title}</h1>
            <p className="text-primary-foreground/80 max-w-2xl mb-6">{course.description}</p>

            <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/70">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {course.duration}</span>
              {course.startDate && (
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Início: {new Date(course.startDate).toLocaleDateString("pt-MZ", { day: "numeric", month: "long", year: "numeric" })}</span>
              )}
              <span className="font-heading font-bold text-xl text-accent">{formatCurrency(course.price)}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-heading text-lg font-bold mb-3">O que vai aprender</h3>
              <ul className="space-y-2">
                {course.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-heading text-lg font-bold mb-3">Modalidades de Pagamento</h3>
              <div className="space-y-3">
                {course.paymentPlans.map((plan) => (
                  <div key={plan.id} className="bg-muted rounded-lg p-4">
                    <p className="font-heading font-semibold text-sm">{plan.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                    <div className="mt-2 space-y-1">
                      {plan.installments.map((inst, i) => (
                        <p key={i} className="text-xs text-foreground">
                          {inst.percentage}% ({formatCurrency(course.price * inst.percentage / 100)}) — {inst.dueDescription}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <a href={getWhatsAppLink(whatsappMsg)} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" className="w-full mt-4">
                <MessageCircle className="w-4 h-4" />
                Tirar dúvidas no WhatsApp
              </Button>
            </a>
          </div>

          <div className="lg:col-span-3">
            <EnrollmentForm course={course} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetail;
