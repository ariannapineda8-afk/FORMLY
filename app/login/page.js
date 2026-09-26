"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    <div className="min-h-screen flex bg-cream">
      <div className="hidden md:flex w-[42%] max-w-[440px] bg-navy text-white flex-col items-center justify-center p-10 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/[0.04]" />
        <div className="absolute -right-6 bottom-24 w-40 h-40 rounded-full border border-white/10" />
        <Image src="/logo-white.png" alt="Formly" width={140} height={182} className="relative" priority />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-[360px]">
          <Image src="/logo-navy.png" alt="Formly" width={34} height={44} className="mb-5 md:hidden" />
          <h2 className="text-[20px] text-navy font-semibold mb-1">Bienvenido de nuevo</h2>
          <p className="text-gray-500 text-[13px] mb-7">Ingresa con tu cuenta.</p>

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
    </div>
  );
}
