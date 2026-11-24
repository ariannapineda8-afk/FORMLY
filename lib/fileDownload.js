import { jsPDF } from "jspdf";

function cleanName(text) {
  return (
    String(text || "archivo")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9._ -]+/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 80) || "archivo"
  );
}

function extOf(url) {
  const clean = decodeURIComponent(String(url).split("?")[0]);
  const m = clean.match(/\.([a-zA-Z0-9]{2,5})$/);
  return m ? m[1].toLowerCase() : "";
}

async function fetchBlob(url) {
  // Primero directo; si el navegador no puede llegar, a través de Formly.
  try {
    const r = await fetch(url);
    if (r.ok) return await r.blob();
  } catch (e) {}
  const r = await fetch("/api/files?url=" + encodeURIComponent(url));
  if (!r.ok) throw new Error("No se pudo descargar el archivo.");
  return await r.blob();
}

function saveBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

async function imageBlobToPdf(blob) {
  const { img, url } = await loadImage(blob);
  // Se reduce si es muy grande, para que el PDF no pese de más.
  const max = 2200;
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(url);
  const data = canvas.toDataURL("image/jpeg", 0.92);

  const landscape = w > h;
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: landscape ? "landscape" : "portrait" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 24;
  const ratio = Math.min((pw - margin * 2) / w, (ph - margin * 2) / h);
  const dw = w * ratio;
  const dh = h * ratio;
  doc.addImage(data, "JPEG", (pw - dw) / 2, (ph - dh) / 2, dw, dh);
  return doc.output("blob");
}

// Descarga un adjunto como PDF. PDF: tal cual. Foto o imagen: se convierte a PDF.
// Otros formatos (Word, Excel...): se descargan en su formato original.
// Devuelve "pdf", "convertido" u "original".
export async function downloadAttachmentAsPdf(url, baseName) {
  const blob = await fetchBlob(url);
  const ext = extOf(url);
  const type = (blob.type || "").toLowerCase();
  const name = cleanName(baseName);

  if (type === "application/pdf" || ext === "pdf") {
    saveBlob(new Blob([blob], { type: "application/pdf" }), name + ".pdf");
    return "pdf";
  }
  if (type.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext)) {
    const pdf = await imageBlobToPdf(blob);
    saveBlob(pdf, name + ".pdf");
    return "convertido";
  }
  saveBlob(blob, name + (ext ? "." + ext : ""));
  return "original";
}
