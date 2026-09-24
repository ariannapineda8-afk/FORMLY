"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResponsesPage({ params }) {
  const supabase = createClient();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: f } = await supabase.from("forms").select("*").eq("id", params.id).single();
      const { data: r } = await supabase
        .from("form_responses")
        .select("*")
        .eq("form_id", params.id)
        .order("submitted_at", { ascending: false });
      setForm(f);
      setResponses(r || []);
      setLoading(false);
    })();
  }, [params.id, supabase]);

  const cols = useMemo(
    () => (form?.fields || []).filter((f) => f.type !== "seccion" && f.type !== "info"),
    [form]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return responses;
    const q = search.toLowerCase();
    return responses.filter((r) => JSON.stringify(r.data).toLowerCase().includes(q));
  }, [responses, search]);

  function exportCsv() {
    const header = ["Fecha", ...cols.map((c) => c.label || c.type)];
    const lines = [header.join(",")].concat(
      filtered.map((r) =>
        [
          new Date(r.submitted_at).toLocaleString(),
          ...cols.map((c) => String(r.data[c.id] ?? "").replace(/,/g, ";")),
        ].join(",")
      )
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${form?.title || "respuestas"}.csv`;
    a.click();
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div>
      <h1 className="text-[21px] text-navy mb-1">Respuestas</h1>
      <p className="text-gray-500 text-[13px] mb-4">{form?.title}</p>

      <div className="flex gap-2.5 mb-3.5 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar en respuestas..."
          className="flex-1 min-w-[180px] px-2.5 py-2 border border-gray-200 rounded-lg"
        />
        <button onClick={exportCsv} className="px-4 py-2 border border-gray-200 rounded-lg text-[13px] bg-white">
          Exportar CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-16">
          Este formulario aún no tiene respuestas registradas.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white border border-gray-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[11.5px] uppercase">
                <th className="text-left px-3.5 py-2.5">Fecha</th>
                {cols.map((c) => (
                  <th key={c.id} className="text-left px-3.5 py-2.5 whitespace-nowrap">
                    {c.label || c.type}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 last:border-none text-[13px]">
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    {new Date(r.submitted_at).toLocaleString()}
                  </td>
                  {cols.map((c) => (
                    <td key={c.id} className="px-3.5 py-2.5">
                      {c.type === "archivo" || c.type === "firma" ? (
                        r.data[c.id] ? (
                          <a href={r.data[c.id]} target="_blank" className="text-blue underline">
                            Ver archivo
                          </a>
                        ) : (
                          "—"
                        )
                      ) : (
                        String(r.data[c.id] ?? "—")
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
