# Phone validation (India, Singapore, Malaysia)

**Shared file:** `phoneValidation.js`  
Use the **same file** in your **Backend (Node)** and **React (Admin/App)** so rules stay in sync.

---

## Rules

| Country   | Code | Mobile digits        | Example        |
|----------|------|----------------------|----------------|
| India    | 91   | 10 digits after 91   | 91 7275061192  |
| Singapore| 65   | 8 digits after 65    | 65 9123 4567   |
| Malaysia | 60   | 10 or 11 after 60    | 60 12 345 67890 |

---

## React (Admin Panel)

```js
import { validatePhone, getPlaceholder, PHONE_RULES } from '@/utils/phoneValidation';

// In your form (e.g. Add Employer / Create User):
const [phoneCountry, setPhoneCountry] = useState('SG'); // or IN, MY

const result = validatePhone(formData.mainContactNumber, phoneCountry);
if (!result.valid) {
  toast.error(result.message);
  return;
}
// Optional: save normalized for API
const toSend = result.normalized; // e.g. "6591234567"

// Placeholder by country
<input placeholder={getPlaceholder(phoneCountry)} />
```

**Country selector:**

```jsx
<select value={phoneCountry} onChange={(e) => setPhoneCountry(e.target.value)}>
  <option value="IN">India (+91)</option>
  <option value="SG">Singapore (+65)</option>
  <option value="MY">Malaysia (+60)</option>
</select>
```

---

## Backend (Node)

1. Copy `src/utils/phoneValidation.js` into your backend (e.g. `utils/phoneValidation.js`).

2. If using **ES modules** (`"type": "module"` in package.json):
   ```js
   import { validatePhone } from './utils/phoneValidation.js';
   const result = validatePhone(req.body.phoneNumber, req.body.phoneCountry || 'SG');
   if (!result.valid) return res.status(400).json({ success: false, message: result.message });
   ```

3. If using **CommonJS** (`require`), add at the **end** of `phoneValidation.js`:
   ```js
   module.exports = { PHONE_RULES, digitsOnly, normalizeForCountry, validatePhone, formatDisplay, getPlaceholder };
   ```
   Then remove the `export { ... }` line (or keep both; Node will use `module.exports`).
   ```js
   const { validatePhone } = require('./utils/phoneValidation');
   ```

---

## API

- **`validatePhone(phone, countryKey)`**  
  `countryKey`: `'IN'` | `'SG'` | `'MY'`  
  Returns `{ valid, normalized?, message? }`.

- **`getPlaceholder(countryKey)`**  
  Returns example string for that country.

- **`formatDisplay(normalizedDigits, countryKey)`**  
  Returns display string (e.g. `+91 72750 61192`).

- **`PHONE_RULES`**  
  Object with `IN`, `SG`, `MY` (countryCode, digits, example, etc.).

- **`digitsOnly(phone)`**  
  Strips to digits only.

- **`normalizeForCountry(digits, countryKey)`**  
  Ensures country code is prefixed for validation.
