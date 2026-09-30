"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function AllResponsesPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { forms } = await apiFetch("/api/responses-overview");
        setForms(forms || []);
      } catch (err) {
        alert(err.message);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = forms.filter((f) =>
    (f.title || "").toLowerCase().includes(search.trim().toLowerCase())
  );
  const totalResponses = forms.reduce((sum, f) => sum + f.count, 0);

  return (
    <div>
      <h1 className="page-title">Respuestas</h1>
      <p className="page-subtitle mb-5">
        {totalResponses} {totalResponses === 1 ? "respuesta recibida en total" : "respuestas recibidas en total"}, repartidas entre {forms.length} {forms.length === 1 ? "formulario" : "formularios"}.
      </p>

      {!loading && forms.length > 0 && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar formulario por nombre..."
          className="input max-w-[340px] mb-4"
        />
      )}

      {loading && <p className="text-gray-500">Cargando...</p>}

      {!loading && forms.length === 0 && (
        <div className="card empty-state">
          <div className="dot">◇</div>
          <p className="text-gray-500 text-[13px]">Todavía no hay formularios creados.</p>
        </div>
      )}

      {!loading && forms.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Formulario</th>
                  <th>Estado</th>
                  <th>Respuestas</th>
                  <th>Última respuesta</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id}>
                    <td className="font-medium">{f.title}</td>
                    <td>
                      <span className={`badge ${f.status}`}>{f.status}</span>
                    </td>
                    <td>{f.count}</td>
                    <td className="text-gray-500">
                      {f.latest ? new Date(f.latest).toLocaleString() : "—"}
                    </td>
                    <td>
                      <Link href={`/dashboard/forms/${f.id}/responses`} className="btn-sm">
                        Ver respuestas
                      </Link>
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
