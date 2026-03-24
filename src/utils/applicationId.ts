/**
 * Admin application detail + approve/reject require a MongoDB ObjectId string (24 hex chars).
 * Never interpolate a whole object into a URL — it becomes "[object Object]".
 */

const MONGO_OBJECT_ID_HEX = /^[a-f0-9]{24}$/i;

export function isValidMongoObjectIdString(id: string | null | undefined): boolean {
  return typeof id === "string" && MONGO_OBJECT_ID_HEX.test(id.trim());
}

/**
 * Normalize route params, notification payloads, or API fields to a safe application id string.
 */
export function normalizeApplicationId(raw: unknown): string | null {
  if (raw == null) return null;

  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s || s === "[object Object]") return null;
    return MONGO_OBJECT_ID_HEX.test(s) ? s : null;
  }

  if (typeof raw === "object" && raw !== null) {
    const o = raw as Record<string, unknown>;
    if (typeof o.$oid === "string") return normalizeApplicationId(o.$oid);
    if (o._id != null) return normalizeApplicationId(o._id);
    if (o.id != null && o.id !== raw) return normalizeApplicationId(o.id);
    if (o.applicationId != null) return normalizeApplicationId(o.applicationId);
  }

  return null;
}
