import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticatedServer } from "@/lib/auth";
import { getPersons, getScenes } from "@/lib/data";
import AdminShell from "@/components/Admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const authed = await isAuthenticatedServer();
  if (!authed) redirect("/admin");

  const [persons, scenes] = await Promise.all([getPersons(), getScenes()]);
  const totalHotspots = scenes.reduce((sum, s) => sum + s.hotspots.length, 0);
  const linkedHotspots = scenes.reduce(
    (sum, s) => sum + s.hotspots.filter((h) => h.personId).length,
    0
  );
  const missingAudio = persons.filter((p) => !p.audioUrl).length;

  return (
    <AdminShell active="/admin/dashboard">
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-museum-muted">
        Sergideki içeriklerin genel durumu.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sahne" value={scenes.length} />
        <StatCard label="Kişi kaydı" value={persons.length} />
        <StatCard
          label="Bağlı hotspot"
          value={`${linkedHotspots} / ${totalHotspots}`}
        />
        <StatCard label="Ses eksik kişi" value={missingAudio} warn={missingAudio > 0} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <QuickLink
          href="/admin/scenes"
          title="Görsel yükle / sahne düzenle"
          description="Yeni bir sergi görseli yükleyin, hotspot'ları oluşturun veya düzenleyin."
        />
        <QuickLink
          href="/admin/persons"
          title="Kişi kütüphanesi"
          description="Kişi kayıtlarını görüntüleyin, yeni kişi ekleyin veya biyografi/ses güncelleyin."
        />
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, warn }) {
  return (
    <div className="rounded-lg border border-museum-line bg-museum-panel/60 p-4">
      <p className="text-xs text-museum-muted">{label}</p>
      <p className={`mt-1 font-display text-3xl ${warn ? "text-museum-accent" : "text-museum-text"}`}>
        {value}
      </p>
    </div>
  );
}

function QuickLink({ href, title, description }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-museum-line bg-museum-panel/40 p-5 transition hover:border-museum-accent/60"
    >
      <p className="text-museum-text">{title}</p>
      <p className="mt-1 text-sm text-museum-muted">{description}</p>
    </Link>
  );
}
