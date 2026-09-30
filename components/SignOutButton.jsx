"use client";

import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function SignOutButton({ className = "" }) {
  const router = useRouter();

  async function logout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className={"btn btn-navy mt-5 " + className}
    >
      Cerrar sesión
    </button>
  );
}
