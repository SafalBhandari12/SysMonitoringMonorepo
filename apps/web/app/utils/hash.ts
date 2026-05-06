import crypto from "crypto";

export function hashKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export function verifyKey(rawKey: string, hashedKey: string): boolean {
  const hashedRawKey = hashKey(rawKey);
  return hashedRawKey === hashedKey;
}

export function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}
