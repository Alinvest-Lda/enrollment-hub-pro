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
        <motion.div
          className="h-1.5 bg-navy-gradient"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.1 + 0.3, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
        />
        <CardContent className="p-5 sm:p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-4">
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
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-accent/60" />
              {new Date(course.startDate).toLocaleDateString("pt-MZ", { day: "numeric", month: "short", year: "numeric" })}
            </span>
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
