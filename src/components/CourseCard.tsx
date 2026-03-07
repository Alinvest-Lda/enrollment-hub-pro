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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Card className="group overflow-hidden border-border bg-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col rounded-xl">
        <div className="h-1.5 bg-navy-gradient" />
        <CardContent className="p-5 sm:p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-4">
            <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wide">
              {course.category}
            </Badge>
            <span className="text-accent font-heading font-extrabold text-xl">
              {formatCurrency(course.price)}
            </span>
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
            {course.highlights.slice(0, 3).map((h) => (
              <span key={h} className="inline-flex items-center gap-1 text-[11px] bg-muted text-muted-foreground px-2.5 py-1 rounded-full font-medium">
                <Tag className="w-2.5 h-2.5" />
                {h}
              </span>
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
