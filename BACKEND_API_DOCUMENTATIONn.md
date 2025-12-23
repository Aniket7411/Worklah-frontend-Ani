# WorkLah Admin Panel - Complete Backend API Documentation

**Document Version:** 1.0.0  
**Last Updated:** January 2025  
**Purpose:** Complete API specification for backend implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Base Configuration](#base-configuration)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Response Format](#api-response-format)
5. [Error Handling](#error-handling)
6. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Dashboard](#dashboard-endpoints)
   - [Employers](#employers-endpoints)
   - [Jobs](#jobs-endpoints)
   - [Candidates/Hustle Heroes](#candidates-endpoints)
   - [Job Applications](#job-applications-endpoints)
   - [Payments](#payments-endpoints)
   - [Withdrawals](#withdrawals-endpoints)
   - [Configuration & Settings](#configuration-endpoints)
   - [Reports](#reports-endpoints)
   - [Support & Feedback](#support-endpoints)
   - [QR Code Management](#qr-code-endpoints)
7. [Data Formats & Types](#data-formats--types)
8. [File Uploads](#file-uploads)
9. [Pagination](#pagination)
10. [Filtering & Sorting](#filtering--sorting)
11. [Important Notes](#important-notes)
12. [Testing Checklist](#testing-checklist)

---

## Overview

This document provides **complete specifications** for all API endpoints used by the WorkLah Admin Panel frontend. The backend must implement these endpoints exactly as specified to ensure proper integration.

### Key Requirements

- **All endpoints** must return responses with a `success` field (boolean)
- **All endpoints** require authentication except login and forgot password
- **Error responses** must include `success: false`, `message`, and optionally `error` field
- **File uploads** use `multipart/form-data`
- **JSON requests** use `application/json`
- **Pagination** is required for list endpoints
- **Date formats**: `YYYY-MM-DD` for dates, `YYYY-MM-DDTHH:mm:ssZ` for datetime

---

## Base Configuration

### Base URL
```
Development: http://localhost:3000/api
Production: https://worklah-updated-dec.onrender.com/api
```

### Request Headers

**For JSON requests:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**For File Uploads:**
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

### Authentication Token

- Token is sent via `Authorization: Bearer {token}` header
- Token is stored in cookie named `authToken` (7-day expiration)
- Token must be validated on all protected endpoints
- Invalid/expired tokens should return `401 Unauthorized`

---

## Authentication & Authorization

### User Roles

- **ADMIN**: Full access to all features
- **USER**: Limited access (if applicable)
- **EMPLOYER**: Employer-specific access (if applicable)

### Protected Endpoints

All endpoints except the following require authentication:
- `POST /user/login`
- `POST /user/register`
- `POST /user/forgot-password`

### Admin-Only Endpoints

The following endpoints require ADMIN role:
- `POST /employers/create`
- `POST /jobs/create`
- `DELETE /employers/:id`
- `DELETE /jobs/:jobId`
- `DELETE /admin/candidates/:id`

---

## API Response Format

### Success Response

All successful responses must follow this format:

```json
{
  "success": true,
  "message": "Operation successful" (optional),
  "data": { ... } (optional),
  // ... other response fields
}
```

### Error Response

All error responses must follow this format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "ErrorType" (optional, e.g., "ValidationError", "ForbiddenError")
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created (for POST requests that create resources)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Error Handling

### Frontend Error Handling

The frontend checks for `success: false` in all responses. If found, it:
1. Shows error toast notification (except for auth endpoints)
2. Throws error for try-catch handling
3. Handles specific status codes:
   - `401`: Removes token, redirects to login
   - `403`: Shows permission error
   - `404`: Shows not found error
   - `500+`: Shows server error message

### Required Error Fields

All error responses must include:
- `success: false` (required)
- `message: string` (required) - User-friendly error message
- `error: string` (optional) - Error type for debugging

---

## API Endpoints

---

## Authentication Endpoints

### 1. Login

**Endpoint:** `POST /user/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "role": "ADMIN",
    "fullName": "Admin User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400/401):**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "AuthenticationError"
}
```

**Notes:**
- Token must be JWT format
- Token expires in 7 days
- Frontend stores token in cookie named `authToken`

---

### 2. Get Current User

**Endpoint:** `GET /user/me`

**Headers:** `Authorization: Bearer {token}`

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "role": "ADMIN",
    "fullName": "Admin User"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "AuthenticationError"
}
```

---

### 3. Logout

**Endpoint:** `POST /user/logout`

**Headers:** `Authorization: Bearer {token}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 4. Forgot Password

**Endpoint:** `POST /user/forgot-password`

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
  "message": "Password reset email sent"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email not found",
  "error": "ValidationError"
}
```

---

## Dashboard Endpoints

### 5. Get Dashboard Overview

**Endpoint:** `GET /dashboard/overview`

**Query Parameters:**
- `startDate` (optional): `YYYY-MM-DD` - Filter start date
- `endDate` (optional): `YYYY-MM-DD` - Filter end date
- `employerId` (optional): Filter by employer (ADMIN only)

**Success Response (200):**
```json
{
  "success": true,
  "totalJobs": 150,
  "activatedHeroes": 500,
  "vacancies": 200,
  "vacanciesFilled": 150,
  "pendingVerifications": 25,
  "pendingPayments": 10,
  "totalAmountPaid": 50000,
  "noShows": 5,
  "verifiedHeroes": 475,
  "revenue": {
    "total": 100000,
    "thisMonth": 25000,
    "lastMonth": 20000
  }
}
```

---

### 6. Get Dashboard Revenue Chart

**Endpoint:** `GET /dashboard/revenue`

**Success Response (200):**
```json
{
  "success": true,
  "revenueChart": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "data": [10000, 15000, 12000, 18000, 20000, 25000]
  },
  "totalRevenue": 100000
}
```

---

### 7. Get Dashboard Job Posts Chart

**Endpoint:** `GET /dashboard/job-posts`

**Success Response (200):**
```json
{
  "success": true,
  "jobPostsChart": {
    "labels": ["Jan", "Feb", "Mar"],
    "data": [50, 75, 60]
  }
}
```

---

### 8. Get New Applications

**Endpoint:** `GET /admin/candidates?limit=4&sort=-createdAt`

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `sort` (optional): Sort order (e.g., "-createdAt" for newest first)

**Success Response (200):**
```json
{
  "success": true,
  "candidates": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "mobile": "1234567890",
      "profilePicture": "/uploads/profile.jpg",
      "createdAt": "2024-12-22T10:00:00Z"
    }
  ]
}
```

---

## Employers Endpoints

### 9. Get Employers List

**Endpoint:** `GET /employers?page=1&limit=10`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in company name, email, or contact person name
- `industry` (optional): Filter by industry
- `serviceAgreement` (optional): Filter by service agreement status

**Success Response (200):**
```json
{
  "success": true,
  "employers": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "employerId": "EMP-e3d7",
      "companyLegalName": "Company Name",
      "companyLogo": "uploads/logo.png",
      "hqAddress": "123 Main Street",
      "mainContactNumber": "1234567890",
      "alternateContactNumber": "0987654321",
      "emailAddress": "company@example.com",
      "officeNumber": "123456",
      "industry": "Hospitality",
      "accountManager": "N/A",
      "mainContactPersons": [
        {
          "name": "Contact Name",
          "position": "Manager",
          "number": "1234567890"
        }
      ],
      "outlets": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "id": "507f1f77bcf86cd799439012",
          "name": "Outlet Name",
          "address": "Outlet Address",
          "managerName": "Manager Name",
          "managerContact": "Manager Contact"
        }
      ],
      "contractStartDate": "2024-01-01",
      "contractExpiryDate": "2025-12-31",
      "serviceAgreement": "Completed",
      "createdAt": "2024-12-22T09:22:36.455Z",
      "updatedAt": "2024-12-22T09:22:36.455Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10
  }
}
```

**Important Notes:**
- `employerId` field is required (format: "EMP-xxxx" or MongoDB `_id`)
- `mainContactPersons` is an **array** (not a single object)
- `emailAddress` field name (not `companyEmail`)
- `officeNumber` field name (not `companyNumber`)
- `contractExpiryDate` field name (not `contractEndDate`)
- `companyLogo` path may contain backslashes - frontend normalizes to forward slashes

---

### 10. Get Single Employer

**Endpoint:** `GET /employers/:id`

**ID Format Support:**
- MongoDB ObjectId: `507f1f77bcf86cd799439011`
- Employer ID: `EMP-e3d7`, `EMP-0001`, `EMP-1234`

**Success Response (200):**
```json
{
  "success": true,
  "employer": {
    "_id": "507f1f77bcf86cd799439011",
    "employerId": "EMP-e3d7",
    "companyLegalName": "Company Name",
    "industry": "Hospitality",
    "hqAddress": "123 Main Street",
    "mainContactNumber": "1234567890",
    "alternateContactNumber": "0987654321",
    "emailAddress": "company@example.com",
    "outlets": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "id": "507f1f77bcf86cd799439012",
        "name": "Outlet Name",
        "address": "Outlet Address",
        "managerName": "Manager Name",
        "managerContact": "Manager Contact"
      }
    ],
    "jobs": []
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Employer not found"
}
```

---

### 11. Create Employer (Admin Only)

**Endpoint:** `POST /employers/create`

**Authorization:** ADMIN role required

**Content-Type:** `multipart/form-data`

**Request Fields:**

**Required:**
- `companyLegalName` (string): Company legal name
- `industry` (string): One of: `["Hospitality", "IT", "F&B", "Hotel", "Retail", "Logistics", "Healthcare", "Education", "Construction", "Others"]`
- `hqAddress` (string): Headquarters address
- `mainContactNumber` (string): Main contact number
- `alternateContactNumber` (string): Alternate contact number
- `emailAddress` (string): Valid email address
- `outlets[0][name]` (string): **REQUIRED** - Outlet name (cannot be empty or whitespace)
- `outlets[0][address]` (string): **REQUIRED** - Outlet address (cannot be empty or whitespace)

**Optional:**
- `companyLogo` (file): Company logo image
- `contactPersons[0][name]` (string): Contact person name
- `contactPersons[0][position]` (string): Contact person position
- `contactPersons[0][number]` (string): Contact person number
- `outlets[0][managerName]` (string): Outlet manager name
- `outlets[0][managerContact]` (string): Outlet manager contact
- `acraBizfileCert` (file): ACRA business file certificate
- `serviceAgreement` (string): Service agreement status
- `serviceContract` (file): Service contract PDF
- `contractExpiryDate` (string): Contract expiry date (YYYY-MM-DD)
- `generateCredentials` (string): "true" to generate login credentials

**Success Response (201):**
```json
{
  "success": true,
  "message": "Employer created successfully",
  "employer": {
    "_id": "507f1f77bcf86cd799439011",
    "employerId": "EMP-e3d7",
    "companyLegalName": "Company Name",
    "industry": "Hospitality",
    "outlets": [...]
  },
  "credentials": {
    "email": "company@example.com",
    "password": "generated_password",
    "emailSent": true
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Each outlet must have a name",
  "error": "ValidationError"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Only admins can perform this action",
  "error": "ForbiddenError"
}
```

---

### 12. Update Employer

**Endpoint:** `PUT /employers/:id`

**Content-Type:** `multipart/form-data`

**ID Format:** Same as Get Single Employer (supports both ObjectId and EMP-xxxx)

**Request Fields:** Same as Create Employer (all fields optional for updates)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employer updated successfully",
  "employer": {...}
}
```

---

### 13. Delete Employer

**Endpoint:** `DELETE /employers/:id`

**ID Format:** Same as Get Single Employer (supports both ObjectId and EMP-xxxx)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employer deleted successfully"
}
```

---

## Jobs Endpoints

### 14. Get Jobs List

**Endpoint:** `GET /jobs`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status ("Active", "Suspended", "Completed", "Cancelled", "Pending", "Upcoming", "Deactivated")
- `search` (optional): Search in job title/description
- `location` (optional): Filter by location
- `employerId` (optional): Filter by employer
- `outletId` (optional): Filter by outlet
- `startDate` (optional): `YYYY-MM-DD`
- `endDate` (optional): `YYYY-MM-DD`
- `sortOrder` (optional): "asc" or "desc"

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "jobId": "JOB-1234",
      "jobTitle": "Waiter",
      "jobName": "Waiter",
      "jobDescription": "Serve customers...",
      "jobRoles": "Waiter, Server",
      "jobDate": "2024-12-25",
      "date": "2024-12-25",
      "employer": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Company Name",
        "companyLegalName": "Company Legal Name",
        "companyLogo": "/uploads/logo.png"
      },
      "employerId": "507f1f77bcf86cd799439012",
      "employerName": "Company Name",
      "outlet": {
        "_id": "507f1f77bcf86cd799439013",
        "id": "507f1f77bcf86cd799439013",
        "name": "Outlet Name",
        "address": "Outlet Address"
      },
      "outletId": "507f1f77bcf86cd799439013",
      "outletAddress": "Outlet Address",
      "industry": "Hospitality",
      "totalPositions": 5,
      "currentFulfilment": {
        "filled": 3,
        "total": 5,
        "display": "3/5"
      },
      "jobStatus": "Active",
      "status": "Active",
      "postedBy": "admin",
      "applicationDeadline": "2024-12-24T23:59:59Z",
      "dressCode": "Uniform provided",
      "skills": ["Customer service", "Food handling"],
      "locationDetails": "123 Main Street",
      "shifts": [
        {
          "id": "507f1f77bcf86cd799439014",
          "shiftId": "SHIFT-1234",
          "startTime": "09:00",
          "endTime": "17:00",
          "duration": 8,
          "totalWorkingHours": 8,
          "breakDuration": 1,
          "breakHours": 1,
          "breakType": "Paid",
          "rateType": "Weekday",
          "payPerHour": 12.5,
          "payRate": 12.5,
          "totalWages": 100,
          "totalWage": 100,
          "vacancy": 5,
          "availableVacancy": 5,
          "standby": 2,
          "standbyVacancy": 2,
          "vacancyFilled": 3,
          "standbyFilled": 1
        }
      ],
      "shiftTiming": {
        "display": "9:00am to 5:00pm"
      },
      "totalWorkingHours": 8,
      "breakDuration": 1,
      "payPerHour": 12.5,
      "rateType": "Weekday",
      "totalWages": 100,
      "totalWage": 100,
      "foodHygieneCertRequired": false,
      "attendanceRate": 95.5
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10
  },
  "totalActiveJobs": 50,
  "totalCompletedJobs": 30,
  "totalCancelledJobs": 10,
  "currentFulfilmentRate": 85.5
}
```

---

### 15. Get Single Job

**Endpoint:** `GET /jobs/:jobId`

**Success Response (200):**
```json
{
  "success": true,
  "job": {
    "_id": "507f1f77bcf86cd799439011",
    "jobId": "JOB-1234",
    "jobTitle": "Waiter",
    "jobDescription": "Serve customers...",
    "jobRoles": "Waiter, Server",
    "jobDate": "2024-12-25",
    "employer": {...},
    "outlet": {...},
    "industry": "Hospitality",
    "totalPositions": 5,
    "maxStandby": 1,
    "maxVacancy": 3,
    "jobStatus": "Active",
    "dressCode": "Uniform provided",
    "skills": ["Customer service", "Food handling"],
    "shifts": [...],
    "penalties": [
      {
        "condition": "24 Hours (1st Time)",
        "penalty": "$5 Penalty"
      }
    ],
    "applicationDeadline": "2024-12-24T23:59:59Z",
    "locationDetails": "123 Main Street"
  }
}
```

---

### 16. Create Job (Admin Only)

**Endpoint:** `POST /jobs/create`

**Authorization:** ADMIN role required

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "jobDate": "2024-12-25",
  "jobTitle": "Waiter",
  "jobDescription": "Serve customers...",
  "jobRoles": "Waiter, Server",
  "employerId": "507f1f77bcf86cd799439012",
  "employerName": "Company Name",
  "industry": "Hospitality",
  "postedBy": "admin",
  "outletId": "507f1f77bcf86cd799439013",
  "outletAddress": null,
  "totalPositions": 5,
  "foodHygieneCertRequired": false,
  "jobStatus": "Active",
  "applicationDeadline": "2024-12-24T23:59:59Z",
  "dressCode": "Uniform provided, Black pants",
  "skills": ["Customer service", "Food handling", "Team work"],
  "locationDetails": "123 Main Street",
  "shifts": [
    {
      "startTime": "09:00",
      "endTime": "17:00",
      "breakDuration": 1,
      "totalWorkingHours": 7,
      "rateType": "Weekday",
      "payPerHour": 12.5,
      "totalWages": 87.5
    }
  ]
}
```

**Important Notes:**
- `contactInfo` field is **NOT** sent (removed from frontend)
- `jobRequirements` field is **NOT** sent (replaced by `dressCode` and `skills`)
- `skills` is sent as **array** (frontend converts comma-separated string to array)
- `postedBy` is required and set based on user role

**Success Response (201):**
```json
{
  "success": true,
  "message": "Job created successfully",
  "job": {...}
}
```

---

### 17. Update Job

**Endpoint:** `PUT /jobs/:jobId`

**Content-Type:** `application/json`

**Request Body:** Same as Create Job (all fields optional)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "job": {...}
}
```

---

### 18. Delete Job

**Endpoint:** `DELETE /jobs/:jobId`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

## Candidates Endpoints

### 19. Get Candidates List

**Endpoint:** `GET /admin/candidates`

**Query Parameters:**
- `limit` (optional): Items per page
- `sort` (optional): Sort order (e.g., "-createdAt")
- `search` (optional): Search in name, email, mobile
- `status` (optional): Filter by status

**Success Response (200):**
```json
{
  "success": true,
  "candidates": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "mobile": "1234567890",
      "email": "john@example.com",
      "nric": "S1234567A",
      "icNumber": "S1234567A",
      "dob": "1990-01-01",
      "dateOfBirth": "1990-01-01",
      "gender": "Male",
      "postalCode": "123456",
      "streetAddress": "123 Main Street",
      "profilePicture": "/uploads/profile.jpg",
      "selfie": "/uploads/profile.jpg",
      "nricFront": "/uploads/nric-front.jpg",
      "nricBack": "/uploads/nric-back.jpg",
      "plocImage": "/uploads/ploc.jpg",
      "plocExpiryDate": "2025-12-31",
      "plocExpiry": "2025-12-31",
      "foodHygieneCert": "/uploads/cert.jpg",
      "schools": "School Name",
      "studentPassImage": "/uploads/student-pass.jpg",
      "studentCard": "/uploads/student-pass.jpg",
      "studentIdNo": "STU123456",
      "studentId": "STU123456",
      "eWalletAmount": 100.50,
      "workPassStatus": "Verified",
      "registrationType": "Singaporean/PR",
      "registrationDate": "2024-01-01",
      "verificationStatus": "Verified",
      "status": "Active",
      "attendanceStatus": "Active",
      "turnUpRate": "95.5",
      "completedJobs": 10
    }
  ]
}
```

---

### 20. Get Single Candidate

**Endpoint:** `GET /admin/candidates/:id`

**Success Response (200):**
```json
{
  "success": true,
  "candidate": {...},
  "candidateProfile": {...}
}
```

---

### 21. Update Candidate

**Endpoint:** `PUT /admin/candidates/:id`

**Content-Type:** `multipart/form-data`

**Request Fields:**

**Required:**
- `fullName` (string): Full name
- `mobile` (string): Mobile number
- `email` (string): Email address (required if not exists)
- `nric` (string): NRIC number
- `dateOfBirth` (string): Date of birth (DD/MM/YYYY format)
- `gender` (string): Gender
- `postalCode` (string): 6-digit postal code
- `streetAddress` (string): Street address
- `profilePicture` (file): Profile picture

**Conditionally Required:**
- `nricFront` (file): Required if Singaporean/PR
- `nricBack` (file): Required if Singaporean/PR
- `plocImage` (file): Required if LTVP
- `plocExpiryDate` (string): Required if LTVP (YYYY-MM-DD)
- `schools` (string): Required if Student Pass
- `studentPassImage` (file): Required if Student Pass
- `studentIdNo` (string): Required if Student Pass

**Optional:**
- `foodHygieneCert` (file): Food hygiene certificate

**Success Response (200):**
```json
{
  "success": true,
  "message": "Candidate updated successfully",
  "candidate": {...}
}
```

---

### 22. Delete Candidate

**Endpoint:** `DELETE /admin/candidates/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Candidate deleted successfully"
}
```

---

## Job Applications Endpoints

### 23. Get Job Candidates

**Endpoint:** `GET /admin/jobs/candidates/:jobId`

**Success Response (200):**
```json
{
  "success": true,
  "candidates": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "fullName": "John Doe",
      "mobile": "1234567890",
      "email": "john@example.com",
      "gender": "Male",
      "age": 30,
      "nric": "S1234567A",
      "shift": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "applicationStatus": "Pending",
      "status": "Pending",
      "rejectionReason": null,
      "completedJobs": 10
    }
  ]
}
```

---

### 24. Update Application Status

**Endpoint:** `PUT /admin/applications/status/:userId`

**Request Body:**
```json
{
  "status": "Approved",
  "rejectionReason": null
}
```

**OR**

```json
{
  "status": "Rejected",
  "rejectionReason": "Does not meet requirements"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application status updated successfully"
}
```

---

## Payments Endpoints

### 25. Get Payments

**Endpoint:** `GET /payments`

**Query Parameters:**
- `status` (optional): Filter by status
- `employeeId` (optional): Filter by employee
- `jobId` (optional): Filter by job
- `page` (optional): Page number
- `limit` (optional): Items per page

**Success Response (200):**
```json
{
  "success": true,
  "payments": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "paymentId": "PAY-1234",
      "employee": {
        "_id": "507f1f77bcf86cd799439012",
        "fullName": "John Doe",
        "nric": "S1234567A"
      },
      "job": {
        "_id": "507f1f77bcf86cd799439013",
        "jobTitle": "Waiter"
      },
      "amount": 100.50,
      "status": "Pending",
      "paymentDate": "2024-12-22",
      "createdAt": "2024-12-22T10:00:00Z"
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

### 26. Update Payment Status

**Endpoint:** `PUT /payments/:paymentId/status`

**Request Body:**
```json
{
  "status": "Approved",
  "rejectionReason": null
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment status updated successfully"
}
```

---

### 27. Regenerate Payment

**Endpoint:** `POST /payments/:paymentId/regenerate`

**Request Body:**
```json
{
  "amount": 150.00,
  "paymentDate": "2024-12-23",
  "notes": "Updated amount"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment regenerated successfully",
  "payment": {...}
}
```

---

## Withdrawals Endpoints

### 28. Get Withdrawals

**Endpoint:** `GET /withdrawals`

**Query Parameters:**
- `status` (optional): Filter by status
- `employeeId` (optional): Filter by employee
- `page` (optional): Page number
- `limit` (optional): Items per page

**Success Response (200):**
```json
{
  "success": true,
  "withdrawals": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "employee": {...},
      "amount": 500.00,
      "status": "Pending",
      "cashOutMethod": "PayNow",
      "createdAt": "2024-12-22T10:00:00Z"
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

**Note:** Response may also use `transactions` array instead of `withdrawals` array.

---

### 29. Create Withdrawal

**Endpoint:** `POST /withdrawals/create`

**Request Body:**
```json
{
  "employeeId": "507f1f77bcf86cd799439012",
  "amount": 500.00,
  "cashOutMethod": "PayNow"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Withdrawal created successfully",
  "withdrawal": {...}
}
```

---

## Configuration Endpoints

### 30. Get Rate Configuration

**Endpoint:** `GET /admin/rate-configuration`

**Success Response (200):**
```json
{
  "success": true,
  "rateTypes": ["Weekday", "Weekend", "Public Holiday"],
  "defaultPayRates": {
    "Weekday": 12.5,
    "Weekend": 15.0,
    "Public Holiday": 20.0
  }
}
```

---

### 31. Get Penalties

**Endpoint:** `GET /admin/penalties`

**Success Response (200):**
```json
{
  "success": true,
  "penalties": [
    {
      "condition": "5 minutes after applying",
      "penalty": "No Penalty"
    },
    {
      "condition": "48 Hours",
      "penalty": "No Penalty"
    },
    {
      "condition": "24 Hours (1st Time)",
      "penalty": "$5 Penalty"
    },
    {
      "condition": "24 Hours (2nd Time)",
      "penalty": "$10 Penalty"
    },
    {
      "condition": "24 Hours (3rd Time)",
      "penalty": "$15 Penalty"
    },
    {
      "condition": "No Show - During Shift",
      "penalty": "$50 Penalty"
    }
  ]
}
```

---

### 32. Get Schools List

**Endpoint:** `GET /admin/schools`

**Success Response (200):**
```json
{
  "success": true,
  "schools": [
    "School Name 1",
    "School Name 2",
    "School Name 3"
  ]
}
```

---

### 33. Get Postal Code Address

**Endpoint:** `GET /admin/postal-code/:postalCode`

**Success Response (200):**
```json
{
  "success": true,
  "streetAddress": "123 Main Street, Singapore"
}
```

---

## Reports Endpoints

### 34. Get Sales Report

**Endpoint:** `GET /admin/sales-report`

**Success Response (200):**
```json
{
  "success": true,
  "reports": [
    {
      "id": "507f1f77bcf86cd799439011",
      "employer": {
        "name": "Company Name",
        "logo": "/uploads/logo.png"
      },
      "jobsPosted": 50,
      "jobsFulfilled": 45,
      "fulfillmentRate": 90,
      "revenue": 50000,
      "hoursFulfilled": 1000
    }
  ]
}
```

---

### 35. Get Service Report

**Endpoint:** `GET /admin/service-report`

**Success Response (200):**
```json
{
  "success": true,
  "reports": [...]
}
```

---

### 36. Get Invoice Report

**Endpoint:** `GET /admin/invoice-report`

**Success Response (200):**
```json
{
  "success": true,
  "reports": [...]
}
```

---

## Support Endpoints

### 37. Submit Support Feedback

**Endpoint:** `POST /support/feedback`

**Request Body:**
```json
{
  "subject": "Issue Subject",
  "message": "Issue description",
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

---

## QR Code Endpoints

### 38. Get QR Code Jobs

**Endpoint:** `GET /admin/jobs?limit=100&status=Active,Upcoming`

**Query Parameters:**
- `limit` (optional): Number of results
- `status` (optional): Comma-separated statuses (e.g., "Active,Upcoming")

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [...]
}
```

---

## Other Endpoints

### 39. Get Outlets

**Endpoint:** `GET /outlets`

**Success Response (200):**
```json
{
  "success": true,
  "data": [...],
  "outlets": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "id": "507f1f77bcf86cd799439011",
      "outletName": "Outlet Name",
      "name": "Outlet Name",
      "outletAddress": "Address",
      "location": "Address",
      "outletImage": "/uploads/outlet.jpg"
    }
  ]
}
```

---

### 40. Get Deployment Tracking

**Endpoint:** `GET /admin/jobs/deployment-tracking`

**Query Parameters:**
- `startDate` (optional): `YYYY-MM-DD`
- `endDate` (optional): `YYYY-MM-DD`

**Success Response (200):**
```json
{
  "success": true,
  "deployments": [...]
}
```

---

### 41. Get Profile Image

**Endpoint:** `GET /admin/profile/image`

**Success Response (200):**
Image file or URL

---

### 42. Upload Profile Image

**Endpoint:** `POST /admin/profile/image`

**Content-Type:** `multipart/form-data`

**Request:** File upload

**Success Response (200):**
```json
{
  "success": true,
  "imageUrl": "/uploads/profile.jpg"
}
```

---

## Data Formats & Types

### Date Formats

- **Request Dates:** `YYYY-MM-DD` (e.g., "2024-12-25")
- **Request DateTime:** `YYYY-MM-DDTHH:mm:ssZ` (e.g., "2024-12-24T23:59:59Z")
- **Display Dates:** `DD/MM/YYYY` (frontend converts)
- **Date of Birth (Candidate Update):** `DD/MM/YYYY` format in form data

### Status Values

**Job Status:**
- "Active"
- "Suspended"
- "Completed"
- "Cancelled"
- "Pending"
- "Upcoming"
- "Deactivated"

**Application Status:**
- "Pending"
- "Approved"
- "Rejected"

**Payment Status:**
- "Pending"
- "Approved"
- "Rejected"
- "Completed"
- "Paid"

### Industry Types

- "Hospitality"
- "IT"
- "F&B"
- "Hotel"
- "Retail"
- "Logistics"
- "Healthcare"
- "Education"
- "Construction"
- "Others"

### Rate Types

- "Weekday"
- "Weekend"
- "Public Holiday"

---

## File Uploads

### Supported File Types

- Images: `.jpg`, `.jpeg`, `.png`, `.gif`
- Documents: `.pdf`

### File Upload Endpoints

1. **Employer Logo:** `POST /employers/create` or `PUT /employers/:id`
   - Field name: `companyLogo`

2. **ACRA Certificate:** `POST /employers/create` or `PUT /employers/:id`
   - Field name: `acraBizfileCert`

3. **Service Contract:** `POST /employers/create` or `PUT /employers/:id`
   - Field name: `serviceContract`

4. **Candidate Documents:** `PUT /admin/candidates/:id`
   - Fields: `profilePicture`, `nricFront`, `nricBack`, `plocImage`, `foodHygieneCert`, `studentPassImage`

5. **Profile Image:** `POST /admin/profile/image`
   - Field name: `image` or `profilePicture`

### File Path Format

- Backend may return paths with backslashes (`\`)
- Frontend normalizes to forward slashes (`/`)
- Image base URL: `https://worklah.onrender.com`
- Full image URL: `{IMAGE_BASE_URL}{filePath}`

---

## Pagination

### Pagination Format

All list endpoints should return pagination metadata:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10
  }
}
```

### Default Values

- `page`: 1
- `limit`: 10 (varies by endpoint)

---

## Filtering & Sorting

### Common Query Parameters

- `search`: Text search (searches in relevant fields)
- `status`: Filter by status (single value or comma-separated)
- `startDate`: Filter start date (`YYYY-MM-DD`)
- `endDate`: Filter end date (`YYYY-MM-DD`)
- `sortOrder`: "asc" or "desc"
- `sort`: Sort field (e.g., "-createdAt" for newest first)

### Filter Examples

```
GET /jobs?status=Active,Upcoming&startDate=2024-12-01&endDate=2024-12-31&sortOrder=desc
GET /employers?search=Company&industry=Hospitality&page=1&limit=10
GET /admin/candidates?limit=4&sort=-createdAt
```

---

## Important Notes

### 1. Response Format

**CRITICAL:** All endpoints MUST return responses with a `success` field:
- `success: true` for successful operations
- `success: false` for errors

The frontend checks this field in all responses and will fail if it's missing.

### 2. Array Fields

The following fields are arrays and must be handled as such:
- `mainContactPersons` (employers) - Array of objects
- `outlets` (employers) - Array of objects
- `skills` (jobs) - Array of strings
- `shifts` (jobs) - Array of objects
- `penalties` (jobs) - Array of objects

### 3. Field Name Consistency

**Employers:**
- Use `emailAddress` (not `companyEmail`)
- Use `officeNumber` (not `companyNumber`)
- Use `contractExpiryDate` (not `contractEndDate`)
- Use `mainContactPersons` as array (not single object)

**Jobs:**
- Use `dressCode` and `skills` (NOT `jobRequirements` or `contactInfo`)
- `skills` is an array of strings
- `postedBy` is required

**Candidates:**
- Support both `nric` and `icNumber` (for compatibility)
- Support both `dob` and `dateOfBirth` (for compatibility)
- Support both `studentIdNo` and `studentId` (for compatibility)

### 4. ID Format Support

**Employers:**
- Support both MongoDB ObjectId (`507f1f77bcf86cd799439011`)
- Support Employer ID format (`EMP-e3d7`, `EMP-0001`, `EMP-1234`)

**Jobs:**
- Support both MongoDB ObjectId and Job ID format

### 5. Outlet Validation

When creating/updating employers:
- At least one outlet is **REQUIRED**
- Each outlet **MUST** have both `name` and `address`
- Both fields cannot be empty, null, undefined, or whitespace-only

### 6. Date Handling

- All date inputs from frontend use `YYYY-MM-DD` format
- DateTime inputs use `YYYY-MM-DDTHH:mm:ssZ` format
- Candidate date of birth in update form uses `DD/MM/YYYY` format
- Backend should accept and store dates in ISO format

### 7. File Path Normalization

- Backend may return file paths with backslashes (`\`)
- Frontend normalizes to forward slashes (`/`)
- Ensure file paths are accessible via HTTP

### 8. Error Messages

- Error messages should be user-friendly and descriptive
- Include field-specific validation errors when possible
- Use consistent error types for similar errors

---

## Testing Checklist

### Authentication
- [ ] Login returns `success`, `user`, and `token`
- [ ] `/user/me` validates token correctly
- [ ] Invalid token returns 401
- [ ] Logout works correctly

### Employers
- [ ] List endpoint returns pagination
- [ ] Create endpoint validates required fields
- [ ] Outlet validation works (name and address required)
- [ ] Update endpoint accepts both ObjectId and EMP-xxxx format
- [ ] File uploads work (logo, certificates)
- [ ] `mainContactPersons` is returned as array

### Jobs
- [ ] List endpoint supports all filters
- [ ] Create endpoint accepts `dressCode` and `skills` (NOT `jobRequirements`)
- [ ] `skills` is sent as array
- [ ] `contactInfo` is NOT sent
- [ ] Shifts array is properly formatted
- [ ] Status filtering works

### Candidates
- [ ] List endpoint works with sorting
- [ ] Update endpoint handles file uploads
- [ ] Conditional required fields based on registration type
- [ ] Date of birth format `DD/MM/YYYY` is accepted

### Payments
- [ ] List endpoint returns pagination
- [ ] Status update works
- [ ] Regenerate payment works

### Error Handling
- [ ] All errors return `success: false`
- [ ] Error messages are user-friendly
- [ ] 401 errors redirect to login
- [ ] 403 errors show permission message
- [ ] Validation errors are descriptive

### Response Format
- [ ] All responses include `success` field
- [ ] Success responses have `success: true`
- [ ] Error responses have `success: false` and `message`
- [ ] Pagination metadata is included in list responses

---

## Contact & Support

For questions or clarifications about this API specification, please refer to:
- Frontend codebase: `src/lib/authInstances.ts` for axios configuration
- Frontend API calls: Search for `axiosInstance` in the codebase
- Existing API documentation: `API_SPECIFICATION.md` and `EMPLOYER_API_FORMAT.md`

---

**END OF DOCUMENTATION**

