import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useCourses } from "@/hooks/use-courses";
import CourseCard from "./CourseCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const CoursesGrid = () => {
  const { data: courses, isLoading } = useCourses();
  const displayedCourses = courses?.slice(0, 6);
  const hasMore = (courses?.length ?? 0) > 6;

  return (
    <section id="cursos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <motion.span
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <BookOpen className="w-4 h-4" />
            Formação Especializada
          </motion.span>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Cursos Disponíveis
          </h2>
          <motion.p
            className="text-muted-foreground max-w-lg mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Escolha o curso ideal para o seu desenvolvimento profissional.
            Pagamento flexível e certificação reconhecida.
          </motion.p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCourses?.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>

            {hasMore && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <Link to="/cursos">
                  <Button variant="outline" size="lg" className="gap-2 rounded-lg border-2">
                    Ver todos os cursos
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default CoursesGrid;
