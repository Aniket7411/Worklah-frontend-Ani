# Backend: Fixes and API Specifications

**Purpose:** Align backend with Admin Panel behavior. Addresses reported issues and defines required API contracts.

---

## 1. Company Logo Upload (Edit Employer)

**Full spec for backend and native:** See **[COMPANY_LOGO_SPEC.md](./COMPANY_LOGO_SPEC.md)** for precise upload flow, string format, and display behaviour.

### Issue
Company logo is not getting uploaded when editing an employer, or not shown when fetching employer/job.

### Principle
- **Upload:** Admin sends logo as a **File** in multipart. Backend must **convert** the file to a **string** (store as full URL or data URL) and save that string in the employer record.
- **Fetch / Display:** Every API that returns an employer (GET employer, GET job with employer) must return `companyLogo` as a **string** (full URL or data URL, or null). Admin and Native use this string directly to display the logo (e.g. `<img src={companyLogo} />` or `source={{ uri: companyLogo }}`).

### Frontend behavior
- **PUT** `/admin/employers/:employerId` with `multipart/form-data`
- FormData contains:
  - `companyLogo`: File (when user selects a new image)
  - `data`: JSON string with `{ companyLegalName, outlets, ... }` (other employer fields)
  - `acraBizfileCert`, `serviceContract`: Files when updated

### Backend requirements
1. **Accept** `Content-Type: multipart/form-data` for PUT /admin/employers/:employerId
2. **Parse** the `companyLogo` file field when present
3. **Convert & store:** Save the uploaded file (disk/S3), then store **only a string** in DB (e.g. full URL `https://worklah.onrender.com/uploads/employers/xyz.png`). Do not store raw binary in the employer document.
4. **Parse** the `data` field as JSON for non-file employer fields
5. **Return** updated employer with `companyLogo` as that **string** (full URL or data URL). Same for GET employer and any response that includes employer (e.g. GET job with employer).

### Multer example (Node/Express)
```js
// Ensure multer handles 'companyLogo' field
upload.fields([
  { name: 'companyLogo', maxCount: 1 },
  { name: 'acraBizfileCert', maxCount: 1 },
  { name: 'serviceContract', maxCount: 1 }
])
```

### Field names
- File: `companyLogo` (when user uploads a new logo)
- JSON: `data` (stringified object with employer fields)

---

## 2. Employer Jobs and Active Job Postings

### Issue
At `/employers/EMP-0001`, the Active Job Postings table shows N/A for Job Details, Job ID, Address, Date, etc.

### Frontend behavior
- **GET** `/admin/employers/:employerId` – expects `employer.jobs` array
- If `employer.jobs` is empty, frontend falls back to **GET** `/admin/jobs?employerId=:id&limit=100`
- Table expects each job to have:

| Display Column | API fields (any of) |
|----------------|---------------------|
| Job Details (name) | `jobName`, `jobTitle` |
| Job ID | `_id` (last 8 chars) |
| Address | `address`, `outlet.address`, `outlet.outletAddress`, `location`, `outletAddress` |
| Date | `date`, `jobDate` |
| Shifts count | `availableShifts`, `shifts.length` |
| Vacancy | `shifts[].vacancy`, `shifts[].vacancyFilled`, `totalPositions`, `vacancy` |
| Standby | `shifts[].standbyVacancy`, `shifts[].standbyFilled`, `standbyLimit` |
| Duration | `shifts[].duration`, `shifts[].totalWorkingHours` |
| Rate | `shifts[].rateType`, `shifts[].payRate`, `shifts[].rates` |
| Total Wage | `shifts[].totalWage`, `shifts[].totalWages` |
| Status | `jobStatus`, `status` |

### Backend requirements
1. **GET** `/admin/employers/:employerId` must either:
   - Include `jobs` array with populated job objects, or
   - Frontend will call **GET** `/admin/jobs?employerId=:id` as fallback
2. **Each job must have a valid `_id`** (MongoDB ObjectId or equivalent). The frontend navigates to `/jobs/:jobId` using this ID. Jobs without `_id` or with index-based fallbacks (e.g. `"0"`) will fail with 404 when viewing job details.
3. Each job in the response must include:
   - `_id`, `jobName` or `jobTitle`
   - `jobDate` or `date`
   - `address` or `outlet: { address }` (or `location`, `outletAddress`)
   - `shifts` array with `vacancy`, `standbyVacancy`, `duration`/`totalWorkingHours`, `payRate`/`rates`, `totalWage`/`totalWages`
   - `employer: { companyLogo }` for company image

