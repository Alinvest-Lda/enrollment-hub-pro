import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import { useCourses } from "@/hooks/use-courses";
import CourseCard from "@/components/CourseCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const priceRanges = [
  { label: "Todos os preços", value: "all" },
  { label: "Até 20.000 MZN", value: "0-20000" },
  { label: "20.000 – 30.000 MZN", value: "20000-30000" },
  { label: "30.000 – 40.000 MZN", value: "30000-40000" },
  { label: "Acima de 40.000 MZN", value: "40000-999999" },
];

const AllCourses = () => {
  const { data: courses, isLoading } = useCourses();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  const categories = useMemo(() => {
    if (!courses) return [];
    return [...new Set(courses.map((c) => c.category))].sort();
  }, [courses]);

  const months = useMemo(() => {
    if (!courses) return [];
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.startDate) {
        const d = new Date(c.startDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        set.add(key);
      }
    });
    return [...set].sort();
  }, [courses]);

  const filtered = useMemo(() => {
    if (!courses) return [];
    return courses.filter((c) => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCategory !== "all" && c.category !== selectedCategory) return false;
      if (selectedPrice !== "all") {
        const [min, max] = selectedPrice.split("-").map(Number);
        if (c.price < min || c.price > max) return false;
      }
      if (selectedMonth !== "all" && c.startDate) {
        const d = new Date(c.startDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key !== selectedMonth) return false;
      }
      return true;
    });
  }, [courses, search, selectedCategory, selectedPrice, selectedMonth]);

  const hasActiveFilters = search || selectedCategory !== "all" || selectedPrice !== "all" || selectedMonth !== "all";

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedPrice("all");
    setSelectedMonth("all");
  };

  const formatMonth = (key: string) => {
    const [y, m] = key.split("-");
    const d = new Date(Number(y), Number(m) - 1);
    return d.toLocaleDateString("pt-MZ", { month: "long", year: "numeric" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="bg-navy-gradient text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-3xl md:text-4xl font-extrabold mb-2">Todos os Cursos</h1>
            <p className="text-primary-foreground/70">Encontre a formação ideal para si ou para a sua organização.</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 mb-8 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="font-heading font-semibold text-sm">Filtros</span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-xs gap-1">
                <X className="w-3 h-3" /> Limpar
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar cursos..."
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger><SelectValue placeholder="Mês de início" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer data</SelectItem>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>{formatMonth(m)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPrice} onValueChange={setSelectedPrice}>
              <SelectTrigger><SelectValue placeholder="Preço" /></SelectTrigger>
              <SelectContent>
                {priceRanges.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-2">Nenhum curso encontrado</p>
            <p className="text-muted-foreground text-sm">Tente ajustar os filtros ou pesquise por outro termo.</p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">Limpar filtros</Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{filtered.length} curso{filtered.length !== 1 ? "s" : ""}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AllCourses;
