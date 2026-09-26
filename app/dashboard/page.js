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
      <h1 className="page-title">Inicio</h1>
      <p className="page-subtitle mb-6">Un vistazo rápido a tus formularios y respuestas.</p>

      <div className="bg-navy rounded-2xl p-7 mb-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/[0.04]" />
        <div className="absolute right-16 bottom-0 w-24 h-24 rounded-full border border-white/10" />
        <p className="relative text-[#B9C6DC] text-[12.5px] mb-1.5">Respuestas recibidas en total</p>
        <div className="relative font-display text-white text-[46px] font-semibold leading-none mb-5">
          {totalResponses || 0}
        </div>
        <div className="relative flex gap-6">
          <div>
            <div className="text-white text-[19px] font-display font-semibold">{all.length}</div>
            <div className="text-[#8FA0BE] text-[11.5px]">Formularios totales</div>
          </div>
          <div>
            <div className="text-mint text-[19px] font-display font-semibold">{activos}</div>
            <div className="text-[#8FA0BE] text-[11.5px]">Activos</div>
          </div>
          <div>
            <div className="text-warn text-[19px] font-display font-semibold">{borrador}</div>
            <div className="text-[#8FA0BE] text-[11.5px]">En borrador</div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-[14.5px] text-navy font-semibold">Formularios creados recientemente</h3>
          <Link href="/dashboard/forms" className="text-[12px] text-coral2 font-medium">
            Ver todos
          </Link>
        </div>
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
            className="flex items-center gap-3 py-3 border-b border-[#F2EFE9] last:border-none text-[13.5px] hover:bg-[#FCFBF8] -mx-2 px-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-navylt text-navy flex items-center justify-center font-display font-semibold text-[12.5px] shrink-0">
              {(f.title || "?").slice(0, 1).toUpperCase()}
            </div>
            <span className="flex-1 min-w-0 truncate">{f.title}</span>
            <span className={`badge ${f.status}`}>{f.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
