# Backend: QR Code & Barcode Generation with Job Detail Link

The admin panel at **http://localhost:5173/qrCode** lists and generates QR codes (and expects barcodes) linked to jobs. Each QR/barcode must include a **job detail link** so that scanning or viewing shows the related job. The backend must generate both **QR code** and **barcode** and encode the job detail URL in the generated assets.

---

## 1. Current frontend behaviour

- **Page:** `/qrCode` (QR Code Management).
- **List:** `GET /admin/qr-codes` – returns `qrCodes[]` with `jobId`, `jobTitle`, `jobName`, `jobDate`, `qrCodeImage`, and optionally `barcodeImage`.
- **Generate:** `POST /admin/qr-codes/generate` with body `{ employerId, outletId, jobId }`.
- **Delete:** `DELETE /admin/qr-codes/:qrCodeId`.
- The frontend shows a **“View job”** link for each item when `jobId` is present, linking to `/jobs/:jobId` (job details page). The printed sheet and preview also show the job detail URL.

---

## 2. Job detail URL format

The **job detail link** that should be encoded in the QR/barcode and returned by the API:

- **Admin panel (web):** `{origin}/jobs/{jobId}`  
  Example: `http://localhost:5173/jobs/69b84a08475e65008d265e32`
- **Production:** Use the deployed admin (or app) base URL, e.g. `https://your-admin-domain.com/jobs/{jobId}`.

When a user scans the QR (or barcode), the decoded content should be this URL (or a JSON object that includes `jobDetailUrl` with this value) so that opening it shows the related job.

---

## 3. Backend requirements

### 3.1 Generate both QR code and barcode

- **Barcode** is currently not being generated; the frontend expects it. The backend must generate a **barcode** in addition to the QR code for each generated item.
- **QR code:** Encode the **job detail URL** (see §2) as the primary content (or include it in a JSON payload with `jobDetailUrl` and other ids).
- **Barcode:** Encode the same **job detail URL** (or a short identifier that resolves to this URL). If the barcode format has length limits, use a short code that the app/backend can resolve to the job URL, or use a URL shortener that redirects to the job detail page.

### 3.2 POST `/admin/qr-codes/generate`

**Request body:**

```json
{
  "employerId": "...",
  "outletId": "...",
  "jobId": "..."
}
```

**Backend must:**

1. Validate `employerId`, `outletId`, `jobId` (and that the job belongs to that employer/outlet if applicable).
2. Build the **job detail URL** (e.g. `https://your-admin-domain.com/jobs/{jobId}`). Use a configurable base URL for the admin (or app) so dev/staging/prod work correctly.
3. **Generate QR code image** that encodes this URL (or JSON containing `jobDetailUrl`). Save the image (e.g. under `uploads/qrcodes/` or similar) and store the full URL to the image in the QR document.
4. **Generate barcode image** that encodes the same URL (or the same short code). Save the image and store the full URL to the image in the QR document.
5. Save a document that includes:
   - `jobId`, `employerId`, `outletId`
   - `qrCodeImage` (full URL to the QR image)
   - `barcodeImage` (full URL to the barcode image)
   - `qrCodeId` (unique identifier for this QR/barcode pair)
   - Optional: `jobTitle`, `jobName`, `jobDate`, `employerName`, `outletName`, `outletAddress` for display.

**Response (200):**

```json
{
  "success": true,
  "message": "QR Code and barcode generated successfully",
  "qrCode": {
    "_id": "...",
    "qrCodeId": "...",
    "jobId": "...",
    "jobTitle": "...",
    "jobName": "...",
    "jobDate": "...",
    "employerId": "...",
    "employerName": "...",
    "outletId": "...",
    "outletName": "...",
    "outletAddress": "...",
    "qrCodeImage": "https://api.example.com/uploads/qrcodes/xxx.png",
    "barcodeImage": "https://api.example.com/uploads/barcodes/xxx.png"
  }
}
```

### 3.3 GET `/admin/qr-codes`

**Response:** Each item in `qrCodes[]` must include:

- `_id`, `qrCodeId`
- `jobId`, `jobTitle` or `jobName`, `jobDate` (so the frontend can show job and “View job” link).
- `employerId`, `employerName`, `outletId`, `outletName`, `outletAddress`
- `qrCodeImage` (full URL)
- **`barcodeImage`** (full URL) – so the frontend can display the barcode in the table, preview, and print.

If `barcodeImage` is missing, the frontend will show “—” in the Barcode column and no barcode in preview/print.

---

## 4. Encoded content (what to put inside QR and barcode)

- **Recommended:** Encode the **job detail URL** directly, e.g. `https://your-domain.com/jobs/69b84a08475e65008d265e32`. When scanned, the device can open this URL and show the job.
- **Alternative:** Encode a JSON object, e.g.  
  `{"jobDetailUrl":"https://.../jobs/xxx","jobId":"xxx","qrCodeId":"..."}`  
  so that apps that parse JSON can use `jobDetailUrl` or `jobId` to open the job.

The same value (URL or JSON string) should be used for both QR and barcode so behaviour is consistent.

---

## 5. Summary checklist for backend

- [ ] **Generate barcode** in addition to QR code when generating a QR (POST `/admin/qr-codes/generate`).
- [ ] **Encode job detail link** in both QR and barcode: URL format `{baseUrl}/jobs/{jobId}` (or JSON containing `jobDetailUrl`).
- [ ] **Return `barcodeImage`** (full URL) in POST response and in GET `/admin/qr-codes` for each item.
- [ ] **Return `jobId`** (and optionally `jobTitle`, `jobName`, `jobDate`) in GET `/admin/qr-codes` so the frontend can show “View job” and the job detail link on the page and in print.
- [ ] Use a **configurable base URL** for the job detail link (dev vs prod admin/app URL).

After these updates, the admin panel at http://localhost:5173/qrCode will show both QR and barcode, and every barcode/QR will carry the job detail link; the frontend already shows “View job” and the URL in preview and print.
