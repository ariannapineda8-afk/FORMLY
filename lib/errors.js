// Convierte errores técnicos de Supabase en mensajes que se entiendan.
export function explainError(error, email) {
  const msg = (error && error.message) || "";
  if (/row-level security|violates row-level/i.test(msg) || error?.code === "42501") {
    return (
      `Tu cuenta${email ? " (" + email + ")" : ""} no tiene permiso para guardar cambios en la base de datos.\n\n` +
      "Esto se arregla en Supabase (no es un error tuyo): un administrador debe ejecutar el script " +
      "supabase/arreglar-permisos.sql en el SQL Editor."
    );
  }
  if (/failed to fetch|networkerror/i.test(msg)) {
    return "No se pudo conectar con el servidor. Revisa tu internet e inténtalo de nuevo.";
  }
  return "No se pudo guardar: " + msg;
}
