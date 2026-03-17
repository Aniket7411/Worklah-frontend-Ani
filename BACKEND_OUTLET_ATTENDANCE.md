# Backend: Outlet Attendance Page API

The admin panel has an **Outlet Attendance** page at route `/jobs/:outletId/outlet-attendance`. The URL segment is the **outlet ID** (not job ID). The page loads data by calling the backend; if the API returns 404, the user sees an error (e.g. "Outlet not found").

---

## 1. Request and 404 response (reference)

**Page URL (frontend):**  
`http://localhost:5173/jobs/69b8491b475e65008d265d4c/outlet-attendance`

**API request (frontend sends):**

| Item | Value |
|------|--------|
| **Method** | `GET` |
| **URL** | `{baseURL}/admin/outlets/69b8491b475e65008d265d4c/attendance` |
| **Example (local)** | `http://localhost:3000/api/admin/outlets/69b8491b475e65008d265d4c/attendance` |
| **Path param** | `outletId` = `69b8491b475e65008d265d4c` (MongoDB `_id` of the outlet) |
| **Headers** | `Authorization: Bearer <admin token>` |

**404 response when outlet is not found:**

| Item | Value |
|------|--------|
| **Status** | `404 Not Found` |
| **Body** | `{"message":"Outlet not found"}` |

If the backend returns this 404, the outlet with that `_id` either does not exist or is not being looked up correctly (e.g. backend must resolve by outlet `_id` / `ObjectId`, not by a different identifier).

**Expected 200 response:** See §2 below. When the outlet exists, return **200** with that body so the page loads.

---

## 2. How the frontend uses the URL

- **Route:** `jobs/:jobId/outlet-attendance` (param is named `jobId` in code but **value is outlet ID**).
- **Example:** `http://localhost:5173/jobs/69b8491b475e65008d265d4c/outlet-attendance`  
  Here **`69b8491b475e65008d265d4c`** is the **outlet `_id`** (or outlet id).
- The frontend calls: **`GET /admin/outlets/{outletId}/attendance`** with this ID.
- So the backend must implement **`GET /admin/outlets/:outletId/attendance`** and return the expected shape below. If this endpoint is missing or returns 404, the page will show "Failed to load employer data" / "Resource not found".

---

## 2. Required endpoint

### GET `/admin/outlets/:outletId/attendance`

- **Purpose:** Return all data needed to render the Outlet Attendance page (outlet info, employer info, attendance metrics, and optional chart/table data).
- **Auth:** Admin only (Bearer token).
- **URL param:** `outletId` – MongoDB `_id` (or your outlet id) of the outlet.

**Success response (200):**

The frontend uses `response.data` as the page state. It expects at least:

```json
{
  "success": true,
  "outlet": {
    "name": "Outletp",
    "outletName": "Outletp",
    "address": "Beach Rd, Singapore",
    "outletAddress": "Beach Rd, Singapore",
    "contact": "658318825828",
    "contactNumber": "658318825828",
    "email": "outlet@example.com",
    "employer": "Getraise PVT LTD"
  },
  "employer": {
    "companyLegalName": "Getraise PVT LTD",
    "companyLogo": "https://..."
  },
  "attendanceMetrics": {
    "totalJobsPosted": 0,
    "shiftsFullyAttended": 0,
    "shiftsPartiallyAttended": 0,
    "shiftsLeastAttended": 0,
    "overallAttendanceRate": 0,
    "noShowRate": 0,
    "standbyEffectiveness": 0
  }
}
```

**Optional (for chart and table):**

- `attendanceChartData` – array for the attendance chart (e.g. `[{ name: "Jan", uv: 80 }, ...]`). If omitted, the page will call **`GET /admin/outlets/:outletId/attendance/chart?year=YYYY`** to load chart data.
- `summaryTable` – data for the summary table.
- `attendanceTableData` – data for the job/attendance table.

**Field usage on the page:**

| Response path | Used for |
|---------------|----------|
| `outlet.name` or `outlet.outletName` | Page title (outlet name). |
| `outlet.address` or `outlet.outletAddress` | Outlet address line. |
| `outlet.contact` or `outlet.contactNumber` | Phone. |
| `outlet.email` | Email. |
| `outlet.employer` or `employer.companyLegalName` | "Employer: ..." label. |
| `employer.companyLegalName` | Employer name. |
| `employer.companyLogo` | Company logo image. |
| `attendanceMetrics.*` | Stat cards (Total Jobs Posted, Shifts Fully/Partially/Least Attended, Overall Attendance Rate, No Show Rate, Standby Effectiveness). |
| `attendanceChartData` | Attendance chart (or chart is loaded via `/attendance/chart`). |
| `summaryTable`, `attendanceTableData` | JobTable component. |

**Error response (404 – Outlet not found):**

When the outlet does not exist, the backend should return:

- **Status:** `404 Not Found`
- **Body:** `{ "message": "Outlet not found" }`

The frontend will show this message to the user. To avoid 404 for a valid outlet:

1. Resolve `outletId` using the **same ID** the frontend sends (the outlet’s MongoDB `_id`, e.g. `69b8491b475e65008d265d4c`). The frontend gets this from `job.outlet._id` or `job.outletId` when the user clicks "Attendance Rate" on a job details page.
2. Ensure the outlet document exists (e.g. under the employer’s `outlets[]` or in a separate outlets collection keyed by `_id`).
3. Return **200** with the success shape above when the outlet is found.

---

## 3. Optional: chart endpoint

The page also uses:

### GET `/admin/outlets/:outletId/attendance/chart`

- **Query:** `year` (e.g. `2026`).
- **Purpose:** Monthly attendance data for the chart.
- **Success (200):** e.g.

```json
{
  "success": true,
  "chartData": [ { "month": "January", "attendance": 150 }, ... ],
  "averageAttendance": 85,
  "averageAttendanceRate": 85
}
```

If the main attendance response does not include `attendanceChartData`, the frontend will request this endpoint for the selected year.

---

## 4. Summary for backend

- Implement **`GET /admin/outlets/:outletId/attendance`** so the outlet-attendance page does not show "Resource not found".
- **URL param** is **outlet ID** (e.g. `69b8491b475e65008d265d4c`).
- Return **200** with at least:
  - `success: true`
  - `outlet`: { name, address, contact, email (and optional employer string) }
  - `employer`: { companyLegalName, companyLogo }
  - `attendanceMetrics`: { totalJobsPosted, shiftsFullyAttended, shiftsPartiallyAttended, shiftsLeastAttended, overallAttendanceRate, noShowRate, standbyEffectiveness }
- Optionally implement **`GET /admin/outlets/:outletId/attendance/chart?year=YYYY`** for the chart.
- Return **404** with a clear message when the outlet does not exist.

After the backend returns **200** with the expected body for a valid outlet ID, `http://localhost:5173/jobs/69b8491b475e65008d265d4c/outlet-attendance` will load correctly. If the backend returns **404** with `{"message":"Outlet not found"}`, the frontend shows that the outlet was not found (check that the outlet exists and is looked up by `_id`).
