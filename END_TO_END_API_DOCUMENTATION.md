# WorkLah – End-to-End API Documentation

**Purpose:** Single reference for all APIs from login through every feature. Use this to align **Backend**, **Admin Panel (React)**, and **Native App**.

**Base URL:**  
- Development: `http://localhost:3000/api`  
- Production: `https://worklah-updated-dec.onrender.com/api` (or your deployed API)

All paths below are relative to this base (e.g. `POST /admin/login` → `{baseURL}/admin/login`).

**Auth:**  
- **Admin (React):** send `Authorization: Bearer {adminToken}` after admin login.  
- **User (Native App):** send `Authorization: Bearer {userToken}` after OTP verify.

**Response rule:** Every response must include `success: true | false`. On failure, include `message` (and optionally `error`).

---

### Who uses what

| Section | Audience | Description |
|--------|----------|-------------|
| **1.1–1.3** | **React Admin** | Admin login, `/admin/me`, admin logout |
| **1.4** | Both | Forgot password (user email) |
| **1.5–1.8** | **Native App** | User login (OTP), verify OTP, `/user/me`, user logout |
| **2** | **React Admin** | Dashboard stats & charts |
| **3–4** | **React Admin** | Employers, outlets, jobs CRUD |
| **5** | **React Admin** | Applications review, approve/reject |
| **6** | **React Admin** | Users & candidates (Hustle Heroes), schools, postal code |
| **7** | **React Admin** | Payments, transactions, Stripe, cashout |
| **8–10** | **React Admin** | Timesheets, QR/barcodes, outlets, attendance charts |
| **11** | **React Admin** | Notifications (list, send, mark read) |
| **12** | **React Admin** | Reports, penalties, support feedback, admin profile |
| **13** | **Native App** | Jobs (list, detail, apply, cancel), wallet, attendance, notifications |
| **14–15** | Both | Error format, pagination, backend notes |

---

## 1. Login & auth (start here)

### 1.1 Admin login  
**POST** `/admin/login`  
**Access:** Public

**Request:**
```json
{
  "email": "admin@worklah.com",
  "password": "adminPassword123"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800,
  "admin": {
    "_id": "507f1f77bcf86cd799439001",
    "email": "admin@worklah.com",
    "role": "ADMIN",
    "fullName": "Admin User",
    "permissions": ["all"]
  }
}
```

**Error (4xx):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 1.2 Get current admin (session check)  
**GET** `/admin/me`  
**Access:** Admin (Bearer token)

**Headers:** `Authorization: Bearer {adminToken}`

**Success (200):**
```json
{
  "success": true,
  "admin": {
    "_id": "507f1f77bcf86cd799439001",
    "email": "admin@worklah.com",
    "role": "ADMIN",
    "fullName": "Admin User",
    "permissions": ["all"]
  }
}
```

---

### 1.3 Admin logout  
**POST** `/admin/logout`  
**Access:** Admin (Bearer token)

**Success (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.4 Forgot password  
**POST** `/user/forgot-password`  
**Access:** Public

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### 1.5 User login (Native – OTP)  
**POST** `/user/login`  
**Access:** Public

**Request:**
```json
{
  "phoneNumber": "+6512345678"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otpSent": true
}
```

---

### 1.6 Verify OTP (Native)  
**POST** `/user/verify-otp`  
**Access:** Public

**Request:**
```json
{
  "phoneNumber": "+6512345678",
  "otp": "123456"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "phoneNumber": "+6512345678",
    "role": "USER",
    "fullName": "John Doe",
    "profileCompleted": true
  }
}
```

---

### 1.7 Get current user (Native)  
**GET** `/user/me`  
**Access:** User (Bearer token)

**Success (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "phoneNumber": "+6512345678",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "USER",
    "profileCompleted": true,
    "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg"
  }
}
```

---

### 1.8 User logout (Native)  
**POST** `/user/logout`  
**Access:** User (Bearer token)

**Success (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Dashboard (after login)

### 2.1 Dashboard stats  
**GET** `/admin/dashboard/stats`  
**Access:** Admin

**Query:** `startDate`, `endDate`, `employerId` (optional)

**Success (200):**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 1250,
    "activeUsers": 850,
    "totalJobs": 350,
    "activeJobs": 120,
    "totalApplications": 2500,
    "pendingApplications": 45,
    "approvedApplications": 2000,
    "rejectedApplications": 455,
    "totalRevenue": 125000.50,
    "pendingPayments": 5000.00,
    "completedJobs": 1800,
    "cancelledJobs": 200
  },
  "recentActivity": [
    {
      "type": "application",
      "message": "New application submitted",
      "timestamp": "2024-12-25T10:00:00Z"
    }
  ]
}
```

---

### 2.2 Dashboard charts  
**GET** `/admin/dashboard/charts`  
**Access:** Admin

**Query:** `period` (daily|weekly|monthly|yearly), `startDate`, `endDate`

