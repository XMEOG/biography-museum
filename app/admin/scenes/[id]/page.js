import { redirect, notFound } from "next/navigation";
import { isAuthenticatedServer } from "@/lib/auth";
import { getSceneById, getPersons } from "@/lib/data";
import AdminShell from "@/components/Admin/AdminShell";
import HotspotEditor from "@/components/Admin/HotspotEditor";

export const dynamic = "force-dynamic";

export default async function SceneEditorPage({ params }) {
  const authed = await isAuthenticatedServer();
  if (!authed) redirect("/admin");

  const [scene, persons] = await Promise.all([
    getSceneById(params.id),
    getPersons(),
  ]);
  if (!scene) notFound();

  return (
    <AdminShell active="/admin/scenes">
      <h1 className="font-display text-3xl">{scene.title}</h1>
      <p className="mt-1 text-sm text-museum-muted">
        Hotspot'ları taşıyın, boyutlandırın, silin veya yeni alan ekleyin. Her
        hotspot'u kütüphaneden bir kişiye bağlayın.
      </p>
      <div className="mt-6">
        <HotspotEditor scene={scene} initialPersons={persons} />
      </div>
    </AdminShell>
  );
}
