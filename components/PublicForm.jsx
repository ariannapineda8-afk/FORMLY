"use client";

import { useRef, useState } from "react";
import SignaturePad from "@/components/SignaturePad";
import { parseOptions, fmtStyle } from "@/lib/fields";
import { visibleFieldIds } from "@/lib/logic";

// Cada "Sección" inicia una página nueva. Los campos anteriores a la primera sección van en la página 1.
function buildPages(fields, shownIds) {
  const pages = [];
  let current = [];
  for (const f of fields || []) {
    if (!shownIds.has(f.id)) continue;
    if (f.type === "seccion" && current.length > 0) {
      pages.push(current);
      current = [];
    }
    current.push(f);
  }
  if (current.length > 0) pages.push(current);
  return pages.length ? pages : [[]];
}

export default function PublicForm({ form, preview = false }) {
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [logoOk, setLogoOk] = useState(true);
  const [page, setPage] = useState(0);

  function setValue(id, val) {
    setValues((v) => ({ ...v, [id]: val }));
  }

  async function uploadFile(id, file) {
    if (!file) return;
    if (preview) {
      setValue(id, "vista-previa");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", file, file.name || "firma.png");
      fd.append("formId", form.id);
      const res = await fetch("/api/public/upload", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "No se pudo subir el archivo.");
      setValue(id, body.url);
    } catch (err) {
      setError(err.message || "No se pudo subir el archivo. Intenta de nuevo.");
    }
  }

  function missingRequired(fields, shown) {
    return (fields || []).find((f) => {
      if (!shown.has(f.id) || !f.required || f.type === "seccion" || f.type === "info") return false;
      const v = values[f.id];
      return !v || (Array.isArray(v) && v.length === 0);
    });
  }

  function scrollTop() {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext(pageFields) {
    setError("");
    const shown = visibleFieldIds(form.fields, values);
    const bad = missingRequired(pageFields, shown);
    if (bad) {
      setError(`Por favor completa: ${bad.label || "campo obligatorio"}`);
      return;
    }
    setPage((p) => p + 1);
    scrollTop();
  }

  function goBack() {
    setError("");
    setPage((p) => Math.max(0, p - 1));
    scrollTop();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const shown = visibleFieldIds(form.fields, values);
    const pagesNow = buildPages(form.fields, shown);
    const cur = Math.min(page, pagesNow.length - 1);
    if (cur < pagesNow.length - 1) {
      goNext(pagesNow[cur]);
      return;
    }
    const bad = missingRequired(form.fields, shown);
    if (bad) {
      setError(`Por favor completa: ${bad.label || "campo obligatorio"}`);
      // Si el campo faltante está en otra página, llevar a esa página.
      const idx = pagesNow.findIndex((pg) => pg.some((x) => x.id === bad.id));
      if (idx >= 0) setPage(idx);
      return;
    }
    if (preview) {
      setDone(true);
      return;
    }
    // Solo se guardan las respuestas de los campos que estaban visibles.
    const data = {};
    for (const f of form.fields || []) {
      if (shown.has(f.id) && values[f.id] !== undefined) data[f.id] = values[f.id];
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/forms/${form.slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "No se pudo enviar el formulario.");
      setDone(true);
    } catch (err) {
      setError(err.message || "No se pudo enviar el formulario. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  const color = form.color || "#12294D";
  const shownIds = visibleFieldIds(form.fields, values);
  const pages = buildPages(form.fields, shownIds);
  const curPage = Math.min(page, pages.length - 1);
  const isLast = curPage === pages.length - 1;

  if (done) {
    return (
      <div className={preview ? "py-10 px-6" : "min-h-screen flex items-center justify-center p-6"}>
        <div className="max-w-md text-center mx-auto">
          {logoOk && (
            <img
              src="/mardom-logo.png"
              alt="MARDOM"
              onError={() => setLogoOk(false)}
              className="h-20 w-auto mx-auto mb-6"
            />
          )}
          <div className="w-12 h-12 rounded-full mx-auto mb-4" style={{ background: color }} />
          <p className="text-[15px]">{form.thanks_message}</p>
          {preview && (
            <button
              type="button"
              onClick={() => {
                setDone(false);
                setValues({});
                setPage(0);
              }}
              className="mt-5 text-[13px] text-blue underline"
            >
              Volver a probar el formulario
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={preview ? "flex items-start justify-center p-3 sm:p-6" : "min-h-screen flex items-start justify-center p-6 md:p-10"}>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl max-w-[520px] w-full p-7 md:p-8 shadow-[0_10px_40px_rgba(18,41,77,0.12)] relative overflow-hidden fade-up"
      >
        <div className="absolute inset-x-0 top-0 h-2" style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
        {logoOk && (
          <img
            src="/mardom-logo.png"
            alt="MARDOM"
            onError={() => setLogoOk(false)}
            className="h-20 w-auto mx-auto mb-6"
          />
        )}
        <h1 className="text-[20px] mb-1.5" style={{ color }}>
          {form.title}
        </h1>
        {form.description && (
          <p className="text-gray-500 text-[13px] mb-5 whitespace-pre-line">{form.description}</p>
        )}

        {pages.length > 1 && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-[12px] text-gray-500 mb-1.5">
              <span>
                Página {curPage + 1} de {pages.length}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${((curPage + 1) / pages.length) * 100}%`, background: color }}
              />
            </div>
          </div>
        )}

        {pages[curPage].map((f) => (
          <FieldRenderer
            key={f.id}
            field={f}
            value={values[f.id]}
            onChange={(v) => setValue(f.id, v)}
            onUpload={(file) => uploadFile(f.id, file)}
            color={color}
          />
        ))}

        {error && <p className="text-[#B23A3A] text-[13px] mb-3">{error}</p>}

        <div className="flex gap-2.5">
          {curPage > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="px-5 py-2.5 rounded-lg font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
            >
              Atrás
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 text-white rounded-lg font-semibold disabled:opacity-60"
            style={{ background: color }}
          >
            {isLast ? (submitting ? "Enviando..." : form.button_text || "Enviar") : "Siguiente"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldRenderer({ field, value, onChange, onUpload, color }) {
  const opts = parseOptions(field.options).map((o) => o.trim()).filter(Boolean);

  if (field.type === "info") {
    return (
      <div className="text-gray-500 text-[13.5px] mb-4 whitespace-pre-line" style={fmtStyle(field.fmt)}>
        {field.label}
      </div>
    );
  }
  if (field.type === "seccion") {
    return (
      <h3 className="text-[15px] mt-5 mb-2" style={{ color, ...fmtStyle(field.fmt) }}>
        {field.label}
      </h3>
    );
  }

  const label = (
    <label className="block text-[13px] font-medium mb-1.5" style={fmtStyle(field.fmt)}>
      {field.label} {field.required && <span className="text-[#B23A3A]">*</span>}
    </label>
  );

  const baseClass = "w-full px-2.5 py-2 border border-gray-200 rounded-lg";

  switch (field.type) {
    case "larga":
      return (
        <div className="mb-4">
          {label}
          <textarea className={baseClass + " min-h-[80px]"} value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "fecha":
      return (
        <div className="mb-4">
          {label}
          <input type="date" className={baseClass} value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "hora":
      return (
        <div className="mb-4">
          {label}
          <input type="time" className={baseClass} value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "numero":
      return (
        <div className="mb-4">
          {label}
          <input type="number" className={baseClass} value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "email":
      return (
        <div className="mb-4">
          {label}
          <input type="email" className={baseClass} value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "telefono":
      return (
        <div className="mb-4">
          {label}
          <input type="tel" className={baseClass} value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case "desplegable":
      return (
        <div className="mb-4">
          {label}
          <select className={baseClass} value={value || ""} onChange={(e) => onChange(e.target.value)}>
            <option value="">Selecciona...</option>
            {opts.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      );
    case "unica":
      return (
        <div className="mb-4">
          {label}
          {opts.map((o) => (
            <label key={o} className="block text-[13.5px] font-normal mb-1">
              <input type="radio" name={field.id} checked={value === o} onChange={() => onChange(o)} className="mr-1.5" />
              {o}
            </label>
          ))}
        </div>
      );
    case "multiple": {
      const arr = Array.isArray(value) ? value : [];
      return (
        <div className="mb-4">
          {label}
          {opts.map((o) => (
            <label key={o} className="block text-[13.5px] font-normal mb-1">
              <input
                type="checkbox"
                checked={arr.includes(o)}
                onChange={(e) =>
                  onChange(e.target.checked ? [...arr, o] : arr.filter((x) => x !== o))
                }
                className="mr-1.5"
              />
              {o}
            </label>
          ))}
        </div>
      );
    }
    case "sinono":
      return (
        <div className="mb-4">
          {label}
          <label className="mr-4 text-[13.5px] font-normal">
            <input type="radio" name={field.id} checked={value === "Sí"} onChange={() => onChange("Sí")} className="mr-1.5" />
            Sí
          </label>
          <label className="text-[13.5px] font-normal">
            <input type="radio" name={field.id} checked={value === "No"} onChange={() => onChange("No")} className="mr-1.5" />
            No
          </label>
        </div>
      );
    case "escala":
      return (
        <div className="mb-4">
          {label}
          <div className="flex gap-3.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="text-[13.5px] font-normal">
                <input type="radio" name={field.id} checked={value === n} onChange={() => onChange(n)} className="mr-1" />
                {n}
              </label>
            ))}
          </div>
        </div>
      );
    case "archivo":
      return (
        <div className="mb-4">
          {label}
          <input type="file" onChange={(e) => onUpload(e.target.files?.[0])} />
          {value && <p className="text-[11.5px] text-green-700 mt-1">Archivo subido correctamente.</p>}
        </div>
      );
    case "firma":
      return (
        <div className="mb-4">
          {label}
          <SignaturePad onSave={(blob) => onUpload(blob)} />
          {value && <p className="text-[11.5px] text-green-700 mt-1">Firma guardada.</p>}
        </div>
      );
    default:
      return (
        <div className="mb-4">
          {label}
          <input type="text" className={baseClass} value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
  }
}
