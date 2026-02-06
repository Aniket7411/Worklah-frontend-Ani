# WorkLah - Complete API Documentation

**Version:** 2.3  
**Last Updated:** January 26, 2026  
**Base URL:** `https://worklah-updated-dec.onrender.com` (Production)  
**Development:** `http://localhost:3000/api`

**Handover Notes:** Backend complete for Admin (Employer, Outlet, Job) and User (Apply, Clock-in/out, Barcode). Payment integration (Stripe) pending. App uses **Job Title** (and Responsibilities) in job detail UI; apply flow and saved jobs (client-side) are implemented.

---

## 🎯 Vision & Feature Summary (Client Requirements)

This document is the single source of truth for **React Native (App)** and **ReactJS (Admin)** developers.

### Admin Panel (ReactJS)
- **Employer:** Add employer, Edit employer. When adding an employer, each **outlet** gets a **unique barcode** for shift check-in (or use userId as fallback).
- **Jobs:** Add job, Edit job, Post and edit jobs, **Post job with multiple shifts and data**, apply filters.
- **Applicants:** After posting a job, admin sees **applicants on a particular job through notifications**; clicking the notification link opens **application detail** (use `applicationId` / `jobId` in admin notifications).
- **Approved candidates:** After approving an application, admin can see approved candidates; **release payment**; view **payment history**; users can **request payment** (admin approves/rejects).
- **Outlet barcode:** Each outlet has a unique `barcode` (returned in employer/outlet responses); used for worker shift login.

### User App (React Native)
- **Profile:** Create profile, browse jobs, view job details, apply for jobs, see **upcoming jobs**, see **applied jobs**.
- **Notifications:** Get **notification when job is confirmed** by admin; see notification and info in **Dashboard**.
- **Shift check-in:** After confirmation, user **joins the shift using barcode scanner** (or unique userId if barcode not workable). Use **Validate Barcode** endpoint to validate barcode/user and get today’s shifts.
- **Payment:** After shift, user can **request payment** from admin; two-way payment integration (request → admin release/history).

### API Response Standard
- **Success:** `success: true`, optional `message`, and data.
- **Failure:** `success: false`, **`message`** = **main cause** (user-facing), **`error`** = **error code** (e.g. `ValidationError`, `NotFound`, `DuplicateKeyError`). Always show `message` to users.

---

## 📋 Table of Contents

