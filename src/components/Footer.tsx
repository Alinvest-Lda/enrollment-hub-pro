import { Link } from "react-router-dom";
import { MessageCircle, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { useSystemSettings, getWhatsAppUrl } from "@/hooks/use-system-settings";
import logo from "@/assets/logo.png";

const Footer = () => {
  const { data: settings } = useSystemSettings();
  const whatsappLink = getWhatsAppUrl(settings?.whatsappNumber || "");

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-navy-gradient text-primary-foreground relative overflow-hidden">
      {/* Decorative accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-accent via-brand-red-light to-accent" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <img src={logo} alt="ALINVEST" className="h-9 mb-5 brightness-0 invert" />
            <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-xs mb-6">
              Consultoria e formação especializada para o crescimento do seu negócio em Moçambique.
            </p>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors group"
            >
              Voltar ao topo
              <ArrowUpRight className="w-3 h-3 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-5 text-primary-foreground/80">
              Navegação
            </h4>
            <ul className="space-y-3 text-sm text-primary-foreground/60">
              <li>
                <Link to="/" className="hover:text-primary-foreground transition-colors inline-flex items-center gap-1 group">
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link to="/cursos" className="hover:text-primary-foreground transition-colors">Todos os Cursos</Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-primary-foreground transition-colors">Sobre Nós</Link>
              </li>
              <li>
                <Link to="/verificar-certificado" className="hover:text-primary-foreground transition-colors">Verificar Certificado</Link>
              </li>
            </ul>
          </div>

          {/* Contactos */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-5 text-primary-foreground/80">Contactos</h4>
            <ul className="space-y-3.5 text-sm text-primary-foreground/60">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 shrink-0 text-accent mt-0.5" />
                <span>{settings?.companyAddress || "Maputo, Moçambique"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-accent" />
                <a href={`mailto:${settings?.companyEmail || "info@alinvest-group.com"}`} className="hover:text-primary-foreground transition-colors">
                  {settings?.companyEmail || "info@alinvest-group.com"}
                </a>
              </li>
              {settings?.whatsappNumber && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 shrink-0 text-accent" />
                  <span>{settings.whatsappNumber}</span>
                </li>
              )}
              <li>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-primary-foreground transition-colors">
                  <MessageCircle className="w-4 h-4 shrink-0 text-success" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-5 text-primary-foreground/80">Legal</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/60">
              <li>
                <Link to="/politica-de-privacidade" className="hover:text-primary-foreground transition-colors">Política de Privacidade</Link>
              </li>
              <li>
                <Link to="/termos-de-uso" className="hover:text-primary-foreground transition-colors">Termos de Uso</Link>
              </li>
              <li>
                <a href="https://alinvest-group.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors inline-flex items-center gap-1">
                  Site Institucional
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} ALINVEST Sociedade Unipessoal Lda. Todos os direitos reservados.
          </p>
          <p className="text-xs text-primary-foreground/30">
            Maputo, Moçambique
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
