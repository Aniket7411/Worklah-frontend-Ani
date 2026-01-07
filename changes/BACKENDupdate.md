# WorkLah Backend API Documentation

**Document Version:** 1.0.0  
**Last Updated:** January 2025  
**Purpose:** Complete backend API specification for WorkLah platform  
**Backend:** Node.js/Express  
**Frontend:** React.js (Admin Panel) + Flutter (Mobile App)

---

## 🎯 **IMPORTANT: READ THIS FIRST**

This document contains **ALL API endpoints** required for the WorkLah platform, including:
- **Admin Panel Endpoints** (React.js) - All endpoints prefixed with `/api/admin/`
- **Mobile App Endpoints** (Flutter) - All endpoints prefixed with `/api/` (NOT `/api/admin/`)
- **Shared Endpoints** - Used by both admin and mobile app

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

## 📋 **Table of Contents**

1. [Admin Authentication Endpoints](#admin-authentication-endpoints)
2. [User Authentication Endpoints (Flutter)](#user-authentication-endpoints-flutter)
3. [Dashboard & Analytics](#dashboard--analytics)
4. [Job Management](#job-management)
5. [Application Management](#application-management)
6. [User Management](#user-management)
7. [Employer Management](#employer-management)
8. [Outlet Management](#outlet-management)
9. [Payment & Wallet Management](#payment--wallet-management)
10. [Attendance Management](#attendance-management)
11. [Notification Management](#notification-management)
12. [QR Code Management](#qr-code-management)
13. [Reports & Analytics](#reports--analytics)
14. [Settings & Configuration](#settings--configuration)
15. [Support & Feedback](#support--feedback)

---

## 🔐 **Admin Authentication Endpoints**

### 1. Admin Login
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

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "AuthenticationError"
}
```

---

### 2. Get Current Admin
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

### 3. Admin Logout
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

## 📱 **User Authentication Endpoints (Flutter)**

### 4. User Login (OTP-based)
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

### 5. Verify OTP
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

### 6. Get Current User
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

### 7. User Logout
**Endpoint:** `POST /api/user/logout`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 8. Forgot Password
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

## 📊 **Dashboard & Analytics**

### 9. Get Dashboard Statistics
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

### 10. Get Dashboard Charts Data
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

## 💼 **Job Management**

### 11. Get All Jobs (Admin)
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

### 12. Get Single Job (Admin)
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
    "shifts": [...],
    "applications": [...],
    "createdAt": "2024-12-20T10:00:00Z"
  }
}
```

---

### 13. Create Job
**Endpoint:** `POST /api/admin/jobs`  
**Access:** Admin only

**⚠️ CRITICAL:** Job creation requires a valid `employerId` and `outletId` that belongs to the employer.

**Request Body:**
```json
{
  "jobName": "Waiter",
  "jobDescription": "Serve customers...",
  "jobRequirements": "Customer service skills",
  "jobDate": "2024-12-25",
  "employerId": "507f1f77bcf86cd799439012",
  "outletId": "507f1f77bcf86cd799439013",
  "industry": "Hospitality",
  "location": "123 Main Street",
  "shifts": [
    {
      "startTime": "09:00",
      "endTime": "17:00",
      "duration": 8,
      "breakDuration": 1,
      "breakType": "Paid",
      "rateType": "Weekday",
      "payRate": 12.5,
      "vacancy": 5,
      "standbyVacancy": 2
    }
  ],
  "dressCode": "Uniform provided",
  "skills": ["Customer service"],
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

### 14. Update Job
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

### 15. Delete Job
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

### 16. Update Job Status
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

### 17. Get Jobs (User-facing - Flutter)
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

### 18. Get Single Job (User-facing - Flutter)
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

### 19. Apply for Job (Flutter)
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

### 20. Cancel Application (Flutter)
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

### 21. Get User Jobs (Flutter)
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

## 📝 **Application Management**

### 22. Get All Applications (Admin)
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

### 23. Get Single Application (Admin)
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

### 24. Approve Application
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

### 25. Reject Application
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

### 26. Bulk Approve/Reject Applications
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

### 27. Get Job Candidates
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

### 28. Update Application Status
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

## 👥 **User Management**

### 29. Get All Users (Admin)
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

### 30. Get Single User (Admin)
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

### 31. Update User Status
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

### 32. Get User Applications
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

### 33. Get User Transactions
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

### 34. Get All Candidates (Admin)
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

### 35. Get Single Candidate
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

### 36. Update Candidate
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

### 37. Delete Candidate
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

## 🏢 **Employer Management**

### 38. Get All Employers
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

### 39. Get Single Employer
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

### 40. Create Employer
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

### 41. Update Employer
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

### 42. Delete Employer
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

## 🏪 **Outlet Management**

### 43. Get All Outlets
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

### 44. Get Single Outlet
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

### 45. Create Outlet
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

### 46. Get Outlet Attendance Chart
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

### 47. Get Outlet Attendance
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

## 💰 **Payment & Wallet Management**

### 48. Get All Transactions (Admin)
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

### 49. Process Cashout Request
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

### 50. Reject Cashout Request
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

### 51. Create Cashout Request
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

### 52. Get User Wallet (Flutter)
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

### 53. Get User Transactions (Flutter)
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

### 54. Request Cashout (Flutter)
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

### 55. Get Cashout History (Flutter)
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

## ⏰ **Attendance Management**

### 56. Clock In (Flutter)
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

### 57. Clock Out (Flutter)
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

### 58. Get User Attendance (Flutter)
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

### 59. Get All Attendance Records (Admin)
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

### 60. Update Attendance (Admin)
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

## 📱 **Notification Management**

### 61. Get All Notifications (Admin)
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

### 62. Send Notification (Admin)
**Endpoint:** `POST /api/admin/notifications/send`  
**Access:** Admin only

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "type": "System",
  "title": "System Maintenance",
  "message": "The system will be under maintenance on Dec 25, 2024"
}
```

**Note:** If `userId` is null, send to all users

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "notificationId": "507f1f77bcf86cd799439020"
}
```

---

### 63. Get User Notifications (Flutter)
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

### 64. Mark Notification as Read (Flutter)
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

### 65. Mark All Notifications as Read (Flutter)
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

## 🔲 **QR Code Management**

### 66. Get Jobs for QR Code (Admin)
**Endpoint:** `GET /api/admin/jobs?limit=100&status=Active,Upcoming`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [...],
  "pagination": {...}
}
```

---

### 67. Scan QR Code (Flutter)
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

## 📊 **Reports & Analytics**

### 68. Generate Report (Admin)
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

### 69. Get Sales Report (Admin)
**Endpoint:** `GET /api/admin/sales-report`  
**Access:** Admin only

**Query Parameters:**
- `startDate`, `endDate`, `employerId`

**Success Response (200):**
```json
{
  "success": true,
  "report": {
    "totalSales": 125000.50,
    "totalTransactions": 500,
    "byEmployer": [...],
    "byDate": [...]
  }
}
```

---

### 70. Get Invoice Report (Admin)
**Endpoint:** `GET /api/admin/invoice-report`  
**Access:** Admin only

**Query Parameters:**
- `startDate`, `endDate`, `employerId`

**Success Response (200):**
```json
{
  "success": true,
  "report": {
    "totalInvoices": 50,
    "totalAmount": 125000.50,
    "invoices": [...]
  }
}
```

---

### 71. Get Service Report (Admin)
**Endpoint:** `GET /api/admin/service-report`  
**Access:** Admin only

**Query Parameters:**
- `startDate`, `endDate`

**Success Response (200):**
```json
{
  "success": true,
  "report": {
    "totalServices": 200,
    "completedServices": 180,
    "pendingServices": 20,
    "byServiceType": [...]
  }
}
```

---

### 72. Get Deployment Tracking
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

## ⚙️ **Settings & Configuration**

### 73. Get System Settings
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

### 74. Update System Settings
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

### 75. Get Rate Configuration
**Endpoint:** `GET /api/admin/rate-configuration`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "rateTypes": ["Weekday", "Weekend", "Public Holiday"],
  "defaultPayRates": {
    "Weekday": 12.50,
    "Weekend": 15.00,
    "Public Holiday": 18.00
  }
}
```

---

### 76. Get Penalties Configuration
**Endpoint:** `GET /api/admin/penalties`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "penalties": {
    "24Hours": 5.00,
    "12Hours": 10.00,
    "NoShow": 50.00
  }
}
```

---

### 77. Get Schools List
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
    }
  ]
}
```

---

### 78. Get Postal Code Info
**Endpoint:** `GET /api/admin/postal-code/:postalCode`  
**Access:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "postalCode": "123456",
  "address": "123 Main Street",
  "area": "Central"
}
```

---

### 79. Get Admin Profile Image
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

## 💬 **Support & Feedback**

### 80. Submit Support Feedback
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
   - Can edit employers and their outlets
   - Can edit jobs and change employer/outlet
```

**Backend MUST enforce:**
- ✅ Jobs require valid `employerId`
- ✅ Jobs require valid `outletId` that belongs to the employer
- ✅ Return clear error if employer/outlet validation fails
- ✅ `GET /api/admin/employers` MUST include `outlets` array in response

---

## 📝 **Implementation Notes**

### 1. Role-Based Access Control
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

### 3. Image URLs
Always return full URLs:
```javascript
const baseUrl = process.env.BASE_URL || 'https://worklah.onrender.com';
const imageUrl = `${baseUrl}${imagePath}`;
```

### 4. Pagination
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

---

## 🚀 **Deployment Checklist**

### Backend:
- [ ] All 80+ endpoints implemented
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

---

## 📞 **Support**

For questions or clarifications:
- Review `ADMIN_PANEL.md` for React admin panel endpoints
- Review `TITAN.md` for project overview
- Test endpoints using Postman collection

---

**END OF BACKEND API DOCUMENTATION**

**Document Status:** ✅ **READY FOR BACKEND DEVELOPMENT**  
**Last Updated:** January 2025  
**Version:** 1.0.0

