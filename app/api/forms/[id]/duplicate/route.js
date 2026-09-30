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

export async function POST(request, { params }) {
  const { supabase, user, role } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (!canEditRole(role)) {
    return NextResponse.json({ error: "Tu rol es de solo lectura y no puede duplicar formularios." }, { status: 403 });
  }
  const { data: original, error: readErr } = await supabase
    .from("forms")
    .select("*")
    .eq("id", params.id)
    .single();
  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 400 });

  const { id, created_at, updated_at, slug, ...rest } = original;
  const { data, error } = await supabase
    .from("forms")
    .insert({
      ...rest,
      title: original.title + " (copia)",
      slug: slugify(original.title),
      status: "borrador",
      owner_email: user.email,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
  return NextResponse.json({ form: data });
}
