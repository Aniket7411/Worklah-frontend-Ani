# Frontend Guide: Employer Create Conflict Handling

## Endpoint
- `POST /api/admin/employers`

## What changed in backend
- Backend now applies collision-safe employer ID generation for `employerId` (`EMP-xxxx`), with retry logic.
- This prevents random 409 errors caused by duplicate auto-generated `employerId`.
- Frontend should **not** send or manage `employerId`; backend owns generation.

## Payload contract (frontend)
Send `data` JSON with:
- `companyLegalName`
- `companyNumber` (optional but unique if provided)
- `hqAddress`
- `contactPersonName`
- `mainContactNumber`
- `emailAddress` (unique)
- `industry`
- `phoneCountry` (`IN` | `SG` | `MY`)
- `outlets[]` where each outlet includes:
  - `name`
  - `managerName`
  - `contactNumber`
  - `address`

Do not send:
- `employerId` (backend generates)

## Expected responses

### Success (201)
```json
{
  "success": true,
  "employer": {
    "_id": "...",
    "employerId": "EMP-0007",
    "companyLegalName": "...",
    "outlets": [ ... ]
  }
}
```

### Conflict (409)
```json
{
  "success": false,
  "message": "Employer with this email already exists",
  "error": "DuplicateKeyError"
}
```
or
```json
{
  "success": false,
  "message": "Employer with this company number already exists",
  "error": "DuplicateKeyError"
}
```
or (rare fallback)
```json
{
  "success": false,
  "message": "Employer with this employerId already exists",
  "error": "DuplicateKeyError"
}
```

## Frontend handling rules
1. If `status === 409` and `error === "DuplicateKeyError"`:
   - Show `message` directly in UI.
   - Keep form data intact.
   - Highlight related field if possible:
     - message contains `email` -> highlight email input
     - message contains `company number` -> highlight company number input
2. Do not retry automatically for 409 duplicates on email/company number (user must correct data).
3. Do not generate `employerId` on frontend.

## Recommended UX copy
- Email conflict: `An employer with this email already exists. Please use another email.`
- Company number conflict: `An employer with this company number already exists.`

