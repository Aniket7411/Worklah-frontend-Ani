## WorkLah – Admin (React) & Native (RN) Handover Checklist

**Purpose:** Single high-level checklist for the React Admin and React Native teams to verify that their apps are fully wired to the backend.  
**Backend reference docs:**  
- `NEW_END_TO_END_API_DOCUMENTATION.md` – full API contract (admin + native)  
- `LOCATION_BACKEND_AND_NATIVE.md` – address & distance / “jobs near me” contract  
- `PAYMENT_FLOW.md`, `QR_CODE_SPEC.md`, `VERIFICATION_AND_ADMIN_ACTIONS.md` – feature‑specific details

**Base URLs (from `NEW_END_TO_END_API_DOCUMENTATION.md`):**
- Dev: `http://localhost:3000/api`
- Prod: `https://worklah-updated-dec.onrender.com/api` (or your deployed URL)

---

## 1. Common to both (Admin + Native)

- **Auth headers**
  - **Admin React:** `Authorization: Bearer {adminToken}` after `POST /admin/login`
  - **Native RN:** `Authorization: Bearer {userToken}` after `POST /user/verify-otp`
- **Response shape**
  - All APIs must return `{ success: true | false, ... }`
  - On error, backend returns `{ success: false, message, error? }`
- **Pagination**
  - List endpoints use the shared pagination object in `NEW_END_TO_END_API_DOCUMENTATION.md §14`

**Cross‑check (both teams):**
- [ ] All authenticated calls send the correct Bearer token  
- [ ] All list screens handle the shared pagination shape  
- [ ] Error toasts/messages read `message` from the backend response

---

## 2. React Admin – What to test

Use **Sections 1.1–1.3, 2–12** in `NEW_END_TO_END_API_DOCUMENTATION.md` as the detailed contract.

### 2.1 Auth & session
- **APIs:** `POST /admin/login`, `GET /admin/me`, `POST /admin/logout`
- **Verify:**
  - [ ] Successful login stores token and admin info from response  
  - [ ] On page refresh, `GET /admin/me` is called and handles 401 by redirecting to login  
  - [ ] Logout clears token and redirects to login

### 2.2 Dashboard
- **APIs:** `GET /admin/dashboard/stats`, `GET /admin/dashboard/charts`
- **Verify:**
  - [ ] Stats cards match fields under `stats` object  
  - [ ] Charts use `applicationsOverTime`, `jobsByStatus`, `revenueOverTime` as documented  
  - [ ] Filters (`period`, `startDate`, `endDate`) are wired to query params

### 2.3 Employers & outlets
- **APIs:** `GET /admin/employers`, `GET /admin/employers/:employerId`, `POST /admin/employers`, `PUT /admin/employers/:employerId`, `DELETE /admin/employers/:employerId`, `DELETE /admin/employers/:employerId/outlets/:outletId`
- **Specials:** Multipart upload for `companyLogo`, `acraBizfileCert`, `serviceContract` (see `BACKEND_FIXES_AND_SPEC.md §1`)
- **Verify:**
  - [ ] Employer list shows `outlets` with barcode  
  - [ ] Create/edit forms send `multipart/form-data` and show returned `companyLogo` URL  
  - [ ] Deleting employers/outlets uses the correct endpoints and updates tables

### 2.4 Jobs (admin side)
- **APIs:** `GET /admin/jobs`, `GET /admin/jobs/:jobId`, `POST /admin/jobs` or `/admin/jobs/create`, `PUT /admin/jobs/:jobId`, `DELETE /admin/jobs/:jobId`, `GET /admin/rate-configuration`, `GET /admin/jobs/deployment-tracking`
- **Verify:**
  - [ ] Job list filters (`status`, `search`, `employerId`, `outletId`, dates) map to query params  
  - [ ] Job detail page uses the job shape from §4.2 (employer, outlet, shifts, penalties)  
  - [ ] Create/edit job forms send the JSON body as in §4.3/4.4 (including `shifts[]`)  
  - [ ] Deleting a job succeeds and removes associated shifts/applications in UI  
  - [ ] Rate configuration and deployment tracking screens use the documented endpoints

