"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TYPE_LABELS = {
  corta: "Respuesta corta",
  larga: "Respuesta larga",
  unica: "Selección única",
  multiple: "Selección múltiple",
  desplegable: "Lista desplegable",
  fecha: "Fecha",
  hora: "Hora",
  numero: "Número",
  email: "Correo electrónico",
  telefono: "Teléfono",
  escala: "Escala de valoración",
  sinono: "Sí / No",
  archivo: "Subida de archivo",
  firma: "Firma",
  seccion: "Sección",
  info: "Texto informativo",
};

function slugify(text) {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 6)
  );
}

export default function FormBuilder({ formId }) {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("Enviar");
  const [thanksMessage, setThanksMessage] = useState(
    "Gracias por completar el formulario. Nos pondremos en contacto pronto."
  );
  const [color, setColor] = useState("#12294D");
  const [status, setStatus] = useState("borrador");
  const [fields, setFields] = useState([]);
  const [slug, setSlug] = useState("");
  const [newType, setNewType] = useState("corta");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!formId) return;
    (async () => {
      const { data } = await supabase.from("forms").select("*").eq("id", formId).single();
      if (data) {
        setTitle(data.title);
        setDescription(data.description || "");
        setButtonText(data.button_text || "Enviar");
        setThanksMessage(data.thanks_message || "");
        setColor(data.color || "#12294D");
        setStatus(data.status || "borrador");
        setFields(data.fields || []);
        setSlug(data.slug);
      }
    })();
  }, [formId, supabase]);

  function addField() {
    const needsOptions = ["unica", "multiple", "desplegable"].includes(newType);
    setFields((f) => [
      ...f,
      {
        id: "fx" + Date.now() + Math.random().toString(16).slice(2),
        type: newType,
        label: "",
        required: false,
        options: needsOptions ? "Opción 1, Opción 2" : "",
      },
    ]);
  }
  function updateField(id, key, val) {
    setFields((f) => f.map((x) => (x.id === id ? { ...x, [key]: val } : x)));
  }
  function removeField(id) {
    setFields((f) => f.filter((x) => x.id !== id));
  }
  function moveField(id, dir) {
    setFields((f) => {
      const arr = [...f];
      const i = arr.findIndex((x) => x.id === id);
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  }

  async function save() {
    if (!title.trim()) {
      alert("Ponle un título al formulario antes de guardar.");
      return;
    }
    setSaving(true);
    const payload = {
      title,
      description,
      button_text: buttonText,
      thanks_message: thanksMessage,
      color,
      status,
      fields,
      updated_at: new Date(),
    };

    let error;
    if (formId) {
      ({ error } = await supabase.from("forms").update(payload).eq("id", formId));
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      ({ error } = await supabase.from("forms").insert({
        ...payload,
        slug: slugify(title),
        owner_email: user?.email,
      }));
    }
    setSaving(false);
    if (error) {
      alert("No se pudo guardar: " + error.message);
      return;
    }
    router.push("/dashboard/forms");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-[1fr_340px] gap-4.5 items-start max-[900px]:grid-cols-1">
      <div>
        <div className="flex gap-2 mb-4.5">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg"
          >
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <button onClick={addField} className="px-4 py-2 bg-navy text-white rounded-lg text-[13px] font-medium">
            + Agregar campo
          </button>
        </div>

        {fields.length === 0 && (
          <p className="text-gray-500 text-center py-10">Agrega tu primer campo arriba.</p>
        )}

        {fields.map((f) => (
          <div key={f.id} className="bg-white border border-gray-200 rounded-lg p-3.5 mb-2.5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-blue bg-bluelt px-2 py-0.5 rounded">
                {TYPE_LABELS[f.type]}
              </span>
              <div className="flex gap-1.5">
                <button onClick={() => moveField(f.id, -1)} className="w-6.5 h-6.5 border border-gray-200 rounded">↑</button>
                <button onClick={() => moveField(f.id, 1)} className="w-6.5 h-6.5 border border-gray-200 rounded">↓</button>
                <button onClick={() => removeField(f.id)} className="w-6.5 h-6.5 border border-gray-200 rounded">✕</button>
              </div>
            </div>
            <input
              type="text"
              value={f.label}
              onChange={(e) => updateField(f.id, "label", e.target.value)}
              placeholder={
                f.type === "info"
                  ? "Texto informativo..."
                  : f.type === "seccion"
                  ? "Título de la sección..."
                  : "Etiqueta de la pregunta..."
              }
              className="w-full px-2.5 py-2 border border-gray-200 rounded-md mb-1.5"
            />
            {["unica", "multiple", "desplegable"].includes(f.type) && (
              <input
                type="text"
                value={f.options}
                onChange={(e) => updateField(f.id, "options", e.target.value)}
                placeholder="Opciones separadas por coma"
                className="w-full px-2.5 py-2 border border-gray-200 rounded-md mb-1.5"
              />
            )}
            {f.type !== "seccion" && f.type !== "info" && (
              <label className="text-[12px] text-gray-500 flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) => updateField(f.id, "required", e.target.checked)}
                />
                Obligatorio
              </label>
            )}
          </div>
        ))}
      </div>

      <div>
        <div className="bg-white border border-gray-200 rounded-xl p-4.5">
          <h3 className="text-[14.5px] text-navy mb-3">Detalles del formulario</h3>
          <Field label="Título">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="inp" placeholder="Ej. Solicitud de cotización" />
          </Field>
          <Field label="Descripción">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="inp min-h-[56px]" />
          </Field>
          <Field label="Texto del botón de envío">
            <input value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="inp" />
          </Field>
          <Field label="Mensaje al completar">
            <textarea value={thanksMessage} onChange={(e) => setThanksMessage(e.target.value)} className="inp min-h-[56px]" />
          </Field>
          <Field label="Color principal">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-11 h-9 border border-gray-200 rounded-md p-0.5" />
          </Field>
          <Field label="Estado">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="inp">
              <option value="borrador">Borrador</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </Field>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="w-full mt-3.5 py-2.5 bg-navy text-white rounded-lg font-semibold hover:bg-navy2 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
        {slug && status === "activo" && (
          <p className="text-[11.5px] text-gray-500 mt-2.5 break-all">
            Enlace público: /f/{slug}
          </p>
        )}
      </div>

      <style jsx global>{`
        .inp {
          width: 100%;
          padding: 9px 10px;
          border: 1px solid #e2e6ec;
          border-radius: 7px;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-[12px] text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
