# WorkLah Backend API Documentation - Complete Reference

**Document Version:** 2.0.0  
**Last Updated:** January 2025  
**Purpose:** Complete backend API specification for WorkLah platform  
**Backend:** Node.js/Express  
**Frontend:** React.js (Admin Panel) + Flutter (Mobile App)

---

## 🎯 **IMPORTANT: READ THIS FIRST**

This document contains **ALL API endpoints** required for the WorkLah platform. Share this file with your backend developer.

### ⚠️ **CRITICAL REQUIREMENTS**

1. **All responses MUST include `success` field:**
   ```json
   {
     "success": true,
     "data": {...}
   }
   ```

2. **Error responses:**
   ```json
   {
     "success": false,
     "message": "Error message here",
     "error": "ErrorType"
   }
   ```

3. **Image URLs:** Always return full URLs:
   ```json
   "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg"
   ```

4. **Role-Based Access Control:**
   - Admin endpoints: Verify `role: "ADMIN"`
   - User endpoints: Verify `role: "USER"`
   - Return `403 Forbidden` for unauthorized access

5. **Pagination Format:**
   ```json
   {
     "success": true,
     "data": [...],
     "pagination": {
       "currentPage": 1,
       "totalPages": 10,
       "totalItems": 100,
       "itemsPerPage": 20
     }
   }
   ```

---

## 🔄 **CRITICAL WORKFLOW: Admin → Employer → Job**

**⚠️ IMPORTANT: This is the REQUIRED workflow order:**

```
1. Admin Login
   ↓
2. Add Employer (POST /api/admin/employers)
   - Company details, contact info, outlets
   ↓
3. Create Job (POST /api/admin/jobs)
   - MUST select existing employer
   - MUST select outlet from that employer
   - Job details, shifts, etc.
   ↓
4. Edit Employer/Job (PUT endpoints)
```

**Backend MUST enforce:**
- ✅ Jobs require valid `employerId`
- ✅ Jobs require valid `outletId` that belongs to the employer
- ✅ Return clear error if employer/outlet validation fails
- ✅ `GET /api/admin/employers` MUST include `outlets` array in response

---

## 📋 **Table of Contents**

