import { motion } from "framer-motion";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useFAQs } from "@/hooks/use-site-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSystemSettings, getWhatsAppUrl } from "@/hooks/use-system-settings";

const FAQSection = () => {
  const { data: faqs = [], isLoading } = useFAQs();
  const { data: settings } = useSystemSettings();
  const whatsappLink = getWhatsAppUrl(settings?.whatsappNumber || "");
  if (isLoading) return <section className="py-20 bg-background"><div className="container mx-auto px-4 max-w-3xl"><Skeleton className="h-5 w-32 mx-auto mb-5" /><Skeleton className="h-10 w-72 mx-auto mb-10" />{[1,2,3].map(i=><Skeleton key={i} className="h-16 mb-3 rounded-2xl" />)}</div></section>;
  if (!faqs.length) return null;

  return (
    <section id="faq" className="py-20 lg:py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-accent/5 blur-3xl rounded-full pointer-events-none" />
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-[.78fr_1.22fr] gap-10 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-28">
            <span className="inline-flex items-center gap-2 text-accent text-[10px] font-extrabold uppercase tracking-[.16em] mb-4"><HelpCircle className="w-3.5 h-3.5" /> Perguntas frequentes</span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold leading-tight">Antes de se inscrever, esclareça as principais dúvidas.</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mt-4 max-w-md">Informação simples sobre inscrições, pagamentos, certificados e funcionamento das formações.</p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-block mt-7"><Button variant="outline" className="rounded-xl gap-2 h-11"><MessageCircle className="w-4 h-4 text-success" /> Falar no WhatsApp</Button></a>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div key={faq.id} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * .04, duration: .35 }}>
                <AccordionItem value={`faq-${faq.id}`} className="bg-card border border-border/70 rounded-2xl px-5 sm:px-6 data-[state=open]:border-accent/20 data-[state=open]:shadow-card transition-all">
                  <AccordionTrigger className="text-left font-heading font-bold text-sm md:text-base hover:no-underline py-5 hover:text-accent">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5 pr-5">{faq.answer}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
export default FAQSection;
