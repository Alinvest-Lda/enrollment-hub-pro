import { useState, useEffect, useCallback, useRef } from "react";
import {
  Award, Plus, Pencil, Trash2, Save, X, Eye, Copy, Search,
  FileText, Loader2, Upload, Globe, QrCode, Image as ImageIcon,
  MoveVertical, GripVertical, EyeOff,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// --- Types ---
interface CertTemplate {
  id: string;
  name: string;
  description: string;
  background_color: string;
  border_style: string;
  logo_url: string | null;
  example_image_url: string | null;
  header_text: string;
  institution_name: string;
  intro_text: string;
  body_template: string;
  closing_text: string;
  footer_text: string;
  signature_label: string;
  signature_name: string;
  signature2_name: string;
  signature2_label: string;
  variables: string[];
  language: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

interface Certificate {
  id: string;
  certificate_code: string;
  enrollment_id: string | null;
  template_id: string | null;
  student_name: string;
  course_name: string;
  course_duration: string;
  start_date: string | null;
  end_date: string | null;
  issue_date: string;
  language: string;
  trainer_name: string;
  status: string;
  created_at: string;
}

interface Enrollment {
  id: string;
  full_name: string;
  course_name: string;
  status: string;
  total_price: number;
}

// Grid layout system - each field is positioned in a 12-col x 24-row grid
interface FieldLayout {
  id: string;
  type: "text" | "image" | "qrcode" | "signature" | "line";
  label: string;
  content: string;
  visible: boolean;
  row: number;      // 0-23
  col: number;      // 0-11
  rowSpan: number;   // 1-24
  colSpan: number;   // 1-12
  fontSize: number;  // in px relative to preview
  fontWeight: "normal" | "bold" | "extrabold";
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  color: string;
  imageUrl?: string;
}

const defaultLayout: FieldLayout[] = [
  { id: "header", type: "text", label: "Título", content: "{{header_text}}", visible: true, row: 1, col: 0, rowSpan: 2, colSpan: 12, fontSize: 18, fontWeight: "extrabold", fontStyle: "normal", textAlign: "center", color: "#0F1D3A" },
  { id: "course", type: "text", label: "Curso", content: "{{course_name}}", visible: true, row: 3, col: 1, rowSpan: 2, colSpan: 10, fontSize: 14, fontWeight: "bold", fontStyle: "italic", textAlign: "center", color: "#0F1D3A" },
  { id: "intro", type: "text", label: "Introdução", content: "{{intro_text}}", visible: true, row: 5, col: 1, rowSpan: 2, colSpan: 10, fontSize: 10, fontWeight: "normal", fontStyle: "normal", textAlign: "left", color: "#333333" },
  { id: "student_name", type: "text", label: "Nome do Aluno", content: "{{student_name}}", visible: true, row: 7, col: 2, rowSpan: 2, colSpan: 8, fontSize: 20, fontWeight: "bold", fontStyle: "italic", textAlign: "center", color: "#0F1D3A" },
  { id: "line1", type: "line", label: "Linha decorativa", content: "", visible: true, row: 9, col: 3, rowSpan: 1, colSpan: 6, fontSize: 10, fontWeight: "normal", fontStyle: "normal", textAlign: "center", color: "#999999" },
  { id: "body", type: "text", label: "Corpo", content: "{{body_text}}", visible: true, row: 10, col: 1, rowSpan: 3, colSpan: 10, fontSize: 9, fontWeight: "normal", fontStyle: "normal", textAlign: "left", color: "#333333" },
  { id: "closing", type: "text", label: "Encerramento", content: "{{closing_text}}", visible: true, row: 13, col: 1, rowSpan: 2, colSpan: 10, fontSize: 9, fontWeight: "normal", fontStyle: "normal", textAlign: "left", color: "#333333" },
  { id: "sig1", type: "signature", label: "Assinatura 1", content: "{{signature_name}}\n{{signature_label}}", visible: true, row: 18, col: 0, rowSpan: 3, colSpan: 3, fontSize: 9, fontWeight: "normal", fontStyle: "normal", textAlign: "center", color: "#333333" },
  { id: "date", type: "text", label: "Data", content: "{{issue_date}}", visible: true, row: 18, col: 4, rowSpan: 3, colSpan: 4, fontSize: 9, fontWeight: "normal", fontStyle: "normal", textAlign: "center", color: "#333333" },
  { id: "sig2", type: "signature", label: "Assinatura 2", content: "{{trainer_name}}\n{{signature2_label}}", visible: true, row: 18, col: 9, rowSpan: 3, colSpan: 3, fontSize: 9, fontWeight: "normal", fontStyle: "normal", textAlign: "center", color: "#333333" },
  { id: "qrcode", type: "qrcode", label: "QR Code", content: "", visible: true, row: 21, col: 10, rowSpan: 3, colSpan: 2, fontSize: 7, fontWeight: "normal", fontStyle: "normal", textAlign: "center", color: "#333333" },
];

const GRID_COLS = 12;
const GRID_ROWS = 24;

function getLayoutFromTemplate(template: Partial<CertTemplate>): FieldLayout[] {
  // Try to parse layout from footer_text (JSON storage hack since we can't add columns)
  try {
    if (template.footer_text && template.footer_text.startsWith("[{")) {
      return JSON.parse(template.footer_text);
    }
  } catch { /* ignore */ }
  return defaultLayout.map(f => ({ ...f }));
}

function serializeLayout(layout: FieldLayout[]): string {
  return JSON.stringify(layout);
}

const defaultTemplatePt: Omit<CertTemplate, "id" | "created_at"> = {
  name: "",
  description: "",
  background_color: "#ffffff",
  border_style: "classic",
  logo_url: null,
  example_image_url: null,
  header_text: "CERTIFICADO DE CONCLUSÃO",
  institution_name: "ALINVEST S. U. LDA",
  intro_text: "A coordenação de Treinamentos da empresa ALINVEST S. U. LDA, tem a honra de certificar que",
  body_template: "Completou com sucesso o Treinamento de Capacitação em {{course_name}}, com base nas boas práticas e procedimentos previstos na norma, tendo cumprido com sucesso o programa de aulas e exercícios, que comprovam a sua qualificação técnica e profissional.",
  closing_text: "Por esta declaração reflectir a verdade, emitimos o presente certificado.",
  footer_text: "",
  signature_label: "Director Geral",
  signature_name: "",
  signature2_name: "",
  signature2_label: "Formador(a) do Curso",
  variables: ["student_name", "course_name", "duration", "start_date", "end_date"],
  language: "pt",
  is_active: true,
  is_default: false,
};

const defaultTemplateEn: Partial<CertTemplate> = {
  header_text: "CERTIFICATE OF COMPLETION",
  intro_text: "The Training Coordination of ALINVEST S. U. LDA is pleased to certify that",
  body_template: "Has successfully completed the Training Program in {{course_name}}, based on best practices and procedures established by the standard, having successfully completed the program of classes and exercises that demonstrate their technical and professional qualification.",
  closing_text: "In witness whereof, we issue this certificate.",
  signature_label: "General Director",
  signature2_label: "Course Trainer",
};

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `CERT-${new Date().getFullYear()}-${code}`;
}

function getVerificationUrl(code: string) {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/verificar-certificado?code=${encodeURIComponent(code)}`;
}

// Resolve template variables
function resolveText(text: string, template: Partial<CertTemplate>, data: {
  studentName?: string; courseName?: string; date?: string; trainerName?: string; code?: string;
}) {
  return text
    .replace("{{header_text}}", template.header_text || "")
    .replace("{{intro_text}}", template.intro_text || "")
    .replace("{{course_name}}", data.courseName || "Identificação do Treinamento")
    .replace("{{student_name}}", data.studentName || "Seu Nome Completo")
    .replace("{{body_text}}", (template.body_template || "")
      .replace("{{course_name}}", data.courseName || "Identificação do Treinamento")
      .replace("{{duration}}", "4 semanas")
      .replace("{{start_date}}", "01/01/2026")
      .replace("{{end_date}}", "28/01/2026"))
    .replace("{{closing_text}}", template.closing_text || "")
    .replace("{{signature_name}}", template.signature_name || "Nome do Director")
    .replace("{{signature_label}}", template.signature_label || "Director Geral")
    .replace("{{trainer_name}}", data.trainerName || template.signature2_name || "Nome do Formador(a)")
    .replace("{{signature2_label}}", template.signature2_label || "Formador(a) do Curso")
    .replace("{{issue_date}}", data.date || "DD-MM-AAAA")
    .replace("{{certificate_code}}", data.code || "CERT-2026-XXXXXX");
}

// --- Certificate Preview (Grid-based, with optional interactive drag/resize) ---
function CertificatePreview({ template, layout, studentName, courseName, date, trainerName, certificateCode, interactive, selectedFieldId, onSelectField, onFieldUpdate }: {
  template: Partial<CertTemplate>;
  layout: FieldLayout[];
  studentName?: string;
  courseName?: string;
  date?: string;
  trainerName?: string;
  certificateCode?: string;
  interactive?: boolean;
  selectedFieldId?: string | null;
  onSelectField?: (id: string | null) => void;
  onFieldUpdate?: (updated: FieldLayout) => void;
}) {
  const code = certificateCode || "CERT-2026-XXXXXX";
  const hasBackground = !!template.example_image_url;
  const data = { studentName, courseName, date, trainerName, code };
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    fieldId: string; mode: "move" | "resize";
    startX: number; startY: number;
    origRow: number; origCol: number; origRowSpan: number; origColSpan: number;
  } | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  // Compute cell size from container
  const getCellSize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { cw: 0, ch: 0, padX: 0, padY: 0 };
    const rect = el.getBoundingClientRect();
    const padX = rect.width * 0.04;
    const padY = rect.height * 0.04;
    const cw = (rect.width - padX * 2) / GRID_COLS;
    const ch = (rect.height - padY * 2) / GRID_ROWS;
    return { cw, ch, padX, padY };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, fieldId: string, mode: "move" | "resize") => {
    if (!interactive) return;
    e.stopPropagation();
    e.preventDefault();
    const field = layout.find(f => f.id === fieldId);
    if (!field) return;
    onSelectField?.(fieldId);
    setDragState({
      fieldId, mode,
      startX: e.clientX, startY: e.clientY,
      origRow: field.row, origCol: field.col,
      origRowSpan: field.rowSpan, origColSpan: field.colSpan,
    });
    setShowGrid(true);
  }, [interactive, layout, onSelectField]);

  useEffect(() => {
    if (!dragState) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { cw, ch } = getCellSize();
      if (cw === 0) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      const dCols = Math.round(dx / cw);
      const dRows = Math.round(dy / ch);
      const field = layout.find(f => f.id === dragState.fieldId);
      if (!field) return;

      if (dragState.mode === "move") {
        const newCol = Math.max(0, Math.min(GRID_COLS - dragState.origColSpan, dragState.origCol + dCols));
        const newRow = Math.max(0, Math.min(GRID_ROWS - dragState.origRowSpan, dragState.origRow + dRows));
        if (newCol !== field.col || newRow !== field.row) {
          onFieldUpdate?.({ ...field, col: newCol, row: newRow });
        }
      } else {
        const newColSpan = Math.max(1, Math.min(GRID_COLS - dragState.origCol, dragState.origColSpan + dCols));
        const newRowSpan = Math.max(1, Math.min(GRID_ROWS - dragState.origRow, dragState.origRowSpan + dRows));
        if (newColSpan !== field.colSpan || newRowSpan !== field.rowSpan) {
          onFieldUpdate?.({ ...field, colSpan: newColSpan, rowSpan: newRowSpan });
        }
      }
    };
    const handleMouseUp = () => {
      setDragState(null);
      setShowGrid(false);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, getCellSize, layout, onFieldUpdate]);

  const renderFieldContent = (field: FieldLayout) => {
    if (field.type === "line") {
      return <div className="w-full border-t-2" style={{ borderColor: field.color }} />;
    }
    if (field.type === "qrcode") {
      return (
        <>
          <QRCodeSVG value={getVerificationUrl(code)} size={40} level="M" includeMargin={false} />
          <span style={{ fontSize: "7px", fontFamily: "monospace" }}>{code}</span>
        </>
      );
    }
    if (field.type === "image") {
      return field.imageUrl ? (
        <img src={field.imageUrl} alt={field.label} className="max-w-full max-h-full object-contain" />
      ) : (
        <div className="w-full h-full bg-muted/20 border border-dashed border-muted-foreground/20 flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-muted-foreground/40" />
        </div>
      );
    }
    if (field.type === "signature") {
      const lines = resolveText(field.content, template, data).split("\n");
      return (
        <>
          <div className="w-full border-t" style={{ borderColor: field.color, marginBottom: "4px" }} />
          {lines.map((line, i) => (
            <span key={i} style={{ fontSize: i === 0 ? `${field.fontSize}px` : `${field.fontSize - 2}px`, fontWeight: i === 0 ? 600 : 400, opacity: i === 0 ? 1 : 0.7 }}>
              {line}
            </span>
          ))}
        </>
      );
    }
    return <span>{resolveText(field.content, template, data)}</span>;
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-sm overflow-hidden select-none"
      style={{ aspectRatio: "1.414", fontFamily: "'Lora', serif" }}
      onClick={() => interactive && onSelectField?.(null)}
    >
      {hasBackground ? (
        <img src={template.example_image_url!} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-muted/30 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Carregue uma imagem de fundo</p>
          </div>
        </div>
      )}

      {/* Grid guide lines (visible during drag) */}
      {interactive && showGrid && (
        <div className="absolute inset-0 pointer-events-none" style={{ padding: "4%" }}>
          <div className="w-full h-full relative">
            {Array.from({ length: GRID_COLS - 1 }).map((_, i) => (
              <div key={`vc${i}`} className="absolute top-0 bottom-0 border-l border-primary/10"
                style={{ left: `${((i + 1) / GRID_COLS) * 100}%` }} />
            ))}
            {Array.from({ length: GRID_ROWS - 1 }).map((_, i) => (
              <div key={`hr${i}`} className="absolute left-0 right-0 border-t border-primary/10"
                style={{ top: `${((i + 1) / GRID_ROWS) * 100}%` }} />
            ))}
          </div>
        </div>
      )}

      {/* Grid overlay */}
      <div className="absolute inset-0" style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
        padding: "4%",
      }}>
        {layout.filter(f => f.visible).map((field) => {
          const isSelected = interactive && selectedFieldId === field.id;
          const isDragging = dragState?.fieldId === field.id;
          const style: React.CSSProperties = {
            gridColumn: `${field.col + 1} / span ${field.colSpan}`,
            gridRow: `${field.row + 1} / span ${field.rowSpan}`,
            fontSize: `${field.fontSize}px`,
            fontWeight: field.fontWeight === "extrabold" ? 800 : field.fontWeight === "bold" ? 700 : 400,
            fontStyle: field.fontStyle,
            textAlign: field.textAlign,
            color: field.color,
            overflow: "hidden",
            display: "flex",
            alignItems: field.type === "line" ? "center" : "center",
            justifyContent: field.textAlign === "center" ? "center" : field.textAlign === "right" ? "flex-end" : "flex-start",
            fontFamily: "'Lora', serif",
            lineHeight: 1.4,
            flexDirection: (field.type === "qrcode" || field.type === "signature") ? "column" : undefined,
            gap: field.type === "qrcode" ? "2px" : undefined,
            position: "relative",
            cursor: interactive ? (isDragging ? "grabbing" : "grab") : undefined,
            outline: isSelected ? "2px solid hsl(var(--primary))" : undefined,
            outlineOffset: "1px",
            borderRadius: isSelected ? "2px" : undefined,
            background: isSelected ? "hsl(var(--primary) / 0.05)" : undefined,
            zIndex: isSelected || isDragging ? 10 : undefined,
          };

          return (
            <div
              key={field.id}
              style={style}
              onClick={(e) => { if (interactive) { e.stopPropagation(); onSelectField?.(field.id); } }}
              onMouseDown={(e) => handleMouseDown(e, field.id, "move")}
            >
              {renderFieldContent(field)}
              {/* Resize handle */}
              {isSelected && (
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-tl-sm cursor-se-resize z-20"
                  onMouseDown={(e) => handleMouseDown(e, field.id, "resize")}
                  style={{ opacity: 0.8 }}
                />
              )}
              {/* Field label tooltip on hover in interactive mode */}
              {interactive && isSelected && (
                <div className="absolute -top-5 left-0 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-20 pointer-events-none">
                  {field.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Field Editor Panel ---
function FieldEditor({ field, onChange, onUploadImage }: {
  field: FieldLayout;
  onChange: (updated: FieldLayout) => void;
  onUploadImage: (fieldId: string, file: File) => void;
}) {
  return (
    <div className="border border-border rounded-lg p-3 space-y-2 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold">{field.label}</span>
          <Badge variant="outline" className="text-[8px]">{field.type}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[10px] text-muted-foreground">Visível</Label>
          <Switch checked={field.visible} onCheckedChange={(v) => onChange({ ...field, visible: v })} />
        </div>
      </div>

      {field.visible && (
        <>
          {/* Grid position controls */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <Label className="text-[10px]">Linha</Label>
              <Input type="number" min={0} max={GRID_ROWS - 1} value={field.row}
                onChange={(e) => onChange({ ...field, row: Math.max(0, Math.min(GRID_ROWS - 1, parseInt(e.target.value) || 0)) })}
                className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-[10px]">Coluna</Label>
              <Input type="number" min={0} max={GRID_COLS - 1} value={field.col}
                onChange={(e) => onChange({ ...field, col: Math.max(0, Math.min(GRID_COLS - 1, parseInt(e.target.value) || 0)) })}
                className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-[10px]">Alt. (linhas)</Label>
              <Input type="number" min={1} max={GRID_ROWS} value={field.rowSpan}
                onChange={(e) => onChange({ ...field, rowSpan: Math.max(1, parseInt(e.target.value) || 1) })}
                className="h-7 text-xs" />
            </div>
            <div>
              <Label className="text-[10px]">Larg. (colunas)</Label>
              <Input type="number" min={1} max={GRID_COLS} value={field.colSpan}
                onChange={(e) => onChange({ ...field, colSpan: Math.max(1, parseInt(e.target.value) || 1) })}
                className="h-7 text-xs" />
            </div>
          </div>

          {/* Text styling */}
          {(field.type === "text" || field.type === "signature") && (
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label className="text-[10px]">Tamanho</Label>
                <Input type="number" min={6} max={48} value={field.fontSize}
                  onChange={(e) => onChange({ ...field, fontSize: parseInt(e.target.value) || 10 })}
                  className="h-7 text-xs" />
              </div>
              <div>
                <Label className="text-[10px]">Peso</Label>
                <Select value={field.fontWeight} onValueChange={(v: any) => onChange({ ...field, fontWeight: v })}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="extrabold">Extra Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px]">Estilo</Label>
                <Select value={field.fontStyle} onValueChange={(v: any) => onChange({ ...field, fontStyle: v })}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="italic">Itálico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px]">Alinhamento</Label>
                <Select value={field.textAlign} onValueChange={(v: any) => onChange({ ...field, textAlign: v })}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Esquerda</SelectItem>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="right">Direita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Color */}
          <div className="flex items-center gap-2">
            <Label className="text-[10px] shrink-0">Cor</Label>
            <Input type="color" value={field.color} onChange={(e) => onChange({ ...field, color: e.target.value })} className="w-8 h-7 p-0.5" />
            <Input value={field.color} onChange={(e) => onChange({ ...field, color: e.target.value })} className="h-7 text-xs flex-1" />
          </div>

          {/* Image upload for image fields */}
          {field.type === "image" && (
            <div>
              <label className="cursor-pointer">
                <input type="file" className="hidden" accept="image/*"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadImage(field.id, f); e.target.value = ""; }} />
                <Button size="sm" variant="outline" className="text-xs h-7" asChild>
                  <span><Upload className="w-3 h-3 mr-1" />Carregar Imagem</span>
                </Button>
              </label>
              {field.imageUrl && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="w-12 h-8 rounded border border-border overflow-hidden">
                    <img src={field.imageUrl} alt="" className="w-full h-full object-contain" />
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 text-xs text-destructive" onClick={() => onChange({ ...field, imageUrl: undefined })}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- Main Component ---
export default function CertificatesTab() {
  const [tab, setTab] = useState("templates");
  const [templates, setTemplates] = useState<CertTemplate[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTemplate, setEditTemplate] = useState<Partial<CertTemplate> | null>(null);
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [layout, setLayout] = useState<FieldLayout[]>(defaultLayout.map(f => ({ ...f })));
  const [search, setSearch] = useState("");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [genForm, setGenForm] = useState({
    enrollment_id: "", template_id: "", student_name: "", course_name: "",
    course_duration: "", start_date: "", end_date: "", language: "pt", trainer_name: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editorTab, setEditorTab] = useState<"fields" | "texts">("fields");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [t, c, e] = await Promise.all([
      supabase.from("certificate_templates").select("*").order("created_at", { ascending: false }),
      supabase.from("certificates").select("*").order("created_at", { ascending: false }),
      supabase.from("enrollments").select("id, full_name, course_name, status, total_price").eq("status", "approved"),
    ]);
    if (t.data) setTemplates(t.data as unknown as CertTemplate[]);
    if (c.data) setCertificates(c.data as unknown as Certificate[]);
    if (e.data) setEnrollments(e.data as unknown as Enrollment[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const startEditTemplate = (t: Partial<CertTemplate>, isNew: boolean) => {
    setEditTemplate({ ...t });
    setIsNewTemplate(isNew);
    setLayout(getLayoutFromTemplate(t));
  };

  const handleBackgroundUpload = async (file: File) => {
    setUploading(true);
    const filePath = `backgrounds/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("certificate-examples").upload(filePath, file);
    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
      setUploading(false); return;
    }
    const { data: urlData } = supabase.storage.from("certificate-examples").getPublicUrl(filePath);
    setEditTemplate((p) => ({ ...p!, example_image_url: urlData.publicUrl }));
    toast({ title: "Imagem de fundo carregada" });
    setUploading(false);
  };

  const handleFieldImageUpload = async (fieldId: string, file: File) => {
    const filePath = `field-images/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("certificate-examples").upload(filePath, file);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("certificate-examples").getPublicUrl(filePath);
    setLayout(prev => prev.map(f => f.id === fieldId ? { ...f, imageUrl: urlData.publicUrl } : f));
    toast({ title: "Imagem carregada" });
  };

  const addField = (type: FieldLayout["type"]) => {
    const id = `custom_${Date.now()}`;
    const newField: FieldLayout = {
      id, type, label: type === "image" ? "Imagem" : type === "text" ? "Novo Campo" : type === "line" ? "Linha" : "QR Code",
      content: type === "text" ? "Texto personalizado" : "",
      visible: true, row: 15, col: 1, rowSpan: 2, colSpan: 4,
      fontSize: 10, fontWeight: "normal", fontStyle: "normal", textAlign: "center", color: "#333333",
    };
    setLayout(prev => [...prev, newField]);
  };

  const updateField = (updated: FieldLayout) => {
    setLayout(prev => prev.map(f => f.id === updated.id ? updated : f));
  };

  const removeField = (id: string) => {
    if (!defaultLayout.find(f => f.id === id)) {
      setLayout(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleLanguageChange = (lang: string) => {
    const defaults = lang === "en" ? defaultTemplateEn : defaultTemplatePt;
    setEditTemplate((p) => ({
      ...p!, language: lang,
      header_text: defaults.header_text!, intro_text: defaults.intro_text!, body_template: defaults.body_template!,
      closing_text: defaults.closing_text!, signature_label: defaults.signature_label!, signature2_label: defaults.signature2_label!,
    }));
  };

  const saveTemplate = async () => {
    if (!editTemplate?.name) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    setSaving(true);
    const templateToSave = { ...editTemplate, footer_text: serializeLayout(layout) };
    if (isNewTemplate) {
      const { error } = await supabase.from("certificate_templates").insert(templateToSave as any);
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Template criado" });
    } else {
      const { id, created_at, ...rest } = templateToSave as CertTemplate;
      const { error } = await supabase.from("certificate_templates").update(rest as any).eq("id", id);
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Template actualizado" });
    }
    setEditTemplate(null); setSaving(false); await fetchAll();
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Eliminar este template?")) return;
    await supabase.from("certificate_templates").delete().eq("id", id);
    toast({ title: "Template eliminado" }); await fetchAll();
  };

  const handleEnrollmentSelect = (enrollmentId: string) => {
    const e = enrollments.find(en => en.id === enrollmentId);
    if (e) setGenForm(prev => ({ ...prev, enrollment_id: enrollmentId, student_name: e.full_name, course_name: e.course_name }));
  };

  const handleTemplateSelectForGen = (templateId: string) => {
    const t = templates.find(tpl => tpl.id === templateId);
    setGenForm(prev => ({ ...prev, template_id: templateId, language: t?.language || "pt" }));
  };

  const generateCertificate = async () => {
    if (!genForm.student_name || !genForm.course_name) {
      toast({ title: "Preencha o nome e o curso", variant: "destructive" }); return;
    }
    setSaving(true);
    const { error } = await supabase.from("certificates").insert({
      certificate_code: generateCode(), enrollment_id: genForm.enrollment_id || null,
      template_id: genForm.template_id || null, student_name: genForm.student_name,
      course_name: genForm.course_name, course_duration: genForm.course_duration,
      start_date: genForm.start_date || null, end_date: genForm.end_date || null,
      issue_date: new Date().toISOString().split("T")[0], language: genForm.language, trainer_name: genForm.trainer_name,
    } as any);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: "Certificado gerado com sucesso!" }); setGenerateOpen(false);
      setGenForm({ enrollment_id: "", template_id: "", student_name: "", course_name: "", course_duration: "", start_date: "", end_date: "", language: "pt", trainer_name: "" });
      await fetchAll();
    }
    setSaving(false);
  };

  const revokeCertificate = async (id: string) => {
    if (!confirm("Revogar este certificado?")) return;
    await supabase.from("certificates").update({ status: "revoked" } as any).eq("id", id);
    toast({ title: "Certificado revogado" }); await fetchAll();
  };

  const deleteCertificate = async (id: string) => {
    if (!confirm("Eliminar permanentemente?")) return;
    await supabase.from("certificates").delete().eq("id", id);
    toast({ title: "Certificado eliminado" }); await fetchAll();
  };

  const filteredCerts = certificates.filter(c => {
    const q = search.toLowerCase();
    return c.student_name.toLowerCase().includes(q) || c.course_name.toLowerCase().includes(q) || c.certificate_code.toLowerCase().includes(q);
  });

  const langLabel = (lang: string) => lang === "en" ? "Inglês" : "Português";

  const getTemplateForCert = (cert: Certificate) => {
    if (cert.template_id) return templates.find(t => t.id === cert.template_id) || null;
    return templates.find(t => t.is_default) || null;
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="certificates">Certificados ({certificates.length})</TabsTrigger>
          </TabsList>
          {tab === "templates" && (
            <Button size="sm" onClick={() => startEditTemplate({ ...defaultTemplatePt }, true)}>
              <Plus className="w-4 h-4 mr-1" />Novo Template
            </Button>
          )}
          {tab === "certificates" && (
            <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Award className="w-4 h-4 mr-1" />Gerar Certificado</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Gerar Certificado</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Inscrição (opcional)</Label>
                    <Select value={genForm.enrollment_id} onValueChange={handleEnrollmentSelect}>
                      <SelectTrigger><SelectValue placeholder="Selecionar inscrição aprovada" /></SelectTrigger>
                      <SelectContent>{enrollments.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.full_name} — {e.course_name}</SelectItem>
                      ))}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Template</Label>
                      <Select value={genForm.template_id} onValueChange={handleTemplateSelectForGen}>
                        <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                        <SelectContent>{templates.filter(t => t.is_active).map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name} ({langLabel(t.language)})</SelectItem>
                        ))}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Idioma</Label>
                      <Select value={genForm.language} onValueChange={v => setGenForm(p => ({ ...p, language: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt">🇲🇿 Português</SelectItem>
                          <SelectItem value="en">🇬🇧 English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Nome do Estudante *</Label>
                      <Input value={genForm.student_name} onChange={e => setGenForm(p => ({ ...p, student_name: e.target.value }))} /></div>
                    <div><Label className="text-xs">Curso *</Label>
                      <Input value={genForm.course_name} onChange={e => setGenForm(p => ({ ...p, course_name: e.target.value }))} /></div>
                    <div><Label className="text-xs">Formador(a)</Label>
                      <Input value={genForm.trainer_name} onChange={e => setGenForm(p => ({ ...p, trainer_name: e.target.value }))} /></div>
                    <div><Label className="text-xs">Duração</Label>
                      <Input value={genForm.course_duration} onChange={e => setGenForm(p => ({ ...p, course_duration: e.target.value }))} placeholder="Ex: 4 semanas" /></div>
                    <div><Label className="text-xs">Data Início</Label>
                      <Input type="date" value={genForm.start_date} onChange={e => setGenForm(p => ({ ...p, start_date: e.target.value }))} /></div>
                    <div><Label className="text-xs">Data Fim</Label>
                      <Input type="date" value={genForm.end_date} onChange={e => setGenForm(p => ({ ...p, end_date: e.target.value }))} /></div>
                  </div>
                  <Button onClick={generateCertificate} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Award className="w-4 h-4 mr-1" />}
                    Gerar Certificado
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {editTemplate && (
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{isNewTemplate ? "Novo Template" : "Editar Template"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic info */}
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Nome *</Label>
                    <Input value={editTemplate.name || ""} onChange={e => setEditTemplate(p => ({ ...p!, name: e.target.value }))} /></div>
                  <div><Label className="text-xs">Idioma</Label>
                    <Select value={editTemplate.language || "pt"} onValueChange={handleLanguageChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt">🇲🇿 Português</SelectItem>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                      </SelectContent>
                    </Select></div>
                  <div><Label className="text-xs">Descrição</Label>
                    <Input value={editTemplate.description || ""} onChange={e => setEditTemplate(p => ({ ...p!, description: e.target.value }))} /></div>
                  <div><Label className="text-xs">Instituição</Label>
                    <Input value={editTemplate.institution_name || ""} onChange={e => setEditTemplate(p => ({ ...p!, institution_name: e.target.value }))} /></div>
                </div>

                {/* Background upload */}
                <div>
                  <Label className="text-xs font-medium">Imagem de Fundo</Label>
                  <div className="flex gap-3 items-start mt-1">
                    <label className="cursor-pointer">
                      <input type="file" className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleBackgroundUpload(f); e.target.value = ""; }} />
                      <Button size="sm" variant="outline" className="text-xs" asChild>
                        <span><Upload className="w-3.5 h-3.5 mr-1" />{uploading ? "A enviar..." : "Carregar"}</span>
                      </Button>
                    </label>
                    {editTemplate.example_image_url && (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-14 rounded border border-border overflow-hidden bg-muted">
                          <img src={editTemplate.example_image_url} alt="Fundo" className="w-full h-full object-cover" /></div>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => setEditTemplate(p => ({ ...p!, example_image_url: null }))}>
                          <Trash2 className="w-3 h-3" /></Button>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Editor tabs: Fields vs Texts */}
                <Tabs value={editorTab} onValueChange={v => setEditorTab(v as any)}>
                  <TabsList className="w-full">
                    <TabsTrigger value="fields" className="flex-1 text-xs">
                      <MoveVertical className="w-3 h-3 mr-1" />Layout dos Campos
                    </TabsTrigger>
                    <TabsTrigger value="texts" className="flex-1 text-xs">
                      <FileText className="w-3 h-3 mr-1" />Textos
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="fields" className="space-y-3 mt-3">
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => addField("text")}>
                        <Plus className="w-3 h-3 mr-1" />Texto</Button>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => addField("image")}>
                        <ImageIcon className="w-3 h-3 mr-1" />Imagem</Button>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => addField("line")}>
                        <Plus className="w-3 h-3 mr-1" />Linha</Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Grelha de {GRID_COLS} colunas × {GRID_ROWS} linhas. Ajuste a posição (linha/coluna) e dimensões de cada campo.
                    </p>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {layout.map(field => (
                        <div key={field.id} className="relative">
                          <FieldEditor field={field} onChange={updateField} onUploadImage={handleFieldImageUpload} />
                          {!defaultLayout.find(f => f.id === field.id) && (
                            <Button size="sm" variant="ghost" className="absolute top-2 right-8 h-6 text-xs text-destructive"
                              onClick={() => removeField(field.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="texts" className="space-y-3 mt-3">
                    <div><Label className="text-xs">Título</Label>
                      <Input value={editTemplate.header_text || ""} onChange={e => setEditTemplate(p => ({ ...p!, header_text: e.target.value }))} /></div>
                    <div><Label className="text-xs">Texto Introdutório</Label>
                      <Textarea value={editTemplate.intro_text || ""} onChange={e => setEditTemplate(p => ({ ...p!, intro_text: e.target.value }))} rows={2} /></div>
                    <div><Label className="text-xs">Corpo</Label>
                      <Textarea value={editTemplate.body_template || ""} onChange={e => setEditTemplate(p => ({ ...p!, body_template: e.target.value }))} rows={4} />
                      <p className="text-[10px] text-muted-foreground mt-1">Variáveis: {"{{course_name}}, {{duration}}, {{start_date}}, {{end_date}}"}</p></div>
                    <div><Label className="text-xs">Encerramento</Label>
                      <Input value={editTemplate.closing_text || ""} onChange={e => setEditTemplate(p => ({ ...p!, closing_text: e.target.value }))} /></div>
                    <Separator />
                    <p className="text-xs font-medium text-muted-foreground">Assinaturas</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs">Nome Director</Label>
                        <Input value={editTemplate.signature_name || ""} onChange={e => setEditTemplate(p => ({ ...p!, signature_name: e.target.value }))} /></div>
                      <div><Label className="text-xs">Cargo Director</Label>
                        <Input value={editTemplate.signature_label || ""} onChange={e => setEditTemplate(p => ({ ...p!, signature_label: e.target.value }))} /></div>
                      <div><Label className="text-xs">Nome Formador(a)</Label>
                        <Input value={editTemplate.signature2_name || ""} onChange={e => setEditTemplate(p => ({ ...p!, signature2_name: e.target.value }))} placeholder="Preenchido ao gerar" /></div>
                      <div><Label className="text-xs">Cargo Formador</Label>
                        <Input value={editTemplate.signature2_label || ""} onChange={e => setEditTemplate(p => ({ ...p!, signature2_label: e.target.value }))} /></div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Preview */}
                <Separator />
                <div>
                  <p className="text-xs font-medium mb-2 flex items-center gap-1">
                    Pré-visualização (Fonte: Lora)
                    <Badge variant="outline" className="text-[9px] ml-1">
                      <Globe className="w-2.5 h-2.5 mr-0.5" />{langLabel(editTemplate.language || "pt")}
                    </Badge>
                  </p>
                  <CertificatePreview template={editTemplate} layout={layout} />
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveTemplate} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}Guardar
                  </Button>
                  <Button variant="outline" onClick={() => setEditTemplate(null)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Templates list */}
          <div className="grid gap-3 md:grid-cols-2">
            {templates.map(t => (
              <Card key={t.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      {t.example_image_url && (
                        <div className="w-14 h-10 rounded border border-border overflow-hidden bg-muted shrink-0">
                          <img src={t.example_image_url} alt="Fundo" className="w-full h-full object-cover" /></div>
                      )}
                      <div>
                        <p className="font-heading font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.description || t.institution_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant="outline" className="text-[9px]"><Globe className="w-2.5 h-2.5 mr-0.5" />{langLabel(t.language)}</Badge>
                      <Badge variant={t.is_active ? "default" : "outline"} className="text-[10px]">{t.is_active ? "Activo" : "Inactivo"}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => startEditTemplate({ ...t }, false)}>
                      <Pencil className="w-3 h-3 mr-1" />Editar</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => deleteTemplate(t.id)}>
                      <Trash2 className="w-3 h-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {templates.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">Nenhum template criado.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>

          <Dialog open={!!previewCert} onOpenChange={open => !open && setPreviewCert(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Pré-visualização</DialogTitle></DialogHeader>
              {previewCert && (() => {
                const tpl = getTemplateForCert(previewCert) || defaultTemplatePt;
                return (
                  <CertificatePreview
                    template={tpl}
                    layout={getLayoutFromTemplate(tpl)}
                    studentName={previewCert.student_name}
                    courseName={previewCert.course_name}
                    date={new Date(previewCert.issue_date).toLocaleDateString("pt-PT")}
                    trainerName={previewCert.trainer_name}
                    certificateCode={previewCert.certificate_code}
                  />
                );
              })()}
            </DialogContent>
          </Dialog>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Estudante</TableHead>
                    <TableHead className="hidden md:table-cell">Curso</TableHead>
                    <TableHead className="hidden sm:table-cell">Idioma</TableHead>
                    <TableHead className="hidden sm:table-cell">Emissão</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCerts.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Sem certificados</TableCell></TableRow>
                  ) : filteredCerts.map(cert => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono text-xs font-bold">{cert.certificate_code}</TableCell>
                      <TableCell className="text-sm font-medium">{cert.student_name}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{cert.course_name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-[9px]">{cert.language === "en" ? "🇬🇧 EN" : "🇲🇿 PT"}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{new Date(cert.issue_date).toLocaleDateString("pt-PT")}</TableCell>
                      <TableCell>
                        <Badge variant={cert.status === "active" ? "default" : "destructive"} className="text-[10px]">
                          {cert.status === "active" ? "Activo" : "Revogado"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" title="Ver" onClick={() => setPreviewCert(cert)}><Eye className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" title="Copiar código" onClick={() => { navigator.clipboard.writeText(cert.certificate_code); toast({ title: "Copiado!" }); }}>
                            <Copy className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" title="Link verificação" onClick={() => { navigator.clipboard.writeText(getVerificationUrl(cert.certificate_code)); toast({ title: "Link copiado!" }); }}>
                            <QrCode className="w-3.5 h-3.5" /></Button>
                          {cert.status === "active" && (
                            <Button variant="ghost" size="icon" title="Revogar" onClick={() => revokeCertificate(cert.id)}>
                              <X className="w-3.5 h-3.5 text-destructive" /></Button>
                          )}
                          <Button variant="ghost" size="icon" title="Eliminar" onClick={() => deleteCertificate(cert.id)}>
                            <Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
