"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton({ className = "" }) {
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className={
        "mt-4 px-4 py-2 rounded-md bg-navy text-white text-sm hover:opacity-90 transition " +
        className
      }
    >
      Cerrar sesión
    </button>
  );
}
