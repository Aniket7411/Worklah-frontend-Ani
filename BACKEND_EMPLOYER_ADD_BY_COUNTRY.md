# Backend: Add/Edit Employer – Multi-Country Validation (After Frontend Checks)

This document describes how the **admin frontend** validates employer data for different countries before sending to the API. The backend should apply the **same rules** so that data accepted by the frontend is never rejected by the API, and so that any other clients (e.g. mobile) can rely on a single contract.

---

## 1. Request format (create & update)

- **Create:** `POST /admin/employers` (multipart/form-data, longer timeout recommended for file uploads).
- **Update:** `PUT /admin/employers/:employerId` (multipart/form-data).

The frontend sends:

1. **`data`** – JSON string containing all employer fields (see §2). Backend must parse this and validate.
2. **Optional files** (same field names for create and update):
   - `companyLogo` (file)
   - `acraBizfileCert` (file)
   - `serviceContract` (file, PDF only on frontend)

All validations below refer to the **parsed `data` object** (and, for update, the same shape with optional `outlets[]._id` for existing outlets).

---

## 2. `data` object shape (after parsing JSON)

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `phoneCountry` | string | Yes (default `"SG"`) | `"IN"` \| `"SG"` \| `"MY"` – used for all phone validations below. |
| `companyLegalName` | string | Yes | Non-empty after trim. |
| `companyNumber` | string \| null | No | ACRA/company registration number. Trimmed; empty string becomes `null`. Must be unique if provided. |
| `hqAddress` | string | Yes | Non-empty after trim. |
| `contactPersonName` | string | Yes | Non-empty after trim. |
| `jobPosition` | string | No | Default `""`. |
| `mainContactNumber` | string | Yes | Validated per `phoneCountry` (see §3). |
| `additionalContacts` | array | No | Each item: `{ extension?: string \| null, number: string }`. Only entries with non-empty `number` are sent. Each `number` is validated per `phoneCountry`. |
| `emailAddress` | string | Yes | Non-empty; must match email regex (see §4). |
| `industry` | string | Yes | From dropdown or custom text when "Others" is selected (see §5). |
| `serviceAgreement` | string | No | Frontend sends `"Active"` by default. |
| `contractExpiryDate` | string \| null | No | If present, must be `YYYY-MM-DD`. |
| `generateCredentials` | boolean | No | Create only; whether to generate and e.g. email login credentials. |
| `outlets` | array | No | If an outlet is partially filled, frontend requires all required outlet fields (see §6). |

---

## 3. Phone validation by country (align with frontend)

The frontend uses `src/utils/phoneValidation.js`. Backend should use the **same rules** (same file or ported logic).

- Input is normalized to **digits only**. Country code is then enforced as prefix when missing (e.g. user types `91234567` with SG → `6591234567`).
- Validation is done **after** normalisation (digits only, with correct country code prefix).

### India (`phoneCountry === "IN"`)

- **Country code:** `91`
- **National part (after 91):** exactly **10 digits**, digits only.
- **Example:** `91 7275061192` → normalised `917275061192`.
- **Reject:** Missing 91 prefix, or national part ≠ 10 digits, or non-digits.

### Singapore (`phoneCountry === "SG"`)

- **Country code:** `65`
- **National part (after 65):** **8 or 10 digits**, digits only.
- **Example:** `65 9123 4567` or user entering 10 digits with +65 selected.
- **Reject:** Missing 65 prefix, or national part length not 8 or 10, or non-digits.

### Malaysia (`phoneCountry === "MY"`)

- **Country code:** `60`
- **National part (after 60):** **10 or 11 digits**, digits only.
- **Example:** `60 12 345 67890`.
- **Reject:** Missing 60 prefix, or national part length not 10 or 11, or non-digits.

### Unknown country

- If `phoneCountry` is not `IN` | `SG` | `MY`, frontend treats it as invalid. Backend should reject with `400` and a clear message (e.g. "phoneCountry must be IN, SG, or MY").

### Where to validate

- `mainContactNumber` – **required** and must pass the rule for `phoneCountry`.
- Each `additionalContacts[].number` – if present (non-empty after trim), must pass the same rule.
- Each outlet `contactNumber` – if the outlet is included and has a contact number, must pass the same rule.

---

## 4. Email validation (frontend rule)

- **Pattern:** non-empty string matching: `^[^\s@]+@[^\s@]+\.[^\s@]+$` (basic email format).
- Backend should return `400` with a clear message if `emailAddress` is missing or does not match.

---

## 5. Industry (frontend behaviour)

- **Required:** non-empty string.
- **Source:** Either a selected value from the dropdown, or (when "Others" is selected) a custom text value.
- **Dropdown values:** `Hospitality`, `IT`, `F&B`, `Hotel`, `Retail`, `Logistics`, `Healthcare`, `Education`, `Construction`, `Others`.
- When "Others" is chosen, the frontend sends the user-typed string in `industry` (e.g. custom industry name). Backend should accept any non-empty string.

---

## 6. Outlets (when provided)

- Outlets are **optional**. If the frontend sends an empty `outlets` array, employer can still be created/updated.
- **If an outlet is sent**, the frontend only includes outlets where **all** of the following are non-empty after trim:
  - `name`
  - `managerName`
  - `contactNumber`
  - `address`
- So backend will only receive outlets that already satisfy these. Backend should still validate:
  - `name`, `managerName`, `contactNumber`, `address` – required and non-empty.
  - `contactNumber` – valid per `phoneCountry` (same rules as §3).
  - Optional: `contactExtension`, `openingHours`, `closingHours`, `isActive` (boolean; default true).
- **Update:** Outlets may include `_id` for existing outlets; omit `_id` for new outlets. Backend uses this to decide create vs update vs delete.

---

## 7. Contract expiry date

- If present, must be **YYYY-MM-DD** (e.g. `2025-12-31`).
- Frontend uses the same format for validation. Backend should reject invalid date format or invalid calendar date with `400`.

---

## 8. Files (optional)

- `companyLogo` – image file (frontend does not restrict type beyond file input).
- `acraBizfileCert` – document (e.g. PDF/image).
- `serviceContract` – **PDF only** on frontend; backend may enforce the same.

---

## 9. Recommended backend response

- **Success (create):** `201` or `200` with `{ success: true, employer?, message?, credentials? }`.
- **Success (update):** `200` with `{ success: true, employer?, message? }`.
- **Validation error:** `400` with `{ success: false, message: "..." }` (and optionally `errors: { field: "message" }`).
- **Conflict (e.g. duplicate company number):** `409` with `{ success: false, message: "..." }`.
- **Server error:** `500` with `{ success: false, message: "..." }`.

---

## 10. Summary: what frontend checks before submit

| Check | Applied to |
|-------|------------|
| `companyLegalName` | Required, non-empty |
| `hqAddress` | Required, non-empty |
| `contactPersonName` | Required, non-empty |
| `mainContactNumber` | Required; validated per `phoneCountry` (IN 10 digits, SG 8 or 10, MY 10 or 11 after code) |
| `additionalContacts[].number` | If present, validated per `phoneCountry` |
| `emailAddress` | Required, valid email format |
| `industry` | Required (dropdown or custom when "Others") |
| `contractExpiryDate` | If present, YYYY-MM-DD |
| Outlets | If any outlet field is filled, all required outlet fields + valid `contactNumber` per `phoneCountry` |
| `serviceContract` file | PDF only |

Backend should enforce the **same rules** so that any request that passes the frontend is accepted by the API when the payload is well-formed, and so that validation errors and HTTP status codes are consistent for all clients (admin, future apps).
