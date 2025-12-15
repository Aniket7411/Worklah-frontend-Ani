# Backend Update Requirements

**Date:** December 2024  
**Project:** WorkLah Admin Panel  
**Frontend Status:** ✅ Updated and Ready

---

## Overview

The frontend has been fully updated to match the API specification. This document outlines the critical requirements and changes needed from the backend to ensure seamless integration.

---

## 🔴 CRITICAL REQUIREMENTS

### 1. Response Structure - **MANDATORY**

**ALL API endpoints MUST return responses in the following format:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**For errors:**
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

**⚠️ IMPORTANT:** The frontend checks the `success` field on EVERY response. If `success: false`, the frontend will show an error toast and reject the response.

---

### 2. Authentication Endpoints

#### 2.1 Login - `POST /api/user/login`
**Current Status:** ✅ Frontend Updated

**Required Response:**
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

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "statusCode": 401
}
```

#### 2.2 Get Current User - `GET /api/user/me`
**Current Status:** ✅ Frontend Updated (changed from `/user/authenticated/auth`)

**Required Response:**
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

#### 2.3 Register - `POST /api/user/register`
**Current Status:** ✅ Frontend Updated (changed from `/user/signup`)

**Required Response:**
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

### 3. Job Management Endpoints

#### 3.1 Get All Jobs - `GET /api/jobs`
**Current Status:** ✅ Frontend Updated (changed from `/admin/jobs`)

**Required Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 10)
- `employerId` (optional, string)
- `status` (optional, string): "Active" | "Filled" | "Cancelled" | "Expired"
- `date` (optional, string, YYYY-MM-DD)
- `search` (optional, string)

**Required Response:**
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

**⚠️ CRITICAL:** The `pagination` object structure is mandatory. Frontend expects:
- `currentPage`
- `totalPages`
- `totalItems`
- `itemsPerPage`
- `hasNextPage` (optional)
- `hasPrevPage` (optional)

#### 3.2 Get Single Job - `GET /api/jobs/:id`
**Current Status:** ✅ Frontend Updated (changed from `/admin/jobs/:id`)

**Required Response:**
```json
{
  "success": true,
  "job": {
    // Full job object
  }
}
```

#### 3.3 Create Job - `POST /api/jobs/create`
**Current Status:** ✅ Frontend Updated

**Required Response:**
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

#### 3.4 Update Job - `PUT /api/jobs/:id`
**Current Status:** ✅ Frontend Updated

**Required Response:**
```json
{
  "success": true,
  "message": "Job posting updated successfully",
  "job": { /* updated job object */ }
}
```

#### 3.5 Delete Job - `DELETE /api/jobs/:id`
**Current Status:** ✅ Frontend Updated (changed from `/admin/jobs/:id`)

**Required Response:**
```json
{
  "success": true,
  "message": "Job posting deleted successfully"
}
```

#### 3.6 Cancel Job - `PUT /api/jobs/:id`
**Current Status:** ✅ Frontend Updated

**Note:** Frontend sends `{ status: "Cancelled" }` in request body. Backend should handle this.

---

### 4. Employer Endpoints

#### 4.1 Get All Employers - `GET /api/employers`
**Current Status:** ✅ Frontend Updated

**Required Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 10)
- `search` (optional, string): Search by company name, email
- `industry` (optional, string): Filter by industry
- `serviceAgreement` (optional, string): Filter by service agreement status

**Required Response:**
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

**⚠️ CRITICAL:** Must include `pagination` object in response.

#### 4.2 Get Single Employer - `GET /api/employers/:id`
**Current Status:** ✅ Frontend Updated

**Required Response:**
```json
{
  "success": true,
  "employer": {
    // Full employer object
  }
}
```

#### 4.3 Create Employer - `POST /api/employers/create`
**Current Status:** ✅ Frontend Updated

**Content-Type:** `multipart/form-data` (for file uploads)

**Required Response:**
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

#### 4.4 Update Employer - `PUT /api/employers/:id`
**Current Status:** ✅ Frontend Updated

**Content-Type:** `multipart/form-data` (for file uploads)

**Required Response:**
```json
{
  "success": true,
  "message": "Employer updated successfully",
  "employer": { /* updated employer object */ }
}
```

#### 4.5 Delete Employer - `DELETE /api/employers/:id`
**Current Status:** ✅ Frontend Updated

**Required Response:**
```json
{
  "success": true,
  "message": "Employer deleted successfully"
}
```

---

### 5. Employee/Worker Endpoints

#### 5.1 Get All Employees - `GET /api/admin/candidates`
**Current Status:** ✅ Frontend Updated

**Required Query Parameters:**
- `page` (optional, number)
- `limit` (optional, number)
- `filter` (optional, string): "activated" | "pending-verification" | "verified" | "no-show"
- `search` (optional, string)

**Required Response:**
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

#### 5.2 Get Single Employee - `GET /api/admin/candidates/:id`
**Current Status:** ✅ Frontend Updated

**Required Response:**
```json
{
  "success": true,
  "candidate": {
    // Full candidate object
  }
}
```

#### 5.3 Update Employee - `PUT /api/admin/candidates/:id`
**Current Status:** ✅ Frontend Updated

**Content-Type:** `multipart/form-data` (for file uploads)

**Required Response:**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "candidate": { /* updated employee object */ }
}
```

#### 5.4 Verify Employee - `PUT /api/admin/verify-candidate/:id`
**Current Status:** ✅ Frontend Updated

**Request Body:**
```json
{
  "action": "approve",
  "rejectionReason": "string (required if action is reject)"
}
```

**Required Response:**
```json
{
  "success": true,
  "message": "Candidate verified successfully",
  "candidate": { /* updated candidate */ }
}
```

