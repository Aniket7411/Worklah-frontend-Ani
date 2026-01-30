# Backend API Specification

## Base URL
```
http://localhost:3000/api
```
For production: `https://worklah-updated-dec.onrender.com`

---

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Employers API

### 1. Get All Employers
**Endpoint:** `GET /admin/employers`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search query

**Response:**
```json
{
  "success": true,
  "employers": [
    {
      "_id": "ObjectId",
      "employerId": "EMP-0001",
      "companyLegalName": "Company Name",
      "companyLogo": "https://worklah.onrender.com/uploads/logo.jpg",
      "hqAddress": "123 Main St, Singapore",
      "contactPersonName": "John Doe",
      "jobPosition": "Manager",
      "mainContactNumber": "+65 1234 5678",
      "alternateContactNumber": "+65 9876 5432",
      "emailAddress": "contact@company.com",
      "industry": "F&B",
      "serviceAgreement": "Completed",
      "outlets": [
        {
          "_id": "ObjectId",
          "name": "Outlet Name",
          "address": "456 Outlet St",
          "managerName": "Jane Doe",
          "contactNumber": "+65 1111 2222",
          "openingHours": "09:00",
          "closingHours": "17:00"
        }
      ]
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

### 2. Get Employer by ID
**Endpoint:** `GET /admin/employers/:id`

**Parameters:**
- `id`: Employer ID (accepts both MongoDB ObjectId and EMP-xxxx format)

**Response:**
```json
{
  "success": true,
  "employer": {
    "_id": "ObjectId",
    "employerId": "EMP-0001",
    "companyLegalName": "Company Name",
    "companyLogo": "https://worklah.onrender.com/uploads/logo.jpg",
    "hqAddress": "123 Main St, Singapore",
    "contactPersonName": "John Doe",
    "jobPosition": "Manager",
    "mainContactNumber": "+65 1234 5678",
    "alternateContactNumber": "+65 9876 5432",
    "emailAddress": "contact@company.com",
    "industry": "F&B",
    "serviceAgreement": "Completed",
    "contractExpiryDate": "2025-12-31",
    "outlets": [
      {
        "_id": "ObjectId",
        "name": "Outlet Name",
        "address": "456 Outlet St",
        "managerName": "Jane Doe",
        "contactNumber": "+65 1111 2222",
        "openingHours": "09:00",
        "closingHours": "17:00",
        "isActive": true
      }
    ],
    "jobs": []
  }
}
```

---

### 3. Create Employer
**Endpoint:** `POST /admin/employers`

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
```
data: JSON string containing:
{
  "companyLegalName": "Company Name" (required),
  "companyNumber": "ACRA123456" (optional),
  "hqAddress": "123 Main St, Singapore" (required),
  "contactPersonName": "John Doe" (required),
  "jobPosition": "Manager" (optional),
  "mainContactNumber": "+65 1234 5678" (required),
  "alternateContactNumber": "+65 9876 5432" (optional),
  "emailAddress": "contact@company.com" (required),
  "industry": "F&B" (required),
  "serviceAgreement": "Completed" (optional, default: "Active"),
  "contractExpiryDate": "2025-12-31" (optional, format: YYYY-MM-DD),
  "generateCredentials": true (optional, default: false),
  "outlets": [
    {
      "name": "Outlet Name" (required if outlet provided),
      "managerName": "Jane Doe" (required if outlet provided),
      "contactNumber": "+65 1111 2222" (required if outlet provided),
      "address": "456 Outlet St" (required if outlet provided),
      "openingHours": "09:00" (optional),
      "closingHours": "17:00" (optional),
      "isActive": true (optional, default: true)
    }
  ]
}

