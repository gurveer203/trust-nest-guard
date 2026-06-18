// SecureCrypt — Web Crypto helpers. All operations run in the browser.
// Keys are never transmitted. AES-256-GCM for symmetric, RSA-PSS for signatures.

const enc = new TextEncoder();
const dec = new TextDecoder();

export function toBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// --- SHA-256 ---
export async function sha256Hex(input: string | ArrayBuffer): Promise<string> {
  const data = typeof input === "string" ? enc.encode(input) : input;
  const hash = await crypto.subtle.digest("SHA-256", data);
  return toHex(hash);
}

// --- AES-256-GCM with PBKDF2-derived key from passphrase ---
async function deriveAesKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 250_000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// Encrypted file format (binary):
// [magic 8 "SCRYPT01"][salt 16][iv 12][ciphertext...]
const MAGIC = enc.encode("SCRYPT01");

export async function encryptFile(file: File, passphrase: string): Promise<Blob> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(passphrase, salt);
  const plaintext = await file.arrayBuffer();
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext),
  );
  const out = new Uint8Array(MAGIC.length + salt.length + iv.length + ct.length);
  out.set(MAGIC, 0);
  out.set(salt, MAGIC.length);
  out.set(iv, MAGIC.length + salt.length);
  out.set(ct, MAGIC.length + salt.length + iv.length);
  return new Blob([out], { type: "application/octet-stream" });
}

export async function decryptFile(file: File, passphrase: string): Promise<Blob> {
  const buf = new Uint8Array(await file.arrayBuffer());
  if (buf.length < MAGIC.length + 16 + 12) throw new Error("File too short to be a SecureCrypt payload");
  for (let i = 0; i < MAGIC.length; i++) {
    if (buf[i] !== MAGIC[i]) throw new Error("Not a SecureCrypt encrypted file (bad magic)");
  }
  const salt = buf.slice(MAGIC.length, MAGIC.length + 16);
  const iv = buf.slice(MAGIC.length + 16, MAGIC.length + 28);
  const ct = buf.slice(MAGIC.length + 28);
  const key = await deriveAesKey(passphrase, salt);
  try {
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return new Blob([pt], { type: "application/octet-stream" });
  } catch {
    throw new Error("Decryption failed — wrong passphrase or corrupted file");
  }
}

// --- RSA-PSS-2048 keys + signatures ---
export async function generateRsaKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  ) as Promise<CryptoKeyPair>;
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const spki = await crypto.subtle.exportKey("spki", key);
  return toBase64(spki);
}

export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", key);
  return toBase64(pkcs8);
}

export async function importPublicKey(b64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "spki",
    fromBase64(b64),
    { name: "RSA-PSS", hash: "SHA-256" },
    true,
    ["verify"],
  );
}

export async function importPrivateKey(b64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "pkcs8",
    fromBase64(b64),
    { name: "RSA-PSS", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export async function signData(privateKey: CryptoKey, data: ArrayBuffer): Promise<string> {
  const sig = await crypto.subtle.sign({ name: "RSA-PSS", saltLength: 32 }, privateKey, data);
  return toBase64(sig);
}

export async function verifySignature(
  publicKey: CryptoKey,
  signatureB64: string,
  data: ArrayBuffer,
): Promise<boolean> {
  return crypto.subtle.verify(
    { name: "RSA-PSS", saltLength: 32 },
    publicKey,
    fromBase64(signatureB64),
    data,
  );
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  const score = Math.min(s, 4) as 0 | 1 | 2 | 3 | 4;
  const label = ["Too weak", "Weak", "Fair", "Strong", "Excellent"][score];
  return { score, label };
}

export { dec };