"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRole } from "@/components/RoleContext";

const ROLES = [
  { v: "admin", label: "Administrador", hint: "Crea, edita, elimina y administra usuarios." },
  { v: "editor", label: "Editor", hint: "Crea y edita formularios y ve respuestas." },
  { v: "lectura", label: "Solo lectura", hint: "Solo puede ver formularios y respuestas." },
];

export default function UsersPage() {
  const { role: myRole, email: myEmail } = useRole();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("editor");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { users } = await apiFetch("/api/users");
      setNeedsSetup(false);
      setUsers(users || []);
    } catch (err) {
      setNeedsSetup(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addUser(e) {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    if (newPassword.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setAdding(true);
    try {
      const res = await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({ email, role: newRole, password: newPassword }),
      });
      alert(
        (res && res.created === false
          ? `Listo. ${email} ya tenía cuenta: se actualizó su contraseña y su rol.`
          : `Listo. ${email} ya puede entrar a Formly.`) +
          `\n\nCorreo: ${email}\nContraseña: ${newPassword}\n\nCompártesela por un medio seguro.`
      );
      setNewEmail("");
      setNewPassword("");
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function changePassword(u) {
    const password = window.prompt(`Escribe la contraseña nueva para ${u.email} (mínimo 8 caracteres):`);
    if (password === null) return;
    if (password.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    try {
      await apiFetch("/api/users/set-password", {
        method: "POST",
        body: JSON.stringify({ email: u.email, password }),
      });
      alert(`Contraseña actualizada.\n\nCorreo: ${u.email}\nContraseña: ${password}`);
    } catch (err) {
      alert(err.message);
    }
  }

  async function changeRole(u, role) {
    try {
      await apiFetch("/api/users/update-role", { method: "POST", body: JSON.stringify({ email: u.email, role }) });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function removeUser(u) {
    if (u.email.toLowerCase() === myEmail?.toLowerCase()) {
      alert("No puedes quitarte el acceso a ti mismo.");
      return;
    }
    if (!confirm(`¿Quitar el acceso de ${u.email}?`)) return;
    try {
      await apiFetch("/api/users/remove", { method: "POST", body: JSON.stringify({ email: u.email }) });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <h1 className="page-title">Usuarios</h1>
      <p className="page-subtitle mb-6">
        Cada persona entra con su propio correo y contraseña. Desde aquí puedes crear usuarios nuevos y
        cambiar la contraseña de quien la olvide.
      </p>

      {!loading && needsSetup && (
        <div className="card p-6 max-w-xl mb-6">
          <h3 className="text-navy font-semibold mb-1.5">Falta activar los roles</h3>
          <p className="text-gray-500 text-[13px] mb-3">
            Entra a Supabase → SQL Editor → New query, pega esta línea y presiona Run. Se hace una sola vez.
          </p>
          <code className="block bg-[#F4F1EA] rounded-lg px-3 py-2.5 text-[12px] text-navy break-all">
            alter table public.allowed_users add column if not exists role text not null default 'editor';
          </code>
        </div>
      )}

      {myRole === "admin" && (
        <form onSubmit={addUser} className="card p-4.5 mb-5 flex flex-wrap items-end gap-2.5">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[12px] text-gray-500 mb-1">Correo</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="nombre@mardom.com"
              className="input"
            />
          </div>
          <div className="min-w-[200px]">
            <label className="block text-[12px] text-gray-500 mb-1">Contraseña (mín. 8 caracteres)</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Elige una contraseña"
                className="input pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-blue hover:text-navy"
              >
                {showPass ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-gray-500 mb-1">Rol</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="input">
              {ROLES.map((r) => (
                <option key={r.v} value={r.v}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={adding} className="btn btn-primary">
            {adding ? "Creando..." : "+ Crear usuario"}
          </button>
        </form>
      )}

      {loading && <p className="text-gray-500">Cargando...</p>}

      {!loading && users.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Correo</th>
                  <th>Rol</th>
                  {myRole === "admin" && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.email}>
                    <td className="font-medium">{u.email}</td>
                    <td>
                      {myRole === "admin" ? (
                        <select
                          value={u.role || "editor"}
                          onChange={(e) => changeRole(u, e.target.value)}
                          className="input !py-1.5 !w-auto text-[12.5px]"
                        >
                          {ROLES.map((r) => (
                            <option key={r.v} value={r.v}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        ROLES.find((r) => r.v === u.role)?.label || u.role || "Editor"
                      )}
                    </td>
                    {myRole === "admin" && (
                      <td>
                        <div className="flex gap-1.5 flex-wrap">
                          <button onClick={() => changePassword(u)} className="btn-sm">Cambiar contraseña</button>
                          <button onClick={() => removeUser(u)} className="btn-sm">Quitar acceso</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
