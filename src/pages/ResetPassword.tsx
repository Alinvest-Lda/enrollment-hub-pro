import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Erro", description: "As palavras-passe não coincidem.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Erro", description: "A palavra-passe deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({ title: "Palavra-passe alterada", description: "Pode agora iniciar sessão com a nova palavra-passe." });
      await supabase.auth.signOut();
      navigate("/admin");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Não foi possível alterar a palavra-passe.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-gradient px-4">
        <SEO title="Redefinir Palavra-passe" noIndex />
        <Card className="w-full max-w-md shadow-card-hover bg-card/95 backdrop-blur-xl border-border/50 rounded-2xl">
          <CardContent className="p-8 text-center">
            <KeyRound className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-heading text-xl font-bold mb-2">Link inválido ou expirado</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Este link de recuperação não é válido. Solicite um novo na página de login.
            </p>
            <Button variant="navy" className="rounded-xl" onClick={() => navigate("/admin")}>
              Voltar ao login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-gradient relative overflow-hidden px-4">
      <SEO title="Redefinir Palavra-passe" noIndex />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-[400px] h-[400px] rounded-full opacity-10 bg-accent blur-3xl" />
        <div className="absolute bottom-20 right-10 w-[300px] h-[300px] rounded-full opacity-5 bg-primary-foreground blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-accent/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 border border-accent/20"
          >
            <KeyRound className="w-8 h-8 text-accent" />
          </motion.div>
          <h1 className="font-heading text-3xl font-extrabold text-primary-foreground">Nova Palavra-passe</h1>
          <p className="text-primary-foreground/50 text-sm mt-2">Defina a sua nova palavra-passe de acesso</p>
        </div>

        <Card className="shadow-card-hover bg-card/95 backdrop-blur-xl border-border/50 rounded-2xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-accent via-brand-red-light to-accent" />
          <CardContent className="p-8">
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <Label htmlFor="password" className="flex items-center gap-1.5 mb-2 text-sm font-medium">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Nova palavra-passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="rounded-xl h-11 pr-10"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm" className="flex items-center gap-1.5 mb-2 text-sm font-medium">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Confirmar palavra-passe
                </Label>
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a palavra-passe"
                  required
                  className="rounded-xl h-11"
                />
              </div>
              <Button type="submit" variant="navy" className="w-full rounded-xl h-11 font-semibold" disabled={loading}>
                {loading ? "A alterar..." : "Alterar palavra-passe"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
