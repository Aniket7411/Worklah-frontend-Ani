# WorkLah Backend API Specification - Final Version

**Complete API documentation for WorkLah Admin Panel, Mobile App (Flutter), and Web App (React Vite).**

**Version:** 3.0.0  
**Last Updated:** December 2024  
**Status:** Production Ready

---

## Base URL

```
Production: https://worklah-updated-dec.onrender.com
Development: http://localhost:3000
```

**API Prefix:** `/api`

---

## Authentication

All protected endpoints require authentication via JWT Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

**Token Format:**
- JWT token with 7 days expiration
- Contains: `_id`, `role`, `email`
- Can be sent as:
  - Authorization header: `Bearer <token>`
  - Cookie: `token=<token>` (for web)

---

# AUTHENTICATION ENDPOINTS

## 1.1 User Registration
**POST** `/api/user/register` or `/api/user/signup`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "phoneNumber": "+65 9123 4567",
  "employmentStatus": "Singaporean/Permanent Resident",
  "role": "USER"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "USER"
  }
}
```

---

## 1.2 User Login
**POST** `/api/user/login`

**Request Body:**
```json
{
  "email": "admin@worklah.com",
  "password": "Aniket@7411"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@worklah.com",
    "fullName": "Admin",
    "role": "ADMIN",
    "status": "Verified",
    "profileCompleted": true
  }
}
```

---

## 1.3 Get Current User
**GET** `/api/user/me` or `/api/user/authenticated/auth`

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@worklah.com",
    "fullName": "Admin",
    "role": "ADMIN"
  }
}
```

---

## 1.4 User Logout
**POST** `/api/user/logout`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 1.5 Forgot Password
**POST** `/api/user/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent"
}
```

---

# EMPLOYER ENDPOINTS

## 2.1 Get All Employers
**GET** `/api/employers`

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 10)
- `search` (optional, string): Search by company name, email
- `industry` (optional, string): Filter by industry
- `serviceAgreement` (optional, string): Filter by service agreement status

**Success Response (200):**
```json
{
  "success": true,
  "employers": [
    {
      "employerId": "EMP-0001",
      "_id": "507f1f77bcf86cd799439011",
      "companyLogo": "https://...",
      "companyLegalName": "ABC Pte Ltd",
      "hqAddress": "123 Main St, Singapore",
      "mainContactPersons": [
        {
          "name": "John Doe",
          "position": "HR Manager",
          "number": "+65 9123 4567"
        }
      ],
      "emailAddress": "contact@abc.com",
      "industry": "F&B",
      "serviceAgreement": "Completed",
      "outlets": [
        {
          "_id": "outlet-1",
          "address": "456 Orchard Rd",
          "managerName": "Jane Smith",
          "managerContact": "+65 9876 5432"
        }
      ],
      "createdAt": "2024-01-15T10:00:00Z"
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

---

## 2.2 Get Single Employer
**GET** `/api/employers/:id`

**Success Response (200):**
```json
{
  "success": true,
  "employer": {
    // Full employer object with all fields
  }
}
```

---

## 2.3 Create Employer ⭐ CRITICAL UPDATE
**POST** `/api/employers/create`

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
- `companyLegalName` (string, optional)
- `hqAddress` (string, optional)
- `emailAddress` (string, optional) - **Used for credential generation**
- `mainContactNumber` (string, optional)
- `officeNumber` (string, optional)
- `industry` (string, optional): "F&B" | "Hotel" | "Retail" | "Logistics" | "Others"
- `serviceAgreement` (string, optional): "In Discussion" | "Completed" | "Expired"
- `contractExpiryDate` (string, optional, YYYY-MM-DD)
- `companyLogo` (file, optional)
- `acraBizfileCert` (file, optional)
- `serviceContract` (file, optional, PDF only)
- `contactPersons[0][name]` (string, optional)
- `contactPersons[0][position]` (string, optional)
- `contactPersons[0][number]` (string, optional)
- `outlets[0][address]` (string, optional)
- `outlets[0][managerName]` (string, optional)
- `outlets[0][managerContact]` (string, optional)
- **`generateCredentials`** (boolean, required): **NEW - If true, generates login credentials**

**⭐ NEW FEATURE: Credential Generation**

When `generateCredentials: true`:
1. Backend MUST generate a unique email (if not provided, use `employer-{employerId}@worklah.com`)
2. Backend MUST generate a secure random password (minimum 12 characters)
3. Backend MUST create a user account with role "EMPLOYER"
4. Backend MUST send credentials via email to `emailAddress` (if provided)
5. Backend MUST return credentials in response

**Success Response (201):**
```json
{
  "success": true,
  "message": "Employer created successfully",
  "employer": {
    "employerId": "EMP-0001",
    "_id": "507f1f77bcf86cd799439011",
    // ... all employer fields
  },
  "credentials": {
    "email": "contact@abc.com",
    "password": "SecureRandomPassword123!",
    "sentToEmail": true,
    "emailSent": true
  }
}
```

**If email sending fails:**
```json
{
  "success": true,
  "message": "Employer created successfully, but email could not be sent",
  "employer": { /* ... */ },
  "credentials": {
    "email": "contact@abc.com",
    "password": "SecureRandomPassword123!",
    "sentToEmail": false,
    "emailSent": false,
    "error": "SMTP server unavailable"
  }
}
```

**Backend Requirements:**
- Generate secure random password (use crypto library)
- Create user account in User collection with role "EMPLOYER"
- Link user account to employer record
- Send email with credentials (use email service like SendGrid, AWS SES, etc.)
- Store password hash (never return plain password in subsequent requests)
- If email sending fails, still return credentials so admin can share manually

---

## 2.4 Update Employer
**PUT** `/api/employers/:id`

**Request Body:** Same as create, all fields optional

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employer updated successfully",
  "employer": { /* updated employer object */ }
}
```

