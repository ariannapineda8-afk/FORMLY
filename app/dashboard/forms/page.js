"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function FormsListPage() {
  const supabase = createClient();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("forms")
      .select("id, title, slug, status, updated_at")
      .order("updated_at", { ascending: false });
    setForms(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function duplicate(form) {
    const { data: full } = await supabase.from("forms").select("*").eq("id", form.id).single();
    if (!full) return;
    const slug = full.slug + "-copia-" + Math.random().toString(36).slice(2, 6);
    const { id, created_at, updated_at, ...rest } = full;
    await supabase.from("forms").insert({
      ...rest,
      title: full.title + " (copia)",
      slug,
      status: "borrador",
    });
    load();
  }

  async function toggleStatus(form) {
    const next = form.status === "activo" ? "inactivo" : "activo";
    await supabase.from("forms").update({ status: next, updated_at: new Date() }).eq("id", form.id);
    load();
  }

  async function remove(form) {
    if (!confirm("¿Eliminar este formulario? Esta acción no se puede deshacer.")) return;
    await supabase.from("forms").delete().eq("id", form.id);
    load();
  }

  function copyLink(slug) {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard?.writeText(url);
    alert("Enlace copiado:\n" + url);
  }

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

      {loading && <p className="text-gray-500">Cargando...</p>}
      {!loading && forms.length === 0 && (
        <div className="card empty-state">
          <div className="dot">＋</div>
          <p className="text-gray-500 text-[13px]">
            No hay formularios todavía. Crea el primero con el botón de arriba.
          </p>
        </div>
      )}

      {forms.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Actualizado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((f) => (
                  <tr key={f.id}>
                    <td className="font-medium">{f.title}</td>
                    <td>
                      <span className={`badge ${f.status}`}>{f.status}</span>
                    </td>
                    <td className="text-gray-500">{new Date(f.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-1.5 flex-wrap">
                        <Link href={`/dashboard/forms/${f.id}/edit`} className="btn-sm">Editar</Link>
                        <Link href={`/dashboard/forms/${f.id}/responses`} className="btn-sm">Respuestas</Link>
                        <button onClick={() => duplicate(f)} className="btn-sm">Duplicar</button>
                        <button onClick={() => toggleStatus(f)} className="btn-sm">
                          {f.status === "activo" ? "Desactivar" : "Activar"}
                        </button>
                        <button onClick={() => copyLink(f.slug)} className="btn-sm">Copiar enlace</button>
                        <button onClick={() => remove(f)} className="btn-sm">Eliminar</button>
                      </div>
                    </td>
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