1. [Admin Authentication Endpoints](#1-admin-authentication-endpoints)
2. [User Authentication Endpoints (Flutter)](#2-user-authentication-endpoints-flutter)
3. [Dashboard & Analytics](#3-dashboard--analytics)
4. [Job Management](#4-job-management)
5. [Application Management](#5-application-management)
6. [User Management](#6-user-management)
7. [Employer Management](#7-employer-management)
8. [Outlet Management](#8-outlet-management)
9. [Payment & Wallet Management](#9-payment--wallet-management)
10. [Attendance Management](#10-attendance-management)
11. [Notification Management](#11-notification-management)
12. [QR Code Management](#12-qr-code-management)
13. [Timesheet Management](#13-timesheet-management)
14. [Reports & Analytics](#14-reports--analytics)
15. [Settings & Configuration](#15-settings--configuration)
16. [Support & Feedback](#16-support--feedback)

---

## 1. Admin Authentication Endpoints

### 1.1 Admin Login
**Endpoint:** `POST /api/admin/login`  
**Access:** Public

**Request Body:**
```json
{
  "email": "admin@worklah.com",
  "password": "adminPassword123"
}
```

**Success Response (200):**
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

---

### 1.2 Get Current Admin
**Endpoint:** `GET /api/admin/me`  
**Access:** Admin only

**Headers:** `Authorization: Bearer {adminToken}`

**Success Response (200):**
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

### 1.3 Admin Logout
**Endpoint:** `POST /api/admin/logout`  
**Access:** Admin only

**Headers:** `Authorization: Bearer {adminToken}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. User Authentication Endpoints (Flutter)

### 2.1 User Login (OTP-based)
**Endpoint:** `POST /api/user/login`  
**Access:** Public

**Request Body:**
```json
{
  "phoneNumber": "+6512345678"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otpSent": true
}
```

---

### 2.2 Verify OTP
**Endpoint:** `POST /api/user/verify-otp`  
**Access:** Public

**Request Body:**
```json
{
  "phoneNumber": "+6512345678",
  "otp": "123456"
}
```

**Success Response (200):**
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

### 2.3 Get Current User
**Endpoint:** `GET /api/user/me`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Success Response (200):**
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

### 2.4 User Logout
**Endpoint:** `POST /api/user/logout`  
**Access:** User only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 2.5 Forgot Password
**Endpoint:** `POST /api/user/forgot-password`  
**Access:** Public

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

---

## 3. Dashboard & Analytics

### 3.1 Get Dashboard Statistics
**Endpoint:** `GET /api/admin/dashboard/stats`  
**Access:** Admin only

**Query Parameters:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `employerId` (optional): Filter by employer

**Success Response (200):**
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

### 3.2 Get Dashboard Charts Data
**Endpoint:** `GET /api/admin/dashboard/charts`  
**Access:** Admin only

**Query Parameters:**
- `period` (optional): "daily", "weekly", "monthly", "yearly" (default: "monthly")
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Success Response (200):**
```json
{
  "success": true,
  "charts": {
    "applicationsOverTime": [
      { "date": "2024-12-01", "count": 50 },
      { "date": "2024-12-02", "count": 65 }
    ],
    "jobsByStatus": {
      "active": 120,
      "completed": 180,
      "cancelled": 50
    },
    "revenueOverTime": [
      { "date": "2024-12-01", "amount": 5000.00 },
      { "date": "2024-12-02", "amount": 6500.00 }
    ]
  }
}
```

---

## 4. Job Management

### 4.1 Get All Jobs (Admin)
**Endpoint:** `GET /api/admin/jobs`  
**Access:** Admin only

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status
- `search` (optional): Search in job title/description
- `employerId` (optional): Filter by employer
- `outletId` (optional): Filter by outlet
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `sortOrder` (optional): "asc" or "desc"

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "jobId": "JOB-1234",
      "jobName": "Waiter",
      "jobDate": "2024-12-25",
      "status": "Active",
      "employer": {
        "_id": "507f1f77bcf86cd799439012",
        "companyLegalName": "ABC Restaurant"
      },
      "outlet": {
        "_id": "507f1f77bcf86cd799439013",
        "outletName": "Orchard Branch"
      },
      "totalApplications": 15,
      "approvedApplications": 10,
      "pendingApplications": 5,
      "createdAt": "2024-12-20T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 200,
    "itemsPerPage": 20
  }
}
```

---

### 4.2 Get Single Job (Admin)
**Endpoint:** `GET /api/admin/jobs/:jobId`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "job": {
    "_id": "507f1f77bcf86cd799439011",
    "jobId": "JOB-1234",
    "jobName": "Waiter",
    "jobDescription": "...",
    "status": "Active",
    "employer": {...},
    "outlet": {...},
    "shifts": [
      {
        "_id": "...",
        "shiftDate": "2024-12-25",
        "startTime": "09:00",
        "endTime": "17:00",
        "rateType": "Hourly",
        "rates": 12.50,
        "totalWages": 100.00
      }
    ],
    "skills": ["Customer service", "Food handling"],
    "applications": [...],
    "createdAt": "2024-12-20T10:00:00Z"
  }
}
```

---

### 4.3 Create Job
**Endpoint:** `POST /api/admin/jobs`  
**Access:** Admin only

**⚠️ CRITICAL:** Job creation requires a valid `employerId` and `outletId` that belongs to the employer.

**Request Body:**
```json
{
  "jobName": "Waiter",
  "jobDescription": "Serve customers...",
  "jobDate": "2024-12-25",
  "employerId": "507f1f77bcf86cd799439012",
  "outletId": "507f1f77bcf86cd799439013",
  "industry": "Hospitality",
  "location": "123 Main Street",
  "shifts": [
    {
      "shiftDate": "2024-12-25",
      "startTime": "09:00",
      "endTime": "17:00",
      "duration": 8,
      "breakDuration": 1,
      "breakType": "Paid",
      "rateType": "Hourly",
      "rates": 12.5,
      "vacancy": 5,
      "standbyVacancy": 2
    }
  ],
  "dressCode": "Uniform provided",
  "skills": ["Customer service", "Food handling"],
  "applicationDeadline": "2024-12-24T23:59:59Z"
}
```

**Validation Required:**
- `employerId` must exist in database
- `outletId` must belong to the specified employer
- Return error if validation fails

**Success Response (201):**
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

### 4.4 Update Job
**Endpoint:** `PUT /api/admin/jobs/:jobId`  
**Access:** Admin only

**Request Body:** (Same as Create Job)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "job": {...}
}
```

---

### 4.5 Delete Job
**Endpoint:** `DELETE /api/admin/jobs/:jobId`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot delete job with active applications",
  "error": "JobHasApplications"
}
```

---

### 4.6 Update Job Status
**Endpoint:** `PATCH /api/admin/jobs/:jobId/status`  
**Access:** Admin only

**Request Body:**
```json
{
  "status": "Suspended",
  "reason": "Temporary suspension due to maintenance"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job status updated successfully",
  "job": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "Suspended"
  }
}
```

---

### 4.7 Get Deployment Tracking
**Endpoint:** `GET /api/admin/jobs/deployment-tracking`  
**Access:** Admin only

**Query Parameters:**
- `startDate`, `endDate`, `employerId`

**Success Response (200):**
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

### 4.8 Get Jobs (User-facing - Flutter)
**Endpoint:** `GET /api/jobs`  
**Access:** Public/User

**Query Parameters:**
- `page`, `limit`, `search`, `status`, `location`, `date`, `rateType`

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [...],
  "pagination": {...}
}
```

---

### 4.9 Get Single Job (User-facing - Flutter)
**Endpoint:** `GET /api/jobs/:jobId`  
**Access:** Public/User

**Success Response (200):**
```json
{
  "success": true,
  "job": {...}
}
```

---

### 4.10 Apply for Job (Flutter)
**Endpoint:** `POST /api/jobs/:jobId/apply`  
**Access:** User only

**Request Body:**
```json
{
  "shiftId": "507f1f77bcf86cd799439013",
  "notes": "Available for this shift"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {...}
}
```

---

### 4.11 Cancel Application (Flutter)
**Endpoint:** `POST /api/jobs/:jobId/cancel`  
**Access:** User only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application cancelled successfully"
}
```

---

### 4.12 Get User Jobs (Flutter)
**Endpoints:**
- `GET /api/user/jobs/ongoing` - Ongoing jobs
- `GET /api/user/jobs/completed` - Completed jobs
- `GET /api/user/jobs/cancelled` - Cancelled jobs

**Access:** User only

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [...],
  "pagination": {...}
}
```

---

## 5. Application Management

### 5.1 Get All Applications (Admin)
**Endpoint:** `GET /api/admin/applications`  
**Access:** Admin only

**Query Parameters:**
- `page`, `limit`, `status`, `jobId`, `userId`, `startDate`, `endDate`

**Success Response (200):**
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
        "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg"
      },
      "jobId": "507f1f77bcf86cd799439012",
      "job": {
        "jobName": "Waiter",
        "jobDate": "2024-12-25"
      },
      "shiftId": "507f1f77bcf86cd799439013",
      "shift": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "status": "Pending",
      "adminStatus": "Pending",
      "appliedAt": "2024-12-22T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### 5.2 Get Single Application (Admin)
**Endpoint:** `GET /api/admin/applications/:applicationId`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "application": {...}
}
```

---

### 5.3 Approve Application
**Endpoint:** `POST /api/admin/applications/:applicationId/approve`  
**Access:** Admin only

**Request Body:**
```json
{
  "notes": "Approved - Good profile"
}
```

**Success Response (200):**
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

**Notes:**
- Automatically create notification for user
- Update job vacancy count
- Send confirmation email/SMS (if configured)

---

### 5.4 Reject Application
**Endpoint:** `POST /api/admin/applications/:applicationId/reject`  
**Access:** Admin only

**Request Body:**
```json
{
  "reason": "Profile incomplete",
  "notes": "User needs to complete profile first"
}
```

**Success Response (200):**
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

### 5.5 Bulk Approve/Reject Applications
**Endpoint:** `POST /api/admin/applications/bulk-action`  
**Access:** Admin only

**Request Body:**
```json
{
  "action": "approve",
  "applicationIds": [
    "507f1f77bcf86cd799439014",
    "507f1f77bcf86cd799439015"
  ],
  "notes": "Bulk approval"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Applications processed successfully",
  "approved": 2,
  "failed": 0
}
```

---

### 5.6 Get Job Candidates
**Endpoint:** `GET /api/admin/jobs/candidates/:jobId`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "candidates": [...],
  "pagination": {...}
}
```

---

### 5.7 Update Application Status
**Endpoint:** `PUT /api/admin/applications/status/:userId`  
**Access:** Admin only

**Request Body:**
```json
{
  "status": "Approved",
  "notes": "..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application status updated",
  "application": {...}
}
```

---

## 6. User Management

### 6.1 Get All Users (Admin)
**Endpoint:** `GET /api/admin/users`  
**Access:** Admin only

**Query Parameters:**
- `page`, `limit`, `search`, `role`, `profileCompleted`, `status`

**Success Response (200):**
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
  "pagination": {...}
}
```

---

### 6.2 Get Single User (Admin)
**Endpoint:** `GET /api/admin/users/:userId`  
**Access:** Admin only

**Success Response (200):**
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
    "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg",
    "dateOfBirth": "1990-01-01",
    "address": "123 Main Street",
    "nric": "S1234567A",
    "workPermit": "WP123456",
    "totalApplications": 25,
    "approvedApplications": 20,
    "completedJobs": 15,
    "cancelledJobs": 2,
    "walletBalance": 150.50,
    "totalEarnings": 5000.00,
    "status": "active",
    "createdAt": "2024-01-15T10:00:00Z",
    "lastLogin": "2024-12-25T10:00:00Z"
  }
}
```

---

### 6.3 Update User Status
**Endpoint:** `PATCH /api/admin/users/:userId/status`  
**Access:** Admin only

**Request Body:**
```json
{
  "status": "suspended",
  "reason": "Violation of terms"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "suspended"
  }
}
```

**Status Values:**
- `active` - User is active
- `suspended` - User is temporarily suspended
- `banned` - User is permanently banned

---

### 6.4 Get User Applications
**Endpoint:** `GET /api/admin/users/:userId/applications`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "applications": [...],
  "pagination": {...}
}
```

---

### 6.5 Get User Transactions
**Endpoint:** `GET /api/admin/users/:userId/transactions`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "transactions": [...],
  "pagination": {...}
}
```

---

### 6.6 Get All Candidates (Admin)
**Endpoint:** `GET /api/admin/candidates`  
**Access:** Admin only

**Query Parameters:**
- `page`, `limit`, `search`, `sort`

**Success Response (200):**
```json
{
  "success": true,
  "candidates": [...],
  "pagination": {...}
}
```

---

### 6.7 Get Single Candidate
**Endpoint:** `GET /api/admin/candidates/:candidateId`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "candidate": {...}
}
```

---

### 6.8 Update Candidate
**Endpoint:** `PUT /api/admin/candidates/:candidateId`  
**Access:** Admin only

**Request Body:** (multipart/form-data)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Candidate updated successfully",
  "candidate": {...}
}
```

---

### 6.9 Delete Candidate
**Endpoint:** `DELETE /api/admin/candidates/:candidateId`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Candidate deleted successfully"
}
```

---

### 6.10 Create User Account (Admin)
**Endpoint:** `POST /api/admin/users/create`  
**Access:** Admin only

**Request Body:**
```json
{
  "fullName": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required)",
  "role": "USER" | "EMPLOYER" | "ADMIN",
  "nric": "string (required for USER role)",
  "phoneNumber": "string (optional)",
  "employerId": "string (required for EMPLOYER role)",
  "sendCredentials": "boolean (optional, default: true)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {...},
  "credentialsSent": true
}
```

---

## 7. Employer Management

### 7.1 Get All Employers
**Endpoint:** `GET /api/admin/employers`  
**Access:** Admin only

**Query Parameters:**
- `page`, `limit`, `search`

**⚠️ CRITICAL:** Response MUST include `outlets` array for each employer (needed for job creation)

**Success Response (200):**
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
          "outletName": "Orchard Branch",
          "outletAddress": "123 Orchard Road"
        }
      ],
      "totalJobs": 50,
      "activeJobs": 10,
      "totalApplications": 200,
      "status": "active",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### 7.2 Get Single Employer
**Endpoint:** `GET /api/admin/employers/:employerId`  
**Access:** Admin only

**⚠️ CRITICAL:** Response MUST include `outlets` array

**Success Response (200):**
```json
{
  "success": true,
  "employer": {
    "_id": "507f1f77bcf86cd799439012",
    "employerId": "EMP-1234",
    "companyLegalName": "ABC Restaurant Pte Ltd",
    "companyLogo": "https://worklah.onrender.com/uploads/logo.png",
    "accountManager": "John Manager",
    "email": "contact@abcrestaurant.com",
    "phoneNumber": "+6512345678",
    "address": "123 Main Street",
    "outlets": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "outletName": "Orchard Branch",
        "outletAddress": "123 Orchard Road"
      }
    ],
    "totalJobs": 50,
    "activeJobs": 10,
    "status": "active",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

---

### 7.3 Create Employer
**Endpoint:** `POST /api/admin/employers`  
**Access:** Admin only

**⚠️ CRITICAL:** Employers must be created BEFORE jobs can be created.

**Request Body:** (multipart/form-data)

```json
{
  "companyLegalName": "ABC Restaurant Pte Ltd",
  "accountManager": "John Manager",
  "email": "contact@abcrestaurant.com",
  "phoneNumber": "+6512345678",
  "address": "123 Main Street",
  "industry": "Hospitality",
  "outlets": [
    {
      "outletName": "Orchard Branch",
      "outletAddress": "123 Orchard Road"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Employer created successfully",
  "employer": {
    "_id": "507f1f77bcf86cd799439012",
    "employerId": "EMP-1234",
    "companyLegalName": "ABC Restaurant Pte Ltd",
    ...
  }
}
```

---

### 7.4 Update Employer
**Endpoint:** `PUT /api/admin/employers/:employerId`  
**Access:** Admin only

**Request Body:** (Same as Create Employer, multipart/form-data)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employer updated successfully",
  "employer": {...}
}
```

---

### 7.5 Delete Employer
**Endpoint:** `DELETE /api/admin/employers/:employerId`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employer deleted successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot delete employer with active jobs",
  "error": "EmployerHasJobs"
}
```

---

## 8. Outlet Management

### 8.1 Get All Outlets
**Endpoint:** `GET /api/admin/outlets`  
**Access:** Admin only

**Query Parameters:**
- `page`, `limit`, `employerId`, `search`

**Success Response (200):**
```json
{
  "success": true,
  "outlets": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "outletName": "Orchard Branch",
      "outletAddress": "123 Orchard Road",
      "employer": {
        "_id": "507f1f77bcf86cd799439012",
        "companyLegalName": "ABC Restaurant Pte Ltd"
      },
      "totalJobs": 20,
      "activeJobs": 5,
      "status": "active"
    }
  ],
  "pagination": {...}
}
```

---

### 8.2 Get Single Outlet
**Endpoint:** `GET /api/admin/outlets/:outletId`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "outlet": {...}
}
```

---

### 8.3 Create Outlet
**Endpoint:** `POST /api/admin/outlets`  
**Access:** Admin only

**Request Body:**
```json
{
  "outletName": "Orchard Branch",
  "outletAddress": "123 Orchard Road",
  "employerId": "507f1f77bcf86cd799439012",
  "latitude": 1.2966,
  "longitude": 103.8525
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Outlet created successfully",
  "outlet": {...}
}
```

---

### 8.4 Get Outlet Attendance Chart
**Endpoint:** `GET /api/admin/outlets/:outletId/attendance/chart`  
**Access:** Admin only

**Query Parameters:**
- `year` (optional): YYYY

**Success Response (200):**
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

### 8.5 Get Outlet Attendance
**Endpoint:** `GET /api/admin/outlets/:outletId/attendance`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "attendance": [...],
  "pagination": {...}
}
```

---

## 9. Payment & Wallet Management

### 9.1 Get All Transactions (Admin)
**Endpoint:** `GET /api/admin/transactions`  
**Access:** Admin only

**Query Parameters:**
- `page`, `limit`, `type` (credit/debit), `status`, `userId`, `startDate`, `endDate`

**Success Response (200):**
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "userId": "507f1f77bcf86cd799439011",
      "user": {
        "fullName": "John Doe",
        "phoneNumber": "+6512345678"
      },
      "type": "credit",
      "amount": 100.00,
      "description": "Payment for job JOB-1234",
      "status": "completed",
      "date": "2024-12-20T17:00:00Z",
      "transactionId": "TXN-123456"
    }
  ],
  "pagination": {...}
}
```

---

### 9.2 Process Cashout Request
**Endpoint:** `POST /api/admin/cashout/:transactionId/process`  
**Access:** Admin only

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Processed via PayNow"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cashout processed successfully",
  "transaction": {
    "_id": "507f1f77bcf86cd799439019",
    "status": "completed"
  }
}
```

