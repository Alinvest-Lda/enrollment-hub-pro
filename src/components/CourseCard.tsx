import { motion } from "framer-motion";
import { Clock, Calendar, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Course, formatCurrency } from "@/lib/courses-data";
import { Link } from "react-router-dom";

interface CourseCardProps {
  course: Course;
  index: number;
}

const CourseCard = ({ course, index }: CourseCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
    >
      <Card className="group overflow-hidden border-border bg-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col rounded-xl">
        {/* Course Image */}
        {course.image ? (
          <div className="relative h-44 overflow-hidden">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <Badge variant="secondary" className="absolute top-3 left-3 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
              {course.category}
            </Badge>
            <motion.span
              className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-accent font-heading font-extrabold text-lg px-3 py-1 rounded-lg"
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
            >
              {formatCurrency(course.price)}
            </motion.span>
          </div>
        ) : (
          <>
            <motion.div
              className="h-1.5 bg-navy-gradient"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 + 0.3, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
            <div className="flex items-start justify-between p-5 pb-0 sm:p-6 sm:pb-0">
              <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wide">
                {course.category}
              </Badge>
              <motion.span
                className="text-accent font-heading font-extrabold text-xl"
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
              >
                {formatCurrency(course.price)}
              </motion.span>
            </div>
          </>
        )}

        <CardContent className={`flex flex-col flex-1 ${course.image ? 'p-5 sm:p-6' : 'p-5 pt-4 sm:p-6 sm:pt-4'}`}>
          <h3 className="font-heading text-base sm:text-lg font-bold text-foreground mb-2 leading-snug group-hover:text-accent transition-colors line-clamp-2">
            {course.title}
          </h3>

          <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1 line-clamp-3">
            {course.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent/60" />
              {course.duration}
            </span>
            {course.startDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent/60" />
                {new Date(course.startDate).toLocaleDateString("pt-MZ", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {course.highlights.slice(0, 3).map((h, hi) => (
              <motion.span
                key={h}
                className="inline-flex items-center gap-1 text-[11px] bg-muted text-muted-foreground px-2.5 py-1 rounded-full font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.3 + hi * 0.05 }}
              >
                <Tag className="w-2.5 h-2.5" />
                {h}
              </motion.span>
            ))}
          </div>

          <Link to={`/curso/${course.id}`}>
            <Button variant="navy" className="w-full group-hover:shadow-md transition-shadow">
              Inscrever-se
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
