# Phone number validation – Backend & Native (shared spec)

**Audience:** Backend developers, React Native (mobile) developers, React (admin) developers  
**Purpose:** One set of rules and one shared file so all platforms validate phone numbers the same way.

---

## 1. Rules summary

| Country   | Country code | Mobile digits (after code) | Example           | Notes                    |
|-----------|--------------|----------------------------|-------------------|--------------------------|
| **India** | +91          | **10 digits**              | 91 7275061192     | 10 digits after 91       |
| **Singapore** | +65      | **8 digits**               | 65 9123 4567      | 8 digits after 65        |
| **Malaysia**  | +60      | **10 or 11 digits**        | 60 12 345 67890   | 10 or 11 digits after 60 |

- User can enter with or without `+`, spaces, or dashes; validation uses digits only and expects the **country code to be included** (e.g. 91, 65, 60).
- **Country key** in code: `IN` (India), `SG` (Singapore), `MY` (Malaysia).

---

## 2. Shared file (single source of truth)

**Use the same file in Backend and in Native/Admin.**

- **Admin panel (React):** `src/utils/phoneValidation.js`
- **Backend (Node):** Copy this file to your repo (e.g. `utils/phoneValidation.js`)
- **React Native:** Copy this file into your app (e.g. `utils/phoneValidation.js`)

Full file contents are in **Section 5** below. Copy that block into your project.

---

## 3. For Backend developers

### 3.1 When to validate

- Validate on any API that accepts phone numbers, e.g.:
  - Employer create/update (main contact, alternate, outlet contacts)
  - User register / profile (phone number)
  - Any endpoint that has `phoneNumber`, `mainContactNumber`, `contactNumber`, etc.

### 3.2 Request body (recommended)

Accept **country** so you know which rule to apply:

- `phoneNumber` (or `mainContactNumber`, `contactNumber` – your existing field name)
- `phoneCountry` (optional): `"IN"` | `"SG"` | `"MY"`. Default `"SG"` if omitted.

Example:

```json
{
  "mainContactNumber": "91 7275061192",
  "phoneCountry": "IN"
}
```

### 3.3 Validation in Node

After copying `phoneValidation.js` into your backend:

**ES modules:**

```js
import { validatePhone } from './utils/phoneValidation.js';

const country = req.body.phoneCountry || 'SG';
const result = validatePhone(req.body.mainContactNumber, country);
if (!result.valid) {
  return res.status(400).json({
    success: false,
    message: result.message,
    error: 'ValidationError',
  });
}
// Optional: store normalized for consistency
req.body.mainContactNumber = result.normalized; // e.g. "917275061192"
```

**CommonJS:**  
Add at the **end** of the copied `phoneValidation.js`:

```js
module.exports = { PHONE_RULES, digitsOnly, normalizeForCountry, validatePhone, formatDisplay, getPlaceholder };
```

Then:

```js
const { validatePhone } = require('./utils/phoneValidation');
// Same validation logic as above
```

### 3.4 Response on validation failure

Return **400** with a body that matches your API standard, e.g.:

```json
{
  "success": false,
  "message": "India mobile must be 10 digits after 91. You entered 9.",
  "error": "ValidationError"
}
```

Use the `message` returned by `validatePhone(phone, country)` so Backend and clients show the same text.

---

## 4. For React Native / Mobile developers

### 4.1 Where to validate

- Registration / profile (phone number)
- Any form that collects contact number (employer, outlet, etc.)

### 4.2 Copy the shared file

- Copy `phoneValidation.js` (see Section 5) into your app, e.g. `utils/phoneValidation.js`.

### 4.3 Usage in the app

- **Country:** Let the user pick country (e.g. India / Singapore / Malaysia) or detect from locale; map to `IN` | `SG` | `MY`.
- **Validate before calling API:** Use `validatePhone(phone, countryKey)` and show `result.message` on error.
- **Send to API:** Send the same `phoneNumber` and `phoneCountry` (if your backend accepts it).

Example:

