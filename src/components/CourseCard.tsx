import { motion } from "framer-motion";
import { Clock, Calendar, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Course, formatCurrency } from "@/lib/courses-data";
import { Link } from "react-router-dom";

interface CourseCardProps { course: Course; index: number; }

const CourseCard = ({ course, index }: CourseCardProps) => (
  <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: .5, delay: index * .06 }} whileHover={{ y: -6, transition: { duration: .2 } }}>
    <Card className="group overflow-hidden border-border/80 bg-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col rounded-2xl relative">
      <div className="h-1 bg-gradient-to-r from-accent via-brand-red-light to-brand-gold" />
      <div className="flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0">
        <Badge variant="secondary" className="text-[10px] font-extrabold uppercase tracking-wider rounded-full px-3 py-1">
          {course.category}
        </Badge>
        <span className="text-accent font-heading font-extrabold text-xl whitespace-nowrap">{formatCurrency(course.price)}</span>
      </div>

      <CardContent className="flex flex-col flex-1 p-5 pt-4 sm:p-6 sm:pt-4">
        <h3 className="font-heading text-lg font-bold text-foreground mb-2.5 leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1 line-clamp-3">{course.description}</p>

        {course.highlights[0] && (
          <div className="mb-4 rounded-xl bg-accent/6 border border-accent/12 px-3.5 py-3">
            <p className="text-[9px] uppercase tracking-[.14em] font-extrabold text-accent mb-1">Resultado prático</p>
            <p className="text-xs font-semibold text-foreground line-clamp-2">{course.highlights[0]}</p>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b border-border/70">
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-accent" />{course.duration}</span>
          {course.startDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              {new Date(course.startDate).toLocaleDateString("pt-MZ", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {course.highlights.slice(0, 3).map((h) => (
            <span key={h} className="inline-flex items-center gap-1 text-[10px] bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full font-semibold">
              <Tag className="w-2.5 h-2.5" />{h}
            </span>
          ))}
        </div>

        <Link to={`/curso/${course.id}`}>
          <Button variant="navy" className="w-full h-11 rounded-xl group/btn relative overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">Ver curso e inscrever-se
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
            </span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  </motion.div>
);

export default CourseCard;
