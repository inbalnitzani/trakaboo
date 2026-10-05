export const OTP_LENGTH = 6;

/** Trims and lowercases; returns null if it doesn't look like an email address. */
export function normalizeEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const email = input.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 ? email : null;
}

/** Keeps digits only (codes are often pasted with spaces); null unless it's exactly 6 digits. */
export function normalizeOtp(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const code = input.replace(/\D/g, "");
  return code.length === OTP_LENGTH ? code : null;
}
