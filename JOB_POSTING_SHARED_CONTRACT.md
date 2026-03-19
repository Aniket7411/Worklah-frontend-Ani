# Job Posting Shared Contract (Admin Panel + Backend + Native)

This document defines a single, canonical “job posting” payload shape that must work consistently across:
- the Admin Panel (web)
- the backend API (Node/Express + Mongo)
- the native app (Android/iOS)

It also standardizes how monetary amounts are rounded and how `jobDescription` rich text HTML is stored/displayed.

---

## 1) Canonical entities

### `JobPosting`
- `id` (string | Mongo `_id`): unique job id
- `jobId` (string | optional): human-friendly id (e.g. `JOB-0002`)
- `jobTitle` (string, required): short display title (e.g. `Cook`)
- `jobName` (string, required): long/job “name” field used by some parts of the system (often same as `jobTitle`)
- `jobDescription` (string, required): HTML rich text from the admin editor (see section 4)
- `jobDate` (string, required): `YYYY-MM-DD` (local date)
- `jobStatus` (string, required): `Active | Filled | Cancelled | Expired`

Employer/outlet/location:
- `employer` (object):
  - `id` (string, required)
  - `name` (string, required)
  - `logo` (string | null)
- `outlet` (object | null):
  - `id` (string | null)
  - `address` (string | null)
- `locationDetails` (string, required when outlet is manual)

Shifts:
- `shifts` (array, required): array of shift objects (section 2)
- `totalPositions` (number, required): derived from shifts (section 3)

Other fields (commonly used):
- `applicationDeadline` (string | null): ISO datetime string in backend responses; nullable
- `dressCode` (string | null)
- `skills` (string[] | null)
- `jobScope` (string[] | null)
- `foodHygieneCertRequired` (boolean)

---

## 2) `Shift` contract

Each shift object represents one date/time block inside a job posting.

Required input fields (create/modify):
- `shiftDate` (string): `YYYY-MM-DD` (or ISO date; backend should normalize)
- `startTime` (string): `HH:mm` (24h)
- `endTime` (string): `HH:mm` (24h)
- `breakDuration` (number): break duration in hours (step granularity: `0.25`)
- `rateType` (string): `Hourly | Weekly | Monthly`
- `rates` / `payRate` (number): rate amount in SGD
- `vacancy` (number, required): integer >= 1
- `standbyVacancy` (number): integer >= 0

Derived/computed fields (backend stores and/or returns):
- `totalWorkingHours` (number): computed hours for the shift
- `totalWages` (number): computed wages for the shift

Money fields:
- `rates` and `totalWages` are **numbers in SGD** (no `$` symbol in the numeric field).

---

## 3) Derived rules (positions + money)

### 3.1 Total positions
- Canonical rule: `totalPositions = sum(shifts[].vacancy)`
- Validation: `vacancy` must be integer >= 1

### 3.2 Total working hours
- `totalWorkingHours = max(0, (end-start in hours) - breakDuration)`
- Rounding rule: round to **2 decimals** (`0.01` precision)

### 3.3 Total wages
- If `rateType === "Hourly"`:
  - `totalWages = rates * totalWorkingHours`
- If `rateType === "Weekly" || rateType === "Monthly"`:
  - `totalWages = rates` (fixed per shift as currently modeled)
- Rounding rule: round to **2 decimals** in SGD

### 3.4 Job total wages (optional but common in UI)
- `job.totalWages = sum(shifts[].totalWages)` (backend may also return `totalWage` alias)

---

## 4) `jobDescription` HTML contract

`jobDescription` is stored as an HTML string.

### 4.1 Supported tags (must be portable)
Allowed/expected elements:
- formatting: `b`, `strong`
- lists: `ul`, `ol`, `li`
- inline styling: `span` with inline `style` (for font family/size)

### 4.2 Disallowed legacy tags
Older editor output may include `<font face="...">` and `<font size="...">`.
- Backend and clients MUST normalize legacy `<font>` tags into `<span style="...">...</span>`
- Clients MUST normalize malformed lists so that content is always inside `<li>`
  - Example of bad HTML: `<ul><li><b>Chef work</b></li><font face="Arial">Food prep</font></ul>`
  - Canonical normalized form: `<ul><li><b>Chef work</b></li><li><span style="font-family:Arial">Food prep</span></li></ul>`

### 4.3 Display styling
- The frontend/native app should style list indentation consistently.
- Do not rely on `<font>` tags for font rendering.

---

## 5) API usage (endpoints)

### Create job (admin)
- `POST /api/admin/jobs` (or fallback: `/api/admin/jobs/create`)
- Request body fields follow the `JobPosting` + `Shift` input contract above.

### Fetch job details
- `GET /api/jobs/:jobId` or `/api/admin/jobs/:jobId` (admin endpoints may differ)
- Response shape must include:
  - `jobDescription` (HTML string normalized per section 4)
  - `shifts` with `totalWage/totalWages` values rounded to 2 decimals
  - `totalPositions` derived from vacancies

---

## 6) Example (create request - simplified)

```json
{
  "jobTitle": "Cook",
  "jobName": "Cook",
  "jobDescription": "<ul><li><b>Chef work</b></li><li><span style=\"font-family:Arial\">Food preparation</span></li></ul>",
  "jobDate": "2026-03-16",
  "employerId": "69b84892475e65008d265c5f",
  "outletId": null,
  "outletAddress": "Beach Rd, Singapore",
  "locationDetails": "Beach Rd, Singapore",
  "jobScope": [],
  "totalPositions": 3,
  "jobStatus": "Active",
  "applicationDeadline": null,
  "dressCode": null,
  "shifts": [
    {
      "shiftDate": "2026-03-20",
      "startTime": "09:00",
      "endTime": "18:00",
      "breakDuration": 0.25,
      "rateType": "Hourly",
      "rates": 9.97,
      "vacancy": 3,
      "standbyVacancy": 1
    }
  ]
}
```

---

## 7) What to validate in backend (quick checklist)
- Normalize `jobDate` to `YYYY-MM-DD` (local date semantics from request)
- Validate `vacancy >= 1`, `standbyVacancy >= 0`
- Compute/round:
  - `totalWorkingHours` to 2 decimals
  - `totalWages` to 2 decimals
- Normalize legacy `jobDescription` HTML:
  - replace `<font>` tags with `<span style="...">`
  - ensure list nodes are always inside `<li>`
- Return numeric money fields as numbers (no `$` strings)