### For React Native Developers (User Mobile App)
1. [Authentication](#1-authentication-react-native)
2. [Job Management](#2-job-management-react-native)
3. [Application Management](#3-application-management-react-native)
4. [User Profile](#4-user-profile-react-native)
5. [Notifications](#5-notifications-react-native)
6. [Wallet & Payments](#6-wallet--payments-react-native)
7. [Attendance & QR Code](#7-attendance--qr-code-react-native)

### For ReactJS Developers (Admin Panel)
8. [Admin Authentication](#8-admin-authentication-reactjs)
9. [Dashboard & Analytics](#9-dashboard--analytics-reactjs)
10. [Employer Management](#10-employer-management-reactjs)
11. [Job Management (Admin)](#11-job-management-admin-reactjs)
12. [Application Management (Admin)](#12-application-management-admin-reactjs)
13. [User Management (Admin)](#13-user-management-admin-reactjs)
14. [Outlet Management](#14-outlet-management-reactjs)
15. [Candidate Management](#15-candidate-management-reactjs)
16. [Payment Management](#16-payment-management-reactjs)
17. [Reports & Analytics](#17-reports--analytics-reactjs)
18. [Settings & Configuration](#18-settings--configuration-reactjs)
19. [Notifications (Admin)](#19-notifications-admin-reactjs)
20. [Timesheet Management](#20-timesheet-management-reactjs)
21. [QR Code Management](#21-qr-code-management-reactjs)
22. [Additional Admin Endpoints](#22-additional-admin-endpoints-reactjs)

### Common
24. [Response Format Standards](#24-response-format-standards)
25. [Error Handling](#25-error-handling)
26. [Authentication & Authorization](#26-authentication--authorization)

### React Native App – Implementation Notes
- [Job Title & Responsibilities (UI)](#rn-job-title-and-responsibilities)
- [Apply for Job Flow](#rn-apply-for-job-flow)
- [Saved / Bookmark Jobs](#rn-saved-bookmark-jobs)

---

## React Native App – Implementation Notes

### Job Title & Responsibilities (UI) {#rn-job-title-and-responsibilities}

In the mobile app, the job detail screen shows:
- **Job Title** section: Displays `jobTitle` (or `jobName`), `jobDescription`, and a **Responsibilities** sub-section.
- **Responsibilities**: Rendered as a bullet list from the backend field **`jobScope`** (array of strings).

Backend/Admin should continue to expose:
- `jobTitle` – role title (e.g. "Waiter").
- `jobDescription` – full text description.
- `jobScope` – array of responsibility/duty bullets (shown under "Responsibilities" in the app).

No API change required; only the app UI labels "Job Title" and "Responsibilities" instead of "Job Scope".

---

### Apply for Job Flow {#rn-apply-for-job-flow}

End-to-end flow in the app:
1. User opens **Job Detail** → selects a shift from **Available Shifts**.
2. Taps **Select shifts to apply** → **JobApplyShifts** (review selected shift).
3. Taps **Confirm Booking** → **JobConfirmBooking** (terms + medical waiver).
4. Taps **Confirm Booking** → `POST /api/jobs/:jobId/apply` with body `{ shiftId, date }` (date in `YYYY-MM-DD`).

Requirements:
- **Profile must be complete**; otherwise backend returns `ProfileIncompleteError` with `profileCompletion` (app shows "Complete profile" and link to profile).
- Backend returns clear `message` for: already applied, no vacancy, invalid shift, job not found.

---

### Saved / Bookmark Jobs {#rn-saved-bookmark-jobs}

- **Current implementation:** Saved jobs are stored **only on the device** (AsyncStorage). No backend API is used.
- **App behaviour:** User can bookmark from Job List and Job Detail; a **Saved jobs** screen lists bookmarked jobs and opens Job Detail by `jobId`.
- **Optional future (Backend/Admin):** If sync across devices is needed, backend can add:
  - `GET /api/user/saved-jobs` – return list of saved job IDs (or full job summaries).
  - `POST /api/user/saved-jobs` – body `{ jobId }` to save.
  - `DELETE /api/user/saved-jobs/:jobId` – to remove.
  Until then, the app works fully with local-only bookmarks.

---

## Admin Panel (ReactJS) – Quick Start

**Use sections 8–22** for Admin Panel development.

| Step | Endpoint | Notes |
|------|----------|-------|
| 1. Login | `POST /api/admin/login` | Body: `{ email, password }` → returns `token` |
| 2. Auth header | `Authorization: Bearer <token>` | Required for all admin endpoints |
| 3. Dashboard | `GET /api/admin/dashboard/stats` | Stats for admin home |
| 4. Create employer | `POST /api/admin/employers` | **Use `multipart/form-data`** for file uploads; outlets optional |
| 5. Get employers | `GET /api/admin/employers` | Includes outlets with `barcode` |
| 6. Create job | `POST /api/admin/jobs/create` | Multiple shifts supported |
| 7. Get applications | `GET /api/admin/applications` | Filter by status (Pending, Approved, Rejected) |
| 8. Approve | `POST /api/admin/applications/:applicationId/approve` | No body required |
| 9. Reject | `POST /api/admin/applications/:applicationId/reject` | Optional body: `{ reason }` |
| 10. Payments | `GET /api/admin/payments/transactions` | Filter by status; approve via `PUT .../transactions/:transactionId/approve` |
| 11. Notifications | `GET /api/admin/notifications` | Use `applicationId` / `jobId` to open application detail |

**Important:** Always check `success` before using response data; show `message` for user feedback. Employer create/update uses **multipart/form-data**.

---

## 🔐 Authentication & Authorization

### Token Format
- **Type:** JWT (JSON Web Token)
- **Expiration:** 7 days (604800 seconds)
- **Header Format:** `Authorization: Bearer <token>`

### Token Storage
- **React Native:** Store in AsyncStorage
- **ReactJS:** Store in localStorage or httpOnly cookies

---

# 1. Authentication (React Native)

## 1.1 User Registration
**Endpoint:** `POST /api/user/register` or `POST /api/user/signup`

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
- `fullName` (string)
- `email` (string, valid email format)
- `password` (string, min 6 characters)

**Optional Fields:**
- `phoneNumber` (string)
- `employmentStatus` (string)

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

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already exists",
  "error": "ValidationError"
}
```

---

## 1.2 User Login (OTP-based)
**Endpoint:** `POST /api/user/login`

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

**Error Response (400):**
```json
{
  "success": false,
  "message": "User not found. Please register first.",
  "error": "UserNotFound"
}
```

---

## 1.3 Verify OTP
**Endpoint:** `POST /api/user/verify-otp`

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
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "USER",
    "profileCompleted": true,
    "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid OTP",
  "error": "InvalidOTP"
}
```

---

## 1.4 Get Current User
**Endpoint:** `GET /api/user/me`

**Headers:**
```
Authorization: Bearer <token>
```

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
    "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg"
  }
}
```

---

## 1.5 User Logout
**Endpoint:** `POST /api/user/logout`

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

## 1.6 Forgot Password
**Endpoint:** `POST /api/user/forgot-password`

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

# 2. Job Management (React Native)

## 2.1 Get All Jobs
**Endpoint:** `GET /api/jobs`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search query
- `status` (optional): Filter by status (Active, Completed, etc.)
- `location` (optional): Filter by location
- `date` (optional): Filter by date (YYYY-MM-DD)
- `rateType` (optional): Filter by rate type
- `industry` (optional): Filter by industry

**Success Response (200):**
```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "jobId": "JOB-0001",
      "jobName": "Waiter Position",
      "jobTitle": "Waiter",
      "jobDescription": "Full job description here",
      "jobDate": "2025-01-15",
      "date": "2025-01-15",
      "jobStatus": "Active",
      "status": "Active",
      "applicationDeadline": "2025-01-14",
      "deadline": "2025-01-14",
      "location": "Orchard Road",
      "shortAddress": "123 Orchard Road",
      "industry": "F&B",
      "jobScope": ["Serving customers", "Cleaning tables"],
      "employer": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "ABC Restaurant Pte Ltd",
        "logo": "https://worklah.onrender.com/uploads/logo.png"
      },
      "outlet": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Orchard Branch",
        "address": "123 Orchard Road, Singapore",
        "image": "https://worklah.onrender.com/uploads/outlet.jpg"
      },
      "outletTiming": "09:00 AM - 05:00 PM",
      "estimatedWage": 150,
      "payRatePerHour": "$15/hr",
      "slotLabel": "Limited Slots"
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

## 2.2 Get Job by ID
**Endpoint:** `GET /api/jobs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job details retrieved successfully",
  "job": {
    "id": "507f1f77bcf86cd799439011",
    "jobId": "JOB-0001",
    "jobName": "Waiter Position",
    "jobTitle": "Waiter",
    "jobDescription": "Complete job description",
    "jobDate": "2025-01-15",
    "date": "2025-01-15",
    "jobStatus": "Active",
    "status": "Active",
    "applicationDeadline": "2025-01-14",
    "deadline": "2025-01-14",
    "employer": {
      "id": "507f1f77bcf86cd799439012",
      "name": "ABC Restaurant Pte Ltd",
      "logo": "https://worklah.onrender.com/uploads/logo.png"
    },
    "outlet": {
      "id": "507f1f77bcf86cd799439013",
      "name": "Orchard Branch",
      "address": "123 Orchard Road, Singapore",
      "image": "https://worklah.onrender.com/uploads/outlet.jpg"
    },
    "location": "Orchard Road",
    "locationDetails": "Near MRT station",
    "shortAddress": "123 Orchard Road",
    "jobScope": ["Serving customers", "Cleaning tables"],
    "jobRequirements": [],
    "industry": "F&B",
    "totalVacancies": 5,
    "applied": false,
    "profileCompleted": true,
    "availableShiftsData": [
      {
        "date": "15th Mon Jan",
        "appliedShifts": 0,
        "availableShifts": 2,
        "shifts": [
          {
            "id": "507f1f77bcf86cd799439014",
            "startTime": "09:00 AM",
            "endTime": "05:00 PM",
            "duration": 8,
            "breakDuration": 1,
            "breakPaid": "Paid",
            "hourlyRate": "Hourly",
            "payRate": "$15",
            "totalWage": "$120",
            "vacancy": "2/5",
            "standbyVacancy": "0/2",
            "isSelected": false,
            "standbyAvailable": false,
            "standbyMessage": null
          }
        ]
      }
    ],
    "jobCategory": "F&B",
    "standbyFeature": true,
    "standbyDisclaimer": "Applying for a standby shift means you will only be activated if a vacancy arises."
  }
}
```

---

## 2.3 Search Jobs
**Endpoint:** `GET /api/jobs/search`

**Query Parameters:**
- `search` (optional): Search query
- `location` (optional): Filter by location
- `date` (optional): Filter by date
- `industry` (optional): Filter by industry
- `rateType` (optional): Filter by rate type

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [...]
}
```

---

## 2.4 Get Ongoing Jobs
**Endpoint:** `GET /api/jobs/ongoing`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ongoing jobs retrieved successfully",
  "jobs": [
    {
      "applicationId": "507f1f77bcf86cd799439015",
      "jobName": "Waiter Position",
      "jobIcon": "/static/job-icon.png",
      "outletName": "Orchard Branch",
      "outletImage": "/static/outlet.jpg",
      "location": "Orchard Road",
      "shiftStartTime": "09:00 AM",
      "shiftEndTime": "05:00 PM",
      "totalWage": "$120",
      "duration": "8 hrs",
      "ratePerHour": "$15/hr",
      "jobStatus": "Upcoming",
      "appliedAt": "2025-01-10T10:00:00Z",
      "daysRemaining": 5,
      "jobDate": "15 Jan, 25"
    }
  ]
}
```

---

## 2.5 Get Completed Jobs
**Endpoint:** `GET /api/jobs/completed`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Completed jobs retrieved successfully",
  "jobs": [...]
}
```

---

## 2.6 Get Cancelled Jobs
**Endpoint:** `GET /api/jobs/cancelled`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cancelled jobs retrieved successfully",
  "jobs": [
    {
      "applicationId": "507f1f77bcf86cd799439015",
      "jobName": "Waiter Position",
      "jobIcon": "/static/job-icon.png",
      "outletName": "Orchard Branch",
      "outletImage": "/static/outlet.jpg",
      "location": "Orchard Road",
      "shiftStartTime": "09:00 AM",
      "shiftEndTime": "05:00 PM",
      "duration": "8 hrs",
      "ratePerHour": "$15/hr",
      "totalWage": "$120",
      "breakDuration": "1 hr",
      "breakType": "Unpaid",
      "penalty": "- $5",
      "penaltyLabel": "> 24 Hours (1st Time)",
      "reason": "Personal reasons",
      "jobStatus": "Cancelled",
      "cancelledAt": "13 Jan, 25"
    }
  ]
}
```

---

# 3. Application Management (React Native)

## 3.1 Apply for Job
**Endpoint:** `POST /api/jobs/:jobId/apply`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameter:** `jobId` – Job ID (from URL path)

**Request Body:**
```json
{
  "shiftId": "507f1f77bcf86cd799439014",
  "date": "2025-01-15"
}
```

**Note:** `userId` is taken from the auth token. Do not send userId in body.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application submitted successfully. Your application is pending admin approval. You will be notified once it's reviewed.",
  "application": {
    "_id": "507f1f77bcf86cd799439016",
    "userId": "507f1f77bcf86cd799439011",
    "jobId": "507f1f77bcf86cd799439011",
    "shiftId": "507f1f77bcf86cd799439014",
    "status": "Upcoming",
    "appliedStatus": "Applied",
    "adminStatus": "Pending",
    "appliedAt": "2025-01-10T10:00:00Z"
  }
}
```

**Error Responses:**
- `400`: Profile not completed, No vacancies, Already applied, Invalid shift
- `404`: User not found, Job not found, Shift not found

**Error Example:**
```json
{
  "success": false,
  "message": "Please complete your profile before applying for jobs. Go to your profile settings to complete it.",
  "error": "ValidationError"
}
```

---

## 3.2 Cancel Application
**Endpoint:** `POST /api/jobs/:jobId/cancel`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```json
{
  "applicationId": "507f1f77bcf86cd799439016",
  "reason": "Medical",
  "describedReason": "Feeling unwell",
  "medicalCertificate": "<file>" // Optional, required if reason is "Medical"
}
```

**Reason Options:**
- "Found Another Job"
- "Schedule Conflict"
- "Medical"
- "Personal Reasons"
- "Other"

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application cancelled successfully. A penalty of $5 has been applied based on cancellation timing.",
  "application": {
    "status": "Cancelled",
    "reason": "Medical",
    "describedReason": "Feeling unwell",
    "penalty": 5,
    "penaltyLabel": "> 24 Hours (1st Time)",
    "medicalCertificate": "/uploads/mc-certificates/1234567890_cert.pdf",
    "cancelledAt": "2025-01-13 14:30:00"
  }
}
```

**Penalty Rules:**
- `> 48 Hours`: No Penalty
- `> 24 Hours`: $5 (1st Time)
- `> 12 Hours`: $10 (2nd Time)
- `> 6 Hours`: $15 (3rd Time)
- `< 6 Hours`: $50 (Last Minute)

---

## 3.3 Get User Applications
**Endpoint:** `GET /api/user/applications`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (Pending, Approved, Rejected)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "applications": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "applicationId": "507f1f77bcf86cd799439016",
      "jobId": "507f1f77bcf86cd799439011",
      "job": {
        "_id": "507f1f77bcf86cd799439011",
        "jobId": "JOB-0001",
        "jobName": "Waiter Position",
        "jobDate": "2025-01-15",
        "date": "2025-01-15",
        "location": "Orchard Road",
        "jobStatus": "Active",
        "status": "Active",
        "applicationDeadline": "2025-01-14",
        "deadline": "2025-01-14",
        "industry": "F&B",
        "jobScope": ["Serving customers"],
        "jobDescription": "Job description",
        "employer": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "ABC Restaurant Pte Ltd",
          "logo": "https://worklah.onrender.com/uploads/logo.png"
        },
        "outlet": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "Orchard Branch",
          "address": "123 Orchard Road, Singapore",
          "image": "https://worklah.onrender.com/uploads/outlet.jpg"
        }
      },
      "shiftId": "507f1f77bcf86cd799439014",
      "shift": {
        "_id": "507f1f77bcf86cd799439014",
        "startTime": "09:00",
        "startMeridian": "AM",
        "endTime": "05:00",
        "endMeridian": "PM",
        "duration": 8,
        "payRate": 15,
        "totalWage": 120,
        "breakHours": 1,
        "breakType": "Paid",
        "vacancy": 5,
        "standbyVacancy": 2
      },
      "status": "Upcoming",
      "adminStatus": "Pending",
      "appliedAt": "2025-01-10T10:00:00Z",
      "appliedDate": "2025-01-10",
      "appliedTime": "10:00"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

---

## 3.4 Get Job Details by Application ID
**Endpoint:** `GET /api/jobs/details/:applicationId`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "job": {
    "applicationId": "507f1f77bcf86cd799439016",
    "jobId": "507f1f77bcf86cd799439011",
    "jobName": "Waiter Position",
    "jobIcon": "/static/job-icon.png",
    "industry": "F&B",
    "location": "Orchard Road",
    "shortAddress": "123 Orchard Road",
    "jobScope": ["Serving customers"],
    "jobRequirements": [],
    "status": "Upcoming",
    "adminStatus": "Pending",
    "employer": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "ABC Restaurant Pte Ltd",
      "companyLogo": "/static/logo.png",
      "contractEndDate": "2025-12-31"
    },
    "outlet": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Orchard Branch",
      "location": "123 Orchard Road, Singapore",
      "outletImage": "/static/outlet.jpg",
      "outletType": "Restaurant"
    },
    "shift": {
      "startTime": "09:00 AM",
      "endTime": "05:00 PM",
      "duration": 8,
      "payRate": "$15",
      "totalWage": "$120",
      "breakPaid": "Paid",
      "breakDuration": "1 hrs",
      "vacancy": 5,
      "standbyVacancy": 2
    },
    "clockInTime": null,
    "clockOutTime": null,
    "checkInLocation": null
  }
}
```

---

# 4. User Profile (React Native)

## 4.1 Get User Profile
**Endpoint:** `GET /api/user/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+6512345678",
    "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg",
    "profileCompleted": true,
    "employmentStatus": "Singaporean/Permanent Resident"
  }
}
```

---

# 5. Notifications (React Native)

## 5.1 Get User Notifications
**Endpoint:** `GET /api/notifications`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `userId` (required): User ID

**Success Response (200):**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "userId": "507f1f77bcf86cd799439011",
      "jobId": "507f1f77bcf86cd799439011",
      "type": "Job",
      "title": "Job Application Approved",
      "message": "Your application for Waiter Position has been approved.",
      "isRead": false,
      "createdAt": "2025-01-10T10:00:00Z"
    }
  ]
}
```

---

# 6. Wallet & Payments (React Native)

## 6.1 Get Wallet Balance
**Endpoint:** `GET /api/jobs/balance`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "balance": 150.50
}
```

---

## 6.2 Get Transactions
**Endpoint:** `GET /api/jobs/transactions`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "transactions": [...]
}
```

---

## 6.3 User Request Payment (Flow)
**Purpose:** User requests payment from admin after completing a shift (two-way payment).

- **User (App):** Wallet balance and transactions (6.1, 6.2); cashout/withdrawal if implemented. Payment requests may be created when admin generates payment for a completed shift, or via a dedicated request endpoint when available.
- **Admin (Panel):** Sees all payment/transaction requests in **16.1 Get All Transactions** (filter by status `Pending`). Approves or rejects in **16.2 Approve Transaction** / **16.3 Reject Transaction**. Payment history in **16.1**.

**Relevant endpoints:**  
- User: `GET /api/wallet` (balance, transactions).  
- Admin: `GET /api/admin/payments/transactions`, `PUT /api/admin/payments/transactions/:transactionId/approve`, `PUT .../reject`.

---

# 7. Attendance & QR Code (React Native)

## 7.1 Get Upcoming Shifts (User)
**Endpoint:** `GET /api/qr/upcoming`

**Headers:**
```
Authorization: Bearer <token>
```

**Purpose:** Get the current user’s **upcoming** approved shifts (for “see upcoming jobs” / My Shifts).

**Success Response (200):**
```json
{
  "success": true,
  "shifts": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "jobId": "507f1f77bcf86cd799439011",
      "shiftId": "507f1f77bcf86cd799439020",
      "jobTitle": "Waiter Position",
      "location": "123 Orchard Road",
      "company": "ABC Restaurant Pte Ltd",
      "startTime": "09:00AM",
      "endTime": "05:00PM",
      "date": "2025-01-30",
      "applicationId": "507f1f77bcf86cd799439016"
    }
  ]
}
```

---

## 7.2 Clock In
**Endpoint:** `POST /api/qr/clock-in`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (one of):**
```json
{
  "jobId": "507f1f77bcf86cd799439011",
  "shiftId": "507f1f77bcf86cd799439020"
}
```
Or after scanning QR, send the scanned data:
```json
{
  "qrData": "{\"jobId\":\"...\",\"shiftId\":\"...\",\"barcode\":\"JOB-0001\",\"outletId\":\"...\"}"
}
```
Or both jobId/shiftId and qrData.

**Requirements:** User must have an **approved** (adminStatus: Confirmed) application for this job/shift.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Clocked in successfully",
  "applicationId": "507f1f77bcf86cd799439016",
  "attendanceId": "507f1f77bcf86cd799439016",
  "clockInTime": "2025-01-30T09:00:00.000Z"
}
```

---

## 7.3 Clock Out
**Endpoint:** `POST /api/qr/clock-out`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "jobId": "507f1f77bcf86cd799439011",
  "shiftId": "507f1f77bcf86cd799439020"
}
```
Optional: Include `applicationId` or `attendanceId` if you have it (from clock-in response) for faster lookup.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Clocked out successfully",
  "clockOutTime": "2025-01-30T17:00:00.000Z",
  "totalHours": 8
}
```

---

## 7.4 Scan QR Code
**Endpoint:** `POST /api/qr/scan`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "qrData": "{\"jobId\":\"...\",\"shiftId\":\"...\",\"barcode\":\"JOB-0001\",\"outletId\":\"...\"}"
}
```
`qrData` is the raw string decoded from the QR code (JSON string).

**Success Response (200):**
```json
{
  "success": true,
  "valid": true,
  "jobId": "507f1f77bcf86cd799439011",
  "shiftId": "507f1f77bcf86cd799439020",
  "jobTitle": "Waiter Position",
  "jobDate": "2025-01-30",
  "outlet": { "name": "Orchard Branch", "address": "123 Orchard Road" },
  "employer": { "name": "ABC Restaurant Pte Ltd" },
  "message": "QR code is valid"
}
```
Use `jobId` and `shiftId` for clock-in.

---

## 7.5 Validate Barcode or User for Shift Check-In
**Endpoint:** `POST /api/qr/validate-barcode`

**Purpose:** Worker at outlet scans **outlet barcode** (or enters **userId**) to get today’s shifts / their upcoming shifts for check-in. No auth required (e.g. for kiosk/scanner).

**Request Body (one of):**
```json
{ "barcode": "A1B2C3D4E5F6" }
```
or
```json
{ "userId": "507f1f77bcf86cd799439011" }
```

**Success Response (200) – when `barcode` is sent:**
```json
{
  "success": true,
  "valid": true,
  "outletId": "507f1f77bcf86cd799439013",
  "outletName": "Orchard Branch",
  "employerId": "507f1f77bcf86cd799439012",
  "employerName": "ABC Restaurant Pte Ltd",
  "shifts": [
    {
      "jobId": "507f1f77bcf86cd799439011",
      "shiftId": "507f1f77bcf86cd799439020",
      "jobTitle": "Waiter",
      "startTime": "09:00",
      "endTime": "17:00",
      "shiftDate": "2025-01-30"
    }
  ]
}
```

**Success Response (200) – when `userId` is sent:**
```json
{
  "success": true,
  "valid": true,
  "userId": "507f1f77bcf86cd799439011",
  "upcomingShifts": [
    {
      "applicationId": "507f1f77bcf86cd799439016",
      "jobId": "507f1f77bcf86cd799439011",
      "shiftId": "507f1f77bcf86cd799439020",
      "jobTitle": "Waiter",
      "startTime": "09:00",
      "endTime": "17:00",
      "date": "2025-01-30"
    }
  ]
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Provide barcode or userId in request body.",
  "error": "ValidationError"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Invalid barcode. No outlet or job found for this code.",
  "error": "InvalidBarcode"
}
```

**Job barcode response:** When barcode matches a job (jobId or job.barcodes), response includes `barcodeType: "job"`, `jobId`, and same `shifts` structure.

**Notes:**
- Outlet `barcode` is returned when getting employer/outlet (see Employer Management). Each outlet has a unique barcode for shift login.
- If barcode is not workable, use `userId` to fetch the user’s upcoming approved shifts.

---

# 8. Admin Authentication (ReactJS)

## 8.1 Admin Login
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
    "fullName": "Admin User"
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

## 8.2 Get Current Admin
**Endpoint:** `GET /api/admin/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "admin": {
    "_id": "507f1f77bcf86cd799439001",
    "email": "admin@worklah.com",
    "role": "ADMIN",
    "fullName": "Admin User"
  }
}
```

---

## 8.3 Admin Logout
**Endpoint:** `POST /api/admin/logout`

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

# 9. Dashboard & Analytics (ReactJS)

## 9.1 Get Dashboard Statistics
**Endpoint:** `GET /api/admin/dashboard/stats`

**Headers:**
```
Authorization: Bearer <token>
```

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
      "message": "New application submitted for Waiter Position",
      "timestamp": "2025-01-10T10:00:00Z"
    }
  ]
}
```

---

## 9.2 Get Dashboard Charts
**Endpoint:** `GET /api/admin/dashboard/charts`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (optional): "daily", "weekly", "monthly", "yearly" (default: "monthly")
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Success Response (200):**
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
    ],
    "jobs": [
      { "date": "2025-01-01", "value": 10 },
      { "date": "2025-01-02", "value": 12 }
    ]
  }
}
```

---

## 9.3 Get Dashboard Overview
**Endpoint:** `GET /api/admin/dashboard/overview`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "overview": {...}
}
```

---

# 10. Employer Management (ReactJS)

## 10.1 Get All Employers
**Endpoint:** `GET /api/admin/employers`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search query
- `industry` (optional): Filter by industry
- `serviceAgreement` (optional): Filter by service agreement status

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
      "companyEmail": "contact@abcrestaurant.com",
      "mainContactPersonName": "John Manager",
      "mainContactPersonNumber": "+6512345678",
      "hqAddress": "123 Main Street, Singapore",
      "industry": "F&B",
      "serviceAgreement": "Active",
      "contractEndDate": "2025-12-31",
      "outlets": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "name": "Orchard Branch",
          "managerName": "Jane Doe",
          "contactNumber": "+6511112222",
          "address": "123 Orchard Road",
          "openingHours": "09:00",
          "closingHours": "17:00",
          "isActive": true
        }
      ],
      "totalJobs": 50,
      "activeJobs": 10,
      "totalApplications": 200,
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

**⚠️ CRITICAL:** 
- Response **MUST** include `outlets` array for each employer (required for job creation)
- This endpoint returns **ONLY** employers - does NOT return users or admins
- Each employer object includes complete outlet information
- Each outlet includes **`barcode`** (unique per outlet) for **shift check-in**; worker scans barcode or uses userId to log into shift (see **7.4 Validate Barcode**)

---

## 10.2 Get Single Employer
**Endpoint:** `GET /api/admin/employers/:employerId`

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `employerId`: Employer ID (accepts both MongoDB ObjectId and EMP-xxxx format)

**Success Response (200):**
```json
{
  "success": true,
  "employer": {
    "_id": "507f1f77bcf86cd799439012",
    "employerId": "EMP-1234",
    "companyLegalName": "ABC Restaurant Pte Ltd",
    "companyLogo": "https://worklah.onrender.com/uploads/logo.png",
    "companyEmail": "contact@abcrestaurant.com",
    "mainContactPersonName": "John Manager",
    "mainContactPersonNumber": "+6512345678",
    "hqAddress": "123 Main Street, Singapore",
    "industry": "F&B",
    "serviceAgreement": "Active",
    "contractEndDate": "2025-12-31",
    "outlets": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Orchard Branch",
        "address": "123 Orchard Road",
        "managerName": "Jane Doe",
        "contactNumber": "+6511112222",
        "isActive": true,
        "barcode": "A1B2C3D4E5F6"
      }
    ],
    "totalJobs": 50,
    "activeJobs": 10,
    "status": "active"
  }
}
```

---

## 10.3 Create Employer
**Endpoint:** `POST /api/admin/employers`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```json
{
  "data": JSON.stringify({
    "companyLegalName": "ABC Restaurant Pte Ltd",
    "companyNumber": "ACRA123456", // Optional
    "hqAddress": "123 Main St, Singapore",
    "contactPersonName": "John Doe",
    "jobPosition": "Manager", // Optional
    "mainContactNumber": "+65 1234 5678",
    "alternateContactNumber": "+65 9876 5432", // Optional
    "emailAddress": "contact@company.com",
    "industry": "F&B",
    "serviceAgreement": "Active", // Optional, default: "Active"
    "contractExpiryDate": "2025-12-31", // Optional, format: YYYY-MM-DD
    "generateCredentials": true, // Optional, default: false
    "outlets": [] // ⚠️ OPTIONAL - Can be empty array or omitted entirely
  }),
  "companyLogo": "<file>", // Optional
  "acraBizfileCert": "<file>", // Optional
  "serviceContract": "<file>" // Optional
}
```

**Required Fields:**
- `companyLegalName` (string)
- `hqAddress` (string)
- `contactPersonName` (string)
- `mainContactNumber` (string)
- `emailAddress` (string, valid email)
- `industry` (string, enum: Hospitality, IT, F&B, Hotel, Retail, Logistics, Healthcare, Education, Construction, Others)

**Optional Fields:**
- `companyNumber` (string)
- `jobPosition` (string)
- `alternateContactNumber` (string)
- `serviceAgreement` (string)
- `contractExpiryDate` (string, YYYY-MM-DD)
- `generateCredentials` (boolean)
- `outlets` (array) - **OPTIONAL** - Can be added later via update

**Success Response (201):**
```json
{
  "success": true,
  "message": "Employer created successfully. You can add outlets later by updating this employer.",
  "employer": {
    "_id": "507f1f77bcf86cd799439012",
    "employerId": "EMP-1234",
    "companyLegalName": "ABC Restaurant Pte Ltd",
    "companyLogo": "https://worklah.onrender.com/uploads/logo.png",
    "outlets": []
  },
  "credentials": {
    "email": "contact@company.com",
    "password": "generated-password",
    "emailSent": true
  }
}
```

**Error Responses:**
- `400`: Missing required fields, Invalid email format, Invalid industry
- `409`: Email already registered, Company number already exists

**Important Notes:**
- **Outlets are OPTIONAL** - Employers can be created without outlets
- Outlets can be added later via the update endpoint
- If `generateCredentials` is true, employer login credentials are created automatically

---

## 10.4 Update Employer
**Endpoint:** `PUT /api/admin/employers/:employerId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:** Same as Create Employer

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employer updated successfully",
  "employer": {
    "_id": "507f1f77bcf86cd799439012",
    "employerId": "EMP-1234",
    "companyLegalName": "ABC Restaurant Pte Ltd",
    "outlets": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Orchard Branch",
        "address": "123 Orchard Road",
        "managerName": "Jane Doe",
        "contactNumber": "+6511112222",
        "isActive": true
      }
    ]
  }
}
```

**Note:** When updating, you can add outlets if they weren't included during creation.

---

## 10.5 Delete Employer
**Endpoint:** `DELETE /api/admin/employers/:employerId`

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

## 10.6 Get Outlet Overview
**Endpoint:** `GET /api/admin/employers/:outletId/overview`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "outlet": {...}
}
```

---

# 11. Job Management (Admin - ReactJS)

## 11.1 Get All Jobs (Admin)
**Endpoint:** `GET /api/admin/jobs`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `employerId` (optional): Filter by employer
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `search` (optional): Search query

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "jobId": "JOB-0001",
      "jobName": "Waiter Position",
      "jobTitle": "Waiter",
      "jobDescription": "Job description",
      "jobDate": "2025-01-15",
      "date": "2025-01-15",
      "jobStatus": "Active",
      "status": "Active",
      "applicationDeadline": "2025-01-14",
      "postedBy": "admin",
      "employer": {
        "_id": "507f1f77bcf86cd799439012",
        "companyLegalName": "ABC Restaurant Pte Ltd",
        "companyLogo": "https://worklah.onrender.com/uploads/logo.png"
      },
      "outlet": {
        "_id": "507f1f77bcf86cd799439013",
        "outletName": "Orchard Branch",
        "outletAddress": "123 Orchard Road"
      },
      "location": "Orchard Road",
      "industry": "F&B",
      "totalPositions": 5,
      "shifts": [...]
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

## 11.2 Get Job by ID (Admin)
**Endpoint:** `GET /api/admin/jobs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "job": {
    "_id": "507f1f77bcf86cd799439011",
    "jobId": "JOB-0001",
    "jobName": "Waiter Position",
    "jobTitle": "Waiter",
    "jobDescription": "Complete job description",
    "jobDate": "2025-01-15",
    "applicationDeadline": "2025-01-14",
    "jobStatus": "Active",
    "employer": {...},
    "outlet": {...},
    "shifts": [...],
    "totalApplications": 10,
    "approvedApplications": 5,
    "pendingApplications": 3
  }
}
```

---

## 11.3 Create Job (Admin)
**Endpoint:** `POST /api/admin/jobs/create` or `POST /api/admin/jobs`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobName": "Waiter Position",
  "jobTitle": "Waiter",
  "jobDescription": "Job description here",
  "employerId": "507f1f77bcf86cd799439012",
  "outletId": "507f1f77bcf86cd799439013",
  "jobDate": "2025-01-15",
  "location": "Orchard Road",
  "locationDetails": "Near MRT station",
  "industry": "F&B",
  "jobScope": ["Serving customers", "Cleaning tables"],
  "dressCode": "Uniform provided",
  "skills": ["Customer service", "Teamwork"],
  "applicationDeadline": "2025-01-14",
  "shifts": [
    {
      "date": "2025-01-15",
      "startTime": "09:00",
      "endTime": "17:00",
      "breakHours": 1,
      "breakType": "Paid",
      "payRate": 15,
      "vacancy": 5,
      "standbyVacancy": 2
    }
  ]
}
```

**Required Fields:**
- `jobName` (string)
- `jobTitle` (string)
- `jobDescription` (string)
- `employerId` (string, MongoDB ObjectId or EMP-xxxx format)
- `jobDate` (string, YYYY-MM-DD)
- `location` (string)
- `industry` (string, enum)
- `jobScope` (array of strings)
- `shifts` (array)

**Optional Fields:**
- `outletId` (string) - If not provided, can use `outletAddress` or `locationDetails`
- `outletAddress` (string) - Manual outlet address
- `locationDetails` (string) - Additional location details
- `applicationDeadline` (string, YYYY-MM-DD)
- `dressCode` (string)
- `skills` (array of strings)
- `foodHygieneCertRequired` (boolean)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Job created successfully",
  "job": {
    "_id": "507f1f77bcf86cd799439011",
    "jobId": "JOB-0001",
    "jobName": "Waiter Position",
    "jobDate": "2025-01-15",
    "applicationDeadline": "2025-01-14",
    "jobStatus": "Active"
  }
}
```

