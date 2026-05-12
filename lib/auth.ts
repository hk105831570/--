import { createHash } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_token";

export function getExpectedToken(): string {
  const pw = process.env.ADMIN_PASSWORD || "";
  return createHash("sha256").update(pw).digest("hex");
}

export function getCookieName(): string {
  return COOKIE_NAME;
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return token === getExpectedToken();
}
