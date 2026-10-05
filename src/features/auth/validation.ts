/** Supabase's minimum is 6; we ask for a bit more. bcrypt ignores bytes past 72. */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;

/** Trims and lowercases; returns null if it doesn't look like an email address. */
export function normalizeEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const email = input.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 ? email : null;
}

/** Returns the password unchanged if its length is acceptable, else null. Never trims. */
export function validatePassword(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const length = new TextEncoder().encode(input).length;
  return length >= PASSWORD_MIN && length <= PASSWORD_MAX ? input : null;
}