---

### 9.3 Reject Cashout Request
**Endpoint:** `POST /api/admin/cashout/:transactionId/reject`  
**Access:** Admin only

**Request Body:**
```json
{
  "reason": "Invalid account details"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cashout rejected",
  "transaction": {
    "_id": "507f1f77bcf86cd799439019",
    "status": "failed"
  }
}
```

---

### 9.4 Create Cashout Request
**Endpoint:** `POST /api/admin/cashout`  
**Access:** Admin only

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "amount": 100.00,
  "cashOutMethod": "PayNow",
  "description": "Cashout request"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cashout request created",
  "transaction": {...}
}
```

---

### 9.5 Add New Transaction
**Endpoint:** `POST /api/admin/payments/transactions`  
**Access:** Admin only

**Request Body:**
```json
{
  "userId": "string (required)",
  "amount": "number (required)",
  "type": "Salary" | "Incentive" | "Referral" | "Penalty" | "Others",
  "shiftDate": "ISO date string (optional, required for Salary/Penalty)",
  "dateOfShiftCompleted": "ISO date string (optional)",
  "remarks": "string (optional)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "transaction": {...}
}
```

---

### 9.6 Approve Transaction
**Endpoint:** `PUT /api/admin/payments/transactions/:transactionId/approve`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transaction approved successfully"
}
```

