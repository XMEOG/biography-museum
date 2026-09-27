import { redirect } from "next/navigation";
import { isAuthenticatedServer } from "@/lib/auth";
import AdminShell from "@/components/Admin/AdminShell";
import NewSceneForm from "@/components/Admin/NewSceneForm";

export const dynamic = "force-dynamic";

export default async function NewScenePage() {
  const authed = await isAuthenticatedServer();
  if (!authed) redirect("/admin");

  return (
    <AdminShell active="/admin/scenes">
      <h1 className="font-display text-3xl">Yeni Görsel Yükle</h1>
      <p className="mt-1 text-sm text-museum-muted">
        Görseli yükledikten sonra hotspot editörüne yönlendirileceksiniz.
      </p>
      <div className="mt-6 max-w-xl">
        <NewSceneForm />
      </div>
    </AdminShell>
  );
}