**Error Responses:**
- `400`: Invalid date format, Job date in past, Invalid employer/outlet, Missing required fields
- `404`: Employer not found, Outlet not found

---

## 11.4 Update Job (Admin)
**Endpoint:** `PUT /api/admin/jobs/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** Same as Create Job (all fields optional for update)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "job": {...}
}
```

---

## 11.5 Delete Job (Admin)
**Endpoint:** `DELETE /api/admin/jobs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

## 11.6 Change Job Status
**Endpoint:** `PATCH /api/admin/jobs/:id/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "Suspended"
}
```

**Status Options:** Active, Suspended, Pending, Cancelled, Completed, Upcoming, Deactivated, Ongoing, Filled, Expired

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job status updated successfully",
  "job": {
    "_id": "507f1f77bcf86cd799439011",
    "jobStatus": "Suspended",
    "status": "Suspended"
  }
}
```

---

## 11.7 Duplicate Job
**Endpoint:** `POST /api/admin/jobs/:id/duplicate`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job duplicated successfully",
  "job": {...}
}
```

---

## 11.8 Deactivate Job
**Endpoint:** `PATCH /api/admin/jobs/:id/deactivate`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job deactivated successfully"
}
```

---

## 11.9 Cancel Job
**Endpoint:** `PATCH /api/admin/jobs/:id/cancel`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job cancelled successfully"
}
```

---

## 11.10 Get Job Candidates
**Endpoint:** `GET /api/admin/jobs/candidates/:jobId`

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
      "_id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439011",
      "user": {
        "fullName": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "+6512345678",
        "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg"
      },
      "status": "Pending",
      "adminStatus": "Pending",
      "appliedAt": "2025-01-10T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

## 11.11 Get Deployment Tracking
**Endpoint:** `GET /api/admin/jobs/deployment-tracking`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `employerId` (optional): Filter by employer

**Success Response (200):**
```json
{
  "success": true,
  "deployments": [
    {
      "jobId": "JOB-1234",
      "jobName": "Waiter",
      "jobDate": "2025-01-15",
      "deployedCount": 10,
      "requiredCount": 15,
      "status": "In Progress"
    }
  ]
}
```

---

# 12. Application Management (Admin - ReactJS)

## 12.1 Get All Applications
**Endpoint:** `GET /api/admin/applications`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (Pending, Approved, Rejected)
  - Maps to: Pending → adminStatus: "Pending", Approved → adminStatus: "Confirmed", Rejected → adminStatus: "Rejected"
- `jobId` (optional): Filter by job (accepts both ObjectId and JOB-xxxx format)
- `userId` (optional): Filter by user
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)

**⚠️ CRITICAL:** This endpoint returns **ALL** job applications across all jobs. For job-specific candidates, use `/api/admin/jobs/candidates/:jobId`

**Success Response (200):**
```json
{
  "success": true,
  "applications": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "userId": "507f1f77bcf86cd799439011",
      "user": {
        "fullName": "John Doe",
        "phoneNumber": "+6512345678",
        "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg",
        "email": "john@example.com",
        "profileCompleted": true
      },
      "jobId": "507f1f77bcf86cd799439011",
      "job": {
        "jobName": "Waiter Position",
        "jobDate": "2025-01-15"
      },
      "shiftId": "507f1f77bcf86cd799439014",
      "shift": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "status": "Pending",
      "adminStatus": "Pending",
      "appliedAt": "2025-01-10T10:00:00Z"
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

## 12.2 Get Single Application
**Endpoint:** `GET /api/admin/applications/:applicationId`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "application": {
    "_id": "507f1f77bcf86cd799439016",
    "userId": "507f1f77bcf86cd799439011",
    "user": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+6512345678",
      "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg",
      "profileCompleted": true
    },
    "jobId": "507f1f77bcf86cd799439011",
    "job": {...},
    "shiftId": "507f1f77bcf86cd799439014",
    "shift": {...},
    "status": "Pending",
    "adminStatus": "Pending",
    "appliedAt": "2025-01-10T10:00:00Z",
    "adminNotes": ""
  }
}
```

---

## 12.3 Approve Application
**Endpoint:** `POST /api/admin/applications/:applicationId/approve`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "notes": "Approved - Good profile" // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application approved successfully"
}
```

