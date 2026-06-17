const crypto = require("crypto");

/**
 * KeyWrap — encrypt/decrypt the AES file-key under a user passphrase.
 *
 * Rationale: hiding the raw key in an image (steganography) is concealment,
 * not confidentiality. Anyone who obtains the key image can read the key back.
 * By wrapping the key under a passphrase-derived key BEFORE steganography, the
 * key image alone is useless without the passphrase.
 *
 * Format of the wrapped blob (hex string, safe to feed into StegoLogic.hide):
 *   salt(16) | iv(12) | ciphertext | authTag(16)   -> hex
 *
 * KDF: Node's built-in scrypt (no external dependency). Argon2id (via the
 * `argon2` package) is preferable if you're willing to add a dependency;
 * swap deriveKey() accordingly.
 */

const SALT_LEN = 16;
const IV_LEN = 12;
const TAG_LEN = 16;
const KEY_LEN = 32;
// scrypt cost parameters — tune for your hardware (N must be a power of 2).
const SCRYPT_OPTS = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function deriveKey(passphrase, salt) {
  return crypto.scryptSync(passphrase, salt, KEY_LEN, SCRYPT_OPTS);
}

/**
 * Wrap (encrypt) a key string under a passphrase.
 * @param {string} keyHex - the AES file-key, hex-encoded.
 * @param {string} passphrase - user-supplied secret.
 * @returns {string} hex blob to hide in the image.
 */
function wrapKey(keyHex, passphrase) {
  if (!passphrase || typeof passphrase !== "string") {
    throw new Error("A passphrase is required to wrap the key.");
  }
  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(IV_LEN);
  const derived = deriveKey(passphrase, salt);

  const cipher = crypto.createCipheriv("aes-256-gcm", derived, iv);
  const ct = Buffer.concat([
    cipher.update(Buffer.from(keyHex, "utf8")),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, ct, tag]).toString("hex");
}

/**
 * Unwrap (decrypt) a wrapped blob back to the key string.
 * @param {string} wrappedHex - the hex blob extracted from the image.
 * @param {string} passphrase - the same passphrase used to wrap.
 * @returns {string} the original AES file-key, hex-encoded.
 * @throws if the passphrase is wrong or the blob was tampered with (GCM tag fails).
 */
function unwrapKey(wrappedHex, passphrase) {
  if (!passphrase || typeof passphrase !== "string") {
    throw new Error("A passphrase is required to unwrap the key.");
  }
  const blob = Buffer.from(wrappedHex, "hex");
  if (blob.length < SALT_LEN + IV_LEN + TAG_LEN) {
    throw new Error("Wrapped blob is too short / corrupted.");
  }

  const salt = blob.subarray(0, SALT_LEN);
  const iv = blob.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const tag = blob.subarray(blob.length - TAG_LEN);
  const ct = blob.subarray(SALT_LEN + IV_LEN, blob.length - TAG_LEN);

  const derived = deriveKey(passphrase, salt);
  const decipher = crypto.createDecipheriv("aes-256-gcm", derived, iv);
  decipher.setAuthTag(tag);

  const pt = Buffer.concat([decipher.update(ct), decipher.final()]); // throws on wrong passphrase
  return pt.toString("utf8");
}

module.exports = { wrapKey, unwrapKey };
