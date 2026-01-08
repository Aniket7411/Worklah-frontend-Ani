# WorkLah Flutter Mobile App - API Documentation

**Document Version:** 1.0.0  
**Last Updated:** January 2025  
**Purpose:** Complete API specification for Flutter Mobile App  
**Backend:** Node.js/Express  
**Frontend:** Flutter (Dart) - User-facing Mobile App

---

## 🎯 **IMPORTANT: READ THIS FIRST**

This document contains **ALL API endpoints** required for the Flutter Mobile App. The Flutter app is used by end-users (workers) to browse jobs, apply, manage wallet, track attendance, and more.

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

3. **Token Management:**
   - Store token securely using Flutter secure storage
   - Token expires in 7 days (604800 seconds)
   - Include token in `Authorization: Bearer {token}` header

5. **Base URL:**
   ```
   Production: https://worklah-updated-dec.onrender.com/api
   Development: http://localhost:3000/api
   ```

---

## 📋 **Table of Contents**

1. [User Authentication](#1-user-authentication)
2. [Job Management](#2-job-management)
3. [Application Management](#3-application-management)
4. [Wallet & Payment Management](#4-wallet--payment-management)
5. [Attendance Management](#5-attendance-management)
6. [Notification Management](#6-notification-management)
7. [QR Code Management](#7-qr-code-management)
8. [User Profile Management](#8-user-profile-management)
9. [Support & Feedback](#9-support--feedback)

---

## 1. User Authentication

### 1.1 User Login (OTP-based)
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

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid phone number",
  "error": "ValidationError"
}
```

---

### 1.2 Verify OTP
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
    "profileCompleted": true,
    "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP",
  "error": "InvalidOTP"
}
```

---

### 1.3 Get Current User
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
    "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg",
    "dateOfBirth": "1990-01-01",
    "address": "123 Main Street",
    "nric": "S1234567A",
    "workPermit": "WP123456",
    "walletBalance": 150.50,
    "totalEarnings": 5000.00,
    "status": "active",
    "createdAt": "2024-01-15T10:00:00Z",
    "lastLogin": "2024-12-25T10:00:00Z"
  }
}
```

---

### 1.4 User Logout
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

### 1.5 Forgot Password
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

## 2. Job Management

### 2.1 Get All Jobs
**Endpoint:** `GET /api/jobs`  
**Access:** Public/User

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search in job title/description
- `status` (optional): Filter by status (Active, Upcoming, Completed)
- `location` (optional): Filter by location
- `date` (optional): Filter by job date (YYYY-MM-DD)
- `rateType` (optional): Filter by rate type (Hourly, Weekly, Monthly)

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "jobId": "JOB-1234",
      "jobName": "Waiter",
      "jobTitle": "Waiter",
      "jobDescription": "Serve customers...",
      "jobDate": "2024-12-25",
      "status": "Active",
      "employer": {
        "_id": "507f1f77bcf86cd799439012",
        "companyLegalName": "ABC Restaurant",
        "companyLogo": "https://worklah.onrender.com/uploads/logo.png"
      },
      "outlet": {
        "_id": "507f1f77bcf86cd799439013",
        "outletName": "Orchard Branch",
        "outletAddress": "123 Orchard Road"
      },
      "shifts": [
        {
          "_id": "...",
          "shiftDate": "2024-12-25",
          "startTime": "09:00",
          "endTime": "17:00",
          "rateType": "Hourly",
          "rates": 12.50,
          "totalWages": 100.00,
          "vacancy": 5,
          "vacancyFilled": 3,
          "standbyVacancy": 2
        }
      ],
      "skills": ["Customer service", "Food handling"],
      "dressCode": "Uniform provided",
      "applicationDeadline": "2024-12-24T23:59:59Z",
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

### 2.2 Get Single Job
**Endpoint:** `GET /api/jobs/:jobId`  
**Access:** Public/User

**Success Response (200):**
```json
{
  "success": true,
  "job": {
    "_id": "507f1f77bcf86cd799439011",
    "jobId": "JOB-1234",
    "jobName": "Waiter",
    "jobTitle": "Waiter",
    "jobDescription": "Serve customers...",
    "jobDate": "2024-12-25",
    "status": "Active",
    "employer": {
      "_id": "507f1f77bcf86cd799439012",
      "companyLegalName": "ABC Restaurant",
      "companyLogo": "https://worklah.onrender.com/uploads/logo.png"
    },
    "outlet": {
      "_id": "507f1f77bcf86cd799439013",
      "outletName": "Orchard Branch",
      "outletAddress": "123 Orchard Road",
      "latitude": 1.2966,
      "longitude": 103.8525
    },
    "shifts": [
      {
        "_id": "...",
        "shiftDate": "2024-12-25",
        "startTime": "09:00",
        "endTime": "17:00",
        "breakDuration": 1,
        "totalWorkingHours": 8,
        "rateType": "Hourly",
        "rates": 12.50,
        "totalWages": 100.00,
        "vacancy": 5,
        "vacancyFilled": 3,
        "standbyVacancy": 2
      }
    ],
    "skills": ["Customer service", "Food handling"],
    "dressCode": "Uniform provided",
    "applicationDeadline": "2024-12-24T23:59:59Z",
    "locationDetails": "Near MRT station",
    "createdAt": "2024-12-20T10:00:00Z"
  }
}
```

---

### 2.3 Apply for Job
**Endpoint:** `POST /api/jobs/:jobId/apply`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

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
  "application": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "jobId": "507f1f77bcf86cd799439012",
    "shiftId": "507f1f77bcf86cd799439013",
    "status": "Pending",
    "appliedAt": "2024-12-22T10:00:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Shift is full or already applied",
  "error": "ApplicationFailed"
}
```

---

### 2.4 Cancel Application
**Endpoint:** `POST /api/jobs/:jobId/cancel`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Request Body:**
```json
{
  "applicationId": "507f1f77bcf86cd799439014",
  "reason": "Personal reasons"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application cancelled successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot cancel application. Shift has started or completed.",
  "error": "CannotCancel"
}
```

---

### 2.5 Get User Jobs - Ongoing
**Endpoint:** `GET /api/user/jobs/ongoing`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

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
      "status": "Upcoming",
      "employer": {
        "companyLegalName": "ABC Restaurant"
      },
      "outlet": {
        "outletName": "Orchard Branch"
      },
      "application": {
        "_id": "...",
        "status": "Approved",
        "adminStatus": "Approved"
      },
      "shift": {
        "startTime": "09:00",
        "endTime": "17:00"
      }
    }
  ],
  "pagination": {...}
}
```

---

### 2.6 Get User Jobs - Completed
**Endpoint:** `GET /api/user/jobs/completed`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [...],
  "pagination": {...}
}
```

---

### 2.7 Get User Jobs - Cancelled
**Endpoint:** `GET /api/user/jobs/cancelled`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [...],
  "pagination": {...}
}
```

---

## 3. Application Management

### 3.1 Get User Applications
**Endpoint:** `GET /api/user/applications`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (Pending, Approved, Rejected)

**Success Response (200):**
```json
{
  "success": true,
  "applications": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "jobId": "507f1f77bcf86cd799439012",
      "job": {
        "jobName": "Waiter",
        "jobDate": "2024-12-25",
        "employer": {
          "companyLegalName": "ABC Restaurant"
        }
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

## 4. Wallet & Payment Management

### 4.1 Get User Wallet
**Endpoint:** `GET /api/user/wallet`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Success Response (200):**
```json
{
  "success": true,
  "wallet": {
    "balance": 150.50,
    "totalEarnings": 5000.00,
    "pendingCashout": 50.00,
    "availableBalance": 100.50,
    "totalTransactions": 25,
    "completedJobs": 15
  }
}
```

---

### 4.2 Get User Transactions
**Endpoint:** `GET /api/user/transactions`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): Filter by type (credit, debit)
- `status` (optional): Filter by status (pending, completed, failed)

**Success Response (200):**
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "transactionId": "TXN-123456",
      "type": "credit",
      "amount": 100.00,
      "description": "Payment for job JOB-1234",
      "status": "completed",
      "date": "2024-12-20T17:00:00Z",
      "job": {
        "jobName": "Waiter",
        "jobDate": "2024-12-25"
      }
    },
    {
      "_id": "507f1f77bcf86cd799439017",
      "transactionId": "TXN-123457",
      "type": "debit",
      "amount": 50.00,
      "description": "Cashout request",
      "status": "pending",
      "date": "2024-12-21T10:00:00Z"
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

### 4.3 Request Cashout
**Endpoint:** `POST /api/user/cashout`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Request Body:**
```json
{
  "amount": 100.00,
  "cashOutMethod": "PayNow",
  "accountDetails": {
    "accountNumber": "1234567890",
    "bankName": "DBS",
    "accountHolderName": "John Doe"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cashout request submitted successfully",
  "transaction": {
    "_id": "507f1f77bcf86cd799439019",
    "transactionId": "TXN-123458",
    "type": "debit",
    "amount": 100.00,
    "status": "pending",
    "cashOutMethod": "PayNow",
    "date": "2024-12-22T10:00:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Insufficient balance or amount below minimum",
  "error": "InsufficientBalance"
}
```

---

### 4.4 Get Cashout History
**Endpoint:** `GET /api/user/cashout/history`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status

**Success Response (200):**
```json
{
  "success": true,
  "cashouts": [
    {
      "_id": "507f1f77bcf86cd799439019",
      "transactionId": "TXN-123458",
      "amount": 100.00,
      "cashOutMethod": "PayNow",
      "status": "completed",
      "date": "2024-12-22T10:00:00Z",
      "processedAt": "2024-12-22T14:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

## 5. Attendance Management

### 5.1 Clock In
**Endpoint:** `POST /api/attendance/clock-in`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

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
    "userId": "507f1f77bcf86cd799439011",
    "jobId": "507f1f77bcf86cd799439012",
    "shiftId": "507f1f77bcf86cd799439013",
    "clockInTime": "2024-12-25T09:00:00Z",
    "clockInLocation": {
      "latitude": 1.2966,
      "longitude": 103.8525
    },
    "status": "in-progress"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "You are too far from the job location",
  "error": "LocationMismatch"
}
```

---

### 5.2 Clock Out
**Endpoint:** `POST /api/attendance/clock-out`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

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
    "clockInTime": "2024-12-25T09:00:00Z",
    "clockOutTime": "2024-12-25T17:00:00Z",
    "totalHours": 8,
    "clockOutLocation": {
      "latitude": 1.2966,
      "longitude": 103.8525
    },
    "status": "completed"
  }
}
```

---

### 5.3 Get User Attendance
**Endpoint:** `GET /api/user/attendance`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `jobId` (optional): Filter by job
- `date` (optional): Filter by date (YYYY-MM-DD)

**Success Response (200):**
```json
{
  "success": true,
  "attendance": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "jobId": "507f1f77bcf86cd799439012",
      "job": {
        "jobName": "Waiter",
        "jobDate": "2024-12-25",
        "employer": {
          "companyLegalName": "ABC Restaurant"
        }
      },
      "shiftId": "507f1f77bcf86cd799439013",
      "shift": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
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

## 6. Notification Management

### 6.1 Get User Notifications
**Endpoint:** `GET /api/user/notifications`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `read` (optional): Filter by read status (true/false)

**Success Response (200):**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "type": "Application",
      "title": "Application Approved",
      "message": "Your application for Waiter position has been approved",
      "read": false,
      "createdAt": "2024-12-22T10:00:00Z",
      "jobId": "507f1f77bcf86cd799439012"
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "type": "Payment",
      "title": "Payment Received",
      "message": "You have received $100.00 for job JOB-1234",
      "read": false,
      "createdAt": "2024-12-20T17:00:00Z"
    }
  ],
  "pagination": {...},
  "unreadCount": 5
}
```

---

### 6.2 Mark Notification as Read
**Endpoint:** `PUT /api/user/notifications/:notificationId/read`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 6.3 Mark All Notifications as Read
**Endpoint:** `PUT /api/user/notifications/read-all`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 7. QR Code Management

### 7.1 Scan QR Code
**Endpoint:** `POST /api/qr/scan`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

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
  "job": {
    "_id": "507f1f77bcf86cd799439012",
    "jobName": "Waiter",
    "jobDate": "2024-12-25"
  },
  "shift": {
    "_id": "507f1f77bcf86cd799439013",
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "action": "clock-in" // or "clock-out"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid QR code or QR code expired",
  "error": "InvalidQRCode"
}
```