**What Happens:**
- Application status changes to "Confirmed" (adminStatus) and "Upcoming" (status)
- Shift vacancy count is updated
- Notification is sent to user
- User can now see this job in their "Ongoing Jobs"

---

## 12.4 Reject Application
**Endpoint:** `POST /api/admin/applications/:applicationId/reject`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Profile incomplete", // Optional
  "notes": "User needs to complete profile first" // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application rejected successfully"
}
```

**What Happens:**
- Application status changes to "Rejected" (adminStatus and status)
- Rejection reason is stored
- Notification is sent to user
- Shift vacancy is released (if it was filled)

---

## 12.5 Bulk Approve/Reject Applications
**Endpoint:** `POST /api/admin/applications/bulk-action`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "action": "approve", // or "reject"
  "applicationIds": [
    "507f1f77bcf86cd799439014",
    "507f1f77bcf86cd799439015"
  ],
  "notes": "Bulk approval" // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Applications processed successfully",
  "approved": 2, // or "rejected": 2
  "failed": 0
}
```

---

## 12.6 Update Application Status
**Endpoint:** `PUT /api/admin/applications/status/:userId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "Approved", // or "Rejected"
  "jobId": "507f1f77bcf86cd799439011",
  "notes": "Optional notes" // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application status updated successfully"
}
```

