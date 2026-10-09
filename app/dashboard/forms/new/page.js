"use client";

import { useState } from "react";
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

  if (!chosen) {
    return (
      <div>
        <h1 className="page-title">Crear formulario</h1>
        <p className="page-subtitle mb-6">Elige una plantilla para empezar más rápido, o crea uno en blanco.</p>
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
