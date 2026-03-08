import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./courses-data";

interface QuotationItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface QuotationData {
  quotation_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  organization_name: string | null;
  training_topic: string;
  items: QuotationItem[];
  subtotal: number;
  discount_percent: number;
  tax_percent: number;
  total: number;
  currency: string;
  notes: string | null;
  terms: string | null;
  valid_until: string | null;
  created_at: string;
  status: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function generateQuotationPDF(q: QuotationData): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header with logo
  try {
    const logoUrl = new URL("/assets/logo.png", window.location.origin).href;
    const logoImg = await loadImage(logoUrl);
    const logoH = 14;
    const logoW = (logoImg.width / logoImg.height) * logoH;
    doc.addImage(logoImg, "PNG", 14, 14, logoW, logoH);
    // Subtitle next to logo
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("Consultoria & Formação", 14 + logoW + 3, 24);
  } catch {
    // Fallback to text if logo fails
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 36, 99);
    doc.text("ALINVEST", 14, 25);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("Consultoria & Formação", 14, 31);
  }

  // Quotation title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("COTAÇÃO", pageWidth - 14, 25, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(q.quotation_number, pageWidth - 14, 32, { align: "right" });
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Data: ${new Date(q.created_at).toLocaleDateString("pt-PT")}`, pageWidth - 14, 38, { align: "right" });
  if (q.valid_until) {
    doc.text(`Válida até: ${new Date(q.valid_until).toLocaleDateString("pt-PT")}`, pageWidth - 14, 43, { align: "right" });
  }

  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 48, pageWidth - 14, 48);

  // Client info
  let y = 56;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("CLIENTE", 14, y);
  y += 5;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(q.client_name, 14, y);
  y += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  if (q.organization_name) { doc.text(q.organization_name, 14, y); y += 4.5; }
  if (q.client_email) { doc.text(q.client_email, 14, y); y += 4.5; }
  if (q.client_phone) { doc.text(q.client_phone, 14, y); y += 4.5; }

  // Training topic on right
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("TEMA DA FORMAÇÃO", pageWidth / 2, 56);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  const topicLines = doc.splitTextToSize(q.training_topic, pageWidth / 2 - 20);
  doc.text(topicLines, pageWidth / 2, 61);

  y = Math.max(y, 75) + 4;

  // Items table
  autoTable(doc, {
    startY: y,
    head: [["Descrição", "Qtd", "Preço Unit.", "Total"]],
    body: q.items.map((item) => [
      item.description,
      String(item.quantity),
      formatCurrency(item.unit_price, q.currency),
      formatCurrency(item.quantity * item.unit_price, q.currency),
    ]),
    headStyles: {
      fillColor: [10, 36, 99],
      textColor: 255,
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "right", cellWidth: 35 },
      3: { halign: "right", cellWidth: 35 },
    },
    margin: { left: 14, right: 14 },
    theme: "striped",
  });

  // Totals
  const finalY = (doc as any).lastAutoTable?.finalY || y + 40;
  let totY = finalY + 8;
  const totX = pageWidth - 14;
  const labelX = pageWidth - 80;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Subtotal", labelX, totY);
  doc.text(formatCurrency(q.subtotal, q.currency), totX, totY, { align: "right" });
  totY += 5;

  if (q.discount_percent > 0) {
    doc.text(`Desconto (${q.discount_percent}%)`, labelX, totY);
    doc.text(`-${formatCurrency(q.subtotal * q.discount_percent / 100, q.currency)}`, totX, totY, { align: "right" });
    totY += 5;
  }

  if (q.tax_percent > 0) {
    const afterDiscount = q.subtotal - q.subtotal * q.discount_percent / 100;
    doc.text(`IVA (${q.tax_percent}%)`, labelX, totY);
    doc.text(formatCurrency(afterDiscount * q.tax_percent / 100, q.currency), totX, totY, { align: "right" });
    totY += 5;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(labelX, totY, totX, totY);
  totY += 6;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(10, 36, 99);
  doc.text("Total", labelX, totY);
  doc.text(formatCurrency(q.total, q.currency), totX, totY, { align: "right" });

  totY += 12;

  // Notes
  if (q.notes) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Notas:", 14, totY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const noteLines = doc.splitTextToSize(q.notes, pageWidth - 28);
    doc.text(noteLines, 14, totY + 4);
    totY += 4 + noteLines.length * 4;
  }

  // Terms
  if (q.terms) {
    totY += 4;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Termos e Condições:", 14, totY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const termLines = doc.splitTextToSize(q.terms, pageWidth - 28);
    doc.text(termLines, 14, totY + 4);
  }

  return doc;
}

export async function downloadQuotationPDF(q: QuotationData) {
  const doc = await generateQuotationPDF(q);
  doc.save(`${q.quotation_number}.pdf`);
}

export function getQuotationWhatsAppMessage(q: QuotationData, paymentUrl: string): string {
  let msg = `📋 *COTAÇÃO ${q.quotation_number}*\n\n`;
  msg += `Olá ${q.client_name},\n\n`;
  msg += `Segue a cotação para o treinamento *${q.training_topic}*:\n\n`;
  q.items.forEach((item) => {
    msg += `• ${item.description} — ${item.quantity}x ${formatCurrency(item.unit_price, q.currency)}\n`;
  });
  msg += `\n`;
  if (q.discount_percent > 0) msg += `Desconto: ${q.discount_percent}%\n`;
  if (q.tax_percent > 0) msg += `IVA: ${q.tax_percent}%\n`;
  msg += `*Total: ${formatCurrency(q.total, q.currency)}*\n`;
  if (q.valid_until) msg += `\nVálida até: ${new Date(q.valid_until).toLocaleDateString("pt-PT")}\n`;
  msg += `\n💳 Link de pagamento:\n${paymentUrl}\n`;
  msg += `\nObrigado pela preferência!\nALINVEST - Consultoria & Formação`;
  return msg;
}

export function getQuotationEmailSubject(q: { quotation_number: string; training_topic: string }): string {
  return `Cotação ${q.quotation_number} — ${q.training_topic} | ALINVEST`;
}

export function getQuotationEmailBody(q: QuotationData, paymentUrl: string): string {
  let body = `Prezado(a) ${q.client_name},\n\n`;
  body += `Agradecemos o seu interesse. Segue a cotação referente ao treinamento "${q.training_topic}".\n\n`;
  body += `--- ITENS ---\n`;
  q.items.forEach((item) => {
    body += `• ${item.description} — Qtd: ${item.quantity} × ${formatCurrency(item.unit_price, q.currency)} = ${formatCurrency(item.quantity * item.unit_price, q.currency)}\n`;
  });
  body += `\nSubtotal: ${formatCurrency(q.subtotal, q.currency)}\n`;
  if (q.discount_percent > 0) body += `Desconto: ${q.discount_percent}%\n`;
  if (q.tax_percent > 0) body += `IVA: ${q.tax_percent}%\n`;
  body += `TOTAL: ${formatCurrency(q.total, q.currency)}\n`;
  if (q.valid_until) body += `\nVálida até: ${new Date(q.valid_until).toLocaleDateString("pt-PT")}\n`;
  body += `\nLink de pagamento: ${paymentUrl}\n`;
  if (q.terms) body += `\nTermos: ${q.terms}\n`;
  body += `\nCom os melhores cumprimentos,\nALINVEST - Consultoria & Formação`;
  return body;
}
