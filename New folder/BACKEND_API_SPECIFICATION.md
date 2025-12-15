# WorkLah Backend API Specification

Complete API documentation for WorkLah Admin Panel, Mobile App (Flutter), and Web App (React Vite).

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
  "employmentStatus": "Singaporean/Permanent Resident"
}
```

**Required Fields:**
- `fullName` (string): User's full name
- `email` (string): Valid email address
- `password` (string): Minimum 6 characters

**Optional Fields:**
- `phoneNumber` (string): Phone number
- `employmentStatus` (string): Employment status
- `role` (string): "USER" or "ADMIN" (default: "USER")

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

**Error Responses:**
- `400`: Missing required fields, invalid email format, user already exists
- `500`: Internal server error

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

**Required Fields:**
- `email` (string): User's email address
- `password` (string): User's password

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

**Error Responses:**
- `400`: Email or password missing
- `401`: Invalid email or password
- `500`: Internal server error

---

## 1.3 Get Current User
**GET** `/api/user/me` or `/api/user/authenticated/auth`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
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

**Error Responses:**
- `401`: Unauthorized (no token or invalid token)
- `404`: User not found
- `500`: Internal server error

---

## 1.4 User Logout
**POST** `/api/user/logout`

**Headers:**
```
Authorization: Bearer <token>
```

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

**Note:** Always returns success for security (doesn't reveal if email exists)

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

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "employers": [
    {
      "employerId": "EMP-0001",
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

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "employer": {
    // Full employer object
  }
}
```

---

## 2.3 Create Employer
**POST** `/api/employers/create`

**Content-Type:** `multipart/form-data` or `application/json`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (JSON):**
```json
{
  "companyLegalName": "ABC Pte Ltd",
  "hqAddress": "123 Main St, Singapore",
  "emailAddress": "contact@abc.com",
  "industry": "F&B",
  "serviceAgreement": "Completed"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Employer created successfully",
  "employer": {
    "employerId": "EMP-0001",
    // ... all fields
  }
}
```

---

## 2.4 Update Employer
**PUT** `/api/employers/:id`

