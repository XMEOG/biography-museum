import { NextResponse } from "next/server";
import { getPersonById, updatePerson, deletePerson } from "@/lib/data";
import { requireAuth } from "@/lib/auth";

export async function GET(_request, { params }) {
  const person = await getPersonById(params.id);
  if (!person) {
    return NextResponse.json({ error: "Kişi bulunamadı." }, { status: 404 });
  }
  return NextResponse.json(person);
}

export async function PUT(request, { params }) {
  const authed = await requireAuth(request);
  if (!authed) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  try {
    const updated = await updatePerson(params.id, body);
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
  await deletePerson(params.id);
  return NextResponse.json({ success: true });
}
