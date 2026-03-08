import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "1. Informações que Recolhemos",
    content: `Recolhemos as seguintes informações quando se inscreve nos nossos cursos ou solicita treinamento personalizado:
    
• Nome completo
• Endereço de email
• Número de telefone/WhatsApp
• Empresa e NUIT (quando fornecidos voluntariamente)
• Comprovativos de pagamento (transferência bancária, e-Mola)

Não recolhemos dados sensíveis além dos necessários para a prestação dos nossos serviços.`,
  },
  {
    title: "2. Como Utilizamos os Seus Dados",
    content: `Os seus dados pessoais são utilizados para:

• Processar e confirmar inscrições em cursos
• Gerir pagamentos e emitir recibos
• Emitir certificados de conclusão
• Comunicar informações relevantes sobre o curso (horários, materiais, alterações)
• Enviar confirmações e actualizações via WhatsApp ou email
• Elaborar cotações e propostas de treinamento personalizado
• Melhorar os nossos serviços e experiência do utilizador`,
  },
  {
    title: "3. Partilha de Dados",
    content: `Não vendemos, alugamos ou partilhamos os seus dados pessoais com terceiros para fins de marketing. Os seus dados podem ser partilhados apenas com:

• Parceiros de certificação (ex: PECB) para efeitos de emissão de certificados internacionais
• Processadores de pagamento (M-Pesa/Vodacom) para processar transacções
• Autoridades competentes, quando exigido por lei`,
  },
  {
    title: "4. Segurança dos Dados",
    content: `Implementamos medidas técnicas e organizacionais para proteger os seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isto inclui encriptação de dados em trânsito, controlo de acesso restrito e armazenamento seguro de comprovativos de pagamento.`,
  },
  {
    title: "5. Retenção de Dados",
    content: `Mantemos os seus dados pessoais enquanto forem necessários para os fins para os quais foram recolhidos, incluindo obrigações legais, fiscais e de certificação. Os certificados emitidos são mantidos indefinidamente para efeitos de verificação.`,
  },
  {
    title: "6. Os Seus Direitos",
    content: `Tem o direito de:

• Aceder aos seus dados pessoais que temos armazenados
• Solicitar a correcção de dados incorrectos
• Solicitar a eliminação dos seus dados (quando não haja obrigação legal de retenção)
• Retirar o consentimento para comunicações de marketing

Para exercer estes direitos, contacte-nos através dos canais indicados abaixo.`,
  },
  {
    title: "7. Contacto",
    content: `Para questões relacionadas com a privacidade dos seus dados, contacte-nos:

• Email: info@alinvest-group.com
• WhatsApp: através do botão disponível no site
• Morada: Maputo, Moçambique`,
  },
  {
    title: "8. Alterações a esta Política",
    content: `Reservamo-nos o direito de actualizar esta política de privacidade a qualquer momento. Quaisquer alterações significativas serão comunicadas através do nosso site. A data da última actualização encontra-se no topo desta página.`,
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Política de Privacidade"
        description="Política de privacidade e protecção de dados pessoais da ALINVEST. Saiba como recolhemos, utilizamos e protegemos os seus dados."
        path="/politica-de-privacidade"
      />
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>

          <h1 className="font-heading text-3xl md:text-4xl font-extrabold mb-2">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Última actualização: Março de 2026
          </p>

          <div className="prose prose-sm max-w-none space-y-8">
            <p className="text-muted-foreground leading-relaxed">
              A ALINVEST Sociedade Unipessoal Lda. ("ALINVEST", "nós") compromete-se a proteger a privacidade e os dados pessoais dos seus clientes e utilizadores. Esta política descreve como recolhemos, utilizamos e protegemos as suas informações pessoais.
            </p>

            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-heading text-lg font-bold mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