---

### 9.7 Reject Transaction
**Endpoint:** `PUT /api/admin/payments/transactions/:transactionId/reject`  
**Access:** Admin only

**Request Body:**
```json
{
  "reason": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transaction rejected successfully"
}
```

---

### 9.8 Bulk Approve Transactions
**Endpoint:** `POST /api/admin/payments/transactions/bulk-approve`  
**Access:** Admin only

**Request Body:**
```json
{
  "transactionIds": ["string", "string"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transactions approved successfully",
  "approvedCount": 5
}
```

---

### 9.9 Generate Payslip
**Endpoint:** `POST /api/admin/payments/generate-payslip/:transactionId`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "payslipUrl": "https://...",
  "message": "Payslip generated successfully"
}
```

---

### 9.10 Get User Wallet (Flutter)
**Endpoint:** `GET /api/user/wallet`  
**Access:** User only

**Success Response (200):**
```json
{
  "success": true,
  "wallet": {
    "balance": 150.50,
    "totalEarnings": 5000.00,
    "pendingCashout": 50.00,
    "availableBalance": 100.50
  }
}
```

---

### 9.11 Get User Transactions (Flutter)
**Endpoint:** `GET /api/user/transactions`  
**Access:** User only

**Query Parameters:**
- `page`, `limit`, `type`, `status`

**Success Response (200):**
```json
{
  "success": true,
  "transactions": [...],
  "pagination": {...}
}
```

---

### 9.12 Request Cashout (Flutter)
**Endpoint:** `POST /api/user/cashout`  
**Access:** User only

**Request Body:**
```json
{
  "amount": 100.00,
  "cashOutMethod": "PayNow",
  "accountDetails": {
    "accountNumber": "1234567890",
    "bankName": "DBS"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cashout request submitted",
  "transaction": {...}
}
```

---

### 9.13 Get Cashout History (Flutter)
**Endpoint:** `GET /api/user/cashout/history`  
**Access:** User only

**Success Response (200):**
```json
{
  "success": true,
  "cashouts": [...],
  "pagination": {...}
}
```

---

## 10. Attendance Management

### 10.1 Clock In (Flutter)
**Endpoint:** `POST /api/attendance/clock-in`  
**Access:** User only

**Request Body:**
```json
{
  "jobId": "507f1f77bcf86cd799439012",
  "shiftId": "507f1f77bcf86cd799439013",
  "latitude": 1.2966,
  "longitude": 103.8525
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Clocked in successfully",
  "attendance": {
    "_id": "507f1f77bcf86cd799439022",
    "clockInTime": "2024-12-25T09:00:00Z"
  }
}
```

---

### 10.2 Clock Out (Flutter)
**Endpoint:** `POST /api/attendance/clock-out`  
**Access:** User only

**Request Body:**
```json
{
  "attendanceId": "507f1f77bcf86cd799439022",
  "latitude": 1.2966,
  "longitude": 103.8525
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Clocked out successfully",
  "attendance": {
    "_id": "507f1f77bcf86cd799439022",
    "clockOutTime": "2024-12-25T17:00:00Z",
    "totalHours": 8
  }
}
```

---

### 10.3 Get User Attendance (Flutter)
**Endpoint:** `GET /api/user/attendance`  
**Access:** User only

**Query Parameters:**
- `page`, `limit`, `jobId`, `date`

**Success Response (200):**
```json
{
  "success": true,
  "attendance": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "jobId": "507f1f77bcf86cd799439012",
      "job": {
        "jobName": "Waiter"
      },
      "shiftId": "507f1f77bcf86cd799439013",
      "clockInTime": "2024-12-25T09:00:00Z",
      "clockOutTime": "2024-12-25T17:00:00Z",
      "totalHours": 8,
      "status": "completed"
    }
  ],
  "pagination": {...}
}
```

---

### 10.4 Get All Attendance Records (Admin)
**Endpoint:** `GET /api/admin/attendance`  
**Access:** Admin only

**Query Parameters:**
- `page`, `limit`, `jobId`, `userId`, `date`

**Success Response (200):**
```json
{
  "success": true,
  "attendance": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "userId": "507f1f77bcf86cd799439011",
      "user": {
        "fullName": "John Doe"
      },
      "jobId": "507f1f77bcf86cd799439012",
      "job": {
        "jobName": "Waiter"
      },
      "shiftId": "507f1f77bcf86cd799439013",
      "clockInTime": "2024-12-25T09:00:00Z",
      "clockOutTime": "2024-12-25T17:00:00Z",
      "totalHours": 8,
      "status": "completed"
    }
  ],
  "pagination": {...}
}
```

---

### 10.5 Update Attendance (Admin)
**Endpoint:** `PUT /api/admin/attendance/:attendanceId`  
**Access:** Admin only

**Request Body:**
```json
{
  "clockInTime": "2024-12-25T09:00:00Z",
  "clockOutTime": "2024-12-25T17:00:00Z",
  "notes": "Manual adjustment"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Attendance updated successfully",
  "attendance": {...}
}
```

---

## 11. Notification Management

### 11.1 Get All Notifications (Admin)
**Endpoint:** `GET /api/admin/notifications`  
**Access:** Admin only

**Query Parameters:**
- `page`, `limit`, `userId`, `type`

**Success Response (200):**
```json
{
  "success": true,
  "notifications": [...],
  "pagination": {...}
}
```

---

### 11.2 Send Notification (Admin)
**Endpoint:** `POST /api/admin/notifications/send`  
**Access:** Admin only

**Request Body:**
```json
{
  "recipientType": "all" | "user" | "employer",
  "userId": "string (required if recipientType is 'user')",
  "employerId": "string (required if recipientType is 'employer')",
  "type": "System" | "Payment" | "Job" | "Application",
  "title": "string (required)",
  "message": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "notificationId": "507f1f77bcf86cd799439020"
}
```

---

### 11.3 Get User Notifications (Flutter)
**Endpoint:** `GET /api/user/notifications`  
**Access:** User only

**Query Parameters:**
- `page`, `limit`, `read`

**Success Response (200):**
```json
{
  "success": true,
  "notifications": [...],
  "pagination": {...}
}
```

---

### 11.4 Mark Notification as Read (Flutter)
**Endpoint:** `PUT /api/user/notifications/:notificationId/read`  
**Access:** User only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 11.5 Mark All Notifications as Read (Flutter)
**Endpoint:** `PUT /api/user/notifications/read-all`  
**Access:** User only

**Success Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### 11.6 Mark Notification as Read (Admin)
**Endpoint:** `PUT /api/admin/notifications/:notificationId/read`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 11.7 Mark All Notifications as Read (Admin)
**Endpoint:** `PUT /api/admin/notifications/read-all`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 12. QR Code Management

### 12.1 Generate QR Code for Employer-Outlet
**Endpoint:** `POST /api/admin/qr-codes/generate`  
**Access:** Admin only

**Request Body:**
```json
{
  "employerId": "string (required)",
  "outletId": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "qrCode": {
    "_id": "string",
    "qrCodeId": "A-1",
    "employerId": "string",
    "outletId": "string",
    "qrData": "JSON string containing employer and outlet info",
    "status": "Active",
    "generatedAt": "ISO date string"
  }
}
```

---

### 12.2 Get All QR Codes
**Endpoint:** `GET /api/admin/qr-codes`  
**Access:** Admin only

**Query Parameters:**
- `employerId` (optional): Filter by employer
- `outletId` (optional): Filter by outlet
- `status` (optional): Filter by status (Active/Inactive)

**Success Response (200):**
```json
{
  "success": true,
  "qrCodes": [
    {
      "_id": "string",
      "qrCodeId": "A-1",
      "employerId": "string",
      "employer": {
        "_id": "string",
        "companyLegalName": "string",
        "logo": "string"
      },
      "outletId": "string",
      "outlet": {
        "_id": "string",
        "outletName": "string",
        "outletAddress": "string"
      },
      "status": "Active",
      "generatedAt": "ISO date string"
    }
  ]
}
```

---

### 12.3 Delete QR Code
**Endpoint:** `DELETE /api/admin/qr-codes/:qrCodeId`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "message": "QR code deleted successfully"
}
```

