## WorkLah Admin Panel – Backend Integration Map

**Purpose:** Single reference for backend devs to see how the React Admin panel calls each API, based on `NEW_END_TO_END_API_DOCUMENTATION.md` and `ADMIN_AND_NATIVE_API_CHECKLIST.md`.

Base URL (from `src/lib/authInstances.ts`):
- Dev: `http://localhost:3000/api`
- Prod (commented, same contract): `https://worklah-updated-dec.onrender.com/api`

All paths below are relative to this base.

---

## 1. Auth & session

- **POST `/admin/login`**
  - Used by: `AuthContext.login()` (`AuthContext.tsx`), `SignIn.tsx`
  - Body: `{ email, password }`
  - Expects: `{ success, message, token, expiresIn, admin }`
  - Side effects: Token stored as `authToken` in `localStorage` + cookies; `admin` saved in context.

- **GET `/admin/me`**
  - Used by: `AuthContext` `useEffect` on app load.
  - Purpose: Session check and auto-login.
  - Behavior:
    - On `success === true`, sets `user` and `isAuthenticated`.
    - On failure / 401, clears token and logs out.

- **POST `/admin/logout`**
  - Used by: `AuthContext.logout()`, `Sidebar` logout button.
  - Side effects: Clears token from storage and context regardless of API error.

- **POST `/user/forgot-password`**
  - Used by: `ForgotPassword.tsx`
  - Body: `{ email }`
  - On success: UI shows “password reset email sent”.

---

## 2. Dashboard

- **GET `/admin/dashboard/stats`**
  - Used by: `Dashboard.tsx`
  - Query: `startDate`, `endDate`, `employerId` (optional).
  - Expects: `{ success, stats, recentActivity }`
  - UI: Stats cards and summary tiles.

- **GET `/admin/dashboard/charts`**
  - Used by: `JobPostChart.tsx`, `RevenueChart.tsx`
  - Query: `period` (e.g. `monthly`), `startDate`, `endDate`.
  - Expects: `{ success, charts: { applicationsOverTime, jobsByStatus, revenueOverTime } }`.

---

## 3. Employers & outlets

- **GET `/admin/employers`**
  - Used by:
    - `Employers.tsx` (list + pagination)
    - Filters/components: `JobEmployerFilter.tsx`, `Dashboard.tsx`, `UpcomingDeploymentTable.tsx`, `NewJob.tsx`, `ModifyJob.tsx`, `QrCode.tsx`, reports (`invoice.tsx`, `salesreport.tsx`)
  - Query: `page`, `limit`, `search`
  - Expects: `{ success, employers, pagination }` where each employer has `outlets[]`.

- **GET `/admin/employers/:employerId`**
  - Used by: `EditEmployer.tsx`, `ModifyJob.tsx`, `NewJob.tsx`, `ActiveJobPosting.tsx`
  - Expects: `{ success, employer }` with `outlets[]` including `barcode`.

- **POST `/admin/employers`** (multipart)
  - Used by: `AddEmployer.tsx` via `axiosFileInstance`
  - Body (form-data): Employer fields + `outlets[]` + files:
    - `companyLogo` (file), `acraBizfileCert` (file), `serviceContract` (file), etc.

- **PUT `/admin/employers/:employerId`** (multipart)
  - Used by: `EditEmployer.tsx`
  - Body: Same as create; existing outlets include `_id`; new ones omit `_id`. No `barcode` sent for new outlets.

- **DELETE `/admin/employers/:employerId`**
  - Used by: `Employers.tsx` delete flow.

- **DELETE `/admin/employers/:employerId/outlets/:outletId`**
  - Used by: `EditEmployer.tsx` (remove a single outlet).

### Outlets & outlet attendance

- **GET `/admin/outlets`**
  - Used by: `OutletFilter.tsx` (for job filters).

- **GET `/admin/outlets/:outletId`**
  - Used by: `OutletDetail.tsx`

