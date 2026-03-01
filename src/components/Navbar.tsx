import { Link } from "react-router-dom";
import { MessageCircle, Phone, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WHATSAPP_LINK } from "@/lib/courses-data";
import { useState } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-heading text-2xl font-extrabold tracking-tight text-primary">
            ALINVEST
          </span>
          <span className="hidden sm:inline-block text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Academy
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
            Cursos
          </Link>
          <Link to="/backoffice" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Backoffice
          </Link>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
            <Button variant="whatsapp" size="sm">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
          <Link to="/" className="block text-sm font-medium" onClick={() => setMobileOpen(false)}>
            Cursos
          </Link>
          <Link to="/backoffice" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
            Backoffice
          </Link>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
            <Button variant="whatsapp" size="sm" className="w-full">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
