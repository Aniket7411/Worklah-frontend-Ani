# User Verification & Admin Actions (Backend + React Admin + Native App)

**Purpose:** After a user creates a profile, they must be **verified by an admin** before they can apply to jobs. Admin can **Approve**, **Reject**, **Suspend**, and **Delete** users. This document describes what the **Backend**, **React Admin**, and **Native App** must implement.

**For React Admin developers:** See **§5 API reference for React Admin** for exact endpoints, request/response shapes, and error codes you can use in the admin panel.

---

## 1. Backend requirements

### 1.1 User model / GET /user/me

- Every user must have a **verification status** exposed to the client.
- **GET /user/me** (and any user profile response) must include at least one of:
  - `verificationStatus`: string, e.g. `"Pending"` | `"Approved"` | `"Rejected"` | `"Suspended"`
  - and/or `status`: string, e.g. `"Pending"` | `"Verified"` | `"Activated"` | `"Rejected"` | `"Suspended"`
- **Treat as verified (can apply):** `Approved`, `Verified`, `Activated` (case-insensitive).
- **Treat as not verified (cannot apply):** `Pending`, `Rejected`, `Suspended`, or missing/undefined.

### 1.2 Block apply until verified

- **POST /jobs/:jobId/apply** (and **POST /jobs/:jobId/apply-multi** if used) must:
  - Check the authenticated user’s verification status.
  - If the user is **not** in an approved/verified state:
    - Return **HTTP 403** (or 400) with JSON:
      ```json
      {
        "success": false,
        "message": "Your account must be verified before you can apply. Please wait for admin approval.",
        "code": "VerificationPendingError"
      }
      ```
  - Only allow apply when user is `Approved` / `Verified` / `Activated` (and any other business rules, e.g. profile completion).

### 1.3 Admin: Approve user (verify)

- **PUT /admin/users/:userId/verify**  
  **Access:** Admin (Bearer token)

- **Request body:**
  ```json
  {
    "action": "Approved",
    "reason": "Optional note (e.g. for audit)"
  }
  ```
  For rejection:
  ```json
  {
    "action": "Rejected",
    "reason": "Optional rejection reason (e.g. incomplete documents)"
  }
  ```

- **Success (200):**
  ```json
  {
    "success": true,
    "message": "User verified successfully",
    "user": { "_id": "...", "verificationStatus": "Approved" }
  }
  ```

- Backend must set the user’s `verificationStatus` (and/or `status`) to `Approved` or `Rejected` accordingly.

### 1.4 Admin: Suspend user

- Either extend **PUT /admin/users/:userId/verify** with `"action": "Suspended"` and optional `reason`, or add a dedicated endpoint, e.g. **PUT /admin/users/:userId/suspend** or **PATCH /admin/users/:userId** with body `{ "status": "Suspended" }`.
- Suspended users must be treated as **not verified** (cannot apply to jobs). Same apply check as in §1.2.

### 1.5 Admin: Delete user

- **DELETE /admin/users/:userId**  
  **Access:** Admin

- **Success (200):**
  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

- Backend should enforce soft-delete or hard-delete per your policy; ensure deleted (or deactivated) users cannot log in or apply.

---

## 2. React Admin panel requirements

### 2.1 Users / Hustle Heroes list

- List users (e.g. **GET /admin/users**) and display:
  - User name, email, phone, profile completion, **verification status** (Pending / Approved / Rejected / Suspended).
- Filter or badge by `verificationStatus` / `status` so admin can see “Pending verification” users easily.

### 2.2 Actions per user

For each user row (or detail page), provide:

| Action   | Backend call                                      | Effect |
|----------|----------------------------------------------------|--------|
| **Approve**  | PUT /admin/users/:userId/verify `{ "action": "Approved" }` | User can apply to jobs in the app. |
| **Reject**   | PUT /admin/users/:userId/verify `{ "action": "Rejected", "reason": "..." }` | User stays unable to apply; optional reason for records. |
| **Suspend**  | PUT /admin/users/:userId/verify `{ "action": "Suspended" }` or dedicated suspend endpoint | User cannot apply until unsuspended. |
| **Delete**   | DELETE /admin/users/:userId                        | User removed (or deactivated) per backend policy. |

- Show confirmation before **Reject**, **Suspend**, and **Delete**.
- After action, refresh the user list or user detail and show success/error message.

### 2.3 Optional: bulk approve

- If backend supports it, a “Bulk approve” for multiple selected users (e.g. multiple PUT verify or a dedicated bulk endpoint) improves workflow.

---

## 3. Native App (already implemented)

