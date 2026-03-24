# WorkLah API — Client Handover (Admin + Native)

Single reference for **base URL**, **authentication**, **response conventions**, **errors**, and **all HTTP routes** as implemented in this backend. Share this with **admin panel** and **native app** developers.

**Server entry:** `index.js`  
**Default port:** `process.env.PORT || 3000`  
**API prefix:** all routes below are under the host root (e.g. `https://api.example.com/api/...`).

---

## 1. Environment variables (ops)

| Variable | Purpose |
|----------|---------|
| `MONGOOSE_URI_STRING` | MongoDB connection (required for DB features) |
| `JWT_SECRET` | Sign/verify user and admin JWTs |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `VERIFY_SERVICE_SID` | OTP/SMS (optional; server logs a warning if missing) |
| `STRIPE_SECRET_KEY` etc. | Stripe payments/payouts (see `utils/stripe.js`) |
| `CLOUDINARY_*` | Optional; employer logo uploads use Cloudinary when set |
| `FRONTEND_URL` | Allowed CORS origin (with localhost and Vercel admin URL in code) |
| `BASE_URL` | Used in some report URLs (default fallback in code) |

---

## 2. Authentication

### Worker / user (native app)

- **Header:** `Authorization: Bearer <jwt>`
- **Cookie (optional):** `authToken` — also read by middleware
- Token payload must include `userId` / `_id` / `id` (see `middlewares/auth.js`).
- **401 responses:** missing token, invalid token, expired token — message: `Unauthorized: ...`

### Admin

- Admin routes use **`authMiddleware`** + often **`adminOnlyMiddleware`** (JWT user must be admin).
- **Admin login:** `POST /api/admin/login` — returns token for admin user (see `routes/adminRoutes.js`).

### Public endpoints

- No token: e.g. parts of `/api/auth/*`, `/api/jobs/search`, `/api/home/*` as listed below, health is not explicit — 404 JSON for unknown paths.

---

## 3. Response shapes

### Success (common)

Many handlers use helpers from `utils/responseHelper.js`:

- **Simple:** `{ success: true, ...fields }`
- **Paginated:** `{ success: true, ..., pagination: { currentPage, totalPages, totalItems, itemsPerPage, hasNextPage, hasPrevPage } }`

Some older controllers use `{ success: true, message, data }` — treat both patterns as success when `success === true`.

### Errors

Global handler in `index.js` (after routes):

| HTTP | When |
|------|------|
| 400 | Mongoose `ValidationError`, bad ID (`CastError`) |
| 401 | JWT invalid/expired (`JsonWebTokenError`, `TokenExpiredError`) |
| 404 | Unknown route: `{ success: false, message: "Endpoint not found", error: "NotFoundError" }` |
| 500 | Default: `{ success: false, message, error }` |

Many controllers return:

```json
{ "success": false, "message": "<human-readable cause>", "error": "<CodeLikeValidationError>" }
```

**CORS:** Mobile apps often send no `Origin` — allowed. Browsers: localhost + configured `FRONTEND_URL` + permissive production behavior in `index.js`.

---

## 4. Stripe webhook (special case)

- **Route:** `POST /api/stripe/webhook`
- **Body:** **raw** JSON (registered **before** `express.json()` in `index.js`). Do not JSON-parse in a proxy before Express.

---

## 5. API routes (method + path)

Prefix **`/api`** for all groups below unless noted.

### Auth — `/api/auth`

| Method | Path | Notes |
|--------|------|--------|
| GET | `/validate` | Validate token |
| POST | `/check-user` | |
| POST | `/generate-otp` | |
| POST | `/register` | |
| POST | `/resend-otp` | |
| POST | `/login` | |
| GET | `/users` | auth |
| GET | `/users/:id` | auth |

### User (native) — `/api/user`

| Method | Path | Notes |
|--------|------|--------|
| POST | `/register`, `/signup` | |
| POST | `/login` | OTP flow |
| POST | `/verify-otp` | |
| POST | `/forgot-password` | |
| GET | `/me` | auth |
| GET | `/profile` | auth |
| GET | `/profile-completion` | auth |
| GET | `/applications` | auth |
| POST | `/applications/:applicationId/confirm` | auth |
| GET | `/saved-jobs` | auth |
| POST | `/saved-jobs` | auth |
| DELETE | `/saved-jobs/:jobId` | auth |
| GET | `/authenticated/auth` | auth |
| POST | `/logout` | auth |
| GET | `/` | list users |
| GET | `/:email` | parameterized |

