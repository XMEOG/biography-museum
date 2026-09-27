import { getScenes, getPersons } from "@/lib/data";
import SceneExperience from "@/components/Scene/SceneExperience";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [scenes, persons] = await Promise.all([getScenes(), getPersons()]);
  const scene = scenes[0];

  if (!scene) {
    return (
      <main className="flex h-dvh flex-col items-center justify-center gap-3 text-center">
        <h1 className="font-display text-3xl text-museum-text">
          Henüz bir sergi sahnesi eklenmedi
        </h1>
        <p className="max-w-md text-sm text-museum-muted">
          Admin panelinden (/admin) giriş yapıp bir görsel yükleyerek ilk
          sahneyi oluşturabilirsiniz.
        </p>
        <a
          href="/admin"
          className="mt-3 rounded-full border border-museum-accent px-5 py-2 text-sm text-museum-accent transition hover:bg-museum-accent/10"
        >
          Admin paneline git
        </a>
      </main>
    );
  }

  return <SceneExperience scene={scene} persons={persons} />;
}
