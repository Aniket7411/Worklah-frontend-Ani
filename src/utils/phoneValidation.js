/**
 * Phone number validation – shared for Backend (Node) and React (Admin / App)
 * Use this file in both codebases to keep rules in sync.
 *
 * Rules:
 * - India (91): 10 digits (e.g. 91 7275061192)
 * - Singapore: 8 digits (mobile)
 * - Malaysia: 10 or 11 digits (mobile)
 */

const PHONE_RULES = {
  IN: {
    countryCode: '91',
    countryName: 'India',
    digits: 10,
    example: '91 7275061192',
    pattern: /^91\d{10}$/,
  },
  SG: {
    countryCode: '65',
    countryName: 'Singapore',
    digits: 8,
    example: '65 9123 4567',
    pattern: /^65\d{8}$/,
  },
  MY: {
    countryCode: '60',
    countryName: 'Malaysia',
    digits: [10, 11], // 10 or 11 digits after 60
    example: '60 12 345 67890',
    pattern: /^60\d{10,11}$/,
  },
};

/**
 * Strip phone to digits only (optionally keep leading + for country code).
 * Returns string of digits only.
 */
function digitsOnly(phone) {
  if (phone == null || typeof phone !== 'string') return '';
  return phone.replace(/\D/g, '');
}

/**
 * Normalize input: strip to digits, then ensure country code is present for validation.
 * If user typed "7275061192" and country is IN, we get "917275061192".
 */
function normalizeForCountry(digits, countryKey) {
  const rule = PHONE_RULES[countryKey];
  if (!rule) return digits;

  const code = rule.countryCode;
  if (digits.startsWith(code)) return digits;
  if (!digits.startsWith('0')) return code + digits;
  return code + digits.replace(/^0+/, '');
}

/**
 * Validate phone number for a given country.
 *
 * @param {string} phone - Raw input (e.g. "91 7275061192", "+65 91234567")
 * @param {string} countryKey - 'IN' | 'SG' | 'MY'
 * @returns {{ valid: boolean, normalized?: string, message?: string }}
 */
function validatePhone(phone, countryKey = 'SG') {
  const rule = PHONE_RULES[countryKey];
  if (!rule) {
    return { valid: false, message: `Unknown country: ${countryKey}. Use IN, SG, or MY.` };
  }

  const raw = digitsOnly(phone);
  if (raw.length === 0) {
    return { valid: false, message: 'Phone number is required.' };
  }

  const normalized = normalizeForCountry(raw, countryKey);

  if (countryKey === 'IN') {
    if (!normalized.startsWith('91')) {
      return { valid: false, message: 'India numbers must include country code 91 (e.g. 91 7275061192).' };
    }
    const national = normalized.slice(2);
    if (national.length !== rule.digits) {
      return { valid: false, message: `India mobile must be 10 digits after 91. You entered ${national.length}.` };
    }
    if (!/^\d{10}$/.test(national)) {
      return { valid: false, message: 'India mobile should contain only digits.' };
    }
    return { valid: true, normalized: normalized };
  }

  if (countryKey === 'SG') {
    if (!normalized.startsWith('65')) {
      return { valid: false, message: 'Singapore numbers must include country code 65 (e.g. 65 91234567).' };
    }
    const national = normalized.slice(2);
    if (national.length !== rule.digits) {
      return { valid: false, message: `Singapore mobile must be 8 digits. You entered ${national.length}.` };
    }
    if (!/^\d{8}$/.test(national)) {
      return { valid: false, message: 'Singapore mobile should contain only digits.' };
    }
    return { valid: true, normalized: normalized };
  }

  if (countryKey === 'MY') {
    if (!normalized.startsWith('60')) {
      return { valid: false, message: 'Malaysia numbers must include country code 60.' };
    }
    const national = normalized.slice(2); // after 60
    const len = national.length;
    if (len !== 10 && len !== 11) {
      return { valid: false, message: `Malaysia mobile must be 10 or 11 digits after 60. You entered ${len}.` };
    }
    if (!/^\d{10,11}$/.test(national)) {
      return { valid: false, message: 'Malaysia mobile should contain only digits.' };
    }
    return { valid: true, normalized: normalized };
  }

  return { valid: false, message: 'Invalid country.' };
}

/**
 * Format normalized digits for display (e.g. +91 72750 61192).
 */
function formatDisplay(normalizedDigits, countryKey) {
  if (!normalizedDigits || !countryKey) return normalizedDigits || '';
  const rule = PHONE_RULES[countryKey];
  if (!rule) return normalizedDigits;

  const d = digitsOnly(normalizedDigits);
  if (countryKey === 'IN' && d.startsWith('91') && d.length === 12) {
    return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  }
  if (countryKey === 'SG' && d.startsWith('65') && d.length === 10) {
    return `+65 ${d.slice(2)}`;
  }
  if (countryKey === 'MY' && d.startsWith('60')) {
    return `+60 ${d.slice(2)}`;
  }
  return d ? `+${d}` : '';
}

/**
 * Get placeholder for input by country.
 */
function getPlaceholder(countryKey) {
  const rule = PHONE_RULES[countryKey];
  return rule ? rule.example : 'e.g. +65 9123 4567';
}

// ESM export (React / Vite / Node with "type": "module")
export {
  PHONE_RULES,
  digitsOnly,
  normalizeForCountry,
  validatePhone,
  formatDisplay,
  getPlaceholder,
};

// For Node (CommonJS): if your backend uses require(), add this at the end of the file:
// module.exports = { PHONE_RULES, digitsOnly, normalizeForCountry, validatePhone, formatDisplay, getPlaceholder };
