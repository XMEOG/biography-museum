"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const emptyPerson = {
  id: "",
  name: "",
  subtitle: "",
  shortBiography: "",
  biography: "",
  period: "",
  works: [],
  contributions: [],
  timeline: [],
  gallery: [],
  videoUrl: "",
  audioUrl: "",
  audioIsTTS: false,
};

export default function PersonForm({ initialPerson }) {
  const router = useRouter();
  const isEdit = Boolean(initialPerson);
  const [form, setForm] = useState(initialPerson || emptyPerson);
  const [saving, setSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const originalBiography = initialPerson?.biography;
  const biographyChanged =
    isEdit && form.biography !== originalBiography && form.audioUrl;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateListItem(field, index, value) {
    setForm((f) => {
      const next = [...f[field]];
      next[index] = value;
      return { ...f, [field]: next };
    });
  }

  function addListItem(field, empty = "") {
    setForm((f) => ({ ...f, [field]: [...f[field], empty] }));
  }

  function removeListItem(field, index) {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }));
  }

  function updateTimelineItem(index, key, value) {
    setForm((f) => {
      const next = [...f.timeline];
      next[index] = { ...next[index], [key]: value };
      return { ...f, timeline: next };
    });
  }

  async function handleAudioUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "audio");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      update("audioUrl", data.url);
      update("audioIsTTS", false);
    } catch (err) {
      setError(err.message || "Ses yüklenemedi.");
    } finally {
      setUploadingAudio(false);
    }
  }

  async function handleGalleryUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "image");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((f) => ({
        ...f,
        gallery: [...f.gallery, { url: data.url, caption: "" }],
      }));
    } catch (err) {
      setError(err.message || "Görsel yüklenemedi.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.biography.trim()) {
      setError("Ad ve birinci ağızdan biyografi metni zorunludur.");
      return;
    }
    setSaving(true);
    try {
      const url = isEdit ? `/api/persons/${initialPerson.id}` : "/api/persons";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kaydedilemedi.");
      router.push("/admin/persons");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    await fetch(`/api/persons/${initialPerson.id}`, { method: "DELETE" });
    router.push("/admin/persons");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <Section title="Temel Bilgiler">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ad Soyad *">
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className="input"
            />
          </Field>
          <Field label="Kısa Başlık">
            <input
              value={form.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              placeholder="ör. Matematikçi, Bilim İnsanı"
              className="input"
            />
          </Field>
          <Field label="Dönem / Tarih">
            <input
              value={form.period}
              onChange={(e) => update("period", e.target.value)}
              placeholder="ör. 1815 – 1852"
              className="input"
            />
          </Field>
          {!isEdit && (
            <Field label="Kişi ID (opsiyonel)">
              <input
                value={form.id}
                onChange={(e) => update("id", e.target.value)}
                placeholder="boş bırakılırsa otomatik oluşturulur"
                className="input"
              />
            </Field>
          )}
        </div>
        <Field label='Kısa açıklama (kart / "Ben Kimim?" için)'>
          <textarea
            value={form.shortBiography}
            onChange={(e) => update("shortBiography", e.target.value)}
            rows={2}
            className="input"
          />
        </Field>
      </Section>

      <Section title="Birinci Ağızdan Biyografi *" hint="Kullanıcı bu metni okuyacak ve dinleyecek.">
        <textarea
          value={form.biography}
          onChange={(e) => update("biography", e.target.value)}
          rows={8}
          required
          placeholder='Örn: "Merhaba, ben Ada Lovelace. Matematiğe olan ilgim..."'
          className="input font-serif"
        />
        {biographyChanged && (
          <p className="mt-2 text-sm text-amber-400">
            Biyografi metnini değiştirdiniz; mevcut ses kaydı artık metinle uyuşmayabilir.
            Kaydettiğinizde bu kişi "ses güncel değil" olarak işaretlenecek.
          </p>
        )}
      </Section>

      <Section title="Ses Kaydı">
        {form.audioUrl ? (
          <div className="flex items-center gap-3">
            <audio controls src={form.audioUrl} className="h-9 flex-1" />
            <button
              type="button"
              onClick={() => update("audioUrl", "")}
              className="text-sm text-museum-muted hover:text-red-400"
            >
              Kaldır
            </button>
          </div>
        ) : (
          <p className="mb-2 text-sm text-museum-muted">
            Henüz ses dosyası yüklenmedi. Kullanıcı bu kişiyi açtığında yalnızca metin gösterilecek.
          </p>
        )}
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md border border-museum-line px-3 py-2 text-sm text-museum-muted hover:border-museum-accent hover:text-museum-accent">
          {uploadingAudio ? "Yükleniyor…" : "Hazır ses dosyası yükle (mp3/wav/ogg)"}
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleAudioUpload}
            disabled={uploadingAudio}
          />
        </label>
        <p className="mt-2 text-xs text-museum-muted">
          Not: Bu dosya, önceden kayıt edilmiş ya da önceden TTS ile üretilmiş bir ses olabilir.
          Sistem her tıklamada yeni ses üretmez — yalnızca burada yüklenen dosyayı oynatır.
        </p>
      </Section>

      <ListSection
        title="Çalışmalarım"
        items={form.works}
        onAdd={() => addListItem("works")}
        onChange={(i, v) => updateListItem("works", i, v)}
        onRemove={(i) => removeListItem("works", i)}
        placeholder="ör. Analitik Motor üzerine notlar (1843)"
      />

      <ListSection
        title="Önemli Katkılarım"
        items={form.contributions}
        onAdd={() => addListItem("contributions")}
        onChange={(i, v) => updateListItem("contributions", i, v)}
        onRemove={(i) => removeListItem("contributions", i)}
        placeholder="ör. İlk bilgisayar programını yazdı"
      />

      <Section title="Zaman Çizelgesi">
        <div className="space-y-2">
          {form.timeline.map((t, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={t.year}
                onChange={(e) => updateTimelineItem(i, "year", e.target.value)}
                placeholder="Yıl"
                className="input w-28"
              />
              <input
                value={t.label}
                onChange={(e) => updateTimelineItem(i, "label", e.target.value)}
                placeholder="Olay"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={() => removeListItem("timeline", i)}
                className="px-2 text-museum-muted hover:text-red-400"
                aria-label="Sil"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addListItem("timeline", { year: "", label: "" })}
          className="mt-2 text-sm text-museum-accent hover:opacity-80"
        >
          + Zaman çizelgesine ekle
        </button>
      </Section>

      <Section title="Galeri">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {form.gallery.map((g, i) => (
            <div key={i} className="overflow-hidden rounded-md border border-museum-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.url} alt="" className="h-20 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeListItem("gallery", i)}
                className="w-full bg-museum-panel2 py-1 text-xs text-museum-muted hover:text-red-400"
              >
                Kaldır
              </button>
            </div>
          ))}
        </div>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-museum-line px-3 py-2 text-sm text-museum-muted hover:border-museum-accent hover:text-museum-accent">
          {uploadingImage ? "Yükleniyor…" : "Galeriye görsel ekle"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleGalleryUpload}
            disabled={uploadingImage}
          />
        </label>
      </Section>

      <Section title="Video (opsiyonel)">
        <input
          value={form.videoUrl}
          onChange={(e) => update("videoUrl", e.target.value)}
          placeholder="Video dosyası URL'si"
          className="input"
        />
      </Section>

      <div className="flex items-center justify-between border-t border-museum-line pt-6">
        <div>
          {isEdit &&
            (deleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-museum-muted">Emin misiniz?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-sm text-red-400 hover:underline"
                >
                  Evet, sil
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="text-sm text-museum-muted hover:underline"
                >
                  Vazgeç
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="text-sm text-museum-muted hover:text-red-400"
              >
                Kişiyi sil
              </button>
            ))}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-museum-accent px-6 py-2.5 text-sm font-medium text-museum-bg transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid #2a2a2e;
          background: #0a0a0b;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          color: #edebe6;
          outline: none;
        }
        .input:focus {
          border-color: #b8935a;
        }
      `}</style>
    </form>
  );
}

function Section({ title, hint, children }) {
  return (
    <section>
      <h2 className="text-sm font-medium tracking-wide text-museum-text">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-museum-muted">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-museum-muted">{label}</span>
      {children}
    </label>
  );
}

function ListSection({ title, items, onAdd, onChange, onRemove, placeholder }) {
  return (
    <Section title={title}>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => onChange(i, e.target.value)}
              placeholder={placeholder}
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="px-2 text-museum-muted hover:text-red-400"
              aria-label="Sil"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 text-sm text-museum-accent hover:opacity-80"
      >
        + Ekle
      </button>
    </Section>
  );
}
