import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request, { params }) {
  const supabase = createClient();
  const { data: form, error: formErr } = await supabase
    .from("forms")
    .select("id, status")
    .eq("slug", params.slug)
    .eq("status", "activo")
    .maybeSingle();

  if (formErr || !form) {
    return NextResponse.json({ error: "Este formulario ya no está disponible." }, { status: 404 });
  }

  const { data } = await request.json();
  const { error } = await supabase.from("form_responses").insert({ form_id: form.id, data: data || {} });
  if (error) return NextResponse.json({ error: "No se pudo enviar el formulario. Intenta de nuevo." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
