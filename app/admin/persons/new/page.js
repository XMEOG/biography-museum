import { redirect } from "next/navigation";
import { isAuthenticatedServer } from "@/lib/auth";
import AdminShell from "@/components/Admin/AdminShell";
import PersonForm from "@/components/Admin/PersonForm";

export const dynamic = "force-dynamic";

export default async function NewPersonPage() {
  const authed = await isAuthenticatedServer();
  if (!authed) redirect("/admin");

  return (
    <AdminShell active="/admin/persons">
      <h1 className="font-display text-3xl">Yeni Kişi Oluştur</h1>
      <p className="mt-1 text-sm text-museum-muted">
        Bu kayıt bir defa oluşturulur; daha sonra farklı sahnelerdeki hotspot'lara bağlanabilir.
      </p>
      <div className="mt-6">
        <PersonForm />
      </div>
    </AdminShell>
  );
}