### Jobs (worker + admin create) — `/api/jobs`

| Method | Path | Notes |
|--------|------|--------|
| GET | `/ongoing`, `/completed`, `/cancelled` | auth |
| POST | `/markComplete` | auth |
| GET | `/details/:applicationId` | auth |
| GET | `/banks` | |
| POST | `/banks` | |
| GET | `/balance` | auth — wallet balance + total earnings from `Wallet` |
| POST | `/cashout` | auth — legacy cashout stub |
| GET | `/transactions` | auth — from wallet transactions |
| GET | `/search` | public search |
| GET | `/employers` | |
| GET | `/` | auth — listing |
| POST | `/create` | admin only |
| GET | `/:id` | auth |
| PUT | `/:id` | admin or employer |
| DELETE | `/:id` | admin or employer |
| POST | `/:jobId/apply` | auth |
| POST | `/:jobId/apply-multi` | auth |
| POST | `/:jobId/applications/:applicationId/cancel` | auth |
| POST | `/:jobId/cancel` | auth |

### Shifts — `/api/shifts`

| Method | Path | Notes |
|--------|------|--------|
| POST | `/` | create |
| GET | `/` | auth — availability |
| GET | `/:shiftId` | |
| PUT | `/:shiftId` | |
| DELETE | `/:shiftId` | |
| GET | `/:jobId` | auth — **note:** overlaps with `/:shiftId` ordering |
| GET | `/job/:jobId` | job details |

### Home (legacy/alternate) — `/api/home`

| Method | Path |
|--------|------|
| GET | `/user/info` |
| GET | `/jobs/search` |
| GET | `/jobs/details` |
| GET | `/shifts/availability` |
| POST | `/jobs/apply` |
| GET | `/notifications` |
| GET | `/dates/navigation` |
| GET | `/jobs/manage` |

### Workers — `/api/workers`

| Method | Path |
|--------|------|
| GET | `/` |
| GET | `/:id` |
| POST | `/` |
| PUT | `/:id` |
| DELETE | `/:id` |
| PATCH | `/:id/work-pass-status` |

### Employers — `/api/employers`

Mounted for **admin** at `/api/admin/employers` (same router: `employerRoutes.js`). **All routes:** `authMiddleware` + `adminOnlyMiddleware`.

| Method | Path |
|--------|------|
| GET | `/`, `/admin` |
| GET | `/:outletId/overview` |
| POST | `/`, `/create` (multipart: logo, certs, contract) |
| DELETE | `/:employerId/outlets/:outletId` |
| PATCH | `/:employerId/outlets/:outletId` |
| GET | `/:id` |
| PUT | `/:id` |
| DELETE | `/:id` |

### QR / attendance (worker) — `/api/qr`, `/api/attendance`

**`/api/qr`**

| Method | Path | Auth |
|--------|------|------|
| GET | `/upcoming` | yes |
| POST | `/validate-barcode` | |
| POST | `/generate` | |
| POST | `/scan` | yes |
| GET | `/shifts` | yes |
| POST | `/clock-in` | yes |
| POST | `/clock-out` | yes |

**`/api/attendance`**

| Method | Path | Auth |
|--------|------|------|
| POST | `/clock-in` | yes |

### Wallet / profile wallet — `/api/wallet`, `/api/profile`

**`/api/wallet`:** `add-credit`, `cashout`, `GET /` (details) — auth.

**`/api/profile`:** profile CRUD, payment details, stats, wallet/cashout aliases — see `routes/profileRoutes.js`.

### Payments / withdrawals — `/api/payments`, `/api/withdrawals`

See `routes/paymentRoutes.js`, `routes/withdrawalRoutes.js` (create/list patterns).

### Dashboard (worker) — `/api/dashboard`

Same controller as admin dashboard routes — **use `/api/admin/dashboard` for admin** (see below).

### Cancellation — `/api/cancellation`

| Method | Path |
|--------|------|
| GET | `/:jobId` |
| POST | `/cancel` |

### Bookmark — `/api/bookmark`

| Method | Path | Auth |
|--------|------|------|
| POST | `/` | yes |
| GET | `/` | yes |
| DELETE | `/remove` | yes |

### Support — `/api/support`

| Method | Path |
|--------|------|
| POST | `/feedback` |

### Notifications — `/api/notifications`

List, read, unread count, delete — mostly auth (see `routes/notificationRoutes.js`).