```js
import { validatePhone, getPlaceholder, PHONE_RULES } from '../utils/phoneValidation';

// In your form / screen
const [phone, setPhone] = useState('');
const [country, setCountry] = useState('SG'); // or IN, MY

const handleSubmit = () => {
  const result = validatePhone(phone.trim(), country);
  if (!result.valid) {
    Alert.alert('Invalid number', result.message);
    return;
  }
  // Call API with phone and optionally country
  await api.post('/user/register', {
    phoneNumber: result.normalized || phone,
    phoneCountry: country,
    // ...
  });
};
```

Placeholder / hint:

```js
getPlaceholder(country); // e.g. "91 7275061192" for IN
```

Display formatted number:

```js
formatDisplay(result.normalized, country); // e.g. "+91 72750 61192"
```

### 4.4 Country picker

- Use a picker or dropdown with:
  - **India** → `IN`
  - **Singapore** → `SG`
  - **Malaysia** → `MY`
- Default to `SG` (or your app’s default) if you don’t have locale-based detection.

---

## 5. Full shared file: `phoneValidation.js`

Copy the block below into your project as `phoneValidation.js` (Backend and Native use the **same** file).

```javascript
/**
 * Phone number validation – shared for Backend (Node), React (Admin), React Native (App)
 * Use this file in all codebases to keep rules in sync.
 *
 * Rules:
 * - India (91): 10 digits (e.g. 91 7275061192)
 * - Singapore (65): 8 digits (e.g. 65 9123 4567)
 * - Malaysia (60): 10 or 11 digits (e.g. 60 12 345 67890)
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
    digits: [10, 11],
    example: '60 12 345 67890',
    pattern: /^60\d{10,11}$/,
  },
};

function digitsOnly(phone) {
  if (phone == null || typeof phone !== 'string') return '';
  return phone.replace(/\D/g, '');
}

function normalizeForCountry(digits, countryKey) {
  const rule = PHONE_RULES[countryKey];
  if (!rule) return digits;
  const code = rule.countryCode;
  if (digits.startsWith(code)) return digits;
  if (!digits.startsWith('0')) return code + digits;
  return code + digits.replace(/^0+/, '');
}

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
    const national = normalized.slice(2);
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

function getPlaceholder(countryKey) {
  const rule = PHONE_RULES[countryKey];
  return rule ? rule.example : 'e.g. +65 9123 4567';
}

// ESM (React, React Native, Node with "type": "module")
export {
  PHONE_RULES,
  digitsOnly,
  normalizeForCountry,
  validatePhone,
  formatDisplay,
  getPlaceholder,
};

// CommonJS (Node with require): add this line at the end and use require() in your backend:
// module.exports = { PHONE_RULES, digitsOnly, normalizeForCountry, validatePhone, formatDisplay, getPlaceholder };
```

---

## 6. API reference (shared)

| Function | Use |
|----------|-----|
| `validatePhone(phone, countryKey)` | Validates `phone` for the given country. Returns `{ valid, normalized?, message? }`. |
| `getPlaceholder(countryKey)` | Returns example string for inputs (e.g. `"91 7275061192"` for IN). |
| `formatDisplay(normalizedDigits, countryKey)` | Returns display string (e.g. `"+91 72750 61192"`). |
| `PHONE_RULES` | Object with `IN`, `SG`, `MY` (countryCode, digits, example, pattern). |
| `digitsOnly(phone)` | Returns string of digits only. |
| `normalizeForCountry(digits, countryKey)` | Ensures country code is prefixed; use for consistent storage. |

**Country keys:** `'IN'` (India), `'SG'` (Singapore), `'MY'` (Malaysia).

---

## 7. Checklist

- [ ] **Backend:** Copy `phoneValidation.js` into repo; validate on all endpoints that accept phone; return `400` with `validatePhone(...).message` on failure.
- [ ] **React Native:** Copy `phoneValidation.js` into app; validate before submit; send `phoneNumber` and optionally `phoneCountry`; show `result.message` on error.
- [ ] **Admin (React):** Already uses same file in Add Employer; reuse in other forms (Edit Employer, Create User, etc.) as needed.

---

**Document version:** 1.0  
**Last updated:** February 2026  
**Single source of truth:** `phoneValidation.js` (Section 5) – same file for Backend and Native.
