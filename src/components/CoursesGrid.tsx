import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useCourses } from "@/hooks/use-courses";
import CourseCard from "./CourseCard";
import { CoursesListJsonLd } from "./CourseJsonLd";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const CoursesGrid = () => {
  const { data: courses, isLoading } = useCourses();
  const displayedCourses = courses?.slice(0, 6);
  const hasMore = (courses?.length ?? 0) > 6;

  return (
    <section id="cursos" className="py-20 lg:py-28 bg-background relative overflow-hidden">
      <div className="absolute -top-24 right-0 w-72 h-72 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <div className="container mx-auto px-4 relative">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: .6 }} className="max-w-2xl mb-12 lg:mb-14">
          <span className="inline-flex items-center gap-2 bg-accent/9 text-accent px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider mb-5 border border-accent/15">
            <BookOpen className="w-3.5 h-3.5" /> Formação especializada
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 leading-tight">
            Conhecimento que se <span className="text-gradient">transforma em prática.</span>
          </h2>
          <p className="text-muted-foreground max-w-xl leading-relaxed text-base md:text-lg">
            Escolha uma capacitação alinhada ao seu trabalho, desenvolva competências aplicáveis e avance com mais confiança.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[390px] rounded-2xl" />)}
          </div>
        ) : (
          <>
            {courses && courses.length > 0 && <CoursesListJsonLd courses={courses} />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCourses?.map((course, i) => <CourseCard key={course.id} course={course} index={i} />)}
            </div>
            {hasMore && (
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-center mt-12">
                <Link to="/cursos">
                  <Button variant="outline" size="lg" className="gap-2 rounded-xl border-2 px-8 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                    Ver todos os cursos <ArrowRight className="w-4 h-4" />
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
