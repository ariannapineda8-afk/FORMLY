import { createClient } from "@supabase/supabase-js";

// Cliente con permisos de administrador. SOLO se usa en el servidor (rutas /app/api/**),
// nunca en el navegador. La clave vive en la variable SUPABASE_SERVICE_ROLE_KEY de Netlify.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    const err = new Error(
      "Falta activar la creación de usuarios: agrega la variable SUPABASE_SERVICE_ROLE_KEY en Netlify (Environment variables) y vuelve a desplegar."
    );
    err.code = "missing_service_role";
    throw err;
  }
  // Por si la URL guardada trae algo de más al final (por ejemplo /rest/v1/), usamos solo el origen.
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function findAuthUserByEmail(admin, email) {
  const target = String(email).trim().toLowerCase();
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const found = (data.users || []).find((u) => (u.email || "").toLowerCase() === target);
    if (found) return found;
    if (!data.users || data.users.length < 1000) break;
  }
  return null;
}
