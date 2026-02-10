# Admin Panel – Profile & User Display Updates

**Purpose:** What the admin side should know after the backend profile update (BACKEND_PROFILE_UPDATE.md). The native app uses **PUT /api/user/:userId**; the admin panel mainly **displays** user data and does **not** need to call that endpoint for normal flows.

**Related:** `BACKEND_PROFILE_UPDATE.md`, `ADMIN_NATIVE_APP_GUIDE.md`

---

## 1. Do You Need to Change Anything??

| Scenario | Action |
|----------|--------|
| Admin only **views** users (GET /api/admin/users, GET /api/admin/users/:userId) | **Yes – display only:** Ensure **gender** can show **"Other"** (see §2). |
| Admin has an **"Edit user profile"** form that calls **PUT /api/user/:userId** | **Yes:** Request body must always include **dob**, **gender**, **postalCode** (see §3). |
| Admin only updates **user status** (PATCH /api/admin/users/:userId/status) | **No change.** |
| Admin uses **Applications** (approve/reject, candidate confirmed) | See **ADMIN_NATIVE_APP_GUIDE.md**. |

---

## 2. Gender Can Be "Other" (Display)

- Backend **Profile** now allows **gender**: `Male` | `Female` | **`Other`**.
- **Admin UI:** Where you show a user’s gender (user detail, lists, filters, exports), support the value **"Other"** so it displays correctly and doesn’t break filters or labels.
- **No API change** for admin: GET /api/admin/users and GET /api/admin/users/:userId already return `gender` from the user’s profile; it may now be `"Other"`.

**Checklist:**

- [ ] User detail page: show **Male** / **Female** / **Other** (or same label as stored).
- [ ] User list/table: gender column or filter supports **Other**.
- [ ] Any dropdowns or filters that use gender: add **Other** if they were previously only Male/Female.

---

## 3. If Admin Ever Calls PUT /api/user/:userId

The **profile update** endpoint is used by the **native app** (user updating their own profile). The backend now **requires** these fields on every request:

- **dob** – string, format `YYYY-MM-DD` (e.g. `1990-05-15`)
- **gender** – string: `Male`, `Female`, or `Other`
- **postalCode** – string, non-empty (e.g. `123456`)

If the admin panel ever implements an "Edit user profile" flow that calls **PUT /api/user/:userId** (e.g. with the target user’s id and appropriate auth):

1. **Every** request body must include **dob**, **gender**, and **postalCode** (plus any other fields you want to update).
2. Image fields (**profilePicture**, **nricFrontImage**, **nricBackImage**, **resumeUrl**) are sent as **URL strings** (no file upload in this request).
3. On **validation failure** the backend returns **400** with:
   - `success: false`
   - `message: "Profile validation failed: ..."`
   - `error: "ValidationError"`

**Example body (minimum for a valid request):**

```json
{
  "dob": "1990-05-15",
  "gender": "Male",
  "postalCode": "123456"
}
```

Full details: **BACKEND_PROFILE_UPDATE.md**.

---

## 4. Summary

| Item | Admin action |
|------|----------------|
| **Gender "Other"** | Support displaying (and filtering, if applicable) **Other** wherever user/profile gender is shown. |
| **PUT /api/user/:userId** | Only if admin has or adds an "Edit user profile" that calls this endpoint: send **dob**, **gender**, **postalCode** in every request; see §3 and BACKEND_PROFILE_UPDATE.md. |
| **Applications / candidate confirm** | Use **ADMIN_NATIVE_APP_GUIDE.md** (candidateConfirmed, approval flow). |

---

**Document version:** 1.0
