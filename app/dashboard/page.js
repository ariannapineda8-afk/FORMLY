import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STAT_STYLES = [
  { accent: "text-coral2", dot: "bg-coral" },
  { accent: "text-mint", dot: "bg-mint" },
  { accent: "text-warn", dot: "bg-warn" },
  { accent: "text-navy", dot: "bg-navy" },
];

export default async function DashboardHome() {
  const supabase = createClient();

  const { data: forms } = await supabase
    .from("forms")
    .select("id, title, status, created_at")
    .order("created_at", { ascending: false });

  const { count: totalResponses } = await supabase
    .from("form_responses")
    .select("id", { count: "exact", head: true });

  const all = forms || [];
  const activos = all.filter((f) => f.status === "activo").length;
  const borrador = all.filter((f) => f.status === "borrador").length;
  const recent = all.slice(0, 5);

  const stats = [
    { num: all.length, label: "Total de formularios" },
    { num: activos, label: "Formularios activos" },
    { num: borrador, label: "En borrador" },
    { num: totalResponses || 0, label: "Total de respuestas" },
  ];

  return (
    <div>
      <h1 className="page-title">Inicio</h1>
      <p className="page-subtitle mb-6">Un vistazo rápido a tus formularios y respuestas.</p>

      <div className="grid grid-cols-4 gap-3.5 mb-6">
        {stats.map((s, i) => (
          <div key={s.label} className="card p-4.5">
            <div className={`w-2 h-2 rounded-full mb-3 ${STAT_STYLES[i].dot}`} />
            <div className={`text-[28px] font-semibold font-display ${STAT_STYLES[i].accent}`}>{s.num}</div>
            <div className="text-[12px] text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h3 className="text-[14.5px] text-navy font-semibold mb-3.5">Formularios creados recientemente</h3>
        {recent.length === 0 && (
          <div className="empty-state">
            <div className="dot">＋</div>
            <p className="text-gray-500 text-[13px]">
              Aún no has creado formularios.{" "}
              <Link href="/dashboard/forms/new" className="text-coral2 font-medium">
                Crea el primero
              </Link>
              .
            </p>
          </div>
        )}
        {recent.map((f) => (
          <Link
            key={f.id}
            href={`/dashboard/forms/${f.id}/edit`}
            className="flex justify-between items-center py-3 border-b border-[#F2EFE9] last:border-none text-[13.5px] hover:text-coral2 transition-colors"
          >
            <span>{f.title}</span>
            <span className={`badge ${f.status}`}>{f.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
