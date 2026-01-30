# Backend API Integration Documentation

**Project:** WorkLah Admin Panel  
**Frontend:** React.js (Using JSX)  
**Backend:** Node.js  
**Created:** January 2025

---

## Base URL Configuration

```javascript
// Development
const API_BASE_URL = "http://localhost:3000/api"

// Production
const API_BASE_URL = "https://worklah-updated-dec.onrender.com"
// or
const API_BASE_URL = "https://worklah-updated-dec.onrender.com/api"
```

**Important:** The base URL already includes `/api`. When making requests, use endpoints WITHOUT the `/api` prefix.

**Example:**
- ✅ Correct: `/admin/login` → Full URL: `https://worklah-updated-dec.onrender.com/admin/login`
- ❌ Wrong: `/api/admin/login` → Full URL: `https://worklah-updated-dec.onrender.com/api/admin/login` (404 Error)

---

## Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Token is stored in:
- localStorage: `authToken`
- Cookies: `authToken` (as backup)

---

## API Endpoints

### Authentication & User Management

#### 1. Admin Login
**Endpoint:** `POST /admin/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "admin": {
    "_id": "ObjectId",
    "email": "admin@example.com",
    "role": "ADMIN",
    "fullName": "Admin Name"
  }
}
```

---

#### 2. Get Current Admin
**Endpoint:** `GET /admin/me`

**Response:**
```json
{
  "success": true,
  "admin": {
    "_id": "ObjectId",
    "email": "admin@example.com",
    "role": "ADMIN",
    "fullName": "Admin Name"
  }
}
```

---

#### 3. Admin Logout
**Endpoint:** `POST /admin/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### 4. Create User (Admin)
**Endpoint:** `POST /admin/users/create`

**Request Body:**
```json
{
  "fullName": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "ADMIN",
  "employerId": "EMP-0001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "_id": "ObjectId",
    "email": "user@example.com",
    "fullName": "User Name",
    "role": "ADMIN"
  }
}
```

---

#### 5. Get All Users
**Endpoint:** `GET /admin/users`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search query
- `nric` (optional): Search by NRIC

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "_id": "ObjectId",
      "fullName": "User Name",
      "email": "user@example.com",
      "role": "USER",
      "status": "Active"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

---

#### 6. Get User by ID
**Endpoint:** `GET /admin/users/:userId`

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "ObjectId",
    "fullName": "User Name",
    "email": "user@example.com",
    "status": "Active",
    "applications": [],
    "transactions": []
  }
}
```

---

#### 7. Update User Status
**Endpoint:** `PATCH /admin/users/:userId/status`

**Request Body:**
```json
{
  "status": "Active" | "Suspended" | "Banned"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User status updated successfully"
}
```

---

#### 8. User Registration
**Endpoint:** `POST /user/register`

**Request Body:**
```json
{
  "fullName": "User Name",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "ObjectId",
    "email": "user@example.com",
    "fullName": "User Name"
  }
}
```

---

#### 9. Forgot Password
**Endpoint:** `POST /user/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### Dashboard

#### 10. Get Dashboard Statistics
**Endpoint:** `GET /admin/dashboard/stats`

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `employerId` (optional): Filter by employer ID

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalJobs": 100,
    "activeJobs": 50,
    "activatedHeroes": 200,
    "vacancies": 500,
    "vacanciesFilled": 300,
    "pendingVerifications": 10,
    "pendingPayments": 5,
    "totalAmountPaid": 50000,
    "noShows": 15,
    "verifiedHeroes": 180,
    "revenue": {
      "total": 100000,
      "thisMonth": 15000,
      "lastMonth": 12000
    }
  }
}
```

---

#### 11. Get Dashboard Charts
**Endpoint:** `GET /admin/dashboard/charts`

**Query Parameters:**
- `period` (optional): "daily" | "weekly" | "monthly" (default: "monthly")

