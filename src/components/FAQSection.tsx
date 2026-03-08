import { motion } from "framer-motion";
import { HelpCircle, MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFAQs } from "@/hooks/use-site-content";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSystemSettings, getWhatsAppUrl } from "@/hooks/use-system-settings";

const FAQSection = () => {
  const { data: faqs = [], isLoading } = useFAQs();
  const { data: settings } = useSystemSettings();
  const whatsappLink = getWhatsAppUrl(settings?.whatsappNumber || "");

  if (isLoading) {
    return (
      <section id="faq" className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <Skeleton className="h-8 w-64 mx-auto mb-10" />
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 mb-3 rounded-xl" />)}
        </div>
      </section>
    );
  }

  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-flex items-center gap-2 bg-primary/8 text-primary px-5 py-2 rounded-full text-sm font-semibold mb-5 border border-primary/10"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <HelpCircle className="w-4 h-4" />
            Dúvidas Frequentes
          </motion.span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Encontre respostas rápidas sobre inscrições, pagamentos, certificados e muito mais.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <AccordionItem
                  value={`faq-${faq.id}`}
                  className="bg-card border border-border/60 rounded-xl px-6 data-[state=open]:shadow-card data-[state=open]:border-accent/15 transition-all duration-300"
                >
                  <AccordionTrigger className="text-left font-heading font-semibold text-sm md:text-base hover:no-underline py-5 hover:text-accent transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>

          {/* CTA below FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <p className="text-sm text-muted-foreground mb-3">Não encontrou a resposta que procurava?</p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="rounded-lg gap-2">
                <MessageCircle className="w-4 h-4 text-success" />
                Fale connosco no WhatsApp
              </Button>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
