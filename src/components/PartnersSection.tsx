import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Handshake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  description: string;
  courses_url: string | null;
  display_order: number;
}

const PartnersSection = () => {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("partners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (data) setPartners(data as unknown as Partner[]);
    })();
  }, []);

  if (partners.length === 0) return null;

  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Handshake className="w-3.5 h-3.5" />
            Parceiros & Certificações
          </motion.div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
            Parceiros de Confiança
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Trabalhamos com organizações de referência internacional para garantir a qualidade das nossas formações.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-background rounded-xl border border-border p-6 flex flex-col items-center text-center hover:shadow-card-hover hover:border-accent/20 transition-all duration-300"
            >
              {/* Logo */}
              <div className="w-20 h-20 mb-4 flex items-center justify-center">
                {partner.logo_url ? (
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <span className="font-heading text-lg font-bold text-muted-foreground">
                      {partner.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="font-heading text-sm font-bold text-foreground mb-1">{partner.name}</h3>
              <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">{partner.description}</p>

              <div className="flex gap-2 mt-auto">
                {partner.website_url && (
                  <a href={partner.website_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="h-7 text-[10px]">
                      <ExternalLink className="w-3 h-3 mr-1" />Site
                    </Button>
                  </a>
                )}
                {partner.courses_url && (
                  <a href={partner.courses_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="h-7 text-[10px]">
                      Cursos
                    </Button>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
