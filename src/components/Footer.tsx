import { Link } from "react-router-dom";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { useSystemSettings, getWhatsAppUrl } from "@/hooks/use-system-settings";
import logo from "@/assets/logo.png";

const Footer = () => {
  const { data: settings } = useSystemSettings();
  const whatsappLink = getWhatsAppUrl(settings?.whatsappNumber || "");

  return (
    <footer className="bg-navy-gradient text-primary-foreground">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <img src={logo} alt="ALINVEST" className="h-8 mb-4 brightness-0 invert" />
            <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-xs">
              Consultoria e formação especializada para o crescimento do seu negócio em Moçambique.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">Contactos</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/60">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 shrink-0 text-accent" />
                {settings?.companyAddress || "Maputo, Moçambique"}
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-accent" />
                {settings?.companyEmail || "info@alinvest-group.com"}
              </li>
              <li>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-primary-foreground transition-colors">
                  <MessageCircle className="w-4 h-4 shrink-0 text-success" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">Links</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/60">
              <li>
                <Link to="/sobre" className="hover:text-primary-foreground transition-colors">Sobre Nós</Link>
              </li>
              <li>
                <Link to="/cursos" className="hover:text-primary-foreground transition-colors">Todos os Cursos</Link>
              </li>
              <li>
                <a href="https://alinvest-group.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">Site Institucional</a>
              </li>
              <li>
                <Link to="/politica-de-privacidade" className="hover:text-primary-foreground transition-colors">Política de Privacidade</Link>
              </li>
              <li>
                <Link to="/termos-de-uso" className="hover:text-primary-foreground transition-colors">Termos de Uso</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} ALINVEST Sociedade Unipessoal Lda. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
