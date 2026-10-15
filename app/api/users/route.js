import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { createAdminClient, findAuthUserByEmail } from "@/lib/supabase/admin";

const VALID_ROLES = ["admin", "editor", "lectura"];

export async function GET() {
  const { supabase, user } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  const { data, error } = await supabase.from("allowed_users").select("*").order("email");
  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
  return NextResponse.json({ users: data || [] });
}

// Crea (o actualiza) la cuenta de acceso con contraseña y la deja autorizada con su rol.
export async function POST(request) {
  const { user, role } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (role !== "admin") {
    return NextResponse.json({ error: "Solo un administrador puede crear usuarios." }, { status: 403 });
  }

  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const newRole = VALID_ROLES.includes(body.role) ? body.role : "editor";

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

  // 1) Cuenta de acceso (correo + contraseña), ya confirmada para que pueda entrar de inmediato.
  let created = true;
  const { error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr) {
    const exists =
      createErr.code === "email_exists" ||
      createErr.status === 422 ||
      /already|registered|exists/i.test(createErr.message || "");
    if (!exists) {
      return NextResponse.json({ error: "No se pudo crear la cuenta: " + createErr.message }, { status: 400 });
    }
    // Ya existía: le ponemos la contraseña nueva y la dejamos confirmada.
    try {
      const existing = await findAuthUserByEmail(admin, email);
      if (!existing) {
        return NextResponse.json({ error: "El correo ya existe pero no se pudo localizar la cuenta." }, { status: 400 });
      }
      const { error: updErr } = await admin.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
      });
      if (updErr) return NextResponse.json({ error: "No se pudo actualizar la cuenta: " + updErr.message }, { status: 400 });
      created = false;
    } catch (e) {
      return NextResponse.json({ error: "No se pudo actualizar la cuenta: " + e.message }, { status: 400 });
    }
  }

  // 2) Autorización dentro de Formly (lista de usuarios y rol).
  const { error: accessErr } = await admin
    .from("allowed_users")
    .upsert({ email, role: newRole }, { onConflict: "email" });
  if (accessErr) {
    return NextResponse.json({ error: accessErr.message, code: accessErr.code }, { status: 400 });
  }

  return NextResponse.json({ ok: true, created });
}
