"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (signInError) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="bg-white border border-gray-200 rounded-xl p-9 w-full max-w-[380px] shadow-sm"
      >
        <div className="w-11 h-11 rounded-full border-[3px] border-navy mx-auto mb-3.5" />
        <h1 className="text-[19px] text-center text-navy mb-0.5">Formly</h1>
        <p className="text-center text-gray-500 text-[12.5px] mb-6">
          Panel de administración — acceso interno
        </p>

        <div className="mb-3.5">
          <label className="block text-[12.5px] text-gray-500 mb-1">Correo electrónico</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@mardom.com"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue"
          />
        </div>
        <div className="mb-3.5">
          <label className="block text-[12.5px] text-gray-500 mb-1">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-navy text-white rounded-lg font-semibold hover:bg-navy2 disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {error && (
          <p className="text-[#B23A3A] text-[12.5px] text-center mt-2.5">{error}</p>
        )}
      </form>
    </div>
  );
}