**Note:** This endpoint updates application status for a specific user and job combination.

---

# 13. User Management (Admin - ReactJS)

## 13.1 Get All Users
**Endpoint:** `GET /api/admin/users`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search query (searches fullName, email, phoneNumber, nric)
- `role` (optional): Filter by role (USER, EMPLOYER, ADMIN)
  - ⚠️ **CRITICAL:** When `role=USER` is provided, endpoint returns **ONLY** users with role="USER"
  - **MUST NOT** return ADMIN or EMPLOYER roles when `role=USER` is specified
  - This is essential for the Hustle Heroes page
- `profileCompleted` (optional): Filter by profile completion (true/false)
- `status` (optional): Filter by status (Active, Pending, Verified, Rejected, etc.)

**Success Response (200):**
```json
{
  "success": true,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+6512345678",
      "role": "USER",
      "profileCompleted": true,
      "status": "Active",
      "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg",
      "nric": "S1234567A",
      "icNumber": "S1234567A",
      "dob": "1990-01-15",
      "dateOfBirth": "1990-01-15",
      "gender": "Male",
      "age": 35,
      "registrationDate": "2025-01-10T10:00:00Z",
      "workPassStatus": "Verified",
      "verificationStatus": "Verified",
      "totalApplications": 10,
      "approvedApplications": 5,
      "completedJobs": 3,
      "walletBalance": 150.50,
      "createdAt": "2025-01-10T10:00:00Z"
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

**⚠️ CRITICAL REQUIREMENTS (Per FRONTEND_DATA_REQUIREMENTS.md):**
1. **Role Filtering:** When `role=USER` is provided, endpoint **MUST** return **ONLY** users with role="USER"
2. **MUST NOT** return ADMIN or EMPLOYER roles when `role=USER` is specified
3. **Profile Fields:** Response **MUST** include all profile fields:
   - `nric` or `icNumber` (IC/NRIC number)
   - `dob` or `dateOfBirth` (date of birth in YYYY-MM-DD format)
   - `gender` (Male/Female)
   - `age` (calculated from date of birth)
   - `registrationDate` (when user registered, ISO format)
   - `workPassStatus` or `verificationStatus` (Pending/Verified/Rejected)
4. **User Source:** Returns **ONLY** users who registered via the mobile app (React Native app)
5. **Data Separation:** This endpoint returns **ONLY** users - does NOT return employers or admins

**Filter Options (for Hustle Heroes page):**
- **Activated**: Users with status "Active" or "Approved"
- **Pending Verification**: Users with workPassStatus "Pending"
- **Verified**: Users with workPassStatus "Verified"
- **No Show**: Users with low turn-up rate or "No Show" status

---

## 13.2 Get User by ID
**Endpoint:** `GET /api/admin/users/:userId`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+6512345678",
    "role": "USER",
    "profileCompleted": true,
    "status": "Active",
    "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg",
    "employmentStatus": "Singaporean/Permanent Resident"
  }
}
```

---

