import crypto from "crypto";

export const SESSION_COOKIE = "museum_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

function getSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
}

function sign(value) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("hex");
}

export async function verifyCredentials(username, password) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) return false;

  return username === adminUsername && password === adminPassword;
}

export async function createSession() {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${expiresAt}.${nonce}`;
  const signature = sign(payload);

  return `${payload}.${signature}`;
}

export async function isValidSession(token) {
  if (!token || !getSecret()) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [expiresAt, nonce, signature] = parts;
  if (Number(expiresAt) < Date.now()) return false;
  if (!/^[a-f0-9]{64}$/.test(signature)) return false;

  const expected = sign(`${expiresAt}.${nonce}`);

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
}

export async function destroySession() {
  return true;
}

export async function requireAuth(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return isValidSession(token);
}

export async function isAuthenticatedServer() {
  const { cookies } = await import("next/headers");
  const token = cookies().get(SESSION_COOKIE)?.value;
  return isValidSession(token);
}