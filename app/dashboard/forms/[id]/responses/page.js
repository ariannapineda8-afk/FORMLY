"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ResponsePreview from "@/components/ResponsePreview";
import { downloadResponsePdf } from "@/lib/pdf";

export default function ResponsesPage({ params }) {
  const supabase = createClient();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewResponse, setPreviewResponse] = useState(null);

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
      <h1 className="page-title">Respuestas</h1>
      <p className="page-subtitle mb-5">{form?.title}</p>

      <div className="flex gap-2.5 mb-4 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar en respuestas..."
          className="input flex-1 min-w-[180px]"
        />
        <button onClick={exportCsv} className="btn btn-outline">
          Exportar CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="dot">◇</div>
          <p className="text-gray-500 text-[13px]">
            Este formulario aún no tiene respuestas registradas.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="whitespace-nowrap">Fecha</th>
                  {cols.map((c) => (
                    <th key={c.id} className="whitespace-nowrap">
                      {c.label || c.type}
                    </th>
                  ))}
                  <th className="whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap text-gray-500">
                      {new Date(r.submitted_at).toLocaleString()}
                    </td>
                    {cols.map((c) => (
                      <td key={c.id}>
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
                    <td className="whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => setPreviewResponse(r)} className="btn-sm">
                          Ver
                        </button>
                        <button
                          onClick={() => downloadResponsePdf(form, r, form?.fields || [])}
                          className="btn-sm !bg-navy !text-white !border-navy hover:!bg-navy2"
                        >
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ResponsePreview
        form={form}
        response={previewResponse}
        fields={form?.fields || []}
        onClose={() => setPreviewResponse(null)}
      />
    </div>
  );
}
