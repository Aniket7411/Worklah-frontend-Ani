# Admin: Applicant/User Review & Approval Guide

**Audience:** Admin panel (React) developers, Admin users  
**Purpose:** Cross-check applicant details and approve or reject accordingly. Aligns with BACKEND_UPDATE_RESUME_AND_APPLY.md – applicants can now apply with basic profile (no resume/NRIC required), so admin may see applicants with varying levels of documentation.

---

## 1. Summary of Changes (Resume & Apply Without NRIC)

Per **BACKEND_UPDATE_RESUME_AND_APPLY.md**:

- **Users can apply** when they have filled only these **7 core fields**: fullName, email, phoneNumber, dateOfBirth, gender, postalCode, employmentStatus.
- **Resume** (`resumeUrl`) and **NRIC** (number, front/back images) are **optional** for applying.
- As a result, **admin may see applicants** who have:
  - Basic details only (no resume, no NRIC docs)
  - Basic details + resume
  - Basic details + NRIC (for Singaporean/PR)
  - Full profile (all optional docs uploaded)

**Admin must cross-check what is available** and approve or reject based on that. The backend returns all available details so admin can make informed decisions.

---

## 2. What Details the Admin Can See

### 2.1 Single Candidate Profile (Full Details)

**Endpoint:** `GET /api/admin/candidates/:id`

**Use when:** Admin opens a candidate’s full profile to review before approve/reject.

**Response includes (for cross-check):**

| Field | Description |
|-------|-------------|
| `fullName` | Candidate name |
| `email` | Email address |
| `phone` | Phone number |
| `dateOfBirth` | Date of birth |
| `gender` | Gender |
| `postalCode` | Postal code |
| `address` | Street address |
| `nric` | NRIC number (if provided; may be masked for some pass types) |
| `employmentStatus` | e.g. Singaporean/PR, Student Pass, Long Term Visit Pass |
| `profileCompleted` | Whether profile meets minimum required fields |
| `resumeUrl` | Resume PDF URL (if uploaded); `null` if not |
| `nricFront` | NRIC front image URL (if uploaded) |
| `nricBack` | NRIC back image URL (if uploaded) |
| `plocImage` | PLOC image URL (for Long Term Visit Pass) |
| `plocExpiryDate` | PLOC expiry date |
| `studentCard` | Student card image (for Student Pass) |
| `studentId`, `schoolName` | Student ID and school (for Student Pass) |
| `finNumber` | FIN number (for Long Term Visit Pass) |
| `status` | Active / Pending ( verification status ) |
| `rejectionReason` | If previously rejected, the reason |
| `eWalletAmount` | Wallet balance |
| `profilePicture` | Profile photo |

Admin can use this to decide whether to **verify** the candidate (see §4) or to reject with a clear reason.

---

### 2.2 Single Application (Applicant Details)

**Endpoint:** `GET /api/admin/applications/:applicationId`

**Use when:** Admin reviews a specific job application before approve/reject.

**Response includes:**

- **Application:** job, shift, date, status, adminStatus, adminNotes
- **User (applicant):**
  - `fullName`, `email`, `phoneNumber`, `profilePicture`
  - `profileCompleted`, `employmentStatus`
  - `dateOfBirth`, `gender`, `postalCode`, `nric`
  - `resumeUrl` – Resume URL if uploaded; `null` if not
  - `nricFrontImage`, `nricBackImage` – NRIC images if uploaded
  - `status`

Admin uses this to decide whether to **approve** or **reject** the application for that job.

---

### 2.3 All Candidates (List)

**Endpoint:** `GET /api/admin/candidates`

**Response:** List of candidates with `resumeUrl`, basic info, and status. Use to see who has a resume and who does not.

---

### 2.4 Candidates by Job (List)

**Endpoint:** `GET /api/admin/jobs/candidates/:jobId`

**Response:** Applicants for a specific job, including `resumeUrl` and `employmentStatus` per candidate. Use to review before bulk or individual approve/reject.

---

### 2.5 Single User (Admin Users)

**Endpoint:** `GET /api/admin/users/:userId`

**Response:** Full user details including `resumeUrl`, `nricFrontImage`, `nricBackImage`, `employmentStatus`, `dateOfBirth`, `gender`, `postalCode`, and stats (applications, completed jobs, etc.).

---

## 3. Application Approve / Reject

### 3.1 Approve Single Application