**Success (200):**
```json
{
  "success": true,
  "charts": {
    "applicationsOverTime": [
      { "date": "2024-12-01", "count": 50 }
    ],
    "jobsByStatus": { "active": 120, "completed": 180, "cancelled": 50 },
    "revenueOverTime": [
      { "date": "2024-12-01", "amount": 5000.00 }
    ]
  }
}
```

---

## 3. Employers (create before jobs)

### 3.1 List employers  
**GET** `/admin/employers`  
**Access:** Admin

**Query:** `page`, `limit`, `search`

**Success (200):** Response **must** include `outlets` for each employer (needed for job creation).
```json
{
  "success": true,
  "employers": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "employerId": "EMP-1234",
      "companyLegalName": "ABC Restaurant Pte Ltd",
      "companyLogo": "https://worklah.onrender.com/uploads/logo.png",
      "accountManager": "John Manager",
      "email": "contact@abcrestaurant.com",
      "phoneNumber": "+6512345678",
      "outlets": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "name": "Orchard Branch",
          "address": "123 Orchard Road",
          "barcode": "OUTLET-BARCODE-123"
        }
      ],
      "totalJobs": 50,
      "activeJobs": 10,
      "status": "active",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10
  }
}
```

---

### 3.2 Get one employer  
**GET** `/admin/employers/:employerId`  
**Access:** Admin

**Success (200):** Must include `outlets` (each outlet may have `barcode` for shift check-in).
```json
{
  "success": true,
  "employer": {
    "_id": "507f1f77bcf86cd799439012",
    "employerId": "EMP-1234",
    "companyLegalName": "ABC Restaurant Pte Ltd",
    "companyLogo": "https://...",
    "hqAddress": "123 Main Street",
    "contactPersonName": "John",
    "mainContactNumber": "+6512345678",
    "emailAddress": "contact@abc.com",
    "industry": "Hospitality",
    "outlets": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Orchard Branch",
        "address": "123 Orchard Road",
        "managerName": "Jane",
        "contactNumber": "+6598765432",
        "barcode": "OUTLET-BARCODE-123"
      }
    ]
  }
}
```

---

### 3.3 Create employer  
**POST** `/admin/employers`  
**Access:** Admin

**Body:** `multipart/form-data`. Fields (examples):  
`companyLegalName`, `companyNumber`, `hqAddress`, `contactPersonName`, `jobPosition`, `mainContactNumber`, `mainContactExtension`, `alternateContactNumber`, `emailAddress`, `industry`, `companyLogo` (file), `acraBizfileCert` (file), `serviceContract` (file), `contractExpiryDate`, `serviceAgreement`.  
Outlets: array of `name`, `managerName`, `contactNumber`, `address` (optional: `openingHours`, `closingHours`).  
Backend should auto-generate outlet **barcode** for shift check-in; do not send barcode from client.

**Success (201):**
```json
{
  "success": true,
  "message": "Employer created successfully",
  "employer": {
    "_id": "507f1f77bcf86cd799439012",
    "employerId": "EMP-1234",
    "companyLegalName": "ABC Restaurant Pte Ltd"
  }
}
```

---

### 3.4 Update employer  
**PUT** `/admin/employers/:employerId`  
**Access:** Admin

**Body:** Same as create (multipart/form-data). For existing outlets include `_id`; new outlets omit `_id`. Do not send `barcode` for new outlets (backend generates).

**Success (200):**
```json
{
  "success": true,
  "message": "Employer updated successfully",
  "employer": { ... }
}
```

---

### 3.5 Delete employer  
**DELETE** `/admin/employers/:employerId`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "message": "Employer deleted successfully"
}
```

**Error (400):** e.g. employer has active jobs – return `success: false`, `message`, `error`.

---

### 3.6 Delete outlet  
**DELETE** `/admin/employers/:employerId/outlets/:outletId`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "message": "Outlet deleted successfully"
}
```

---

## 4. Jobs (require employer + outlet)

### 4.1 List jobs  
**GET** `/admin/jobs`  
**Access:** Admin

**Query:** `page`, `limit`, `status`, `search`, `employerId`, `outletId`, `startDate`, `endDate`, `sortOrder`

**Success (200):**
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "jobId": "JOB-1234",
      "jobName": "Waiter",
      "jobTitle": "Waiter",
      "jobDate": "2024-12-25",
      "status": "Active",
      "employer": { "_id": "...", "companyLegalName": "ABC Restaurant" },
      "outlet": { "_id": "...", "name": "Orchard Branch", "address": "..." },
      "totalApplications": 15,
      "approvedApplications": 10,
      "pendingApplications": 5,
      "createdAt": "2024-12-20T10:00:00Z"
    }
  ],
  "pagination": { "currentPage": 1, "totalPages": 10, "totalItems": 200, "itemsPerPage": 20 }
}
```

---

### 4.2 Get one job  
**GET** `/admin/jobs/:jobId`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "job": {
    "_id": "507f1f77bcf86cd799439011",
    "jobId": "JOB-1234",
    "jobName": "Waiter",
    "jobDescription": "...",
    "jobDate": "2024-12-25",
    "status": "Active",
    "employer": { ... },
    "outlet": { ... },
    "shifts": [
      {
        "_id": "...",
        "shiftDate": "2024-12-25",
        "startTime": "09:00",
        "endTime": "17:00",
        "breakDuration": 1,
        "rateType": "Hourly",
        "rates": 12.50,
        "totalWages": 100.00,
        "vacancy": 5,
        "standbyVacancy": 2
      }
    ],
    "skills": ["Customer service"],
    "applicationDeadline": "2024-12-24T23:59:59Z",
    "barcodes": [],
    "qrCodes": []
  }
}
```