---

## 2.5 Delete Employer
**DELETE** `/api/employers/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employer deleted successfully"
}
```

---

# JOB POSTING ENDPOINTS

## 4.1 Get All Job Postings
**GET** `/api/jobs`

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 10)
- `employerId` (optional, string): Filter by employer
- `status` (optional, string): "Active" | "Filled" | "Cancelled" | "Expired"
- `date` (optional, string, YYYY-MM-DD): Filter by job date
- `search` (optional, string): Search in job title, description
- `postedBy` (optional, string): "admin" | "employer" - **NEW**
- `startDate` (optional, string, YYYY-MM-DD): Date range start
- `endDate` (optional, string, YYYY-MM-DD): Date range end
- `location` (optional, string): Filter by location/outlet
- `rateType` (optional, string): "Weekend" | "Weekday" | "Public Holiday"

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [
    {
      "jobId": "JOB-0001",
      "_id": "507f1f77bcf86cd799439011",
      "jobDate": "2025-05-15",
      "jobTitle": "Waiter Position",
      "jobDescription": "Looking for experienced waiters...",
      "jobRoles": "Waiter",
      "employer": {
        "id": "EMP-0001",
        "name": "ABC Pte Ltd",
        "companyLegalName": "ABC Pte Ltd"
      },
      "employerId": "EMP-0001",
      "employerName": "ABC Pte Ltd",
      "postedBy": "employer", // NEW: "admin" or "employer"
      "outlet": {
        "id": "outlet-1",
        "name": "Orchard Branch",
        "address": "456 Orchard Rd"
      },
      "outletId": "outlet-1",
      "outletAddress": "456 Orchard Rd",
      "shiftTiming": {
        "startTime": "08:00",
        "endTime": "13:00",
        "display": "8am to 1pm"
      },
      "shifts": [
        {
          "startTime": "08:00",
          "endTime": "13:00",
          "breakDuration": 0,
          "totalWorkingHours": 5,
          "rateType": "Weekend",
          "payPerHour": 15.0,
          "totalWages": 75.0
        }
      ],
      "totalPositions": 11,
      "currentFulfilment": {
        "filled": 4,
        "total": 11,
        "display": "4/11"
      },
      "rateType": "Weekend",
      "payPerHour": 15.0,
      "totalWages": 75.0,
      "foodHygieneCertRequired": false,
      "jobStatus": "Active",
      "locationDetails": "456 Orchard Rd, Singapore",
      "contactInfo": {
        "phone": "+65 9123 4567",
        "email": "contact@abc.com"
      },
      "createdAt": "2024-01-15T10:00:00Z"
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

---

## 4.2 Get Single Job Posting
**GET** `/api/jobs/:id`

**Success Response (200):**
```json
{
  "success": true,
  "job": {
    // Full job object
  }
}
```

---

## 4.3 Create Job Posting ⭐ CRITICAL UPDATE
**POST** `/api/jobs/create`

**Request Body:**
```json
{
  "jobDate": "2025-05-15",
  "jobTitle": "Waiter Position",
  "jobDescription": "Looking for experienced waiters...",
  "jobRoles": "Waiter",
  "employerId": "EMP-0001", // OPTIONAL - Can be null for admin posts
  "employerName": "ABC Pte Ltd", // OPTIONAL - For manual entry or admin posts
  "postedBy": "admin", // NEW: "admin" or "employer" - REQUIRED
  "outletId": "outlet-1", // OPTIONAL - Can be null
  "outletAddress": "456 Orchard Rd", // OPTIONAL - For manual entry
  "totalPositions": 11,
  "foodHygieneCertRequired": false,
  "jobStatus": "Active",
  "applicationDeadline": "2025-05-14T23:59:59Z", // Optional
  "jobRequirements": ["Experience preferred", "Food hygiene cert"],
  "locationDetails": "456 Orchard Rd, Singapore",
  "contactInfo": {
    "phone": "+65 9123 4567",
    "email": "contact@abc.com"
  },
  "shifts": [
    {
      "startTime": "08:00",
      "endTime": "13:00",
      "breakDuration": 0,
      "totalWorkingHours": 5,
      "rateType": "Weekend",
      "payPerHour": 15.0,
      "totalWages": 75.0
    }
  ]
}
```

**⭐ NEW FEATURE: Admin Job Posting**

**Key Changes:**
1. `employerId` is now **OPTIONAL** - can be `null` for admin posts
2. `employerName` can be "Admin/System" for admin posts
3. `postedBy` field is **REQUIRED** - must be "admin" or "employer"
4. `outletId` is **OPTIONAL** - can be `null` if `outletAddress` is provided
5. When `postedBy: "admin"`:
   - `employerId` can be `null`
   - `employerName` should be "Admin/System" or provided name
   - Job is associated with admin account, not employer

**Validation Rules:**
- If `postedBy: "employer"`, then `employerId` is required
- If `postedBy: "admin"`, then `employerId` can be null
- At least one of `outletId` or `outletAddress` must be provided
- `locationDetails` is required
- At least one shift is required

**Success Response (201):**
```json
{
  "success": true,
  "message": "Job posting created successfully",
  "job": {
    "jobId": "JOB-0001",
    // ... all fields
  }
}
```

---

## 4.4 Update Job Posting
**PUT** `/api/jobs/:id`

**Request Body:** Same as create, all fields optional

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job posting updated successfully",
  "job": { /* updated job object */ }
}
```

---

## 4.5 Delete Job Posting
**DELETE** `/api/jobs/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job posting deleted successfully"
}
```

---

# PAYMENT ENDPOINTS

## 5.1 Get All Payments
**GET** `/api/payments`

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 10)
- `status` (optional, string): "Pending" | "Approved" | "Rejected"
- `employeeId` (optional, string): Filter by employee
- `employerId` (optional, string): Filter by employer
- `jobId` (optional, string): Filter by job
- `dateFrom` (optional, string, YYYY-MM-DD): Start date
- `dateTo` (optional, string, YYYY-MM-DD): End date
- `rateType` (optional, string): Filter by rate type
- `minAmount` (optional, number): Minimum amount
- `maxAmount` (optional, number): Maximum amount

**Success Response (200):**
```json
{
  "success": true,
  "payments": [
    {
      "paymentId": "PAY-0001",
      "_id": "507f1f77bcf86cd799439011",
      "employee": {
        "id": "worker-001",
        "name": "John Doe",
        "nric": "S1234567A"
      },
      "job": {
        "id": "JOB-0001",
        "employer": "ABC Pte Ltd",
        "outletAddress": "456 Orchard Rd"
      },
      "shift": {
        "date": "2025-05-15",
        "day": "Monday",
        "timeIn": "08:00",
        "timeOut": "13:00",
        "breakTime": 0.5,
        "totalWorkHour": 4.5
      },
      "payment": {
        "rateType": "Weekend",
        "payRate": 15.0,
        "penaltyAmount": 0.0,
        "totalAmount": 67.5
      },
      "status": "Pending",
      "createdAt": "2024-01-15T10:00:00Z"
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

---

## 5.2 Update Payment Status
**PUT** `/api/payments/:id/status`

**Request Body:**
```json
{
  "status": "Approved",
  "rejectionReason": "string (required if status is Rejected)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "payment": { /* updated payment */ }
}
```

---

# WITHDRAWAL/TRANSACTION ENDPOINTS

## 6.1 Get All Transactions
**GET** `/api/withdrawals`

**Query Parameters:**
- `page` (optional, number)
- `limit` (optional, number)
- `transactionType` (optional, string): "Cash In" | "Cash Out"
- `employeeId` (optional, string)
- `status` (optional, string): "Pending" | "Processed" | "Failed"
- `dateFrom` (optional, string, YYYY-MM-DD)
- `dateTo` (optional, string, YYYY-MM-DD)
- `detailsType` (optional, string): "Job ID" | "Referral Fees" | "Bonus Payout" | "Penalty"

**Success Response (200):**
```json
{
  "success": true,
  "transactions": [
    {
      "transactionId": "TXN-0001",
      "_id": "507f1f77bcf86cd799439011",
      "employee": {
        "id": "worker-001",
        "name": "John Doe",
        "nric": "S1234567A"
      },
      "transactionType": "Cash In",
      "date": "2025-05-15",
      "details": {
        "type": "Job ID",
        "jobId": "JOB-0001",
        "description": "Job ID: JOB-0001"
      },
      "amount": {
        "value": 150.00,
        "display": "+$150.00"
      },
      "cashOutMethod": null,
      "status": "Processed",
      "createdAt": "2024-01-15T10:00:00Z"
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

---

# DASHBOARD ENDPOINTS

## 7.1 Get Dashboard Overview
**GET** `/api/dashboard/overview`

**Query Parameters:**
- `startDate` (optional, string, YYYY-MM-DD): Filter start date
- `endDate` (optional, string, YYYY-MM-DD): Filter end date
- `employerId` (optional, string): Filter by employer

**Success Response (200):**
```json
{
  "success": true,
  "totalJobs": 150,
  "activatedHeroes": 500,
  "vacancies": 200,
  "vacanciesFilled": 150,
  "pendingVerifications": 25,
  "pendingPayments": 30,
  "totalAmountPaid": 50000.00,
  "noShows": 10,
  "verifiedHeroes": 475,
  "revenue": {
    "total": 100000.00,
    "thisMonth": 25000.00,
    "lastMonth": 22000.00
  },
  "jobPostingChart": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "data": [10, 15, 20, 18, 25, 30]
  },
  "revenueChart": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "data": [5000, 6000, 7000, 6500, 8000, 9000]
  }
}
```

---

# EMPLOYEE/WORKER ENDPOINTS

## 3.1 Get All Employees/Workers
**GET** `/api/admin/candidates`

**Query Parameters:**
- `page` (optional, number)
- `limit` (optional, number)
- `filter` (optional, string): "activated" | "pending-verification" | "verified" | "no-show"
- `search` (optional, string)
- `status` (optional, string): Filter by status
- `workPassStatus` (optional, string): Filter by work pass status

**Success Response (200):**
```json
{
  "success": true,
  "candidates": [
    {
      "id": "worker-001",
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "mobile": "+65 9123 4567",
      "email": "john@example.com",
      "nric": "S1234567A",
      "dateOfBirth": "1990-05-15",
      "gender": "Male",
      "postalCode": "123456",
      "streetAddress": "123 Main St",
      "profilePicture": "https://...",
      "registrationType": "Singaporean/PR",
      "workPassStatus": "Verified",
      "status": "Active",
      "createdAt": "2024-01-15T10:00:00Z"
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

---

## 3.2 Verify Employee/Worker
**PUT** `/api/admin/verify-candidate/:id`

**Request Body:**
```json
{
  "action": "approve",
  "rejectionReason": "string (required if action is reject)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Candidate verified successfully",
  "candidate": { /* updated candidate */ }
}
```

---

# ERROR RESPONSES

All endpoints return consistent error responses:

**Format:**
```json
{
  "success": false,
  "message": "Error message description",
  "statusCode": 400
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (invalid/missing token, invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

# PAGINATION

All list endpoints support pagination:

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)

**Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

# CRITICAL BACKEND REQUIREMENTS

## 1. Employer Credential Generation ⭐

**When creating an employer with `generateCredentials: true`:**

1. **Generate Email:**
   - If `emailAddress` is provided, use it
   - If not, generate: `employer-{employerId}@worklah.com`

2. **Generate Password:**
   - Use secure random password generator
   - Minimum 12 characters
   - Include uppercase, lowercase, numbers, special characters
   - Example: `SecurePass123!@#`

3. **Create User Account:**
   - Create entry in User collection
   - Role: "EMPLOYER"
   - Email: Generated/provided email
   - Password: Hashed password (use bcrypt)
   - Link to employer: `employerId` field in User document

4. **Send Email:**
   - Use email service (SendGrid, AWS SES, etc.)
   - Subject: "Your WorkLah Employer Account Credentials"
   - Body: Include email and password
   - If email fails, still return credentials in response

5. **Response:**
   - Always return credentials in response (even if email fails)
   - Include `sentToEmail` and `emailSent` flags

## 2. Admin Job Posting ⭐

**Key Requirements:**

1. **`postedBy` Field:**
   - Required field in job creation
   - Values: "admin" or "employer"
   - Default: "employer" if not provided

2. **When `postedBy: "admin"`:**
   - `employerId` can be `null`
   - `employerName` can be "Admin/System" or custom name
   - Job is linked to admin user account
   - Job appears in all job listings
   - Employers can still see these jobs

3. **Validation:**
   - If `postedBy: "employer"`, `employerId` is required
   - If `postedBy: "admin"`, `employerId` is optional
   - At least one of `outletId` or `outletAddress` required
   - `locationDetails` is always required

## 3. Dynamic Filters ⭐

**All list endpoints must support:**

1. **Date Range Filtering:**
   - `startDate` and `endDate` query parameters
   - Format: YYYY-MM-DD
   - Apply to relevant date fields (createdAt, jobDate, shiftDate, etc.)

2. **Status Filtering:**
   - Multiple status values supported
   - Use comma-separated or array format
   - Example: `?status=Active,Pending`

3. **Search Functionality:**
   - `search` query parameter
   - Search across relevant text fields
   - Case-insensitive
   - Partial matching

4. **Combined Filters:**
   - All filters can be combined
   - Use AND logic (all conditions must match)
   - Example: `?status=Active&startDate=2024-01-01&search=waiter`

## 4. Payment System ⭐

**Requirements:**

1. **Auto-calculation:**
   - Total Work Hour = (Time Out - Time In) - Break Time
   - Total Amount = (Pay Rate × Total Work Hour) - Penalty Amount

2. **Status Management:**
   - Pending → Approved: Trigger Cash In transaction
   - Pending → Rejected: Allow regeneration with revised details

3. **Activity Logging:**
   - Log all status changes
   - Log manual adjustments
   - Include: action, previousValue, newValue, userAccount, timestamp

## 5. Dashboard Filters ⭐

**Requirements:**

1. **Date Range Filtering:**
   - `startDate` and `endDate` parameters
   - Filter all statistics by date range
   - Update charts based on date range

2. **Employer Filtering:**
   - `employerId` parameter
   - Filter statistics by specific employer
   - Show employer-specific metrics

---

# DATA VALIDATION

## Common Validations

- All IDs must be valid MongoDB ObjectIds
- Dates must be in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
- Phone numbers: String format
- Amounts: Positive numbers
- Email: Valid email format
- Password: Minimum 6 characters (for user registration)

## Job Posting Validations

- `jobDate`: Required, valid date
- `jobTitle`: Required, non-empty string
- `jobDescription`: Required, non-empty string
- `jobRoles`: Required, non-empty string
- `postedBy`: Required, must be "admin" or "employer"
- `totalPositions`: Required, positive integer
- `locationDetails`: Required, non-empty string
- At least one shift required
- Shift times: Valid time format (HH:mm)
- Break duration: Non-negative number
- Pay per hour: Positive number

## Employer Validations

- `emailAddress`: Valid email format (if provided)
- `contractExpiryDate`: Valid date format (YYYY-MM-DD) if provided
- `industry`: Must be one of: "F&B", "Hotel", "Retail", "Logistics", "Others"
- `serviceAgreement`: Must be one of: "In Discussion", "Completed", "Expired"
- `serviceContract`: PDF file only (if provided)

---

# EMAIL TEMPLATES

## Employer Credentials Email

**Subject:** Your WorkLah Employer Account Credentials

**Body:**
```
Dear Employer,

Your employer account has been created successfully.

Login Credentials:
Email: {email}
Password: {password}

Please log in at: https://worklah.com/employer/login

Important: Please change your password after first login.

If you have any questions, please contact support.

Best regards,
WorkLah Team
```

---

# ADMIN CREDENTIALS

**Default Admin Account:**
- Email: `admin@worklah.com`
- Password: `Aniket@7411`

**Note:** Run `node scripts/createAdmin.js` to create/update admin user.

---

# TESTING CHECKLIST

## Employer Creation
- [ ] Create employer without credentials
- [ ] Create employer with credentials (email provided)
- [ ] Create employer with credentials (no email, auto-generate)
- [ ] Verify email is sent
- [ ] Verify credentials are returned in response
- [ ] Verify user account is created
- [ ] Verify employer can login with credentials

## Job Posting
- [ ] Admin posts job without employer
- [ ] Admin posts job with employer
- [ ] Employer posts job
- [ ] Verify `postedBy` field is set correctly
- [ ] Verify jobs appear in listings
- [ ] Verify filters work with admin-posted jobs

## Filters
- [ ] Date range filtering works
- [ ] Status filtering works
- [ ] Search functionality works
- [ ] Combined filters work
- [ ] Pagination works with filters

## Payments
- [ ] Payment calculations are correct
- [ ] Status changes trigger appropriate actions
- [ ] Activity logging works
- [ ] Filters work correctly

## Dashboard
- [ ] Date range filtering works
- [ ] Employer filtering works
- [ ] Statistics are accurate
- [ ] Charts update based on filters

---

**Last Updated:** December 2024  
**Version:** 3.0.0  
**Backend:** Node.js + Express + MongoDB  
**Frontend:** React Vite (Web) + Flutter (Mobile)

---

## Summary of Critical Changes

1. ✅ **Employer Credential Generation** - Backend must generate and send credentials
2. ✅ **Admin Job Posting** - Admin can post jobs without employer
3. ✅ **Dynamic Filters** - All endpoints support comprehensive filtering
4. ✅ **Payment System** - Auto-calculations and activity logging
5. ✅ **Dashboard Filters** - Date range and employer filtering

**This specification is FINAL and ready for backend implementation.**

