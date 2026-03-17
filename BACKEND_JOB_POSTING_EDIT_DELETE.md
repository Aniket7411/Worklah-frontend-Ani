# Backend: Job Posting (Create), Job Edit (Update), and Delete Job

This document describes how the **admin frontend** creates, edits, and deletes jobs: which APIs are called, what payloads are sent, and what response shape is required (especially for **edit**, where job details are fetched and auto-filled including **outlet**). The backend should implement these contracts so the admin panel works without changes.

---

## 1. Overview

| Action | Method | Endpoint | Used by |
|--------|--------|----------|---------|
| Create job | POST | `/admin/jobs` (or `/admin/jobs/create` on 404) | NewJob.tsx |
| Fetch job (for edit) | GET | `/admin/jobs/:jobId` | ModifyJob.tsx, JobDetailsPage, ShiftsInfo, JobInfo, DefaultPenalties |
| Update job | PUT | `/admin/jobs/:jobId` | ModifyJob.tsx |
| Delete job | DELETE | `/admin/jobs/:jobId` | JobManagement.tsx, JobDetailsPage.tsx |

All paths are relative to the API base URL (e.g. `https://worklah-updated-dec.onrender.com/api`). Admin sends `Authorization: Bearer <token>`.

---

## 2. Create job (POST)

### 2.1 Endpoints

- **Primary:** `POST /admin/jobs`
- **Fallback:** If the above returns **404**, the frontend retries `POST /admin/jobs/create` with the same body.

Backend should support at least one of these; response contract is the same.

### 2.2 Request body (JSON)

The frontend builds the body via `buildJobData()` in `src/utils/dataTransformers.ts`. Backend will receive a JSON object with the following fields (all sent in one payload, not multipart).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `jobName` | string | Yes | Same as `jobTitle` if not set separately. |
| `jobTitle` | string | Yes | Job title. |
| `jobDescription` | string | Yes | May contain HTML (rich text from admin). |
| `employerId` | string \| null | Yes* | Employer ID (or null if posted as admin without employer). *Frontend requires employer selection for create. |
| `employerName` | string \| null | No | Display name of employer. |
| `industry` | string \| null | No | Industry (e.g. from employer). |
| `postedBy` | string | Yes | `"admin"` when created from admin panel. |
| `outletId` | string \| null | Conditional | Required if job is tied to an outlet (dropdown). Null when "manual outlet" is used. |
| `outletAddress` | string \| null | Conditional | Used when "manual outlet" is selected; null when outlet dropdown is used. |
| `jobDate` | string | Yes | Date of job in **YYYY-MM-DD**. |
| `location` | string | Yes | Filled from outlet address or manual address / location details. |
| `locationDetails` | string \| null | No | Additional location text. |
| `jobScope` | string[] | Yes | Array of strings (can be empty `[]`). |
| `totalPositions` | number | Yes | Sum of shift vacancies or form value. |
| `foodHygieneCertRequired` | boolean | No | Default `false`. |
| `jobStatus` | string | No | Default `"Active"`. |
| `applicationDeadline` | string \| null | No | ISO date-time string or null. |
| `dressCode` | string \| null | No | Dress code text (replaces legacy skills/requirements). |
| `skills` | string[] | No | Admin sends empty array; kept for compatibility. |
| `shifts` | array | Yes | At least one shift; see §2.3. |

### 2.3 Shift object (each element of `shifts[]`)

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | YYYY-MM-DD for this shift. |
| `shiftDate` | string | Same as `date` (legacy). |
| `startTime` | string | e.g. `"09:00"`. |
| `endTime` | string | e.g. `"17:00"`. |
| `breakHours` | number | Break duration (e.g. 0). |
| `breakDuration` | number | Same (legacy). |
| `breakType` | string | `"Paid"` or `"Unpaid"` (default `"Paid"` if not sent). |
| `payRate` | number | Pay rate (hourly/weekly/monthly). |
| `rates` | number | Same (legacy). |
| `vacancy` | number | Required; minimum 1. |
| `standbyVacancy` | number | Optional; default 0. |
| `totalWorkingHours` | number | Computed/frontend. |
| `rateType` | string | `"Hourly"` \| `"Weekly"` \| `"Monthly"`. |
| `totalWages` | number | Computed. |

