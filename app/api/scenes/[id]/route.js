import { NextResponse } from "next/server";
import { getSceneById, updateScene, deleteScene } from "@/lib/data";
import { requireAuth } from "@/lib/auth";

export async function GET(_request, { params }) {
  const scene = await getSceneById(params.id);
  if (!scene) {
    return NextResponse.json({ error: "Sahne bulunamadı." }, { status: 404 });
  }
  return NextResponse.json(scene);
}

export async function PUT(request, { params }) {
  const authed = await requireAuth(request);
  if (!authed) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  try {
    const updated = await updateScene(params.id, body);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const authed = await requireAuth(request);
  if (!authed) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  await deleteScene(params.id);
  return NextResponse.json({ success: true });
}
