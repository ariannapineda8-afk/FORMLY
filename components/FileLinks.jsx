"use client";

import { useState } from "react";
import { downloadAttachmentAsPdf } from "@/lib/fileDownload";

// Botones para un adjunto: abrirlo y descargarlo siempre como PDF.
export default function FileLinks({ url, name, className = "" }) {
  const [busy, setBusy] = useState(false);

  async function download(e) {
    e.stopPropagation();
    setBusy(true);
    try {
      const result = await downloadAttachmentAsPdf(url, name);
      if (result === "original") {
        alert("Este archivo no es PDF ni imagen (por ejemplo, un Word), así que se descargó en su formato original.");
      }
    } catch (err) {
      alert(err.message || "No se pudo descargar el archivo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`} onClick={(e) => e.stopPropagation()}>
      <a href={url} target="_blank" rel="noreferrer" className="text-blue underline">
        Ver
      </a>
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="btn-sm !py-0.5 !px-2 text-[12px] disabled:opacity-60"
        title="Descargar como PDF (si es una foto, se convierte a PDF)"
      >
        {busy ? "Preparando..." : "Descargar PDF"}
      </button>
    </span>
  );
}