- **GET `/admin/outlets/:outletId/attendance/chart`**
  - Used by: `AttendanceChart.tsx` in employer detail.
  - Query: `year`

---

## 4. Jobs (admin side)

- **GET `/admin/jobs`**
  - Used by:
    - `JobManagement.tsx` (main jobs table)
    - `ActiveJobPosting.tsx` (jobs per employer)
    - `OutletDetail.tsx` (jobs per outlet)
    - `UpcomingDeploymentTable.tsx`, `JobPostChart.tsx`, `EnhancedPayments.tsx` (job selector)
  - Query: `page`, `limit`, `status`, `search`, `employerId`, `outletId`, `startDate`, `endDate`, `sortOrder`.
  - Expects: `{ success, jobs, pagination }`.

- **GET `/admin/jobs/:jobId`**
  - Used by: `JobDetailsPage.tsx`, `ModifyJob.tsx`, `DefaultPenalties.tsx`, `ShiftsInfo.tsx`, `JobInfo.tsx`, `JobDetailsPage` delete/penalty flows.
  - Expects: `job` object with `shifts[]`, `penalties`, `barcodes`, `qrCodes`, `employer`, `outlet`.

- **POST `/admin/jobs`** and **POST `/admin/jobs/create`**
  - Used by: `NewJob.tsx`
  - Behavior: Component first calls `/admin/jobs`; if that fails (e.g. 404), it retries `/admin/jobs/create` to support both backends.
  - Body: `jobTitle`, `jobName`, `jobDescription`, `jobDate`, `employerId`, `outletId`, `locationDetails`, `applicationDeadline`, `skills[]`, `shifts[]`, etc.

- **PUT `/admin/jobs/:jobId`**
  - Used by: `ModifyJob.tsx` to update job and shifts.

- **DELETE `/admin/jobs/:jobId`**
  - Used by: `JobManagement.tsx`, `JobDetailsPage.tsx` (delete buttons).

- **PATCH `/admin/jobs/:jobId/cancel`**
  - Used by: `JobManagement.tsx` (cancel job action).

- **GET `/admin/rate-configuration`**
  - Used by: `NewJob.tsx`, `ModifyJob.tsx`, `DefaultPenalties.tsx` (rate/penalty presets).

- **GET `/admin/jobs/deployment-tracking`**
  - Used by: `UpcomingDeploymentTable.tsx`
  - Query: `startDate`, `endDate`, `employerId`

---

## 5. Applications & candidates (admin)

### Applications

- **GET `/admin/applications`**
  - Used by: `ApplicationsList.tsx`
  - Query: `page`, `limit`, `status`, `search`, etc.

- **GET `/admin/applications/:applicationId`**
  - Used by: `ApplicationDetail.tsx`

- **POST `/admin/applications/:applicationId/approve`**
  - Used by: `ApplicationDetail.tsx`, `CandidatesTable.tsx`
  - Body: `{ notes? }`

- **POST `/admin/applications/:applicationId/reject`**
  - Used by: `ApplicationDetail.tsx`, `CandidatesTable.tsx`
  - Body: `{ reason?, notes? }`

- **GET `/admin/jobs/candidates/:jobId`**
  - Used by: `CandidatesTable.tsx` for job-specific candidate list.

- **PUT `/admin/applications/status/:userId`** and **PUT `/admin/applications/status/:applicationId`**
  - Used by: `CandidatesTable.tsx` (status bulk/update fallback).
  - Body: `{ status, newStatus?, notes? }`

### Candidates & Hustle Heroes

- **GET `/admin/users`**
  - Used by: `HustleHeroesList.tsx`, `EnhancedPayments` NRIC search.
  - Query: `page`, `limit`, `search`, `role`, `status`, `profileCompleted`, `nric`.
  - React maps this to “Hustle Heroes” list (mobile workers).

- **GET `/admin/users/:userId`**
  - Used by: `EditCandidateProfile.tsx` (fallback data when candidate record is missing).

