import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";

export async function GET(request, { params }) {
  const { supabase, user } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { data: form, error: formErr } = await supabase.from("forms").select("*").eq("id", params.id).single();
  if (formErr) return NextResponse.json({ error: formErr.message, code: formErr.code }, { status: 400 });

  const { data: responses, error: respErr } = await supabase
    .from("form_responses")
    .select("*")
    .eq("form_id", params.id)
    .order("submitted_at", { ascending: false });
  if (respErr) return NextResponse.json({ error: respErr.message, code: respErr.code }, { status: 400 });

  return NextResponse.json({ form, responses: responses || [] });
}
