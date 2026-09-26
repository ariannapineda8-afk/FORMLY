"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: "home" },
  { href: "/dashboard/forms", label: "Formularios", icon: "forms" },
  { href: "/dashboard/forms/new", label: "Crear formulario", icon: "plus" },
];

function Icon({ name }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10v9h13v-9" />
      </svg>
    );
  }
  if (name === "forms") {
    return (
      <svg {...common}>
        <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    );
  }
  if (name === "plus") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 8.5v7M8.5 12h7" />
      </svg>
    );
  }
  return null;
}

export default function Sidebar({ email }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const initials = (email || "?").slice(0, 2).toUpperCase();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="w-[220px] shrink-0 bg-navy text-[#CFDAEA] flex flex-col py-5 min-h-screen">
      <div className="brand text-white text-[16.5px] font-bold px-5 pb-6 flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-coral flex items-center justify-center text-[11px] font-bold text-white">
          F
        </span>
        Formly
      </div>

      <div className="px-3 flex flex-col gap-1">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] transition-colors ${
                active
                  ? "bg-coral text-white font-semibold"
                  : "text-[#B9C6DC] hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="px-3 mt-1 flex flex-col gap-1">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] opacity-40 cursor-not-allowed">
          Usuarios
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] opacity-40 cursor-not-allowed">
          Configuración
        </div>
      </div>

      <div className="mt-auto px-3.5 pt-4 mx-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 mb-3 mt-3.5">
          <div className="w-8 h-8 rounded-full bg-white/10 text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0 text-[12px] text-[#B9C6DC] truncate">{email}</div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-[12.5px] text-[#8FA0BE] hover:text-white transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
