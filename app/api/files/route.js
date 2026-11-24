import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";

// Entrega un archivo adjunto de una respuesta a través de Formly (por si el navegador no
// puede llegar directo al almacenamiento). Solo funciona para usuarios con sesión y solo
// para archivos de la carpeta de adjuntos de Formly.
export async function GET(request) {
  const { user } = await getAuthContext();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const target = new URL(request.url).searchParams.get("url") || "";
  let parsed;
  try {
    parsed = new URL(target);
  } catch (e) {
    return NextResponse.json({ error: "Enlace no válido." }, { status: 400 });
  }
  const base = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (parsed.host !== base.host || !parsed.pathname.startsWith("/storage/v1/object/public/form-uploads/")) {
    return NextResponse.json({ error: "Archivo no permitido." }, { status: 400 });
  }

  const upstream = await fetch(parsed.toString());
  if (!upstream.ok) return NextResponse.json({ error: "No se encontró el archivo." }, { status: 404 });
  const buf = await upstream.arrayBuffer();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    },
  });
}