- **Unverified badge:** In the app header (MainAppHeader and HomeHeader), a small **shield icon** badge (amber) is shown next to the profile image when the user is **not** verified (`verificationStatus` / `status` is not Approved, Verified, or Activated).
- **Job detail:** If the user is not verified, a **banner** appears at the top of the job detail screen: “Pending verification” (or “Rejected” / “Suspended”) with short text that they can apply after admin verifies their profile; tapping the banner opens the Profile screen.
- **Apply disabled:** The “Apply” / “Select shifts to apply” flow is disabled until the user is verified. If the user still triggers apply (e.g. from an old screen), the backend returns `VerificationPendingError` and the app shows: “Your account must be verified before you can apply. Please wait for admin approval.”
- **Verification logic:** The app treats a user as verified only when `verificationStatus` or `status` is one of: `Approved`, `Verified`, `Activated` (case-insensitive). All other values (including `Pending`, `Rejected`, `Suspended`, or missing) are treated as not verified.

---

## 4. Summary checklist

| Layer        | Item |
|-------------|------|
| **Backend** | User model has `verificationStatus` and/or `status`. |
| **Backend** | GET /user/me returns `verificationStatus` / `status`. |
| **Backend** | POST /jobs/:jobId/apply returns 403 + `code: "VerificationPendingError"` when user not approved/verified. |
| **Backend** | PUT /admin/users/:userId/verify with `action`: Approved \| Rejected \| Suspended. |
| **Backend** | DELETE /admin/users/:userId implemented and enforced. |
| **React Admin** | Users list shows verification status. |
| **React Admin** | Per-user actions: Approve, Reject, Suspend, Delete. |
| **Native App** | Unverified badge in header; verification banner on job detail; apply blocked until verified. |

---

## 5. API reference for React Admin developer

Use this section to implement the Users / Hustle Heroes list and actions in the React admin panel. All paths are relative to your API base URL (e.g. `https://your-api.com/api`).

**Auth:** Send the admin JWT after login in the `Authorization` header:
```http
Authorization: Bearer <adminToken>
```

**Response rule:** Every response has `success: true | false`. On failure, use `message` for the user and optionally `error` or `code` for handling.

---

### 5.1 List users (with verification status)

**GET** `{baseURL}/admin/users`

**Headers:** `Authorization: Bearer <adminToken>`

**Query (optional):** `page`, `limit`, `search`, `role`, `profileCompleted`, `status`

**Success (200):**
```json
{
  "success": true,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "phoneNumber": "+6512345678",
      "fullName": "John Doe",
      "role": "USER",
      "profileCompleted": true,
      "status": "Verified",
      "verificationStatus": "Approved",
      "profilePicture": "https://...",
      "nric": "S1234567A",
      "totalApplications": 25,
      "approvedApplications": 20,
      "completedJobs": 15,
      "walletBalance": 150.50,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

**Display:** Use `verificationStatus` for badges/filters. Allowed values: `"Pending"` | `"Approved"` | `"Rejected"` | `"Suspended"`.

**Filtering by verification status:** You can pass `status` in the query to filter the list:
- `status=Approved` – users who can apply (Verified / Activated / or verificationAction Approved)
- `status=Pending` – users not yet verified (no Approved/Rejected/Suspended)
- `status=Rejected` – rejected users
- `status=Suspended` – suspended users

---

### 5.2 Get one user (for detail page)

**GET** `{baseURL}/admin/users/:userId`

**Headers:** `Authorization: Bearer <adminToken>`

**Success (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "phoneNumber": "+6512345678",
    "fullName": "John Doe",
    "role": "USER",
    "profileCompleted": true,
    "status": "Verified",
    "verificationStatus": "Approved",
    "verificationAction": "Approved",
    "rejectionReason": null,
    "profilePicture": "https://...",
    "nric": "S1234567A",
    "totalApplications": 25,
    "approvedApplications": 20,
    "completedJobs": 15,
    "walletBalance": 150.50
  }
}
```

---

### 5.3 Approve user (verify)

**PUT** `{baseURL}/admin/users/:userId/verify`

**Headers:** `Authorization: Bearer <adminToken>`  
**Content-Type:** `application/json`

**Request body:**
```json
{
  "action": "Approved",
  "reason": "Optional note for audit"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "User verified successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "Verified",
    "verificationStatus": "Approved",
    "verificationAction": "Approved"
  }
}
```

**Error (400):** Invalid `userId` or `action` not one of `Approved` | `Rejected` | `Suspended`.  
**Error (404):** User not found.

---

### 5.4 Reject user

**PUT** `{baseURL}/admin/users/:userId/verify`

**Request body:**
```json
{
  "action": "Rejected",
  "reason": "Incomplete documents"
}
```
(`reason` is optional; use for audit or to show the user.)

