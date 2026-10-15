import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { createAdminClient, findAuthUserByEmail } from "@/lib/supabase/admin";

// Un administrador pone una contraseña nueva a un usuario (por ejemplo, si la olvidó).
export async function POST(request) {
  const { user, role } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (role !== "admin") {
    return NextResponse.json({ error: "Solo un administrador puede cambiar contraseñas." }, { status: 403 });
  }

  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email) return NextResponse.json({ error: "Falta el correo." }, { status: 400 });
  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json({ error: e.message, code: e.code }, { status: 500 });
  }

  try {
    const target = await findAuthUserByEmail(admin, email);
    if (!target) {
      return NextResponse.json(
        { error: "Ese correo todavía no tiene cuenta. Créala con el botón \"Crear usuario\"." },
        { status: 404 }
      );
    }
    const { error } = await admin.auth.admin.updateUserById(target.id, { password, email_confirm: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
