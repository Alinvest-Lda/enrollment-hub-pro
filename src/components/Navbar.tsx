import { Link, useLocation } from "react-router-dom";
import { MessageCircle, Menu, X, Lock, ChevronRight } from "lucide-react";
import { NotificationBell } from "@/components/InAppNotifications";
import { Button } from "@/components/ui/button";
import { useSystemSettings, getWhatsAppUrl } from "@/hooks/use-system-settings";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const navLinks = [
  { to: "/", label: "Cursos" },
  { to: "/sobre", label: "Sobre Nós" },
  { to: "/verificar-certificado", label: "Certificados" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { data: settings } = useSystemSettings();
  const whatsappLink = getWhatsAppUrl(settings?.whatsappNumber || "");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-card/95 backdrop-blur-xl border-b border-border shadow-card"
        : "bg-card/90 backdrop-blur-lg border-b border-border/70"
    }`}>
      <div className="container mx-auto flex items-center justify-between h-[72px] px-4">
        <Link to="/" className="flex items-center group">
          <img src={logo} alt="ALINVEST" className="h-9 w-auto transition-transform duration-300 group-hover:scale-[1.03]" />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                className={`relative px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive ? "text-accent bg-accent/7" : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}>
                {link.label}
                {isActive && (
                  <motion.div layoutId="nav-indicator" className="absolute bottom-1 left-4 right-4 h-0.5 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                )}
              </Link>
            );
          })}
          <div className="ml-3 pl-3 border-l border-border flex items-center gap-2">
            <NotificationBell />
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" size="sm" className="rounded-xl px-4 shadow-sm">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </Button>
            </a>
            <Link to="/admin" title="Área Administrativa"
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              <Lock className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <button aria-label="Abrir menu" className="md:hidden p-2.5 rounded-xl hover:bg-secondary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-t border-border bg-card overflow-hidden">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, i) => {
                const isActive = location.pathname === link.to;
                return (
                  <motion.div key={link.to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <Link to={link.to}
                      className={`flex items-center justify-between px-3 py-3.5 text-sm font-semibold rounded-xl transition-colors ${
                        isActive ? "text-accent bg-accent/7" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                      onClick={() => setMobileOpen(false)}>
                      {link.label}<ChevronRight className="w-4 h-4 opacity-40" />
                    </Link>
                  </motion.div>
                );
              })}
              <div className="pt-4 pb-1 space-y-2 border-t border-border mt-3">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="whatsapp" size="sm" className="w-full h-11 rounded-xl">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </Button>
                </a>
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="block">
                  <Button variant="ghost" size="sm" className="w-full h-11 rounded-xl justify-start text-muted-foreground">
                    <Lock className="w-4 h-4 mr-2" /> Área Administrativa
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
