# WorkLah — React admin (Vite) API reference

Use this with the **React / Vite admin panel** (e.g. `localhost:5173`, `work-lah-admin-panel.vercel.app`). Worker/native flows are documented in **`E2E_NATIVE_API_CONTRACT.md`**.

## Base URL and prefix

- **Production:** set **`VITE_API_URL`** to the API origin including the **`/api`** prefix (same as `API_HANDOVER.md`).
- **Alias:** `VITE_API_BASE_URL` is supported for the same value if older `.env` files use it.
- **Example:** `https://your-host.onrender.com/api` — axios `baseURL` is this string; request paths are **`/admin/...`**, **`/user/...`**, etc. (not `/api/admin/...` again).
- **Local dev:** if neither variable is set, the app defaults to `http://localhost:3000/api` (see `src/lib/authInstances.ts`).

## Authentication (admin)

- **Login:** `POST /admin/login` with body `{ "email", "password" }` (see `routes/adminRoutes.js`).
- **Protected routes:** `Authorization: Bearer <admin JWT>`.
- **401:** invalid or expired token — `{ success: false, message, error }`.

Admin-only routes live under **`/api/admin/...`**. Do **not** point the Expo worker app at these; they are for the admin UI only.

## Where the full admin contract lives

| Topic | Location |
|--------|----------|
| Route index (jobs, candidates, users, applications, employers, reports, …) | **`API_HANDOVER.md`** §5–§6 |
| **Create employer** (multipart + `data` JSON, duplicates, credentials) | **`API_HANDOVER.md`** §7.1 |
| Employer ID rules (`employerId` = MongoDB `_id` string) | **`API_HANDOVER.md`** §7 |
| Env vars (MongoDB, JWT, Twilio, Stripe, CORS / `FRONTEND_URL`) | **`API_HANDOVER.md`** §1–§2 |

## CORS

The server allows configured origins (including local Vite and the Vercel admin URL) plus requests **with no `Origin`** (not typical for browser). Ensure **`FRONTEND_URL`** matches your deployed admin origin if you tighten CORS later.

## Quick smoke test

1. `POST /api/admin/login` → store token.
2. `GET /api/admin/jobs` with `Authorization: Bearer <token>`.

---

*Keep in sync with **`API_HANDOVER.md`** when admin routes or employer create/update contracts change.*
