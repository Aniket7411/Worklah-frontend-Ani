# Client Feedback – Backend Requirements

This file lists backend changes and API requirements derived from client feedback (see `clienfeeedback.md`). Admin-panel and native app each have separate requirement files.

---

## 1. Bugs & immediate fixes

### 1.1 Add outlet – server timeout
- **Issue:** User is unable to add outlet; request times out.
- **Required:** Optimise `POST /admin/employers` (or the endpoint used when adding outlets) so that outlet creation completes within the client timeout (e.g. 60s for file uploads).
- **Suggestions:** Reduce payload size, optimise DB writes, consider background processing for heavy operations, or return 202 Accepted with a job ID for status polling.

### 1.2 Repeated duplication of job descriptions (JD) from mobile app
- **Issue:** Many repeated duplications of JD (likely when listing or syncing jobs).
- **Required:** Ensure job list/sync APIs return each job once (correct deduplication by job ID). If mobile sends duplicate create requests, consider idempotency keys or duplicate detection (e.g. same employer + outlet + jobDate + jobTitle in a time window) and return the existing job instead of creating a duplicate.

---

## 2. Jobs & shifts

### 2.1 Multiple shifts on multiple days
- **Issue:** User created two shifts on two different days; UI only showed one day. Same concern for 7+ shifts.
- **Required:** 
  - Store and return **all** shifts per job with a distinct `shiftDate` (or equivalent) per shift.
  - Each shift must have its own: **date**, **opening (start time)**, **closing (end time)**, **break time**, **manpower/vacancy**, and **applicants (per shift)**.
- **API contract (recommended):**
  - `GET /admin/jobs/:jobId` (and any job-by-id used by admin/native) must return `shifts[]` where each element includes at least:
    - `shiftDate` / `date`
    - `startTime` / `opening`
    - `endTime` / `closing`
    - `breakDuration` / `breakHours`
    - `vacancy` / `availableVacancy` / `manpower`
    - `applicantsCount` / `applicants` / `filled` (applicants assigned to that shift)
  - Same structure for job list endpoints if they embed shifts (so overview tables can show one row per shift).

### 2.2 Invoice from completed shifts
- **Issue:** No link/flow to generate invoice from shift done.
- **Required:** 
  - Provide an API (or extend existing invoice API) so admin can **generate invoice from completed shifts** (e.g. by job, date range, or employer).
  - Response should include standard invoice fields (employer, period, hours, amounts, etc.) and optionally a reference to the shifts included.
- **Note:** Admin panel now has a “Generate invoice from completed shifts” link that routes to the Payments > Invoice tab; backend must support the data needed for that view (e.g. `GET /admin/invoice-report` or similar with filters by job/shift/date).

### 2.3 Service report
- **Issue:** Service report should be available/linked.
- **Required:** Ensure service report API (e.g. `GET /admin/service-report`) is implemented and returns data consistent with the admin Service Report UI (by job/shift/outlet/date as needed).

---

## 3. Registration & user profile (Section 2)

These apply to **user registration and profile** APIs used by the native app and/or admin; backend should enforce and return the following.

### 3.1 Field requirements (registration)

| Field                 | Input method | Required | Remarks |
|-----------------------|-------------|----------|---------|
| Full Name (As per NRIC)| Textbox     | Required | |
| Mobile Number         | Textbox     | Required | **Login ID** – backend should treat as login identifier; document in API/response that this is the login ID. |
| Employment Status     | Dropdown    | Required | Values: Singaporean/Permanent Resident, Long Term Pass Holder, Student Pass (Foreigner), **No Working Pass**. User selecting “No Working Pass” must **not** be able to complete registration (block or return validation error). |
| Email Address         | Textbox     | Required | |

