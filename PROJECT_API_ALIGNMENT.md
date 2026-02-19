# Project API Alignment Checklist

**Reference:** `NEW_END_TO_END_API_DOCUMENTATION.md` (from backend developer)  
**Date:** February 2025  
**Purpose:** Cross-check admin panel against backend API and document completed alignments.

---

## ✅ Alignments completed

### 1. Job create (NewJob.tsx)
- **Doc:** POST `/admin/jobs` or POST `/admin/jobs/create`.
- **Change:** Panel tries `POST /admin/jobs` first; on 404 falls back to `POST /admin/jobs/create` so both backend variants work.
- **Request body:** Already matches doc (jobTitle, jobName, jobDescription, jobDate, employerId, outletId, shifts, etc.) via `buildJobData()`.

### 2. Payments – add transaction (EnhancedPayments.tsx)
- **Doc §7.2:** POST `/admin/payments/transactions` – body includes `nric`, `jobId`, `shiftDate`, `startTime`, `endTime`, `breakDuration`, `penaltyAmount`, `totalAmount`, `type`, `remarks`.
- **Change:** Added `type: "Salary"` and `remarks`, and optional `nric` for backend lookup.
- **Response:** Handles `success` and toasts; modal closes on success.

### 3. Applications – update status (CandidatesTable.tsx)
- **Doc §5.6:** PUT `/admin/applications/status/:userId` or `/:applicationId` – body `status`, `newStatus?`, `notes?`.
- **Change:** Status update body now includes `newStatus` and `notes` (with existing `jobId`, `rejectionReason` kept for compatibility).

### 4. Auth & base URL (authInstances.ts)
- **Doc:** Base URL with `/api`; all paths relative to it (e.g. `/admin/login`).
- **Change:** Comment updated to reference `NEW_END_TO_END_API_DOCUMENTATION.md`.
- **Existing:** Bearer token via interceptor; `success` check in response interceptor.

### 5. Already aligned (no code change)
- **Login / me / logout:** POST `/admin/login`, GET `/admin/me`, POST `/admin/logout` – paths and body match doc.
- **Dashboard:** GET `/admin/dashboard/stats`, GET `/admin/dashboard/charts` – query params and response mapping in place.
- **Employers:** GET/POST/PUT/DELETE `/admin/employers`, DELETE `/admin/employers/:id/outlets/:outletId` – panel uses `employerIdForAPI` for delete.
- **Jobs:** GET `/admin/jobs`, GET `/admin/jobs/:jobId`, PUT `/admin/jobs/:jobId`, DELETE – paths and query params match.
- **Applications:** GET list/detail, POST approve/reject – paths and body (notes, reason) match.
- **Users/Candidates:** GET/PUT/DELETE users and candidates; POST `/admin/users/create` – payload matches doc.
- **Payments:** GET `/admin/payments/transactions` (type, status, startDate, endDate, etc.); approve, reject, bulk-approve, regenerate, payslip, refund – paths match.
- **Stripe:** GET `/stripe/config`, POST `/stripe/create-payment-intent` – used by EnhancedPayments.
- **Cashout:** POST `/admin/cashout` with `accountDetails` (Singapore bank validation in WithDrawals.tsx).
- **Timesheets:** GET list, POST generate (employerId, startDate, endDate), send-email, download – match doc.
- **QR codes:** GET `/admin/qr-codes`, POST generate (employerId, outletId, jobId), DELETE – match doc.
- **Outlets:** GET list, GET one, GET attendance chart – match doc.
- **Notifications:** GET, PUT read, PUT read-all, POST send – match doc.
- **Reports/Support:** Penalties, sales/invoice/service report, POST `/support/feedback`, GET profile image – paths match.

---

## Response handling (project-wide)

- All API calls use `axiosInstance` (base URL, Bearer token, interceptors).
- Interceptor rejects when `response.data.success === false` and shows toast (except login).
- 401 clears token and redirects to `/login`.
- List endpoints handle both `pagination` and array fields (`jobs`, `employers`, `applications`, `payments`/`transactions`, etc.) per doc.

---

## Backend expectations (for reference)

1. **Every response:** Include `success: true | false`; on failure include `message`.
2. **Employers list/detail:** Include `outlets` array (with `_id`, `name`, `address`; backend can add `barcode`).
3. **Job create:** Validate `employerId` and `outletId` (outlet must belong to employer).
4. **Pagination:** Use `currentPage`, `totalPages`, `totalItems`, `itemsPerPage` where applicable.
5. **Singapore bank (cashout):** 7–14 digits; backend can validate per bank (DBS 9–10, OCBC 10–12, etc.) – admin panel validates in `utils/bankValidation.ts`.

---

## File reference

| Area           | Main files |
|----------------|------------|
| Auth           | `src/context/AuthContext.tsx`, `src/lib/authInstances.ts` |
| Employers      | `src/pages/employers/Employers.tsx`, AddEmployer, EditEmployer, `src/utils/dataTransformers.ts` |
| Jobs           | `src/pages/jobManagemant/NewJob.tsx`, ModifyJob, JobDetailsPage, `src/utils/dataTransformers.ts` |
| Applications   | `src/pages/applications/ApplicationsList.tsx`, ApplicationDetail, `src/pages/employers/CandidatesTable.tsx` |
| Users/Candidates | HustleHeroesList, EditCandidateProfile, CreateUser.jsx |
| Payments       | EmployeePayments, EmployerPayments, EnhancedPayments, WithDrawals, StripePaymentModal |
| Timesheets     | `src/pages/timesheet/TimesheetManagement.jsx` |
| QR/Barcode     | `src/pages/qrCode/QrCode.tsx` |

---

**Status:** Project cross-checked against `NEW_END_TO_END_API_DOCUMENTATION.md`. Alignments applied; remaining behaviour already matches doc. Ready for integration testing with backend.
