const crypto = require("crypto");

// Tham số scrypt tương thích Werkzeug (Python generate_password_hash)
const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 64;
const SALT_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateSalt(length = 16) {
  const bytes = crypto.randomBytes(length);
  let salt = "";
  for (let i = 0; i < length; i += 1) {
    salt += SALT_CHARS[bytes[i] % SALT_CHARS.length];
  }
  return salt;
}

function hashPassword(password) {
  const salt = generateSalt(16);
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      SCRYPT_KEYLEN,
      {
        N: SCRYPT_N,
        r: SCRYPT_R,
        p: SCRYPT_P,
        maxmem: 132 * SCRYPT_N * SCRYPT_R * SCRYPT_P,
      },
      (err, derivedKey) => {
        if (err) return reject(err);
        return resolve(
          `scrypt:${SCRYPT_N}:${SCRYPT_R}:${SCRYPT_P}$${salt}$${derivedKey.toString("hex")}`,
        );
      },
    );
  });
}

function safeCompareHex(computedHex, expectedHex) {
  try {
    const bufA = Buffer.from(computedHex, "utf8");
    const bufB = Buffer.from(expectedHex, "utf8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

async function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string") return false;
  const parts = storedHash.split("$");
  if (parts.length < 3) return false;

  const [methodSpec, salt, expectedHash] = parts;
  const methodParts = methodSpec.split(":");
  const method = methodParts[0].toLowerCase();

  if (method === "scrypt") {
    const N = Number(methodParts[1]) || 32768;
    const r = Number(methodParts[2]) || 8;
    const p = Number(methodParts[3]) || 1;
    const keylen = Buffer.from(expectedHash, "hex").length || 64;

    return new Promise((resolve) => {
      crypto.scrypt(
        password,
        salt,
        keylen,
        {
          N,
          r,
          p,
          maxmem: 132 * N * r * p,
        },
        (err, derivedKey) => {
          if (err) return resolve(false);
          return resolve(safeCompareHex(derivedKey.toString("hex"), expectedHash));
        },
      );
    });
  }

  if (method === "pbkdf2") {
    const digest = methodParts[1] || "sha256";
    const iterations = Number(methodParts[2]) || 260000;
    const keylen = Buffer.from(expectedHash, "hex").length || 32;

    return new Promise((resolve) => {
      crypto.pbkdf2(
        password,
        salt,
        iterations,
        keylen,
        digest,
        (err, derivedKey) => {
          if (err) return resolve(false);
          return resolve(safeCompareHex(derivedKey.toString("hex"), expectedHash));
        },
      );
    });
  }

  return false;
}

module.exports = {
  hashPassword,
  verifyPassword,
};
