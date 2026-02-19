# Backend: Job Posting Fields – Precise Specification

**Purpose:** Align backend with Admin Panel job creation flow. The frontend has been updated; this document describes what the backend must support.

---

## 1. Job Posting Date (`jobDate`)

### Frontend behavior
- **Label:** "Job Posting Date" (no "(Auto-filled)")
- **Value:** Today's date in **local timezone** (YYYY-MM-DD)
- **Issue fixed:** Previously used `new Date().toISOString().split("T")[0]`, which is UTC and could show yesterday in timezones ahead of UTC. Now uses local date: `YYYY-MM-DD` from `getFullYear()`, `getMonth()+1`, `getDate()`.

### Backend requirements
1. **Accept** `jobDate` in request body as `YYYY-MM-DD` string.
2. **Interpret** as the job’s posting date (date of creation).
3. **When missing:** Use server’s current date (in server timezone) as job posting date.
4. **Do not** use UTC conversion for display/storage of job posting date; use the date value as provided (or server local date when omitted).

### Example
```json
{
  "jobDate": "2026-02-17",
  "jobTitle": "Waiter",
  ...
}
```

---

## 2. Total Vacancies (`totalPositions`)

### Frontend behavior
- **Removed:** The "Total Vacancies *" field at the top of the job form.
- **Derived:** Total positions are computed from shifts: `sum(shift.vacancy)` for each shift.
- **Payload:** Frontend sends `totalPositions` = sum of all `shift.vacancy` values (minimum 1).

### Backend requirements
1. **Accept** `totalPositions` in request body (number).
2. **When missing:** Derive from shifts: `totalPositions = sum(shift.vacancy)` for all shifts. Minimum 1.
3. **Consistency:** Ensure `totalPositions` is consistent with shift vacancies (e.g. allow backend to recompute from shifts if needed).

### Example
```json
{
  "totalPositions": 3,
  "shifts": [
    { "vacancy": 1, "shiftDate": "2026-02-20", ... },
    { "vacancy": 2, "shiftDate": "2026-02-21", ... }
  ],
  ...
}
```

---

## 3. POST /admin/jobs (or /admin/jobs/create)

### Request body (relevant fields)
| Field            | Type   | Required | Notes                                                      |
|------------------|--------|----------|------------------------------------------------------------|
| `jobDate`        | string | No       | YYYY-MM-DD. Use server date when omitted.                 |
| `totalPositions` | number | No       | Derived from shifts when omitted. Minimum 1.               |
| `jobTitle`       | string | Yes      |                                                           |
| `jobDescription` | string | Yes      |                                                           |
| `employerId`     | string | Yes      |                                                           |
| `outletId`       | string | No       | Null if manual outlet.                                    |
| `outletAddress`  | string | No       | Used when manual outlet.                                  |
| `shifts`         | array  | Yes      | Each shift has `vacancy`, `shiftDate`, `startTime`, etc.  |
| ...              | ...    | ...      | Other fields per existing API spec.                       |

### Backend logic (summary)
```
jobDate = body.jobDate ?? serverLocalDate(YYYY-MM-DD)
totalPositions = body.totalPositions ?? max(1, sum(shift.vacancy for shift in body.shifts))
```

---

## 4. Summary

| Change          | Frontend                        | Backend                                  |
|-----------------|----------------------------------|------------------------------------------|
| Job Posting Date| Uses local date (no UTC shift)  | Accept `jobDate`; fallback to server date |
| Total Vacancies | Removed from form; derived from shifts | Accept `totalPositions`; derive from shifts when omitted |

---

## 5. Validation

- **jobDate:** Must be valid YYYY-MM-DD. If provided, should not be in the past (optional; frontend enforces).
- **totalPositions:** Must be ≥ 1. Should be consistent with sum of shift vacancies.
- **shifts:** Each shift must have `vacancy` ≥ 1.