## 13.3 Create User (Admin)
**Endpoint:** `POST /api/admin/users/create`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "USER",
  "phoneNumber": "+6512345678",
  "nric": "S1234567A", // Required for USER role
  "employerId": "507f1f77bcf86cd799439012", // Required for EMPLOYER role
  "sendCredentials": true // Optional, default: true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {...},
  "credentialsSent": true
}
```

---

## 13.4 Update User Status
**Endpoint:** `PATCH /api/admin/users/:userId/status`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "Active" // or "Suspended", "Deactivated"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User status updated successfully"
}
```

---

## 13.5 Get User Applications
**Endpoint:** `GET /api/admin/users/:userId/applications`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Success Response (200):**
```json
{
  "success": true,
  "applications": [...],
  "pagination": {...}
}
```

---

## 13.6 Get User Transactions
**Endpoint:** `GET /api/admin/users/:userId/transactions`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "transactions": [...],
  "pagination": {...}
}
```

---

# 14. Outlet Management (ReactJS)

## 14.1 Get All Outlets
**Endpoint:** `GET /api/admin/outlets`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `employerId` (optional): Filter by employer
- `search` (optional): Search query

**Success Response (200):**
```json
{
  "success": true,
  "outlets": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "outletName": "Orchard Branch",
      "outletAddress": "123 Orchard Road",
      "managerName": "Jane Doe",
      "contactNumber": "+6511112222",
      "openingHours": "09:00",
      "closingHours": "17:00",
      "isActive": true,
      "employer": {
        "_id": "507f1f77bcf86cd799439012",
        "companyLegalName": "ABC Restaurant Pte Ltd"
      }
    }
  ],
  "pagination": {...}
}
```

---

## 14.2 Get Outlet by ID
**Endpoint:** `GET /api/admin/outlets/:outletId`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "outlet": {...}
}
```

---

## 14.3 Create Outlet
**Endpoint:** `POST /api/admin/outlets`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "outletName": "Orchard Branch",
  "outletAddress": "123 Orchard Road",
  "managerName": "Jane Doe",
  "contactNumber": "+6511112222",
  "employerId": "507f1f77bcf86cd799439012",
  "openingHours": "09:00", // Optional
  "closingHours": "17:00", // Optional
  "isActive": true // Optional, default: true
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

## 14.4 Delete Outlet
**Endpoint:** `DELETE /api/admin/employers/:employerId/outlets/:outletId`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Outlet deleted successfully"
}
```

---

## 14.5 Update Outlet Status
**Endpoint:** `PATCH /api/admin/employers/:employerId/outlets/:outletId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Outlet status updated successfully"
}
```

---

## 14.6 Get Outlet Attendance
**Endpoint:** `GET /api/admin/outlets/:outletId/attendance`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "attendance": [...]
}
```

---

# 15. Candidate Management (ReactJS)

## 15.1 Get All Candidates
**Endpoint:** `GET /api/admin/candidates`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search query
- `status` (optional): Filter by status

**Success Response (200):**
```json
{
  "success": true,
  "candidates": [...],
  "pagination": {...}
}
```

---

## 15.2 Get Candidate Profile
**Endpoint:** `GET /api/admin/candidates/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "candidate": {...}
}
```

---

## 15.3 Update Candidate
**Endpoint:** `PUT /api/admin/candidates/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "Verified",
  "notes": "Profile verified"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Candidate updated successfully"
}
```

---

## 15.4 Verify Candidate
**Endpoint:** `PUT /api/admin/verify-candidate/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Candidate verified successfully"
}
```

---

## 15.5 Delete Candidate
**Endpoint:** `DELETE /api/admin/candidates/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Candidate deleted successfully"
}
```

---

# 16. Payment Management (ReactJS)

## 16.1 Get All Transactions
**Endpoint:** `GET /api/admin/payments/transactions`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Success Response (200):**
```json
{
  "success": true,
  "transactions": [...],
  "pagination": {...}
}
```

---

## 16.2 Approve Transaction
**Endpoint:** `PUT /api/admin/payments/transactions/:transactionId/approve`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transaction approved successfully"
}
```

---

## 16.3 Reject Transaction
**Endpoint:** `PUT /api/admin/payments/transactions/:transactionId/reject`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "Insufficient documentation" // Optional
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

## 16.4 Bulk Approve Transactions
**Endpoint:** `POST /api/admin/payments/transactions/bulk-approve`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "transactionIds": [
    "507f1f77bcf86cd799439020",
    "507f1f77bcf86cd799439021"
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transactions approved successfully",
  "approved": 2,
  "failed": 0
}
```

---

## 16.5 Generate Payslip
**Endpoint:** `POST /api/admin/payments/generate-payslip/:transactionId`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payslip generated successfully",
  "payslipUrl": "https://worklah.onrender.com/payslips/..."
}
```

---

# 17. Reports & Analytics (ReactJS)

## 17.1 Get Reports
**Endpoint:** `GET /api/admin/reports`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `type` (optional): Report type
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `employerId` (optional): Filter by employer

**Success Response (200):**
```json
{
  "success": true,
  "reports": {...}
}
```

---

# 18. Settings & Configuration (ReactJS)

## 18.1 Get System Settings
**Endpoint:** `GET /api/admin/settings`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "settings": {...}
}
```

---

## 18.2 Update System Settings
**Endpoint:** `PUT /api/admin/settings`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "settingName": "value"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

---

## 18.3 Get Rate Configuration
**Endpoint:** `GET /api/admin/rate-configuration`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "rateConfiguration": {...}
}
```

---

## 18.4 Update Rate Configuration
**Endpoint:** `PUT /api/admin/rate-configuration`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "hourlyRate": 15,
  "dailyRate": 120
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Rate configuration updated successfully"
}
```

---

## 18.5 Get Penalties
**Endpoint:** `GET /api/admin/penalties`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "penalties": [...]
}
```

---

## 18.6 Get Postal Code Info
**Endpoint:** `GET /api/admin/postal-code/:postalCode`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "address": "123 Main Street, Singapore"
}
```

---

## 18.7 Get Schools
**Endpoint:** `GET /api/admin/schools`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "schools": [...]
}
```

---

# 19. Notifications (Admin - ReactJS)

Admin sees **applicants on a particular job through notifications**; clicking the notification link should open **application detail**. Notifications include `applicationId` and `jobId` for this.

## 19.1 Get All Notifications
**Endpoint:** `GET /api/admin/notifications`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): Filter by type (e.g. `NEW_APPLICANT`)
- `source` (optional): `admin` (default) returns admin notifications (new applicants, etc.)

**Success Response (200):**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439099",
      "title": "New applicant for job",
      "message": "John Doe applied for \"Waiter\" at ABC Restaurant.",
      "type": "NEW_APPLICANT",
      "jobId": "507f1f77bcf86cd799439011",
      "applicationId": "507f1f77bcf86cd799439016",
      "userId": "507f1f77bcf86cd799439011",
      "isRead": false,
      "createdAt": "2025-01-30T10:00:00Z"
    }
  ],
  "pagination": { "currentPage": 1, "totalPages": 1, "totalItems": 1, "itemsPerPage": 20 }
}
```

**For App/Web:** Use `applicationId` to open application detail (e.g. `GET /api/admin/applications/:applicationId` or navigate to `/applications/:applicationId`). Use `jobId` to filter applicants by job.

---

## 19.2 Send Notification
**Endpoint:** `POST /api/admin/notifications/send`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011", // Optional, omit for broadcast
  "title": "Notification Title",
  "message": "Notification message",
  "type": "Job" // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

---

## 19.3 Mark Notification as Read
**Endpoint:** `PUT /api/admin/notifications/:notificationId/read`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 19.4 Mark All Notifications as Read
**Endpoint:** `PUT /api/admin/notifications/read-all`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

# 20. Timesheet Management (ReactJS)

## 20.1 Get All Timesheets
**Endpoint:** `GET /api/admin/timesheets`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `employerId` (optional): Filter by employer

**Success Response (200):**
```json
{
  "success": true,
  "timesheets": [...],
  "pagination": {...}
}
```

---

## 20.2 Generate Timesheet
**Endpoint:** `POST /api/admin/timesheets/generate`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "employerId": "507f1f77bcf86cd799439012",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Timesheet generated successfully",
  "timesheet": {...}
}
```

---

## 20.3 Send Timesheet Email
**Endpoint:** `POST /api/admin/timesheets/:timesheetId/send-email`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Timesheet email sent successfully"
}
```

---

## 20.4 Download Timesheet
**Endpoint:** `GET /api/admin/timesheets/:timesheetId/download`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
- Returns PDF file download

---

# 21. QR Code Management (ReactJS)

## 21.1 Get All QR Codes
**Endpoint:** `GET /api/admin/qr-codes`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `employerId` (optional): Filter by employer
- `outletId` (optional): Filter by outlet
- `jobId` (optional): Filter by job

**Success Response (200):**
```json
{
  "success": true,
  "qrCodes": [
    {
      "_id": "507f1f77bcf86cd799439019",
      "employerId": "507f1f77bcf86cd799439012",
      "outletId": "507f1f77bcf86cd799439013",
      "jobId": "507f1f77bcf86cd799439011",
      "qrCodeUrl": "https://worklah.onrender.com/qr-codes/...",
      "createdAt": "2025-01-10T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

## 20.2 Generate QR Code
**Endpoint:** `POST /api/admin/qr-codes/generate`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "employerId": "507f1f77bcf86cd799439012",
  "outletId": "507f1f77bcf86cd799439013",
  "jobId": "507f1f77bcf86cd799439011"
}
```

**Required Fields:**
- `employerId` (string)
- `outletId` (string)
- `jobId` (string)

