"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { avatarColors } from "@/lib/colors";
import { useNewResponses, NewBadge } from "@/lib/newResponses";

export default function FormsListPage() {
  const router = useRouter();
  const { byForm } = useNewResponses();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { forms } = await apiFetch("/api/forms");
      setForms(forms || []);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function duplicate(form) {
    try {
      await apiFetch(`/api/forms/${form.id}/duplicate`, { method: "POST" });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function toggleStatus(form) {
    const next = form.status === "activo" ? "inactivo" : "activo";
    try {
      await apiFetch(`/api/forms/${form.id}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function remove(form) {
    if (!confirm("¿Eliminar este formulario? Esta acción no se puede deshacer.")) return;
    try {
      await apiFetch(`/api/forms/${form.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  function copyLink(slug) {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard?.writeText(url);
    alert("Enlace copiado:\n" + url);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return forms;
    const q = search.trim().toLowerCase();
    return forms.filter((f) => (f.title || "").toLowerCase().includes(q));
  }, [forms, search]);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="page-title">Formularios</h1>
          <p className="page-subtitle">Crea, comparte y administra todos tus formularios.</p>
        </div>
        <Link href="/dashboard/forms/new" className="btn btn-primary">
          + Crear formulario
        </Link>
      </div>

      {!loading && forms.length > 0 && (
        <div className="relative mb-4 max-w-[340px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar formulario por nombre..."
            className="input pl-9"
          />
        </div>
      )}

      {loading && <p className="text-gray-500">Cargando...</p>}
      {!loading && forms.length === 0 && (
        <div className="card empty-state">
          <div className="dot">＋</div>
          <p className="text-gray-500 text-[13px]">
            No hay formularios todavía. Crea el primero con el botón de arriba.
          </p>
        </div>
      )}
      {!loading && forms.length > 0 && filtered.length === 0 && (
        <div className="card empty-state">
          <div className="dot">🔎</div>
          <p className="text-gray-500 text-[13px]">
            No encontramos formularios que coincidan con "{search}".
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="card overflow-hidden divide-y divide-[#F2EFE9]">
          {filtered.map((f) => (
            <div
              key={f.id}
              role="link"
              tabIndex={0}
              onClick={() => router.push(`/dashboard/forms/${f.id}/edit`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") router.push(`/dashboard/forms/${f.id}/edit`);
              }}
              title="Haz clic para abrir y editar este formulario"
              className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-[#F3F8FD] hover:shadow-[inset_4px_0_0_#3B6FA6] transition-all flex-wrap lg:flex-nowrap"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-semibold text-[15px] shrink-0"
                style={avatarColors(f.title)}
              >
                {(f.title || "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 basis-[220px]">
                <h3 className="text-[14.5px] font-semibold text-navy leading-snug truncate">{f.title}</h3>
                <p className="text-[12px] text-gray-500 truncate">
                  /f/{f.slug} · actualizado {new Date(f.updated_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`badge ${f.status} shrink-0`}>{f.status}</span>
              <div className="flex gap-1.5 flex-wrap shrink-0" onClick={(e) => e.stopPropagation()}>
                <Link href={`/dashboard/forms/${f.id}/edit`} className="btn-sm">Editar</Link>
                <Link href={`/dashboard/forms/${f.id}/responses`} className="btn-sm inline-flex items-center gap-1.5">
                  Respuestas <NewBadge n={byForm[f.id]} />
                </Link>
                <button onClick={() => copyLink(f.slug)} className="btn-sm">Copiar enlace</button>
                <button onClick={() => duplicate(f)} className="btn-sm">Duplicar</button>
                <button onClick={() => toggleStatus(f)} className="btn-sm">
                  {f.status === "activo" ? "Desactivar" : "Activar"}
                </button>
                <button onClick={() => remove(f)} className="btn-sm !text-[#B23A3A]">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