### Requirements / penalties / outlets — `/api/requirements`, `/api/penalties`, `/api/outlets`

CRUD-style routes per files (some public).

### Hustle Heroes — `/api/hustleheroes`

Employee list/update/block — see `routes/hustleHeroesRoutes.js`.

### Cashout (worker + admin process) — `/api/cashout`

| Method | Path | Notes |
|--------|------|--------|
| POST | `/add-credit` | auth — delegates to wallet `addCredit` |
| POST | `/` | auth — wallet cash out |
| PUT | `/process` | **Admin JWT** — body: `transactionId`, optional `status`/`notes` |
| GET | `/` | auth — worker’s `Transaction` history |

### Booking (legacy) — `/api/booking`

| Method | Path |
|--------|------|
| POST | `/book-shift` | auth |

### Stripe (non-webhook) — `/api/stripe`

Config + payment intent — see `routes/stripeRoutes.js`.

---

## 6. Admin API — `/api/admin/...`

### Core — `/api/admin`

Login/logout/me, dashboard widgets, rate config, penalties, schools, postal-code placeholder — see `routes/adminRoutes.js` (many `GET` dashboard paths).

### Jobs — `/api/admin/jobs`

List, deployment-tracking, candidates by job, CRUD, status, duplicate, deactivate, cancel, approve/reject application — **all** require admin JWT (`routes/adminJobRoutes.js`).

**Metrics:** Job list includes **attendance rate** derived from applications: among `adminStatus === 'Confirmed'`, ratio that have `status === 'Completed'` or `clockInTime` set.

### Candidates — `/api/admin` (prefix shared)

`routes/adminCandidateRoutes.js`: `/candidates`, `/jobs/candidates/:jobId`, CRUD candidate, verify, application status.

**Metrics:** `turnUpRate` and `completedJobs` use real aggregates from `Application`.

### Applications — `/api/admin/applications`

List, get by id, approve, reject, bulk action, status by user — see `adminApplicationRoutes.js`.

**Candidate rows for a job** include **`completedJobs`**: count of applications with `status: 'Completed'` for that user (historical).

### Users — `/api/admin/users`

Create, list, applications, transactions, verify, status, delete, get by id — `adminUserRoutes.js`.

### Outlets — `/api/admin/outlets`

`adminOutletManagementRoutes.js` + `adminOutletRoutes.js` (attendance under outlet).

### Attendance — `/api/admin/attendance`

List, update — `adminAttendanceRoutes.js`.

### Notifications — `/api/admin/notifications`

List, send, mark read — `adminNotificationRoutes.js`.

### Payments / cashout — `/api/admin`

`adminPaymentRoutes.js`: transactions, approve/reject/refund, bulk approve, payslip placeholder, cashout process/reject, etc.

### Reports — `/api/admin`

`adminReportsRoutes.js`: `POST /reports/generate`, `GET /sales-report`, `GET /invoice-report`, `GET /service-report`.

**Sales report:** `hoursFulfilled` sums `totalWorkingHours` (fallback `duration`) from linked **Shift** for **Completed** applications per employer.

### Settings — `/api/admin`

System settings, rate configuration, penalties, postal-code stub, schools stub — `adminSettingsRoutes.js`.

### QR codes — `/api/admin/qr-codes`

List, delete, generate — `adminQRRoutes.js`.

### Timesheets — `/api/admin/timesheets`

Generate, list, send-email, download — `adminTimesheetRoutes.js` (email/PDF may still be simplified internally).

### Dashboard metrics — `/api/admin/dashboard`

Stats, charts, overview — `dashboardRoutes.js` (admin-only).

### Employers

Same as **Employers** section: **`/api/admin/employers`**.

Detailed **create (admin panel)** contract: see **§7.1** — implemented by `AddEmployer.tsx` + `buildEmployerFormData` in `src/utils/dataTransformers.ts`.

---

## 7. Data model notes (for clients)

- **Application:** `adminStatus`: `Pending` | `Confirmed` | `Rejected`; **worker-facing “Approved”** often mapped from `Confirmed`. `status`: `Upcoming` | `Completed` | `Cancelled` | `No Show`.
- **Wallet:** `balance`, `transactions[]` with `type` `Credit` | `Debit`; **`GET /api/jobs/balance`** exposes `balance` and **`totalEarnings`** (sum of Credit amounts).
- **Employer create/update:** often **multipart** with JSON in `data` field plus files — see `employerController.js`.

### 7.1 Admin create employer — `POST /api/admin/employers` (multipart)