---

### 12.4 Scan QR Code (Flutter)
**Endpoint:** `POST /api/qr/scan`  
**Access:** User only

**Request Body:**
```json
{
  "qrCode": "JOB-1234-SHIFT-5678",
  "latitude": 1.2966,
  "longitude": 103.8525
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "QR code scanned successfully",
  "job": {...},
  "shift": {...}
}
```

---

## 13. Timesheet Management

### 13.1 Generate Timesheet
**Endpoint:** `POST /api/admin/timesheets/generate`  
**Access:** Admin only

**Request Body:**
```json
{
  "jobId": "string (required)",
  "date": "ISO date string (required)",
  "autoEmail": "boolean (optional, default: true)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Timesheet generated and email sent successfully",
  "timesheet": {
    "_id": "string",
    "jobId": "string",
    "jobTitle": "string",
    "employerId": "string",
    "employerName": "string",
    "shiftDate": "ISO date string",
    "type": "Before Shift" | "After Shift",
    "status": "Sent" | "Pending",
    "generatedAt": "ISO date string",
    "emailSentAt": "ISO date string (if autoEmail was true)"
  }
}
```

---

### 13.2 Get All Timesheets
**Endpoint:** `GET /api/admin/timesheets`  
**Access:** Admin only

**Query Parameters:**
- `jobId` (optional): Filter by job
- `status` (optional): Filter by status
- `type` (optional): Filter by type

