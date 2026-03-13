import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin");

      if (roleError || !roles || roles.length === 0) {
        await supabase.auth.signOut();
        toast({ title: "Acesso negado", description: "Não tem permissões de administrador.", variant: "destructive" });
        return;
      }

      toast({ title: "Bem-vindo!", description: "Sessão iniciada com sucesso." });
      navigate("/backoffice");
    } catch (err: any) {
      toast({ title: "Erro de autenticação", description: err.message || "Credenciais inválidas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-gradient relative overflow-hidden px-4">
      <SEO title="Admin Login" noIndex />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-[400px] h-[400px] rounded-full opacity-10 bg-accent blur-3xl" />
        <div className="absolute bottom-20 right-10 w-[300px] h-[300px] rounded-full opacity-5 bg-primary-foreground blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary-foreground)) 1px, transparent 0)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-accent/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 border border-accent/20"
          >
            <Shield className="w-8 h-8 text-accent" />
          </motion.div>
          <h1 className="font-heading text-3xl font-extrabold text-primary-foreground">ALINVEST</h1>
          <p className="text-primary-foreground/50 text-sm mt-2">Backoffice — Área Administrativa</p>
        </div>

        <Card className="shadow-card-hover bg-card/95 backdrop-blur-xl border-border/50 rounded-2xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-accent via-brand-red-light to-accent" />
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="email" className="flex items-center gap-1.5 mb-2 text-sm font-medium">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@alinvest-group.com"
                  required
                  className="rounded-xl h-11"
                />
              </div>
              <div>
                <Label htmlFor="password" className="flex items-center gap-1.5 mb-2 text-sm font-medium">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Palavra-passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="rounded-xl h-11 pr-10"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" variant="navy" className="w-full rounded-xl h-11 font-semibold" disabled={loading}>
                {loading ? "A entrar..." : "Entrar no Backoffice"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-primary-foreground/30 mt-6">
          © {new Date().getFullYear()} ALINVEST — Acesso restrito
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