- **PUT `/admin/users/:userId/verify`**
  - Used by:
    - `HustleHeroesList.tsx` (approve / reject / suspend)
    - `EditCandidateProfile.tsx` (verify from detail)
    - `CandidateProfile.tsx` (verify/reject candidate detail view)
  - Body:
    - `HustleHeroesList`: `{ action: "Approved" | "Rejected" | "Suspended", reason? }`
    - `CandidateProfile`: `{ action: "Approved" | "Rejected", reason? }`

- **DELETE `/admin/users/:userId`**
  - Used by: `HustleHeroesList.tsx` (delete user).

- **GET `/admin/candidates`**
  - Used by: `NewApplications` widget (`components/dashboard/NewApplications.tsx`) with `limit` & `sort`.

- **GET `/admin/candidates/:candidateId`**
  - Used by: `CandidateProfile.tsx`, `EditCandidateProfile.tsx`
  - Expects candidate profile details including documents.

- **PUT `/admin/candidates/:candidateId`** (multipart)
  - Used by: `EditCandidateProfile.tsx` to update candidate, images & documents.

- **DELETE `/admin/candidates/:candidateId`**
  - Used by: `EditCandidateProfile.tsx` (delete candidate).

- **GET `/admin/schools`**
  - Used by: `EditCandidateProfile.tsx` (schools dropdown).

- **GET `/admin/postal-code/:postalCode`**
  - Used by: `EditCandidateProfile.tsx` (address auto-fill).

- **POST `/admin/users/create`**
  - Intended for: `CreateUser.tsx` (admin-created users).  
  - Frontend import exists in `App.tsx`; refer to that page for exact body shape (mirrors `NEW_END_TO_END_API_DOCUMENTATION.md` §6.5).

---

## 6. Payments, Stripe & cashout (admin)

Main components: `Payments.tsx`, `EnhancedPayments.tsx`, `EmployerPayments.tsx`, `EmployeePayments.tsx`, `WithDrawals.tsx`, invoice & sales/service report components.

- **GET `/admin/payments/transactions`**
  - Used by:
    - `Payments.tsx`, `EnhancedPayments.tsx` (main payments list)
    - `EmployerPayments.tsx` (with `type=credit`, `payerType=employer`)
    - `EmployeePayments.tsx` (employee wages list)
  - Query: standard filters from API docs (type, status, start/end dates, page, limit).
  - Expects: `{ success, payments, pagination }`.

- **POST `/admin/payments/transactions`**
  - Used by: `EnhancedPayments.tsx` “Add Transaction” modal.
  - Body: wages/shift info (`nric`, `jobId`, `shiftDate`, `startTime`, `endTime`, `penaltyAmount`, `totalAmount`, etc.).

- **PUT `/admin/payments/transactions/:transactionId/approve`**
  - Used by: `Payments.tsx`, `EnhancedPayments.tsx` (approve).

- **PUT `/admin/payments/transactions/:transactionId/reject`**
  - Used by: `Payments.tsx`, `EnhancedPayments.tsx` (reject).

- **POST `/admin/payments/transactions/bulk-approve`**
  - Used by: `EnhancedPayments.tsx` bulk approve.

- **POST `/admin/transactions/:transactionId/regenerate`**
  - Used by: `Payments.tsx`, `EnhancedPayments.tsx` (recalculate totals when hours/penalties change).

- **POST `/admin/payments/generate-payslip/:transactionId`**
  - Used by: `EnhancedPayments.tsx` “Generate payslip” action.

- **POST `/admin/payments/transactions/:transactionId/refund`**
  - Used by: `EnhancedPayments.tsx` (process a refund).

### Stripe config & intents

- **GET `/stripe/config`**
  - Used by: Stripe-related payment UI (see `StripePaymentModal.tsx`).

- **POST `/stripe/create-payment-intent`**
  - Used by: `StripePaymentModal.tsx` to obtain `clientSecret`.

### Admin cashout

