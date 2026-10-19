import { NextResponse } from "next/server";
import { getAuthContext, canEditRole } from "@/lib/auth";
import { uniqueSlug } from "@/lib/slug";

export async function GET(request, { params }) {
  const { supabase, user } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  const { data, error } = await supabase.from("forms").select("*").eq("id", params.id).single();
  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
  return NextResponse.json({ form: data });
}

export async function PATCH(request, { params }) {
  const { supabase, user, role } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (!canEditRole(role)) {
    return NextResponse.json({ error: "Tu rol es de solo lectura y no puede editar formularios." }, { status: 403 });
  }
  const payload = await request.json();
  const allowed = [
    "title",
    "description",
    "button_text",
    "thanks_message",
    "color",
    "status",
    "fields",
  ];
  const update = { updated_at: new Date().toISOString() };
  for (const k of allowed) if (k in payload) update[k] = payload[k];

  // Mientras el formulario sea un borrador, su enlace sigue al título: si lo renombras
  // (por ejemplo, una copia que conviertes en otra vacante) el enlace se actualiza.
  // Una vez publicado, el enlace ya no cambia para no romper lo que se haya compartido.
  if (typeof payload.title === "string" && payload.title.trim()) {
    const { data: current } = await supabase
      .from("forms")
      .select("title, status")
      .eq("id", params.id)
      .single();
    if (current && current.status === "borrador" && current.title !== payload.title) {
      update.slug = await uniqueSlug(supabase, payload.title, params.id);
    }
  }

  const { data, error } = await supabase.from("forms").update(update).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
  return NextResponse.json({ form: data });
}

export async function DELETE(request, { params }) {
  const { supabase, user, role } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (!canEditRole(role)) {
    return NextResponse.json({ error: "Tu rol es de solo lectura y no puede eliminar formularios." }, { status: 403 });
  }
  const { error } = await supabase.from("forms").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
  return NextResponse.json({ ok: true });
}