**Headers:**
```
Authorization: Bearer <token>
```

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

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employer deleted successfully"
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

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "candidates": [
    {
      "id": "worker-001",
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

## 3.2 Get Single Employee/Worker
**GET** `/api/admin/candidates/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "candidate": {
    // Full candidate object
  }
}
```

---

## 3.3 Update Employee/Worker
**PUT** `/api/admin/candidates/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** All fields optional

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "candidate": { /* updated employee object */ }
}
```

---

## 3.4 Verify Employee/Worker
**PUT** `/api/admin/verify-candidate/:id`

**Headers:**
```
Authorization: Bearer <token>
```

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

# JOB POSTING ENDPOINTS

## 4.1 Get All Job Postings
**GET** `/api/jobs`

**Query Parameters:**
- `page` (optional, number)
- `limit` (optional, number)
- `employerId` (optional, string)
- `status` (optional, string): "Active" | "Filled" | "Cancelled" | "Expired"
- `date` (optional, string, YYYY-MM-DD)
- `search` (optional, string)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [
    {
      "jobId": "JOB-0001",
      "jobDate": "2025-05-15",
      "jobTitle": "Waiter Position",
      "jobDescription": "Looking for experienced waiters...",
      "employer": {
        "id": "EMP-0001",
        "name": "ABC Pte Ltd"
      },
      "outlet": {
        "id": "outlet-1",
        "name": "Orchard Branch",
        "address": "456 Orchard Rd"
      },
      "shiftTiming": {
        "startTime": "08:00",
        "endTime": "13:00",
        "display": "8am to 1pm"
      },
      "totalPositions": 11,
      "currentFulfilment": {
        "filled": 4,
        "total": 11,
        "display": "4/11"
      },
      "rateType": "Weekend",
      "payPerHour": 15.0,
      "totalWages": 75.0,
      "jobStatus": "Active",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": { /* pagination object */ }
}
```

---

## 4.2 Get Single Job Posting
**GET** `/api/jobs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

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

## 4.3 Create Job Posting
**POST** `/api/jobs/create`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "jobDate": "2025-05-15",
  "jobTitle": "Waiter Position",
  "jobDescription": "Looking for experienced waiters...",
  "employerId": "EMP-0001",
  "outletId": "outlet-1",
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
  "jobStatus": "Active"
}
```

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

**Headers:**
```
Authorization: Bearer <token>
```

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

**Headers:**
```
Authorization: Bearer <token>
```

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
- `page` (optional, number)
- `limit` (optional, number)
- `status` (optional, string): "Pending" | "Approved" | "Rejected"
- `employeeId` (optional, string)
- `employerId` (optional, string)
- `jobId` (optional, string)
- `dateFrom` (optional, string, YYYY-MM-DD)
- `dateTo` (optional, string, YYYY-MM-DD)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "payments": [
    {
      "paymentId": "PAY-0001",
      "employee": {
        "id": "worker-001",
        "name": "John Doe"
      },
      "job": {
        "id": "JOB-0001",
        "employer": "ABC Pte Ltd"
      },
      "shift": {
        "date": "2025-05-15",
        "timeIn": "08:00",
        "timeOut": "13:00",
        "totalWorkHour": 5
      },
      "payment": {
        "rateType": "Weekend",
        "payRate": 15.0,
        "penaltyAmount": 0.0,
        "totalAmount": 75.0
      },
      "status": "Pending",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": { /* pagination object */ }
}
```

---

## 5.2 Get Single Payment
**GET** `/api/payments/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "payment": {
    // Full payment object
  }
}
```

---

## 5.3 Update Payment Status
**PUT** `/api/payments/:id/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "Approved",
  "rejectionReason": "string (required if rejected)"
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

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "transactions": [
    {
      "transactionId": "TXN-0001",
      "employee": {
        "id": "worker-001",
        "name": "John Doe"
      },
      "transactionType": "Cash In",
      "date": "2025-05-15",
      "amount": {
        "value": 150.00,
        "display": "+$150.00"
      },
      "status": "Processed",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": { /* pagination object */ }
}
```

---

## 6.2 Create Transaction
**POST** `/api/withdrawals/create`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "employeeId": "worker-001",
  "transactionType": "Cash In",
  "date": "2025-05-15",
  "amount": 150.00,
  "details": {
    "type": "Job ID",
    "jobId": "JOB-0001"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "transaction": {
    "transactionId": "TXN-0001",
    // ... all fields
  }
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

**Example Error Responses:**

**400 - Bad Request:**
```json
{
  "success": false,
  "message": "Email and password are required",
  "statusCode": 400
}
```

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "statusCode": 401
}
```

**404 - Not Found:**
```json
{
  "success": false,
  "message": "User not found",
  "statusCode": 404
}
```

**500 - Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details (development only)",
  "statusCode": 500
}
```

---

# DATA VALIDATION

## User Registration/Login
- `email`: Must be valid email format
- `password`: Minimum 6 characters
- `fullName`: Required, non-empty string

## Common Validations
- All IDs must be valid MongoDB ObjectIds
- Dates must be in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
- Phone numbers: String format
- Amounts: Positive numbers

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

# NOTES FOR FRONTEND DEVELOPERS

## React Vite (Web Admin Panel)
1. Store JWT token in localStorage or httpOnly cookie
2. Include token in Authorization header: `Authorization: Bearer ${token}`
3. Handle 401 responses by redirecting to login
4. Use axios or fetch with interceptors for automatic token injection

## Flutter (Mobile App)
1. Store JWT token securely using `flutter_secure_storage`
2. Include token in Authorization header for all API calls
3. Handle token expiration and refresh logic
4. Implement proper error handling for network requests

## General
- All timestamps are in ISO 8601 format
- All amounts are in SGD (Singapore Dollars)
- Image URLs are full URLs (not relative paths)
- Always check `success` field in response before processing data
- Handle loading states and error states appropriately

---

# ADMIN CREDENTIALS

**Default Admin Account:**
- Email: `admin@worklah.com`
- Password: `Aniket@7411`

**Note:** Run `node scripts/createAdmin.js` to create/update admin user.

---

**Last Updated:** 2024
**Version:** 2.0.0
**Backend:** Node.js + Express + MongoDB
**Frontend:** React Vite (Web) + Flutter (Mobile)
