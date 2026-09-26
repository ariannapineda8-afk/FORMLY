import { jsPDF } from "jspdf";

function formatAnswer(field, rawValue) {
  if (rawValue === undefined || rawValue === null || rawValue === "") return "— Sin respuesta —";
  if (Array.isArray(rawValue)) return rawValue.length ? rawValue.join(", ") : "— Sin respuesta —";
  if (field.type === "archivo" || field.type === "firma") return String(rawValue);
  return String(rawValue);
}

export function downloadResponsePdf(form, response, fields) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  const navy = [18, 41, 77];
  const gray = [110, 110, 110];
  const darkText = [35, 35, 35];
  const line = [225, 228, 233];

  let headerHeight = 78;

  function drawHeader() {
    doc.setFillColor(...navy);
    doc.rect(0, 0, pageWidth, headerHeight, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");
    doc.setFontSize(15);
    doc.text(form?.title || "Formulario", margin, 34);
    doc.setFont(undefined, "normal");
    doc.setFontSize(9.5);
    const submitted = response?.submitted_at ? new Date(response.submitted_at) : null;
    const dateLabel = submitted ? submitted.toLocaleString() : "";
    doc.text(`Respuesta enviada: ${dateLabel}`, margin, 52);
    doc.setFontSize(8.5);
    doc.setTextColor(210, 217, 230);
    doc.text("Generado por Formly", margin, 67);
  }

  drawHeader();
  let y = headerHeight + 30;

  function ensureSpace(h) {
    if (y + h > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  const answerable = (fields || []).filter((f) => f.type !== "seccion" && f.type !== "info");

  answerable.forEach((field, idx) => {
    const label = `${idx + 1}. ${field.label || field.type}`;
    const value = formatAnswer(field, response?.data?.[field.id]);

    doc.setFont(undefined, "bold");
    doc.setFontSize(11);
    doc.setTextColor(...navy);
    const labelLines = doc.splitTextToSize(label, contentWidth);

    doc.setFont(undefined, "normal");
    doc.setFontSize(10.5);
    const valueLines = doc.splitTextToSize(value, contentWidth);

    const blockHeight = labelLines.length * 14 + valueLines.length * 13.5 + 26;
    ensureSpace(blockHeight);

    doc.setFont(undefined, "bold");
    doc.setFontSize(11);
    doc.setTextColor(...navy);
    doc.text(labelLines, margin, y);
    y += labelLines.length * 14 + 6;

    doc.setFont(undefined, "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...darkText);
    doc.text(valueLines, margin, y);
    y += valueLines.length * 13.5 + 12;

    doc.setDrawColor(...line);
    doc.setLineWidth(0.75);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont(undefined, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...gray);
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin, pageHeight - 22, { align: "right" });
  }

  const safeTitle = (form?.title || "formulario").replace(/[^a-z0-9-_]+/gi, "-");
  const dateStamp = response?.submitted_at
    ? new Date(response.submitted_at).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  doc.save(`${safeTitle}-${dateStamp}.pdf`);
}
