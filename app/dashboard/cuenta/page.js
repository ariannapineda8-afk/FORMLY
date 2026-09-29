"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/components/RoleContext";

const ROLE_LABEL = { admin: "Administrador", editor: "Editor", lectura: "Solo lectura" };

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const { role, email } = useRole();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function resetPassword() {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return alert("No se pudo enviar el correo: " + error.message);
    alert("Te enviamos un correo con un enlace para elegir una nueva contraseña.");
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

        <button onClick={resetPassword} className="btn btn-outline w-full mb-2.5">
          Cambiar mi contraseña
        </button>
        <button onClick={logout} className="btn btn-navy w-full">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