Files (optional):
- companyLogo: Image file
- acraBizfileCert: Image file
- serviceContract: PDF file
```

**Note:** Outlets are **OPTIONAL**. Employers can be created without outlets.

**Response:**
```json
{
  "success": true,
  "message": "Employer created successfully",
  "employer": {
    "_id": "ObjectId",
    "employerId": "EMP-0001",
    ...
  },
  "credentials": {
    "email": "contact@company.com",
    "password": "generated-password",
    "emailSent": true
  }
}
```

---

### 4. Update Employer
**Endpoint:** `PUT /admin/employers/:id`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `id`: Employer ID (accepts both MongoDB ObjectId and EMP-xxxx format)

**Request Body:** Same as Create Employer

**Response:**
```json
{
  "success": true,
  "message": "Employer updated successfully",
  "employer": {
    ...
  }
}
```

---

### 5. Delete Employer
**Endpoint:** `DELETE /admin/employers/:id`

**Parameters:**
- `id`: Employer ID (accepts both MongoDB ObjectId and EMP-xxxx format)

**Response:**
```json
{
  "success": true,
  "message": "Employer deleted successfully"
}
```

---

## Outlets API

**Note:** Outlets are managed through the Employer API. Outlets are created/updated/deleted as part of employer creation/update.

### Get Outlet by ID
**Endpoint:** `GET /admin/outlets/:outletId`

**Parameters:**
- `outletId`: Outlet ID (MongoDB ObjectId)

**Response:**
```json
{
  "success": true,
  "outlet": {
    "_id": "ObjectId",
    "name": "Outlet Name",
    "address": "456 Outlet St",
    "managerName": "Jane Doe",
    "contactNumber": "+65 1111 2222",
    "openingHours": "09:00",
    "closingHours": "17:00",
    "isActive": true,
    "employer": {
      "employerId": "EMP-0001",
      "companyLegalName": "Company Name"
    }
  }
}
```

---

## Jobs API

### 1. Get All Jobs
**Endpoint:** `GET /admin/jobs`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Job status filter
- `employerId` (optional): Filter by employer ID
- `outletId` (optional): Filter by outlet ID
- `search` (optional): Search query
- `date` (optional): Filter by date
- `location` (optional): Filter by location
- `rateType` (optional): Filter by rate type
- `postedBy` (optional): Filter by postedBy (admin/employer)

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "ObjectId",
      "jobId": "JOB-0001",
      "jobDate": "2025-01-15",
      "jobTitle": "Waiter Position",
      "jobDescription": "Job description here",
      "employerId": "EMP-0001",
      "employerName": "Company Name",
      "industry": "F&B",
      "outletId": "ObjectId",
      "outletAddress": "456 Outlet St",
      "postedBy": "admin",
      "jobStatus": "Active",
      "totalPositions": 5,
      "foodHygieneCertRequired": false,
      "applicationDeadline": "2025-01-14",
      "dressCode": "Black uniform",
      "skills": ["Customer service", "Cash handling"],
      "locationDetails": "Main branch",
      "shifts": [
        {
          "shiftDate": "2025-01-15",
          "startTime": "09:00",
          "endTime": "17:00",
          "breakDuration": 1,
          "totalWorkingHours": 7,
          "rateType": "Hourly",
          "rates": 15,
          "totalWages": 105,
          "vacancy": 3,
          "standbyVacancy": 2
        }
      ]
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

### 2. Get Job by ID
**Endpoint:** `GET /admin/jobs/:jobId`

**Parameters:**
- `jobId`: Job ID (MongoDB ObjectId)

**Response:**
```json
{
  "success": true,
  "job": {
    "_id": "ObjectId",
    "jobId": "JOB-0001",
    "jobDate": "2025-01-15",
    "jobTitle": "Waiter Position",
    "jobDescription": "Job description here",
    "employerId": "EMP-0001",
    "employer": {
      "employerId": "EMP-0001",
      "companyLegalName": "Company Name",
      "companyLogo": "https://worklah.onrender.com/uploads/logo.jpg"
    },
    "outlet": {
      "_id": "ObjectId",
      "name": "Outlet Name",
      "address": "456 Outlet St"
    },
    "shifts": [...],
    ...
  }
}
```

---

### 3. Create Job
**Endpoint:** `POST /admin/jobs`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "jobDate": "2025-01-15" (required, format: YYYY-MM-DD),
  "jobTitle": "Waiter Position" (required),
  "jobDescription": "Job description here" (required),
  "employerId": "EMP-0001" (required),
  "employerName": "Company Name" (optional),
  "industry": "F&B" (optional),
  "postedBy": "admin" (required: "admin" or "employer"),
  "outletId": "ObjectId" (optional - if not provided, use manual outlet),
  "outletAddress": "456 Outlet St" (required if outletId not provided),
  "totalPositions": 5 (optional, default: 1),
  "foodHygieneCertRequired": false (optional),
  "applicationDeadline": "2025-01-14" (optional, format: YYYY-MM-DD),
  "dressCode": "Black uniform" (optional),
  "skills": ["Customer service", "Cash handling"] (optional, array),
  "locationDetails": "Main branch" (optional),
  "shifts": [
    {
      "shiftDate": "2025-01-15" (required, format: YYYY-MM-DD),
      "startTime": "09:00" (required, format: HH:mm),
      "endTime": "17:00" (required, format: HH:mm),
      "breakDuration": 1 (optional, in hours, default: 0),
      "rateType": "Hourly" (required: "Hourly", "Weekly", "Monthly"),
      "rates": 15 (required, number),
      "vacancy": 3 (required, minimum: 1),
      "standbyVacancy": 2 (optional, default: 0)
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job created successfully",
  "job": {
    "_id": "ObjectId",
    "jobId": "JOB-0001",
    ...
  }
}
```

---

### 4. Update Job
**Endpoint:** `PUT /admin/jobs/:jobId`

**Content-Type:** `application/json`

**Parameters:**
- `jobId`: Job ID (MongoDB ObjectId)

**Request Body:** Same as Create Job

**Response:**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "job": {
    ...
  }
}
```

---

### 5. Delete Job
**Endpoint:** `DELETE /admin/jobs/:jobId`

**Parameters:**
- `jobId`: Job ID (MongoDB ObjectId)

**Response:**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "ErrorType"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., duplicate company number)
- `500` - Internal Server Error

---

## Important Notes

1. **Outlet Management**: Outlets are managed as part of the Employer entity. They are created/updated/deleted through the Employer API endpoints.

2. **Outlets are Optional**: Employers can be created without outlets. The outlets array can be empty.

3. **ID Formats**: 
   - Employers: Accepts both MongoDB ObjectId and EMP-xxxx format
   - Jobs: MongoDB ObjectId
   - Outlets: MongoDB ObjectId

4. **File Uploads**: 
   - Use `multipart/form-data` for file uploads
   - Files are sent separately from JSON data
   - JSON data is sent as a string in the `data` field

5. **Date Formats**:
   - Dates: `YYYY-MM-DD` (e.g., "2025-01-15")
   - Time: `HH:mm` (e.g., "09:00", "17:00")

6. **Rate Types**: "Hourly", "Weekly", "Monthly"

7. **Job Status**: "Active", "Completed", "Cancelled", "Suspended", "Pending", "Upcoming", "Ongoing", "Filled", "Expired", "Deactivated"

8. **Service Agreement Status**: "Completed", "In Discussion", "Expired", "Active"
