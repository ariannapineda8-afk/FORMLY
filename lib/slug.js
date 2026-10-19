// Enlace público de un formulario a partir de su título.
// Ej.: "Auxiliar de Almacén" -> "auxiliar-de-almacen".
// Solo agrega un número al final si ya existe otro formulario con el mismo enlace.

export function slugBase(text) {
  const base = String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60)
    .replace(/-$/g, "");
  return base || "formulario";
}

export async function uniqueSlug(supabase, title, excludeId) {
  const base = slugBase(title);
  let candidate = base;
  for (let i = 2; i <= 30; i++) {
    const { data } = await supabase.from("forms").select("id").eq("slug", candidate).limit(5);
    const taken = (data || []).some((row) => row.id !== excludeId);
    if (!taken) return candidate;
    candidate = `${base}-${i}`;
  }
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}
