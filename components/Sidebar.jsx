"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ITEMS = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/dashboard/forms", label: "Formularios" },
  { href: "/dashboard/forms/new", label: "Crear formulario" },
];

export default function Sidebar({ email }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="w-[210px] shrink-0 bg-navy text-[#CFDAEA] flex flex-col py-4.5 min-h-screen">
      <div className="brand text-white text-[16px] font-bold px-5 pb-4.5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#5C9BD8]" />
        Formly
      </div>
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-5 py-2.5 text-[13.5px] border-l-[3px] ${
              active
                ? "bg-white/[0.08] border-[#5C9BD8] text-white font-medium"
                : "border-transparent text-[#B9C6DC] hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <div className="px-5 py-2.5 text-[13.5px] opacity-50">Usuarios</div>
      <div className="px-5 py-2.5 text-[13.5px] opacity-50">Configuración</div>

      <div className="mt-auto px-5 pt-3.5 border-t border-white/10 text-[11.5px] text-[#8FA0BE]">
        <div className="mb-2 truncate">{email}</div>
        <button onClick={logout} className="underline hover:text-white">
          Salir
        </button>
      </div>
    </div>
  );
}
