"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SignaturePad from "@/components/SignaturePad";

export default function PublicForm({ form }) {
  const supabase = createClient();
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function setValue(id, val) {
    setValues((v) => ({ ...v, [id]: val }));
  }

  async function uploadFile(id, file) {
    if (!file) return;
    const name = file.name || "firma.png";
    const path = `${form.id}/${Date.now()}-${name}`;
    const { error: upErr } = await supabase.storage.from("form-uploads").upload(path, file);
    if (upErr) {
      setError("No se pudo subir el archivo: " + upErr.message);
      return;
    }
    const { data } = supabase.storage.from("form-uploads").getPublicUrl(path);
    setValue(id, data.publicUrl);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const required = (form.fields || []).filter(
      (f) => f.required && f.type !== "seccion" && f.type !== "info"
    );
    for (const f of required) {
      if (!values[f.id]) {
        setError(`Por favor completa: ${f.label || "campo obligatorio"}`);
        return;
      }
    }
    setSubmitting(true);
    const { error: insErr } = await supabase.from("form_responses").insert({
      form_id: form.id,
      data: values,
    });
    setSubmitting(false);
    if (insErr) {
      setError("No se pudo enviar el formulario. Intenta de nuevo.");
      return;
    }
    setDone(true);
  }

  const color = form.color || "#12294D";

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-12 h-12 rounded-full mx-auto mb-4" style={{ background: color }} />
          <p className="text-[15px]">{form.thanks_message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center p-6 md:p-10">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl max-w-[520px] w-full p-7 md:p-8">
        <h1 className="text-[20px] mb-1.5" style={{ color }}>
          {form.title}
        </h1>
        {form.description && <p className="text-gray-500 text-[13px] mb-5">{form.description}</p>}

        {(form.fields || []).map((f) => (
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 text-white rounded-lg font-semibold disabled:opacity-60"
          style={{ background: color }}
        >
          {submitting ? "Enviando..." : form.button_text || "Enviar"}
        </button>
      </form>
    </div>
  );
}

function FieldRenderer({ field, value, onChange, onUpload, color }) {
  const opts = (field.options || "").split(",").map((o) => o.trim()).filter(Boolean);

  if (field.type === "info") {
    return <div className="text-gray-500 text-[13.5px] mb-4">{field.label}</div>;
  }
  if (field.type === "seccion") {
    return (
      <h3 className="text-[15px] mt-5 mb-2" style={{ color }}>
        {field.label}
      </h3>
    );
  }

  const label = (
    <label className="block text-[13px] font-medium mb-1.5">
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
