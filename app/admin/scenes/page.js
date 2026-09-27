import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticatedServer } from "@/lib/auth";
import { getScenes } from "@/lib/data";
import AdminShell from "@/components/Admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function ScenesPage() {
  const authed = await isAuthenticatedServer();
  if (!authed) redirect("/admin");

  const scenes = await getScenes();

  return (
    <AdminShell active="/admin/scenes">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Görseller</h1>
          <p className="mt-1 text-sm text-museum-muted">
            Sergi sahnelerini yönetin ve hotspot'ları düzenleyin.
          </p>
        </div>
        <Link
          href="/admin/scenes/new"
          className="rounded-md bg-museum-accent px-4 py-2 text-sm font-medium text-museum-bg transition hover:opacity-90"
        >
          + Yeni Görsel Yükle
        </Link>
      </div>

      {scenes.length === 0 ? (
        <p className="mt-10 text-sm text-museum-muted">
          Henüz bir sahne yok. Yukarıdaki butonla ilk sergi görselinizi yükleyin.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenes.map((s) => {
            const linked = s.hotspots.filter((h) => h.personId).length;
            return (
              <Link
                key={s.id}
                href={`/admin/scenes/${s.id}`}
                className="overflow-hidden rounded-lg border border-museum-line bg-museum-panel/40 transition hover:border-museum-accent/60"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.imageUrl} alt={s.title} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <p className="text-museum-text">{s.title}</p>
                  <p className="mt-1 text-xs text-museum-muted">
                    {linked} / {s.hotspots.length} hotspot bağlı
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
