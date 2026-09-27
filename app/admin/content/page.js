import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticatedServer } from "@/lib/auth";
import { getPersons } from "@/lib/data";
import AdminShell from "@/components/Admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const authed = await isAuthenticatedServer();
  if (!authed) redirect("/admin");

  const persons = await getPersons();
  const staleAudio = persons.filter((p) => p.audioStale);
  const missingBio = persons.filter((p) => !p.biography?.trim());

  return (
    <AdminShell active="/admin/content">
      <h1 className="font-display text-3xl">İçerikler</h1>
      <p className="mt-1 text-sm text-museum-muted">
        Biyografi ve ses içeriklerinin genel durumu. Düzenlemek için kişi kaydına gidin.
      </p>

      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-sm font-medium text-museum-text">
            Sesi güncel olmayan kişiler
          </h2>
          {staleAudio.length === 0 ? (
            <p className="mt-2 text-sm text-museum-muted">Hepsi güncel.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {staleAudio.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/persons/${p.id}`}
                    className="text-sm text-museum-accent hover:underline"
                  >
                    {p.name}
                  </Link>
                  <span className="ml-2 text-xs text-museum-muted">
                    — biyografi değişti, ses kaydı eski olabilir
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-sm font-medium text-museum-text">
            Biyografi metni eksik olan kişiler
          </h2>
          {missingBio.length === 0 ? (
            <p className="mt-2 text-sm text-museum-muted">Hepsi tamam.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {missingBio.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/persons/${p.id}`}
                    className="text-sm text-museum-accent hover:underline"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