---

### 4.3 Create job  
**POST** `/admin/jobs` or **POST** `/admin/jobs/create`  
**Access:** Admin  
*(Admin panel uses `POST /admin/jobs/create`; backend may expose either path.)*

**Request (JSON):**
```json
{
  "jobTitle": "Waiter",
  "jobName": "Waiter",
  "jobDescription": "Serve customers...",
  "jobDate": "2024-12-25",
  "employerId": "507f1f77bcf86cd799439012",
  "outletId": "507f1f77bcf86cd799439013",
  "industry": "Hospitality",
  "locationDetails": "123 Main Street",
  "totalPositions": 5,
  "foodHygieneCertRequired": false,
  "jobStatus": "Active",
  "applicationDeadline": "2024-12-24",
  "dressCode": "Uniform provided",
  "skills": ["Customer service", "Food handling"],
  "shifts": [
    {
      "shiftDate": "2024-12-25",
      "startTime": "09:00",
      "endTime": "17:00",
      "breakDuration": 1,
      "rateType": "Hourly",
      "rates": 12.5,
      "vacancy": 5,
      "standbyVacancy": 2
    }
  ]
}
```

**Validation:** `employerId` must exist; `outletId` must belong to that employer.

**Success (201):**
```json
{
  "success": true,
  "message": "Job created successfully",
  "job": {
    "_id": "507f1f77bcf86cd799439011",
    "jobId": "JOB-1234",
    "jobName": "Waiter",
    "status": "Active"
  }
}
```

---

### 4.4 Update job  
**PUT** `/admin/jobs/:jobId`  
**Access:** Admin

**Request:** Same shape as create job (JSON). Include existing shift `_id` for updates.

**Success (200):**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "job": { ... }
}
```

---

### 4.5 Delete job  
**DELETE** `/admin/jobs/:jobId`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

**Error (400):** e.g. job has active applications – `success: false`, `message`, `error`.

---

### 4.6 Rate configuration (for job forms)  
**GET** `/admin/rate-configuration`  
**Access:** Admin

**Success (200):** e.g. rate types, defaults, validation rules (structure as needed).

---

### 4.7 Deployment tracking  
**GET** `/admin/jobs/deployment-tracking`  
**Access:** Admin

**Query:** `startDate`, `endDate`, `employerId`

**Success (200):**
```json
{
  "success": true,
  "deployments": [
    {
      "jobId": "JOB-1234",
      "jobName": "Waiter",
      "jobDate": "2024-12-25",
      "deployedCount": 10,
      "requiredCount": 15,
      "status": "In Progress"
    }
  ]
}
```

---

## 5. Applications (admin review & confirm)

### 5.1 List applications  
**GET** `/admin/applications`  
**Access:** Admin

**Query:** `page`, `limit`, `status`, `search`

**Success (200):**
```json
{
  "success": true,
  "applications": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439011",
      "user": {
        "fullName": "John Doe",
        "phoneNumber": "+6512345678",
        "email": "user@example.com",
        "profilePicture": "https://..."
      },
      "jobId": "507f1f77bcf86cd799439012",
      "job": { "jobName": "Waiter", "jobDate": "2024-12-25" },
      "shiftId": "507f1f77bcf86cd799439013",
      "shift": { "startTime": "09:00", "endTime": "17:00" },
      "status": "Pending",
      "adminStatus": "Pending",
      "candidateConfirmed": false,
      "appliedAt": "2024-12-22T10:00:00Z"
    }
  ],
  "pagination": { "currentPage": 1, "totalPages": 5, "totalItems": 50 }
}
```

---

### 5.2 Get one application  
**GET** `/admin/applications/:applicationId`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "application": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "user": { "fullName": "...", "email": "...", "phoneNumber": "...", "profilePicture": "...", "nric": "...", "resumeUrl": "...", "profileCompleted": true },
    "jobId": "507f1f77bcf86cd799439012",
    "job": { "jobName": "...", "jobDate": "...", "jobTitle": "...", "location": "...", "employer": { "companyLegalName": "..." }, "outlet": { "name": "...", "address": "..." } },
    "shiftId": "...",
    "shift": { "startTime": "...", "endTime": "...", "payRate": 12.5, "totalWage": 100 },
    "status": "Pending",
    "adminStatus": "Pending",
    "candidateConfirmed": false,
    "appliedAt": "2024-12-22T10:00:00Z",
    "adminNotes": null,
    "rejectionReason": null
  }
}
```

