import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Falta el correo o la contraseña." }, { status: 400 });
  }
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim().toLowerCase(),
    password: String(password),
  });
  if (error) {
    const code = error.code || "";
    let message = "Correo o contraseña incorrectos. Recuerda que la contraseña distingue mayúsculas y minúsculas.";
    if (error.status === 429 || code === "over_request_rate_limit") {
      message = "Demasiados intentos desde esta red. Espera unos minutos e inténtalo de nuevo.";
    } else if (code === "email_not_confirmed") {
      message = "Este correo aún no está confirmado en el sistema.";
    } else if (code !== "invalid_credentials") {
      message = "No se pudo iniciar sesión: " + error.message;
    }
    return NextResponse.json({ error: message, code }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
