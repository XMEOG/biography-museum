import crypto from "crypto";
import { getSessions, saveSessions } from "./data";

export const SESSION_COOKIE = "museum_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 saat

export async function verifyCredentials(username, password) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return false;
  }

  return username === adminUsername && password === adminPassword;
}

export async function createSession() {
  const token = crypto.randomBytes(24).toString("hex");
  const sessions = await getSessions();
  const active = sessions.filter((s) => s.expiresAt > Date.now());

  active.push({
    token,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });

  await saveSessions(active);
  return token;
}

export async function isValidSession(token) {
  if (!token) return false;

  const sessions = await getSessions();
  const session = sessions.find((s) => s.token === token);

  if (!session) return false;
  if (session.expiresAt < Date.now()) return false;

  return true;
}

export async function destroySession(token) {
  const sessions = await getSessions();
  await saveSessions(sessions.filter((s) => s.token !== token));
}

/**
 * API route handler'larında yazma işlemlerini korur.
 */
export async function requireAuth(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return isValidSession(token);
}

/**
 * Sunucu bileşenlerinde oturum kontrolü yapar.
 */
export async function isAuthenticatedServer() {
  const { cookies } = await import("next/headers");
  const token = cookies().get(SESSION_COOKIE)?.value;
  return isValidSession(token);
}
