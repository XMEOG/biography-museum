import { NextResponse } from "next/server";
import { addHotspot } from "@/lib/data";
import { requireAuth } from "@/lib/auth";

export async function POST(request, { params }) {
  const authed = await requireAuth(request);
  if (!authed) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  try {
    const hotspot = await addHotspot(params.id, body);
    return NextResponse.json(hotspot, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
