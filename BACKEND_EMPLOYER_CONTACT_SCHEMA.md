# Backend: Employer Contact Schema Update

This document describes the employer contact fields change requested by the admin frontend. **Update the backend schema and API to match.**

---

## 1. Summary of changes

| Change | Description |
|--------|-------------|
| **Remove** | `mainContactExtension`, `alternateContactNumber`, `alternateContactExtension` |
| **Remove** | `accountManager` (field and any “Account Manager” assignment flow in admin UI) |
| **Add** | `additionalContacts` – array of `{ extension?, number }` for extra phone numbers |
| **Keep** | `phoneCountry` (SG / MY / IN), `mainContactNumber` (required) |

The admin panel now sends **Location (Country)** first; contact number inputs (including placeholders/validation) are driven by that country. Only one primary contact number is required; all other numbers are added via **“Add number”** (each with optional extension + number).

---

## 2. Employer schema (suggested)

### Fields to remove from Employer model / DTOs

- `mainContactExtension`
- `alternateContactNumber`
- `alternateContactExtension`
- `accountManager`

### New field

- **`additionalContacts`** (array), each item:
  - `extension` (optional string, can be `null`)
  - `number` (required string)

Example in JSON:

```json
{
  "phoneCountry": "SG",
  "mainContactNumber": "+6591234567",
  "additionalContacts": [
    { "extension": "101", "number": "+6598765432" },
    { "extension": null, "number": "+6561112233" }
  ]
}
```

Validation rules (align with frontend):

- `mainContactNumber`: required; validate format per `phoneCountry` (e.g. SG/MY/IN).
- `additionalContacts`: optional array; for each item with a non-empty `number`, validate format per `phoneCountry`; `extension` is optional.

---

## 3. API contract

### 3.1 Create employer – `POST /api/admin/employers`

**Request body (e.g. multipart with `data` JSON or equivalent):**

- **Include:** `phoneCountry`, `mainContactNumber`, `additionalContacts` (array as above).
- **Do not require or persist:** `mainContactExtension`, `alternateContactNumber`, `alternateContactExtension`, `accountManager`.

If the backend currently accepts the old fields, you can either:

- Ignore them and only persist `mainContactNumber` + `additionalContacts`, or  
- Support them temporarily for backward compatibility and document deprecation.

### 3.2 Update employer – `PUT /api/admin/employers/:id`

- Same as above: accept and persist `additionalContacts`; stop requiring/using `mainContactExtension`, `alternateContactNumber`, `alternateContactExtension`, and `accountManager`.

### 3.3 Get employer – `GET /api/admin/employers/:id` (and list if applicable)

**Response (employer object):**

- **Include:** `phoneCountry`, `mainContactNumber`, `additionalContacts` (array of `{ extension, number }`).
- **Omit or deprecate:** `mainContactExtension`, `alternateContactNumber`, `alternateContactExtension`, `accountManager`.

So the frontend can rely on a single shape: one main number + an array of additional numbers with optional extension.

---

## 4. Migration (if you already store the old fields)

1. **Optional one-time migration:** For existing employers, you could:
   - Map `alternateContactNumber` (+ optional `alternateContactExtension`) into the first entry of `additionalContacts`.
   - Then stop reading/writing the old fields.
2. **New employers:** Only use `mainContactNumber` + `additionalContacts` (no `mainContactExtension`, `alternateContactNumber`, `alternateContactExtension`, `accountManager`).

---

## 5. Checklist for backend

- [ ] Employer model/schema: remove `mainContactExtension`, `alternateContactNumber`, `alternateContactExtension`, `accountManager`.
- [ ] Employer model/schema: add `additionalContacts` (array of `{ extension?, number }`).
- [ ] Create/update employer APIs: accept and validate `additionalContacts`; validate each `number` by `phoneCountry`.
- [ ] GET employer (single/list): return `additionalContacts`; do not return or depend on the removed fields.
- [ ] If applicable: run a one-time migration from old alternate fields to `additionalContacts`.
- [ ] Remove any “Account Manager” assignment logic or UI that wrote/read `accountManager` on the employer.

Once these are done, the admin frontend (Add Employer / Edit Employer) and backend will be aligned.