**Success Response (201):**
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "qrCode": {
    "_id": "507f1f77bcf86cd799439019",
    "qrCodeUrl": "https://worklah.onrender.com/qr-codes/..."
  }
}
```

---

## 21.3 Delete QR Code
**Endpoint:** `DELETE /api/admin/qr-codes/:qrCodeId`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "QR code deleted successfully"
}
```

---

# 22. Additional Admin Endpoints (ReactJS)

## 22.1 Get Posted Jobs Summary
**Endpoint:** `GET /api/admin/jobs/posted-summary`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "summary": {...}
}
```

---

## 22.2 Get All Posted Jobs
**Endpoint:** `GET /api/admin/jobs/view-list`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [...]
}
```

---

## 22.3 Get Posted Jobs List
**Endpoint:** `GET /api/admin/jobs/list`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [...]
}
```

---

## 22.4 Get Revenue Stats
**Endpoint:** `GET /api/admin/revenue/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "revenue": {...}
}
```

---

## 22.5 Get Application Details
**Endpoint:** `GET /api/admin/applications/details`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "applications": [...]
}
```

---

## 22.6 Get New Registrations
**Endpoint:** `GET /api/admin/users/new-registrations`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "users": [...]
}
```

---

## 22.7 Get Pending Payments
**Endpoint:** `GET /api/admin/payments/pending`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "payments": [...]
}
```

---

## 22.8 Get Verification Status
**Endpoint:** `GET /api/admin/verification/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "verification": {...}
}
```

---

## 22.9 Get No-Show Count
**Endpoint:** `GET /api/admin/attendance/no-show`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "noShowCount": 5
}
```

---

## 22.10 Get Registered Users
**Endpoint:** `GET /api/admin/users/registered`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "users": [...]
}
```

---

## 22.11 Upload Admin Profile Image
**Endpoint:** `POST /api/admin/profile/upload-image`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
- `image` (required): Image file

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "imageUrl": "https://worklah.onrender.com/uploads/admin-profile.jpg"
}
```

---

## 22.12 Get Admin Profile Image
**Endpoint:** `GET /api/admin/profile/image`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "imageUrl": "https://worklah.onrender.com/uploads/admin-profile.jpg"
}
```

---

# 23. Support (React Native)

## 23.1 Submit Feedback
**Endpoint:** `POST /api/support/feedback`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "subject": "Issue with payment",
  "message": "Detailed feedback message",
  "category": "Technical" // or "Billing", "General"
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

# 24. Response Format Standards

**Requirement:** Success and failure APIs must **indicate the main cause** clearly so App and Web can show the right message.

