# Backend Update – Final Spec (WorkLah Admin Panel)

This document describes backend changes required so the admin panel and app work as intended: **no stub/placeholder data**, **no default logo when none uploaded**, **auto-generated barcodes/QR per outlet and per job**, and **API returning updated data** so the frontend can refetch and display it.

---

## 1. Remove Stub / Default Data

- **Employer logo:** When an employer is created or updated **without** a logo file upload, do **not** set any default or placeholder logo.
  - `companyLogo` must be `null`, `undefined`, or omitted in the response.
  - Do **not** use a default image path (e.g. `/uploads/default-logo.png`). The frontend treats logo as “real” only when it’s a non-empty URL that doesn’t look like a default/placeholder.
- **Outlets:** Do not add placeholder or stub outlet data. Only return outlets that actually exist for the employer.

---

## 2. Logo Handling (Employer Create/Update)

- **Create employer (`POST /api/admin/employers`):**
  - If the request **does not** include a `companyLogo` file, do **not** set `companyLogo` on the employer document. Leave it unset or `null`.
- **Update employer (`PUT /api/admin/employers/:employerId`):**
  - If the request **does not** include a new `companyLogo` file, leave the existing `companyLogo` unchanged (or clear it if the client explicitly sends “clear logo” and you support that). Do **not** set a default logo.

The frontend only sends `companyLogo` when the user selects a file. If no file is sent, the backend must not assign any logo URL.

---

## 3. Barcode / QR Code – When to Generate

### 3.1 Outlet barcode (shift check-in)

- **When:** On **outlet creation** (e.g. when creating an employer with outlets, or updating an employer with new outlets, or `POST /api/admin/outlets`).
- **What:** Generate a **unique** `barcode` (string) per outlet and store it on the outlet document.
- **Uniqueness:** Each outlet’s `barcode` must be unique across all outlets (e.g. unique index).
- **Format:** e.g. alphanumeric string like `OUT-XXXXXXXXXX` or similar. See **Section 6** for suggested tech.

Details (generation rules, API contract, DB) are in **`updatebarcodecreation.md`**.

### 3.2 Job-linked QR / barcode (per job)

- **When:** On **job creation** (`POST /api/admin/jobs/create` or equivalent).
- **What:** For the created job, auto-generate and attach:
  - Either a **job-level QR/barcode** (one per job), and/or
  - A **list of barcodes** linked to that job (e.g. the outlet’s barcode for the job’s outlet, or job-specific codes).
- **Storage:** Attach to the job document, e.g.:
  - `job.barcodes` – array of `{ barcode, outletId?, outletName? }`, or
  - `job.qrCodes` – array of QR/barcode objects linked to this job.
- **Response:** When returning a job (e.g. `GET /api/admin/jobs/:id`), include `barcodes` and/or `qrCodes` so the admin panel can show “Barcodes / QR codes for this job” and the QR Code Management page can list/filter by job.

The frontend:

- After creating a job, refetches that job (`GET /api/admin/jobs/:id`) and, if present, shows `job.barcodes` / `job.qrCodes` on the job detail page.
- Calls `GET /api/admin/qr-codes?jobId=...` when a job filter is applied, so the backend should support optional `jobId` and return only QR/barcodes for that job.

---

## 4. API Behaviour for Updated Data

- **Job create:** After creating a job and generating QR/barcodes, the **same job** when fetched via `GET /api/admin/jobs/:id` must include the newly generated `barcodes` / `qrCodes` (and any other updated fields). The admin panel refetches after create to show this.
- **QR codes list:** `GET /api/admin/qr-codes` should return all QR/barcode records; optional query `jobId` should filter by job. Response shape can be e.g. `{ success, qrCodes }` or `{ success, barcodes }`; the frontend accepts both.
- **Employers/outlets:** When outlets are created/updated and barcodes are generated, responses that return employers or outlets must include the `barcode` field for each outlet so the admin panel can display it.

---

## 5. Summary Checklist for Backend

| Item | Action |
|------|--------|
| Employer logo | Do not set any default/placeholder logo when no file is uploaded. Leave `companyLogo` null/omitted. |
| Stub data | Do not add placeholder employers, outlets, or logos. |
| Outlet barcode | Auto-generate unique `barcode` on outlet creation; persist and return in outlet/employer responses. See `updatebarcodecreation.md`. |
| Job barcode/QR | On job creation, auto-generate and attach barcodes/QR for that job; store e.g. `job.barcodes` or `job.qrCodes`. |
| GET job by id | Include `barcodes` / `qrCodes` in job response so admin can show and refresh. |
| GET qr-codes | Support optional `jobId` query; return QR/barcodes (optionally filtered by job). |
| Uniqueness | Outlet barcodes unique; job-linked codes as per your design. |

---

## 6. Tech for Barcode / QR Generation

Backend can use standard Node libraries:

- **QR codes (2D):**
  - **`qrcode`** (npm: `qrcode`) – generate QR code images or data URLs from a string (e.g. job id, outlet barcode, or JSON payload). Widely used in Node.
  - **`qr-code-generator`** – alternative.
- **Barcodes (1D, e.g. Code128, Code39):**
  - **`bwip-js`** (npm: `bwip-js`) – supports many 1D/2D formats; render to PNG/buffer. Good for classic barcodes.
  - **`jsbarcode`** – browser-oriented but can be used in Node in some setups.

**Suggested approach:**

- **Outlet barcode (string):** Generate a unique alphanumeric string (e.g. with `crypto.randomBytes` or nanoid), store it on the outlet, and optionally render it as 1D barcode (e.g. Code128) with `bwip-js` for display/print.
- **Job QR/barcode:** On job creation, generate a unique code (or use job id + checksum), store it in `job.barcodes` / `job.qrCodes`, and optionally generate a QR image with `qrcode` for the same value so workers or admin can scan it.

The **admin panel** does **not** generate barcodes; it only displays and refreshes data returned by the API (e.g. `job.barcodes`, `job.qrCodes`, outlet `barcode`). All generation is done on the backend.

---

## 7. Related Docs

- **`updatebarcodecreation.md`** – Outlet barcode auto-generation, uniqueness, and API contract for employers/outlets.
- **`COMPLETE_API_DOCUMENTATIONupdate.md`** – Full API reference; align responses (job, outlet, employer, qr-codes) with the behaviour above.

Once these backend updates are in place, the admin panel will show correct logos (no unwanted default), barcodes/QR per outlet and per job, and will refetch so updated data is shown when the user refreshes or returns to the page.
