import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"];
const MAX_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(request) {
  const authed = await requireAuth(request);
  if (!authed) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const kind = formData?.get("kind") || "image"; // "image" | "audio"

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }

  const allowed = kind === "audio" ? ALLOWED_AUDIO_TYPES : ALLOWED_TYPES;
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: `Desteklenmeyen dosya türü: ${file.type}` },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Dosya boyutu çok büyük (maksimum 15MB)." },
      { status: 400 }
    );
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const ext = (file.name?.split(".").pop() || "bin").toLowerCase();
  const safeName = `${kind}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(path.join(UPLOAD_DIR, safeName), Buffer.from(arrayBuffer));

  return NextResponse.json({ url: `/uploads/${safeName}` }, { status: 201 });
}
