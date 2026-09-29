"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ROLE_LABEL = { admin: "Administrador", editor: "Editor", lectura: "Solo lectura" };

function Icon({ name }) {
  const c = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "home":
      return (
        <svg {...c}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 10v9h13v-9" />
        </svg>
      );
    case "forms":
      return (
        <svg {...c}>
          <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "plus":
      return (
        <svg {...c}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 8.5v7M8.5 12h7" />
        </svg>
      );
    case "trash":
      return (
        <svg {...c}>
          <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" />
        </svg>
      );
    case "users":
      return (
        <svg {...c}>
          <circle cx="9" cy="8.5" r="3.2" />
          <path d="M3.5 19c.6-3.2 2.7-5 5.5-5s4.9 1.8 5.5 5" />
          <path d="M16 5.5a3 3 0 0 1 0 6M17.5 14.3c1.7.5 2.7 2 3 4.7" />
        </svg>
      );
    default:
      return null;
  }
}

export default function TopNav({ email, role }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const initials = (email || "?").slice(0, 2).toUpperCase();
  const canEdit = role === "admin" || role === "editor";

  const links = [
    { href: "/dashboard", label: "Inicio", icon: "home", active: pathname === "/dashboard" },
    {
      href: "/dashboard/forms",
      label: "Formularios",
      icon: "forms",
      active: pathname.startsWith("/dashboard/forms") && !pathname.startsWith("/dashboard/forms/new"),
    },
    canEdit && {
      href: "/dashboard/forms/new",
      label: "Crear formulario",
      icon: "plus",
      active: pathname.startsWith("/dashboard/forms/new"),
    },
    role === "admin" && {
      href: "/dashboard/usuarios",
      label: "Usuarios",
      icon: "users",
      active: pathname.startsWith("/dashboard/usuarios"),
    },
  ].filter(Boolean);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-navy text-[#CFDAEA] shadow-[0_2px_10px_rgba(18,41,77,0.18)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[60px] flex items-center gap-3 sm:gap-6">
        <Link href="/dashboard" className="brand text-white text-[17px] font-bold flex items-center gap-2.5 shrink-0">
          <Image src="/logo-white.png" alt="Formly" width={24} height={31} priority />
          <span className="hidden sm:inline">Formly</span>
        </Link>

        <nav className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13.5px] whitespace-nowrap transition-colors ${
                l.active
                  ? "bg-coral text-white font-semibold"
                  : "text-[#B9C6DC] hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <Icon name={l.icon} />
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/cuenta"
            title="Mi cuenta"
            className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 hover:bg-white/[0.07] transition-colors"
          >
            <span className="w-8 h-8 rounded-full bg-white/10 text-white text-[11px] font-semibold flex items-center justify-center">
              {initials}
            </span>
            <span className="hidden lg:block leading-tight max-w-[190px]">
              <span className="block text-[12px] text-white truncate">{email}</span>
              <span className="block text-[10.5px] text-[#8FA0BE]">{ROLE_LABEL[role] || role}</span>
            </span>
          </Link>
          <button
            onClick={logout}
            className="text-[12.5px] text-[#8FA0BE] hover:text-white transition-colors whitespace-nowrap"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
