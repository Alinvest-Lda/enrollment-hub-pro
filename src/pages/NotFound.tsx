import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, MessageCircle, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WHATSAPP_LINK } from "@/lib/courses-data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
            <SearchX className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-5xl font-extrabold text-primary mb-3">404</h1>
          <p className="text-lg text-foreground font-heading font-semibold mb-2">Página não encontrada</p>
          <p className="text-sm text-muted-foreground mb-8">
            A página que procura não existe ou foi movida. Verifique o endereço ou volte à página inicial.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/">
              <Button variant="navy" size="lg">
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Início
              </Button>
            </Link>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" size="lg">
                <MessageCircle className="w-4 h-4" />
                Precisa de Ajuda?
              </Button>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
