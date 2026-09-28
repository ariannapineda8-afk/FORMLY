export const TYPE_LABELS = {
  corta: "Respuesta corta",
  larga: "Respuesta larga",
  unica: "Selección única",
  multiple: "Selección múltiple",
  desplegable: "Lista desplegable",
  sinono: "Sí / No",
  escala: "Escala de valoración",
  fecha: "Fecha",
  hora: "Hora",
  numero: "Número",
  email: "Correo electrónico",
  telefono: "Teléfono",
  archivo: "Subida de archivo",
  firma: "Firma",
  seccion: "Sección",
  info: "Texto informativo",
};

export const TYPE_HINTS = {
  corta: "La persona escribe una línea de texto.",
  larga: "La persona escribe un párrafo.",
  unica: "La persona elige una sola opción.",
  multiple: "La persona puede marcar varias opciones.",
  desplegable: "La persona elige de una lista desplegable.",
  sinono: "La persona responde Sí o No.",
  escala: "La persona califica del 1 al 5.",
  fecha: "La persona elige una fecha.",
  hora: "La persona elige una hora.",
  numero: "Solo acepta números.",
  email: "Solo acepta un correo electrónico.",
  telefono: "La persona escribe un teléfono.",
  archivo: "La persona adjunta un archivo.",
  firma: "La persona firma con el dedo o el mouse.",
  seccion: "Título que separa partes del formulario.",
  info: "Texto explicativo, no pide respuesta.",
};

export const FIELD_GROUPS = [
  { name: "Texto", tone: "blue", types: ["corta", "larga"] },
  { name: "Selección", tone: "mint", types: ["unica", "multiple", "desplegable", "sinono", "escala"] },
  { name: "Datos", tone: "amber", types: ["fecha", "hora", "numero", "email", "telefono"] },
  { name: "Archivos", tone: "violet", types: ["archivo", "firma"] },
  { name: "Estructura", tone: "slate", types: ["seccion", "info"] },
];

export const TONES = {
  blue: "bg-[#E9F1F9] text-[#2C5680]",
  mint: "bg-mintlt text-mint",
  amber: "bg-warnlt text-warn",
  violet: "bg-[#EFEAF8] text-[#6B4FA3]",
  slate: "bg-[#EEF0F3] text-[#5B6577]",
};

export function toneOf(type) {
  const g = FIELD_GROUPS.find((x) => x.types.includes(type));
  return TONES[g ? g.tone : "slate"];
}

export const OPTION_TYPES = ["unica", "multiple", "desplegable"];

// Acepta el formato nuevo (arreglo) y el viejo (texto separado por comas).
export function parseOptions(v) {
  if (Array.isArray(v)) return v.map((o) => String(o));
  if (typeof v === "string") return v.split(",").map((o) => o.trim()).filter(Boolean);
  return [];
}

export const SIZES = [
  { v: "sm", label: "Pequeño", px: 12 },
  { v: "md", label: "Normal", px: null },
  { v: "lg", label: "Grande", px: 17 },
  { v: "xl", label: "Muy grande", px: 22 },
];

// Estilo de texto (negrita / cursiva / tamaño) guardado por campo.
export function fmtStyle(fmt) {
  const st = {};
  if (!fmt) return st;
  if (fmt.b) st.fontWeight = 700;
  if (fmt.i) st.fontStyle = "italic";
  const size = SIZES.find((s) => s.v === fmt.size);
  if (size && size.px) st.fontSize = size.px;
  return st;
}
