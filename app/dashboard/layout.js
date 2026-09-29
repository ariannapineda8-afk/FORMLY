import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";
import { RoleProvider } from "@/components/RoleContext";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: allowed } = await supabase
    .from("allowed_users")
    .select("email, role")
    .ilike("email", user.email)
    .maybeSingle();

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-cream">
        <div className="card max-w-sm text-center p-8">
          <div className="w-11 h-11 rounded-2xl bg-warnlt text-warn mx-auto mb-4 flex items-center justify-center text-[19px] font-semibold">
            !
          </div>
          <h1 className="text-navy text-[17px] font-semibold mb-2">Sin acceso</h1>
          <p className="text-gray-500 text-[13.5px]">
            Tu cuenta ({user.email}) inició sesión correctamente, pero no está en la
            lista de usuarios autorizados de Formly. Pide a un administrador que te
            agregue en la tabla <code>allowed_users</code>.
          </p>
          <SignOutButton />
        </div>
      </div>
    );
  }

  const role = allowed.role || "admin";

  return (
    <RoleProvider role={role} email={user.email}>
      <div className="min-h-screen bg-cream">
        <TopNav email={user.email} role={role} />
        <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-7 pb-20">{children}</main>
      </div>
    </RoleProvider>
  );
}