**Response:**
```json
{
  "success": true,
  "charts": {
    "revenue": [
      { "date": "2025-01-01", "value": 5000 },
      { "date": "2025-01-02", "value": 6000 }
    ],
    "applications": [
      { "date": "2025-01-01", "value": 20 },
      { "date": "2025-01-02", "value": 25 }
    ]
  }
}
```

---

### Employers API

#### 12. Get All Employers
**Endpoint:** `GET /admin/employers`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search query

**Response:**
```json
{
  "success": true,
  "employers": [
    {
      "_id": "ObjectId",
      "employerId": "EMP-0001",
      "companyLegalName": "Company Name",
      "companyLogo": "https://worklah.onrender.com/uploads/logo.jpg",
      "hqAddress": "123 Main St, Singapore",
      "contactPersonName": "John Doe",
      "jobPosition": "Manager",
      "mainContactNumber": "+65 1234 5678",
      "alternateContactNumber": "+65 9876 5432",
      "emailAddress": "contact@company.com",
      "industry": "F&B",
      "serviceAgreement": "Completed",
      "outlets": [
        {
          "_id": "ObjectId",
          "name": "Outlet Name",
          "address": "456 Outlet St",
          "managerName": "Jane Doe",
          "contactNumber": "+65 1111 2222",
          "openingHours": "09:00",
          "closingHours": "17:00",
          "isActive": true
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

**Important:** The response MUST include the `outlets` array for each employer.

---

#### 13. Get Employer by ID
**Endpoint:** `GET /admin/employers/:id`

**Parameters:**
- `id`: Employer ID (accepts both MongoDB ObjectId and EMP-xxxx format)

**Response:**
```json
{
  "success": true,
  "employer": {
    "_id": "ObjectId",
    "employerId": "EMP-0001",
    "companyLegalName": "Company Name",
    "companyLogo": "https://worklah.onrender.com/uploads/logo.jpg",
    "hqAddress": "123 Main St, Singapore",
    "contactPersonName": "John Doe",
    "jobPosition": "Manager",
    "mainContactNumber": "+65 1234 5678",
    "alternateContactNumber": "+65 9876 5432",
    "emailAddress": "contact@company.com",
    "industry": "F&B",
    "serviceAgreement": "Completed",
    "contractExpiryDate": "2025-12-31",
    "outlets": [
      {
        "_id": "ObjectId",
        "name": "Outlet Name",
        "address": "456 Outlet St",
        "managerName": "Jane Doe",
        "contactNumber": "+65 1111 2222",
        "openingHours": "09:00",
        "closingHours": "17:00",
        "isActive": true
      }
    ],
    "jobs": []
  }
}
```

---

#### 14. Create Employer
**Endpoint:** `POST /admin/employers`

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
```
data: JSON string containing:
{
  "companyLegalName": "Company Name" (required),
  "companyNumber": "ACRA123456" (optional),
  "hqAddress": "123 Main St, Singapore" (required),
  "contactPersonName": "John Doe" (required),
  "jobPosition": "Manager" (optional),
  "mainContactNumber": "+65 1234 5678" (required),
  "alternateContactNumber": "+65 9876 5432" (optional),
  "emailAddress": "contact@company.com" (required),
  "industry": "F&B" (required),
  "serviceAgreement": "Completed" (optional, default: "Active"),
  "contractExpiryDate": "2025-12-31" (optional, format: YYYY-MM-DD),
  "generateCredentials": true (optional, default: false),
  "outlets": [
    {
      "name": "Outlet Name" (required if outlet provided),
      "managerName": "Jane Doe" (required if outlet provided),
      "contactNumber": "+65 1111 2222" (required if outlet provided),
      "address": "456 Outlet St" (required if outlet provided),
      "openingHours": "09:00" (optional),
      "closingHours": "17:00" (optional),
      "isActive": true (optional, default: true)
    }
  ]
}

