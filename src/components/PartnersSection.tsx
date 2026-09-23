import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Handshake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Partner {
  id: string; name: string; logo_url: string; website_url: string | null;
  description: string; courses_url: string | null; display_order: number;
}

const PartnersSection = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("partners").select("*").eq("is_active", true).order("display_order", { ascending: true });
      if (data) setPartners(data as unknown as Partner[]);
    })();
  }, []);

  if (!partners.length) return null;

  return (
    <section className="py-20 lg:py-24 bg-card border-y border-border/60 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--accent)/.07),transparent_25%),radial-gradient(circle_at_85%_80%,hsl(var(--navy)/.05),transparent_25%)]" />
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 lg:mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-accent text-[10px] font-extrabold uppercase tracking-[.16em] mb-4">
              <Handshake className="w-3.5 h-3.5" /> Parceiros
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
              Organizações que fazem parte do nosso ecossistema.
            </h2>
          </div>
          <p className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
            Parcerias que complementam a nossa oferta e ajudam a aproximar formação, conhecimento e prática profissional.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {partners.map((partner, i) => (
            <motion.div key={partner.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }} transition={{ delay: i * .05, duration: .45 }}
              whileHover={{ y: -4 }} className="group rounded-2xl border border-border/70 bg-background p-5 min-h-[190px] flex flex-col items-center text-center transition-all duration-300 hover:border-accent/25 hover:shadow-card-hover">
              <div className="h-16 w-full mb-4 flex items-center justify-center">
                {partner.logo_url ? <img src={partner.logo_url} alt={partner.name} className="max-w-[130px] max-h-14 object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
                  : <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center font-heading font-bold text-muted-foreground">{partner.name.charAt(0)}</div>}
              </div>
              <h3 className="font-heading text-sm font-bold text-foreground">{partner.name}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5 line-clamp-2 flex-1">{partner.description}</p>
              <div className="flex gap-2 mt-3">
                {partner.website_url && <a href={partner.website_url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] rounded-lg"><ExternalLink className="w-3 h-3 mr-1" /> Site</Button></a>}
                {partner.courses_url && <a href={partner.courses_url} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm" className="h-7 px-2 text-[10px] rounded-lg">Cursos</Button></a>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default PartnersSection;
