"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hotspot from "./Hotspot";
import BiographyPanel from "../BiographyPanel/BiographyPanel";

export default function SceneExperience({ scene, persons }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [peekedId, setPeekedId] = useState(null); // mobil: ilk dokunuşta "peek"
  const [activeHotspotId, setActiveHotspotId] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      setIsTouchDevice(window.matchMedia("(hover: none)").matches);
    }
  }, []);

  const personById = useMemo(() => {
    const map = new Map();
    persons.forEach((p) => map.set(p.id, p));
    return map;
  }, [persons]);

  const activeHotspot = scene.hotspots.find((h) => h.id === activeHotspotId);
  const activePerson = activeHotspot ? personById.get(activeHotspot.personId) : null;
  const isZoomed = Boolean(activePerson);

  const returnToScene = () => {
    setActiveHotspotId(null);
    setPeekedId(null);
  };

  const handleActivate = (hotspot) => {
    if (!hotspot.personId || !personById.get(hotspot.personId)) return;

    if (isTouchDevice && peekedId !== hotspot.id) {
      // Mobilde ilk dokunuş: sadece öne çıkar (peek), açma.
      setPeekedId(hotspot.id);
      return;
    }
    setActiveHotspotId(hotspot.id);
    setPeekedId(null);
  };

  // Etkin hotspot'un merkezine göre sahneyi yumuşakça yakınlaştırmak için transform hesapla.
  const zoomTransform = useMemo(() => {
    if (!activeHotspot) return "scale(1) translate(0, 0)";
    const cx = activeHotspot.x + activeHotspot.width / 2;
    const cy = activeHotspot.y + activeHotspot.height / 2;
    const scale = 1.5;
    // Hotspot merkezini %50,%50'ye taşıyacak öteleme (yüzde cinsinden, basit ve öngörülebilir).
    const translateX = (50 - cx) * 1;
    const translateY = (50 - cy) * 1;
    return `scale(${scale}) translate(${translateX}%, ${translateY}%)`;
  }, [activeHotspot]);

  // Klavye: Escape ile sahneye dön
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && isZoomed) returnToScene();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isZoomed]);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-museum-bg">
      {/* Sahne başlığı */}
      <div
        className={[
          "pointer-events-none absolute left-0 right-0 top-0 z-20 flex justify-between px-6 py-5 transition-opacity duration-500",
          isZoomed ? "opacity-0" : "opacity-100",
        ].join(" ")}
      >
        <h1 className="font-display text-2xl text-museum-text/90 md:text-3xl">
          {scene.title}
        </h1>
        <p className="hidden text-sm text-museum-muted md:block">
          Bir kişiye tıklayarak hikâyesini keşfedin
        </p>
      </div>

      {/* Yakınlaştırılan sahne katmanı */}
      <div
        ref={frameRef}
        className="absolute inset-0 flex items-center justify-center transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
        style={{ transform: zoomTransform }}
      >
        <div className="relative aspect-[16/9] w-full max-w-[1600px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scene.imageUrl}
            alt={scene.title}
            className="h-full w-full select-none object-cover"
            draggable={false}
          />

          {scene.hotspots.map((hotspot) => (
            <Hotspot
              key={hotspot.id}
              hotspot={hotspot}
              person={personById.get(hotspot.personId)}
              isHovered={hoveredId === hotspot.id}
              isPeeked={peekedId === hotspot.id}
              isDimmed={isZoomed && activeHotspotId !== hotspot.id}
              onHoverStart={() => setHoveredId(hotspot.id)}
              onHoverEnd={() => setHoveredId(null)}
              onActivate={() => handleActivate(hotspot)}
            />
          ))}
        </div>
      </div>

      {/* Karartma / blur katmanı */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] transition-opacity duration-700",
          isZoomed ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      {/* Biyografi paneli */}
      <div
        className={[
          "pointer-events-none fixed inset-0 z-30 flex justify-end transition-opacity duration-500",
          isZoomed ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        {isZoomed && (
          <BiographyPanel person={activePerson} onClose={returnToScene} />
        )}
      </div>
    </div>
  );
}
