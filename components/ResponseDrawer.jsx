"use client";

import { useEffect } from "react";
import { downloadResponsePdf } from "@/lib/pdf";
import FileLinks from "@/components/FileLinks";
import { attachmentFileName } from "@/lib/fileDownload";

function Chevron({ dir }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "up" ? "m6 14 6-6 6 6" : "m6 10 6 6 6-6"} />
    </svg>
  );
}

function Empty() {
  return <span className="text-gray-400">— Sin respuesta —</span>;
}

function Value({ field, raw, response, fields }) {
  if (field.type === "firma") {
    return raw ? (
      <a href={raw} target="_blank" rel="noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={raw} alt="Firma" className="max-h-24 bg-white border border-gray-200 rounded-md p-1" />
      </a>
    ) : (
      <Empty />
    );
  }
  if (field.type === "archivo") {
    return raw ? (
      <FileLinks
        url={raw}
        name={attachmentFileName(fields, response?.data, field)}
      />
    ) : (
      <Empty />
    );
  }
  const val = Array.isArray(raw) ? raw.join(", ") : raw;
  return val !== undefined && val !== null && val !== "" ? (
    <span className="whitespace-pre-line break-words">{String(val)}</span>
  ) : (
    <Empty />
  );
}

// Panel que se abre a la derecha al hacer clic en una respuesta.
// Pantallas grandes: queda al lado de la tabla. Celular: cubre la pantalla.
export default function ResponseDrawer({
  form,
  response,
  position,
  total,
  onClose,
  onPrev,
  onNext,
  onDelete,
  canDelete = true,
}) {
  useEffect(() => {
    if (!response) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [response, onClose]);

  if (!response) return null;

  const fields = (form?.fields || []).filter((f) => f.type !== "seccion" && f.type !== "info");
  const sentAt = response.submitted_at ? new Date(response.submitted_at).toLocaleString() : "—";

  return (
    <aside
      className="fixed inset-0 z-50 bg-white flex flex-col lg:sticky lg:inset-auto lg:top-3 lg:z-auto lg:w-[430px] lg:shrink-0 lg:max-h-[calc(100vh-24px)] lg:rounded-2xl lg:border lg:border-[#ECE7DE] lg:shadow-[0_2px_12px_rgba(18,41,77,0.08)] overflow-hidden"
      aria-label="Detalle de la respuesta"
    >
      <div className="bg-navy text-white px-5 py-4 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-white/60 mb-0.5">
            Respuesta {position} de {total}
          </p>
          <h2 className="text-[16px] font-semibold leading-snug break-words">{form?.title || "Formulario"}</h2>
          <p className="text-[12px] text-white/70 mt-0.5">Enviada: {sentAt}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onPrev}
            disabled={!onPrev}
            title="Respuesta anterior"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Chevron dir="up" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!onNext}
            title="Respuesta siguiente"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Chevron dir="down" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Cerrar (Esc)"
            aria-label="Cerrar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 text-[20px] leading-none"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {fields.map((field, idx) => (
          <div key={field.id} className="mb-4 last:mb-0">
            <p className="text-[12px] font-semibold text-navy mb-1">
              {idx + 1}. {field.label || field.type}
            </p>
            <div className="text-[13.5px] text-gray-800 bg-[#FAF8F4] border border-[#ECE7DE] rounded-lg px-3 py-2">
              <Value field={field} raw={response.data?.[field.id]} response={response} fields={form?.fields} />
            </div>
          </div>
        ))}
        {fields.length === 0 && <p className="text-gray-500 text-[13px]">Este formulario no tiene preguntas.</p>}
      </div>

      <div className="px-5 py-3.5 border-t border-[#F2EFE9] flex gap-2.5">
        <button
          type="button"
          onClick={() => downloadResponsePdf(form, response, form?.fields || [])}
          className="btn btn-navy flex-1"
        >
          Descargar PDF
        </button>
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(response)}
            className="btn btn-outline !text-[#B23A3A] !border-[#F2D6D6] hover:!bg-[#FCEBEB]"
          >
            Eliminar
          </button>
        )}
      </div>
    </aside>
  );
}
