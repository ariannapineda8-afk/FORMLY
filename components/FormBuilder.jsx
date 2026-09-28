"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  FIELD_GROUPS,
  TYPE_LABELS,
  TYPE_HINTS,
  OPTION_TYPES,
  SIZES,
  parseOptions,
  fmtStyle,
} from "@/lib/fields";
import { FieldBadge, GripIcon } from "@/components/FieldIcon";
import { explainError } from "@/lib/errors";

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

const svgProps = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function IconBtn({ title, onClick, danger, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 transition-colors ${
        danger ? "hover:bg-[#FCEBEB] hover:text-[#B23A3A]" : "hover:bg-[#EEF1F5] hover:text-navy"
      }`}
    >
      {children}
    </button>
  );
}

function FormatBar({ fmt, onChange }) {
  const f = fmt || {};
  const btn = (active) =>
    `w-8 h-8 rounded-lg text-[13px] border transition-colors ${
      active ? "bg-navy text-white border-navy" : "bg-white border-[#E4E7EC] text-navy hover:bg-[#F7F5F1]"
    }`;
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <button type="button" title="Negrita" onClick={() => onChange({ ...f, b: !f.b })} className={btn(f.b) + " font-bold"}>
        B
      </button>
      <button type="button" title="Cursiva" onClick={() => onChange({ ...f, i: !f.i })} className={btn(f.i) + " italic font-serif"}>
        I
      </button>
      <select
        title="Tamaño de letra"
        value={f.size || "md"}
        onChange={(e) => onChange({ ...f, size: e.target.value })}
        className="h-8 rounded-lg border border-[#E4E7EC] bg-white text-[12px] text-navy px-2 outline-none focus:border-blue"
      >
        {SIZES.map((s) => (
          <option key={s.v} value={s.v}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function OptionsEditor({ type, options, onChange }) {
  const opts = parseOptions(options);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const focusIdx = useRef(null);
  const refs = useRef([]);

  useEffect(() => {
    if (focusIdx.current !== null) {
      refs.current[focusIdx.current]?.focus();
      focusIdx.current = null;
    }
  }, [opts.length]);

  function setOpt(i, val) {
    const n = [...opts];
    n[i] = val;
    onChange(n);
  }
  function add(at) {
    const n = [...opts];
    n.splice(at, 0, "");
    focusIdx.current = at;
    onChange(n);
  }
  function remove(i) {
    if (opts.length <= 1) {
      onChange([""]);
      return;
    }
    const n = opts.filter((_, k) => k !== i);
    focusIdx.current = Math.max(0, i - 1);
    onChange(n);
  }
  function drop(target) {
    if (dragIdx === null || dragIdx === target) return;
    const n = [...opts];
    const [m] = n.splice(dragIdx, 1);
    n.splice(target, 0, m);
    onChange(n);
  }

  return (
    <div className="mt-3">
      <p className="text-[11.5px] font-semibold text-off mb-2">
        Opciones <span className="font-normal">· arrástralas con el ícono ⋮⋮ para cambiar el orden</span>
      </p>
      {opts.map((o, i) => (
        <div
          key={i}
          onDragOver={(e) => {
            if (dragIdx !== null) {
              e.preventDefault();
              setOverIdx(i);
            }
          }}
          onDrop={(e) => {
            if (dragIdx === null) return;
            e.preventDefault();
            e.stopPropagation();
            drop(i);
            setDragIdx(null);
            setOverIdx(null);
          }}
          className={`flex items-center gap-2 mb-1.5 rounded-lg px-1 py-0.5 ${
            dragIdx === i ? "opacity-40" : ""
          } ${dragIdx !== null && overIdx === i && dragIdx !== i ? "bg-corallt" : ""}`}
        >
          <span
            draggable
            title="Arrastra para mover"
            onDragStart={(e) => {
              setDragIdx(i);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", "opt" + i);
              const row = e.currentTarget.parentElement;
              if (row) e.dataTransfer.setDragImage(row, 12, 12);
            }}
            onDragEnd={() => {
              setDragIdx(null);
              setOverIdx(null);
            }}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-navy px-0.5"
          >
            <GripIcon />
          </span>
          {type === "unica" && <span className="w-4 h-4 rounded-full border-2 border-[#C9CFD8] shrink-0" />}
          {type === "multiple" && <span className="w-4 h-4 rounded border-2 border-[#C9CFD8] shrink-0" />}
          {type === "desplegable" && (
            <span className="text-[11.5px] text-gray-400 w-4 text-right shrink-0">{i + 1}.</span>
          )}
          <input
            ref={(el) => (refs.current[i] = el)}
            value={o}
            placeholder={`Opción ${i + 1}`}
            onChange={(e) => setOpt(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(i + 1);
              } else if (e.key === "Backspace" && o === "" && opts.length > 1) {
                e.preventDefault();
                remove(i);
              }
            }}
            className="input !py-1.5 flex-1"
          />
          <IconBtn title="Quitar opción" onClick={() => remove(i)} danger>
            <svg {...svgProps}>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </IconBtn>
        </div>
      ))}
      <button
        type="button"
        onClick={() => add(opts.length)}
        className="mt-1 ml-1 text-[12.5px] font-medium text-blue hover:text-navy"
      >
        + Agregar opción
      </button>
    </div>
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
  const [saving, setSaving] = useState(false);
  const [dragField, setDragField] = useState(null);
  const [overField, setOverField] = useState(null);
  const focusId = useRef(null);

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
        setFields(
          (data.fields || []).map((f) =>
            OPTION_TYPES.includes(f.type) ? { ...f, options: parseOptions(f.options) } : f
          )
        );
        setSlug(data.slug);
      }
    })();
  }, [formId, supabase]);

  useEffect(() => {
    if (!focusId.current) return;
    const el = document.getElementById("label-" + focusId.current);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    }
    focusId.current = null;
  }, [fields]);

  function addField(type) {
    const id = "fx" + Date.now() + Math.random().toString(16).slice(2, 6);
    focusId.current = id;
    setFields((f) => [
      ...f,
      {
        id,
        type,
        label: "",
        required: false,
        options: OPTION_TYPES.includes(type) ? ["Opción 1", "Opción 2"] : "",
      },
    ]);
  }
  function updateField(id, key, val) {
    setFields((f) => f.map((x) => (x.id === id ? { ...x, [key]: val } : x)));
  }
  function removeField(id) {
    setFields((f) => f.filter((x) => x.id !== id));
  }
  function duplicateField(id) {
    setFields((f) => {
      const i = f.findIndex((x) => x.id === id);
      if (i < 0) return f;
      const copy = {
        ...f[i],
        id: "fx" + Date.now() + Math.random().toString(16).slice(2, 6),
        options: Array.isArray(f[i].options) ? [...f[i].options] : f[i].options,
      };
      const arr = [...f];
      arr.splice(i + 1, 0, copy);
      return arr;
    });
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
  function dropField(targetId) {
    if (!dragField || dragField === targetId) return;
    setFields((f) => {
      const arr = [...f];
      const from = arr.findIndex((x) => x.id === dragField);
      const to = arr.findIndex((x) => x.id === targetId);
      if (from < 0 || to < 0) return f;
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return arr;
    });
  }

  async function save() {
    if (!title.trim()) {
      alert("Ponle un título al formulario antes de guardar.");
      return;
    }
    const cleanFields = fields.map((f) =>
      OPTION_TYPES.includes(f.type)
        ? { ...f, options: parseOptions(f.options).map((o) => o.trim()).filter(Boolean) }
        : f
    );
    const bad = cleanFields.find((f) => OPTION_TYPES.includes(f.type) && f.options.length === 0);
    if (bad) {
      alert(`El campo "${bad.label || TYPE_LABELS[bad.type]}" necesita al menos una opción.`);
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
      fields: cleanFields,
      updated_at: new Date(),
    };

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let error;
    if (formId) {
      ({ error } = await supabase.from("forms").update(payload).eq("id", formId));
    } else {
      ({ error } = await supabase.from("forms").insert({
        ...payload,
        slug: slugify(title),
        owner_email: user?.email,
      }));
    }
    setSaving(false);
    if (error) {
      alert(explainError(error, user?.email));
      return;
    }
    router.push("/dashboard/forms");
    router.refresh();
  }

  function copyLink() {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard?.writeText(url);
    alert("Enlace copiado:\n" + url);
  }

  return (
    <div className="grid grid-cols-[1fr_330px] gap-5 items-start max-[900px]:grid-cols-1">
      <div>
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <h3 className="text-[14px] font-semibold text-navy">Agregar campo</h3>
            <span className="text-[11.5px] text-gray-500">Toca un tipo para añadirlo al final del formulario</span>
          </div>
          <div className="space-y-3">
            {FIELD_GROUPS.map((g) => (
              <div key={g.name}>
                <p className="text-[11px] font-semibold text-off mb-1.5">{g.name}</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.types.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addField(t)}
                      className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border border-[#E4E7EC] bg-white text-[12.5px] text-navy hover:border-blue hover:bg-corallt transition-colors"
                    >
                      <FieldBadge type={t} size={26} />
                      {TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {fields.length === 0 && (
          <div className="border-2 border-dashed border-[#DCD6CB] rounded-2xl text-center py-12 px-6">
            <div className="w-10 h-10 rounded-full bg-corallt text-coral2 mx-auto mb-3 flex items-center justify-center text-[20px] font-semibold">
              +
            </div>
            <p className="text-navy font-semibold text-[14px] mb-1">Tu formulario está vacío</p>
            <p className="text-gray-500 text-[12.5px]">Elige un tipo de campo arriba para empezar a construirlo.</p>
          </div>
        )}

        {fields.map((f, idx) => (
          <div
            key={f.id}
            id={"field-" + f.id}
            onDragOver={(e) => {
              if (dragField) {
                e.preventDefault();
                setOverField(f.id);
              }
            }}
            onDrop={(e) => {
              if (!dragField) return;
              e.preventDefault();
              dropField(f.id);
              setDragField(null);
              setOverField(null);
            }}
            className={`card mb-3 overflow-hidden transition-shadow ${dragField === f.id ? "opacity-40" : ""} ${
              dragField && overField === f.id && dragField !== f.id ? "ring-2 ring-blue" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[#F2EFE9] bg-[#FCFBF8] flex-wrap">
              <span
                draggable
                title="Arrastra para reordenar"
                onDragStart={(e) => {
                  setDragField(f.id);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", f.id);
                  const card = e.currentTarget.closest("[id^='field-']");
                  if (card) e.dataTransfer.setDragImage(card, 20, 20);
                }}
                onDragEnd={() => {
                  setDragField(null);
                  setOverField(null);
                }}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-navy px-1 py-1"
              >
                <GripIcon />
              </span>
              <FieldBadge type={f.type} size={30} />
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-navy leading-tight">
                  {idx + 1}. {TYPE_LABELS[f.type]}
                </p>
                <p className="text-[11px] text-gray-500 truncate hidden sm:block">{TYPE_HINTS[f.type]}</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                {f.type !== "seccion" && f.type !== "info" && (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!f.required}
                    onClick={() => updateField(f.id, "required", !f.required)}
                    className="flex items-center gap-1.5 text-[12px] text-gray-600 mr-1.5"
                  >
                    <span
                      className={`w-8 h-[18px] rounded-full relative transition-colors ${
                        f.required ? "bg-blue" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all ${
                          f.required ? "left-[16px]" : "left-[2px]"
                        }`}
                      />
                    </span>
                    Obligatorio
                  </button>
                )}
                <IconBtn title="Duplicar campo" onClick={() => duplicateField(f.id)}>
                  <svg {...svgProps}>
                    <rect x="9" y="9" width="11" height="11" rx="2" />
                    <path d="M5 15V6a2 2 0 0 1 2-2h8" />
                  </svg>
                </IconBtn>
                <IconBtn title="Subir" onClick={() => moveField(f.id, -1)}>
                  <svg {...svgProps}>
                    <path d="m6 14 6-6 6 6" />
                  </svg>
                </IconBtn>
                <IconBtn title="Bajar" onClick={() => moveField(f.id, 1)}>
                  <svg {...svgProps}>
                    <path d="m6 10 6 6 6-6" />
                  </svg>
                </IconBtn>
                <IconBtn title="Eliminar campo" onClick={() => removeField(f.id)} danger>
                  <svg {...svgProps}>
                    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" />
                  </svg>
                </IconBtn>
              </div>
            </div>

            <div className="p-4">
              <FormatBar fmt={f.fmt} onChange={(v) => updateField(f.id, "fmt", v)} />
              {f.type === "info" ? (
                <textarea
                  id={"label-" + f.id}
                  value={f.label}
                  onChange={(e) => updateField(f.id, "label", e.target.value)}
                  placeholder="Escribe aquí el texto informativo..."
                  rows={3}
                  style={fmtStyle(f.fmt)}
                  className="input"
                />
              ) : (
                <input
                  id={"label-" + f.id}
                  type="text"
                  value={f.label}
                  onChange={(e) => updateField(f.id, "label", e.target.value)}
                  placeholder={f.type === "seccion" ? "Título de la sección..." : "Escribe la pregunta..."}
                  style={fmtStyle(f.fmt)}
                  className="input"
                />
              )}
              {OPTION_TYPES.includes(f.type) && (
                <OptionsEditor
                  type={f.type}
                  options={f.options}
                  onChange={(v) => updateField(f.id, "options", v)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="min-[901px]:sticky min-[901px]:top-3">
        <div className="card p-5">
          <h3 className="text-[14.5px] text-navy font-semibold mb-3.5">Detalles del formulario</h3>
          <Field label="Título">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Ej. Solicitud de cotización"
            />
          </Field>
          <Field label="Descripción">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[64px]"
            />
          </Field>
          <Field label="Texto del botón de envío">
            <input value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="input" />
          </Field>
          <Field label="Mensaje al completar">
            <textarea
              value={thanksMessage}
              onChange={(e) => setThanksMessage(e.target.value)}
              className="input min-h-[64px]"
            />
          </Field>
          <Field label="Color principal">
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-11 h-9 border border-[#E4E7EC] rounded-lg p-0.5 bg-white"
              />
              <span className="text-[12px] text-gray-500 uppercase">{color}</span>
            </div>
          </Field>
          <Field label="Estado">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              <option value="borrador">Borrador</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </Field>
        </div>

        <button onClick={save} disabled={saving} className="btn btn-primary w-full mt-3.5 !py-3">
          {saving ? "Guardando..." : "Guardar formulario"}
        </button>

        {slug && (
          <div className="card p-3.5 mt-3.5">
            <p className="text-[12px] text-gray-500 mb-1.5">
              Enlace público{status !== "activo" ? " (funciona cuando el estado sea Activo)" : ""}
            </p>
            <div className="flex gap-1.5">
              <input
                readOnly
                value={"/f/" + slug}
                className="input !py-1.5 text-[12px] text-gray-500"
                onFocus={(e) => e.target.select()}
              />
              <button type="button" onClick={copyLink} className="btn-sm shrink-0">
                Copiar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[12px] text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
