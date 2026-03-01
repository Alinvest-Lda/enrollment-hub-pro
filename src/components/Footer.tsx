import { MessageCircle, Mail, MapPin, Phone } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/courses-data";

const Footer = () => {
  return (
    <footer className="bg-navy-gradient text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading text-xl font-bold mb-3">ALINVEST Academy</h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Consultoria e formação especializada para o crescimento do seu negócio em Moçambique.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-3">Contactos</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                Maputo, Moçambique
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                info@alinvest-group.com
              </li>
              <li>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-3">Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="https://alinvest-group.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">Site Institucional</a></li>
              <li><a href="https://pecb.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors">PECB</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-6 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} ALINVEST Sociedade Unipessoal Lda. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
