import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ENCRYPTION_SECRET = process.env.GEMINI_KEY_ENCRYPTION_SECRET;
const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  if (!ENCRYPTION_SECRET?.trim()) {
    throw new Error("Missing GEMINI_KEY_ENCRYPTION_SECRET environment variable.");
  }

  // Normalize arbitrary-length secret input into a stable 32-byte key.
  return createHash("sha256").update(ENCRYPTION_SECRET).digest();
}

export function encryptValue(plainText: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(":");
}

export function decryptValue(payload: string) {
  const [ivBase64, tagBase64, encryptedBase64] = payload.split(":");

  if (!ivBase64 || !tagBase64 || !encryptedBase64) {
    throw new Error("Invalid encrypted payload format.");
  }

  const iv = Buffer.from(ivBase64, "base64");
  const tag = Buffer.from(tagBase64, "base64");
  const encrypted = Buffer.from(encryptedBase64, "base64");

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function maskApiKey(value: string) {
  if (value.length <= 8) {
    return "*".repeat(Math.max(4, value.length));
  }

  return `${value.slice(0, 4)}${"*".repeat(value.length - 8)}${value.slice(-4)}`;
}
