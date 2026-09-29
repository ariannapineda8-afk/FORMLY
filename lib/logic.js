import { parseOptions } from "@/lib/fields";

// Tipos de pregunta que pueden "controlar" a otra (tienen respuestas de opción fija).
export const LOGIC_TRIGGER_TYPES = ["unica", "multiple", "desplegable", "sinono", "escala"];

export function triggerChoices(field) {
  if (!field) return [];
  if (field.type === "sinono") return ["Sí", "No"];
  if (field.type === "escala") return ["1", "2", "3", "4", "5"];
  return parseOptions(field.options).map((o) => o.trim()).filter(Boolean);
}

function matches(value, target) {
  if (Array.isArray(value)) return value.map(String).includes(String(target));
  if (value === undefined || value === null || value === "") return false;
  return String(value) === String(target);
}

// Devuelve el conjunto de ids de campos que se deben mostrar según las respuestas actuales.
// Regla: una condición solo mira preguntas que estén ARRIBA; si la pregunta que la
// controla está oculta, el campo también se oculta.
export function visibleFieldIds(fields, values) {
  const visible = new Set();
  const seen = new Set();
  for (const f of fields || []) {
    const c = f.showIf;
    let show = true;
    if (c && c.fieldId && seen.has(c.fieldId)) {
      if (!visible.has(c.fieldId)) {
        show = false;
      } else {
        const hit = matches(values?.[c.fieldId], c.value);
        show = c.op === "not" ? !hit : hit;
      }
    }
    if (show) visible.add(f.id);
    seen.add(f.id);
  }
  return visible;
}

// Devuelve el primer campo cuya condición apunta a una pregunta inexistente o que está debajo.
export function findBrokenCondition(fields) {
  const before = new Set();
  for (const f of fields || []) {
    const c = f.showIf;
    if (c && c.fieldId && !before.has(c.fieldId)) return f;
    before.add(f.id);
  }
  return null;
}
