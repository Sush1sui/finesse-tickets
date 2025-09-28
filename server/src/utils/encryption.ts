import "dotenv/config";
import crypto from "crypto";

const ALGO = "aes-256-gcm";
const KEY_HEX = process.env.ENCRYPTION_KEY || "";
if (!KEY_HEX || KEY_HEX.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be a 64-char hex string (32 bytes)");
}
const KEY = Buffer.from(KEY_HEX, "hex");

export function encryptText(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}.${encrypted.toString("hex")}.${tag.toString(
    "hex"
  )}`;
}

export function decryptText(cipherText: string): string {
  const parts = cipherText.split(".");
  if (parts.length !== 3) throw new Error("invalid cipher text format");
  const iv = Buffer.from(parts[0], "hex");
  const data = Buffer.from(parts[1], "hex");
  const tag = Buffer.from(parts[2], "hex");
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8"
  );
}
