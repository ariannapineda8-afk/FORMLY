"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";

// "Nuevas" = respuestas recibidas después de la última vez que abriste ese formulario
// en este navegador. La primera vez que usas Formly solo cuentan las que lleguen desde ese momento.
const BASE_KEY = "formly_new_baseline";
const seenKey = (id) => "formly_seen_" + id;
const EVT = "formly-seen";

function read(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}
function write(key, val) {
  try {
    window.localStorage.setItem(key, val);
  } catch (e) {}
}

function baseline() {
  let b = read(BASE_KEY);
  if (!b) {
    b = new Date().toISOString();
    write(BASE_KEY, b);
  }
  return b;
}

// Momento desde el cual las respuestas de este formulario se consideran nuevas.
export function seenAtFor(formId) {
  const b = baseline();
  const s = read(seenKey(formId));
  return s && s > b ? s : b;
}

export function markFormSeen(formId) {
  write(seenKey(formId), new Date().toISOString());
  window.dispatchEvent(new Event(EVT));
}

export function useNewResponses() {
  const pathname = usePathname();
  const [state, setState] = useState({ total: 0, byForm: {} });

  const load = useCallback(async () => {
    try {
      const { forms } = await apiFetch("/api/responses-overview");
      const byForm = {};
      let total = 0;
      (forms || []).forEach((f) => {
        const since = seenAtFor(f.id);
        const n = (f.times || []).filter((t) => t > since).length;
        if (n > 0) {
          byForm[f.id] = n;
          total += n;
        }
      });
      setState({ total, byForm });
    } catch (e) {}
  }, []);

  useEffect(() => {
    load();
  }, [load, pathname]);

  useEffect(() => {
    const t = setInterval(load, 45000);
    window.addEventListener(EVT, load);
    return () => {
      clearInterval(t);
      window.removeEventListener(EVT, load);
    };
  }, [load]);

  return state;
}

export function NewBadge({ n, className = "" }) {
  if (!n) return null;
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#E5484D] text-white text-[11px] font-bold leading-none ${className}`}
      title={n === 1 ? "1 respuesta nueva" : `${n} respuestas nuevas`}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}
