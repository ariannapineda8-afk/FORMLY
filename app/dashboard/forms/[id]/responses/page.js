"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import ResponseDrawer from "@/components/ResponseDrawer";
import { useRole } from "@/components/RoleContext";
import { downloadResponsePdf } from "@/lib/pdf";
import FileLinks from "@/components/FileLinks";
import { attachmentFileName } from "@/lib/fileDownload";
import { seenAtFor, markFormSeen } from "@/lib/newResponses";

export default function ResponsesPage({ params }) {
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [seenAt, setSeenAt] = useState(null);
  const { role } = useRole();
  const canEdit = role === "admin" || role === "editor";

  useEffect(() => {
    (async () => {
      setLoading(true);
      setSeenAt(seenAtFor(params.id));
      try {
        const { form, responses } = await apiFetch(`/api/forms/${params.id}/responses`);
        setForm(form);
        setResponses(responses || []);
        markFormSeen(params.id);
      } catch (err) {
        alert(err.message);
      }
      setLoading(false);
    })();
  }, [params.id]);

  const cols = useMemo(
    () => (form?.fields || []).filter((f) => f.type !== "seccion" && f.type !== "info"),
    [form]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return responses;
    const q = search.toLowerCase();
    return responses.filter((r) => JSON.stringify(r.data).toLowerCase().includes(q));
  }, [responses, search]);

  async function deleteResponse(r) {
    if (!confirm("¿Eliminar esta respuesta? No se puede deshacer.")) return;
    try {
      await apiFetch(`/api/forms/${params.id}/responses/${r.id}`, { method: "DELETE" });
      setResponses((prev) => prev.filter((x) => x.id !== r.id));
      setSelectedId((prev) => (prev === r.id ? null : prev));
    } catch (err) {
      alert(err.message);
    }
  }

  const selectedIndex = filtered.findIndex((r) => r.id === selectedId);
  const selected = selectedIndex >= 0 ? filtered[selectedIndex] : null;
  const goPrev = selectedIndex > 0 ? () => setSelectedId(filtered[selectedIndex - 1].id) : null;
  const goNext =
    selectedIndex >= 0 && selectedIndex < filtered.length - 1
      ? () => setSelectedId(filtered[selectedIndex + 1].id)
      : null;

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
    <div className="flex items-start gap-5">
      <div className="flex-1 min-w-0">
      <h1 className="page-title">Respuestas</h1>
      <p className="page-subtitle mb-5">
        {form?.title}
        {filtered.length > 0 && <span className="text-gray-400"> · haz clic en una respuesta para verla completa</span>}
      </p>

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
                  <tr
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={`cursor-pointer ${
                      r.id === selectedId ? "!bg-[#EAF1F9]" : seenAt && r.submitted_at > seenAt ? "!bg-[#FFF5F5]" : ""
                    }`}
                  >
                    <td className="whitespace-nowrap text-gray-500">
                      {seenAt && r.submitted_at > seenAt && (
                        <span
                          className="inline-flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded-full bg-[#E5484D] text-white text-[10px] font-bold align-middle"
                          title="Respuesta nueva"
                        >
                          NUEVA
                        </span>
                      )}
                      {new Date(r.submitted_at).toLocaleString()}
                    </td>
                    {cols.map((c) => (
                      <td key={c.id}>
                        {c.type === "archivo" || c.type === "firma" ? (
                          r.data[c.id] ? (
                            c.type === "archivo" ? (
                              <FileLinks url={r.data[c.id]} name={attachmentFileName(form?.fields, r.data, c)} />
                            ) : (
                              <a href={r.data[c.id]} target="_blank" className="text-blue underline" onClick={(e) => e.stopPropagation()}>
                                Ver firma
                              </a>
                            )
                          ) : (
                            "—"
                          )
                        ) : (
                          String(r.data[c.id] ?? "—")
                        )}
                      </td>
                    ))}
                    <td className="whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadResponsePdf(form, r, form?.fields || [])}
                          className="btn-sm !bg-navy !text-white !border-navy hover:!bg-navy2"
                        >
                          PDF
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => deleteResponse(r)}
                            className="btn-sm !text-[#B23A3A] !border-[#F2D6D6] hover:!bg-[#FCEBEB]"
                          >
                            Eliminar
                          </button>
                        )}
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

      <ResponseDrawer
        form={form}
        response={selected}
        position={selectedIndex + 1}
        total={filtered.length}
        onClose={() => setSelectedId(null)}
        onPrev={goPrev}
        onNext={goNext}
        onDelete={deleteResponse}
        canDelete={canEdit}
      />
    </div>
  );
}
