import { NextResponse } from "next/server";
import { getAuthContext, canEditRole } from "@/lib/auth";

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
