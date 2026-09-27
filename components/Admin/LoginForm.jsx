"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Giriş başarısız.");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Bir şeyler ters gitti, tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="mb-1.5 block text-xs text-museum-muted">
          E-posta veya kullanıcı adı
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full rounded-md border border-museum-line bg-museum-bg px-3 py-2.5 text-sm text-museum-text outline-none focus:border-museum-accent"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs text-museum-muted">
          Şifre
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-md border border-museum-line bg-museum-bg px-3 py-2.5 text-sm text-museum-text outline-none focus:border-museum-accent"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-museum-accent py-2.5 text-sm font-medium text-museum-bg transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>

      <p className="pt-1 text-center text-xs text-museum-muted">
        Demo hesap: admin / museum2026
      </p>
    </form>
  );
}
