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
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group overflow-hidden border-border bg-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col">
        <div className="h-2 bg-navy-gradient" />
        <CardContent className="p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-3">
            <Badge variant="secondary" className="text-xs font-medium">
              {course.category}
            </Badge>
            <span className="text-accent font-heading font-bold text-lg">
              {formatCurrency(course.price)}
            </span>
          </div>

          <h3 className="font-heading text-lg font-bold text-foreground mb-2 leading-snug group-hover:text-accent transition-colors">
            {course.title}
          </h3>

          <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">
            {course.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(course.startDate).toLocaleDateString("pt-MZ", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {course.highlights.slice(0, 3).map((h) => (
              <span key={h} className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                <Tag className="w-2.5 h-2.5" />
                {h}
              </span>
            ))}
          </div>

          <Link to={`/curso/${course.id}`}>
            <Button variant="navy" className="w-full">
              Inscrever-se
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
