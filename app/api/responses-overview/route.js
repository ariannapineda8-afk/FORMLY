import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";

export async function GET() {
  const { supabase, user } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { data: formList, error: formErr } = await supabase
    .from("forms")
    .select("id, title, status, slug")
    .order("title");
  if (formErr) return NextResponse.json({ error: formErr.message, code: formErr.code }, { status: 400 });

  const { data: responseRows, error: respErr } = await supabase
    .from("form_responses")
    .select("form_id, submitted_at");
  if (respErr) return NextResponse.json({ error: respErr.message, code: respErr.code }, { status: 400 });

  const counts = {};
  const latest = {};
  const times = {};
  (responseRows || []).forEach((r) => {
    counts[r.form_id] = (counts[r.form_id] || 0) + 1;
    (times[r.form_id] = times[r.form_id] || []).push(r.submitted_at);
    if (!latest[r.form_id] || r.submitted_at > latest[r.form_id]) latest[r.form_id] = r.submitted_at;
  });

  const forms = (formList || [])
    .map((f) => ({ ...f, count: counts[f.id] || 0, latest: latest[f.id] || null,
      // Fechas de las últimas respuestas (para marcar cuáles son nuevas en cada navegador).
      times: (times[f.id] || []).sort().reverse().slice(0, 200),
    }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ forms });
}
