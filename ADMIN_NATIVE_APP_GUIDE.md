# Admin Panel – Native App Support Guide

**Purpose:** Use this document to update the ReactJS Admin Panel so it supports the full native app (React Native) flow: **apply → admin approve → candidate confirm/cancel → clock in/out → wallet**.

**Related docs:** `NATIVE_APP_BACKEND_AND_ADMIN_REQUIREMENTS.md`, `APPLICATION_APPROVAL_FLOW_FOR_NATIVE_APP.md`

---

## 1. What the Backend Already Does (No Admin Change Needed)

- When you **approve** an application:
  - Backend sets `adminStatus = Confirmed`, `status = Upcoming`, `candidateConfirmed = false`.
  - Backend **creates a notification** for the applicant: title **"Application Approved"**, message **"Your application for [Job Name] has been approved. Please confirm your attendance or cancel if you can't make it."**
  - Shift vacancy is updated.
- The **native app** shows that notification and lets the user **Confirm** or **Cancel**. Only after **Confirm** does the shift appear in their Upcoming Shifts and allow clock-in.

So the admin panel does **not** need to send the notification manually; the backend does it on approve.

---

## 2. Admin UI Checklist (What to Update)

### 2.1 Applications List & Detail

| Item | Action |
|------|--------|
| **Application status** | Show `adminStatus`: Pending / Approved / Rejected. |
| **Candidate confirmed** | Show **`candidateConfirmed`**: `true` = candidate confirmed attendance; `false` = **awaiting candidate confirm** (approved but not yet confirmed). |
| **Filters** | Optionally filter by “Approved but not confirmed” (e.g. `adminStatus = Approved` and `candidateConfirmed = false`) to chase no-responses. |
| **Labels** | For approved applications: show “Confirmed by candidate” when `candidateConfirmed === true`, and “Awaiting candidate confirm” when `candidateConfirmed === false`. |

### 2.2 Approval Flow (No Change to Button)

- Keep **Approve** and **Reject** as today.
- After **Approve**, the backend sends the notification; the candidate sees **Confirm** / **Cancel** in the app. You can show in the list that the candidate has not yet confirmed (`candidateConfirmed: false`) until they do.

### 2.3 Applicants per Job

- When viewing applicants for a job, show for each application:
  - **Status** (e.g. Pending, Approved, Rejected, Cancelled).
  - **Candidate confirmed** (Yes/No) for approved ones, so you can see who has not yet confirmed.

### 2.4 Payments (Later)

- When Stripe is integrated, admin can handle **release payment** / cashout. For now, wallet/balance/cashout in the app can use stub data; no admin UI change required until payment is live.

---

## 3. Admin API Quick Reference

**Base URL:** same as your existing admin API (e.g. `https://worklah-updated-dec.onrender.com/api` or `http://localhost:3000/api`).

### 3.1 Applications

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/admin/applications` | List applications (query: `page`, `limit`, `status`, `jobId`, `userId`, `startDate`, `endDate`). |
| GET | `/admin/applications/:applicationId` | Single application details. |
| POST | `/admin/applications/:applicationId/approve` | Approve application (body optional: `notes`). Backend sets status and **sends notification** to candidate. |
| POST | `/admin/applications/:applicationId/reject` | Reject application (body: e.g. `reason`, `notes`). |
| POST | `/admin/applications/bulk-action` | Bulk approve/reject (body: `applicationIds`, `action`: `"approve"` \| `"reject"`). |

### 3.2 Response Fields You Need for Native App Support

**List (GET /admin/applications)** – each item includes:

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Application ID. |
| `userId` | string | User ID. |
| `user` | object | fullName, phoneNumber, profilePicture, email, profileCompleted, resumeUrl, employmentStatus. |
| `jobId`, `job` | string / object | Job ref and name/date. |
| `shiftId`, `shift` | string / object | Shift ref and start/end time. |
| `status` | string | Pending, Upcoming, Completed, Cancelled, No Show. |
| `adminStatus` | string | **Pending** \| **Approved** \| Rejected. (Backend stores `Confirmed` but returns `Approved` for display.) |
| **`candidateConfirmed`** | **boolean** | **`true`** = candidate confirmed attendance; **`false`** = awaiting candidate confirm (only relevant when `adminStatus === 'Approved'`). |
| `appliedAt` | string/date | When they applied. |

**Single (GET /admin/applications/:applicationId)** – same fields plus full user/profile details and `adminNotes`.

---

## 4. Suggested Admin UI Copy

- **Status column (approved applications):**
  - If `candidateConfirmed === true` → **“Confirmed”** or “Candidate confirmed”.
  - If `candidateConfirmed === false` → **“Awaiting confirm”** or “Awaiting candidate confirm”.
- **Filter / tab (optional):** e.g. “Approved – not confirmed” to list applications that are approved but the candidate has not yet confirmed.
- **Tooltip or help:** “After you approve, the candidate gets a notification in the app and must confirm or cancel. Only confirmed shifts appear in their Upcoming Shifts.”

---

## 5. End-to-End Flow (Reminder)

| Step | Who | What |
|------|-----|------|
| 1 | User (app) | Applies for job. |
| 2 | Admin (panel) | Approves application. |
| 3 | Backend | Sets `adminStatus=Confirmed`, `candidateConfirmed=false`, **sends notification** to user. |
| 4 | User (app) | Sees “Application Approved – please confirm or cancel”. |
| 5a | User (app) | Confirms → shift appears in Upcoming; can clock in on day. |
| 5b | User (app) | Cancels → application cancelled; vacancy released. |
| 6 | Admin (panel) | Can see `candidateConfirmed` and status; no extra action required for notification. |

---

## 6. Summary Table – What to Add in Admin

| Area | Update |
|------|--------|
| Applications list | Add column or badge **“Candidate confirmed”** (Yes/No) using `candidateConfirmed`. |
| Application detail | Show **“Candidate confirmed: Yes/No”** (and “Awaiting candidate confirm” when false). |
| Filters | Optional: filter by Approved + not confirmed (`adminStatus === 'Approved'` and `candidateConfirmed === false`). |
| Copy | Short note that after approve, the candidate must confirm in the app; only then does the shift show in Upcoming. |
| Payments | No change until Stripe is integrated; then admin can handle payment release/cashout. |

---

**Document version:** 1.0  
**Use this doc to:** Update the admin panel so it displays `candidateConfirmed` and supports the native app approval → confirm/cancel flow. Backend already handles notifications on approve.
