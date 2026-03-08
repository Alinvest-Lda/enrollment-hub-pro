// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

function escapeCSV(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV(rows: Row[], columns: { key: string; label: string }[], filename: string) {
  if (rows.length === 0) return;

  const header = columns.map((c) => escapeCSV(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCSV(row[c.key])).join(","))
    .join("\n");

  const csv = "\uFEFF" + header + "\n" + body; // BOM for Excel UTF-8
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export const enrollmentCSVColumns = [
  { key: "full_name", label: "Nome" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Telefone" },
  { key: "company", label: "Empresa" },
  { key: "nuit", label: "NUIT" },
  { key: "province", label: "Província" },
  { key: "course_name", label: "Curso" },
  { key: "payment_plan", label: "Plano" },
  { key: "amount_due", label: "Valor Devido" },
  { key: "total_price", label: "Preço Total" },
  { key: "status", label: "Estado" },
  { key: "message", label: "Mensagem" },
  { key: "admin_notes", label: "Notas Admin" },
  { key: "created_at", label: "Data Inscrição" },
];

export const trainingRequestCSVColumns = [
  { key: "full_name", label: "Nome" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Telefone" },
  { key: "client_type", label: "Tipo Cliente" },
  { key: "organization_name", label: "Organização" },
  { key: "training_topic", label: "Tema" },
  { key: "num_participants", label: "Participantes" },
  { key: "preferred_start", label: "Início Preferido" },
  { key: "budget_range", label: "Orçamento" },
  { key: "status", label: "Estado" },
  { key: "admin_notes", label: "Notas Admin" },
  { key: "created_at", label: "Data Pedido" },
];