Files (optional):
- companyLogo: Image file
- acraBizfileCert: Image file
- serviceContract: PDF file
```

**Note:** Outlets are **OPTIONAL**. Employers can be created without outlets.

**Response:**
```json
{
  "success": true,
  "message": "Employer created successfully",
  "employer": {
    "_id": "ObjectId",
    "employerId": "EMP-0001",
    ...
  },
  "credentials": {
    "email": "contact@company.com",
    "password": "generated-password",
    "emailSent": true
  }
}
```

---

#### 15. Update Employer
**Endpoint:** `PUT /admin/employers/:id`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `id`: Employer ID (accepts both MongoDB ObjectId and EMP-xxxx format)

**Request Body:** Same as Create Employer

**Response:**
```json
{
  "success": true,
  "message": "Employer updated successfully",
  "employer": {
    ...
  }
}
```

---

#### 16. Delete Employer
**Endpoint:** `DELETE /admin/employers/:id`

**Parameters:**
- `id`: Employer ID (accepts both MongoDB ObjectId and EMP-xxxx format)

**Response:**
```json
{
  "success": true,
  "message": "Employer deleted successfully"
}
```

---

### Outlets API

**Note:** Outlets are primarily managed through the Employer API. Outlets are created/updated/deleted as part of employer creation/update.

#### 17. Get All Outlets
**Endpoint:** `GET /admin/outlets`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `employerId` (optional): Filter by employer ID

**Response:**
```json
{
  "success": true,
  "outlets": [
    {
      "_id": "ObjectId",
      "name": "Outlet Name",
      "address": "456 Outlet St",
      "managerName": "Jane Doe",
      "contactNumber": "+65 1111 2222",
      "openingHours": "09:00",
      "closingHours": "17:00",
      "isActive": true,
      "employer": {
        "employerId": "EMP-0001",
        "companyLegalName": "Company Name"
      }
    }
  ]
}
```

---

#### 18. Get Outlet by ID
**Endpoint:** `GET /admin/outlets/:outletId`

**Parameters:**
- `outletId`: Outlet ID (MongoDB ObjectId) - **NOT employer ID**

**Response:**
```json
{
  "success": true,
  "outlet": {
    "_id": "ObjectId",
    "name": "Outlet Name",
    "address": "456 Outlet St",
    "managerName": "Jane Doe",
    "contactNumber": "+65 1111 2222",
    "openingHours": "09:00",
    "closingHours": "17:00",
    "isActive": true,
    "employer": {
      "employerId": "EMP-0001",
      "companyLegalName": "Company Name"
    }
  }
}
```

---

#### 19. Get Outlet Attendance
**Endpoint:** `GET /admin/outlets/:outletId/attendance`

**Parameters:**
- `outletId`: Outlet ID (MongoDB ObjectId)

**Response:**
```json
{
  "success": true,
  "attendance": [
    {
      "_id": "ObjectId",
      "userId": "ObjectId",
      "userName": "User Name",
      "clockIn": "2025-01-15T09:00:00Z",
      "clockOut": "2025-01-15T17:00:00Z",
      "breakTime": 60,
      "totalHours": 7
    }
  ]
}
```

---

#### 20. Get Outlet Attendance Chart
**Endpoint:** `GET /admin/outlets/:outletId/attendance/chart`

**Query Parameters:**
- `year` (optional): Year (default: current year)

**Response:**
```json
{
  "success": true,
  "chartData": [
    { "month": "January", "totalHours": 500, "totalEmployees": 20 },
    { "month": "February", "totalHours": 600, "totalEmployees": 25 }
  ]
}
```

---

### Jobs API

#### 21. Get All Jobs
**Endpoint:** `GET /admin/jobs`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Job status filter
- `employerId` (optional): Filter by employer ID
- `outletId` (optional): Filter by outlet ID
- `search` (optional): Search query
- `date` (optional): Filter by date
- `location` (optional): Filter by location
- `rateType` (optional): Filter by rate type
- `postedBy` (optional): Filter by postedBy (admin/employer)
- `sortOrder` (optional): "asc" | "desc"

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "ObjectId",
      "jobId": "JOB-0001",
      "jobDate": "2025-01-15",
      "jobTitle": "Waiter Position",
      "jobDescription": "Job description here",
      "employerId": "EMP-0001",
      "employerName": "Company Name",
      "industry": "F&B",
      "outletId": "ObjectId",
      "outletAddress": "456 Outlet St",
      "postedBy": "admin",
      "jobStatus": "Active",
      "totalPositions": 5,
      "foodHygieneCertRequired": false,
      "applicationDeadline": "2025-01-14",
      "dressCode": "Black uniform",
      "skills": ["Customer service", "Cash handling"],
      "locationDetails": "Main branch",
      "shifts": [
        {
          "shiftDate": "2025-01-15",
          "startTime": "09:00",
          "endTime": "17:00",
          "breakDuration": 1,
          "totalWorkingHours": 7,
          "rateType": "Hourly",
          "rates": 15,
          "totalWages": 105,
          "vacancy": 3,
          "standbyVacancy": 2
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100
  }
}
```