---

## 8. User Profile Management

### 8.1 Get User Profile
**Endpoint:** `GET /api/user/profile`  
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
    "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg",
    "dateOfBirth": "1990-01-01",
    "address": "123 Main Street",
    "postalCode": "123456",
    "nric": "S1234567A",
    "workPermit": "WP123456",
    "schools": "National University of Singapore",
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phoneNumber": "+6598765432"
    },
    "bankDetails": {
      "accountNumber": "1234567890",
      "bankName": "DBS",
      "accountHolderName": "John Doe"
    },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 8.2 Update User Profile
**Endpoint:** `PUT /api/user/profile`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Content-Type:** `multipart/form-data` (if uploading profile picture)

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "user@example.com",
  "dateOfBirth": "1990-01-01",
  "address": "123 Main Street",
  "postalCode": "123456",
  "nric": "S1234567A",
  "workPermit": "WP123456",
  "schools": "National University of Singapore",
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phoneNumber": "+6598765432"
  },
  "bankDetails": {
    "accountNumber": "1234567890",
    "bankName": "DBS",
    "accountHolderName": "John Doe"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {...}
}
```

---

### 8.3 Upload Profile Picture
**Endpoint:** `POST /api/user/profile/picture`  
**Access:** User only

**Headers:** `Authorization: Bearer {userToken}`

**Content-Type:** `multipart/form-data`

**Request Body:**
- `profilePicture`: File (image)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg"
}
```

