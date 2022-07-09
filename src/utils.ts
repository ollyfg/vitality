import crypto from "crypto";

/** Encrypt a string with the KEY env var */
export function encrypt(plaintext: string) {
  const key = process.env.KEY;
  if (!key) {
    throw Error("MissingEncryptionKey");
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(plaintext);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

/** Decrypt a string with the KEY env var */
export function decrypt(ciphertext: string) {
  const key = process.env.KEY;
  if (!key) {
    throw Error("MissingEncryptionKey");
  }
  const [iv, encrypted] = ciphertext
    .split(":")
    .map((x) => Buffer.from(x, "hex"));
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encrypted);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}