**Success Response (200):**
```json
{
  "success": true,
  "timesheets": [
    {
      "_id": "string",
      "jobId": "string",
      "jobTitle": "string",
      "employerId": "string",
      "employerName": "string",
      "shiftDate": "ISO date string",
      "type": "Before Shift",
      "status": "Sent",
      "generatedAt": "ISO date string",
      "emailSentAt": "ISO date string"
    }
  ]
}
```

---

### 13.3 Send Timesheet Email
**Endpoint:** `POST /api/admin/timesheets/:timesheetId/send-email`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

---

### 13.4 Download Timesheet
**Endpoint:** `GET /api/admin/timesheets/:timesheetId/download`  
**Access:** Admin only

**Query Parameters:**
- `format`: "pdf" | "excel"

**Response:** File download (PDF or Excel)

---

## 14. Reports & Analytics

### 14.1 Generate Report (Admin)
**Endpoint:** `POST /api/admin/reports/generate`  
**Access:** Admin only

**Request Body:**
```json
{
  "reportType": "applications",
  "format": "pdf",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "filters": {
    "status": "approved",
    "employerId": "507f1f77bcf86cd799439012"
  }
}
```

**Report Types:** "applications", "jobs", "users", "revenue"  
**Formats:** "pdf", "excel", "csv"

