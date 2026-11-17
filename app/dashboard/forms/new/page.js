"use client";

import { useEffect, useState } from "react";
import FormBuilder from "@/components/FormBuilder";
import { TEMPLATE_LIST, getTemplate } from "@/lib/templates";
import { toneOf } from "@/lib/fields";

const ACCENT = {
  slate: "bg-[#EEF0F3] text-[#5B6577]",
  blue: "bg-[#E9F1F9] text-[#2C5680]",
  mint: "bg-mintlt text-mint",
  amber: "bg-warnlt text-warn",
};

export default function NewFormPage() {
  const [chosen, setChosen] = useState(null);
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    try {
      const d = JSON.parse(window.localStorage.getItem("formly_draft_nuevo") || "null");
      if (d && (d.title?.trim() || (d.fields || []).length > 0)) setDraft(d);
    } catch (e) {}
  }, []);

  function continueDraft() {
    try {
      window.sessionStorage.setItem("formly_restore", "formly_draft_nuevo");
    } catch (e) {}
    setChosen("blanco");
  }

  if (!chosen) {
    return (
      <div>
        <h1 className="page-title">Crear formulario</h1>
        <p className="page-subtitle mb-6">Elige una plantilla para empezar más rápido, o crea uno en blanco.</p>
        {draft && (
          <div className="mb-5 rounded-2xl border border-[#F3D9A4] bg-[#FFF8E8] px-4 py-3.5 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[220px]">
              <p className="text-[14px] font-semibold text-[#8A5A00]">Tienes un formulario sin terminar</p>
              <p className="text-[12px] text-[#8A5A00]/80">
                {draft.title?.trim() ? `"${draft.title}" · ` : ""}
                {(draft.fields || []).length} preguntas · {new Date(draft.savedAt).toLocaleString()}
              </p>
            </div>
            <button type="button" className="btn btn-primary" onClick={continueDraft}>
              Continuar donde me quedé
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                try {
                  window.localStorage.removeItem("formly_draft_nuevo");
                } catch (e) {}
                setDraft(null);
              }}
            >
              Descartar
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {TEMPLATE_LIST.map((t) => (
            <button
              key={t.key}
              onClick={() => setChosen(t.key)}
              className="card p-5 text-left hover:border-blue hover:shadow-md transition-all"
            >
              <span className={`inline-flex w-9 h-9 rounded-xl items-center justify-center font-display font-semibold mb-3 ${ACCENT[t.accent]}`}>
                {t.name.slice(0, 1)}
              </span>
              <h3 className="text-[14.5px] font-semibold text-navy mb-1">{t.name}</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed">{t.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const tpl = getTemplate(chosen);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className="page-title !text-[18px]">Crear formulario</h1>
        <span className="text-[12px] text-gray-400">·</span>
        <button onClick={() => setChosen(null)} className="btn-sm">← Cambiar plantilla</button>
      </div>
      <FormBuilder initial={tpl || undefined} />
    </div>
  );
}
