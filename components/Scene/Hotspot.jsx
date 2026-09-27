"use client";

export default function Hotspot({
  hotspot,
  person,
  isHovered,
  isPeeked,
  isDimmed,
  onHoverStart,
  onHoverEnd,
  onActivate,
}) {
  if (!person) return null;

  const highlighted = isHovered || isPeeked;
  const isPolygon =
    hotspot.shape === "polygon" && Array.isArray(hotspot.points) && hotspot.points.length >= 3;
  const localPolygonPoints = isPolygon
    ? hotspot.points.map((point) => {
        const x = hotspot.width ? ((point.x - hotspot.x) / hotspot.width) * 100 : 0;
        const y = hotspot.height ? ((point.y - hotspot.y) / hotspot.height) * 100 : 0;
        return `${x}% ${y}%`;
      })
    : [];

  return (
    <>
    <button
      type="button"
      aria-label={`${person.name} — Hikâyesini keşfet`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      onClick={onActivate}
      className={[
        "group absolute transition-all duration-300 ease-out",
        "focus-visible:outline-none",
        isPolygon
          ? highlighted
            ? "bg-museum-accent/[0.16]"
            : "bg-transparent"
          : [
              "rounded-[8px] border",
              highlighted
                ? "border-museum-accent/70 shadow-glow bg-museum-accent/[0.06]"
                : "border-white/0 hover:border-museum-accent/40",
            ].join(" "),
        isDimmed ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: `${hotspot.width}%`,
        height: `${hotspot.height}%`,
        cursor: "pointer",
        ...(isPolygon
          ? {
              clipPath: `polygon(${localPolygonPoints.join(", ")})`,
              filter: highlighted
                ? "drop-shadow(0 0 10px rgba(221, 168, 78, 0.9))"
                : "none",
            }
          : {}),
      }}
    />
    <span
      className={[
        "pointer-events-none absolute z-20 whitespace-nowrap rounded-full border border-museum-line bg-museum-panel/90 px-3 py-1 text-xs tracking-wide text-museum-text/90",
        "transition-all duration-300",
        highlighted ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{
        left: `${hotspot.x + hotspot.width / 2}%`,
        top: `${hotspot.y + hotspot.height}%`,
        transform: "translate(-50%, 0)",
      }}
    >
      {person.name} · Hikâyesini keşfet
    </span>
    </>
  );
}
