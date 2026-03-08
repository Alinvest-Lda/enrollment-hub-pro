import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Aceitação dos Termos",
    content: `Ao aceder e utilizar este site, e ao inscrever-se nos nossos cursos ou solicitar serviços, concorda com os presentes Termos de Uso. Se não concordar com algum dos termos, não deve utilizar os nossos serviços.`,
  },
  {
    title: "2. Serviços Oferecidos",
    content: `A ALINVEST oferece serviços de formação profissional, consultoria empresarial e emissão de certificados. Os serviços incluem:

• Cursos presenciais e online em gestão, normas ISO, HSEQ e liderança
• Treinamentos personalizados para organizações
• Emissão de certificados de conclusão
• Consultoria em sistemas de gestão`,
  },
  {
    title: "3. Inscrições e Pagamentos",
    content: `Ao submeter uma inscrição, compromete-se a fornecer informações verdadeiras e completas. As inscrições estão sujeitas a confirmação após validação do pagamento.

• Os pagamentos podem ser efectuados via M-Pesa, transferência bancária ou e-Mola
• Os planos de pagamento em prestações devem ser cumpridos nas datas acordadas
• O não cumprimento dos pagamentos pode resultar na suspensão do acesso ao curso
• Reembolsos são analisados caso a caso e devem ser solicitados até 48 horas antes do início do curso`,
  },
  {
    title: "4. Certificados",
    content: `Os certificados são emitidos apenas a participantes que cumpram os requisitos mínimos de assiduidade e avaliação definidos para cada curso. Os certificados contêm um código único de verificação e podem ser validados publicamente no nosso site.

A ALINVEST reserva-se o direito de revogar certificados emitidos com base em informações falsas.`,
  },
  {
    title: "5. Propriedade Intelectual",
    content: `Todo o conteúdo deste site, incluindo textos, imagens, logótipos, materiais didácticos e software, é propriedade da ALINVEST ou dos seus parceiros e está protegido por direitos de autor. É proibida a reprodução, distribuição ou modificação sem autorização prévia por escrito.`,
  },
  {
    title: "6. Responsabilidades do Utilizador",
    content: `Ao utilizar os nossos serviços, compromete-se a:

• Fornecer informações verdadeiras e actualizadas
• Não partilhar credenciais de acesso com terceiros
• Não reproduzir ou distribuir materiais dos cursos sem autorização
• Manter um comportamento respeitoso durante as formações
• Cumprir os prazos de pagamento acordados`,
  },
  {
    title: "7. Limitação de Responsabilidade",
    content: `A ALINVEST esforça-se por garantir a qualidade e exactidão dos conteúdos formativos, mas não garante resultados específicos. Não nos responsabilizamos por:

• Decisões profissionais tomadas com base nos conhecimentos adquiridos
• Indisponibilidade temporária do site por motivos técnicos
• Alterações de calendário ou formato dos cursos por motivos de força maior`,
  },
  {
    title: "8. Alterações aos Termos",
    content: `A ALINVEST reserva-se o direito de modificar estes Termos de Uso a qualquer momento. As alterações entram em vigor após publicação no site. O uso continuado dos serviços após alterações constitui aceitação dos novos termos.`,
  },
  {
    title: "9. Lei Aplicável",
    content: `Estes Termos de Uso são regidos pela legislação da República de Moçambique. Qualquer litígio será submetido aos tribunais competentes da cidade de Maputo.`,
  },
  {
    title: "10. Contacto",
    content: `Para questões relacionadas com estes Termos de Uso:

• Email: info@alinvest-group.com
• WhatsApp: através do botão disponível no site
• Morada: Maputo, Moçambique`,
  },
];

const TermsOfUse = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Termos de Uso"
        description="Termos e condições de uso dos serviços da ALINVEST. Inscrições, pagamentos, certificados e responsabilidades."
        path="/termos-de-uso"
      />
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>

          <h1 className="font-heading text-3xl md:text-4xl font-extrabold mb-2">Termos de Uso</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Última actualização: Março de 2026
          </p>

          <div className="prose prose-sm max-w-none space-y-8">
            <p className="text-muted-foreground leading-relaxed">
              Estes Termos de Uso regulam a utilização do site e dos serviços da ALINVEST Sociedade Unipessoal Lda. ("ALINVEST"), com sede em Maputo, Moçambique.
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

export default TermsOfUse;
