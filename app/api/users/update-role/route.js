import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  const { user, role } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (role !== "admin") {
    return NextResponse.json({ error: "Solo un administrador puede cambiar roles." }, { status: 403 });
  }
  const { email, role: newRole } = await request.json();
  if (!email) return NextResponse.json({ error: "Falta el correo." }, { status: 400 });
  if (!["admin", "editor", "lectura"].includes(newRole)) {
    return NextResponse.json({ error: "Rol no válido." }, { status: 400 });
  }
  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json({ error: e.message, code: e.code }, { status: 500 });
  }
  const { error } = await admin.from("allowed_users").update({ role: newRole }).eq("email", email);
  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
  return NextResponse.json({ ok: true });
}