---

### 5.3 Approve application  
**POST** `/admin/applications/:applicationId/approve`  
**Access:** Admin

**Request:**
```json
{
  "notes": "Approved - Good profile"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Application approved successfully",
  "application": {
    "_id": "507f1f77bcf86cd799439014",
    "adminStatus": "Approved",
    "status": "Upcoming"
  }
}
```

---

### 5.4 Reject application  
**POST** `/admin/applications/:applicationId/reject`  
**Access:** Admin

**Request:**
```json
{
  "reason": "Profile incomplete",
  "notes": "User needs to complete profile first"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Application rejected successfully",
  "application": {
    "_id": "507f1f77bcf86cd799439014",
    "adminStatus": "Rejected",
    "status": "Rejected"
  }
}
```

---

### 5.5 Get job candidates  
**GET** `/admin/jobs/candidates/:jobId`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "candidates": [ ... ],
  "pagination": { ... }
}
```

---

### 5.6 Update application status (by user/app)  
**PUT** `/admin/applications/status/:userId` or **PUT** `/admin/applications/status/:applicationId`  
**Access:** Admin

**Request:**
```json
{
  "status": "Approved",
  "newStatus": "Confirmed",
  "notes": "..."
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Application status updated",
  "application": { ... }
}
```

---

## 6. Users & candidates (Hustle Heroes, edit profile)

### 6.1 List users  
**GET** `/admin/users`  
**Access:** Admin

**Query:** `page`, `limit`, `search`, `role`, `profileCompleted`, `status`. For NRIC lookup: `search`, `nric`.

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
      "totalApplications": 25,
      "approvedApplications": 20,
      "completedJobs": 15,
      "walletBalance": 150.50,
      "status": "active",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 6.2 Get one user  
**GET** `/admin/users/:userId`  
**Access:** Admin

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
    "profilePicture": "https://...",
    "dateOfBirth": "1990-01-01",
    "address": "123 Main Street",
    "nric": "S1234567A",
    "status": "active",
    "verificationStatus": "Approved",
    "verificationAction": null
  }
}
```

---

### 6.3 Verify / reject user (candidate)  
**PUT** `/admin/users/:userId/verify`  
**Access:** Admin

**Request:**
```json
{
  "action": "Approved",
  "reason": "Optional rejection reason if action is Rejected"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "User verified successfully",
  "user": { "_id": "...", "verificationStatus": "Approved" }
}
```

---

### 6.4 Delete user  
**DELETE** `/admin/users/:userId`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 6.5 Create user (admin)  
**POST** `/admin/users/create`  
**Access:** Admin

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "USER",
  "nric": "S1234567A",
  "phoneNumber": "+6512345678",
  "employerId": "507f1f77bcf86cd799439012",
  "sendCredentials": true
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": { ... },
  "credentialsSent": true
}
```

---

### 6.6 List candidates  
**GET** `/admin/candidates`  
**Access:** Admin

**Query:** `page`, `limit`, `search`, `sort` (e.g. `-createdAt`)

**Success (200):**
```json
{
  "success": true,
  "candidates": [ ... ],
  "pagination": { ... }
}
```

---

### 6.7 Get one candidate  
**GET** `/admin/candidates/:candidateId`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "candidate": {
    "_id": "...",
    "fullName": "John Doe",
    "mobile": "+6512345678",
    "email": "john@example.com",
    "nric": "S1234567A",
    "dateOfBirth": "01/01/1990",
    "gender": "Male",
    "postalCode": "123456",
    "streetAddress": "123 Main St",
    "profilePicture": "https://...",
    "nricFront": "https://...",
    "nricBack": "https://...",
    "schools": "...",
    "studentIdNo": "...",
    "eWalletAmount": 0,
    "registrationType": "Singaporean/PR",
    "status": "active",
    "verificationStatus": "Approved"
  }
}
```

---

### 6.8 Update candidate  
**PUT** `/admin/candidates/:candidateId`  
**Access:** Admin

**Body:** `multipart/form-data`. Fields: `fullName`, `mobile`, `email`, `nric`, `dateOfBirth`, `gender`, `postalCode`, `streetAddress`, `profilePicture`, `nricFront`, `nricBack`, `plocImage`, `plocExpiryDate`, `foodHygieneCert`, `schools`, `studentPassImage`, `studentIdNo`, `eWalletAmount`, `registrationType`, etc.

**Success (200):**
```json
{
  "success": true,
  "message": "Candidate updated successfully",
  "candidate": { ... }
}
```

---

### 6.9 Delete candidate  
**DELETE** `/admin/candidates/:candidateId`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "message": "Candidate deleted successfully"
}
```

---

### 6.10 Schools list (for candidate form)  
**GET** `/admin/schools`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "schools": ["School A", "School B", ...]
}
```

