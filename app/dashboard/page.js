import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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

  return (
    <div>
      <h1 className="text-[21px] text-navy mb-5">Inicio</h1>

      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard num={all.length} label="Total de formularios" />
        <StatCard num={activos} label="Formularios activos" />
        <StatCard num={borrador} label="En borrador" />
        <StatCard num={totalResponses || 0} label="Total de respuestas" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-[14.5px] text-navy mb-3">Formularios creados recientemente</h3>
        {recent.length === 0 && (
          <p className="text-gray-500 text-center py-10">Aún no has creado formularios.</p>
        )}
        {recent.map((f) => (
          <Link
            key={f.id}
            href={`/dashboard/forms/${f.id}/edit`}
            className="flex justify-between py-2.5 border-b border-gray-100 last:border-none text-[13px] hover:text-blue"
          >
            <span>{f.title}</span>
            <span className={`badge ${f.status}`}>{f.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ num, label }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4.5">
      <div className="text-[26px] font-bold text-navy font-display">{num}</div>
      <div className="text-[12px] text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
