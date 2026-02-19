# QR Code – Spec (Backend)

**When QR is generated, how it is stored, and how it is returned for admin (view/edit job and QR list).**

---

## 1. Principle

- **QR is generated only after job posting.** No QR exists before a job is created.
- **Single source of truth:** When admin posts a job, the backend generates the QR image, saves it on the **Job** (`job.qrCodes`) and creates a **QRCode** document linked to that job (and employer/outlet) so the admin QR list can show full details.
- **View / Edit job:** When admin fetches a job (GET) or updates it (PUT), the response includes `qrCodes` with **full image URLs** so the UI can display or re-use the QR without building URLs.

---

## 2. When QR is generated

| Action | When | What happens |
|--------|------|----------------|
| **POST job** (create) | After the job and shifts are saved | Backend generates one QR per job (image file + `job.qrCodes` entry + one **QRCode** document with `jobId`, `employerId`, `outletId` when available). |
| **PUT job** (update) | — | QR is **not** regenerated. Existing `job.qrCodes` and QRCode document stay as-is. Admin sees same QR when editing. |
| **POST /api/admin/qr-codes/generate** | Optional, manual | Can generate an extra QR for an existing job (employerId + outletId + jobId required). Use when you need a second QR per job/outlet. |

QR is **never** generated before a job exists. No standalone “create QR only” flow that creates a QR without a job.

---

## 3. Where QR is stored

| Place | Content |
|-------|--------|
| **Job document** | `job.qrCodes[]`: `{ barcode, qrCodeImage, outletId, outletName }`. Image path is relative (e.g. `uploads/qrcodes/job-xxx.png`). |
| **File system** | `uploads/qrcodes/job-<jobId>-<timestamp>.png`. |
| **QRCode collection** | One document per job-created QR: `jobId`, `employerId`, `outletId` (optional if job has no outlet), `qrCodeImage`, `validFrom`, `validUntil`, `isActive`. Used by **GET /api/admin/qr-codes** to list all QRs with job/employer/outlet details. |

---

## 4. APIs and responses

### 4.1 Create job – POST /api/admin/jobs (or your create endpoint)

- **When:** Admin posts a new job.
- **Backend:** After saving job and shifts, generates QR image → saves to `uploads/qrcodes/` → pushes one entry into `job.qrCodes` → creates one **QRCode** document (with `employerId`, `jobId`, `outletId` if available).
- **Response:** Job object includes `qrCodes` with **full image URL** for each entry (e.g. `qrCodeImage: "https://api.example.com/uploads/qrcodes/..."`).

### 4.2 View job – GET /api/admin/jobs/:jobId

- **Response:** Job object includes `qrCodes` array.
- **Each item:** `barcode`, `qrCodeImage` (full URL), `outletId`, `outletName`.
- Admin can show the QR image using `qrCodeImage` as `<img src={...} />` or equivalent.

### 4.3 Edit job – PUT /api/admin/jobs/:jobId

- **Response:** Updated job object includes same `qrCodes` (full URLs).
- QR is not regenerated on update; admin sees the same QR when editing.

### 4.4 List all QRs – GET /api/admin/qr-codes

- **Purpose:** Admin list of all QRs with job/employer/outlet so they can manage and identify each QR.
- **Query (optional):** `employerId`, `outletId`, `jobId` to filter.
- **Response:** `qrCodes[]` with for each item:
  - `_id`, `qrCodeId`, `qrCodeImage` (full URL)
  - **Employer:** `employerId`, `employerName` (never "Unknown": from QR document or from populated `job.company`)
  - **Outlet:** `outletId`, `outletName` (from QR document or from populated `job.outlet`)
  - **Job:** `jobId`, `jobTitle`, `jobName`, `jobDate`
  - `isActive`, `createdAt`
- **Mapping:** If a QR document has no `employerId`/`outletId` (e.g. legacy data), the backend still returns correct names by populating `jobId` with `company` and `outlet` and using those for display.

### 4.5 Delete QR – DELETE /api/admin/qr-codes/:qrCodeId

- Deletes the QRCode document and the image file (if stored locally). Does not change the job’s `job.qrCodes`; you can optionally sync or leave as-is depending on product needs.

---

## 5. Response shape examples

### Job (create / get / update) – `job.qrCodes`

```json
"qrCodes": [
  {
    "barcode": "JOB-0001",
    "qrCodeImage": "https://api.example.com/uploads/qrcodes/job-xxx-123.png",
    "outletId": "outletObjectId",
    "outletName": "Main Branch"
  }
]
```

### GET /api/admin/qr-codes – one item in `qrCodes[]`

```json
{
  "_id": "qrDocId",
  "qrCodeId": "QR-0001",
  "employerId": "EMP-0001",
  "employerName": "JPMC pvt ltd",
  "outletId": "outletIdOrNull",
  "outletName": "Main Branch",
  "qrCodeImage": "https://api.example.com/uploads/qrcodes/job-xxx-123.png",
  "isActive": true,
  "createdAt": "2026-02-19T11:26:35.762Z",
  "jobId": "jobObjectId",
  "jobTitle": "Mern stack developer",
  "jobName": "Mern stack developer",
  "jobDate": "2026-02-19"
}
```

---

## 6. Backend checklist

- [x] **POST job:** Generate QR only after job (and shifts) are saved; write image to `uploads/qrcodes/`; set `job.qrCodes`; create **QRCode** document with `jobId`, `employerId`, `outletId` (optional if no outlet).
- [x] **GET job:** Return `job.qrCodes` with `qrCodeImage` as **full URL**.
- [x] **PUT job:** Return same `job.qrCodes` with full URLs; do not regenerate QR.
- [x] **GET /api/admin/qr-codes:** Return list with employer/outlet/job details; use `jobId` populate (company + outlet) when QR document has no employer/outlet so no "Unknown".
- [x] **QRCode model:** `jobId` required; `employerId` and `outletId` optional so job-created QRs without an outlet can still be stored and listed.

---

## 7. Summary

| Step | Who | Action |
|------|-----|--------|
| 1 | Admin | Posts job (POST job). |
| 2 | Backend | After job save → generate QR image → save to disk and `job.qrCodes` → create QRCode document. |
| 3 | Admin | Views/edits job → GET/PUT job returns `qrCodes` with full image URL. |
| 4 | Admin | Opens QR list → GET /api/admin/qr-codes returns all QRs with proper employer/outlet/job (no "Unknown"). |

QR is generated **only after job posting** and returned with **proper details and full URLs** when viewing or editing the job and when listing QRs.
