"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useRole } from "@/components/RoleContext";

const ROLE_LABEL = { admin: "Administrador", editor: "Editor", lectura: "Solo lectura" };

export default function AccountPage() {
  const router = useRouter();
  const { role, email } = useRole();
  const [sending, setSending] = useState(false);

  async function logout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    router.push("/login");
    router.refresh();
  }

  async function resetPassword() {
    setSending(true);
    try {
      await apiFetch("/api/auth/reset-password", { method: "POST" });
      alert("Te enviamos un correo con un enlace para elegir una nueva contraseña.");
    } catch (err) {
      alert("No se pudo enviar el correo: " + err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Mi cuenta</h1>
      <p className="page-subtitle mb-6">Información de la sesión con la que entraste.</p>

      <div className="card p-6 max-w-md">
        <div className="w-12 h-12 rounded-full bg-navylt text-navy flex items-center justify-center font-display font-semibold text-[16px] mb-4">
          {(email || "?").slice(0, 2).toUpperCase()}
        </div>
        <p className="text-[14px] text-navy font-semibold">{email}</p>
        <p className="text-[12.5px] text-gray-500 mb-5">{ROLE_LABEL[role] || role}</p>

        <button onClick={resetPassword} disabled={sending} className="btn btn-outline w-full mb-2.5">
          {sending ? "Enviando..." : "Cambiar mi contraseña"}
        </button>
        <button onClick={logout} className="btn btn-navy w-full">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
