"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const DAY = 24 * 60 * 60 * 1000;
const SETUP_SQL = "alter table public.forms add column if not exists deleted_at timestamptz;";

export default function TrashPage() {
  const supabase = createClient();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const cutoff = new Date(Date.now() - 30 * DAY).toISOString();
    await supabase.from("forms").delete().lt("deleted_at", cutoff);

    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });
    if (error) {
      setNeedsSetup(true);
      setItems([]);
    } else {
      setNeedsSetup(false);
      setItems(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function restore(f) {
    const { error } = await supabase
      .from("forms")
      .update({ deleted_at: null, status: "inactivo", updated_at: new Date().toISOString() })
      .eq("id", f.id);
    if (error) return alert("No se pudo restaurar: " + error.message);
    load();
  }

  async function destroy(f) {
    if (!confirm(`¿Eliminar "${f.title}" para siempre?\nSe borrarán también sus respuestas y no se puede deshacer.`)) return;
    const { error } = await supabase.from("forms").delete().eq("id", f.id);
    if (error) return alert("No se pudo eliminar: " + error.message);
    load();
  }

  async function emptyAll() {
    if (!confirm("¿Vaciar la papelera? Se borrarán para siempre todos estos formularios y sus respuestas.")) return;
    const ids = items.map((i) => i.id);
    const { error } = await supabase.from("forms").delete().in("id", ids);
    if (error) return alert("No se pudo vaciar: " + error.message);
    load();
  }

  function daysLeft(f) {
    const passed = Math.floor((Date.now() - new Date(f.deleted_at).getTime()) / DAY);
    return Math.max(0, 30 - passed);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5 gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Papelera</h1>
          <p className="page-subtitle">
            Los formularios eliminados se guardan aquí 30 días y luego se borran automáticamente.
          </p>
        </div>
        {items.length > 0 && (
          <button onClick={emptyAll} className="btn btn-outline">
            Vaciar papelera
          </button>
        )}
      </div>

      {loading && <p className="text-gray-500">Cargando...</p>}

      {!loading && needsSetup && (
        <div className="card p-6 max-w-xl">
          <h3 className="text-navy font-semibold mb-1.5">Falta un paso para activar la papelera</h3>
          <p className="text-gray-500 text-[13px] mb-3">
            Entra a Supabase → SQL Editor → New query, pega esta línea y presiona Run. Solo se hace una vez.
          </p>
          <code className="block bg-[#F4F1EA] rounded-lg px-3 py-2.5 text-[12px] text-navy break-all">
            {SETUP_SQL}
          </code>
        </div>
      )}

      {!loading && !needsSetup && items.length === 0 && (
        <div className="card empty-state">
          <div className="dot">✓</div>
          <p className="text-gray-500 text-[13px]">La papelera está vacía.</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {items.map((f) => {
            const left = daysLeft(f);
            return (
              <div key={f.id} className="card p-5 flex flex-col">
                <h3 className="text-[15px] font-semibold text-navy mb-1 leading-snug">{f.title}</h3>
                <p className="text-[12px] text-gray-500 mb-1">
                  Eliminado el {new Date(f.deleted_at).toLocaleDateString()}
                </p>
                <p className={`text-[12px] mb-4 font-medium ${left <= 5 ? "text-[#B23A3A]" : "text-warn"}`}>
                  Se borra definitivamente en {left} {left === 1 ? "día" : "días"}
                </p>
                <div className="flex gap-1.5 mt-auto pt-3 border-t border-[#F2EFE9]">
                  <button onClick={() => restore(f)} className="btn-sm">Restaurar</button>
                  <button onClick={() => destroy(f)} className="btn-sm">Eliminar para siempre</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