### 2.4 Frontend validation before submit (create)

- `jobTitle` – required, non-empty.
- `jobDescription` – required (HTML stripped for empty check).
- `employer` – required (selected).
- Outlet: either `outletId` (dropdown) or `outletAddress`/`locationDetails` (manual) must be provided.
- At least one shift; each shift has `vacancy` ≥ 1.

### 2.5 Success response

- **HTTP:** `200` or `201`
- **Body:** `{ success: true, job?: { _id, id, ... } }`
- Frontend may then call `GET /admin/jobs/:jobId` to show the created job (e.g. with QR/barcodes).

### 2.6 Error response

- **400** – Validation (e.g. missing required field, invalid date). Return `{ success: false, message: "..." }`.
- **401** – Unauthorized.
- **404** – Not found (frontend may retry `/admin/jobs/create` for create only).

---

## 3. Fetch job for edit (GET) – required shape for edit page

The **Job Edit** page (`ModifyJob.tsx`) loads a single job and **auto-fills the form and outlet dropdown**. For that to work, the backend must return a job object that includes **employer** (with **outlets**) and **outlet** and **shifts**.

### 3.1 Endpoint

`GET /admin/jobs/:jobId`

### 3.2 Response (required shape)

Either:

- `{ success: true, job: <job object> }`  
or  
- `{ job: <job object> }`  

The frontend uses `response.data?.job || response.data` as the job. The **job object** must include at least the following so the edit form and outlet dropdown can be filled:

**Top-level job fields (used to pre-fill form):**

| Field | Type | Used for |
|-------|------|----------|
| `jobDate` or `date` | string | Job date (YYYY-MM-DD). |
| `jobTitle` or `jobName` | string | Job title. |
| `jobDescription` or `jobScope` | string | Job description. |
| `jobRoles` | string | Job roles (optional). |
| `employerId` or `employer._id` / `employer.employerId` / `employer.id` | string | Selected employer. |
| `employerName` or `employer.name` / `employer.companyLegalName` | string | Employer display name. |
| `outletId` or `outlet._id` / `outlet.id` | string | Selected outlet ID. |
| `outletAddress` or `outlet.address` | string | Outlet address (or manual address). |
| `totalPositions` / `totalPositionsNeeded` | number | Total positions. |
| `foodHygieneCertRequired` | boolean | Checkbox. |
| `jobStatus` or `status` | string | e.g. "Active". |
| `applicationDeadline` | string (ISO) | Deadline. |
| `dressCode` / `jobRequirements` / `skills` | string or array | Dress code; legacy: comma-separated or array. |
| `locationDetails` or `location` | string | Location text. |
| `contactInfo.phone` / `contactInfo.email` | string | Contact phone/email. |
| `currentFulfilment` | { filled, total } | Fulfilment display. |

**Embedded `employer` (required for outlet dropdown):**

| Field | Type | Used for |
|-------|------|----------|
| `employer.outlets` | array | **Required.** List of outlets for the selected employer so the outlet dropdown is populated. |
| `employer.outlets[]._id` or `id` | string | Outlet ID. |
| `employer.outlets[].address` or `outletAddress` or `location` | string | Outlet address. |
| `employer.outlets[].name` or `outletName` | string | Outlet name. |

If `employer.outlets` is missing or empty, the frontend will call `GET /admin/employers/:employerId` to fetch outlets for the selected employer. To avoid an extra request and to match “employer add/edit” behaviour (where data is fetched and auto-filled), **always populate `job.employer.outlets`** when returning a job for edit.

**Embedded `outlet` (selected outlet for this job):**

| Field | Type | Used for |
|-------|------|----------|
| `outlet._id` or `outlet.id` | string | Pre-selected outlet ID. |
| `outlet.address` | string | Outlet address. |

**Shifts (required for shift table):**

