import { createClient } from "@/lib/supabase/server";
import PublicForm from "@/components/PublicForm";

export default async function PublicFormPage({ params }) {
  const supabase = createClient();
  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "activo")
    .maybeSingle();

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <h1 className="text-navy text-lg mb-2">Formulario no disponible</h1>
          <p className="text-gray-500 text-sm">
            Este enlace no corresponde a un formulario activo. Verifica el enlace o
            contacta a la persona que te lo compartió.
          </p>
        </div>
      </div>
    );
  }

  return <PublicForm form={form} />;
}
