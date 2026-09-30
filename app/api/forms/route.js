import { NextResponse } from "next/server";
import { getAuthContext, canEditRole } from "@/lib/auth";

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

export async function GET() {
  const { supabase, user } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  const { data, error } = await supabase.from("forms").select("*").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
  return NextResponse.json({ forms: data || [] });
}

export async function POST(request) {
  const { supabase, user, role } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (!canEditRole(role)) {
    return NextResponse.json({ error: "Tu rol es de solo lectura y no puede crear formularios." }, { status: 403 });
  }
  const payload = await request.json();
  if (!payload.title || !payload.title.trim()) {
    return NextResponse.json({ error: "El formulario necesita un título." }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("forms")
    .insert({
      title: payload.title,
      description: payload.description || "",
      button_text: payload.button_text || "Enviar",
      thanks_message: payload.thanks_message || "",
      color: payload.color || "#12294D",
      status: payload.status || "borrador",
      fields: payload.fields || [],
      slug: slugify(payload.title),
      owner_email: user.email,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
  return NextResponse.json({ form: data });
}
