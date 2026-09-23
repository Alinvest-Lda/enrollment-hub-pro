import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Award, CheckCircle, XCircle, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CertificateData {
  certificate_code: string;
  student_name: string;
  course_name: string;
  course_duration: string;
  issue_date: string;
  status: string;
}

export default function VerifyCertificate() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchCode?: string) => {
    const c = searchCode || code;
    if (!c.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);
    setSearched(true);

    const { data, error } = await supabase
      .from("certificates")
      .select("certificate_code, student_name, course_name, course_duration, issue_date, status")
      .eq("certificate_code", c.trim().toUpperCase())
      .maybeSingle();

    if (error || !data) {
      setNotFound(true);
    } else {
      setResult(data as unknown as CertificateData);
    }
    setLoading(false);
  };

  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) {
      setCode(urlCode.toUpperCase());
      handleSearch(urlCode.toUpperCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Verificar Certificado"
        description="Verifique a autenticidade de um certificado ALINVEST inserindo o código único."
        path="/verificar-certificado"
      />
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-navy-gradient text-primary-foreground">
          <div className="absolute inset-0 bg-hero-overlay" />
          <div className="container relative mx-auto px-4 py-16 sm:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 ring-1 ring-accent/30">
                <ShieldCheck className="h-7 w-7 text-accent" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
                Autenticidade e confiança
              </p>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Verificação de Certificados
              </h1>
              <p className="text-sm sm:text-base text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed">
                Confirme a autenticidade de um certificado ALINVEST através do seu código único de verificação.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-8 lg:gap-12 items-start">
            <div>
              <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                <img
                  src="/images/certificate-illustrative.png"
                  alt="Exemplo de Certificado ALINVEST"
                  className="w-full h-auto object-contain"
                />
              </div>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                Modelo ilustrativo de certificado
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">Verificação online</p>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
                  Introduza o código do certificado
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  O código encontra-se no certificado emitido pela ALINVEST. A consulta apresenta os dados registados no sistema.
                </p>
              </div>

              <Card className="shadow-card border-border">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      aria-label="Código do certificado"
                      placeholder="Ex: CERT-2026-XXXX"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="h-11 font-mono tracking-wider"
                    />
                    <Button
                      onClick={() => handleSearch()}
                      disabled={loading || !code.trim()}
                      className="h-11 sm:min-w-32"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Search className="w-4 h-4 mr-2" />
                      )}
                      Verificar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {searched && !loading && (
                <>
                  {result ? (
                    <Card className="border-success/30 shadow-card">
                      <CardContent className="p-6 text-center space-y-5">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                          <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                        <div>
                          <h3 className="font-heading text-xl font-bold text-success mb-1">Certificado Válido</h3>
                          <p className="text-sm text-muted-foreground">
                            Este certificado foi encontrado e está registado no sistema ALINVEST.
                          </p>
                        </div>

                        <div className="bg-muted/50 rounded-xl p-4 text-left space-y-3 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Código</span>
                            <span className="font-mono font-bold text-right">{result.certificate_code}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Estudante</span>
                            <span className="font-semibold text-right">{result.student_name}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Curso</span>
                            <span className="text-right">{result.course_name}</span>
                          </div>
                          {result.course_duration && (
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Duração</span>
                              <span className="text-right">{result.course_duration}</span>
                            </div>
                          )}
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Emitido em</span>
                            <span className="text-right">{new Date(result.issue_date).toLocaleDateString("pt-PT")}</span>
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-muted-foreground">Estado</span>
                            <Badge variant={result.status === "active" ? "default" : "destructive"}>
                              {result.status === "active" ? "Activo" : "Revogado"}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col items-center pt-1">
                          <QRCodeSVG
                            value={`${window.location.origin}/verificar-certificado?code=${encodeURIComponent(result.certificate_code)}`}
                            size={80}
                            level="M"
                            includeMargin
                            className="rounded"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">QR Code de verificação</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : notFound ? (
                    <Card className="border-destructive/30 shadow-card">
                      <CardContent className="p-6 text-center space-y-4">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                          <XCircle className="w-8 h-8 text-destructive" />
                        </div>
                        <div>
                          <h3 className="font-heading text-xl font-bold text-destructive mb-2">Certificado Não Encontrado</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            O código &quot;{code}&quot; não corresponde a nenhum certificado registado. Verifique o código e tente novamente.
                          </p>
                        </div>
                        <Button variant="outline" onClick={() => { setCode(""); setSearched(false); setNotFound(false); }}>
                          Tentar novamente
                        </Button>
                      </CardContent>
                    </Card>
                  ) : null}
                </>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link to="/cursos" className="inline-flex items-center gap-1.5 text-accent font-semibold hover:underline">
                  Explorar cursos <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-border">•</span>
                <Link to="/sobre" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sobre a ALINVEST
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
