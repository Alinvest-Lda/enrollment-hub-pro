import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CourseRow } from "@/hooks/use-backoffice-data";

interface Props {
  courses: CourseRow[];
  onImport: (rows: Array<{
    full_name: string; email: string; phone: string; company?: string;
    course_id: string; course_name: string; payment_plan: string;
    amount_due: number; total_price: number; payment_method?: string;
  }>) => Promise<boolean>;
}

interface ParsedRow {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  course_name: string;
  payment_plan: string;
  amount_due: string;
  valid: boolean;
  errors: string[];
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row;
  });
}

export default function CSVImportDialog({ courses, onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      const validated: ParsedRow[] = rows.map((r) => {
        const errors: string[] = [];
        const name = r["nome"] || r["full_name"] || r["name"] || "";
        const email = r["email"] || "";
        const phone = r["telefone"] || r["phone"] || "";
        const company = r["empresa"] || r["company"] || "";
        const courseName = r["curso"] || r["course_name"] || r["course"] || "";
        const plan = r["plano"] || r["payment_plan"] || "full";
        const amount = r["valor"] || r["amount_due"] || r["amount"] || "0";

        if (!name) errors.push("Nome em falta");
        if (!email || !email.includes("@")) errors.push("Email inválido");
        if (!phone || phone.length < 9) errors.push("Telefone inválido");
        if (!courseName) errors.push("Curso em falta");

        return {
          full_name: name, email, phone, company, course_name: courseName,
          payment_plan: plan, amount_due: amount,
          valid: errors.length === 0, errors,
        };
      });
      setParsed(validated);
    };
    reader.readAsText(file);
  };

  const validRows = parsed.filter((r) => r.valid);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    const rows = validRows.map((r) => {
      const course = courses.find((c) => c.title.toLowerCase() === r.course_name.toLowerCase() || c.slug === r.course_name);
      return {
        full_name: r.full_name,
        email: r.email,
        phone: r.phone,
        company: r.company || undefined,
        course_id: course?.slug || r.course_name,
        course_name: course?.title || r.course_name,
        payment_plan: r.payment_plan || "full",
        amount_due: parseFloat(r.amount_due) || (course?.price || 0),
        total_price: course?.price || parseFloat(r.amount_due) || 0,
      };
    });
    const ok = await onImport(rows);
    setImporting(false);
    if (ok) { setOpen(false); setParsed([]); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setParsed([]); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="w-4 h-4 mr-1" /> Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Importar Inscrições via CSV</DialogTitle></DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-sm">
            <p className="font-heading font-semibold mb-2">Formato esperado do CSV</p>
            <p className="text-muted-foreground text-xs mb-2">Colunas: <code className="bg-background px-1 rounded">nome, email, telefone, empresa, curso, plano, valor</code></p>
            <p className="text-muted-foreground text-xs">O nome do curso deve corresponder ao título exacto no sistema. Planos aceites: <code className="bg-background px-1 rounded">full, 60-40, 60-20-20</code></p>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
          >
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Clique para seleccionar o ficheiro CSV</p>
          </div>

          {parsed.length > 0 && (
            <>
              <div className="flex items-center gap-3">
                <Badge variant="default">{validRows.length} válidas</Badge>
                {parsed.length - validRows.length > 0 && (
                  <Badge variant="destructive">{parsed.length - validRows.length} com erros</Badge>
                )}
              </div>

              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.map((row, i) => (
                      <TableRow key={i} className={!row.valid ? "bg-destructive/5" : ""}>
                        <TableCell>
                          {row.valid ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{row.full_name}</TableCell>
                        <TableCell className="text-sm">{row.email}</TableCell>
                        <TableCell className="text-sm">{row.phone}</TableCell>
                        <TableCell className="text-sm truncate max-w-[150px]">{row.course_name}</TableCell>
                        <TableCell className="text-sm">{row.amount_due}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button onClick={handleImport} disabled={importing || validRows.length === 0} className="w-full">
                {importing ? "A importar..." : `Importar ${validRows.length} inscrições`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
