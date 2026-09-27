import { NextResponse } from "next/server";
import { getPersons, createPerson } from "@/lib/data";
import { requireAuth } from "@/lib/auth";

// Kullanıcı arayüzü de bu listeyi (isim/özet göstermek için) okuyabildiğinden GET herkese açık.
export async function GET() {
  const persons = await getPersons();
  return NextResponse.json(persons);
}

// Yeni kişi oluşturmak yalnızca admin oturumu ile mümkün.
export async function POST(request) {
  const authed = await requireAuth(request);
  if (!authed) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  if (!body.name || !body.biography) {
    return NextResponse.json(
      { error: "Ad ve biyografi metni zorunludur." },
      { status: 400 }
    );
  }
  try {
    const person = await createPerson(body);
    return NextResponse.json(person, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
