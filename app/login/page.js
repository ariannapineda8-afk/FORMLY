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
    <div className="min-h-screen flex items-center justify-center p-6 bg-cream">
      <form
        onSubmit={handleLogin}
        className="card p-9 w-full max-w-[380px]"
      >
        <div className="w-11 h-11 rounded-2xl bg-navy mx-auto mb-4 flex items-center justify-center text-white font-display font-bold text-[17px]">
          F
        </div>
        <h1 className="text-[19px] text-center text-navy mb-0.5 font-semibold">Formly</h1>
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
            className="input"
          />
        </div>
        <div className="mb-5">
          <label className="block text-[12.5px] text-gray-500 mb-1">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input"
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {error && (
          <p className="text-[#B23A3A] text-[12.5px] text-center mt-3">{error}</p>
        )}
      </form>
    </div>
  );
}
