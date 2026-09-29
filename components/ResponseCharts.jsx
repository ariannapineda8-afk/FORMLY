"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { parseOptions } from "@/lib/fields";

const CHARTABLE = ["unica", "multiple", "desplegable", "sinono", "escala"];
const COLORS = ["#3B6FA6", "#2FA88A", "#C08A2E", "#6B4FA3", "#B23A3A", "#12294D", "#8A93A3"];

function countAnswers(field, responses) {
  const counts = {};
  const order =
    field.type === "escala"
      ? ["1", "2", "3", "4", "5"]
      : field.type === "sinono"
      ? ["Sí", "No"]
      : parseOptions(field.options).map((o) => o.trim()).filter(Boolean);
  order.forEach((o) => (counts[o] = 0));

  responses.forEach((r) => {
    const v = r.data?.[field.id];
    if (v === undefined || v === null || v === "") return;
    const vals = Array.isArray(v) ? v : [v];
    vals.forEach((x) => {
      const key = String(x);
      counts[key] = (counts[key] || 0) + 1;
    });
  });

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export default function ResponseCharts({ fields, responses }) {
  const chartable = useMemo(
    () => (fields || []).filter((f) => CHARTABLE.includes(f.type)),
    [fields]
  );
  const [open, setOpen] = useState(true);

  if (chartable.length === 0 || responses.length === 0) return null;

  return (
    <div className="card p-5 mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full"
      >
        <h3 className="text-[14.5px] text-navy font-semibold">Gráficas de resultados</h3>
        <span className="text-[12px] text-blue">{open ? "Ocultar" : "Mostrar"}</span>
      </button>

      {open && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
          {chartable.map((f, i) => {
            const data = countAnswers(f, responses);
            const isPie = f.type === "unica" || f.type === "sinono";
            return (
              <div key={f.id} className="border border-[#F2EFE9] rounded-xl p-3.5">
                <p className="text-[12.5px] font-medium text-navy mb-2.5 truncate" title={f.label}>
                  {f.label || f.type}
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  {isPie ? (
                    <PieChart>
                      <Pie data={data} dataKey="value" nameKey="name" outerRadius={78} label={(e) => e.name}>
                        {data.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  ) : (
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill={COLORS[i % COLORS.length]} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
