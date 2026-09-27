import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticatedServer } from "@/lib/auth";
import { getPersons } from "@/lib/data";
import AdminShell from "@/components/Admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function PersonsPage() {
  const authed = await isAuthenticatedServer();
  if (!authed) redirect("/admin");

  const persons = await getPersons();

  return (
    <AdminShell active="/admin/persons">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Kişiler</h1>
          <p className="mt-1 text-sm text-museum-muted">
            Her kişi bir defa oluşturulur ve farklı sahnelerdeki hotspot'lara bağlanabilir.
          </p>
        </div>
        <Link
          href="/admin/persons/new"
          className="rounded-md bg-museum-accent px-4 py-2 text-sm font-medium text-museum-bg transition hover:opacity-90"
        >
          + Yeni kişi oluştur
        </Link>
      </div>

      {persons.length === 0 ? (
        <p className="mt-10 text-sm text-museum-muted">
          Henüz kişi kaydı yok. Yukarıdaki butonla ilk kişiyi oluşturun.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {persons.map((p) => (
            <Link
              key={p.id}
              href={`/admin/persons/${p.id}`}
              className="rounded-lg border border-museum-line bg-museum-panel/40 p-4 transition hover:border-museum-accent/60"
            >
              <p className="text-museum-text">{p.name}</p>
              <p className="mt-0.5 text-xs text-museum-accent">{p.subtitle}</p>
              <p className="mt-2 line-clamp-2 text-sm text-museum-muted">
                {p.shortBiography}
              </p>
              <div className="mt-3 flex gap-2 text-xs">
                <Badge ok={!!p.biography}>Biyografi</Badge>
                <Badge ok={!!p.audioUrl}>Ses</Badge>
                {p.audioStale && (
                  <span className="rounded-full border border-amber-500/50 px-2 py-0.5 text-amber-400">
                    Ses güncel değil
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  );
}

function Badge({ ok, children }) {
  return (
    <span
      className={[
        "rounded-full border px-2 py-0.5",
        ok
          ? "border-museum-accent/40 text-museum-accent"
          : "border-museum-line text-museum-muted",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
