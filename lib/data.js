import fs from "fs/promises";
import path from "path";

/**
 * Bu dosya, ileride gerçek bir veritabanına (Postgres, MongoDB, vb.) geçildiğinde
 * tek değişmesi gereken katmandır. Uygulamanın geri kalanı (API route'ları, sayfalar)
 * yalnızca bu fonksiyonları çağırır — doğrudan dosya sistemine dokunmaz.
 * Bu sayede depolama mekanizması değiştiğinde sadece bu dosyanın içi değişir.
 */

const DATA_DIR = path.join(process.cwd(), "data");

async function readJSON(fileName, fallback) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, fileName), "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeJSON(fileName, data) {
  await fs.writeFile(
    path.join(DATA_DIR, fileName),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

function nowISO() {
  return new Date().toISOString();
}

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/* ---------------------------- PERSONS ---------------------------- */

export async function getPersons() {
  return readJSON("persons.json", []);
}

export async function getPersonById(id) {
  const persons = await getPersons();
  return persons.find((p) => p.id === id) || null;
}

export async function createPerson(input) {
  const persons = await getPersons();
  const id = input.id?.trim() || genId("person");
  if (persons.some((p) => p.id === id)) {
    throw new Error("Bu ID'ye sahip bir kişi zaten var.");
  }
  const person = {
    id,
    name: input.name || "",
    subtitle: input.subtitle || "",
    shortBiography: input.shortBiography || "",
    biography: input.biography || "",
    works: input.works || [],
    contributions: input.contributions || [],
    period: input.period || "",
    gallery: input.gallery || [],
    videoUrl: input.videoUrl || "",
    audioUrl: input.audioUrl || "",
    audioIsTTS: !!input.audioIsTTS,
    audioStale: false,
    timeline: input.timeline || [],
    relatedPersons: input.relatedPersons || [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  persons.push(person);
  await writeJSON("persons.json", persons);
  return person;
}

export async function updatePerson(id, updates) {
  const persons = await getPersons();
  const idx = persons.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Kişi bulunamadı.");

  const existing = persons[idx];
  const biographyChanged =
    typeof updates.biography === "string" &&
    updates.biography !== existing.biography;

  const updated = {
    ...existing,
    ...updates,
    id: existing.id, // id değiştirilemez
    // Biyografi metni değişip ses aynı kalırsa, sesin "eski" olduğunu işaretle.
    audioStale:
      biographyChanged && updates.audioUrl === undefined
        ? true
        : updates.audioStale ?? existing.audioStale,
    updatedAt: nowISO(),
  };
  persons[idx] = updated;
  await writeJSON("persons.json", persons);
  return updated;
}

export async function deletePerson(id) {
  const persons = await getPersons();
  const next = persons.filter((p) => p.id !== id);
  await writeJSON("persons.json", next);

  // Bu kişiye bağlı hotspot'ların personId'sini temizle (sahneleri bozmamak için).
  const scenes = await getScenes();
  const nextScenes = scenes.map((s) => ({
    ...s,
    hotspots: s.hotspots.map((h) =>
      h.personId === id ? { ...h, personId: null } : h
    ),
  }));
  await writeJSON("scenes.json", nextScenes);

  return true;
}

/* ---------------------------- SCENES ---------------------------- */

export async function getScenes() {
  return readJSON("scenes.json", []);
}

export async function getSceneById(id) {
  const scenes = await getScenes();
  return scenes.find((s) => s.id === id) || null;
}

export async function createScene(input) {
  const scenes = await getScenes();
  const scene = {
    id: genId("scene"),
    title: input.title || "Adsız Sahne",
    imageUrl: input.imageUrl || "",
    hotspots: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  scenes.push(scene);
  await writeJSON("scenes.json", scenes);
  return scene;
}

export async function updateScene(id, updates) {
  const scenes = await getScenes();
  const idx = scenes.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Sahne bulunamadı.");
  const updated = {
    ...scenes[idx],
    ...updates,
    id: scenes[idx].id,
    updatedAt: nowISO(),
  };
  scenes[idx] = updated;
  await writeJSON("scenes.json", scenes);
  return updated;
}

export async function deleteScene(id) {
  const scenes = await getScenes();
  await writeJSON(
    "scenes.json",
    scenes.filter((s) => s.id !== id)
  );
  return true;
}

/* ---------------------------- HOTSPOTS ---------------------------- */

export async function addHotspot(sceneId, input) {
  const scenes = await getScenes();
  const idx = scenes.findIndex((s) => s.id === sceneId);
  if (idx === -1) throw new Error("Sahne bulunamadı.");

  let points;
  let bounds;
  if (input.shape === "polygon") {
    if (
      !Array.isArray(input.points) ||
      input.points.length < 3 ||
      input.points.some(
        (point) =>
          !Number.isFinite(point?.x) || !Number.isFinite(point?.y)
      )
    ) {
      throw new Error("Poligon için en az 3 geçerli nokta gerekli.");
    }
    points = input.points.map((point) => ({
      x: Math.min(100, Math.max(0, point.x)),
      y: Math.min(100, Math.max(0, point.y)),
    }));
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    bounds = {
      x,
      y,
      width: Math.max(...xs) - x,
      height: Math.max(...ys) - y,
    };
  }

  const hotspot = {
    id: genId("hs"),
    sceneId,
    personId: input.personId || null,
    ...(points ? { shape: "polygon", points, ...bounds } : {
      x: input.x ?? 10,
      y: input.y ?? 10,
      width: input.width ?? 15,
      height: input.height ?? 40,
    }),
    source: input.source || "manual",
  };
  scenes[idx].hotspots.push(hotspot);
  scenes[idx].updatedAt = nowISO();
  await writeJSON("scenes.json", scenes);
  return hotspot;
}

export async function updateHotspot(sceneId, hotspotId, updates) {
  const scenes = await getScenes();
  const sceneIdx = scenes.findIndex((s) => s.id === sceneId);
  if (sceneIdx === -1) throw new Error("Sahne bulunamadı.");
  const hIdx = scenes[sceneIdx].hotspots.findIndex((h) => h.id === hotspotId);
  if (hIdx === -1) throw new Error("Hotspot bulunamadı.");

  scenes[sceneIdx].hotspots[hIdx] = {
    ...scenes[sceneIdx].hotspots[hIdx],
    ...updates,
    id: hotspotId,
    sceneId,
  };
  scenes[sceneIdx].updatedAt = nowISO();
  await writeJSON("scenes.json", scenes);
  return scenes[sceneIdx].hotspots[hIdx];
}

export async function deleteHotspot(sceneId, hotspotId) {
  const scenes = await getScenes();
  const sceneIdx = scenes.findIndex((s) => s.id === sceneId);
  if (sceneIdx === -1) throw new Error("Sahne bulunamadı.");
  scenes[sceneIdx].hotspots = scenes[sceneIdx].hotspots.filter(
    (h) => h.id !== hotspotId
  );
  scenes[sceneIdx].updatedAt = nowISO();
  await writeJSON("scenes.json", scenes);
  return true;
}

/* ---------------------------- ADMIN / AUTH ---------------------------- */

export async function getAdminCredentials() {
  return readJSON("admin.json", { username: "admin", password: "admin" });
}

export async function getSessions() {
  return readJSON("sessions.json", []);
}

export async function saveSessions(sessions) {
  await writeJSON("sessions.json", sessions);
}