**Auth:** `Authorization: Bearer <admin JWT>`  
**Content-Type:** `multipart/form-data` (do not send `application/json` for the whole body).

| Part | Name | Required | Description |
|------|------|----------|-------------|
| JSON | `data` | **Yes** | Stringified JSON object (see schema below). |
| File | `companyLogo` | No | Image — admin UI accepts `image/*`. |
| File | `acraBizfileCert` | No | ACRA cert — PDF or image in UI. |
| File | `serviceContract` | No | **PDF only** in admin UI (`application/pdf`). |

**`data` JSON schema (admin panel):**

| Field | Type | Notes |
|-------|------|--------|
| `phoneCountry` | string | `"SG"` \| `"MY"` \| `"IN"` — drives client-side phone validation; backend may store or use for formatting. |
| `companyLegalName` | string | Required in UI. |
| `companyNumber` | string \| `null` | ACRA company number; **unique if provided** — send `null` or omit when empty. |
| `hqAddress` | string | HQ / registered address (required in UI). |
| `contactPersonName` | string | Main contact name. |
| `jobPosition` | string | Optional; position in company. |
| `mainContactNumber` | string | Required; validated per `phoneCountry`. |
| `additionalContacts` | array | Optional; each `{ "extension": string \| null, "number": string }` — only entries with a non-empty `number` are sent. |
| `emailAddress` | string | Required; employer portal / notifications. |
| `industry` | string | Required (fixed list or custom when user picks “Others”). |
| `serviceAgreement` | string | UI default `"Active"` if unset; values e.g. `Active`, `In Discussion`, `Completed`, `Expired`. |
| `contractExpiryDate` | string \| `null` | Optional; **`YYYY-MM-DD`** or `null`. |
| `generateCredentials` | boolean | If `true`, backend should create an employer login user and return credentials (see success response). |
| `outlets` | array | Optional (zero outlets allowed). Each new outlet: `{ "name", "managerName", "contactNumber", "contactExtension": string \| null, "address", "openingHours": string \| null, "closingHours": string \| null, "isActive": boolean }`. **No** `_id` on create. **No** outlet barcode in payload — backend generates barcodes/QR linkage when applicable. Partially filled outlet rows are **omitted** (all of name, manager, contact, address must be non-empty to include). |

**Success (200 / 201):**

- Typical: `{ "success": true, ...employer fields }`
- When `generateCredentials` was `true` and a password is issued, admin panel expects optional:
  - `credentials`: `{ "email": string, "password": string, "emailSent"?: boolean, "sentToEmail"?: boolean }`  
  - Password may alternatively be returned under one of: `password`, `plainPassword`, `tempPassword`, `generatedPassword` (panel checks these).  
  - Email may be under `email` or `loginEmail`. If `emailSent` / `sentToEmail` is `false`, the UI tells the admin to copy credentials manually.

**Errors:**

- **409** — duplicate unique field (e.g. email, company number). Panel expects `{ "success": false, "message": string, "error": "DuplicateKeyError" }` when applicable so the UI can focus the relevant field.
- **400** — validation (body / missing required JSON in `data`).

**Alias:** `POST /api/admin/employers/create` — same contract (admin job create flow may try both paths for compatibility).

---

## 8. Known limitations / follow-ups (not blocking core flows)

| Area | Notes |
|------|--------|
| **Password reset email** | `userAuthController`: email send not wired — implement provider + template. |
| **Payslip PDF** | `adminPaymentController`: PDF generation marked as future work. |
| **Postal / schools API** | `adminSettingsController` / `adminController`: placeholders — integrate OneMap or national APIs if required. |
| **Timesheet export** | Email/PDF/Excel in `adminTimesheetController` may return placeholders — confirm in UAT. |
| **Legacy job cashout** | `POST /api/jobs/cashout` is still a lightweight stub; prefer **`/api/wallet/cashout`** + **`/api/cashout`**. |
| **Cashout process** | `PUT /api/cashout/process` requires **admin** Bearer token. |

---

## 9. Quick test checklist

1. `POST /api/admin/login` → receive token.
2. `GET /api/admin/jobs` with `Authorization: Bearer <token>`.
3. Native: `POST /api/user/login` → OTP flow → `GET /api/user/me` with Bearer token.
4. `GET /api/jobs/balance` with user token → `balance` + `totalEarnings` numeric.

---

*Generated for handover — aligns with backend as of last update. When you add routes, update this file in the same PR.*