---

### 6.11 Postal code → address (Singapore)  
**GET** `/admin/postal-code/:postalCode`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "streetAddress": "123 Main Street, Singapore 123456"
}
```

---

## 7. Payments & transactions (admin + Stripe)

### 7.1 List payment transactions (employee wages)  
**GET** `/admin/payments/transactions`  
**Access:** Admin

**Query:** `page`, `limit`, `type` (credit|debit), `status`, `startDate`, `endDate`, `rateType`

**Success (200):**
```json
{
  "success": true,
  "payments": [
    {
      "_id": "...",
      "transactionId": "TXN-123",
      "shiftId": "...",
      "worker": { "fullName": "...", "profilePicture": "...", "nric": "...", "mobileNumber": "..." },
      "amount": 100.00,
      "totalAmount": 100.00,
      "type": "Salary",
      "shiftDate": "2024-12-25",
      "dateOfShiftCompleted": "2024-12-25",
      "transactionDateTime": "2024-12-26T10:00:00Z",
      "status": "Pending",
      "remarks": "...",
      "paymentIntentId": "pi_xxx",
      "currency": "SGD"
    }
  ],
  "pagination": { ... }
}
```

---

### 7.2 Create payment transaction (add payment)  
**POST** `/admin/payments/transactions`  
**Access:** Admin

**Request:**
```json
{
  "nric": "S1234567A",
  "jobId": "507f1f77bcf86cd799439012",
  "shiftDate": "2024-12-25",
  "startTime": "09:00",
  "endTime": "17:00",
  "breakDuration": 0.5,
  "penaltyAmount": 0,
  "totalAmount": 100.00,
  "type": "Salary",
  "remarks": "Optional"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "transaction": { ... }
}
```

---

### 7.3 Approve transaction  
**PUT** `/admin/payments/transactions/:transactionId/approve`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "message": "Transaction approved successfully"
}
```

---

### 7.4 Reject transaction  
**PUT** `/admin/payments/transactions/:transactionId/reject`  
**Access:** Admin

**Request:**
```json
{
  "reason": "Incorrect hours"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Transaction rejected successfully"
}
```

---

### 7.5 Bulk approve transactions  
**POST** `/admin/payments/transactions/bulk-approve`  
**Access:** Admin

**Request:**
```json
{
  "transactionIds": ["id1", "id2", "id3"]
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Transactions approved successfully",
  "approvedCount": 3
}
```

---

### 7.6 Regenerate payment (edit hours/break/penalty)  
**POST** `/admin/transactions/:transactionId/regenerate`  
**Access:** Admin

**Request:**
```json
{
  "startTime": "09:00",
  "endTime": "17:00",
  "breakDuration": 0.5,
  "penaltyAmount": 0
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Payment updated",
  "transaction": { ... }
}
```

---

### 7.7 Generate payslip  
**POST** `/admin/payments/generate-payslip/:transactionId`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "payslipUrl": "https://...",
  "message": "Payslip generated successfully"
}
```

---

### 7.8 Stripe config (for pay-with-card UI)  
**GET** `/stripe/config`  
**Access:** Admin (or public if no auth)

**Success (200):**
```json
{
  "success": true,
  "stripeEnabled": true,
  "publishableKey": "pk_test_..."
}
```

---

### 7.9 Create Stripe payment intent (admin pay worker)  
**POST** `/stripe/create-payment-intent`  
**Access:** Admin

**Request:** Backend accepts either `transactionId` or `paymentId` (same value: the payment/transaction `_id`).
```json
{
  "transactionId": "507f1f77bcf86cd799439016",
  "amount": 100.00,
  "currency": "SGD"
}
```

**Success (200):**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx"
}
```

---

### 7.10 Refund (Stripe)  
**POST** `/admin/payments/transactions/:transactionId/refund`  
**Access:** Admin

**Request:**
```json
{
  "reason": "Duplicate payment"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Refund processed successfully"
}
```

---

### 7.11 Admin cashout (create withdrawal / transaction)  
**POST** `/admin/cashout`  
**Access:** Admin

**Request:**
```json
{
  "employeeId": "507f1f77bcf86cd799439011",
  "transactionType": "Cash Out",
  "date": "2024-12-25",
  "details": {
    "type": "Job ID",
    "jobId": "JOB-1234",
    "description": "Job ID: JOB-1234"
  },
  "amount": 100.00,
  "cashOutMethod": "Bank Account",
  "accountDetails": {
    "accountNumber": "1234567890",
    "bankName": "DBS"
  }
}
```

For **PayNow** omit `accountDetails` or send `cashOutMethod`: `"PayNow"`.  
**Singapore bank account rules:** 7–14 digits; DBS/POSB 9–10, OCBC 10–12, UOB 10, Standard Chartered 10, HSBC up to 12, CIMB 10.

