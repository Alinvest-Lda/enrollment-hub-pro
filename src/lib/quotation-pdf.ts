import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import { formatCurrency } from "./courses-data";

interface QuotationItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface BankDetails {
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankNIB?: string;
}

interface QuotationData {
  id?: string;
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

export async function generateQuotationPDF(
  q: QuotationData,
  bankDetails?: BankDetails
): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;

  // Header with logo
  try {
    const logoUrl = new URL("/assets/logo.png", window.location.origin).href;
    const logoImg = await loadImage(logoUrl);
    const logoH = 12;
    const logoW = (logoImg.width / logoImg.height) * logoH;
    doc.addImage(logoImg, "PNG", margin, margin, logoW, logoH);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("Consultoria & Formação", margin, margin + logoH + 4);
  } catch {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 36, 99);
    doc.text("ALINVEST", margin, 22);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("Consultoria & Formação", margin, 27);
  }

  // Quotation title (right side)
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("COTAÇÃO", pageWidth - margin, 22, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(q.quotation_number, pageWidth - margin, 28, { align: "right" });
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Data: ${new Date(q.created_at).toLocaleDateString("pt-PT")}`,
    pageWidth - margin,
    34,
    { align: "right" }
  );
  if (q.valid_until) {
    doc.text(
      `Válida até: ${new Date(q.valid_until).toLocaleDateString("pt-PT")}`,
      pageWidth - margin,
      39,
      { align: "right" }
    );
  }

  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, 45, pageWidth - margin, 45);

  // Client info
  let y = 52;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("CLIENTE", margin, y);
  y += 5;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(q.client_name, margin, y);
  y += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  if (q.organization_name) { doc.text(q.organization_name, margin, y); y += 4.5; }
  if (q.client_email) { doc.text(q.client_email, margin, y); y += 4.5; }
  if (q.client_phone) { doc.text(q.client_phone, margin, y); y += 4.5; }

  // Training topic on right
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("TEMA DA FORMAÇÃO", pageWidth / 2, 52);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  const topicLines = doc.splitTextToSize(q.training_topic, pageWidth / 2 - 20);
  doc.text(topicLines, pageWidth / 2, 57);

  y = Math.max(y, 72) + 4;

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
    margin: { left: margin, right: margin },
    theme: "striped",
  });

  // Totals
  const finalY = (doc as any).lastAutoTable?.finalY || y + 40;
  let totY = finalY + 8;
  const totX = pageWidth - margin;
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

  // ── Bank Details & QR Code Section ──
  const paymentUrl = q.id
    ? `${window.location.origin}/cotacao/${q.id}`
    : "";

  const hasBankDetails = bankDetails && (bankDetails.bankName || bankDetails.bankAccountNumber || bankDetails.bankNIB);

  if (hasBankDetails || paymentUrl) {
    // Section header
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 36, 99);
    doc.text("DADOS PARA PAGAMENTO", margin, totY);
    totY += 2;
    doc.setDrawColor(10, 36, 99);
    doc.line(margin, totY, margin + 55, totY);
    totY += 5;

    const bankStartY = totY;

    // Bank transfer details
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);

    if (hasBankDetails) {
      doc.setFont("helvetica", "bold");
      doc.text("Transferência Bancária:", margin, totY);
      totY += 4;
      doc.setFont("helvetica", "normal");
      if (bankDetails.bankName) { doc.text(`Banco: ${bankDetails.bankName}`, margin + 2, totY); totY += 3.5; }
      if (bankDetails.bankAccountName) { doc.text(`Titular: ${bankDetails.bankAccountName}`, margin + 2, totY); totY += 3.5; }
      if (bankDetails.bankAccountNumber) { doc.text(`Nº Conta: ${bankDetails.bankAccountNumber}`, margin + 2, totY); totY += 3.5; }
      if (bankDetails.bankNIB) { doc.text(`NIB: ${bankDetails.bankNIB}`, margin + 2, totY); totY += 3.5; }
      totY += 2;
    }

    if (hasEmola) {
      doc.setFont("helvetica", "bold");
      doc.text("e-Mola:", margin, totY);
      totY += 4;
      doc.setFont("helvetica", "normal");
      if (bankDetails.emolaNumber) { doc.text(`Número: ${bankDetails.emolaNumber}`, margin + 2, totY); totY += 3.5; }
      if (bankDetails.emolaName) { doc.text(`Nome: ${bankDetails.emolaName}`, margin + 2, totY); totY += 3.5; }
      totY += 2;
    }

    // QR Code on the right side
    if (paymentUrl) {
      try {
        const qrDataUrl = await QRCode.toDataURL(paymentUrl, {
          width: 200,
          margin: 1,
          color: { dark: "#0a2463", light: "#ffffff" },
        });
        const qrSize = 30;
        const qrX = pageWidth - margin - qrSize;
        const qrY = bankStartY - 3;
        doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text("Digitalize para pagar", qrX + qrSize / 2, qrY + qrSize + 3, { align: "center" });
      } catch {
        // QR generation failed, skip
      }
    }

    totY = Math.max(totY, bankStartY + 35);
  }

  // Notes
  if (q.notes) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Notas:", margin, totY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const noteLines = doc.splitTextToSize(q.notes, pageWidth - 28);
    doc.text(noteLines, margin, totY + 4);
    totY += 4 + noteLines.length * 4;
  }

  // Terms
  if (q.terms) {
    totY += 4;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Termos e Condições:", margin, totY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const termLines = doc.splitTextToSize(q.terms, pageWidth - 28);
    doc.text(termLines, margin, totY + 4);
  }

  // Footer at bottom of page
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("ALINVEST — Consultoria & Formação", pageWidth / 2, pageHeight - 10, { align: "center" });

  return doc;
}

export async function downloadQuotationPDF(q: QuotationData, bankDetails?: BankDetails) {
  const doc = await generateQuotationPDF(q, bankDetails);
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
