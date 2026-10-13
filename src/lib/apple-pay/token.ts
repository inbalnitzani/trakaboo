import { createHash, randomBytes } from "node:crypto";

/** Prefix that makes the token recognizable (e.g. in a secret scanner or a leaked log). */
const PREFIX = "trk_";

/** A new random ingest token (256 bits). Shown to the user once; only its hash is stored. */
export function generateIngestToken(): string {
  return PREFIX + randomBytes(32).toString("base64url");
}

/** SHA-256 hex of the token. Must match `sha256(convert_to(token, 'UTF8'))` in the database. */
export function hashIngestToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** The token from an `Authorization: Bearer <token>` header, or null. */
export function readBearerToken(header: string | null): string | null {
  const match = /^Bearer\s+(\S+)\s*$/i.exec(header ?? "");
  return match ? match[1] : null;
}
