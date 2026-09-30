import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase = createClient();
  const formData = await request.formData();
  const file = formData.get("file");
  const formId = formData.get("formId");

  if (!file || !formId) {
    return NextResponse.json({ error: "Falta el archivo o el formulario." }, { status: 400 });
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "El archivo pesa más de 15 MB." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const safeName = (file.name || "archivo").replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${formId}/${Date.now()}-${safeName}`;

  const { error: upErr } = await supabase.storage
    .from("form-uploads")
    .upload(path, Buffer.from(arrayBuffer), { contentType: file.type || "application/octet-stream" });
  if (upErr) return NextResponse.json({ error: "No se pudo subir el archivo: " + upErr.message }, { status: 400 });

  const { data } = supabase.storage.from("form-uploads").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
