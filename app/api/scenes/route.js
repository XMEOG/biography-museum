import { NextResponse } from "next/server";
import { getScenes, createScene } from "@/lib/data";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const scenes = await getScenes();
  return NextResponse.json(scenes);
}

export async function POST(request) {
  const authed = await requireAuth(request);
  if (!authed) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  if (!body.imageUrl) {
    return NextResponse.json(
      { error: "Sahne için bir görsel gerekli." },
      { status: 400 }
    );
  }
  const scene = await createScene(body);
  return NextResponse.json(scene, { status: 201 });
}