---

#### 22. Get Job by ID
**Endpoint:** `GET /admin/jobs/:jobId`

**Parameters:**
- `jobId`: Job ID (MongoDB ObjectId)

**Response:**
```json
{
  "success": true,
  "job": {
    "_id": "ObjectId",
    "jobId": "JOB-0001",
    "jobDate": "2025-01-15",
    "jobTitle": "Waiter Position",
    "jobDescription": "Job description here",
    "employerId": "EMP-0001",
    "employer": {
      "employerId": "EMP-0001",
      "companyLegalName": "Company Name",
      "companyLogo": "https://worklah.onrender.com/uploads/logo.jpg"
    },
    "outlet": {
      "_id": "ObjectId",
      "name": "Outlet Name",
      "address": "456 Outlet St"
    },
    "shifts": [...],
    "penalties": [],
    ...
  }
}
```

---

#### 23. Create Job
**Endpoint:** `POST /admin/jobs`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "jobDate": "2025-01-15" (required, format: YYYY-MM-DD),
  "jobTitle": "Waiter Position" (required),
  "jobDescription": "Job description here" (required),
  "employerId": "EMP-0001" (required),
  "employerName": "Company Name" (optional),
  "industry": "F&B" (optional),
  "postedBy": "admin" (required: "admin" or "employer"),
  "outletId": "ObjectId" (optional - if not provided, use manual outlet),
  "outletAddress": "456 Outlet St" (required if outletId not provided),
  "totalPositions": 5 (optional, default: 1),
  "foodHygieneCertRequired": false (optional),
  "applicationDeadline": "2025-01-14" (optional, format: YYYY-MM-DD),
  "dressCode": "Black uniform" (optional),
  "skills": ["Customer service", "Cash handling"] (optional, array),
  "locationDetails": "Main branch" (optional),
  "shifts": [
    {
      "shiftDate": "2025-01-15" (required, format: YYYY-MM-DD),
      "startTime": "09:00" (required, format: HH:mm),
      "endTime": "17:00" (required, format: HH:mm),
      "breakDuration": 1 (optional, in hours, default: 0),
      "rateType": "Hourly" (required: "Hourly", "Weekly", "Monthly"),
      "rates": 15 (required, number),
      "vacancy": 3 (required, minimum: 1),
      "standbyVacancy": 2 (optional, default: 0)
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job created successfully",
  "job": {
    "_id": "ObjectId",
    "jobId": "JOB-0001",
    ...
  }
}
```

---

#### 24. Update Job
**Endpoint:** `PUT /admin/jobs/:jobId`

**Content-Type:** `application/json`

**Parameters:**
- `jobId`: Job ID (MongoDB ObjectId)

**Request Body:** Same as Create Job

**Response:**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "job": {
    ...
  }
}
```

---

#### 25. Delete Job
**Endpoint:** `DELETE /admin/jobs/:jobId`

**Parameters:**
- `jobId`: Job ID (MongoDB ObjectId)

**Response:**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

#### 26. Get Deployment Tracking
**Endpoint:** `GET /admin/jobs/deployment-tracking`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `employerId` (optional): Filter by employer ID
- `jobId` (optional): Filter by job ID
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "deployments": [
    {
      "_id": "ObjectId",
      "jobId": "JOB-0001",
      "jobTitle": "Waiter Position",
      "employerId": "EMP-0001",
      "status": "Scheduled",
      "deploymentDate": "2025-01-15"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

---

### Candidates & Applications API

#### 27. Get All Candidates
**Endpoint:** `GET /admin/candidates`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `sort` (optional): Sort order (e.g., "-createdAt" for descending)
- `search` (optional): Search query

**Response:**
```json
{
  "success": true,
  "candidates": [
    {
      "_id": "ObjectId",
      "candidateId": "CAN-0001",
      "fullName": "Candidate Name",
      "email": "candidate@example.com",
      "contactNumber": "+65 1234 5678",
      "status": "Verified",
      "icNumber": "S1234567A",
      "dob": "1990-01-01",
      "nationality": "Singaporean",
      "gender": "Male",
      "race": "Chinese"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

---

#### 28. Get Candidate by ID
**Endpoint:** `GET /admin/candidates/:candidateId`

**Parameters:**
- `candidateId`: Candidate ID (MongoDB ObjectId)

**Response:**
```json
{
  "success": true,
  "candidate": {
    "_id": "ObjectId",
    "candidateId": "CAN-0001",
    "fullName": "Candidate Name",
    "email": "candidate@example.com",
    "contactNumber": "+65 1234 5678",
    "status": "Verified",
    "icNumber": "S1234567A",
    "dob": "1990-01-01",
    "nationality": "Singaporean",
    "gender": "Male",
    "race": "Chinese",
    "streetAddress": "123 Street",
    "postalCode": "123456",
    "applications": [],
    "transactions": []
  }
}
```

---

#### 29. Update Candidate
**Endpoint:** `PUT /admin/candidates/:candidateId`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `candidateId`: Candidate ID (MongoDB ObjectId)

**Request Body (FormData):**
```
data: JSON string containing candidate fields

Files (optional):
- profileImage: Image file
- icFront: Image file
- icBack: Image file
- foodHygieneCert: Image file
```

**Response:**
```json
{
  "success": true,
  "message": "Candidate updated successfully",
  "candidate": {
    ...
  }
}
```

---

#### 30. Delete Candidate
**Endpoint:** `DELETE /admin/candidates/:candidateId`

**Parameters:**
- `candidateId`: Candidate ID (MongoDB ObjectId)

**Response:**
```json
{
  "success": true,
  "message": "Candidate deleted successfully"
}
```

---

#### 31. Get Job Candidates
**Endpoint:** `GET /admin/jobs/candidates/:jobId`

**Parameters:**
- `jobId`: Job ID (MongoDB ObjectId)

**Response:**
```json
{
  "success": true,
  "candidates": [
    {
      "_id": "ObjectId",
      "userId": "ObjectId",
      "userName": "User Name",
      "applicationStatus": "Confirmed",
      "applicationDate": "2025-01-10",
      "clockIn": "2025-01-15T09:00:00Z",
      "clockOut": "2025-01-15T17:00:00Z",
      "wage": 105
    }
  ],
  "job": {
    "_id": "ObjectId",
    "jobTitle": "Waiter Position",
    "jobDate": "2025-01-15"
  }
}
```

---

#### 32. Update Application Status
**Endpoint:** `PUT /admin/applications/status/:userId`

**Parameters:**
- `userId`: User ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "status": "Confirmed" | "Pending" | "Rejected",
  "jobId": "ObjectId",
  "rejectionReason": "Reason here" (optional, required if status is "Rejected")
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application status updated successfully"
}
```

---

### Payments & Transactions API

#### 33. Get All Transactions
**Endpoint:** `GET /admin/transactions`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): "incoming" | "outgoing"
- `status` (optional): Transaction status
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "ObjectId",
      "transactionId": "TXN-0001",
      "type": "incoming",
      "amount": 500,
      "status": "Pending",
      "userId": "ObjectId",
      "userName": "User Name",
      "jobId": "ObjectId",
      "jobTitle": "Waiter Position",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

---

#### 34. Process Cashout
**Endpoint:** `POST /admin/cashout`

**Request Body:**
```json
{
  "userId": "ObjectId",
  "amount": 500,
  "bankAccount": "1234567890",
  "bankName": "DBS Bank"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cashout request processed",
  "transaction": {
    "_id": "ObjectId",
    "transactionId": "TXN-0001",
    ...
  }
}
```

---

#### 35. Approve Payment Transaction
**Endpoint:** `PUT /admin/payments/transactions/:transactionId/approve`

**Parameters:**
- `transactionId`: Transaction ID (MongoDB ObjectId)

**Response:**
```json
{
  "success": true,
  "message": "Transaction approved successfully"
}
```

---

#### 36. Reject Payment Transaction
**Endpoint:** `PUT /admin/payments/transactions/:transactionId/reject`

**Parameters:**
- `transactionId`: Transaction ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "reason": "Rejection reason here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction rejected successfully"
}
```

---

#### 37. Bulk Approve Transactions
**Endpoint:** `POST /admin/payments/transactions/bulk-approve`

**Request Body:**
```json
{
  "transactionIds": ["ObjectId1", "ObjectId2", "ObjectId3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transactions approved successfully",
  "approvedCount": 3
}
```

---

#### 38. Generate Payslip
**Endpoint:** `POST /admin/payments/generate-payslip/:transactionId`

**Parameters:**
- `transactionId`: Transaction ID (MongoDB ObjectId)

**Response:**
```json
{
  "success": true,
  "message": "Payslip generated successfully",
  "payslipUrl": "https://worklah.onrender.com/uploads/payslips/payslip.pdf"
}
```

---

### Reports API

#### 39. Get Sales Report
**Endpoint:** `GET /admin/sales-report`

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `employerId` (optional): Filter by employer ID

**Response:**
```json
{
  "success": true,
  "report": {
    "totalSales": 100000,
    "totalTransactions": 500,
    "period": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "data": [
      {
        "date": "2025-01-01",
        "sales": 5000,
        "transactions": 25
      }
    ]
  }
}
```

---

#### 40. Get Invoice Report
**Endpoint:** `GET /admin/invoice-report`

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `employerId` (optional): Filter by employer ID

**Response:**
```json
{
  "success": true,
  "report": {
    "totalInvoices": 100,
    "totalAmount": 50000,
    "invoices": [
      {
        "_id": "ObjectId",
        "invoiceNumber": "INV-0001",
        "employerId": "EMP-0001",
        "amount": 5000,
        "date": "2025-01-15",
        "status": "Paid"
      }
    ]
  }
}
```

---

#### 41. Get Service Report
**Endpoint:** `GET /admin/service-report`

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `jobId` (optional): Filter by job ID

**Response:**
```json
{
  "success": true,
  "report": {
    "totalJobs": 50,
    "totalHours": 5000,
    "totalWorkers": 200,
    "data": [
      {
        "jobId": "JOB-0001",
        "jobTitle": "Waiter Position",
        "totalHours": 100,
        "workers": 10
      }
    ]
  }
}
```

---

### Notifications API

#### 42. Get All Notifications
**Endpoint:** `GET /admin/notifications`

**Query Parameters:**
- `limit` (optional): Items per page (default: 50)
- `page` (optional): Page number

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "ObjectId",
      "title": "Notification Title",
      "message": "Notification message",
      "type": "info",
      "read": false,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

#### 43. Send Notification
**Endpoint:** `POST /admin/notifications/send`

**Request Body:**
```json
{
  "title": "Notification Title",
  "message": "Notification message",
  "type": "info",
  "recipients": {
    "allUsers": true,
    "userIds": ["ObjectId1", "ObjectId2"],
    "employerIds": ["EMP-0001"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "notification": {
    "_id": "ObjectId",
    ...
  }
}
```

---

#### 44. Mark Notification as Read
**Endpoint:** `PUT /admin/notifications/:notificationId/read`

**Parameters:**
- `notificationId`: Notification ID (MongoDB ObjectId)

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

#### 45. Mark All Notifications as Read
**Endpoint:** `PUT /admin/notifications/read-all`

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### QR Codes API

#### 46. Get All QR Codes
**Endpoint:** `GET /admin/qr-codes`

**Query Parameters:**
- `employerId` (optional): Filter by employer ID
- `outletId` (optional): Filter by outlet ID

**Response:**
```json
{
  "success": true,
  "qrCodes": [
    {
      "_id": "ObjectId",
      "qrCodeId": "QR-0001",
      "employerId": "EMP-0001",
      "employerName": "Company Name",
      "outletId": "ObjectId",
      "outletName": "Outlet Name",
      "qrCodeImage": "https://worklah.onrender.com/uploads/qrcodes/qr.png",
      "isActive": true,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

#### 47. Generate QR Code
**Endpoint:** `POST /admin/qr-codes/generate`

**Request Body:**
```json
{
  "employerId": "EMP-0001" (required),
  "outletId": "ObjectId" (required),
  "jobId": "ObjectId" (required)
}
```

**Note:** QR codes are generated based on three parameters: employerId, outletId, and jobId. All three are required.

**Response:**
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "qrCode": {
    "_id": "ObjectId",
    "qrCodeId": "QR-0001",
    "employerId": "EMP-0001",
    "outletId": "ObjectId",
    "jobId": "ObjectId",
    "qrCodeImage": "https://worklah.onrender.com/uploads/qrcodes/qr.png",
    ...
  }
}
```

---

#### 48. Delete QR Code
**Endpoint:** `DELETE /admin/qr-codes/:qrCodeId`

**Parameters:**
- `qrCodeId`: QR Code ID (MongoDB ObjectId)

**Response:**
```json
{
  "success": true,
  "message": "QR code deleted successfully"
}
```

---

### Configuration & Settings API

#### 49. Get Rate Configuration
**Endpoint:** `GET /admin/rate-configuration`

**Response:**
```json
{
  "success": true,
  "rateTypes": ["Hourly", "Weekly", "Monthly"],
  "defaultRates": {
    "Hourly": 15,
    "Weekly": 600,
    "Monthly": 2400
  }
}
```

---

#### 50. Get Penalties
**Endpoint:** `GET /admin/penalties`

**Response:**
```json
{
  "success": true,
  "penalties": [
    {
      "type": "Late",
      "amount": 10,
      "description": "Late arrival penalty"
    }
  ]
}
```

---

#### 51. Get Schools List
**Endpoint:** `GET /admin/schools`

**Response:**
```json
{
  "success": true,
  "schools": [
    {
      "_id": "ObjectId",
      "name": "School Name",
      "code": "SCH001"
    }
  ]
}
```

---

#### 52. Get Postal Code Info
**Endpoint:** `GET /admin/postal-code/:postalCode`

**Parameters:**
- `postalCode`: Singapore postal code (6 digits)

**Response:**
```json
{
  "success": true,
  "streetAddress": "Street Name",
  "buildingName": "Building Name"
}
```

---

### Profile API

#### 53. Get Profile Image
**Endpoint:** `GET /admin/profile/image`

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://worklah.onrender.com/uploads/profile/image.jpg"
}
```

---

#### 54. Upload Profile Image
**Endpoint:** `POST /admin/profile/upload-image`

**Content-Type:** `multipart/form-data`

**Request Body:**
```
image: Image file
```

**Response:**
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "imageUrl": "https://worklah.onrender.com/uploads/profile/image.jpg"
}
```

---

### Support API

#### 55. Submit Support Feedback
**Endpoint:** `POST /support/feedback`

**Request Body:**
```json
{
  "subject": "Support Subject",
  "message": "Support message",
  "category": "Technical" | "Billing" | "General"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "ErrorType"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., duplicate company number)
- `500` - Internal Server Error

---

## Data Formats

### Date Formats
- Dates: `YYYY-MM-DD` (e.g., "2025-01-15")
- DateTime: `YYYY-MM-DDTHH:mm:ssZ` (e.g., "2025-01-15T09:00:00Z")
- Time: `HH:mm` (e.g., "09:00", "17:00")

### ID Formats
- **Employers**: Accepts both MongoDB ObjectId and EMP-xxxx format (e.g., "EMP-0001")
- **Jobs**: MongoDB ObjectId
- **Outlets**: MongoDB ObjectId (NOT employer ID)
- **Users/Candidates**: MongoDB ObjectId

### Rate Types
- "Hourly"
- "Weekly"
- "Monthly"

### Job Status
- "Active"
- "Completed"
- "Cancelled"
- "Suspended"
- "Pending"
- "Upcoming"
- "Ongoing"
- "Filled"
- "Expired"
- "Deactivated"

### Service Agreement Status
- "Completed"
- "In Discussion"
- "Expired"
- "Active"

---

## Important Notes

1. **Outlet Management**: Outlets are managed as part of the Employer entity. They are created/updated/deleted through the Employer API endpoints.

2. **Outlets are Optional**: Employers can be created without outlets. The outlets array can be empty.

3. **File Uploads**: 
   - Use `multipart/form-data` for file uploads
   - Files are sent separately from JSON data
   - JSON data is sent as a string in the `data` field

4. **Request Format for Objects/Arrays**:
   - Use simple JavaScript Objects: `{ key: value }`
   - Use Arrays: `[item1, item2, item3]`
   - Use Key-Value pairs: Standard JSON format
   - Example:
     ```javascript
     {
       "employerId": "EMP-0001",
       "outlets": [
         {
           "name": "Outlet 1",
           "address": "123 St",
           "managerName": "Manager Name",
           "contactNumber": "+65 1234 5678"
         }
       ],
       "shifts": [
         {
           "shiftDate": "2025-01-15",
           "startTime": "09:00",
           "endTime": "17:00",
           "rateType": "Hourly",
           "rates": 15,
           "vacancy": 3
         }
       ]
     }
     ```

5. **Response Format**:
   - All successful responses include `"success": true`
   - All error responses include `"success": false`
   - Data is returned in objects: `{ success: true, data: {...} }`
   - Arrays are returned in objects: `{ success: true, items: [...] }`

---

## Frontend Implementation Notes

- **JSX Format**: Use `.jsx` files (not `.tsx`) for React components
- **Data Structures**: Use simple Objects, Arrays, and Key-Value pairs
- **API Calls**: Use `axiosInstance` or `axiosFileInstance` from `lib/authInstances`
- **Error Handling**: Check `response.data.success === false` for errors
- **Token Management**: Token is automatically added to requests via interceptors

---

## Testing Endpoints

Use tools like:
- Postman
- cURL
- Browser DevTools (Network tab)
- API testing tools

**Example cURL:**
```bash
# Login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Get Employers (with token)
curl -X GET http://localhost:3000/api/admin/employers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Created for:** WorkLah Admin Panel Frontend Integration
