# Complete Backend API Documentation

**Generated:** Today  
**Project:** WorkLah Admin Panel - Complete Implementation

---

## 📋 Table of Contents

1. [QR Code Management APIs](#qr-code-management-apis)
2. [Enhanced Payment/Transaction APIs](#enhanced-paymenttransaction-apis)
3. [Notification System APIs](#notification-system-apis)
4. [Timesheet Management APIs](#timesheet-management-apis)
5. [Admin User Creation APIs](#admin-user-creation-apis)
6. [Report Generation APIs](#report-generation-apis)

---

## 1. QR Code Management APIs

### Generate QR Code for Employer-Outlet
**POST** `/api/admin/qr-codes/generate`

**Request Body:**
```json
{
  "employerId": "string (required)",
  "outletId": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "qrCode": {
    "_id": "string",
    "qrCodeId": "A-1", // Format: {employerLetter}-{outletNumber}
    "employerId": "string",
    "outletId": "string",
    "qrData": "JSON string containing employer and outlet info",
    "status": "Active" | "Inactive",
    "generatedAt": "ISO date string"
  }
}
```

### Get All QR Codes
**GET** `/api/admin/qr-codes`

**Query Parameters:**
- `employerId` (optional): Filter by employer
- `outletId` (optional): Filter by outlet
- `status` (optional): Filter by status (Active/Inactive)

**Response:**
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

### Delete QR Code
**DELETE** `/api/admin/qr-codes/:qrCodeId`

**Response:**
```json
{
  "success": true,
  "message": "QR code deleted successfully"
}
```

---

## 2. Enhanced Payment/Transaction APIs

### Add New Transaction
**POST** `/api/admin/payments/transactions`

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

**Response:**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "transaction": {
    "_id": "string",
    "transactionId": "TXN-123456",
    "userId": "string",
    "worker": {
      "_id": "string",
      "fullName": "string",
      "nric": "string",
      "profilePicture": "string",
      "mobileNumber": "string"
    },
    "amount": 150.00,
    "type": "Salary",
    "shiftId": "string (if applicable)",
    "dateOfShiftCompleted": "ISO date string",
    "transactionDateTime": "ISO date string",
    "status": "Pending",
    "remarks": "string"
  }
}
```

### Get All Transactions
**GET** `/api/admin/transactions`

**Query Parameters:**
- `type`: "credit" | "debit"
- `status`: "Pending" | "Paid" | "Rejected"
- `userId` (optional): Filter by user
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "string",
      "transactionId": "TXN-123456",
      "shiftId": "string (if applicable)",
      "worker": {
        "id": "string",
        "fullName": "string",
        "nric": "string",
        "profilePicture": "string",
        "mobileNumber": "string"
      },
      "amount": 150.00,
      "type": "Salary",
      "shiftDate": "ISO date string",
      "dateOfShiftCompleted": "ISO date string",
      "transactionDateTime": "ISO date string",
      "status": "Paid",
      "remarks": "string"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100
  }
}
```

### Approve Transaction
**PUT** `/api/admin/payments/transactions/:transactionId/approve`

**Response:**
```json
{
  "success": true,
  "message": "Transaction approved successfully"
}
```

### Reject Transaction
**PUT** `/api/admin/payments/transactions/:transactionId/reject`

**Request Body:**
```json
{
  "reason": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction rejected successfully"
}
```

### Bulk Approve Transactions
**POST** `/api/admin/payments/transactions/bulk-approve`

**Request Body:**
```json
{
  "transactionIds": ["string", "string"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transactions approved successfully",
  "approvedCount": 5
}
```

### Generate Payslip
**POST** `/api/admin/payments/generate-payslip/:transactionId`

**Response:**
```json
{
  "success": true,
  "payslipUrl": "https://...",
  "message": "Payslip generated successfully"
}
```

---

## 3. Notification System APIs

### Send Notification
**POST** `/api/admin/notifications/send`

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

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "notification": {
    "_id": "string",
    "userId": "string (or null if sent to all)",
    "employerId": "string (or null)",
    "type": "System",
    "title": "string",
    "message": "string",
    "read": false,
    "createdAt": "ISO date string"
  }
}
```

### Get Notifications
**GET** `/api/admin/notifications`

**Query Parameters:**
- `limit` (optional): Number of notifications to return
- `read` (optional): Filter by read status (true/false)
- `type` (optional): Filter by type

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "string",
      "userId": "string (or null)",
      "employerId": "string (or null)",
      "type": "System",
      "title": "string",
      "message": "string",
      "read": false,
      "createdAt": "ISO date string"
    }
  ],
  "unreadCount": 5
}
```

### Mark Notification as Read
**PUT** `/api/admin/notifications/:notificationId/read`

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Mark All Notifications as Read
**PUT** `/api/admin/notifications/read-all`

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 4. Timesheet Management APIs

### Generate Timesheet
**POST** `/api/admin/timesheets/generate`

**Request Body:**
```json
{
  "jobId": "string (required)",
  "date": "ISO date string (required)",
  "autoEmail": "boolean (optional, default: true)"
}
```

**Response:**
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

### Get All Timesheets
**GET** `/api/admin/timesheets`

**Query Parameters:**
- `jobId` (optional): Filter by job
- `status` (optional): Filter by status
- `type` (optional): Filter by type

**Response:**
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

### Send Timesheet Email
**POST** `/api/admin/timesheets/:timesheetId/send-email`

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

### Download Timesheet
**GET** `/api/admin/timesheets/:timesheetId/download`

**Query Parameters:**
- `format`: "pdf" | "excel"

**Response:**
- File download (PDF or Excel)

---

## 5. Admin User Creation APIs

### Create User Account
**POST** `/api/admin/users/create`

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

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "_id": "string",
    "fullName": "string",
    "email": "string",
    "role": "USER",
    "nric": "string",
    "phoneNumber": "string",
    "createdAt": "ISO date string"
  },
  "credentialsSent": true
}
```

### Get Users
**GET** `/api/admin/users`

**Query Parameters:**
- `search` (optional): Search by name, email, or NRIC
- `nric` (optional): Filter by NRIC
- `role` (optional): Filter by role
- `limit` (optional): Number of results
- `page` (optional): Page number

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "_id": "string",
      "fullName": "string",
      "email": "string",
      "role": "USER",
      "nric": "string",
      "phoneNumber": "string",
      "profilePicture": "string",
      "createdAt": "ISO date string"
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

## 6. Report Generation APIs

### Service Report
**GET** `/api/admin/reports/service`

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)
- `employerId` (optional)
- `format` (optional): "json" | "pdf" | "excel"

**Response (JSON):**
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

### Sales Report
**GET** `/api/admin/reports/sales`

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)
- `format` (optional): "json" | "pdf" | "excel"

**Response:**
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

### Invoice Report
**GET** `/api/admin/reports/invoice`

**Query Parameters:**
- `employerId` (optional)
- `invoicePeriod` (optional)
- `format` (optional): "json" | "pdf" | "excel"

**Response:**
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

## 📝 Important Notes

1. **All endpoints require authentication** (Bearer token in Authorization header)
2. **All endpoints require ADMIN role** unless specified otherwise
3. **Error Response Format:**
   ```json
   {
     "success": false,
     "message": "Error message",
     "error": "Detailed error (in development)"
   }
   ```
4. **Image URLs:** All image URLs should be full URLs or relative paths starting with `/uploads/`
5. **Pagination:** Default page size is 10, max is 100
6. **Date Format:** Use ISO 8601 format (e.g., "2024-01-15T00:00:00.000Z")

---

## 🔐 Authentication

All endpoints require:
```
Authorization: Bearer <token>
```

---

**End of Documentation**

