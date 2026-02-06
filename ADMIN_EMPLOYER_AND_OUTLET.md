# Admin: Employer & Outlet Management (ReactJS)

**Audience:** Frontend (React) developers  
**Purpose:** Add/edit employer and outlets with correct location-based contact validation, full edit prefill, and proper API error handling.

---

## 1. Location first (Malaysia / Singapore / India)

When adding or editing an employer, **ask for location (country) first**. This drives how contact numbers and extensions are validated and displayed.

- **Location field:** `phoneCountry`  
  - Values: `"SG"` (Singapore), `"MY"` (Malaysia), `"IN"` (India)  
  - **Required** when creating an employer (default to `"SG"` if not provided).  
  - When editing, the API returns the stored `phoneCountry`; pre-fill the dropdown and send it back on save so validation is consistent.

**Why:**  
- Singapore: 8 digits after +65 (e.g. 65 9123 4567).  
- Malaysia: 10 or 11 digits after +60 (e.g. 60 12 345 67890).  
- India: 10 digits after +91.  
Without `phoneCountry`, the backend may infer from digits; sending it avoids wrong validation and keeps number + extension clear.

---

## 2. Contact details: number + extension

- **Main contact:** `mainContactNumber` (required), `mainContactExtension` (optional).  
- **Alternate contact:** `alternateContactNumber` (optional), `alternateContactExtension` (optional).  
- **Per outlet:** `contactNumber` (required), `contactExtension` (optional).

Validation applies to the **number** only (with country code). Store and display **extension** separately so users can keep e.g. "65 6123 4567" + "Ext. 101" without mixing them.

**UI suggestion:**  
- One input for phone number (validated per `phoneCountry`).  
- Optional input for extension (free text or digits).  
- Show placeholder per country (e.g. Singapore: "+65 9123 4567", Malaysia: "+60 12 345 67890").

---

## 3. Edit employer: load full details first

Before showing the edit form, **fetch the employer** so the admin sees exactly what was added earlier and can change only what they need.

**Endpoint:** `GET /api/admin/employers/:id`  
- `:id` = MongoDB `_id` or `employerId` (e.g. `EMP-0001`).

**Success response (200)** includes the full employer and outlets so you can pre-fill the form:

```json
{
  "success": true,
  "employer": {
    "_id": "...",
    "employerId": "EMP-0001",
    "companyLegalName": "ABC Pte Ltd",
    "hqAddress": "123 Main St, Singapore",
    "companyNumber": "ACRA123",
    "companyEmail": "contact@abc.com",
    "emailAddress": "contact@abc.com",
    "mainContactPersonName": "John Doe",
    "mainContactNumber": "6591234567",
    "mainContactPersonNumber": "6591234567",
    "mainContactExtension": "101",
    "alternateContactNumber": "6598765432",
    "alternateContactExtension": null,
    "phoneCountry": "SG",
    "industry": "F&B",
    "contractEndDate": "2025-12-31",
    "contractExpiryDate": "2025-12-31",
    "serviceAgreement": "Active",
    "status": "active",
    "companyLogo": "https://...",
    "outlets": [
      {
        "_id": "...",
        "name": "Orchard Branch",
        "outletName": "Orchard Branch",
        "address": "1 Orchard Rd",
        "outletAddress": "1 Orchard Rd",
        "managerName": "Jane Doe",
        "contactNumber": "6511112222",
        "contactExtension": "201",
        "openingHours": "09:00",
        "closingHours": "18:00",
        "isActive": true,
        "barcode": "..."
      }
    ],
    "totalJobs": 5,
    "activeJobs": 2
  }
}
```

Use `employer` (and `employer.outlets`) to pre-fill every field on the edit form. Pre-fill **location** from `employer.phoneCountry` so contact validation and placeholders match.

---

## 4. Create employer

**Endpoint:** `POST /api/admin/employers`  
**Content-Type:** `multipart/form-data`

**In the `data` field (JSON string), send at least:**

| Field | Required | Notes |
|-------|----------|--------|
| `phoneCountry` | Recommended | `"SG"` \| `"MY"` \| `"IN"`. Use for all contact validation. |
| `companyLegalName` | Yes | |
| `hqAddress` | Yes | |
| `contactPersonName` | Yes | |
| `mainContactNumber` | Yes | With country code (e.g. 65 9123 4567). Validated using `phoneCountry`. |
| `mainContactExtension` | No | Optional extension. |
| `emailAddress` | Yes | Valid email. |
| `industry` | Yes | One of: Hospitality, IT, F&B, Hotel, Retail, Logistics, Healthcare, Education, Construction, Others. |
| `alternateContactNumber` | No | Validated using `phoneCountry`. |
| `alternateContactExtension` | No | |
| `companyNumber` | No | |
| `jobPosition` | No | |
| `contractExpiryDate` | No | YYYY-MM-DD. |
| `serviceAgreement` | No | Default "Active". |
| `outlets` | No | Array; can be empty or omitted. |

