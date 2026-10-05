/**
 * Accepts only same-site relative paths (e.g. "/he/new-password"), so a link can
 * never redirect the user to another site. Anything else returns `fallback`.
 */
export function safeNextPath(next: string | null | undefined, fallback: string): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")
    ? next
    : fallback;
}
