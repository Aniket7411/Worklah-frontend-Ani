# WorkLah Admin Panel – E2E Testing & Handover Note

**Date:** February 17, 2025  
**Purpose:** End-to-end testing summary, fixes applied, and pending/improvement items before Play Store deployment.

---

## 1. Testing Conducted

### 1.1 Admin Login
- **Login page** at `/login` loads correctly (WorkLah branding, email, password, Sign in, Forgot Password).
- **Form validation:** Required fields and submit behavior work.
- **Auth flow:** With invalid or missing backend, error is handled and user remains on login page; toasts show API/network messages.
- **Protected routes:** Unauthenticated access to `/`, `/employers`, `/applications`, etc. correctly redirects to `/login`.

**Note:** Full login success requires the backend API running (e.g. `http://localhost:3000/api` or production) and valid admin credentials.

### 1.2 Create Employer / Edit Employer
- **Routes:** `/employers`, `/employers/add-employer`, `/employers/:id/edit` are defined and protected.
- **AddEmployer:** Form includes company details, outlets (optional), file uploads (logo, ACRA, contract), Google Places address autocomplete (when `VITE_GOOGLE_MAPS_API_KEY` is set).
- **EditEmployer:** Loads employer by ID, supports outlet add/edit/delete with confirmation modal.
- **Backend required:** All create/update/delete employer actions call `axiosInstance`; full E2E needs API and auth.

### 1.3 Job Posting & Job Editing
- **Routes:** `/jobs/job-management`, `/jobs/create-job`, `/jobs/:jobId`, `/jobs/:jobId/modify` are wired.
- **NewJob:** Employer selection, outlet selection (or manual), shifts, vacancy, pay rates, application deadline, etc.
- **ModifyJob:** Fetches job by `jobId`, pre-fills form, supports shift add/edit/delete; uses same data shape as create.
- **Backend required:** Job CRUD and list depend on `/admin/jobs` and `/admin/employers` (for dropdowns).

### 1.4 Outlet Management
- **In-app flow:** Outlets are managed under Employers:
  - **Add employer:** Optional outlets can be added on create.
  - **Edit employer:** Outlets list with add/edit/delete; delete uses confirmation modal.
- **Employer detail (ActiveJobPosting):** “Number of Outlets” tab shows outlet list for that employer.
- **Job flow:** When creating/editing a job, outlet is chosen from the selected employer’s outlets (or manual entry).

### 1.5 Applicant Job Application & Confirmation
- **Applications list:** `/applications` – list with search, status filter (Pending, Approved, Approved – not confirmed, Rejected), pagination.
- **Application detail:** `/applications/:applicationId` – applicant and job info, Approve (with notes) and Reject (with reason).
- **Confirmation:** “Approved – not confirmed” filter targets applications where admin approved but candidate has not yet confirmed (native app flow); backend should set `candidateConfirmed` when the worker confirms.

**Backend required:** All application list/detail/approve/reject use `/admin/applications` endpoints.

### 1.6 Payments (Employee & Employer)
- **Employee payments:** `/payments` – tabs (Payments, Withdrawals, etc.), filters, EnhancedPayments table; Stripe pay and refund when backend exposes `/stripe/config` and payment intents.
- **Employer payments:** `/employer-payments` – list of employer-side transactions; filter by status (e.g. pending/outstanding).
- **Stripe:** `StripePaymentModal` and EnhancedPayments use Stripe Elements; publishable key comes from backend `/stripe/config`. Ensure client Stripe keys are not used in frontend; only publishable key is needed in app (from env or API).

---

## 2. Fixes Applied in This Pass

| Item | Change |
|------|--------|
| **Route typo** | `outlate-attendnce` → `outlet-attendance` in `App.tsx` and `JobDetailsPage.tsx` (outlet attendance page link). |
| **State setter typo** | `setOutet` → `setOutlet` in `JobDetailsPage.tsx` so outlet state updates correctly for the “Attendance Rate” link. |
| **Next.js directive** | Removed `"use client"` from Vite/React files where it is not used: `EmployerPayments.tsx`, `EmployeePayments.tsx`, `EnhancedPayments.tsx`, `StripePaymentModal.tsx`, `PaymentFilters.tsx`. |

---

## 3. Pending / Before Production

### 3.1 Environment & API
- **API base URL:** `src/lib/authInstances.ts` currently uses `http://localhost:3000/api`. For production, switch to the live API (e.g. `https://worklah-updated-dec.onrender.com/api` or client’s URL) via `VITE_API_BASE_URL` or equivalent.
- **Stripe:** Backend should be configured with the client’s Stripe API keys (secret key only on server). Admin panel only needs the publishable key from backend (e.g. `/stripe/config`). Do not put secret key in frontend or in repo.

### 3.2 Optional Improvements
- **Loader component:** `Loader.jsx` is used by EditEmployer and ModifyJob; consider adding a small `Loader.d.ts` or converting to `Loader.tsx` to remove `@ts-ignore` if desired.
- **Remaining “use client”:** Other files (e.g. `CandidateProfile.tsx`, `OutletDetail.tsx`, `TimesheetManagement.jsx`, `CreateUser.jsx`, `SendNotification.jsx`, etc.) still have `"use client"`; harmless in Vite but can be removed for consistency.
- **Google Maps:** Add employer address autocomplete works when `VITE_GOOGLE_MAPS_API_KEY` is set in `.env`; document this for deployment.

### 3.3 Recommended Final Checks (With Backend Running)
1. Log in with real admin credentials and confirm dashboard loads.
2. Create an employer with at least one outlet, then edit and add/remove an outlet.
3. Create a job for that employer/outlet, then modify it (e.g. shift or vacancy).
4. Open Applications, approve/reject an application, and (if applicable) verify “Approved – not confirmed” filter.
5. On Payments, confirm Stripe config loads and (if available) run one test payment in test mode.
6. Test Forgot Password flow if backend supports it.

---

## 4. Summary

- **Frontend flows** (login UI, protected routes, employer/job/application/outlet/payment pages and navigation) are in place and behave as expected for a Vite + React admin panel.
- **Route and state bugs** (outlet-attendance URL and `setOutlet`) are fixed.
- **Unnecessary “use client”** was removed from key payment and filter components.
- **Full E2E** (real login, CRUD, Stripe) depends on the backend being up and configured (API URL, auth, Stripe keys). Run the “Recommended Final Checks” with the backend before handover and Play Store deployment.

If you share the production API URL and confirm Stripe is configured on the server, the only change needed in the repo is updating `API_BASE_URL` (or env) in `authInstances.ts` for production builds.
