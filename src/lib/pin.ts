import { cookies } from "next/headers";

// --- Configuration ---------------------------------------------------------
// Change these by setting APP_PIN / ADMIN_PIN in your environment (Vercel
// project settings), or just edit the fallback values below before you
// deploy. The admin PIN also grants normal (member) access.
export const MEMBER_PIN = process.env.APP_PIN || "2600";
export const ADMIN_PIN = process.env.ADMIN_PIN || "4444";

// Used to sign the session cookie so people can't just set
// `mrb_session=admin` in devtools. Set SESSION_SECRET in your environment
// for a truly private value; the fallback is fine for a low-stakes internal
// tool but you can override it.
const SESSION_SECRET = process.env.SESSION_SECRET || "meeting-rooms-default-secret";

const COOKIE_NAME = "mrb_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type Role = "member" | "admin";

// Uses the Web Crypto API (global `crypto`, not Node's `crypto` module) so
// this works in both the Node.js runtime (Server Actions/Components) and
// the Edge runtime (middleware).
let keyPromise: Promise<CryptoKey> | null = null;
function getKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    keyPromise = crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }
  return keyPromise;
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array | null {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function sign(payload: string): Promise<string> {
  const key = await getKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toHex(signature);
}

async function verify(payload: string, signatureHex: string): Promise<boolean> {
  const signatureBytes = hexToBytes(signatureHex);
  if (!signatureBytes) return false;
  const key = await getKey();
  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes as BufferSource,
    new TextEncoder().encode(payload)
  );
}

export async function createSessionValue(role: Role): Promise<string> {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${role}.${expires}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionValue(
  value: string | undefined | null
): Promise<Role | null> {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [role, expiresStr, signature] = parts;
  if (role !== "member" && role !== "admin") return null;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;

  const ok = await verify(`${role}.${expiresStr}`, signature);
  return ok ? role : null;
}

export function pinToRole(pin: string): Role | null {
  if (pin === ADMIN_PIN) return "admin";
  if (pin === MEMBER_PIN) return "member";
  return null;
}

// Read the current visitor's role from their session cookie. Use inside
// Server Components / Server Actions.
export async function getRole(): Promise<Role | null> {
  const store = await cookies();
  return verifySessionValue(store.get(COOKIE_NAME)?.value);
}

export const SESSION_COOKIE = {
  name: COOKIE_NAME,
  maxAgeSeconds: MAX_AGE_SECONDS,
};
