/**
 * Normalize job payloads from list/detail APIs where employer/outlet may be
 * strings (ObjectIds), populated objects, or flat fields (employerName, outletAddress).
 */

export type JobLike = Record<string, unknown> | null | undefined;

function isPopulatedObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Human-readable employer label for admin UI */
export function getJobEmployerLabel(job: JobLike): string {
  if (!job) return "—";
  const name = job.employerName;
  if (typeof name === "string" && name.trim()) return name.trim();

  const emp = job.employer;
  if (isPopulatedObject(emp)) {
    const n =
      (typeof emp.companyLegalName === "string" && emp.companyLegalName) ||
      (typeof emp.name === "string" && emp.name) ||
      "";
    if (n.trim()) return n.trim();
  }

  const company = job.company;
  if (typeof company === "string" && company.length > 12) return "—"; // likely ObjectId only
  if (typeof company === "string" && company.trim()) return company.trim();

  return "—";
}

/** Outlet name (not full address) */
export function getJobOutletName(job: JobLike): string {
  if (!job) return "—";
  const outlet = job.outlet;
  if (typeof outlet === "string") {
    // Raw id — try barcodes / qrCodes for display name
    const fromBar = firstBarcodeOutletName(job);
    if (fromBar) return fromBar;
    return "—";
  }
  if (isPopulatedObject(outlet)) {
    const n =
      (typeof outlet.name === "string" && outlet.name) ||
      (typeof outlet.outletName === "string" && outlet.outletName) ||
      "";
    if (n.trim()) return n.trim();
  }
  const fromBar = firstBarcodeOutletName(job);
  if (fromBar) return fromBar;
  return "—";
}

function firstBarcodeOutletName(job: JobLike): string | null {
  if (!job) return null;
  const barcodes = job.barcodes;
  const qrCodes = job.qrCodes;
  if (Array.isArray(barcodes) && barcodes[0] && isPopulatedObject(barcodes[0])) {
    const n = barcodes[0].outletName;
    if (typeof n === "string" && n.trim()) return n.trim();
  }
  if (Array.isArray(qrCodes) && qrCodes[0] && isPopulatedObject(qrCodes[0])) {
    const n = qrCodes[0].outletName;
    if (typeof n === "string" && n.trim()) return n.trim();
  }
  return null;
}

/** Work site / outlet address line for admin */
export function getJobWorkLocationLine(job: JobLike): string {
  if (!job) return "—";
  const parts: string[] = [];
  const outlet = job.outlet;
  if (isPopulatedObject(outlet)) {
    const addr = outlet.address || outlet.outletAddress;
    if (typeof addr === "string" && addr.trim()) parts.push(addr.trim());
  }
  const oa = job.outletAddress;
  if (typeof oa === "string" && oa.trim()) parts.push(oa.trim());
  const loc = job.locationDetails || job.location || job.shortAddress;
  if (typeof loc === "string" && loc.trim()) parts.push(loc.trim());

  const uniq = [...new Set(parts.filter(Boolean))];
  return uniq.length ? uniq.join(" · ") : "—";
}

/** Display job code shown to workers (e.g. JOB-0003) */
export function getJobDisplayCode(job: JobLike): string | null {
  if (!job) return null;
  const jid = job.jobId;
  if (typeof jid === "string" && /^(JOB|job)-/i.test(jid.trim())) return jid.trim().toUpperCase();

  const barcodes = job.barcodes;
  if (Array.isArray(barcodes) && barcodes[0] && isPopulatedObject(barcodes[0])) {
    const b = barcodes[0].barcode;
    if (typeof b === "string" && b.trim()) return b.trim().toUpperCase();
  }
  const qrCodes = job.qrCodes;
  if (Array.isArray(qrCodes) && qrCodes[0] && isPopulatedObject(qrCodes[0])) {
    const b = qrCodes[0].barcode;
    if (typeof b === "string" && b.trim()) return b.trim().toUpperCase();
  }
  if (typeof jid === "string" && jid.trim()) return jid.trim();
  return null;
}

/** Barcode / scan value for clock-in (often same as JOB-xxx) */
export function getJobClockInBarcode(job: JobLike): string | null {
  if (!job) return null;
  const barcodes = job.barcodes;
  if (Array.isArray(barcodes) && barcodes[0] && isPopulatedObject(barcodes[0])) {
    const b = barcodes[0].barcode;
    if (typeof b === "string" && b.trim()) return b.trim();
  }
  const qrCodes = job.qrCodes;
  if (Array.isArray(qrCodes) && qrCodes[0] && isPopulatedObject(qrCodes[0])) {
    const b = qrCodes[0].barcode;
    if (typeof b === "string" && b.trim()) return b.trim();
  }
  return getJobDisplayCode(job);
}
