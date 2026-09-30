import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";

export async function POST() {
  const { supabase, user } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  const { error } = await supabase.auth.resetPasswordForEmail(user.email);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
