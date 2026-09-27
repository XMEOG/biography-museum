"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const MIN_SIZE = 4;
const CLOSE_TOLERANCE_PX = 18;

export default function HotspotEditor({ scene, initialPersons }) {
  const [hotspots, setHotspots] = useState(scene.hotspots);
  const [persons, setPersons] = useState(initialPersons);
  const [selectedId, setSelectedId] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [detectNote, setDetectNote] = useState("");
  const [error, setError] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [pointerPoint, setPointerPoint] = useState(null);
  const containerRef = useRef(null);
  const dragState = useRef(null);
  const drawingPointsRef = useRef([]);

  async function refreshPersons() {
    const res = await fetch("/api/persons");
    if (res.ok) setPersons(await res.json());
  }

  function personName(id) {
    return persons.find((p) => p.id === id)?.name;
  }

  function getRect() {
    return containerRef.current.getBoundingClientRect();
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function boundsForPoints(points) {
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return {
      x,
      y,
      width: Math.max(...xs) - x,
      height: Math.max(...ys) - y,
    };
  }

  function polygonWithPoints(hotspot, points) {
    return { ...hotspot, points, ...boundsForPoints(points) };
  }

  function pointFromEvent(event) {
    const rect = getRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  }

  function setPoints(points) {
    drawingPointsRef.current = points;
    setDrawingPoints(points);
  }

  async function persistHotspot(hotspot) {
    try {
      await fetch(`/api/scenes/${scene.id}/hotspots/${hotspot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          x: hotspot.x,
          y: hotspot.y,
          width: hotspot.width,
          height: hotspot.height,
          personId: hotspot.personId,
          ...(hotspot.shape === "polygon"
            ? { shape: "polygon", points: hotspot.points }
            : {}),
        }),
      });
      if (!res.ok) throw new Error("Hotspot kaydedilemedi.");
    } catch {
      setError("Değişiklik kaydedilemedi, bağlantınızı kontrol edin.");
    }
  }

  function updateLocal(id, patch) {
    setHotspots((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...patch } : h))
    );
  }

  function startDrag(e, hotspot, mode, pointIndex = null) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(hotspot.id);
    dragState.current = {
      id: hotspot.id,
      mode, // "move" | "resize"
      pointIndex,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startHotspot: { ...hotspot },
    };
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragEnd);
    window.addEventListener("pointercancel", onDragEnd);
  }

  function onDragMove(e) {
    const ds = dragState.current;
    if (!ds) return;
    const rect = getRect();
    const dxPct = ((e.clientX - ds.startClientX) / rect.width) * 100;
    const dyPct = ((e.clientY - ds.startClientY) / rect.height) * 100;

    if (ds.mode === "vertex") {
      const point = pointFromEvent(e);
      if (!point) return;
      const points = ds.startHotspot.points.map((item, index) =>
        index === ds.pointIndex ? point : item
      );
      ds.latest = polygonWithPoints(ds.startHotspot, points);
      updateLocal(ds.id, ds.latest);
    } else if (ds.mode === "move" && ds.startHotspot.shape === "polygon") {
      const deltaX = clamp(
        dxPct,
        -ds.startHotspot.x,
        100 - ds.startHotspot.x - ds.startHotspot.width
      );
      const deltaY = clamp(
        dyPct,
        -ds.startHotspot.y,
        100 - ds.startHotspot.y - ds.startHotspot.height
      );
      const points = ds.startHotspot.points.map((point) => ({
        x: point.x + deltaX,
        y: point.y + deltaY,
      }));
      ds.latest = polygonWithPoints(ds.startHotspot, points);
      updateLocal(ds.id, ds.latest);
    } else if (ds.mode === "move") {
      const x = clamp(ds.startHotspot.x + dxPct, 0, 100 - ds.startHotspot.width);
      const y = clamp(ds.startHotspot.y + dyPct, 0, 100 - ds.startHotspot.height);
      ds.latest = { ...ds.startHotspot, x, y };
      updateLocal(ds.id, ds.latest);
    } else {
      const width = clamp(ds.startHotspot.width + dxPct, MIN_SIZE, 100 - ds.startHotspot.x);
      const height = clamp(ds.startHotspot.height + dyPct, MIN_SIZE, 100 - ds.startHotspot.y);
      ds.latest = { ...ds.startHotspot, width, height };
      updateLocal(ds.id, ds.latest);
    }
  }

  function onDragEnd() {
    const ds = dragState.current;
    window.removeEventListener("pointermove", onDragMove);
    window.removeEventListener("pointerup", onDragEnd);
    window.removeEventListener("pointercancel", onDragEnd);
    if (!ds) return;
    const finalHotspot = ds.latest || hotspots.find((h) => h.id === ds.id);
    dragState.current = null;
    if (finalHotspot) persistHotspot(finalHotspot);
  }

  function startDrawing() {
    setError("");
    setSelectedId(null);
    setPointerPoint(null);
    setPoints([]);
    setDrawing(true);
  }

  function cancelDrawing() {
    setDrawing(false);
    setPointerPoint(null);
    setPoints([]);
  }

  function undoPoint() {
    setPoints(drawingPointsRef.current.slice(0, -1));
  }

  async function savePolygon(points) {
    const bounds = boundsForPoints(points);
    setError("");
    try {
      const res = await fetch(`/api/scenes/${scene.id}/hotspots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shape: "polygon",
          points,
          ...bounds,
          personId: null,
          source: "manual-polygon",
        }),
      });
      const hotspot = await res.json();
      if (!res.ok) throw new Error(hotspot.error);
      setHotspots((prev) => [...prev, hotspot]);
      setSelectedId(hotspot.id);
      cancelDrawing();
    } catch (err) {
      setError(err.message || "Poligon kaydedilemedi.");
    }
  }

  function onCanvasPointerMove(event) {
    if (!drawing) return;
    setPointerPoint(pointFromEvent(event));
  }

  function onCanvasPointerDown(event) {
    if (!drawing) return;
    event.preventDefault();
    const point = pointFromEvent(event);
    if (!point) return;
    const points = drawingPointsRef.current;
    if (points.length >= 3) {
      const rect = getRect();
      const distance = Math.hypot(
        ((point.x - points[0].x) / 100) * rect.width,
        ((point.y - points[0].y) / 100) * rect.height
      );
      if (distance <= CLOSE_TOLERANCE_PX) {
        savePolygon(points);
        return;
      }
    } else if (points.length > 0) {
      const rect = getRect();
      const distance = Math.hypot(
        ((point.x - points[0].x) / 100) * rect.width,
        ((point.y - points[0].y) / 100) * rect.height
      );
      if (distance <= CLOSE_TOLERANCE_PX) {
        setError("Alanı kapatmak için en az 3 nokta yerleştirin.");
        return;
      }
    }
    setError("");
    setPoints([...points, point]);
  }

  async function deleteHotspot(id) {
    setHotspots((prev) => prev.filter((h) => h.id !== id));
    if (selectedId === id) setSelectedId(null);
    await fetch(`/api/scenes/${scene.id}/hotspots/${id}`, { method: "DELETE" });
  }

  async function assignPerson(id, personId) {
    updateLocal(id, { personId: personId || null });
    await fetch(`/api/scenes/${scene.id}/hotspots/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId: personId || null }),
    });
  }

  async function runAutoDetect() {
    setDetecting(true);
    setDetectNote("");
    setError("");
    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: scene.imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDetectNote(data.note);

      for (const suggestion of data.suggestions) {
        const createRes = await fetch(`/api/scenes/${scene.id}/hotspots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...suggestion, personId: null }),
        });
        const hotspot = await createRes.json();
        if (createRes.ok) {
          setHotspots((prev) => [...prev, hotspot]);
        }
      }
    } catch (err) {
      setError(err.message || "Otomatik algılama başarısız oldu.");
    } finally {
      setDetecting(false);
    }
  }

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onDragMove);
      window.removeEventListener("pointerup", onDragEnd);
      window.removeEventListener("pointercancel", onDragEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!drawing) return;
    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelDrawing();
      } else if (event.key === "Backspace") {
        event.preventDefault();
        undoPoint();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawing]);

  const selected = hotspots.find((h) => h.id === selectedId);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={startDrawing}
            disabled={drawing}
            className="rounded-md border border-museum-line px-3 py-2 text-sm text-museum-text transition hover:border-museum-accent hover:text-museum-accent"
          >
            + Noktalarla alan çiz
          </button>
          <button
            type="button"
            onClick={runAutoDetect}
            disabled={detecting}
            className="rounded-md border border-museum-line px-3 py-2 text-sm text-museum-text transition hover:border-museum-accent hover:text-museum-accent disabled:opacity-50"
          >
            {detecting ? "Algılanıyor…" : "Otomatik kişi algıla (deneysel)"}
          </button>
          {drawing && (
            <>
              <button
                type="button"
                onClick={undoPoint}
                disabled={drawingPoints.length === 0}
                className="rounded-md border border-museum-line px-3 py-2 text-sm text-museum-text transition hover:border-museum-accent disabled:opacity-50"
              >
                Son noktayı geri al
              </button>
              <button
                type="button"
                onClick={cancelDrawing}
                className="rounded-md border border-red-500/40 px-3 py-2 text-sm text-red-300 transition hover:border-red-400"
              >
                Çizimi iptal et
              </button>
            </>
          )}
        </div>

        {drawing && (
          <p className="mb-3 rounded-md border border-museum-accent/50 bg-museum-accent/10 px-3 py-2 text-sm text-museum-text">
            Kişinin çevresine sırayla noktalar yerleştirin. Alanı tamamlamak için ilk noktaya tekrar tıklayın.
          </p>
        )}
        {detectNote && (
          <p className="mb-3 rounded-md border border-museum-line bg-museum-panel2 px-3 py-2 text-xs text-museum-muted">
            {detectNote}
          </p>
        )}
        {error && (
          <p className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div
          ref={containerRef}
          onPointerDown={onCanvasPointerDown}
          onPointerMove={onCanvasPointerMove}
          onPointerLeave={() => drawing && setPointerPoint(null)}
          className={`relative w-full select-none overflow-hidden rounded-lg border border-museum-line bg-black ${drawing ? "cursor-crosshair" : ""}`}
          style={{ aspectRatio: "16 / 9", touchAction: drawing ? "none" : "auto" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scene.imageUrl}
            alt={scene.title}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          {hotspots.filter((h) => h.shape !== "polygon").map((h) => (
            <div
              key={h.id}
              onPointerDown={(e) => startDrag(e, h, "move")}
              onClick={() => setSelectedId(h.id)}
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`,
                width: `${h.width}%`,
                height: `${h.height}%`,
                pointerEvents: drawing ? "none" : "auto",
              }}
              className={[
                "absolute cursor-move rounded-[6px] border-2 transition-colors",
                selectedId === h.id
                  ? "border-museum-accent bg-museum-accent/15"
                  : h.personId
                  ? "border-museum-accent/50 bg-museum-accent/5"
                  : "border-dashed border-white/50 bg-white/5",
              ].join(" ")}
            >
              <span className="pointer-events-none absolute -top-6 left-0 whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-white">
                {personName(h.personId) || "Atanmadı"}
              </span>
              <div
                onPointerDown={(e) => startDrag(e, h, "resize")}
                className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-nwse-resize rounded-sm border border-museum-bg bg-museum-accent"
                aria-hidden="true"
              />
            </div>
          ))}
          <svg
            aria-label="Poligon hotspot alanları"
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ pointerEvents: drawing ? "none" : "auto" }}
          >
            {hotspots.filter((h) => h.shape === "polygon" && h.points?.length >= 3).map((h) => (
              <polygon
                key={h.id}
                points={h.points.map((point) => `${point.x},${point.y}`).join(" ")}
                onPointerDown={(event) => startDrag(event, h, "move")}
                fill={selectedId === h.id ? "rgba(221, 168, 78, 0.22)" : "rgba(255, 255, 255, 0.06)"}
                stroke={selectedId === h.id ? "#dda84e" : h.personId ? "rgba(221,168,78,.75)" : "rgba(255,255,255,.75)"}
                strokeWidth="0.35"
                vectorEffect="non-scaling-stroke"
                className="cursor-move"
              />
            ))}
          </svg>
          {hotspots.filter((h) => h.shape === "polygon" && h.points?.length >= 3).map((h) => (
            <span
              key={`${h.id}-label`}
              onClick={() => setSelectedId(h.id)}
              className="pointer-events-none absolute -translate-y-full whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-white"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              {personName(h.personId) || "Atanmadı"}
            </span>
          ))}
          {!drawing && selected?.shape === "polygon" && selected.points.map((point, index) => (
            <button
              key={`${selected.id}-point-${index}`}
              type="button"
              aria-label={`Poligon ${index + 1}. noktasını taşı`}
              onPointerDown={(event) => startDrag(event, selected, "vertex", index)}
              className="absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-2 border-museum-bg bg-museum-accent shadow"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            />
          ))}
          {drawing && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {drawingPoints.length > 1 && (
                <polyline
                  points={drawingPoints.map((point) => `${point.x},${point.y}`).join(" ")}
                  fill="rgba(221, 168, 78, 0.12)"
                  stroke="#dda84e"
                  strokeWidth="0.35"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {drawingPoints.length > 0 && pointerPoint && (
                <line
                  x1={drawingPoints[drawingPoints.length - 1].x}
                  y1={drawingPoints[drawingPoints.length - 1].y}
                  x2={pointerPoint.x}
                  y2={pointerPoint.y}
                  stroke="#dda84e"
                  strokeWidth="0.3"
                  strokeDasharray="1 0.7"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </svg>
          )}
          {drawingPoints.map((point, index) => (
            <div
              key={`drawing-point-${index}`}
              className={`pointer-events-none absolute z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-museum-bg ${index === 0 ? "h-5 w-5 bg-emerald-400 ring-2 ring-emerald-300/70" : "bg-museum-accent"}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              {index === 0 && (
                <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-[11px] text-white">
                  Alanı kapat
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-museum-muted">
          Koordinatlar yüzde bazlı saklanır; böylece görsel farklı ekran boyutlarında responsive kalır.
        </p>
      </div>

      <div className="rounded-lg border border-museum-line bg-museum-panel/40 p-4">
        <h3 className="text-sm font-medium text-museum-text">Seçili Hotspot</h3>
        {!selected ? (
          <p className="mt-2 text-sm text-museum-muted">
            Düzenlemek için sahnedeki bir alana tıklayın.
          </p>
        ) : (
          <div className="mt-3 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-museum-muted">
                Kişi ata
              </label>
              <select
                value={selected.personId || ""}
                onChange={(e) => assignPerson(selected.id, e.target.value)}
                className="w-full rounded-md border border-museum-line bg-museum-bg px-3 py-2 text-sm text-museum-text outline-none focus:border-museum-accent"
              >
                <option value="">— Kişi seçilmedi —</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={refreshPersons}
                  className="text-museum-muted hover:text-museum-accent"
                >
                  Listeyi yenile
                </button>
                <Link
                  href="/admin/persons/new"
                  target="_blank"
                  className="text-museum-accent hover:opacity-80"
                >
                  + Yeni kişi oluştur
                </Link>
              </div>
            </div>

            <p className="text-xs text-museum-muted">
              Konum: %{selected.x.toFixed(0)}, %{selected.y.toFixed(0)} · Boyut: %
              {selected.width.toFixed(0)} × %{selected.height.toFixed(0)}
            </p>

            <button
              type="button"
              onClick={() => deleteHotspot(selected.id)}
              className="text-sm text-red-400 hover:underline"
            >
              Bu alanı sil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
