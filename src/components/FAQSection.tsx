import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona o processo de inscrição?",
    answer:
      "Escolha o curso desejado, preencha o formulário de inscrição com os seus dados e seleccione o plano de pagamento. Após submeter, receberá as instruções de pagamento. A sua inscrição será confirmada assim que o pagamento for verificado pela nossa equipa.",
  },
  {
    question: "Quais são os métodos de pagamento aceites?",
    answer:
      "Aceitamos transferência bancária, M-Pesa e e-Mola. Após a inscrição, receberá os dados para pagamento e poderá enviar o comprovativo directamente pelo formulário.",
  },
  {
    question: "Posso pagar em prestações?",
    answer:
      "Sim! Disponibilizamos planos de pagamento flexíveis dependendo da duração do curso. Pode optar por pagamento integral com desconto, ou dividir em 2 ou 3 prestações conforme o plano disponível para cada curso.",
  },
  {
    question: "Os cursos oferecem certificado?",
    answer:
      "Sim, todos os nossos cursos emitem um certificado de conclusão reconhecido, desde que o participante cumpra os requisitos mínimos de assiduidade e avaliação definidos para cada programa.",
  },
  {
    question: "Os cursos são presenciais ou online?",
    answer:
      "Oferecemos cursos em ambas as modalidades. Consulte a página de cada curso para verificar o formato disponível. Para treinamentos personalizados, podemos adaptar o formato às necessidades da sua equipa.",
  },
  {
    question: "Como solicitar um treinamento personalizado?",
    answer:
      "Utilize o formulário na secção 'Treinamento Personalizado' mais abaixo nesta página. Informe o tema, número de participantes e detalhes da sua necessidade. A nossa equipa entrará em contacto em até 48 horas com uma proposta à medida.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            Dúvidas Frequentes
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
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
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-heading font-semibold text-sm md:text-base hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
