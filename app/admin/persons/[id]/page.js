import { redirect, notFound } from "next/navigation";
import { isAuthenticatedServer } from "@/lib/auth";
import { getPersonById } from "@/lib/data";
import AdminShell from "@/components/Admin/AdminShell";
import PersonForm from "@/components/Admin/PersonForm";

export const dynamic = "force-dynamic";

export default async function EditPersonPage({ params }) {
  const authed = await isAuthenticatedServer();
  if (!authed) redirect("/admin");

  const person = await getPersonById(params.id);
  if (!person) notFound();

  return (
    <AdminShell active="/admin/persons">
      <h1 className="font-display text-3xl">{person.name}</h1>
      <p className="mt-1 text-sm text-museum-muted">Kişi kaydını düzenleyin.</p>
      <div className="mt-6">
        <PersonForm initialPerson={person} />
      </div>
    </AdminShell>
  );
}