### Example job object
```json
{
  "_id": "69954bbdd746c236bb6c9899",
  "jobName": "Waiter",
  "jobTitle": "Waiter",
  "jobDate": "2026-02-20",
  "address": "123 Orchard Road",
  "totalPositions": 3,
  "jobStatus": "Active",
  "outlet": { "address": "123 Orchard Road", "name": "Orchard Branch" },
  "employer": { "companyLegalName": "ABC Restaurant", "companyLogo": "https://..." },
  "shifts": [
    {
      "vacancy": 2,
      "standbyVacancy": 0,
      "duration": 8,
      "totalWorkingHours": 8,
      "payRate": 15,
      "rates": 15,
      "totalWage": 120,
      "totalWages": 120,
      "rateType": "Hourly"
    }
  ]
}
```

---

## 3. Shift Cancellation Penalties

### Issue
Displayed penalties should be clearly defined and sourced from the API.

### Remove Default Penalties (REQUIRED)

**Penalties must only be visible when the admin has added them via the Penalty Management page.**

The backend **must not**:
1. Seed or insert default penalty rules on startup or migration
2. Return hardcoded default penalties when the DB is empty
3. Keep any pre-populated default penalties in the database

**Action required – if default penalties exist:**
1. **Identify** – Check your penalties collection/table for any seeded or default records (e.g. "5 minutes after applying", "48 Hours", "24 Hours (1st Time)", "$5 Penalty", etc.)
2. **Delete** – Remove all default penalty records from the database
3. **Update code** – Remove any seed scripts, migrations, or `findOneAndUpdate` / `insertMany` that insert default penalties
4. **Verify** – `GET /admin/penalties` should return `{ "success": true, "penalties": [] }` when no admin-added rules exist

**Expected behavior:**
- When the penalties collection/table is empty → `GET /admin/penalties` returns `{ "success": true, "penalties": [] }`
- Penalties appear only after admin adds them via PUT `/admin/penalties` from the Penalty Management page (`/settings/penalties`)

### Data source
1. **Job-level:** `job.penalties` from **GET** `/admin/jobs/:jobId`
2. **Global defaults:** **GET** `/admin/penalties`

### API: GET /admin/penalties

**Response (200) – when penalties exist (admin-added only):**
```json
{
  "success": true,
  "penalties": [
    { "condition": "5 minutes after applying", "penalty": "No Penalty" },
    { "condition": "48 Hours", "penalty": "No Penalty" },
    { "condition": "24 Hours (1st Time)", "penalty": "$5 Penalty" },
    { "condition": "24 Hours (2nd Time)", "penalty": "$10 Penalty" },
    { "condition": "24 Hours (3rd Time)", "penalty": "$15 Penalty" },
    { "condition": "No Show - During Shift", "penalty": "$50 Penalty" }
  ]
}
```

**Response (200) – when no penalties exist (initial / after removal of defaults):**
```json
{
  "success": true,
  "penalties": []
}
```

### Field names
- Use `condition` for the time/event description (e.g. "24 Hours (1st Time)")
- Use `penalty` for the amount (e.g. "$5 Penalty", "No Penalty")
- Alternative: `frame` instead of `condition` (frontend supports both)

### Job-level penalties
- **GET** `/admin/jobs/:jobId` may include `penalties` array with the same shape
- If present, these override the global defaults for that job

### API: PUT /admin/penalties (Admin Edit)

**Purpose:** Allow admin to update penalty rules dynamically.

**Request:**
```
PUT /api/admin/penalties
Content-Type: application/json
```

**Body:**
```json
{
  "penalties": [
    { "condition": "5 minutes after applying", "penalty": "No Penalty" },
    { "condition": "48 Hours", "penalty": "No Penalty" },
    { "condition": "24 Hours (1st Time)", "penalty": "$5 Penalty" },
    { "condition": "24 Hours (2nd Time)", "penalty": "$10 Penalty" },
    { "condition": "24 Hours (3rd Time)", "penalty": "$15 Penalty" },
    { "condition": "No Show - During Shift", "penalty": "$50 Penalty" }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Penalties updated successfully",
  "penalties": [ ... ]
}
```

**Response (400):** Invalid payload or validation error.

