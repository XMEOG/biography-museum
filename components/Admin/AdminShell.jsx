import Link from "next/link";
import LogoutButton from "./LogoutButton";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/scenes", label: "Görseller" },
  { href: "/admin/persons", label: "Kişiler" },
  { href: "/admin/content", label: "İçerikler" },
  { href: "/admin/settings", label: "Ayarlar" },
];

export default function AdminShell({ active, children }) {
  return (
    <div className="min-h-dvh bg-museum-bg text-museum-text">
      <div className="flex min-h-dvh">
        <aside className="hidden w-60 shrink-0 border-r border-museum-line bg-museum-panel/60 md:block">
          <div className="border-b border-museum-line px-6 py-6">
            <p className="font-display text-xl">Sergi Yönetimi</p>
            <p className="mt-0.5 text-xs text-museum-muted">Admin Paneli</p>
          </div>
          <nav className="flex flex-col gap-0.5 p-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  active === item.href
                    ? "bg-museum-accent/15 text-museum-accent"
                    : "text-museum-muted hover:bg-white/5 hover:text-museum-text",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-3">
            <LogoutButton />
          </div>
        </aside>

        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-museum-line px-5 py-4 md:hidden">
            <p className="font-display text-lg">Sergi Yönetimi</p>
            <LogoutButton compact />
          </header>
          <main className="p-5 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