**Success Response (200):**
```json
{
  "success": true,
  "message": "Report generated successfully",
  "reportUrl": "https://worklah.onrender.com/reports/report-123456.pdf",
  "reportId": "507f1f77bcf86cd799439025"
}
```

---

### 14.2 Get Sales Report (Admin)
**Endpoint:** `GET /api/admin/sales-report`  
**Access:** Admin only

**Query Parameters:**
- `startDate`, `endDate`, `employerId`

**Success Response (200):**
```json
{
  "success": true,
  "report": {
    "period": "string",
    "totalRevenue": 50000,
    "totalJobsPosted": 100,
    "totalJobsFulfilled": 85,
    "hoursFulfilled": 1000
  }
}
```

---

### 14.3 Get Invoice Report (Admin)
**Endpoint:** `GET /api/admin/invoice-report`  
**Access:** Admin only

**Query Parameters:**
- `employerId` (optional)
- `invoicePeriod` (optional)
- `format` (optional): "json" | "pdf" | "excel"

**Success Response (200):**
```json
{
  "success": true,
  "invoices": [
    {
      "id": "string",
      "employer": {
        "name": "string",
        "logo": "string"
      },
      "invoicePeriod": "string",
      "jobsPosted": 10,
      "jobsFulfilled": 8,
      "fulfillmentRate": 80,
      "numberOfOutlets": 5,
      "hoursFulfilled": 160,
      "totalHours": 200,
      "subtotal": 8000,
      "gst": 560,
      "total": 8560
    }
  ]
}
```

---

### 14.4 Get Service Report (Admin)
**Endpoint:** `GET /api/admin/service-report`  
**Access:** Admin only

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)
- `format` (optional): "json" | "pdf" | "excel"

**Success Response (200):**
```json
{
  "success": true,
  "report": {
    "period": "string",
    "jobs": [
      {
        "jobId": "string",
        "jobRole": "string",
        "scheduledShifts": 10,
        "completedShifts": 8,
        "outletAddress": "string",
        "workersAssigned": 5,
        "headcountAttendance": 80,
        "hoursWorked": 160
      }
    ]
  }
}
```

---

## 15. Settings & Configuration

### 15.1 Get System Settings
**Endpoint:** `GET /api/admin/settings`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "settings": {
    "platformName": "WorkLah",
    "platformLogo": "https://worklah.onrender.com/uploads/logo.png",
    "supportEmail": "support@worklah.com",
    "supportPhone": "+6512345678",
    "otpExpiry": 60,
    "tokenExpiry": 604800,
    "minCashoutAmount": 10.00,
    "cashoutFee": 0.60,
    "penaltyRules": {
      "24Hours": 5.00,
      "12Hours": 10.00,
      "NoShow": 50.00
    }
  }
}
```

---

### 15.2 Update System Settings
**Endpoint:** `PUT /api/admin/settings`  
**Access:** Admin only

**Request Body:**
```json
{
  "supportEmail": "support@worklah.com",
  "supportPhone": "+6512345678",
  "otpExpiry": 60,
  "minCashoutAmount": 10.00
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": {...}
}
```

---

### 15.3 Get Rate Configuration
**Endpoint:** `GET /api/admin/rate-configuration`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "rateTypes": ["Hourly", "Weekly", "Monthly"],
  "defaultPayRates": {
    "Hourly": 12.50,
    "Weekly": 500.00,
    "Monthly": 2000.00
  }
}
```

---

### 15.4 Get Penalties Configuration
**Endpoint:** `GET /api/admin/penalties`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "penalties": [
    {
      "condition": "24 hours before shift",
      "penalty": "5.00"
    },
    {
      "condition": "12 hours before shift",
      "penalty": "10.00"
    },
    {
      "condition": "No show",
      "penalty": "50.00"
    }
  ]
}
```

---

### 15.5 Get Schools List
**Endpoint:** `GET /api/admin/schools`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "schools": [
    {
      "_id": "...",
      "name": "National University of Singapore",
      "code": "NUS"
    },
    {
      "_id": "...",
      "name": "Nanyang Technological University",
      "code": "NTU"
    }
  ]
}
```

