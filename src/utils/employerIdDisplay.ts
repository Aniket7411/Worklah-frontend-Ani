/**
 * Employer public identifiers should be globally unique (MongoDB ObjectId or UUID),
 * not sequential human numbers (e.g. EMP-001, 004).
 *
 * Canonical API value: prefer `employer._id` (ObjectId), then `employer.employerId`, then `employer.id`.
 */

/** Value to send to GET/PUT/DELETE `/admin/employers/:id` */
export function getCanonicalEmployerApiId(employer: {
  _id?: string;
  employerId?: string;
  id?: string;
}): string {
  const a = employer._id || employer.employerId || employer.id;
  return typeof a === "string" ? a : String(a ?? "");
}

/**
 * Compact label for tables/cards (full id in `title` / tooltip).
 * - 24-char hex (ObjectId): `abcdef12…9abc`
 * - UUID: `550e8400…`
 * - Legacy `EMP-xxxx`: show as-is until backend migrates
 */
export function formatEmployerIdShort(full: string | null | undefined): string {
  const s = (full || "").trim();
  if (!s) return "—";
  if (/^[a-f0-9]{24}$/i.test(s)) {
    return `${s.slice(0, 8)}…${s.slice(-4)}`;
  }
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) {
    return `${s.slice(0, 8)}…${s.slice(-4)}`;
  }
  if (s.length > 20) return `${s.slice(0, 10)}…${s.slice(-4)}`;
  return s;
}