**Success (200):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "transaction": { ... }
}
```

---

### 7.12 Employer payments list  
**GET** `/admin/payments/transactions`  
**Access:** Admin

**Query:** `type=credit`, `payerType=employer`, `status` (pending|outstanding), `startDate`, `endDate`, `page`, `limit`

**Success (200):** Same shape as 7.1; filter or tag employer payments in response.

---

## 8. Timesheets

### 8.1 List timesheets  
**GET** `/admin/timesheets`  
**Access:** Admin

**Query:** `page`, `limit`, `startDate`, `endDate`, `employerId`

**Success (200):**
```json
{
  "success": true,
  "timesheets": [
    {
      "_id": "...",
      "employerId": "507f1f77bcf86cd799439012",
      "employer": { "companyLegalName": "ABC Restaurant" },
      "startDate": "2024-12-01",
      "endDate": "2024-12-31",
      "createdAt": "2024-12-15T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 8.2 Generate timesheet  
**POST** `/admin/timesheets/generate`  
**Access:** Admin

**Request (used by Admin Panel):**
```json
{
  "employerId": "507f1f77bcf86cd799439012",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31"
}
```

*(Backend may also support job-based: `jobId`, `date`, `autoEmail`.)  
Validation: `startDate` ≤ `endDate`.

**Success (200):**
```json
{
  "success": true,
  "message": "Timesheet generated successfully",
  "timesheet": {
    "_id": "...",
    "employerId": "...",
    "startDate": "2024-12-01",
    "endDate": "2024-12-31",
    "createdAt": "..."
  }
}
```

---

### 8.3 Send timesheet email  
**POST** `/admin/timesheets/:timesheetId/send-email`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "message": "Timesheet email sent successfully"
}
```

---

### 8.4 Download timesheet (PDF)  
**GET** `/admin/timesheets/:timesheetId/download`  
**Access:** Admin

**Query:** `format` (pdf|excel) optional

**Response:** Binary (e.g. PDF). Headers: `Content-Disposition: attachment; filename=timesheet-{id}.pdf`

---

## 9. QR codes & barcodes

### 9.1 List QR codes  
**GET** `/admin/qr-codes`  
**Access:** Admin

**Query:** `jobId`, `employerId`, `outletId`, `status`

**Success (200):**
```json
{
  "success": true,
  "qrCodes": [
    {
      "_id": "...",
      "qrCodeId": "A-1",
      "employerId": "...",
      "employer": { "companyLegalName": "...", "companyLogo": "..." },
      "outletId": "...",
      "outlet": { "name": "...", "address": "..." },
      "status": "Active",
      "generatedAt": "..."
    }
  ]
}
```

*(Backend may return `barcodes` instead of `qrCodes`; admin panel accepts both.)*

---

### 9.2 Generate QR code  
**POST** `/admin/qr-codes/generate`  
**Access:** Admin

**Request:**
```json
{
  "employerId": "507f1f77bcf86cd799439012",
  "outletId": "507f1f77bcf86cd799439013",
  "jobId": "507f1f77bcf86cd799439011"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "qrCode": {
    "_id": "...",
    "qrCodeId": "A-1",
    "employerId": "...",
    "outletId": "...",
    "status": "Active",
    "generatedAt": "..."
  }
}
```

---

### 9.3 Delete QR code  
**DELETE** `/admin/qr-codes/:qrCodeId`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "message": "QR code deleted successfully"
}
```

---

### 9.4 Scan QR / barcode (Native – attendance)  
**POST** `/api/qr/scan` or equivalent attendance/check-in endpoint  
**Access:** User (Bearer token)

**Request:**
```json
{
  "qrCode": "A-1",
  "barcode": "OUTLET-BARCODE-123",
  "jobId": "...",
  "shiftId": "...",
  "latitude": 1.2966,
  "longitude": 103.8525
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Check-in successful",
  "attendance": { ... }
}
```

*Outlet barcode is generated by backend when outlet is created/updated; workers scan it for shift check-in. QR codes can encode job/outlet/employer for the same flow.*

---

## 10. Outlets & attendance

### 10.1 List outlets  
**GET** `/admin/outlets`  
**Access:** Admin

**Query:** `page`, `limit`, `employerId`, `search`

**Success (200):**
```json
{
  "success": true,
  "outlets": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Orchard Branch",
      "address": "123 Orchard Road",
      "employer": { "_id": "...", "companyLegalName": "..." },
      "barcode": "OUTLET-BARCODE-123"
    }
  ],
  "pagination": { ... }
}
```

---

### 10.2 Get one outlet  
**GET** `/admin/outlets/:outletId`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "outlet": {
    "_id": "...",
    "name": "Orchard Branch",
    "address": "123 Orchard Road",
    "barcode": "OUTLET-BARCODE-123",
    "employer": { ... }
  }
}
```

---

### 10.3 Outlet attendance chart  
**GET** `/admin/outlets/:outletId/attendance/chart`  
**Access:** Admin

**Query:** `year`

**Success (200):**
```json
{
  "success": true,
  "chartData": {
    "monthly": [
      { "month": "January", "attendance": 150 },
      { "month": "February", "attendance": 180 }
    ]
  }
}
```

---

### 10.4 Job detail page (outlet attendance link)  
**GET** `/admin/jobs/:jobId`  
Returns job with `outlet`; use `outlet._id` for link to outlet attendance (e.g. `/jobs/:jobId/outlet-attendance` in admin panel).

---

## 11. Notifications

### 11.1 List notifications (admin)  
**GET** `/admin/notifications`  
**Access:** Admin

**Query:** `limit`, `source=admin`

**Success (200):**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "...",
      "title": "...",
      "message": "...",
      "read": false,
      "createdAt": "..."
    }
  ]
}
```

---

### 11.2 Mark notification read  
**PUT** `/admin/notifications/:notificationId/read`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 11.3 Mark all read  
**PUT** `/admin/notifications/read-all`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### 11.4 Send notification  
**POST** `/admin/notifications/send`  
**Access:** Admin

**Request:**
```json
{
  "recipientType": "all",
  "userId": "507f1f77bcf86cd799439011",
  "employerId": "507f1f77bcf86cd799439012",
  "title": "New job available",
  "message": "Check the app for new shifts."
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "notificationId": "..."
}
```

---

## 12. Reports & support

### 12.1 Penalties list (for job forms)  
**GET** `/admin/penalties`  
**Access:** Admin

**Success (200):**
```json
{
  "success": true,
  "penalties": [
    { "condition": "No-show", "penalty": "50" },
    { "condition": "Late > 30 min", "penalty": "20" }
  ]
}
```

---

### 12.2 Sales report  
**GET** `/admin/sales-report`  
**Access:** Admin

**Query:** `startDate`, `endDate`, `employerId`

**Success (200):** Structure as needed (e.g. `report`, `period`, `totalRevenue`).

---

### 12.3 Invoice report  
**GET** `/admin/invoice-report`  
**Access:** Admin

**Success (200):** Structure as needed.

---

### 12.4 Service report  
**GET** `/admin/service-report`  
**Access:** Admin

**Success (200):** Structure as needed.

---

### 12.5 Support feedback  
**POST** `/support/feedback`  
**Access:** Admin or Public

**Request:**
```json
{
  "name": "Admin User",
  "email": "admin@worklah.com",
  "subject": "Issue",
  "message": "Description of feedback"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

---

### 12.6 Admin profile image  
**GET** `/admin/profile/image`  
**Access:** Admin

**Success (200):** Image URL or binary; used for header avatar.

---

## 13. Native App – jobs, wallet, profile, attendance, notifications

**Auth:** All endpoints below require **User** token: `Authorization: Bearer {userToken}` (from OTP verify, §1.6).

### 13.1 List jobs (Native)  
**GET** `/jobs`  
**Access:** User (Bearer token)

**Query:** `page`, `limit`, `search`, `status`, `location`, `date`, `rateType`

**Success (200):**
```json
{
  "success": true,
  "jobs": [ ... ],
  "pagination": { "currentPage": 1, "totalPages": 10, "totalItems": 100, "itemsPerPage": 10 }
}
```

---

### 13.2 Job detail (Native)  
**GET** `/jobs/:id`  
**Access:** User

**Success (200):** `{ "success": true, "job": { ... } }`

---

### 13.3 Apply for job  
**POST** `/jobs/:jobId/apply`  
**Access:** User

**Request:**
```json
{
  "shiftId": "507f1f77bcf86cd799439013",
  "notes": "Optional message"
}
```

**Success (200):** `{ "success": true, "message": "Application submitted", "application": { ... } }`

---

### 13.4 Cancel application  
**POST** `/jobs/:jobId/cancel`  
**Access:** User

**Request:** `{ "applicationId": "...", "reason": "Optional" }`  
**Alternative:** **POST** `/jobs/:jobId/applications/:applicationId/cancel` (reason in body)

**Success (200):** `{ "success": true, "message": "Application cancelled" }`

---

### 13.5 My jobs – ongoing / completed / cancelled  
**GET** `/jobs/ongoing`  
**GET** `/jobs/completed`  
**GET** `/jobs/cancelled`  
**Access:** User

**Success (200):** `{ "success": true, "jobs": [ ... ] }` (or equivalent list)

---

### 13.6 Wallet & transactions (Native)  
**GET** `/wallet`  
**Access:** User

**Success (200):**
```json
{
  "success": true,
  "wallet": {
    "balance": 150.50,
    "totalEarnings": 500.00,
    "pendingCashout": 0,
    "availableBalance": 150.50
  }
}
```

**GET** `/jobs/transactions` – user’s payment/transaction history.  
**Success (200):** `{ "success": true, "transactions": [ ... ] }`

---

### 13.7 Request cashout (Native)  
**POST** `/wallet/cashout` or **POST** `/jobs/cashout`  
**Access:** User

**Request:**
```json
{
  "amount": 100.00,
  "cashOutMethod": "Bank Account",
  "accountDetails": {
    "accountNumber": "1234567890",
    "bankName": "DBS"
  }
}
```
For **PayNow** use `cashOutMethod`: `"PayNow"` (omit or adjust `accountDetails` as per backend). Singapore bank account rules: 7–14 digits; bank-specific lengths (e.g. DBS/POSB 9–10, OCBC 10–12).

**Success (200):** `{ "success": true, "message": "Cashout request submitted", "transaction": { ... } }`

---

### 13.8 Profile (Native)  
**GET** `/user/me` – current user (§1.7)  
**GET** `/user/profile` – full profile  
**GET** `/user/profile-completion` – completion % and apply eligibility  
**PUT** `/profile/update` – update profile (body per backend)  
**PUT** `/profile/complete-profile` – complete profile (multipart/form-data with documents)

---

### 13.9 My applications & confirm  
**GET** `/user/applications` – list user’s applications with status  
**POST** `/user/applications/:applicationId/confirm` – confirm attendance after approval

---

### 13.10 Attendance (clock-in / clock-out)  
**POST** `/attendance/clock-in`  
**Access:** User

**Request:**
```json
{
  "jobId": "507f1f77bcf86cd799439012",
  "applicationId": "507f1f77bcf86cd799439014",
  "latitude": 1.2966,
  "longitude": 103.8525
}
```

**Success (200):** `{ "success": true, "message": "Clocked in", "attendance": { ... } }`

**POST** `/qr/clock-out`  
**Access:** User

**Request:** `{ "attendanceId": "...", "latitude": 1.2966, "longitude": 103.8525 }` (or as required by backend)

**Success (200):** `{ "success": true, "message": "Clocked out" }`

**POST** `/qr/scan` – scan QR/barcode for job/outlet (body: `qrCode`, `barcode`, `jobId`, `shiftId`, etc.). Returns job/shift details for check-in.

---

### 13.11 Notifications (Native)  
**GET** `/notifications` – list user notifications  
**PUT** `/notifications/:notificationId/read` – mark one as read  
**PUT** `/notifications/read-all` – mark all as read

**Success (200):** `{ "success": true, "notifications": [ ... ] }` or `{ "success": true, "message": "Marked as read" }`

---

### 13.12 Saved jobs / bookmarks  
**GET** `/user/saved-jobs`  
**POST** `/user/saved-jobs` – body: `{ "jobId": "..." }`  
**DELETE** `/user/saved-jobs/:jobId`

---

*Paths above are relative to base URL (e.g. `GET /jobs` → `GET {baseURL}/jobs`). Use the same error format (§14) and pagination shape for list endpoints.*

---

## 14. Error format (all endpoints)

**HTTP 4xx/5xx + JSON:**
```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "OptionalErrorCode"
}
```

**Pagination (list endpoints):**
```json
{
  "currentPage": 1,
  "totalPages": 10,
  "totalItems": 100,
  "itemsPerPage": 10
}
```

---

## 15. Backend implementation notes (for sharing with App team)

- **React Admin vs Native App:** This doc covers both. Use the **“Who uses what”** table at the top: Sections 1.1–1.3, 2–12 are for the **React Admin panel**; Sections 1.5–1.8 and **13** are for the **Native App**. Share Section 13 + §1.5–1.8 with the mobile team; share Sections 2–12 + §1.1–1.3 with the React admin team.
- **Base URL:** All paths are relative to `/api` (e.g. `POST /admin/login` → `POST {baseURL}/admin/login`). Development: `http://localhost:3000/api`; Production: use your deployed API base URL.
- **Stripe:** Ensure `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and optionally `STRIPE_WEBHOOK_SECRET` are set in backend `.env`. Stripe config is at **GET** `/stripe/config`; create payment intent at **POST** `/stripe/create-payment-intent` with `transactionId` (or `paymentId`) and `amount`, `currency`.
- **Payments list (7.1):** **GET** `/admin/payments/transactions` returns `payments` (array per doc) and `transactions` (legacy shape). Query params: `page`, `limit`, `status`, `startDate`, `endDate`, `rateType`, `userId`, `jobId`.
- **Create transaction (7.2):** **POST** `/admin/payments/transactions` accepts either `nric` (worker identified by NRIC) or `userId`, plus `jobId`, `shiftDate`, `startTime`, `endTime`, `breakDuration`, `penaltyAmount`, `totalAmount`, `type`, `remarks`.
- **Regenerate (7.6):** **POST** `/admin/transactions/:transactionId/regenerate` — param name is `transactionId` (same ID as the payment record).
- **Cashout (7.11):** **POST** `/admin/cashout` accepts `employeeId` (or `userId`), `amount`, `cashOutMethod` (`"PayNow"` or `"Bank Account"`), and optionally `accountDetails`: `{ accountNumber`, `bankName }`, `date`, `details`, `transactionType`.

---

**End of End-to-End API Documentation.**  
Use this document to implement and test Backend, Admin Panel, and Native App in sync.
