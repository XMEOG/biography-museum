"use client";

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Biyografi bölümleri"
      className="flex gap-1 overflow-x-auto scrollbar-thin border-b border-museum-line"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            "shrink-0 border-b-2 px-3.5 py-2.5 text-sm transition-colors",
            active === tab.id
              ? "border-museum-accent text-museum-text"
              : "border-transparent text-museum-muted hover:text-museum-text",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
