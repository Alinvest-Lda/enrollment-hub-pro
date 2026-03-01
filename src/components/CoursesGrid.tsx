import { motion } from "framer-motion";
import { COURSES } from "@/lib/courses-data";
import CourseCard from "./CourseCard";

const CoursesGrid = () => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COURSES.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesGrid;