### 2.5 Applications management
- **APIs:** `GET /admin/applications`, `GET /admin/applications/:applicationId`, `POST /admin/applications/:applicationId/approve`, `POST /admin/applications/:applicationId/reject`, `GET /admin/jobs/candidates/:jobId`, `PUT /admin/applications/status/:applicationId` (or `/status/:userId` as supported)
- **Verify:**
  - [ ] List page shows `status`, `adminStatus`, candidate info, and pagination  
  - [ ] Detail view matches §5.2 (user, job, shift info)  
  - [ ] Approve/reject flows update `adminStatus` and propagate to Native (user sees changes)  

### 2.6 Users, candidates, schools, postal code
- **APIs:** `GET /admin/users`, `GET /admin/users/:userId`, `PUT /admin/users/:userId/verify`, `DELETE /admin/users/:userId`, `POST /admin/users/create`, `GET /admin/candidates`, `GET /admin/candidates/:candidateId`, `PUT /admin/candidates/:candidateId`, `DELETE /admin/candidates/:candidateId`, `GET /admin/schools`, `GET /admin/postal-code/:postalCode`
- **Verify:**
  - [ ] Candidate detail matches §6.9 (IDs, docs, profile flags)  
  - [ ] Verify/reject user updates `verificationStatus` and is reflected in Native (users can/can’t apply)  
  - [ ] Postal code lookup populates address field correctly

### 2.7 Payments & cashout (admin side)
- **APIs:** All from §7 (`/admin/payments/transactions`, `/admin/payments/transactions/:transactionId/*`, `/admin/cashout`, `/stripe/*`)
- **Verify (UI):**
  - [ ] Payment list uses `payments` array and shared pagination  
  - [ ] “Add payment” form sends payload as §7.2  
  - [ ] Approve / reject / bulk approve update status without UI desync  
  - [ ] Cashout screen calls `/admin/cashout` with correct `transactionType`, `cashOutMethod`, and account details

### 2.8 Timesheets, QR codes, outlets, notifications, reports, support
- **APIs:** As in §§8–12 (`/admin/timesheets*`, `/admin/qr-codes*`, `/admin/outlets*`, `/admin/notifications*`, `/admin/penalties`, `/admin/*-report`, `/support/feedback`, `/admin/profile/image`)
- **Verify:**
  - [ ] Timesheet generate, email, and download flows map 1:1 to the documented payloads  
  - [ ] QR Code Management uses `POST /admin/qr-codes/generate` and `GET /admin/qr-codes` job linkage (per `BACKEND_FIXES_AND_SPEC.md §5` and `QR_CODE_SPEC.md`)  
  - [ ] Penalty Management (`/settings/penalties`) uses `GET`/`PUT /admin/penalties` and **does not** assume defaults when empty  
  - [ ] Notifications list, mark read, mark all read, and send follow §11  
  - [ ] Reports pages call their respective `/admin/*-report` endpoints  
  - [ ] Support/feedback page uses `/support/feedback`

---

## 3. React Native – What to test

Use **Sections 1.5–1.8 and 13** in `NEW_END_TO_END_API_DOCUMENTATION.md` plus `LOCATION_BACKEND_AND_NATIVE.md`.

### 3.1 Login, OTP, session
- **APIs:** `POST /user/login`, `POST /user/verify-otp`, `GET /user/me`, `POST /user/logout`
- **Verify:**
  - [ ] Phone number login triggers OTP flow, handles both success and error messages  
  - [ ] OTP verify stores `token`, `expiresIn`, and `user` from response  
  - [ ] `/user/me` is called at app start to restore session and handle expired token

