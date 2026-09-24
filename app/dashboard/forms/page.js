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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[21px] text-navy">Formularios</h1>
        <Link href="/dashboard/forms/new" className="px-4 py-2 bg-navy text-white rounded-lg text-[13px] font-medium hover:bg-navy2">
          + Crear formulario
        </Link>
      </div>

      {loading && <p className="text-gray-500">Cargando...</p>}
      {!loading && forms.length === 0 && (
        <p className="text-gray-500 text-center py-16">
          No hay formularios todavía. Crea el primero con el botón de arriba.
        </p>
      )}

      {forms.length > 0 && (
        <table className="w-full border-collapse bg-white border border-gray-200 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-[11.5px] uppercase tracking-wide">
              <th className="text-left px-3.5 py-2.5">Nombre</th>
              <th className="text-left px-3.5 py-2.5">Estado</th>
              <th className="text-left px-3.5 py-2.5">Actualizado</th>
              <th className="text-left px-3.5 py-2.5">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((f) => (
              <tr key={f.id} className="border-b border-gray-100 last:border-none text-[13px]">
                <td className="px-3.5 py-2.5 font-medium">{f.title}</td>
                <td className="px-3.5 py-2.5">
                  <span className={`badge ${f.status}`}>{f.status}</span>
                </td>
                <td className="px-3.5 py-2.5">{new Date(f.updated_at).toLocaleDateString()}</td>
                <td className="px-3.5 py-2.5">
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
      )}

      <style jsx global>{`
        .btn-sm {
          border: 1px solid #e2e6ec;
          background: #fff;
          border-radius: 6px;
          padding: 4px 9px;
          font-size: 11.5px;
          color: #12294d;
        }
        .btn-sm:hover {
          background: #eaf1f8;
        }
      `}</style>
    </div>
  );
}
