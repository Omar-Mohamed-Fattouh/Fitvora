import crypto from "node:crypto";

function encodeJson(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function parseExpiresIn(expiresIn = "7d") {
  if (typeof expiresIn === "number") return expiresIn;
  const match = String(expiresIn).match(/^(\d+)([smhd])$/);
  if (!match) return 60 * 60 * 24 * 7;
  const amount = Number(match[1]);
  const unit = match[2];
  if (unit === "s") return amount;
  if (unit === "m") return amount * 60;
  if (unit === "h") return amount * 3600;
  return amount * 86400;
}

export function signJwt(payload, secret, { expiresIn = "7d" } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const data = `${encodeJson({ alg: "HS256", typ: "JWT" })}.${encodeJson({
    ...payload,
    iat: now,
    exp: now + parseExpiresIn(expiresIn),
  })}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifyJwt(token, secret) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("invalid token");

  const [header, body, signature] = parts;
  const data = `${header}.${body}`;
  const expected = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !crypto.timingSafeEqual(given, wanted)) {
    throw new Error("invalid token");
  }

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("expired token");
  }
  return payload;
}

export function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function expiryDate(minutes = 60) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