---

## 9. Support & Feedback

### 9.1 Submit Support Feedback
**Endpoint:** `POST /api/support/feedback`  
**Access:** Public/User

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "phoneNumber": "+6512345678",
  "subject": "Issue with payment",
  "message": "I'm having trouble with cashout...",
  "userId": "507f1f77bcf86cd799439011"
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

## 📝 **Flutter Implementation Guide**

### 1. API Service Setup

**Create:** `lib/services/api_service.dart`

```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = 'https://worklah-updated-dec.onrender.com/api';
  final Dio _dio = Dio();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService() {
    _dio.options.baseUrl = baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 10);
    
    // Add interceptor for token
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'authToken');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onResponse: (response, handler) {
        // Check success field
        if (response.data['success'] == false) {
          throw DioException(
            requestOptions: response.requestOptions,
            response: response,
            message: response.data['message'] ?? 'Request failed',
          );
        }
        return handler.next(response);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          // Handle unauthorized - clear token and redirect to login
          _storage.delete(key: 'authToken');
        }
        return handler.next(error);
      },
    ));
  }

  // Example: User Login
  Future<Map<String, dynamic>> login(String phoneNumber) async {
    final response = await _dio.post('/user/login', data: {
      'phoneNumber': phoneNumber,
    });
    return response.data;
  }

  // Example: Verify OTP
  Future<Map<String, dynamic>> verifyOTP(String phoneNumber, String otp) async {
    final response = await _dio.post('/user/verify-otp', data: {
      'phoneNumber': phoneNumber,
      'otp': otp,
    });
    
    // Store token if login successful
    if (response.data['success'] == true && response.data['token'] != null) {
      await _storage.write(key: 'authToken', value: response.data['token']);
    }
    
    return response.data;
  }

  // Example: Get Jobs
  Future<Map<String, dynamic>> getJobs({
    int page = 1,
    int limit = 20,
    String? search,
    String? status,
  }) async {
    final queryParams = {
      'page': page,
      'limit': limit,
      if (search != null) 'search': search,
      if (status != null) 'status': status,
    };
    
    final response = await _dio.get('/jobs', queryParameters: queryParams);
    return response.data;
  }

  // Example: Apply for Job
  Future<Map<String, dynamic>> applyForJob(String jobId, String shiftId) async {
    final response = await _dio.post('/jobs/$jobId/apply', data: {
      'shiftId': shiftId,
    });
    return response.data;
  }

  // Example: Get Wallet
  Future<Map<String, dynamic>> getWallet() async {
    final response = await _dio.get('/user/wallet');
    return response.data;
  }

  // Example: Clock In
  Future<Map<String, dynamic>> clockIn({
    required String jobId,
    required String shiftId,
    required double latitude,
    required double longitude,
  }) async {
    final response = await _dio.post('/attendance/clock-in', data: {
      'jobId': jobId,
      'shiftId': shiftId,
      'latitude': latitude,
      'longitude': longitude,
    });
    return response.data;
  }
}
```

