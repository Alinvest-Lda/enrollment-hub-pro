import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { Search, Award, CheckCircle, XCircle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
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

  // Auto-search if code is in URL params
  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) {
      setCode(urlCode.toUpperCase());
      handleSearch(urlCode.toUpperCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Verificar Certificado" description="Verifique a autenticidade de um certificado ALINVEST inserindo o código único." path="/verificar-certificado" />
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Verificar Certificado
            </h1>
            <p className="text-xs text-muted-foreground">ALINVEST</p>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Site</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Award className="w-16 h-16 mx-auto mb-4 text-primary/30" />
          <h2 className="font-heading text-2xl font-bold mb-2">Verificação de Certificados</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Introduza o código do certificado para verificar a sua autenticidade.
          </p>
        </div>

        {/* Illustrative certificate image */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="rounded-lg border border-border overflow-hidden shadow-sm">
            <img
              src="/images/certificate-illustrative.png"
              alt="Exemplo de Certificado ALINVEST"
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1">Modelo ilustrativo de certificado</p>
        </div>

        <div className="flex gap-2 max-w-md mx-auto mb-8">
          <Input
            placeholder="Ex: CERT-2026-XXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="text-center font-mono tracking-wider"
          />
          <Button onClick={() => handleSearch()} disabled={loading || !code.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {searched && !loading && (
          <>
            {result ? (
              <Card className="max-w-md mx-auto border-green-500/30">
                <CardContent className="p-6 text-center space-y-4">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
                  <div>
                    <h3 className="font-heading text-lg font-bold text-green-600 mb-1">Certificado Válido</h3>
                    <p className="text-xs text-muted-foreground">Este certificado é autêntico e foi emitido pela ALINVEST.</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Código:</span>
                      <span className="font-mono font-bold">{result.certificate_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estudante:</span>
                      <span className="font-semibold">{result.student_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Curso:</span>
                      <span>{result.course_name}</span>
                    </div>
                    {result.course_duration && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duração:</span>
                        <span>{result.course_duration}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Emitido em:</span>
                      <span>{new Date(result.issue_date).toLocaleDateString("pt-PT")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Estado:</span>
                      <Badge variant={result.status === "active" ? "default" : "destructive"}>
                        {result.status === "active" ? "Activo" : "Revogado"}
                      </Badge>
                    </div>
                  </div>

                  {/* QR Code for this certificate */}
                  <div className="flex flex-col items-center pt-2">
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
              <Card className="max-w-md mx-auto border-destructive/30">
                <CardContent className="p-6 text-center space-y-3">
                  <XCircle className="w-12 h-12 mx-auto text-destructive" />
                  <h3 className="font-heading text-lg font-bold text-destructive">Certificado Não Encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    O código "{code}" não corresponde a nenhum certificado registado. Verifique o código e tente novamente.
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
