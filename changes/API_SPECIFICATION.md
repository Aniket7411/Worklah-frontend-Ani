# Complete API Specification - Frontend to Backend

This document contains **ALL** API endpoints used by the frontend with exact request/response formats.

---

## Base URL
```
http://localhost:3000/api
```

---

## Authentication

### 1. Login
**Endpoint:** `POST /user/login`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "...",
    "email": "admin@example.com",
    "role": "ADMIN",
    "fullName": "Admin User"
  },
  "token": "jwt_token_here"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "AuthenticationError"
}
```

---

### 2. Get Current User
**Endpoint:** `GET /user/me`

**Headers:** `Authorization: Bearer {token}` (or cookie: `authToken`)

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "email": "admin@example.com",
    "role": "ADMIN",
    "fullName": "Admin User"
  }
}
```

---

### 3. Logout
**Endpoint:** `POST /user/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 4. Forgot Password
**Endpoint:** `POST /user/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

## Dashboard

### 5. Get Dashboard Overview
**Endpoint:** `GET /dashboard/overview`

**Query Parameters:**
- `startDate` (optional): `YYYY-MM-DD`
- `endDate` (optional): `YYYY-MM-DD`
- `employerId` (optional): Only for ADMIN role

**Response:**
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

**Response:**
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

**Response:**
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