---

### 2. Response Handling Pattern

**Always check `success` field:**

```dart
try {
  final response = await apiService.getJobs();
  
  if (response['success'] == true) {
    final jobs = response['jobs'] as List;
    final pagination = response['pagination'];
    // Process data
  } else {
    // Handle error
    final message = response['message'] ?? 'Request failed';
    showError(message);
  }
} catch (e) {
  // Handle exception
  showError(e.toString());
}
```

---

### 3. Token Management

**Store token securely:**

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = const FlutterSecureStorage();

// Save token after login
await storage.write(key: 'authToken', value: token);

// Get token
final token = await storage.read(key: 'authToken');

// Delete token on logout
await storage.delete(key: 'authToken');
```

---

### 4. Error Handling

**Handle different error types:**

```dart
try {
  final response = await apiService.applyForJob(jobId, shiftId);
  // Success
} on DioException catch (e) {
  if (e.response?.statusCode == 401) {
    // Unauthorized - redirect to login
    navigateToLogin();
  } else if (e.response?.statusCode == 400) {
    // Bad request - show error message
    final message = e.response?.data['message'] ?? 'Request failed';
    showError(message);
  } else {
    // Other errors
    showError('Something went wrong. Please try again.');
  }
} catch (e) {
  // Network or other errors
  showError('Network error. Please check your connection.');
}
```

---

## ✅ **Flutter App Checklist**

### Authentication:
- [ ] OTP-based login implemented
- [ ] OTP verification implemented
- [ ] Token stored securely
- [ ] Auto-logout on token expiry
- [ ] Protected routes implemented

### Job Management:
- [ ] Job browsing with filters
- [ ] Job details view
- [ ] Job application flow
- [ ] View user's jobs (ongoing, completed, cancelled)
- [ ] Cancel application functionality

### Wallet & Payments:
- [ ] Wallet balance display
- [ ] Transaction history
- [ ] Cashout request
- [ ] Cashout history

### Attendance:
- [ ] Clock in functionality
- [ ] Clock out functionality
- [ ] Attendance history
- [ ] Location verification

### Notifications:
- [ ] Notification list
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Push notifications (if implemented)

### Profile:
- [ ] View profile
- [ ] Update profile
- [ ] Upload profile picture

### QR Code:
- [ ] QR code scanning
- [ ] QR code validation

### Support:
- [ ] Submit feedback

---

## 🔗 **Quick Reference: All Flutter Endpoints**

### Authentication:
- `POST /api/user/login` - Send OTP
- `POST /api/user/verify-otp` - Verify OTP and login
- `GET /api/user/me` - Get current user
- `POST /api/user/logout` - Logout
- `POST /api/user/forgot-password` - Forgot password

### Jobs:
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:jobId` - Get single job
- `POST /api/jobs/:jobId/apply` - Apply for job
- `POST /api/jobs/:jobId/cancel` - Cancel application
- `GET /api/user/jobs/ongoing` - Get ongoing jobs
- `GET /api/user/jobs/completed` - Get completed jobs
- `GET /api/user/jobs/cancelled` - Get cancelled jobs

