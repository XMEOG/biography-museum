"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Önceden hazırlanmış (kayıtlı ya da önceden TTS ile üretilmiş) ses dosyasını oynatır.
 * ÖNEMLİ: Bu bileşen hiçbir koşulda çalışma zamanında yeni ses üretmez;
 * yalnızca kendisine verilen audioUrl'i oynatır.
 */
export default function AudioPlayer({ audioUrl, text, autoPlay = false }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0); // 0-1
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    if (autoPlay && audioRef.current && audioUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [audioUrl, autoPlay]);

  const handleTimeUpdate = () => {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    setProgress(el.currentTime / el.duration);
  };

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
    } else {
      el.play().catch(() => {});
    }
  };

  const restart = () => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {});
  };

  const toggleMute = () => {
    const el = audioRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  };

  // Metni kabaca sesin ilerlemesine göre "altyazı" gibi vurgular (kelime bazlı yaklaşık senkron).
  const words = (text || "").split(/\s+/).filter(Boolean);
  const activeWordIndex = Math.min(
    words.length - 1,
    Math.floor(progress * words.length)
  );

  if (!audioUrl) {
    return (
      <div className="rounded-lg border border-dashed border-museum-line px-4 py-3 text-sm text-museum-muted">
        Bu kişi için henüz bir ses kaydı yüklenmedi. Metni aşağıda okuyabilirsiniz.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-museum-line bg-museum-panel2 p-4">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Duraklat" : "Oynat"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-museum-accent/60 text-museum-accent transition hover:bg-museum-accent/10"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          type="button"
          onClick={restart}
          aria-label="Yeniden başlat"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-museum-line text-museum-muted transition hover:text-museum-text hover:border-museum-muted"
        >
          <RestartIcon />
        </button>

        <div className="relative mx-1 h-1 flex-1 overflow-hidden rounded-full bg-museum-line">
          <div
            className="h-full bg-museum-accent transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-museum-line text-museum-muted transition hover:text-museum-text hover:border-museum-muted"
        >
          {isMuted ? <MuteIcon /> : <VolumeIcon />}
        </button>
      </div>

      {words.length > 0 && (
        <p className="mt-4 max-h-28 overflow-y-auto scrollbar-thin text-sm leading-relaxed text-museum-muted">
          {words.map((w, i) => (
            <span
              key={i}
              className={
                i === activeWordIndex && isPlaying
                  ? "text-museum-accent"
                  : i < activeWordIndex
                  ? "text-museum-text"
                  : ""
              }
            >
              {w}{" "}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M3 1.5v13l11-6.5-11-6.5z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="3" y="2" width="3.5" height="12" />
      <rect x="9.5" y="2" width="3.5" height="12" />
    </svg>
  );
}
function RestartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.7 0 3.2.75 4.2 1.94" />
      <path d="M12.5 1.8v2.9h-2.9" />
    </svg>
  );
}
function VolumeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M2 6h2.5L8 3v10L4.5 10H2z" fill="currentColor" stroke="none" />
      <path d="M11 5.5a4 4 0 0 1 0 5" />
      <path d="M13 3.5a7 7 0 0 1 0 9" />
    </svg>
  );
}
function MuteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M2 6h2.5L8 3v10L4.5 10H2z" fill="currentColor" stroke="none" />
      <path d="M11.5 6.5l3 3M14.5 6.5l-3 3" />
    </svg>
  );
}
