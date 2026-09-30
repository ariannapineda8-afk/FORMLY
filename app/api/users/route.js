import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";

export async function GET() {
  const { supabase, user } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  const { data, error } = await supabase.from("allowed_users").select("*").order("email");
  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
  return NextResponse.json({ users: data || [] });
}

export async function POST(request) {
  const { supabase, user, role } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  if (role !== "admin") {
    return NextResponse.json({ error: "Solo un administrador puede dar acceso a nuevos usuarios." }, { status: 403 });
  }
  const { email, role: newRole } = await request.json();
  if (!email || !email.trim()) return NextResponse.json({ error: "Falta el correo." }, { status: 400 });
  const { error } = await supabase
    .from("allowed_users")
    .insert({ email: email.trim().toLowerCase(), role: newRole || "editor" });
  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
  return NextResponse.json({ ok: true });
}
