import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { avatarColors } from "@/lib/colors";

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
        {[
          { href: "/dashboard/forms/new", title: "Crear formulario", sub: "Empieza uno nuevo o usa una plantilla", g: "from-[#4A82BD] to-[#2C5680]", icon: "M12 5v14M5 12h14" },
          { href: "/dashboard/forms", title: "Mis formularios", sub: `${all.length} ${all.length === 1 ? "formulario" : "formularios"} creados`, g: "from-[#2FA88A] to-[#1B7C8C]", icon: "M5 4.5h14v15H5zM8.5 9h7M8.5 12.5h7M8.5 16h4" },
          { href: "/dashboard/respuestas", title: "Respuestas", sub: "Revisa lo que han completado", g: "from-[#8B6BC8] to-[#5B4496]", icon: "M4 5.5h16v13H4zM4.5 6.5 12 13l7.5-6.5" },
        ].map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`group rounded-2xl p-5 text-white bg-gradient-to-br ${t.g} shadow-[0_6px_18px_rgba(18,41,77,0.18)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(18,41,77,0.25)] transition-all relative overflow-hidden`}
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d={t.icon} />
              </svg>
            </div>
            <p className="text-[15px] font-semibold relative">{t.title}</p>
            <p className="text-[12px] text-white/80 relative">{t.sub}</p>
          </Link>
        ))}
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
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-semibold text-[12.5px] shrink-0"
              style={avatarColors(f.title)}
            >
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