### Applications:
- `GET /api/user/applications` - Get user applications

### Wallet:
- `GET /api/user/wallet` - Get wallet balance
- `GET /api/user/transactions` - Get transactions
- `POST /api/user/cashout` - Request cashout
- `GET /api/user/cashout/history` - Get cashout history

### Attendance:
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out
- `GET /api/user/attendance` - Get attendance history

### Notifications:
- `GET /api/user/notifications` - Get notifications
- `PUT /api/user/notifications/:id/read` - Mark as read
- `PUT /api/user/notifications/read-all` - Mark all as read

### QR Code:
- `POST /api/qr/scan` - Scan QR code

### Profile:
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/profile/picture` - Upload profile picture

### Support:
- `POST /api/support/feedback` - Submit feedback

**Total Flutter Endpoints: ~25**

---

## 📝 **Important Notes**

1. **All endpoints require `success` field in response**
2. **All authenticated endpoints require `Authorization: Bearer {token}` header**
3. **Use secure storage for tokens in Flutter**
4. **Handle network errors gracefully**
5. **Check `success` field before processing response data**

---

## 🚀 **Deployment Checklist**

- [ ] API base URL configured correctly
- [ ] All endpoints match this documentation
- [ ] Response handling checks `success` field
- [ ] Token management implemented securely
- [ ] Error handling implemented
- [ ] All features tested
- [ ] Ready for deployment

---

**END OF FLUTTER API DOCUMENTATION**

**Document Status:** ✅ **READY FOR FLUTTER DEVELOPMENT**  
**Last Updated:** January 2025  
**Version:** 1.0.0

**📌 Share this file (`FLUTTER.md`) with your Flutter developer.**

