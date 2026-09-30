"use client";

// Pequeño helper para hablar SIEMPRE con nuestro propio dominio (/api/...),
// nunca directo con Supabase desde el navegador. Así, un antivirus/firewall
// de oficina que bloquee *.supabase.co no afecta a quien usa la app,
// porque el navegador del usuario solo conversa con formly-forms.netlify.app.
export async function apiFetch(url, options = {}) {
  let res;
  try {
    res = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
  } catch (e) {
    const err = new Error(
      "No se pudo conectar con el servidor de Formly. Revisa tu conexión a internet e inténtalo de nuevo."
    );
    err.cause = e;
    throw err;
  }
  let body = null;
  try {
    body = await res.json();
  } catch (e) {
    // sin cuerpo JSON
  }
  if (!res.ok) {
    const err = new Error((body && body.error) || `No se pudo completar la solicitud (${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return body;
}
