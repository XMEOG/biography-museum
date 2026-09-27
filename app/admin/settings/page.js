import { redirect } from "next/navigation";
import { isAuthenticatedServer } from "@/lib/auth";
import { getAdminCredentials } from "@/lib/data";
import AdminShell from "@/components/Admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const authed = await isAuthenticatedServer();
  if (!authed) redirect("/admin");

  const admin = await getAdminCredentials();

  return (
    <AdminShell active="/admin/settings">
      <h1 className="font-display text-3xl">Ayarlar</h1>
      <p className="mt-1 text-sm text-museum-muted">
        Hesap ve sistem bilgileri.
      </p>

      <div className="mt-6 max-w-md rounded-lg border border-museum-line bg-museum-panel/40 p-5">
        <p className="text-sm text-museum-muted">Yönetici kullanıcı adı</p>
        <p className="mt-1 text-museum-text">{admin.username}</p>
        <p className="mt-4 text-xs text-museum-muted">
          Şifre değişikliği bu MVP sürümünde arayüzden desteklenmiyor;{" "}
          <code className="rounded bg-museum-bg px-1 py-0.5">
            data/admin.json
          </code>{" "}
          dosyasından güncellenebilir. Üretim ortamında bu bilgi hashlenmeli ve
          ortam değişkeninde saklanmalıdır.
        </p>
      </div>
    </AdminShell>
  );
}
