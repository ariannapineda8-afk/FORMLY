import { createClient } from "@/lib/supabase/server";

// Contexto del usuario autenticado + su rol, para usar en los route handlers (/app/api/**).
// Corre en el servidor de Netlify, no en el navegador del usuario.
export async function getAuthContext() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, role: null };

  const { data: allowed } = await supabase
    .from("allowed_users")
    .select("role")
    .ilike("email", user.email)
    .maybeSingle();

  return { supabase, user, role: allowed ? allowed.role || "admin" : null };
}

export function canEditRole(role) {
  return role === "admin" || role === "editor";
}