## Success Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... } // or specific fields like "job", "employer", "applications", etc.
}
```

## Error Response Format
- **`message`** = **main cause** (user-facing; show this to the user).
- **`error`** = **error code** (e.g. `ValidationError`, `NotFound`, `DuplicateKeyError`) for client logic.

```json
{
  "success": false,
  "message": "Clear, actionable error message (main cause)",
  "error": "ErrorType"
}
```

## Pagination Format
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

# 22. Error Handling

## HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Use response data |
| 201 | Created | Use created resource |
| 400 | Bad Request | Show `message` to user |
| 401 | Unauthorized | Clear token, redirect to login |
| 403 | Forbidden | Show "access denied" |
| 404 | Not Found | Show "not found" message |
| 409 | Conflict | Show `message` (e.g., duplicate) |
| 500 | Server Error | Show generic error, retry later |

## Common Error Types

- `ValidationError`: Invalid input data
- `NotFoundError`: Resource not found
- `AuthenticationError`: Invalid or expired token
- `ForbiddenError`: Insufficient permissions
- `DuplicateKeyError`: Duplicate entry (email, phone, etc.)
- `InternalServerError`: Server-side error
- `NoVacancyError`: No vacancies available
- `DuplicateApplicationError`: Already applied for this shift

## Error Response Examples

```json
{
  "success": false,
  "message": "Please complete your profile before applying for jobs. Go to your profile settings to complete it.",
  "error": "ValidationError"
}
```

```json
{
  "success": false,
  "message": "No vacancies available for this shift. All positions have been filled.",
  "error": "NoVacancyError"
}
```

```json
{
  "success": false,
  "message": "You have already applied for this shift. Check your applications to see the status.",
  "error": "DuplicateApplicationError"
}
```

---

# 26. Authentication & Authorization

## Token Management

### Getting Token
- **React Native:** Store token from login/verify-otp response
- **ReactJS:** Store token from admin/login response

### Using Token
Include in all protected endpoints:
```
Authorization: Bearer <token>
```

### Token Expiration
- Tokens expire after 7 days (604800 seconds)
- Handle 401 responses by redirecting to login
- Refresh token if refresh endpoint available

## Role-Based Access

- **USER:** Can access user endpoints (`/api/user/*`, `/api/jobs/*`)
- **ADMIN:** Can access admin endpoints (`/api/admin/*`)
- **EMPLOYER:** Can access employer-specific endpoints

---

# Important Notes

## For React Native Developers

1. **Always check `success` field** in responses before using data
2. **Show `message` field** to users for notifications (success and error)
3. **Handle errors gracefully** - show user-friendly messages
4. **Store token securely** in AsyncStorage
5. **Include token in headers** for all protected endpoints
6. **Handle 401 errors** by clearing token and redirecting to login
7. **Job endpoints include deadline and status** - use `applicationDeadline` or `deadline` field
8. **Application status** - Check `adminStatus` field (Pending, Approved, Rejected)

## For ReactJS Developers

1. **Outlets are OPTIONAL** when creating employers - can be added later
2. **All employer GET endpoints include outlets array** (required for job creation dropdown)
3. **Use multipart/form-data** for file uploads (employer creation/update)
4. **Check response `success` field** before processing data
5. **Show error `message`** to admin users for notifications
6. **Handle pagination** using pagination object in responses
7. **Application approval/rejection** - Use `POST /api/admin/applications/:applicationId/approve` or `/reject`
8. **Job creation** - Ensure employer has outlets before creating jobs (or use manual address)
9. **Hustle Heroes Page** - Use `GET /api/admin/users?role=USER` to get ONLY users (not admins or employers)
10. **Data Separation** - Each endpoint returns ONLY its specific data type:
    - `/api/admin/users?role=USER` → Only users with role="USER"
    - `/api/admin/employers` → Only employers
    - `/api/admin/jobs/candidates/:jobId` → Only applicants for that specific job
    - `/api/admin/applications` → All applications across all jobs
11. **User Profile Fields** - When fetching users, all profile fields are included (nric, dob, gender, age, registrationDate, workPassStatus)

## Data Formats

- **Dates:** `YYYY-MM-DD` (e.g., `2025-01-15`)
- **DateTime:** ISO 8601 format (e.g., `2025-01-15T10:00:00Z`)
- **Time:** `HH:mm` format (e.g., `09:00`, `17:00`)
- **IDs:** MongoDB ObjectId or custom format (EMP-xxxx, JOB-xxxx)

## Job Status Values

- `Active`: Job is active and accepting applications
- `Upcoming`: Job is scheduled for future
- `Completed`: Job has been completed
- `Cancelled`: Job has been cancelled
- `Suspended`: Job is temporarily suspended
- `Filled`: All positions filled
- `Expired`: Application deadline passed
- `Pending`: Job is pending approval
- `Ongoing`: Job is currently ongoing
- `Deactivated`: Job has been deactivated

## Application Status Values

- `Pending`: Waiting for admin approval
- `Confirmed` / `Approved`: Application approved (adminStatus: "Confirmed", status: "Upcoming")
- `Rejected`: Application rejected (adminStatus: "Rejected", status: "Rejected")
- `Cancelled`: Application cancelled by user (status: "Cancelled")
- `Upcoming`: Application approved and job is upcoming
- `Completed`: Job completed

## Industry Values

- `Hospitality`
- `IT`
- `F&B`
- `Hotel`
- `Retail`
- `Logistics`
- `Healthcare`
- `Education`
- `Construction`
- `Others`

---

# Testing Checklist

## React Native App
- [ ] User registration
- [ ] OTP login flow
- [ ] Browse jobs with filters
- [ ] View job details (Job Title, Responsibilities, requirements, deadline and status)
- [ ] Apply for job (select shift → JobApplyShifts → JobConfirmBooking → submit)
- [ ] View applications (with status filter)
- [ ] Cancel application
- [ ] Bookmark / save jobs (Saved jobs screen, from Home header)
- [ ] View ongoing/completed/cancelled jobs
- [ ] View notifications
- [ ] Clock in/out
- [ ] Scan QR code

## ReactJS Admin Panel
- [ ] Admin login
- [ ] View dashboard statistics
- [ ] Create employer (with and without outlets)
- [ ] Update employer (add outlets later)
- [ ] View all employers (verify outlets array included)
- [ ] Create job
- [ ] View all jobs
- [ ] View applications
- [ ] Approve/reject applications
- [ ] Bulk approve/reject applications
- [ ] View users
- [ ] View reports
- [ ] Generate QR codes

---

# Quick Reference

## React Native - Most Used Endpoints

1. **Login:** `POST /api/user/login` → `POST /api/user/verify-otp`
2. **Get Jobs:** `GET /api/jobs`
3. **Get Job Details:** `GET /api/jobs/:id` (app shows Job Title, Responsibilities from `jobScope`, requirements)
4. **Apply:** `POST /api/jobs/:jobId/apply` — body: `{ shiftId, date }` (YYYY-MM-DD)
5. **Get Applications:** `GET /api/user/applications`
6. **Get Upcoming Shifts:** `GET /api/qr/upcoming`
7. **Cancel Application:** `POST /api/jobs/:jobId/cancel`
8. **Get Ongoing Jobs:** `GET /api/jobs/ongoing`
9. **Validate Barcode (shift check-in):** `POST /api/qr/validate-barcode` — body: `{ "barcode" }` or `{ "userId" }`
10. **Clock In/Out:** `POST /api/qr/clock-in`, `POST /api/qr/clock-out`
11. **Wallet:** `GET /api/wallet`
12. **Saved jobs:** Client-side only (AsyncStorage); optional future: `GET/POST/DELETE /api/user/saved-jobs`

## ReactJS Admin - Most Used Endpoints

1. **Login:** `POST /api/admin/login`
2. **Dashboard:** `GET /api/admin/dashboard/stats`
3. **Create Employer:** `POST /api/admin/employers` (outlets optional)
4. **Get Employers:** `GET /api/admin/employers` (includes outlets)
5. **Create Job:** `POST /api/admin/jobs/create`
6. **Get Applications:** `GET /api/admin/applications`
7. **Approve Application:** `POST /api/admin/applications/:applicationId/approve`
8. **Reject Application:** `POST /api/admin/applications/:applicationId/reject`
9. **Admin Notifications (new applicants):** `GET /api/admin/notifications` — use `applicationId` in each notification to open application detail
10. **Payment (release/history):** `GET /api/admin/payments/transactions`, `PUT /api/admin/payments/transactions/:transactionId/approve`

---

**Document Version:** 2.3  
**Last Updated:** January 26, 2026  
**Backend Completion:** ~85-90%  
**Status:** ✅ Ready for Frontend Integration. App: Job Title + Responsibilities UI, full apply flow, saved jobs (client-side).

---

## 📊 Endpoint Summary

### React Native (User App) - Total: ~25 Endpoints
- **Authentication:** 6 endpoints (register, login, verify-otp, me, logout, forgot-password)
- **Jobs:** 6 endpoints (get all, get by id, search, ongoing, completed, cancelled)
- **Applications:** 3 endpoints (apply, cancel, get applications, get details)
- **Profile:** 1 endpoint (get profile)
- **Notifications:** 1 endpoint (get notifications)
- **Wallet:** 2 endpoints (balance, transactions)
- **Attendance:** 4 endpoints (clock-in, clock-out, scan QR, **validate-barcode** for shift check-in)
- **Support:** 1 endpoint (submit feedback)

### ReactJS (Admin Panel) - Total: ~80+ Endpoints
- **Authentication:** 3 endpoints (login, logout, me)
- **Dashboard:** 3 endpoints (stats, charts, overview)
- **Employers:** 6 endpoints (get all, get by id, create, update, delete, outlet overview)
- **Jobs:** 11 endpoints (get all, get by id, create, update, delete, status, duplicate, deactivate, cancel, candidates, deployment tracking)
- **Applications:** 6 endpoints (get all, get by id, approve, reject, bulk-action, update status)
- **Users:** 6 endpoints (get all, get by id, create, update status, get applications, get transactions)
- **Outlets:** 6 endpoints (get all, get by id, create, delete, update status, attendance)
- **Candidates:** 5 endpoints (get all, get by id, update, verify, delete)
- **Payments:** 5 endpoints (get transactions, approve, reject, bulk-approve, generate payslip)
- **Reports:** 1 endpoint (get reports)
- **Settings:** 7 endpoints (get/update settings, rate config, penalties, postal code, schools)
- **Notifications:** 4 endpoints (get all, send, mark read, mark all read)
- **QR Codes:** 3 endpoints (get all, generate, delete)
- **Timesheets:** 4 endpoints (get all, generate, send email, download)
- **Additional:** 12 endpoints (various admin utilities)

---

## 🎯 Key Features Implemented

### ✅ Backend Features Completed

1. **Standardized API Responses**
   - All endpoints return `success`, `message`, and `data`/`error` fields
   - Clear, actionable error messages for frontend notifications
   - Consistent response format across all endpoints

2. **Employer Management**
   - ✅ Create employer (outlets optional)
   - ✅ Update employer (can add outlets later)
   - ✅ Get all employers (includes outlets array - CRITICAL)
   - ✅ Get single employer (includes outlets)
   - ✅ Delete employer

3. **Job Management**
   - ✅ Create job (with complete validation)
   - ✅ Get all jobs (with deadline and status)
   - ✅ Get job by ID (complete details)
   - ✅ Update job
   - ✅ Delete job
   - ✅ Change job status
   - ✅ Job search and filtering

4. **Application Management**
   - ✅ Apply for job (with validations)
   - ✅ Cancel application (with penalty calculation)
   - ✅ Get user applications (with status filter)
   - ✅ Admin approve/reject applications
   - ✅ Bulk approve/reject
   - ✅ Get application details

5. **User Management**
   - ✅ User registration (OTP-based)
   - ✅ User login (OTP-based)
   - ✅ Get user profile
   - ✅ Admin user management
   - ✅ User applications tracking

6. **Dashboard & Analytics**
   - ✅ Dashboard statistics
   - ✅ Dashboard charts
   - ✅ Revenue stats
   - ✅ Application details

7. **Complete Job Information**
   - ✅ All job endpoints include deadline (`applicationDeadline`, `deadline`)
   - ✅ All job endpoints include status (`jobStatus`, `status`)
   - ✅ Complete employer information
   - ✅ Complete outlet information (address, location)
   - ✅ All shift details with vacancy information

---

## ⚠️ Critical Notes for Developers

### For React Native Developers

1. **Always check `success` field** - Don't assume success based on HTTP status alone
2. **Show `message` to users** - All responses include user-friendly messages for notifications
3. **Handle 401 errors** - Clear token and redirect to login
4. **Job deadline** - Use `applicationDeadline` or `deadline` field to show deadline to users
5. **Application status** - Check `adminStatus` field (Pending, Approved, Rejected)
6. **Error messages are actionable** - They tell users what to do (e.g., "Please complete your profile first")

### For ReactJS Developers

1. **Outlets are OPTIONAL** - Employers can be created without outlets
2. **Outlets can be added later** - Via update employer endpoint
3. **All employer GET endpoints include outlets** - Required for job creation dropdown
4. **Use multipart/form-data** - For employer creation/update with file uploads
5. **Application approval** - Use `POST /api/admin/applications/:applicationId/approve`
6. **Application rejection** - Use `POST /api/admin/applications/:applicationId/reject`
7. **Check `success` field** - Before processing any response data
8. **Show error `message`** - To admin users for notifications

---

## Support

For any questions or issues:
- Check error `message` field for specific guidance
- Verify token is included in Authorization header
- Ensure request format matches documentation
- Check HTTP status codes for error type
- All endpoints return proper success/error notifications
- Review response examples in this documentation

---

---

## ✅ Coverage Checklist — Admin (ReactJS) & User (React Native)

### Admin (ReactJS) — All in this doc
| Requirement | Section | Endpoints / Notes |
|-------------|---------|--------------------|
| Add employer, Edit employer | 10 | 10.3 Create, 10.4 Update |
| Add job, Edit job, Post job with multiple shifts, Filters | 11 | 11.3 Create, 11.4 Update, 11.1 filters |
| See applicants on a job via notification + link to detail | 19 | 19.1 — use `applicationId`, `jobId` |
| See approved candidates | 11, 12 | 11.10 Get Job Candidates, 12.1 Applications (filter Approved) |
| Release payment, Payment history | 16 | 16.2 Approve, 16.1 Get All Transactions |
| User can request payment (admin approves/rejects) | 16, 6.3 | 16.1 (Pending), 16.2/16.3 |
| Unique barcode per outlet (shift login) | 10, 7.5 | Outlet `barcode` in 10.1/10.2; 7.5 Validate Barcode |

### User (React Native) — All in this doc
| Requirement | Section | Endpoints / Notes |
|-------------|---------|--------------------|
| Create profile, Browse jobs, Job details, Apply | 1, 2, 3, 4 | 1.x, 4.1; 2.1, 2.2, 2.3; 3.1 Apply |
| See upcoming jobs, See applied jobs | 7.1, 3.3 | GET /api/qr/upcoming; GET /api/user/applications |
| Notification when job confirmed, Dashboard info | 5 | 5.1 Get Notifications |
| Join shift via barcode scanner (or userId) | 7.2, 7.5 | 7.5 Validate Barcode; 7.2 Clock In |
| Request payment from admin (two-way payment) | 6, 16 | 6.1–6.3; admin 16.1–16.3 |

### Common
- **Response format:** Success/failure with **main cause** — Section 24 (`message` = main cause, `error` = code).

---

## Sharing This Document

- **React Native (App) developers:** Use sections **1–7** (Authentication, Jobs, Applications, Profile, Notifications, Wallet, Attendance & QR including **Get Upcoming Shifts** and **Validate Barcode**). Check **Response Format** and **Error Handling**; always show `message` as the main cause to users.
- **ReactJS (Admin) developers:** Use sections **8–22** (Admin Auth, Dashboard, Employers, Jobs, Applications, Users, Outlets, Candidates, Payments, Reports, Settings, **Notifications** with `applicationId`/`jobId`, Timesheets, QR Codes, Additional). Employer/outlet responses include **outlet barcode** for shift login.

**End of Documentation**