**Response:**
```json
{
  "success": true,
  "candidates": [
    {
      "_id": "...",
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

## Employers

### 9. Get Employers List
**Endpoint:** `GET /employers?page=1&limit=10`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "employers": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "employerId": "EMP-e3d7",
      "companyLegalName": "Company Name",
      "companyLogo": "uploads\\logo.png",
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
          "_id": "...",
          "id": "...",
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

**IMPORTANT NOTES:**
- `employerId` field is required (format: "EMP-xxxx" or MongoDB `_id`)
- `mainContactPersons` is an **array** (not a single object)
- `emailAddress` field name (not `companyEmail`)
- `officeNumber` field name (not `companyNumber`)
- `contractExpiryDate` field name (not `contractEndDate`)
- `companyLogo` path may contain backslashes - frontend normalizes to forward slashes

---

### 10. Get Single Employer
**Endpoint:** `GET /employers/:id`

**Response:**
```json
{
  "success": true,
  "employer": {
    "_id": "...",
    "employerId": "EMP-e3d7",
    "companyLegalName": "Company Name",
    "industry": "Hospitality",
    "hqAddress": "123 Main Street",
    "mainContactNumber": "1234567890",
    "alternateContactNumber": "0987654321",
    "emailAddress": "company@example.com",
    "outlets": [
      {
        "_id": "...",
        "id": "...",
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

---

### 11. Create Employer (Admin Only)
**Endpoint:** `POST /employers/create`

**Authorization:** ADMIN role required

**Content-Type:** `multipart/form-data`

**Request Fields:**
```
companyLegalName: "Company Name" (required)
industry: "Hospitality" (required) - enum: ["Hospitality", "IT", "F&B", "Hotel", "Retail", "Logistics", "Healthcare", "Education", "Construction", "Others"]
hqAddress: "123 Main Street" (required)
mainContactNumber: "1234567890" (required)
alternateContactNumber: "0987654321" (required)
emailAddress: "company@example.com" (required, valid email)
companyLogo: (file, optional)
contactPersons[0][name]: "Contact Name" (optional)
contactPersons[0][position]: "Manager" (optional)
contactPersons[0][number]: "1234567890" (optional)
outlets[0][name]: "Outlet Name" (REQUIRED)
outlets[0][address]: "Outlet Address" (REQUIRED)
outlets[0][managerName]: "Manager Name" (optional)
outlets[0][managerContact]: "Manager Contact" (optional)
acraBizfileCert: (file, optional)
serviceAgreement: "In Discussion" (optional)
serviceContract: (file, optional)
contractExpiryDate: "2025-12-23" (optional, YYYY-MM-DD)
generateCredentials: "true" (optional, boolean as string)
```

**Response:**
```json
{
  "success": true,
  "message": "Employer created successfully",
  "employer": {
    "_id": "...",
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

**Error Responses:**
```json
{
  "success": false,
  "message": "Each outlet must have a name",
  "error": "ValidationError"
}
```

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

**Request:** Same fields as Create Employer (all optional except validation rules)

**Response:**
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

**Response:**
```json
{
  "success": true,
  "message": "Employer deleted successfully"
}
```

---

## Jobs

### 14. Get Jobs List
**Endpoint:** `GET /jobs`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status ("Active", "Suspended", "Completed", etc.)
- `search` (optional): Search in job title/description
- `location` (optional): Filter by location
- `employerId` (optional): Filter by employer
- `outletId` (optional): Filter by outlet
- `startDate` (optional): `YYYY-MM-DD`
- `endDate` (optional): `YYYY-MM-DD`
- `sortOrder` (optional): "asc" or "desc"

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "...",
      "jobId": "...",
      "jobTitle": "Waiter",
      "jobName": "Waiter",
      "jobDescription": "Serve customers...",
      "jobRoles": "Waiter, Server",
      "jobDate": "2024-12-25",
      "date": "2024-12-25",
      "employer": {
        "_id": "...",
        "name": "Company Name",
        "companyLegalName": "Company Legal Name",
        "companyLogo": "/uploads/logo.png"
      },
      "employerId": "...",
      "employerName": "Company Name",
      "outlet": {
        "_id": "...",
        "id": "...",
        "name": "Outlet Name",
        "address": "Outlet Address"
      },
      "outletId": "...",
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
          "id": "...",
          "shiftId": "...",
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

**Response:**
```json
{
  "success": true,
  "job": {
    "_id": "...",
    "jobId": "...",
    "jobTitle": "Waiter",
    "jobDescription": "...",
    "jobRoles": "...",
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

**Request:**
```json
{
  "jobDate": "2024-12-25",
  "jobTitle": "Waiter",
  "jobDescription": "Serve customers...",
  "jobRoles": "Waiter, Server",
  "employerId": "employer_id_here",
  "employerName": "Company Name",
  "industry": "Hospitality",
  "postedBy": "admin",
  "outletId": "outlet_id_here",
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

**Response:**
```json
{
  "success": true,
  "message": "Job created successfully",
  "job": {...}
}
```

**IMPORTANT:**
- `contactInfo` field is **NOT** sent (removed from frontend)
- `jobRequirements` field is **NOT** sent (replaced by `dressCode` and `skills`)
- `skills` is sent as **array** (frontend converts comma-separated string to array)

---

### 17. Update Job
**Endpoint:** `PUT /jobs/:jobId`

**Request:** Same as Create Job (all fields optional)

**Response:**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "job": {...}
}
```

---

### 18. Update Job Status
**Endpoint:** `PUT /jobs/:jobId`

**Request:**
```json
{
  "status": "Suspended"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job status updated successfully",
  "job": {...}
}
```

---

### 19. Delete Job
**Endpoint:** `DELETE /jobs/:jobId`

**Response:**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

## Candidates

### 20. Get Candidates List
**Endpoint:** `GET /admin/candidates`

**Query Parameters:**
- `limit` (optional): Items per page
- `sort` (optional): Sort order (e.g., "-createdAt")

**Response:**
```json
{
  "success": true,
  "candidates": [
    {
      "_id": "...",
      "id": "...",
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

### 21. Get Single Candidate
**Endpoint:** `GET /admin/candidates/:id`

**Response:**
```json
{
  "success": true,
  "candidate": {...},
  "candidateProfile": {...}
}
```

---

### 22. Update Candidate
**Endpoint:** `PUT /admin/candidates/:id`

**Content-Type:** `multipart/form-data`

**Request Fields:**
```
fullName: "John Doe" (required)
mobile: "1234567890" (required)
email: "john@example.com" (required if not exists)
nric: "S1234567A" (required)
dateOfBirth: "01/01/1990" (required, DD/MM/YYYY format)
gender: "Male" (required)
postalCode: "123456" (required, 6 digits)
streetAddress: "123 Main Street" (required)
profilePicture: (file, required)
nricFront: (file, required if Singaporean/PR)
nricBack: (file, required if Singaporean/PR)
plocImage: (file, required if LTVP)
plocExpiryDate: "2025-12-31" (required if LTVP, YYYY-MM-DD)
foodHygieneCert: (file, optional)
schools: "School Name" (required if Student Pass)
studentPassImage: (file, required if Student Pass)
studentIdNo: "STU123456" (required if Student Pass)
```

**Response:**
```json
{
  "success": true,
  "message": "Candidate updated successfully",
  "candidate": {...}
}
```

---

### 23. Delete Candidate
**Endpoint:** `DELETE /admin/candidates/:id`

**Response:**
```json
{
  "success": true,
  "message": "Candidate deleted successfully"
}
```

---

## Job Applications

### 24. Get Job Candidates
**Endpoint:** `GET /admin/jobs/candidates/:jobId`

**Response:**
```json
{
  "success": true,
  "candidates": [
    {
      "_id": "...",
      "userId": "...",
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

### 25. Update Application Status
**Endpoint:** `PUT /admin/applications/status/:userId`

**Request:**
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

**Response:**
```json
{
  "success": true,
  "message": "Application status updated successfully"
}
```

---

## Payments

### 26. Get Payments
**Endpoint:** `GET /payments`

**Query Parameters:**
- `status` (optional): Filter by status
- `employeeId` (optional): Filter by employee
- `jobId` (optional): Filter by job

**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "_id": "...",
      "paymentId": "...",
      "employee": {
        "_id": "...",
        "fullName": "John Doe",
        "nric": "S1234567A"
      },
      "job": {
        "_id": "...",
        "jobTitle": "Waiter"
      },
      "amount": 100.50,
      "status": "Pending",
      "paymentDate": "2024-12-22",
      "createdAt": "2024-12-22T10:00:00Z"
    }
  ]
}
```

---

### 27. Update Payment Status
**Endpoint:** `PUT /payments/:paymentId/status`

**Request:**
```json
{
  "status": "Approved",
  "rejectionReason": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment status updated successfully"
}
```

---

### 28. Regenerate Payment
**Endpoint:** `POST /payments/:paymentId/regenerate`

**Request:**
```json
{
  "amount": 150.00,
  "paymentDate": "2024-12-23",
  "notes": "Updated amount"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment regenerated successfully",
  "payment": {...}
}
```

---

### 29. Get Withdrawals
**Endpoint:** `GET /withdrawals`

**Response:**
```json
{
  "success": true,
  "withdrawals": [
    {
      "_id": "...",
      "employee": {...},
      "amount": 500.00,
      "status": "Pending",
      "cashOutMethod": "PayNow",
      "createdAt": "2024-12-22T10:00:00Z"
    }
  ]
}
```

---

### 30. Create Withdrawal
**Endpoint:** `POST /withdrawals/create`

**Request:**
```json
{
  "employeeId": "...",
  "amount": 500.00,
  "cashOutMethod": "PayNow"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal created successfully",
  "withdrawal": {...}
}
```

---

## Configuration & Settings

### 31. Get Rate Configuration
**Endpoint:** `GET /admin/rate-configuration`

**Response:**
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

### 32. Get Penalties
**Endpoint:** `GET /admin/penalties`

**Response:**
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

### 33. Get Schools List
**Endpoint:** `GET /admin/schools`

**Response:**
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

### 34. Get Postal Code Address
**Endpoint:** `GET /admin/postal-code/:postalCode`

**Response:**
```json
{
  "success": true,
  "streetAddress": "123 Main Street, Singapore"
}
```

---

## Reports

### 35. Get Sales Report
**Endpoint:** `GET /admin/sales-report`

**Response:**
```json
{
  "success": true,
  "reports": [
    {
      "id": "...",
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

### 36. Get Service Report
**Endpoint:** `GET /admin/service-report`

**Response:**
```json
{
  "success": true,
  "reports": [...]
}
```

---

### 37. Get Invoice Report
**Endpoint:** `GET /admin/invoice-report`

**Response:**
```json
{
  "success": true,
  "reports": [...]
}
```

---

## Other Endpoints

### 38. Get Outlets
**Endpoint:** `GET /outlets`

**Response:**
```json
{
  "success": true,
  "data": [...],
  "outlets": [
    {
      "_id": "...",
      "id": "...",
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

### 39. Get Deployment Tracking
**Endpoint:** `GET /admin/jobs/deployment-tracking`

**Query Parameters:**
- `startDate` (optional): `YYYY-MM-DD`
- `endDate` (optional): `YYYY-MM-DD`

**Response:**
```json
{
  "success": true,
  "deployments": [...]
}
```

---

### 40. Get QR Code Jobs
**Endpoint:** `GET /admin/jobs?limit=100&status=Active,Upcoming`

**Response:**
```json
{
  "success": true,
  "jobs": [...]
}
```

---

### 41. Submit Support Feedback
**Endpoint:** `POST /support/feedback`

**Request:**
```json
{
  "subject": "Issue Subject",
  "message": "Issue description",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

---

### 42. Get Profile Image
**Endpoint:** `GET /admin/profile/image`

**Response:** Image file or URL

---

### 43. Upload Profile Image
**Endpoint:** `POST /admin/profile/image`

**Content-Type:** `multipart/form-data`

**Request:** File upload

**Response:**
```json
{
  "success": true,
  "imageUrl": "/uploads/profile.jpg"
}
```

---

## Common Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message here",
  "error": "ErrorType"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized
- `403` - Forbidden (Admin only)
- `404` - Not Found
- `500` - Internal Server Error

---

## Important Notes

1. **All endpoints require authentication** except login and forgot password
2. **Admin-only endpoints:** Employer create, Job create
3. **FormData endpoints:** Employer create/update, Candidate update, Profile image upload
4. **Date formats:**
   - Request: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`
   - Display: `DD/MM/YYYY`
5. **File paths:** Backend may return paths with backslashes (`\`), frontend normalizes to forward slashes (`/`)
6. **Array fields:** `mainContactPersons`, `outlets`, `skills`, `shifts` are arrays
7. **Status values:** Jobs support "Active", "Suspended", "Completed", "Cancelled", "Pending", "Upcoming", "Deactivated"

---

## Testing Checklist

- [ ] All endpoints return `success` field (true/false)
- [ ] Error responses include `message` and `error` fields
- [ ] Admin-only endpoints check role and return 403 if not admin
- [ ] FormData endpoints handle file uploads correctly
- [ ] Array fields are properly formatted
- [ ] Date formats match specifications
- [ ] Pagination works correctly
- [ ] Filtering by status works correctly
- [ ] File paths are normalized correctly

---

**END OF DOCUMENT**

