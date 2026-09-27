"use client";

import { useState } from "react";
import AudioPlayer from "./AudioPlayer";
import Tabs from "./Tabs";

const TAB_DEFS = [
  { id: "who", label: "Ben Kimim?" },
  { id: "life", label: "Hayat Hikâyem" },
  { id: "works", label: "Çalışmalarım" },
  { id: "contributions", label: "Önemli Katkılarım" },
  { id: "gallery", label: "Galeri" },
  { id: "timeline", label: "Zaman Çizelgesi" },
];

export default function BiographyPanel({ person, onClose }) {
  const [activeTab, setActiveTab] = useState("who");

  if (!person) return null;

  return (
    <aside
      role="dialog"
      aria-label={`${person.name} biyografi paneli`}
      className="animate-panelIn pointer-events-auto flex h-full w-full max-w-xl flex-col border-l border-museum-line bg-museum-panel/95 backdrop-blur-md md:h-[88vh] md:self-center md:rounded-l-xl"
    >
      <header className="flex items-start justify-between gap-4 border-b border-museum-line px-6 py-5">
        <div>
          <h2 className="font-display text-3xl leading-tight text-museum-text">
            {person.name}
          </h2>
          <p className="mt-1 text-sm text-museum-accent">{person.subtitle}</p>
          {person.period && (
            <p className="mt-0.5 text-xs text-museum-muted">{person.period}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Sahneye dön"
          className="shrink-0 rounded-full border border-museum-line p-2 text-museum-muted transition hover:border-museum-accent hover:text-museum-accent"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </button>
      </header>

      <div className="px-6 pt-4">
        <AudioPlayer audioUrl={person.audioUrl} text={person.biography} autoPlay />
      </div>

      <div className="mt-4 px-6">
        <Tabs tabs={TAB_DEFS} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">
        {activeTab === "who" && (
          <p className="text-[15px] leading-relaxed text-museum-text/90">
            {person.shortBiography}
          </p>
        )}

        {activeTab === "life" && (
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-museum-text/90">
            {person.biography}
          </p>
        )}

        {activeTab === "works" && (
          <ul className="space-y-2.5">
            {person.works?.length ? (
              person.works.map((w, i) => (
                <li
                  key={i}
                  className="border-l-2 border-museum-accent/50 pl-3 text-[15px] text-museum-text/90"
                >
                  {w}
                </li>
              ))
            ) : (
              <EmptyState text="Bu bölüm için henüz içerik eklenmedi." />
            )}
          </ul>
        )}

        {activeTab === "contributions" && (
          <ul className="space-y-2.5">
            {person.contributions?.length ? (
              person.contributions.map((c, i) => (
                <li
                  key={i}
                  className="border-l-2 border-museum-accent/50 pl-3 text-[15px] text-museum-text/90"
                >
                  {c}
                </li>
              ))
            ) : (
              <EmptyState text="Bu bölüm için henüz içerik eklenmedi." />
            )}
          </ul>
        )}

        {activeTab === "gallery" && (
          <div className="grid grid-cols-2 gap-3">
            {person.gallery?.length ? (
              person.gallery.map((g, i) => (
                <figure key={i} className="overflow-hidden rounded-lg border border-museum-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.url} alt={g.caption || person.name} className="h-32 w-full object-cover" />
                  {g.caption && (
                    <figcaption className="px-2 py-1.5 text-xs text-museum-muted">
                      {g.caption}
                    </figcaption>
                  )}
                </figure>
              ))
            ) : (
              <EmptyState text="Galeri henüz boş." />
            )}
            {person.videoUrl && (
              <div className="col-span-2 mt-2 overflow-hidden rounded-lg border border-museum-line">
                <video src={person.videoUrl} controls className="w-full" />
              </div>
            )}
          </div>
        )}

        {activeTab === "timeline" && (
          <ol className="relative ml-2 space-y-5 border-l border-museum-line pl-5">
            {person.timeline?.length ? (
              person.timeline.map((t, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[25px] top-1 h-2 w-2 rounded-full bg-museum-accent" />
                  <p className="text-sm font-medium text-museum-accent">{t.year}</p>
                  <p className="text-[15px] text-museum-text/90">{t.label}</p>
                </li>
              ))
            ) : (
              <EmptyState text="Zaman çizelgesi henüz eklenmedi." />
            )}
          </ol>
        )}
      </div>

      <footer className="border-t border-museum-line px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full border border-museum-line py-2.5 text-sm tracking-wide text-museum-text/90 transition hover:border-museum-accent hover:text-museum-accent"
        >
          Sahneye dön
        </button>
      </footer>
    </aside>
  );
}

function EmptyState({ text }) {
  return <p className="text-sm text-museum-muted">{text}</p>;
}
