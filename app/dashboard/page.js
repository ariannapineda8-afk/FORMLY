import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardHome() {
  const supabase = createClient();

  const { data: forms } = await supabase
    .from("forms")
    .select("id, title, status, created_at")
    .order("created_at", { ascending: false });

  const all = forms || [];
  const recent = all.slice(0, 5);

  return (
    <div>
      <h1 className="page-title">Inicio</h1>
      <p className="page-subtitle mb-6">Un vistazo rápido a tus formularios.</p>

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
