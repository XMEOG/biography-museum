import { NextResponse } from "next/server";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";

export async function GET(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = await isValidSession(token);
  return NextResponse.json({ authenticated: valid });
}