---

### 6. Payment Endpoints

#### 6.1 Get All Payments - `GET /api/payments`
**Current Status:** ✅ Frontend Updated

**Required Query Parameters:**
- `page` (optional, number)
- `limit` (optional, number)
- `status` (optional, string): "Pending" | "Approved" | "Rejected"
- `employeeId` (optional, string)
- `employerId` (optional, string)
- `jobId` (optional, string)
- `dateFrom` (optional, string, YYYY-MM-DD)
- `dateTo` (optional, string, YYYY-MM-DD)

**Required Response:**
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

#### 6.2 Update Payment Status - `PUT /api/payments/:id/status`
**Current Status:** ✅ Frontend Updated

**Request Body:**
```json
{
  "status": "Approved",
  "rejectionReason": "string (required if rejected)"
}
```

**Required Response:**
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "payment": { /* updated payment */ }
}
```

---

### 7. Withdrawal/Transaction Endpoints

#### 7.1 Get All Transactions - `GET /api/withdrawals`
**Current Status:** ✅ Frontend Updated

**Required Query Parameters:**
- `page` (optional, number)
- `limit` (optional, number)
- `transactionType` (optional, string): "Cash In" | "Cash Out"
- `employeeId` (optional, string)
- `status` (optional, string): "Pending" | "Processed" | "Failed"
- `dateFrom` (optional, string, YYYY-MM-DD)
- `dateTo` (optional, string, YYYY-MM-DD)

**Required Response:**
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

#### 7.2 Create Transaction - `POST /api/withdrawals/create`
**Current Status:** ✅ Frontend Updated

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

**Required Response:**
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

## 🟡 IMPORTANT NOTES

### Error Handling

**All error responses MUST follow this format:**
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

### Pagination

**ALL list endpoints MUST return pagination in this format:**
```json
{
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

### Authentication

**JWT Token Requirements:**
- Token must be sent in Authorization header: `Bearer <token>`
- Token expires in 7 days
- Token contains: `_id`, `role`, `email`
- On 401 errors, frontend automatically redirects to login

### File Uploads

**Endpoints that accept file uploads:**
- `POST /api/employers/create` - `multipart/form-data`
- `PUT /api/employers/:id` - `multipart/form-data`
- `PUT /api/admin/candidates/:id` - `multipart/form-data`

---

## 🟢 TESTING CHECKLIST

Please verify the following endpoints work correctly:

### Authentication
- [ ] `POST /api/user/login` - Returns success, token, and user object
- [ ] `GET /api/user/me` - Returns success and user object
- [ ] `POST /api/user/register` - Returns success and user object
- [ ] `POST /api/user/logout` - Returns success message
- [ ] `POST /api/user/forgot-password` - Returns success message

### Jobs
- [ ] `GET /api/jobs` - Returns success, jobs array, and pagination
- [ ] `GET /api/jobs/:id` - Returns success and job object
- [ ] `POST /api/jobs/create` - Returns success and job object
- [ ] `PUT /api/jobs/:id` - Returns success and updated job object
- [ ] `DELETE /api/jobs/:id` - Returns success message

### Employers
- [ ] `GET /api/employers` - Returns success, employers array, and pagination
- [ ] `GET /api/employers/:id` - Returns success and employer object
- [ ] `POST /api/employers/create` - Returns success and employer object (with file upload)
- [ ] `PUT /api/employers/:id` - Returns success and updated employer object (with file upload)
- [ ] `DELETE /api/employers/:id` - Returns success message

### Candidates/Workers
- [ ] `GET /api/admin/candidates` - Returns success, candidates array, and pagination
- [ ] `GET /api/admin/candidates/:id` - Returns success and candidate object
- [ ] `PUT /api/admin/candidates/:id` - Returns success and updated candidate object (with file upload)
- [ ] `PUT /api/admin/verify-candidate/:id` - Returns success and updated candidate object

### Payments
- [ ] `GET /api/payments` - Returns success, payments array, and pagination
- [ ] `GET /api/payments/:id` - Returns success and payment object
- [ ] `PUT /api/payments/:id/status` - Returns success and updated payment object

### Withdrawals
- [ ] `GET /api/withdrawals` - Returns success, transactions array, and pagination
- [ ] `POST /api/withdrawals/create` - Returns success and transaction object

---

## 🔧 ENVIRONMENT CONFIGURATION

**Frontend API Base URL:**
- Development: `http://localhost:3000/api`
- Production: `https://worklah-updated-dec.onrender.com/api`

**Environment Variable Support:**
Frontend supports `VITE_API_BASE_URL` environment variable for custom API URLs.

---

## 📝 ADDITIONAL NOTES

1. **Response Consistency:** Every endpoint MUST return `success: true/false` field
2. **Error Messages:** Provide clear, user-friendly error messages
3. **Pagination:** Always include pagination object for list endpoints
4. **File Uploads:** Support `multipart/form-data` for file uploads
5. **CORS:** Ensure CORS is properly configured for frontend domain
6. **Token Expiration:** Handle token expiration gracefully (return 401)

---

## 🚀 DEPLOYMENT READINESS

**Before deployment, ensure:**
- [ ] All endpoints return `success` field
- [ ] All list endpoints return `pagination` object
- [ ] Error responses follow the standard format
- [ ] File uploads work correctly
- [ ] Authentication tokens are properly validated
- [ ] CORS is configured correctly
- [ ] All endpoints are tested and working

---

## 📞 CONTACT

If you have any questions or need clarification on any requirements, please refer to the `BACKEND_API_SPECIFICATION.md` file for complete API documentation.

**Last Updated:** December 2024  
**Frontend Version:** 2.0.0  
**Status:** ✅ Ready for Integration