**Endpoint:** `POST /api/admin/applications/:applicationId/approve`

**Body (optional):**
```json
{ "notes": "Optional admin notes" }
```

**Effect:** Sets `adminStatus` to `Confirmed`, `status` to `Upcoming`. User is notified. Shift vacancy is updated.

---

### 3.2 Reject Single Application

**Endpoint:** `POST /api/admin/applications/:applicationId/reject`

**Body:**
```json
{ "reason": "Required - Reason for rejection" }
```
or
```json
{ "notes": "Reason for rejection" }
```

**Effect:** Sets `adminStatus` to `Rejected`, `status` to `Rejected`. User is notified. Shift vacancy is released if it was filled.

---

### 3.3 Update Application Status (Alternative)

**Endpoint:** `PUT /api/admin/applications/status/:userId`

**Body:**
```json
{
  "jobId": "<jobId>",
  "status": "Confirmed",
  "rejectionReason": "Optional - Required when status is Rejected"
}
```

`status` can be: `Confirmed`, `Rejected`, `Approved` (mapped to Confirmed), `Pending`.

---

## 4. Candidate (User) Verify / Reject

Used when admin wants to approve or reject the **candidate’s profile** (not a specific application).

### 4.1 Verify Candidate

**Endpoint:** `PUT /api/admin/verify-candidate/:id`

**Body:**
```json
{
  "action": "approve"
}
```

**Effect:** Sets user status to `Verified` or `Activated` (if they have completed jobs). Sends approval notification.

**Note:** Requires `profileCompleted === true`. Users who applied with only basic fields will have `profileCompleted` true, so they can be verified.

---

### 4.2 Reject Candidate

**Endpoint:** `PUT /api/admin/verify-candidate/:id`

**Body:**
```json
{
  "action": "reject",
  "rejectionReason": "Required - e.g. Incomplete documents, NRIC required for this role"
}
```

**Effect:** Sets user status to `Rejected`, stores `rejectionReason`. Sends rejection notification. Admin can use `rejectionReason` to tell the user what to fix (e.g. upload resume, NRIC, etc.).

---

## 5. Admin Cross-Check Checklist

| Step | Action |
|------|--------|
| 1 | Open candidate profile (`GET /api/admin/candidates/:id`) or application (`GET /api/admin/applications/:applicationId`) |
| 2 | Review all returned fields: basic info, `resumeUrl`, NRIC docs, employment status, etc. |
| 3 | Decide based on job requirements: |
|    | - If job needs resume and `resumeUrl` is null → consider **Reject** with reason: "Resume required for this role" |
|    | - If job needs NRIC (e.g. Singaporean roles) and NRIC is missing → consider **Reject** with reason: "NRIC documents required" |
|    | - If basic info + available docs are sufficient → **Approve** |
| 4 | Use **Application** approve/reject for that job, or **Candidate** verify/reject for profile-level decisions |
| 5 | Always provide `rejectionReason` when rejecting so the user knows what to improve |

---

## 6. React Admin UI Recommendations

- **Candidate / Application detail view:** Show all returned fields in a structured layout, including:
  - Resume: link or “Not uploaded” if `resumeUrl` is null
  - NRIC: show front/back images or “Not uploaded”
  - Employment status, DOB, gender, postal code
- **List view:** Optional badge/icon for “Has resume” vs “No resume” using `resumeUrl`
- **Reject flow:** Require `rejectionReason`; suggest templates (e.g. “Resume required”, “NRIC required”, “Incomplete profile”)
- **Approve flow:** Allow optional `notes` for internal record

---

## 7. API Summary

| Purpose | Method | Endpoint |
|---------|--------|----------|
| Get full candidate details | GET | `/api/admin/candidates/:id` |
| Get application with user details | GET | `/api/admin/applications/:applicationId` |
| Approve application | POST | `/api/admin/applications/:applicationId/approve` |
| Reject application | POST | `/api/admin/applications/:applicationId/reject` |
| Verify candidate (approve profile) | PUT | `/api/admin/verify-candidate/:id` |
| Reject candidate (profile) | PUT | `/api/admin/verify-candidate/:id` |
| Update application status | PUT | `/api/admin/applications/status/:userId` |

---

**Document version:** 1.0  
**Related:** BACKEND_UPDATE_RESUME_AND_APPLY.md, ADMIN_EMPLOYER_AND_OUTLET.md, COMPLETE_API_DOCUMENTATIONupdate.md
