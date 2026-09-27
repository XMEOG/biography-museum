import { NextResponse } from "next/server";
import { updateHotspot, deleteHotspot } from "@/lib/data";
import { requireAuth } from "@/lib/auth";

export async function PUT(request, { params }) {
  const authed = await requireAuth(request);
  if (!authed) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  try {
    const updated = await updateHotspot(params.id, params.hotspotId, body);
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
  await deleteHotspot(params.id, params.hotspotId);
  return NextResponse.json({ success: true });
}