| Field | Type | Used for |
|-------|------|----------|
| `job.shifts` | array | **Required.** Each shift row in the edit table. |
| `shift.shiftDate` or `shift.date` | string | Shift date. |
| `shift.startTime` | string | Start time. |
| `shift.endTime` | string | End time. |
| `shift.breakDuration` / `shift.breakHours` | number | Break. |
| `shift.totalWorkingHours` / `shift.duration` | number | Hours. |
| `shift.rateType` | string | Hourly/Weekly/Monthly. |
| `shift.rates` / `shift.payPerHour` / `shift.payRate` | number | Pay rate. |
| `shift.totalWages` / `shift.totalWage` | number | Total wage. |
| `shift.vacancy` | number | Vacancy. |
| `shift.standbyVacancy` | number | Standby. |

If `job.shifts` is missing or empty, the edit page shows one default shift. For multiple days/shifts, return **all** shifts with correct `shiftDate`/`date` per shift.

### 3.3 Summary for backend (GET job for edit)

- Return **job** with **employer** populated.
- **Employer must include `outlets[]`** with `_id`/`id`, `address`, `name` so the outlet dropdown is pre-filled and the correct outlet can be selected.
- Return **outlet** (the outlet assigned to this job) with `_id`/`id`, `address`.
- Return **shifts[]** with per-shift date, times, break, vacancy, rates, etc., so all shift rows are pre-filled.

---

## 4. Update job (PUT)

### 4.1 Endpoint

`PUT /admin/jobs/:jobId`

### 4.2 Request body

**Same structure as Create** (§2.2 and §2.3). The frontend uses the same `buildJobData()` output: same fields, same `shifts[]` shape. The only difference is that the edit form may also have `jobRoles`, `contactPhone`, `contactEmail`, `currentFulfilment` in the UI; these are not currently included in `buildJobData` output. If the backend supports them, they can be added to the payload later; for now the backend should accept the same body as create.

### 4.3 Frontend validation before submit (edit)

- Same as create (job title, description, employer, outlet or manual address, at least one shift).
- Additionally: `jobRoles` is required on the edit form (validated in ModifyJob).

### 4.4 Success response

- **HTTP:** `200` or `201`
- **Body:** `{ success: true, job?: {...} }`

### 4.5 Error response

- **400** – Validation (e.g. date, deadline, required fields). Return `{ success: false, message: "..." }`.
- **404** – Job not found.

---

## 5. Delete job (DELETE)

### 5.1 Endpoint

`DELETE /admin/jobs/:jobId`

Used from:

- **Job management list** – “Delete” action (confirmation modal).
- **Job details page** – “Cancel Job” action (same endpoint).

No request body.

### 5.2 Success response

- **HTTP:** `200` (or `204` with no body).
- **Body (if any):** `{ success: true, message?: "..." }`

Frontend checks `response.data?.success === false` and then shows a toast; otherwise it closes the modal and/or navigates back.

### 5.3 Error response

- **400/409** – e.g. “Cannot delete job with active applications”. Return `{ success: false, message: "..." }`.
- **404** – Job not found.
- **401** – Unauthorized.

---

## 6. Summary checklist for backend

- [ ] **POST /admin/jobs** (or **POST /admin/jobs/create**) – Accept JSON body as in §2.2 and §2.3; return `201`/`200` with `{ success: true, job }`.
- [ ] **GET /admin/jobs/:jobId** – Return job with **employer** (including **employer.outlets[]**), **outlet**, and **shifts[]** so the edit page can auto-fill form and outlet dropdown (§3.2).
- [ ] **PUT /admin/jobs/:jobId** – Accept same body as create; return `200` with `{ success: true, job? }`.
- [ ] **DELETE /admin/jobs/:jobId** – Delete (or cancel) job; return `200` and optionally `{ success: true, message }`; use `400`/`409` with message when delete is not allowed (e.g. active applications).
- [ ] Validate required fields and dates (job date, application deadline, shift date, vacancy ≥ 1) and return clear `400` messages so the admin panel can show them in toasts.

This document is the single reference for job posting, job editing (including fetch and outlet pre-fill), and delete job for the backend team.
