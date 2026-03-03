import { motion } from "framer-motion";
import { useCourses } from "@/hooks/use-courses";
import CourseCard from "./CourseCard";
import { Skeleton } from "@/components/ui/skeleton";

const CoursesGrid = () => {
  const { data: courses, isLoading } = useCourses();

  return (
    <section id="cursos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Cursos Disponíveis
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Escolha o curso ideal para o seu desenvolvimento profissional.
            Pagamento flexível e certificação reconhecida.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesGrid;
