"use client";

import { downloadResponsePdf } from "@/lib/pdf";

export default function ResponsePreview({ form, response, fields, onClose }) {
  if (!response) return null;

  const answerable = (fields || []).filter((f) => f.type !== "seccion" && f.type !== "info");

  function renderValue(field) {
    const raw = response.data?.[field.id];
    if (field.type === "archivo" || field.type === "firma") {
      return raw ? (
        <a href={raw} target="_blank" rel="noreferrer" className="text-blue underline">
          Ver archivo
        </a>
      ) : (
        <span className="text-gray-400">— Sin respuesta —</span>
      );
    }
    const val = Array.isArray(raw) ? raw.join(", ") : raw;
    return val ? (
      <span>{String(val)}</span>
    ) : (
      <span className="text-gray-400">— Sin respuesta —</span>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-[620px] max-h-[88vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-navy text-white rounded-t-xl px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-[17px] font-semibold">{form?.title || "Formulario"}</h2>
            <p className="text-[12px] text-white/70 mt-0.5">
              Enviado: {response.submitted_at ? new Date(response.submitted_at).toLocaleString() : "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-[18px] leading-none px-1"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex-1">
          {answerable.map((field, idx) => (
            <div key={field.id} className="mb-4 last:mb-0">
              <p className="text-[12px] font-semibold text-navy mb-1">
                {idx + 1}. {field.label || field.type}
              </p>
              <div className="text-[13.5px] text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                {renderValue(field)}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] border border-gray-200 bg-white hover:bg-gray-50"
          >
            Cerrar
          </button>
          <button
            onClick={() => downloadResponsePdf(form, response, fields)}
            className="px-4 py-2 rounded-lg text-[13px] bg-navy text-white font-semibold hover:opacity-90"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
