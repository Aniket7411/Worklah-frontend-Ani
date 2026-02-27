# Share with React Admin (ReactJS) Team

**Purpose:** Give this file (and the documents listed below) to the React Admin panel developers so they can integrate with the backend and implement missing features.

---

## Documents to share

| Document | Use for |
|----------|--------|
| **ADMIN_BACKEND_INTEGRATION.md** | **Primary reference.** Which React component calls which API: path, method, query, body, and expected response. Use this to wire every admin screen to the correct endpoint. |
| **ADMIN_AND_NATIVE_API_CHECKLIST.md** | **Testing checklist.** Section 2 is “React Admin – What to test”: auth, dashboard, employers, jobs, applications, users/candidates, payments, timesheets, QR, notifications, reports, support. Use it to verify each feature end-to-end. |
| **NEW_END_TO_END_API_DOCUMENTATION.md** | **Full API contract.** Request/response shapes, query params, and error format for every endpoint. Refer to it when payloads or responses are unclear. |
| **VERIFICATION_AND_ADMIN_ACTIONS.md** | **User verification (Hustle Heroes).** Backend does **not** auto-approve when users upload documents; only admin approval does. Use this to implement: (1) Users/Hustle Heroes list with **verification status** (Pending / Approved / Rejected / Suspended), (2) **Approve / Reject / Suspend / Delete** per user with the exact API calls in the doc. |

Optional (feature-specific):

- **BACKEND_FIXES_AND_SPEC.md** – Employer logo upload, job shape, penalties, QR + job linkage.
- **LOCATION_BACKEND_AND_NATIVE.md** – Address and “jobs near me” if admin uses location.
- **PAYMENT_FLOW.md**, **QR_CODE_SPEC.md** – Payments and QR flows.

---

## Base URL and auth

- **Base URL:** `http://localhost:3000/api` (dev) or your deployed API (e.g. `https://worklah-updated-dec.onrender.com/api`).
- **Auth:** After admin login, send `Authorization: Bearer <adminToken>` on every request.
- **Responses:** All APIs return `{ success: true | false, message?, ... }`. On error, show `message` to the user.

---

## Must implement (from VERIFICATION_AND_ADMIN_ACTIONS.md)

1. **Users / Hustle Heroes list**
   - Call **GET** `/admin/users` with optional `page`, `limit`, `search`, `role=USER`, and **`status`** (`Pending` | `Approved` | `Rejected` | `Suspended` to filter by verification).
   - Show **verification status** for each user (badge/column): Pending, Approved, Rejected, Suspended.

2. **Per-user actions**
   - **Approve:** **PUT** `/admin/users/:userId/verify` with body `{ "action": "Approved" }`.
   - **Reject:** **PUT** `/admin/users/:userId/verify` with body `{ "action": "Rejected", "reason": "..." }`.
   - **Suspend:** **PUT** `/admin/users/:userId/verify` with body `{ "action": "Suspended", "reason": "..." }`.
   - **Delete:** **DELETE** `/admin/users/:userId` (with confirmation; 403 if admin user).

   After each action, refresh the list/detail and show the backend `message`. Show confirmation before Reject, Suspend, and Delete.

---

## Quick reference

- **Which API does component X use?** → **ADMIN_BACKEND_INTEGRATION.md**
- **Did we cover all screens?** → **ADMIN_AND_NATIVE_API_CHECKLIST.md** §2
- **Exact request/response format?** → **NEW_END_TO_END_API_DOCUMENTATION.md**
- **How does user verification work and what to build?** → **VERIFICATION_AND_ADMIN_ACTIONS.md**

Share this file and the four main documents above with the React Admin team so they can implement and test against the backend.
