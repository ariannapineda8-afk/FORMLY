"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
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
import { LOGIC_TRIGGER_TYPES, triggerChoices, findBrokenCondition } from "@/lib/logic";
import { useRole } from "@/components/RoleContext";
import PublicForm from "@/components/PublicForm";

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

function ConditionEditor({ field, index, fields, onChange }) {
  const cond = field.showIf;
  const candidates = fields.slice(0, index).filter((x) => LOGIC_TRIGGER_TYPES.includes(x.type));
  const trigger = cond ? fields.find((x) => x.id === cond.fieldId) : null;
  const triggerIndex = trigger ? fields.findIndex((x) => x.id === trigger.id) : -1;
  const broken = cond && (!trigger || triggerIndex >= index);
  const choices = trigger ? triggerChoices(trigger) : [];
  const isMulti = trigger?.type === "multiple";
  const labelOf = (x) => x.label?.trim() || TYPE_LABELS[x.type];

  if (!cond) {
    return (
      <div className="mt-4 pt-3 border-t border-dashed border-[#E6E1D6]">
        {candidates.length === 0 ? (
          <p className="text-[11.5px] text-gray-400">
            Para mostrar este campo solo en ciertos casos, agrega antes una pregunta de selección, Sí/No o escala.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => {
              const first = candidates[candidates.length - 1];
              onChange({ fieldId: first.id, op: "eq", value: triggerChoices(first)[0] ?? "" });
            }}
            className="text-[12.5px] font-medium text-blue hover:text-navy"
          >
            + Mostrar este campo solo si...
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 pt-3 border-t border-dashed border-[#E6E1D6]">
      <p className="text-[11.5px] font-semibold text-off mb-2">Mostrar este campo solo si</p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={cond.fieldId}
          onChange={(e) => {
            const t = fields.find((x) => x.id === e.target.value);
            onChange({ fieldId: e.target.value, op: "eq", value: t ? triggerChoices(t)[0] ?? "" : "" });
          }}
          className="input !py-1.5 !w-auto max-w-[260px] text-[12.5px]"
        >
          {!trigger && <option value={cond.fieldId}>(pregunta no disponible)</option>}
          {candidates.map((x) => (
            <option key={x.id} value={x.id}>
              {labelOf(x)}
            </option>
          ))}
          {trigger && triggerIndex >= index && <option value={trigger.id}>{labelOf(trigger)}</option>}
        </select>
        <select
          value={cond.op || "eq"}
          onChange={(e) => onChange({ ...cond, op: e.target.value })}
          className="input !py-1.5 !w-auto text-[12.5px]"
        >
          <option value="eq">{isMulti ? "incluye" : "es igual a"}</option>
          <option value="not">{isMulti ? "no incluye" : "es distinto de"}</option>
        </select>
        <select
          value={cond.value}
          onChange={(e) => onChange({ ...cond, value: e.target.value })}
          className="input !py-1.5 !w-auto max-w-[220px] text-[12.5px]"
        >
          {!choices.includes(cond.value) && <option value={cond.value}>{cond.value || "(elige una opción)"}</option>}
          {choices.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-[12px] text-gray-500 hover:text-[#B23A3A]"
        >
          Quitar condición
        </button>
      </div>
      {broken && (
        <p className="text-[11.5px] text-[#B23A3A] mt-2">
          Esta condición depende de una pregunta que ya no está arriba de este campo. Muévela o cambia la condición.
        </p>
      )}
    </div>
  );
}

export default function FormBuilder({ formId, initial }) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [buttonText, setButtonText] = useState(initial?.buttonText || "Enviar");
  const [thanksMessage, setThanksMessage] = useState(
    initial?.thanksMessage || "Gracias por completar el formulario. Nos pondremos en contacto pronto."
  );
  const [color, setColor] = useState("#12294D");
  const [status, setStatus] = useState("borrador");
  const [fields, setFields] = useState(initial?.fields || []);
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [device, setDevice] = useState("desktop");
  const { role } = useRole();
  const [dragField, setDragField] = useState(null);
  const [overField, setOverField] = useState(null);
  const focusId = useRef(null);

  useEffect(() => {
    if (!formId) return;
    (async () => {
      let data = null;
      try {
        ({ form: data } = await apiFetch(`/api/forms/${formId}`));
      } catch (err) {
        alert(err.message);
      }
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
  }, [formId]);

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
    setFields((f) =>
      f
        .filter((x) => x.id !== id)
        .map((x) => (x.showIf?.fieldId === id ? { ...x, showIf: undefined } : x))
    );
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
    const broken = findBrokenCondition(cleanFields);
    if (broken) {
      alert(
        `La condición del campo "${broken.label || TYPE_LABELS[broken.type]}" depende de una pregunta que no está arriba de él. Muévela o cambia la condición.`
      );
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
    };

    try {
      if (formId) {
        await apiFetch(`/api/forms/${formId}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/api/forms", { method: "POST", body: JSON.stringify(payload) });
      }
      router.push("/dashboard/forms");
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard?.writeText(url);
    alert("Enlace copiado:\n" + url);
  }

  if (role === "lectura") {
    return (
      <div className="card p-6 max-w-md">
        <h3 className="text-navy font-semibold mb-1">Tu rol es de solo lectura</h3>
        <p className="text-gray-500 text-[13px]">
          Puedes ver formularios y respuestas, pero no crear ni editar. Pide a un administrador que cambie tu rol a
          Editor si lo necesitas.
        </p>
      </div>
    );
  }

  const previewForm = {
    id: "preview",
    title: title || "Título del formulario",
    description,
    button_text: buttonText,
    thanks_message: thanksMessage,
    color,
    fields: fields.map((f) =>
      OPTION_TYPES.includes(f.type) ? { ...f, options: parseOptions(f.options).filter((o) => o.trim()) } : f
    ),
  };

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
              {f.showIf && (
                <span className="text-[10.5px] font-semibold text-[#6B4FA3] bg-[#EFEAF8] rounded-full px-2 py-0.5">
                  Condicional
                </span>
              )}
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
              <ConditionEditor
                field={f}
                index={idx}
                fields={fields}
                onChange={(v) => updateField(f.id, "showIf", v)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="min-[901px]:sticky min-[901px]:top-[76px]">
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

        <button type="button" onClick={() => setShowPreview(true)} className="btn btn-outline w-full mt-3.5">
          Vista previa
        </button>
        <button onClick={save} disabled={saving} className="btn btn-primary w-full mt-2.5 !py-3">
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

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/45 flex flex-col" onClick={() => setShowPreview(false)}>
          <div
            className="bg-white flex items-center gap-3 px-4 py-3 border-b border-[#ECE7DE] flex-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p className="text-[14px] font-semibold text-navy leading-tight">Vista previa</p>
              <p className="text-[11.5px] text-gray-500">Así lo verá quien responde. Puedes probarlo; nada se guarda.</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex rounded-xl border border-[#E4E7EC] overflow-hidden text-[12.5px]">
                {[
                  ["desktop", "Computadora"],
                  ["mobile", "Celular"],
                ].map(([k, l]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setDevice(k)}
                    className={`px-3 py-1.5 ${device === k ? "bg-navy text-white" : "bg-white text-navy hover:bg-[#F7F5F1]"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setShowPreview(false)} className="btn btn-navy !py-1.5">
                Cerrar
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-cream py-5 px-3" onClick={(e) => e.stopPropagation()}>
            <div
              className={`mx-auto transition-all ${
                device === "mobile" ? "max-w-[390px] rounded-[28px] border-[10px] border-navy overflow-hidden bg-cream" : "max-w-[720px]"
              }`}
            >
              <PublicForm form={previewForm} preview />
            </div>
          </div>
        </div>
      )}
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