**Success (200):**
```json
{
  "success": true,
  "message": "User rejected",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "Rejected",
    "verificationStatus": "Rejected",
    "verificationAction": "Rejected"
  }
}
```

**UI:** Show confirmation before rejecting; optionally collect `reason` in a modal.

---

### 5.5 Suspend user

**PUT** `{baseURL}/admin/users/:userId/verify`

**Request body:**
```json
{
  "action": "Suspended",
  "reason": "Optional reason for suspension"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "User suspended",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "Suspended",
    "verificationStatus": "Suspended",
    "verificationAction": null
  }
}
```

**UI:** Show confirmation before suspending. Suspended users cannot apply to jobs until an admin approves them again (send `action: "Approved"` to unsuspend).

---

### 5.6 Delete user

**DELETE** `{baseURL}/admin/users/:userId`

**Headers:** `Authorization: Bearer <adminToken>`

**Success (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error (403):** Cannot delete an admin user.  
**Error (404):** User not found.

**UI:** Always show a confirmation dialog before calling this endpoint.

---

### 5.7 Quick reference: actions from the UI

| Button / Action | Method | URL | Body |
|-----------------|--------|-----|------|
| **Approve** | PUT | `/admin/users/:userId/verify` | `{ "action": "Approved" }` |
| **Reject** | PUT | `/admin/users/:userId/verify` | `{ "action": "Rejected", "reason": "..." }` |
| **Suspend** | PUT | `/admin/users/:userId/verify` | `{ "action": "Suspended", "reason": "..." }` |
| **Delete** | DELETE | `/admin/users/:userId` | — |

After any action, refresh the user list (or user detail) and show `message` from the response, or the backend `message` on error.

---

---

## 6. Backend implementation status (for reference)

The backend has been implemented to match this document:

| Requirement | Status |
|-------------|--------|
| User model has `status` (Verified, Pending, Rejected, Suspended, Activated, etc.) and `verificationAction` (Approved, Rejected). | Done |
| **GET /user/me** returns `verificationStatus`, `status`, `verificationAction`, and `rejectionReason` (for Native to show rejection reason). | Done |
| **POST /jobs/:jobId/apply** and **POST /jobs/:jobId/apply-multi** return **403** with `code: "VerificationPendingError"` when user is not approved/verified. | Done |
| **PUT /admin/users/:userId/verify** accepts `action`: `Approved` \| `Rejected` \| `Suspended` and optional `reason`; updates user and returns the response shapes in §5.3–5.5. | Done |
| **DELETE /admin/users/:userId** implemented; returns 403 for admin users, 404 if user not found, 200 with message on success. | Done |
| **GET /admin/users** returns each user with `verificationStatus` and supports query `status` = `Approved` \| `Pending` \| `Rejected` \| `Suspended` for filtering. | Done |
| **GET /admin/users/:userId** returns `verificationStatus`, `verificationAction`, `rejectionReason`. | Done |

---

## 7. React Admin implementation guide (frontend)

Use **§5 API reference** and the table in **§5.7** to wire the UI:

1. **Users / Hustle Heroes list**
   - Call **GET** `{baseURL}/admin/users` with optional `page`, `limit`, `search`, `role=USER`, `status` (use `status=Pending` for “Pending verification” filter).
   - Display each user’s `verificationStatus` (badge or column): Pending | Approved | Rejected | Suspended.
   - Show actions: Approve, Reject, Suspend, Delete (with confirmation for Reject, Suspend, Delete).

2. **Approve**
   - **PUT** `{baseURL}/admin/users/:userId/verify` with body `{ "action": "Approved" }` (optional `"reason"`).
   - On success, refresh list/detail and show `message` from response.

3. **Reject**
   - **PUT** `{baseURL}/admin/users/:userId/verify` with body `{ "action": "Rejected", "reason": "..." }`.
   - Show confirmation modal; optionally collect `reason` in the modal.

4. **Suspend**
   - **PUT** `{baseURL}/admin/users/:userId/verify` with body `{ "action": "Suspended", "reason": "..." }`.
   - Show confirmation. To unsuspend, call the same endpoint with `{ "action": "Approved" }`.

5. **Delete**
   - **DELETE** `{baseURL}/admin/users/:userId`.
   - Always show a confirmation dialog. On 403, show “Cannot delete an admin user”; on 404, “User not found”.

6. **Error handling**
   - All responses have `success: true | false`. On failure, show `message` to the user.
   - Use `error` (or `code`) in the response for logic (e.g. 404 → NotFound, 400 → ValidationError).

Use this document to align Backend, React Admin, and Native App behaviour for verification and admin actions.