---

### 15.6 Get Postal Code Info
**Endpoint:** `GET /api/admin/postal-code/:postalCode`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "postalCode": "123456",
  "address": "123 Main Street",
  "area": "Central",
  "district": "01"
}
```

---

### 15.7 Get Admin Profile Image
**Endpoint:** `GET /api/admin/profile/image`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "imageUrl": "https://worklah.onrender.com/uploads/admin-profile.jpg"
}
```

---

## 16. Support & Feedback

### 16.1 Submit Support Feedback
**Endpoint:** `POST /api/support/feedback`  
**Access:** Public/User

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "subject": "Issue with payment",
  "message": "I'm having trouble with cashout..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "feedbackId": "507f1f77bcf86cd799439030"
}
```

---

## 📝 **Implementation Notes for Backend**

### 1. Admin Role Verification
**CRITICAL:** All admin endpoints must verify:
```javascript
if (req.user.role !== 'ADMIN') {
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin privileges required.',
    error: 'Forbidden'
  });
}
```

### 2. Response Format
**CRITICAL:** All responses must include `success` field:
```json
{
  "success": true,
  "data": {...}
}
```

### 3. Pagination
Always return pagination metadata for list endpoints:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

### 4. Image URLs
Always return full URLs:
```javascript
const baseUrl = process.env.BASE_URL || 'https://worklah.onrender.com';
const imageUrl = `${baseUrl}${imagePath}`;
```

### 5. Error Handling
All errors should return:
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "ErrorType"
}
```

### 6. Token Management
- **Admin tokens:** 7 days expiry (604800 seconds)
- **User tokens:** 7 days expiry (604800 seconds)
- **Storage:** React panel uses localStorage + cookies
- **Flutter app:** Uses secure storage

### 7. Job Creation Validation
**CRITICAL:** When creating a job (`POST /api/admin/jobs`):
```javascript
// Validate employer exists
const employer = await Employer.findById(req.body.employerId);
if (!employer) {
  return res.status(400).json({
    success: false,
    message: "Invalid employer ID",
    error: "EmployerNotFound"
  });
}

// Validate outlet belongs to employer
const outlet = employer.outlets.find(
  o => o._id.toString() === req.body.outletId
);
if (!outlet) {
  return res.status(400).json({
    success: false,
    message: "Outlet does not belong to the selected employer",
    error: "InvalidOutlet"
  });
}
```

### 8. Employer Response Format
**CRITICAL:** `GET /api/admin/employers` MUST include outlets:
```javascript
const employers = await Employer.find().populate('outlets');
// Ensure outlets array is included in response
```

---

## 🚀 **Deployment Checklist**

### Backend:
- [ ] All 100+ endpoints implemented
- [ ] All responses include `success` field
- [ ] All image URLs are full URLs
- [ ] Role-based access control implemented
- [ ] Admin endpoints verify `role: "ADMIN"`
- [ ] User endpoints verify `role: "USER"`
- [ ] **CRITICAL: Employer → Job workflow validation**
  - [ ] `POST /api/admin/jobs` validates `employerId` exists
  - [ ] `POST /api/admin/jobs` validates `outletId` belongs to employer
  - [ ] `GET /api/admin/employers` includes outlets in response
  - [ ] Error messages are clear when validation fails
- [ ] CORS configured correctly
- [ ] Error handling implemented
- [ ] Pagination implemented on all list endpoints
- [ ] All endpoints tested

### React Admin Panel:
- [x] All authentication endpoints updated
- [x] All employer endpoints updated
- [x] All job endpoints updated
- [x] Dashboard endpoint updated
- [x] API base URL supports environment variables
- [x] Response handling checks `success` field
- [ ] All features tested
- [ ] Ready for deployment

### Flutter App:
- [ ] API base URL configured
- [ ] All endpoints match this documentation
- [ ] Response handling checks `success` field
- [ ] All features tested
- [ ] Ready for deployment

---

## 📞 **Support**

For questions or clarifications:
- Review this `BACKEND.md` file for complete endpoint specifications
- Review `TITAN.md` for project overview
- Review `ADMIN_PANEL.md` for React admin panel details
- Test endpoints using Postman collection

---

## 📊 **Endpoint Summary**

### Admin Endpoints (React.js):
- Authentication: 3 endpoints
- Dashboard: 2 endpoints
- Jobs: 12 endpoints
- Applications: 7 endpoints
- Users: 10 endpoints
- Employers: 5 endpoints
- Outlets: 5 endpoints
- Payments/Transactions: 13 endpoints
- Attendance: 5 endpoints
- Notifications: 7 endpoints
- QR Codes: 4 endpoints
- Timesheets: 4 endpoints
- Reports: 4 endpoints
- Settings: 7 endpoints
- Support: 1 endpoint

**Total Admin Endpoints: ~100+**

### User Endpoints (Flutter):
- Authentication: 5 endpoints
- Jobs: 5 endpoints
- Wallet/Transactions: 4 endpoints
- Attendance: 3 endpoints
- Notifications: 3 endpoints
- QR Code: 1 endpoint

**Total User Endpoints: ~21**

---

**END OF BACKEND API DOCUMENTATION**

**Document Status:** ✅ **READY FOR BACKEND DEVELOPMENT**  
**Last Updated:** January 2025  
**Version:** 2.0.0

**📌 Share this file (`src/backend.md`) with your backend developer.**