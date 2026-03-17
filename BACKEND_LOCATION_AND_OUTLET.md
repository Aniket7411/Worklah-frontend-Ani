# Backend: Location & Outlet (Name vs Address) – Add/Edit Outlet, Job Posting, Job Editing

This document clarifies the difference between **Outlet Name** and **Outlet Location (address)** and how **location** is used when adding/editing outlets, posting jobs, and updating jobs. The admin frontend uses these rules; the backend should store and return the same fields consistently.

---

## 1. Outlet Name vs Outlet Location (Address)

| Concept | Meaning | Frontend field(s) | Backend should use |
|--------|---------|-------------------|--------------------|
| **Outlet name** | Display name of the outlet (e.g. "Outletp", "Downtown Branch"). | `name` | `name` and/or `outletName` (admin sends `name`). |
| **Outlet location / address** | Physical address where the outlet is (e.g. "Beach Rd, Singapore"). | `address` | `address` and/or `outletAddress` / `location` (admin sends `address`). |

**Important:** Outlet **name** and outlet **location (address)** are different. A single employer can have multiple outlets, each with its own **name** and **address**. The backend must store and return both; do not confuse or merge them.

---

## 2. Add employer (with outlets)

- **Endpoint:** `POST /admin/employers` (multipart; employer data in `data` JSON).
- **Outlets** are sent inside `data.outlets[]`. Each outlet object must have:
  - **`name`** (required) – outlet name.
  - **`address`** (required) – outlet location/address.
  - Plus: `managerName`, `contactNumber`, optional `contactExtension`, `openingHours`, `closingHours`, `isActive`.

The frontend does **not** send `outletName` or `outletAddress` in the payload; it sends **`name`** and **`address`**. The backend may store them as `outletName` / `outletAddress` internally but should accept `name` and `address` and return them in responses (or map to the same meaning so lists/dropdowns show name and address correctly).

---

## 3. Edit employer (edit outlets)

- **Endpoint:** `PUT /admin/employers/:employerId` (multipart; employer data in `data` JSON).
- **Outlets** are sent in `data.outlets[]`. Each outlet has:
  - **`_id`** – present for existing outlets (update), omitted for new outlets (create).
  - **`name`** (required) – outlet name.
  - **`address`** (required) – outlet location/address.
  - Same other fields as in add.

When the frontend loads an employer for edit, it maps API response to form using:
- `outlet.name` or `outlet.outletName` → **Outlet name** field.
- `outlet.address` or `outlet.outletAddress` or `outlet.location` → **Address** field.

So the backend should return each outlet with at least one of `name`/`outletName` and one of `address`/`outletAddress`/`location` so the edit form can show and save them correctly.

---

## 4. Job posting (create job)

The job form has two ways to set **where the job is**:

1. **Select an outlet** (dropdown) – user picks an outlet by **name**; the frontend then uses that outlet’s **address** as the job’s location.
2. **Enter outlet address manually** – no outlet selected; user types the address (and optionally refines in “Location details”).

What is sent to the API:

- **`outletId`** – set when an outlet is selected; `null` when “manual outlet” is used.
- **`outletAddress`** – when manual outlet: the typed address; when outlet selected: the selected outlet’s address (auto-filled). Can be `null` when `outletId` is set (backend can resolve from outlet).
- **`location`** (required) – single string used as the job’s main address. Frontend builds it as:  
  `outletAddress || location || locationDetails` (first non-empty).
- **`locationDetails`** – optional; can be the same as the address or more detail (e.g. “Block 123, Level 2”). Sent as-is.

So for job create:

- If user **selects an outlet**: frontend sets `outletId` and syncs that outlet’s **address** into `outletAddress` and `locationDetails`, and `location` is that address (or from `locationDetails` if user edited it).
- If user **enters address manually**: `outletId` is null, `outletAddress` and/or `locationDetails` are filled, and `location` is derived from them.

The backend should:

- Store **`location`** (and optionally `locationDetails`) on the job.
- When `outletId` is present, store the link to the outlet; when returning the job, **populate `outlet`** with at least `_id`, `name`, and `address` so the UI can show “Outlet name” and “Outlet address” separately.
- When `outletId` is null, the job has no outlet; use `outletAddress` / `location` / `locationDetails` for display.

---

## 5. Job editing (update job)

Same rules as job posting:

- **Load job:** When returning a job for edit, the frontend expects:
  - **`job.outlet`** – when the job is tied to an outlet: `{ _id, name?, address? }` so it can show the selected outlet and its address.
  - **`job.outletId`** or **`job.outlet?._id`** – so the outlet dropdown can preselect the correct option.
  - **`job.outletAddress`** or **`job.outlet?.address`** – so the “outlet address” / manual-address field is pre-filled.
  - **`job.locationDetails`** or **`job.location`** or **`job.address`** – so the “Location details” field is pre-filled. If the job has an outlet and no separate location text, the frontend will also use **`job.outlet?.address`** for `locationDetails` so the field is never empty when the job has an outlet.

So when the job has an outlet, the backend should return that outlet’s **name** and **address** (e.g. on `job.outlet`) so the edit page can show “Outlet name” in the dropdown and “Outlet address” / “Location details” in the address fields.

On **submit (update)**:

- Same payload as create: `outletId`, `outletAddress`, `location`, `locationDetails`.
- Backend should update the job’s outlet link and stored location/address from these fields.

---

## 6. Summary table (what is what)

| Context | “Name” field | “Location / address” field | Notes |
|---------|----------------|----------------------------|--------|
| **Employer outlet (add/edit)** | Outlet **name** (`name`) | Outlet **address** (`address`) | Required on each outlet. |
| **Job – outlet dropdown** | Shows outlet **name**; value is `outletId`. | Not shown in dropdown; address is used to fill location. | Selecting an outlet fills job location from that outlet’s address. |
| **Job – manual address** | N/A | User types address; stored in `outletAddress` / `location` / `locationDetails`. | No `outletId`. |
| **Job – API payload** | N/A (outlet name is on outlet, not on job). | `location` (required), `locationDetails`, `outletAddress` (if manual). | `location` = main address for the job. |
| **Job – API response** | `job.outlet.name` (or `outletName`) | `job.outlet.address`, `job.outletAddress`, `job.location`, `job.locationDetails` | Outlet **name** and **address** must be distinct in response. |

---

## 7. Backend checklist

- [ ] **Employer outlets:** Store and return **`name`** (outlet name) and **`address`** (outlet location) separately. Accept `name` and `address` in POST/PUT employer payloads.
- [ ] **Job create/update:** Accept and store **`location`** (required), **`locationDetails`**, **`outletId`**, **`outletAddress`** as documented. When `outletId` is set, you may derive location from the outlet’s address if the client does not send it.
- [ ] **Job response (GET job):** When the job has an outlet, return **`job.outlet`** with at least **`_id`**, **`name`** (or `outletName`), and **`address`** (or `outletAddress`). Return **`job.location`** / **`job.locationDetails`** / **`job.outletAddress`** / **`job.address`** so the edit form can pre-fill both outlet selection and location/address fields.
- [ ] **Lists (jobs, outlets):** When showing an outlet, show **outlet name** and **outlet address** as separate values (e.g. in filters, job list, QR screens). Do not merge “name” and “location” into one field.

This keeps **Outlet name** and **Outlet location (address)** correct when adding/editing outlets and when posting or editing jobs.
