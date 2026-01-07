# WorkLah Admin Panel - React.js Documentation

**Document Version:** 1.0.0  
**Last Updated:** January 2025  
**Purpose:** Complete specification for React.js Admin Panel  
**Backend:** Node.js  
**Frontend:** React.js (Admin-facing)

---

## 🎯 **IMPORTANT: READ THIS FIRST**

This document contains **ALL requirements** for the React.js Admin Panel. The admin panel is used by administrators to manage the WorkLah platform, including jobs, users, applications, payments, and more.

### ⚠️ **CRITICAL REQUIREMENTS**

1. **Admin Authentication:**
   - Admin login with email/password (different from user OTP login)
   - Admin role verification on all endpoints
   - Admin token separate from user token

2. **All responses MUST include a `success` field** (boolean)
   - Success: `{ "success": true, ... }`
   - Error: `{ "success": false, "message": "...", ... }`

3. **Role-Based Access:**
   - Only users with `role: "ADMIN"` can access admin endpoints
   - Return `403 Forbidden` for non-admin users

4. **Image URLs:**
   - Always return full URLs for images
   - Base URL: `https://worklah.onrender.com` or your server URL

---

## 📋 **Table of Contents**

1. [Admin Authentication](#admin-authentication)
2. [Dashboard & Analytics](#dashboard--analytics)
3. [Job Management](#job-management)
4. [Application Management](#application-management)
5. [User Management](#user-management)
6. [Employer Management](#employer-management)
7. [Outlet Management](#outlet-management)
8. [Payment & Wallet Management](#payment--wallet-management)
9. [Notification Management](#notification-management)
10. [Attendance Management](#attendance-management)
11. [Reports & Analytics](#reports--analytics)
12. [Settings & Configuration](#settings--configuration)

---

## Admin Authentication

### 1. Admin Login

**Endpoint:** `POST /api/admin/login`

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

### 2. Admin Logout

**Endpoint:** `POST /api/admin/logout`

**Headers:** `Authorization: Bearer {adminToken}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 3. Get Current Admin

**Endpoint:** `GET /api/admin/me`

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

## Dashboard & Analytics

### 4. Get Dashboard Statistics

**Endpoint:** `GET /api/admin/dashboard/stats`

**Headers:** `Authorization: Bearer {adminToken}`

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

### 5. Get Dashboard Charts Data

**Endpoint:** `GET /api/admin/dashboard/charts`

**Headers:** `Authorization: Bearer {adminToken}`

**Query Parameters:**
- `period` (optional, string): "daily", "weekly", "monthly", "yearly" (default: "monthly")
- `startDate` (optional, string): YYYY-MM-DD
- `endDate` (optional, string): YYYY-MM-DD

**Success Response (200):**
```json
{
  "success": true,
  "charts": {
    "applicationsOverTime": [
      { "date": "2024-12-01", "count": 50 },
      { "date": "2024-12-02", "count": 65 },
      { "date": "2024-12-03", "count": 45 }
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

## Job Management

### 6. Get All Jobs (Admin)

**Endpoint:** `GET /api/admin/jobs`

**Headers:** `Authorization: Bearer {adminToken}`

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 20)
- `status` (optional, string): Filter by status
- `search` (optional, string): Search in job title/description
- `employerId` (optional, string): Filter by employer
- `startDate` (optional, string): YYYY-MM-DD
- `endDate` (optional, string): YYYY-MM-DD

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
        "companyLegalName": "ABC Restaurant"
      },
      "outlet": {
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

### 7. Get Single Job (Admin)

**Endpoint:** `GET /api/admin/jobs/:jobId`

**Headers:** `Authorization: Bearer {adminToken}`

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
    "applications": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "userId": "507f1f77bcf86cd799439011",
        "user": {
          "fullName": "John Doe",
          "phoneNumber": "+6512345678"
        },
        "status": "Pending",
        "adminStatus": "Pending",
        "appliedAt": "2024-12-22T10:00:00Z"
      }
    ],
    "createdAt": "2024-12-20T10:00:00Z",
    "updatedAt": "2024-12-22T10:00:00Z"
  }
}
```

---

### 8. Create Job

**Endpoint:** `POST /api/admin/jobs`

**Headers:** `Authorization: Bearer {adminToken}`

**Content-Type:** `multipart/form-data` (if uploading images)

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

### 9. Update Job

**Endpoint:** `PUT /api/admin/jobs/:jobId`

**Headers:** `Authorization: Bearer {adminToken}`

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

### 10. Delete Job

**Endpoint:** `DELETE /api/admin/jobs/:jobId`

**Headers:** `Authorization: Bearer {adminToken}`

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

### 11. Update Job Status

**Endpoint:** `PATCH /api/admin/jobs/:jobId/status`

**Headers:** `Authorization: Bearer {adminToken}`

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

## Application Management

### 12. Get All Applications

**Endpoint:** `GET /api/admin/applications`

**Headers:** `Authorization: Bearer {adminToken}`

**Query Parameters:**
- `page` (optional, number): Page number
- `limit` (optional, number): Items per page
- `status` (optional, string): Filter by status (Pending, Approved, Rejected)
- `jobId` (optional, string): Filter by job
- `userId` (optional, string): Filter by user
- `startDate` (optional, string): YYYY-MM-DD
- `endDate` (optional, string): YYYY-MM-DD

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

### 13. Get Single Application

**Endpoint:** `GET /api/admin/applications/:applicationId`

**Headers:** `Authorization: Bearer {adminToken}`

**Success Response (200):**
```json
{
  "success": true,
  "application": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "user": {
      "fullName": "John Doe",
      "email": "user@example.com",
      "phoneNumber": "+6512345678",
      "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg",
      "profileCompleted": true
    },
    "job": {...},
    "shift": {...},
    "status": "Pending",
    "adminStatus": "Pending",
    "appliedAt": "2024-12-22T10:00:00Z",
    "adminNotes": ""
  }
}
```

---

### 14. Approve Application

**Endpoint:** `POST /api/admin/applications/:applicationId/approve`

**Headers:** `Authorization: Bearer {adminToken}`

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

### 15. Reject Application

**Endpoint:** `POST /api/admin/applications/:applicationId/reject`

**Headers:** `Authorization: Bearer {adminToken}`

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

**Notes:**
- Automatically create notification for user
- Release job vacancy
- Send rejection email/SMS (if configured)

---

### 16. Bulk Approve/Reject Applications

**Endpoint:** `POST /api/admin/applications/bulk-action`

**Headers:** `Authorization: Bearer {adminToken}`

**Request Body:**
```json
{
  "action": "approve", // or "reject"
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

## User Management

### 17. Get All Users

**Endpoint:** `GET /api/admin/users`

**Headers:** `Authorization: Bearer {adminToken}`

**Query Parameters:**
- `page` (optional, number): Page number
- `limit` (optional, number): Items per page
- `search` (optional, string): Search by name, email, phone
- `role` (optional, string): Filter by role
- `profileCompleted` (optional, boolean): Filter by profile completion
- `status` (optional, string): Filter by status (active, suspended, banned)

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

### 18. Get Single User

**Endpoint:** `GET /api/admin/users/:userId`

**Headers:** `Authorization: Bearer {adminToken}`

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

### 19. Update User Status

**Endpoint:** `PATCH /api/admin/users/:userId/status`

**Headers:** `Authorization: Bearer {adminToken}`

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

### 20. Get User Applications

**Endpoint:** `GET /api/admin/users/:userId/applications`

**Headers:** `Authorization: Bearer {adminToken}`

**Success Response (200):**
```json
{
  "success": true,
  "applications": [...],
  "pagination": {...}
}
```

---

### 21. Get User Transactions

**Endpoint:** `GET /api/admin/users/:userId/transactions`

**Headers:** `Authorization: Bearer {adminToken}`

**Success Response (200):**
```json
{
  "success": true,
  "transactions": [...],
  "pagination": {...}
}
```

---

## Employer Management

### 22. Get All Employers

**Endpoint:** `GET /api/admin/employers`

**Headers:** `Authorization: Bearer {adminToken}`

**Query Parameters:**
- `page` (optional, number): Page number
- `limit` (optional, number): Items per page
- `search` (optional, string): Search by company name

**Success Response (200):**
```json
{
  "success": true,
  "employers": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "companyLegalName": "ABC Restaurant Pte Ltd",
      "companyLogo": "https://worklah.onrender.com/uploads/logo.png",
      "accountManager": "John Manager",
      "email": "contact@abcrestaurant.com",
      "phoneNumber": "+6512345678",
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

### 23. Get Single Employer

**Endpoint:** `GET /api/admin/employers/:employerId`

**Headers:** `Authorization: Bearer {adminToken}`

**Success Response (200):**
```json
{
  "success": true,
  "employer": {
    "_id": "507f1f77bcf86cd799439012",
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

### 24. Create Employer

**Endpoint:** `POST /api/admin/employers`

**Headers:** `Authorization: Bearer {adminToken}`

**Content-Type:** `multipart/form-data` (if uploading logo)

**Request Body:**
```json
{
  "companyLegalName": "ABC Restaurant Pte Ltd",
  "accountManager": "John Manager",
  "email": "contact@abcrestaurant.com",
  "phoneNumber": "+6512345678",
  "address": "123 Main Street"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Employer created successfully",
  "employer": {...}
}
```

---

### 25. Update Employer

**Endpoint:** `PUT /api/admin/employers/:employerId`

**Headers:** `Authorization: Bearer {adminToken}`

**Request Body:** (Same as Create Employer)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employer updated successfully",
  "employer": {...}
}
```

---

## Outlet Management

### 26. Get All Outlets

**Endpoint:** `GET /api/admin/outlets`

**Headers:** `Authorization: Bearer {adminToken}`

**Query Parameters:**
- `page` (optional, number): Page number
- `limit` (optional, number): Items per page
- `employerId` (optional, string): Filter by employer
- `search` (optional, string): Search by outlet name

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

### 27. Create Outlet

**Endpoint:** `POST /api/admin/outlets`

**Headers:** `Authorization: Bearer {adminToken}`

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

## Payment & Wallet Management

### 28. Get All Transactions

**Endpoint:** `GET /api/admin/transactions`

**Headers:** `Authorization: Bearer {adminToken}`

**Query Parameters:**
- `page` (optional, number): Page number
- `limit` (optional, number): Items per page
- `type` (optional, string): Filter by type (credit, debit)
- `status` (optional, string): Filter by status (pending, completed, failed)
- `userId` (optional, string): Filter by user
- `startDate` (optional, string): YYYY-MM-DD
- `endDate` (optional, string): YYYY-MM-DD

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

### 29. Process Cashout Request

**Endpoint:** `POST /api/admin/cashout/:transactionId/process`

**Headers:** `Authorization: Bearer {adminToken}`

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

### 30. Reject Cashout Request

**Endpoint:** `POST /api/admin/cashout/:transactionId/reject`

**Headers:** `Authorization: Bearer {adminToken}`

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

## Notification Management

### 31. Get All Notifications

**Endpoint:** `GET /api/admin/notifications`

**Headers:** `Authorization: Bearer {adminToken}`

**Query Parameters:**
- `page` (optional, number): Page number
- `limit` (optional, number): Items per page
- `userId` (optional, string): Filter by user
- `type` (optional, string): Filter by type

**Success Response (200):**
```json
{
  "success": true,
  "notifications": [...],
  "pagination": {...}
}
```

---

### 32. Send Notification

**Endpoint:** `POST /api/admin/notifications/send`

**Headers:** `Authorization: Bearer {adminToken}`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011", // Optional, if null, send to all users
  "type": "System",
  "title": "System Maintenance",
  "message": "The system will be under maintenance on Dec 25, 2024"
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

## Attendance Management

### 33. Get All Attendance Records

**Endpoint:** `GET /api/admin/attendance`

**Headers:** `Authorization: Bearer {adminToken}`

**Query Parameters:**
- `page` (optional, number): Page number
- `limit` (optional, number): Items per page
- `jobId` (optional, string): Filter by job
- `userId` (optional, string): Filter by user
- `date` (optional, string): YYYY-MM-DD

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

### 34. Update Attendance

**Endpoint:** `PUT /api/admin/attendance/:attendanceId`

**Headers:** `Authorization: Bearer {adminToken}`

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

## Reports & Analytics

### 35. Generate Report

**Endpoint:** `POST /api/admin/reports/generate`

**Headers:** `Authorization: Bearer {adminToken}`

**Request Body:**
```json
{
  "reportType": "applications", // "applications", "jobs", "users", "revenue"
  "format": "pdf", // "pdf", "excel", "csv"
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "filters": {
    "status": "approved",
    "employerId": "507f1f77bcf86cd799439012"
  }
}
```

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

## Settings & Configuration

### 36. Get System Settings

**Endpoint:** `GET /api/admin/settings`

**Headers:** `Authorization: Bearer {adminToken}`

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

### 37. Update System Settings

**Endpoint:** `PUT /api/admin/settings`

**Headers:** `Authorization: Bearer {adminToken}`

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

## 🔧 **Implementation Notes for Backend**

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
    "itemsPerPage": 10
  }
}
```

### 4. Image URLs
Always return full URLs:
```javascript
const baseUrl = 'https://worklah.onrender.com';
const imageUrl = `${baseUrl}${imagePath}`;
```

---

## 📝 **React Admin Panel Features Checklist**

### Dashboard
- [ ] Statistics cards (users, jobs, applications, revenue)
- [ ] Charts (applications over time, revenue, job status)
- [ ] Recent activity feed
- [ ] Quick actions

### Job Management
- [ ] Job list with filters
- [ ] Create/Edit/Delete jobs
- [ ] Job status management
- [ ] View job applications

### Application Management
- [ ] Application list with filters
- [ ] Approve/Reject applications
- [ ] Bulk actions
- [ ] View application details
- [ ] Application history

### User Management
- [ ] User list with search
- [ ] View user details
- [ ] User status management (suspend/ban)
- [ ] View user applications
- [ ] View user transactions

### Employer Management
- [ ] Employer list
- [ ] Create/Edit employers
- [ ] View employer details
- [ ] View employer jobs

### Payment Management
- [ ] Transaction list
- [ ] Process cashout requests
- [ ] Reject cashout requests
- [ ] Payment history

### Reports
- [ ] Generate reports (PDF, Excel, CSV)
- [ ] Download reports
- [ ] Report history

### Settings
- [ ] System settings
- [ ] Platform configuration
- [ ] Penalty rules
- [ ] Notification settings

---

## 🚀 **Deployment Checklist**

- [ ] All admin endpoints implemented
- [ ] Admin authentication working
- [ ] Role-based access control implemented
- [ ] Admin panel UI completed
- [ ] Testing completed
- [ ] Production environment configured

---

**END OF ADMIN PANEL DOCUMENTATION**

**Document Status:** ✅ **READY FOR ADMIN PANEL DEVELOPMENT**  
**Last Updated:** January 2025