### Backend requirements
1. **Do not** seed or store default penalties; return empty array when none exist
2. Implement **GET** `/admin/penalties` – return `{ success: true, penalties: [] }` when empty
3. Implement **PUT** `/admin/penalties` to accept and persist the `penalties` array
4. Optionally include `penalties` in **GET** `/admin/jobs/:jobId` for job-specific rules
5. Penalties are stored only when admin adds them via the Penalty Management page (`/settings/penalties`)

---

## 4. GET /admin/jobs/:jobId – 404 "Job not found"

### Issue
`GET /api/admin/jobs/69954bbdd746c236bb6c9899` returns 404 with `{"success":false,"message":"Job not found","error":"NotFound"}`.

### Possible causes
1. Job does not exist in the database
2. Route expects a different ID format (e.g. prefixed)
3. Authorization or scope issue

### Backend requirements
1. **GET** `/admin/jobs/:jobId` must accept:
   - MongoDB `_id` (24 hex chars, e.g. `69954bbdd746c236bb6c9899`)
   - Any job identifier your system uses
2. Return **404** only when the job truly does not exist
3. Return **200** with `{ success: true, job: {...} }` when found

### Response (200)
```json
{
  "success": true,
  "job": {
    "_id": "69954bbdd746c236bb6c9899",
    "jobName": "Waiter",
    "jobTitle": "Waiter",
    "jobDate": "2026-02-20",
    "applicationDeadline": "2026-02-19T23:59:59.000Z",
    "employer": { "_id": "...", "companyLegalName": "...", "companyLogo": "..." },
    "outlet": { "_id": "...", "name": "...", "address": "..." },
    "shifts": [...],
    "penalties": [...],
    ...
  }
}
```

### Edit Job – Date and validation behaviour
- **PUT** `/admin/jobs/:jobId`: When updating an existing job, **allow past job dates and past application deadlines**. The admin panel loads the existing job and lets the user edit; validation should not require "today or future" for an edit. Only enforce: application deadline ≥ job date when both are present.
- **GET** `/admin/jobs/:jobId` must return `applicationDeadline` (ISO string or `null`) so the job details page and edit form can show/set it. If the job was posted without a deadline, return `applicationDeadline: null`.

### Verification
- Ensure the job with `_id` `69954bbdd746c236bb6c9899` exists
- If using a different primary key, add support for lookup by MongoDB `_id`

---

## 5. QR Codes – Job association

### Frontend behaviour
- **Generate:** Admin selects Employer → Outlet → Job, then calls **POST** `/admin/qr-codes/generate` with `{ employerId, outletId, jobId }`.
- The QR Code Management table shows: QR code image, QR Code ID, **Job** (title + date), Employer, Outlet, Address, Status, Actions.
- The preview modal shows the QR code prominently plus **Job details** and **Venue** (employer, outlet, address).

### Backend requirements
1. **POST** `/admin/qr-codes/generate` should accept `jobId` and store/link the job with the generated QR code.
2. **GET** `/admin/qr-codes` (or equivalent) should return each QR code with optional job fields when linked: `jobId`, `jobTitle` or `jobName`, `jobDate`, so the admin table and preview can show "Job" clearly.

---

## 6. Summary

| # | Item | Action |
|---|------|--------|
| 1 | Company logo upload | Accept multipart `companyLogo` file in PUT /admin/employers/:id |
| 2 | Employer jobs | Populate `jobs` in GET employer or ensure GET /admin/jobs?employerId works |
| 3 | Job object shape | Include jobName, jobDate, address/outlet, shifts with vacancy, payRate, totalWage |
| 4 | Job `_id` required | Every job must have `_id`; frontend uses it for `/jobs/:jobId` navigation. No index fallback. |
| 5 | Penalties | No default penalties; remove any seeded defaults; GET returns `[]` when empty; PUT for admin-add |
| 6 | Job 404 | Support MongoDB _id for GET /admin/jobs/:jobId; return 404 only when job missing |
| 7 | Edit job dates | PUT /admin/jobs/:id: allow past job date and past deadline when editing; only enforce deadline ≥ job date |
| 8 | Application deadline | GET /admin/jobs/:jobId must return applicationDeadline (ISO or null); POST/PUT accept applicationDeadline |
| 9 | QR codes + job | POST /admin/qr-codes/generate accept jobId; GET qr-codes return jobId, jobTitle/jobName, jobDate when linked |
