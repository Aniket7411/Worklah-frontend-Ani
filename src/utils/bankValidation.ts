/**
 * Singapore bank account validation for admin panel and Native App.
 * Singapore account numbers: generally 7–14 digits depending on bank.
 * Major banks: DBS/POSB 9–10, OCBC 10–12, UOB 10, Standard Chartered 10, HSBC up to 12, CIMB 10.
 */

export const SG_BANK_ACCOUNT_RULES: Record<string, { min: number; max: number; label: string }> = {
  DBS: { min: 9, max: 10, label: "DBS/POSB (9–10 digits)" },
  POSB: { min: 9, max: 10, label: "DBS/POSB (9–10 digits)" },
  OCBC: { min: 10, max: 12, label: "OCBC (10–12 digits)" },
  UOB: { min: 10, max: 10, label: "UOB (10 digits)" },
  "Standard Chartered": { min: 10, max: 10, label: "Standard Chartered (10 digits)" },
  SCB: { min: 10, max: 10, label: "Standard Chartered (10 digits)" },
  HSBC: { min: 7, max: 12, label: "HSBC (up to 12 digits)" },
  CIMB: { min: 10, max: 10, label: "CIMB (10 digits)" },
  Other: { min: 7, max: 14, label: "Other (7–14 digits)" },
};

/** Default: allow 7–14 digits for any Singapore bank */
const DEFAULT_MIN = 7;
const DEFAULT_MAX = 14;

/**
 * Validates Singapore bank account number (digits only, length 7–14).
 * Optionally validate against bank-specific length.
 */
export function validateSingaporeAccountNumber(
  value: string,
  bankName?: string
): { valid: boolean; message?: string } {
  const trimmed = (value || "").replace(/\s/g, "");
  if (!trimmed) {
    return { valid: false, message: "Account number is required" };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, message: "Account number must contain only digits" };
  }
  const len = trimmed.length;
  if (bankName) {
    const key = bankName.trim();
    const rule = SG_BANK_ACCOUNT_RULES[key] || SG_BANK_ACCOUNT_RULES["Other"];
    const { min, max, label } = rule;
    if (len < min || len > max) {
      return {
        valid: false,
        message: `${label}. You entered ${len} digit(s).`,
      };
    }
  } else {
    if (len < DEFAULT_MIN || len > DEFAULT_MAX) {
      return {
        valid: false,
        message: `Singapore account numbers are 7–14 digits. You entered ${len} digit(s).`,
      };
    }
  }
  return { valid: true };
}

/** Bank name options for dropdowns (admin / Native App) */
export const SINGAPORE_BANK_OPTIONS = [
  { value: "", label: "Select bank" },
  { value: "DBS", label: "DBS" },
  { value: "POSB", label: "POSB" },
  { value: "OCBC", label: "OCBC" },
  { value: "UOB", label: "UOB" },
  { value: "Standard Chartered", label: "Standard Chartered" },
  { value: "HSBC", label: "HSBC" },
  { value: "CIMB", label: "CIMB" },
  { value: "Other", label: "Other" },
];