### 3.2 Jobs list & detail (Native)
- **APIs:** `GET /jobs`, `GET /jobs/:id`, `POST /jobs/:jobId/apply`, `POST /jobs/:jobId/cancel` (or `/jobs/:jobId/applications/:applicationId/cancel`), `GET /jobs/ongoing`, `GET /jobs/completed`, `GET /jobs/cancelled`, `GET /user/applications`, `POST /user/applications/:applicationId/confirm`
- **Verify:**
  - [ ] Job list uses `jobs` and `pagination` as per §13.1; supports `search`, `status`, `location`, `date`, `rateType`  
  - [ ] List items show `jobStatus`, `applicationDeadline`/`deadline`, `employer` and `outlet` data as mapped in `jobController.js`  
  - [ ] Job detail screen uses fields from `GET /jobs/:id` (`availableShiftsData`, job + employer + outlet info)  
  - [ ] Apply and cancel flows use the correct payloads and display backend `message`  
  - [ ] Ongoing/completed/cancelled jobs screens use the dedicated endpoints and shapes from `jobController.js`

### 3.3 Location, address autocomplete, “Jobs near me”
- **APIs:** `GET /jobs` with `lat`, `lng`, `range` query (distance filter), address fields mapping from `LOCATION_BACKEND_AND_NATIVE.md`
- **Verify:**
  - [ ] Address autocomplete returns `formatted_address` and (optionally) lat/lng, then sends `location`, `locationDetails`, `outletAddress` and optional `latitude`, `longitude` fields as documented  
  - [ ] “Use my location / Jobs near me” sends `lat`, `lng`, `range` (km) to `GET /jobs` and uses the filtered list  
  - [ ] Same address payloads as web admin are used for any job creation/edit flows from app (if implemented)

### 3.4 Wallet & cashout (Native)
- **APIs:** `GET /wallet`, `GET /jobs/transactions`, `POST /wallet/cashout` (or `/jobs/cashout`)
- **Verify:**
  - [ ] Wallet screen reads `wallet` or balance fields as in §13.6  
  - [ ] Transactions list maps to `transactions` shape returned from `jobController.js` (`transactionId`, `type`, `amount`, `status`, `createdAt`)  
  - [ ] Cashout request uses fields from §13.7 (`amount`, `cashOutMethod`, `accountDetails`) and displays the success message

### 3.5 Attendance, QR / barcode scan, notifications, saved jobs
- **APIs:** `/attendance/clock-in`, `/qr/clock-out`, `/qr/scan`, `/notifications*`, `/user/saved-jobs*`, `/user/applications`, `/user/applications/:applicationId/confirm`
- **Verify:**
  - [ ] Clock-in/out screens send the documented `jobId`, `applicationId`, `latitude`, `longitude`  
  - [ ] QR/barcode scan sends `qrCode`, `barcode`, `jobId`, `shiftId` and uses the returned job/shift data for check‑in  
  - [ ] Notification list and “mark read / mark all read” use `/notifications` endpoints  
  - [ ] Saved jobs/bookmarks map to `/user/saved-jobs` (`GET`, `POST`, `DELETE`)  
  - [ ] “My applications” screen uses `/user/applications` and respects `status`/`adminStatus` mapping

---

## 4. What we have already validated on backend

From code review and local boot:
- **Backend server:** `npm start` boots `index.js` without runtime errors on dev machine.  
- **API surface:** Controllers and models implement the endpoints and response shapes described in `NEW_END_TO_END_API_DOCUMENTATION.md`, including:
  - Admin: employers, outlets, jobs (CRUD + deployment), applications, users/candidates, penalties, payments, timesheets, QR codes, notifications, reports, support.
  - Native: jobs list/detail/apply/cancel, ongoing/completed/cancelled jobs, wallet & transactions, cashout, attendance, notifications, applications confirm.
- **Location & distance:** `jobController.js` implements lat/lng distance filter and shared address fields as in `LOCATION_BACKEND_AND_NATIVE.md`.  
- **Data shapes:** `models/Job.js` and related controllers align field names (`jobId`, `jobName`, `jobTitle`, `jobDate`/`date`, `locationDetails`, `applicationDeadline`, `penalties`, `barcodes`, `qrCodes`) with the docs.

**Remaining responsibility for Admin & Native teams:**  
Use this checklist together with `NEW_END_TO_END_API_DOCUMENTATION.md` and `LOCATION_BACKEND_AND_NATIVE.md` to manually click through every screen, confirm each API call matches the documented path, method, payload, and response, and report any mismatch (path, field name, or missing data) as a backend bug.