### 3.2 Postal code → district (Singapore)
- **Logic:** 6-digit postal code; **first 2 digits** denote postal sector and map to a district (area).
- **Example:** `69 8910` → Lim Chu Kang or Tengah (District 24).
- **Required:** 
  - Expose an endpoint or include in registration/profile API: given a 6-digit postal code, return or store the **district** (and optionally sector).
  - Maintain a mapping of Singapore postal sectors to districts (first 2 digits → district name/code).

### 3.3 Age calculation and display
- **Rule:** Age must be calculated from **date of birth** and displayed in:
  - Admin panel (user profile / application view).
  - Application user profile (native app).
- **Required:** 
  - Store **date of birth**.
  - Compute age (e.g. current date − DOB) and return it in APIs used for admin panel and user profile (e.g. `age` or `calculatedAge`).
- **Business rules (for validation / eligibility):**
  - Minimum age for part-time work in Singapore: **13** (non-industrial, light duties).
  - **16+** for secondary school part-time and industrial settings (medically fit, rules followed).
  - **17+** for college/higher institution part-time (Singapore).
  - Foreign students (Student Pass): minimum **14** years old; recognised institutions; up to 16 hours/week during term time.
  - Ages 13–15: max 6 hours/day; no work 11 pm–6 am; no hazardous work.
  - No hazardous work or heavy lifting for under 16.

### 3.4 Colleges / higher institutions list
- **Required:** Maintain and expose a **list of colleges and higher institutions** eligible for part-time work in Singapore (17+). Used for validation or dropdown in registration/profile (e.g. `GET /admin/colleges` or `/user/eligible-institutions`).

### 3.5 Employment status – document type and ID format
- **Document upload:** For Singaporean/Permanent Resident, Long Term Visit Pass, or Student Pass, the upload category depends on **employment status** selected at registration (one document type per status).
- **ID field labels and format (all 9 characters):**
  - **Singaporean/PR:** Show/store as **“NRIC No.”**  
    Format: `G1060626N` – **first and last character alphabetic only; positions 2–8 numeric only.** Total length **9**.
  - **Student Pass:** Show/store as **“Student Pass No.”** – same format (1st & last alpha, 2–8 numeric, total 9).
  - **Long Term Visit Pass:** Show/store as **“Long Term Visit Pass No.”** – same format (1st & last alpha, 2–8 numeric, total 9).
- **Required:** 
  - In registration/profile APIs, accept and validate:
    - Exactly **9 characters**.
    - First and last character: alphabetic only.
    - Characters 2–8: numeric only.
  - Return clear validation errors (e.g. 400 with message) when format is wrong.
  - Store which type (NRIC / Student Pass No. / LTVP No.) was used based on employment status.

---

## 4. API response behaviour (general)

- **Success:** Return `success: true` and consistent JSON shape (e.g. `{ success, data?, message? }`) with appropriate HTTP status (200/201).
- **Error:** Return `success: false`, HTTP status code (4xx/5xx), and a clear `message` (and optional `error` or `errors` for validation details).
- Admin panel uses both raw `axiosInstance` and `apiHelpers` (see `src/lib/apiHelpers.js`) which normalise responses to `{ success, data, statusCode, message }` for consistent handling.

---

## 5. Summary checklist (backend)

- [ ] Fix add-outlet timeout (optimise or async flow).
- [ ] Prevent duplicate JDs in list/sync and duplicate job creation from mobile.
- [ ] Return all shifts per job with per-shift: date, opening, closing, break, manpower, applicants.
- [ ] Support “invoice from completed shifts” (API + data for admin).
- [ ] Implement/service report API for admin.
- [ ] Registration: enforce required fields; block “No Working Pass” from completing registration.
- [ ] Postal code → district (Singapore) mapping and API/field.
- [ ] DOB + age calculation; return age in admin and user profile APIs.
- [ ] Colleges / higher institutions list endpoint.
- [ ] NRIC / Student Pass No. / LTVP No. validation (9 chars, 1st & last alpha, 2–8 numeric) and correct labels per employment status.
