"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSceneForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Lütfen bir görsel seçin.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "image");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      const sceneRes = await fetch("/api/scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Adsız Sahne",
          imageUrl: uploadData.url,
        }),
      });
      const scene = await sceneRes.json();
      if (!sceneRes.ok) throw new Error(scene.error);

      router.push(`/admin/scenes/${scene.id}`);
    } catch (err) {
      setError(err.message || "Yükleme başarısız oldu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <label className="block">
        <span className="mb-1.5 block text-xs text-museum-muted">Sahne başlığı</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ör. Bilim ve Buluş Salonu"
          className="w-full rounded-md border border-museum-line bg-museum-bg px-3 py-2.5 text-sm text-museum-text outline-none focus:border-museum-accent"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs text-museum-muted">Görsel</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
          className="w-full text-sm text-museum-muted file:mr-3 file:rounded-md file:border file:border-museum-line file:bg-transparent file:px-3 file:py-2 file:text-museum-text"
        />
      </label>

      {preview && (
        <div className="overflow-hidden rounded-lg border border-museum-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Önizleme" className="max-h-64 w-full object-cover" />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-museum-accent px-6 py-2.5 text-sm font-medium text-museum-bg transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Yükleniyor…" : "Yükle ve hotspot editörünü aç"}
      </button>
    </form>
  );
}
