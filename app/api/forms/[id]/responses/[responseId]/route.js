import { NextResponse } from "next/server";
import { getAuthContext, canEditRole } from "@/lib/auth";

export async function DELETE(request, { params }) {
  const { supabase, user, role } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (!canEditRole(role)) {
    return NextResponse.json({ error: "Tu rol es de solo lectura y no puede eliminar respuestas." }, { status: 403 });
  }
  const { error } = await supabase
    .from("form_responses")
    .delete()
    .eq("id", params.responseId)
    .eq("form_id", params.id);
  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
  return NextResponse.json({ ok: true });
}