- **POST `/admin/cashout`**
  - Used by: `WithDrawals.tsx`
  - Body: `{ employeeId, transactionType, date, details, amount, cashOutMethod, accountDetails }`
  - Matches API docs for bank account vs PayNow.

### Reports

- **GET `/admin/sales-report`**
  - Used by: `salesreport.tsx`
  - Query: date range + `employerId`.

- **GET `/admin/invoice-report`**
  - Used by: `invoice.tsx`.

- **GET `/admin/service-report`**
  - Used by: `sevicereport.tsx` (job-based view, plus `GET /admin/jobs?limit=50`).

---

## 7. Timesheets

Implemented in `TimesheetManagement.tsx`, aligned to `NEW_END_TO_END_API_DOCUMENTATION.md` §8.

- **GET `/admin/timesheets`**
  - Query: `page`, `limit`, `startDate`, `endDate`, `employerId`.
  - Used for: Timesheet list table with pagination.

- **POST `/admin/timesheets/generate`**
  - Body:
    - `{ employerId, startDate, endDate }`
  - Used by: Generate form in `TimesheetManagement.tsx`.

- **POST `/admin/timesheets/:timesheetId/send-email`**
  - Used by: “Email” button per-row in timesheet list.

- **GET `/admin/timesheets/:timesheetId/download?format=pdf`**
  - Used by: “Download” button per-row.
  - Frontend uses `axiosInstance` with `responseType: "blob"` and downloads `timesheet-{id}.pdf`.

---

## 8. QR codes & barcodes

Implemented in `QrCode.tsx` and related filter components.

- **GET `/admin/qr-codes`**
  - Query: `jobId`, `employerId`, `outletId`, `status`.

- **POST `/admin/qr-codes/generate`**
  - Body: `{ employerId, outletId, jobId }`.

- **DELETE `/admin/qr-codes/:qrCodeId`**
  - Used for deleting a QR code.

Supporting data:

- **GET `/admin/employers?limit=100`** and **GET `/admin/jobs?employerId=&outletId=&limit=100`** for dropdowns.

---

## 9. Notifications (admin)

Implemented in `NotificationCenter.tsx` and `SendNotification.tsx`.

- **GET `/admin/notifications`**
  - Query: `limit`, `source=admin`.

- **PUT `/admin/notifications/:notificationId/read`**
  - Used by: notification item click.

- **PUT `/admin/notifications/read-all`**
  - Used by: “Mark all as read” button.

- **POST `/admin/notifications/send`**
  - Used by: `SendNotification.tsx` (admin broadcast).

---

## 10. Penalties & settings

- **GET `/admin/penalties`**
  - Used by: `PenaltyManagement.tsx`, `DefaultPenalties.tsx`, `JobDetailsPage.tsx` (read current penalty rules).

- **PUT `/admin/penalties`**
  - Used by: `PenaltyManagement.tsx`
  - Body: `{ penalties: [...] }` (conditions + penalty amounts).

---

## 11. Support & profile

- **POST `/support/feedback`**
  - Used by: `SupportFeedback.tsx`
  - Body: `{ name, email, subject, message }`.

- **GET `/admin/profile/image`**
  - Used by: `Header.tsx` to show admin avatar.

- **POST `/admin/profile/upload-image`**
  - Used by: `Header.tsx` (change profile image – see component for form-data details).

---

## 12. Error handling & auth headers

- All requests (via `axiosInstance` / `axiosFileInstance`):
  - Add header `Authorization: Bearer {authToken}` if token exists in either `localStorage` or `js-cookie` (`authToken` key).
  - `withCredentials: true` is set on both instances.

- Response interceptor in `authInstances.ts`:
  - If `response.data.success === false`, shows a toast with `response.data.message`.
  - Handles:
    - `401`: clears token, shows “Session expired” toast, redirects to `/login`.
    - `403`, `404`, `5xx`, network/timeout errors with user-friendly toasts.

This document describes the **actual API usage of the current React Admin codebase** so backend and frontend can validate paths, methods, payloads, and responses end-to-end.

