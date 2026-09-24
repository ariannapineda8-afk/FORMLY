import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: allowed } = await supabase
    .from("allowed_users")
    .select("email")
    .ilike("email", user.email)
    .maybeSingle();

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <h1 className="text-navy text-lg mb-2">Sin acceso</h1>
          <p className="text-gray-500 text-sm">
            Tu cuenta ({user.email}) inició sesión correctamente, pero no está en la
            lista de usuarios autorizados de Formly. Pide a un administrador que te
            agregue en la tabla <code>allowed_users</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar email={user.email} />
      <div className="flex-1 min-w-0 px-7 py-6 pb-16">{children}</div>
    </div>
  );
}
