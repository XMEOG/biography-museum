"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton({ compact = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={
        compact
          ? "text-sm text-museum-muted hover:text-museum-accent"
          : "w-full rounded-md border border-museum-line px-3 py-2 text-left text-sm text-museum-muted transition hover:border-museum-accent hover:text-museum-accent"
      }
    >
      {loading ? "Çıkış yapılıyor…" : "Çıkış"}
    </button>
  );
}