**Each outlet in `outlets`:**

- `outletName` (or `name`), `outletAddress` (or `address`), `managerName`, `contactNumber` (required).  
- `contactExtension`, `openingHours`, `closingHours`, `isActive` (optional).

All contact numbers are validated against `phoneCountry`. If validation fails, the API returns **400** with a clear message (e.g. "Singapore mobile must be 8 digits...").

**Success (201):**  
- `success: true`, `employer: { _id, employerId, companyLegalName, companyLogo, outlets }`.  
- Optionally `credentials` if `generateCredentials` was used.

**Errors (always in response body):**  
- `400`: `{ "success": false, "message": "<validation message>", "error": "ValidationError" }`  
- `409`: `{ "success": false, "message": "Employer with this email already exists", "error": "DuplicateKeyError" }`  
Show `message` to the user; use `error` for client-side handling (e.g. focus field, retry logic).

---

## 5. Update employer (and outlets)

**Endpoint:** `PUT /api/admin/employers/:id`  
**Content-Type:** `multipart/form-data`

- **Load first:** Call `GET /api/admin/employers/:id`, pre-fill form with the returned `employer` (see section 3).  
- **Submit:** Send the same shape as create. Always send `phoneCountry` (from form) so validation is correct.

**Outlets behaviour:**

- **Existing outlets:** If an outlet in the payload has an `_id` that exists in the current employer, that outlet is **updated** (name, address, contact number, extension, opening/closing hours, isActive).  
- **New outlets:** If an outlet in the payload has no `_id` (or an unknown one), it is **added** as a new outlet.  
- Outlets not included in the payload are **left unchanged** (no delete). Use `DELETE /api/admin/employers/:employerId/outlets/:outletId` to remove an outlet.

So when editing, send **all** outlets you want to keep (with their `_id`) plus any new ones (without `_id`). Include for each:  
`outletName`, `outletAddress`, `managerName`, `contactNumber`, and optionally `contactExtension`, `openingHours`, `closingHours`, `isActive`.

**Success (200):**  
- `success: true`, `message: "Employer updated successfully"`, and **full `employer`** (same shape as GET response). Use it to refresh the form or list (no need to GET again if you trust the response).

**Errors:**  
- Same as create: **400** (validation message + `ValidationError`), **409** (duplicate email/company number + `DuplicateKeyError`), **404** (employer not found).  
Always show the API `message` to the user and handle `error` for UX (e.g. highlight field, stay on form).

---

## 6. API error response shape

All error responses follow:

```json
{
  "success": false,
  "message": "Human-readable cause (e.g. Singapore mobile must be 8 digits...)",
  "error": "ValidationError | DuplicateKeyError | NotFound | ServerError"
}
```

- **ValidationError:** Invalid/missing fields or phone format. Show `message` and, if possible, focus the relevant field.  
- **DuplicateKeyError:** Email or company number already used. Show `message`.  
- **NotFound:** Employer or outlet not found (e.g. wrong ID).  
- **ServerError:** Generic server error; show a generic message and optionally `message` if present.

Never assume success without checking `response.success`; on failure, read `message` and `error` and surface them in the UI.

---

## 7. React admin checklist

- [ ] **Add/Edit employer:** Ask for **location** (`phoneCountry`: SG / MY / IN) first; use it for all contact validation and placeholders.
- [ ] **Contact fields:** Separate **number** (validated) and **extension** (optional) for main, alternate, and each outlet.
- [ ] **Edit flow:** On "Edit employer", call `GET /api/admin/employers/:id` and pre-fill the entire form (including `phoneCountry` and all outlet fields).
- [ ] **Update:** On save, send the same payload shape as create; include `phoneCountry` and full `outlets` (with `_id` for existing, without for new). Do not remove outlets by omitting them; use the delete outlet API to remove one.
- [ ] **Errors:** On create/update, check `!response.success` and show `response.message`; use `response.error` for styling or retry logic.
- [ ] **Success:** On update, use the returned `employer` to refresh the form or list so the admin sees the saved state (including updated outlets and contact/extension).

---

**Document version:** 1.0  
**Related:** COMPLETE_API_DOCUMENTATIONupdate.md (Employer sections), PHONE_VALIDATION_SHARED.md, BACKEND_PROFILE_AND_APPLY.md
