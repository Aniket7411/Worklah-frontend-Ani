# Admin Job Management - Complete Documentation

**Project:** WorkLah Admin Panel  
**Last Updated:** January 2025  
**Status:** ✅ Production Ready

---

## Quick Reference

### ✅ What's Working

1. **Job Creation** - Admin can create jobs with:
   - Employer selection (supports ObjectId and EMP-xxxx format)
   - Outlet selection (valid ObjectId) OR manual outlet entry (address/location)
   - Multiple shifts with full validation
   - Auto-handling of invalid outlet IDs

2. **Job Editing** - Admin can update:
   - All job fields
   - Employer (with validation)
   - Outlet (using outletId, outletAddress, or locationDetails)
   - Shifts (complete replacement)
   - Preserves existing outlet if not changed

3. **Job Deletion** - Admin can delete:
   - Any job (with cascading deletion of shifts and applications)
   - Removes job from employer's jobs array

### 🔑 Key Features

- **Smart Outlet Handling:** Invalid outlet IDs are automatically ignored, falls back to address/location
- **Flexible Outlet Input:** Supports outletId, outletAddress, or locationDetails
- **Auto Outlet Creation:** Creates new outlets automatically if not found
- **Transaction Safety:** All operations use MongoDB transactions
- **Comprehensive Validation:** Validates all fields, dates, and relationships

---

## Overview

This document provides complete documentation for Admin Job Management functionality, including job creation, editing, and deletion with proper employer and outlet handling.

---

## Table of Contents

1. [Job Creation](#job-creation)
2. [Job Editing](#job-editing)
3. [Job Deletion](#job-deletion)
4. [Outlet Handling](#outlet-handling)
5. [API Endpoints](#api-endpoints)
6. [Error Handling](#error-handling)
7. [Validation Rules](#validation-rules)
8. [Examples](#examples)

---

## Job Creation

### Endpoint
```
POST /api/admin/jobs
POST /api/admin/jobs/create
```

### Authentication
- **Required:** Yes
- **Role:** ADMIN only

### Request Body

#### Required Fields
```json
{
  "jobDate": "2025-01-15",           // YYYY-MM-DD format
  "jobTitle": "Waiter Position",     // String
  "jobDescription": "Job description here",  // String
  "employerId": "EMP-0001",          // Employer ID (ObjectId or EMP-xxxx format)
  "postedBy": "admin",               // Must be "admin" for admin users
  "shifts": [                         // Array of shifts (at least 1 required)
    {
      "shiftDate": "2025-01-15",      // YYYY-MM-DD format
      "startTime": "09:00",           // HH:mm format (24-hour)
      "endTime": "17:00",             // HH:mm format (24-hour)
      "rateType": "Hourly",           // "Hourly", "Weekly", or "Monthly"
      "rates": 15,                    // Number (>= 0)
      "vacancy": 3                    // Number (minimum: 1)
    }
  ]
}
```

#### Optional Fields
```json
{
  "employerName": "Company Name",              // Auto-populated from employer
  "industry": "F&B",                          // Auto-populated from employer
  "outletId": "ObjectId",                     // Valid MongoDB ObjectId (if provided)
  "outletAddress": "456 Outlet St",           // Required if outletId not provided
  "locationDetails": "Main branch",           // Alternative to outletAddress
  "totalPositions": 5,                        // Default: 1
  "foodHygieneCertRequired": false,           // Default: false
  "applicationDeadline": "2025-01-14",        // YYYY-MM-DD format
  "dressCode": "Black uniform",               // String
  "skills": ["Customer service", "Cash handling"],  // Array of strings
  "jobStatus": "Active"                       // Default: "Pending" or "Upcoming"
}
```

#### Shift Object Details
```json
{
  "shiftDate": "2025-01-15",        // Required, YYYY-MM-DD, must be >= jobDate
  "startTime": "09:00",             // Required, HH:mm format (24-hour)
  "endTime": "17:00",               // Required, HH:mm format (24-hour)
  "breakDuration": 1,               // Optional, in hours, default: 0
  "rateType": "Hourly",             // Required: "Hourly", "Weekly", or "Monthly"
  "rates": 15,                      // Required, number >= 0
  "vacancy": 3,                     // Required, minimum: 1
  "standbyVacancy": 2,              // Optional, default: 0
  "totalWorkingHours": 7,           // Optional, calculated automatically
  "totalWages": 105                 // Optional, calculated automatically
}
```

### Outlet Handling Logic

The system handles outlets in the following priority order:

1. **If `outletId` is provided and valid:**
   - First checks if outlet exists as subdocument in employer's outlets array
   - If not found, checks separate Outlet collection
   - Validates that outlet belongs to the selected employer
   - Uses the found outlet

2. **If `outletId` is invalid or not provided:**
   - Uses `outletAddress` if provided
   - Falls back to `locationDetails` if `outletAddress` is not provided
   - Searches for existing outlet by address
   - If not found, creates a new outlet subdocument in employer's outlets array

3. **Validation:**
   - At least one of: valid `outletId`, `outletAddress`, or `locationDetails` must be provided
   - Invalid `outletId` format (e.g., "GT") is automatically ignored and treated as missing

### Response

#### Success (201 Created)
```json
{
  "success": true,
  "message": "Job created successfully",
  "job": {
    "_id": "ObjectId",
    "jobId": "JOB-0001",
    "jobTitle": "Waiter Position",
    "jobDescription": "Job description here",
    "jobDate": "2025-01-15",
    "employerId": "EMP-0001",
    "employerName": "Company Name",
    "outletId": "ObjectId",
    "outletAddress": "456 Outlet St",
    "locationDetails": "Main branch",
    "industry": "F&B",
    "postedBy": "admin",
    "jobStatus": "Active",
    "totalPositions": 5,
    "foodHygieneCertRequired": false,
    "applicationDeadline": "2025-01-14",
    "dressCode": "Black uniform",
    "skills": ["Customer service", "Cash handling"],
    "shifts": [
      {
        "_id": "ObjectId",
        "shiftDate": "2025-01-15",
        "startTime": "09:00",
        "endTime": "17:00",
        "breakDuration": 1,
        "rateType": "Hourly",
        "rates": 15,
        "vacancy": 3,
        "standbyVacancy": 2,
        "totalWorkingHours": 7,
        "totalWages": 105
      }
    ],
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

#### Error Responses

**400 Bad Request - Missing Required Fields**
```json
{
  "success": false,
  "message": "Job title is required",
  "error": "ValidationError"
}
```

**400 Bad Request - Invalid Outlet ID Format**
```json
{
  "success": false,
  "message": "Either a valid outletId (MongoDB ObjectId), outletAddress, or locationDetails must be provided",
  "error": "ValidationError"
}
```

**400 Bad Request - Invalid Shift Data**
```json
{
  "success": false,
  "message": "Shift 1: shiftDate is required",
  "error": "ValidationError"
}
```

**404 Not Found - Employer Not Found**
```json
{
  "success": false,
  "message": "Employer not found with ID: EMP-0001. Please verify:\n1. The employer exists in the database\n2. The ID format is correct (ObjectId or EMP-xxxx)\n3. The employerId field is properly set in the database",
  "error": "NotFoundError"
}
```

**403 Forbidden - Not Admin**
```json
{
  "success": false,
  "message": "Only admins can perform this action",
  "error": "ForbiddenError"
}
```

---

## Job Editing

### Endpoint
```
PUT /api/admin/jobs/:id
```

### Authentication
- **Required:** Yes
- **Role:** ADMIN only

### Parameters
- `id`: Job ID (MongoDB ObjectId or JOB-xxxx format)

### Request Body

All fields are optional. Only provide fields you want to update.

```json
{
  "jobTitle": "Updated Job Title",
  "jobDescription": "Updated description",
  "jobDate": "2025-01-20",
  "employerId": "EMP-0002",
  "outletId": "ObjectId",
  "outletAddress": "New Address",
  "locationDetails": "Updated location",
  "applicationDeadline": "2025-01-19",
  "dressCode": "Updated dress code",
  "skills": ["Updated skill 1", "Updated skill 2"],
  "totalPositions": 10,
  "foodHygieneCertRequired": true,
  "jobStatus": "Active",
  "shifts": [
    {
      "shiftDate": "2025-01-20",
      "startTime": "10:00",
      "endTime": "18:00",
      "breakDuration": 1.5,
      "rateType": "Hourly",
      "rates": 20,
      "vacancy": 5,
      "standbyVacancy": 2
    }
  ]
}
```

### Update Behavior

1. **Shifts:** If `shifts` array is provided, all existing shifts are deleted and replaced with new shifts
2. **Employer:** Can be changed to a different employer (uses ID resolver for EMP-xxxx format)
3. **Outlet:** Can be changed using:
   - Valid `outletId` (MongoDB ObjectId) - validates outlet belongs to employer
   - `outletAddress` - searches for existing outlet or creates new one
   - `locationDetails` - same as outletAddress (fallback)
   - If no outlet provided, keeps existing job's outlet
4. **Date Validation:** 
   - If updating to a past date and existing date is in the future, validation fails
   - If existing date is already in the past, update is allowed (for historical records)

### Response

#### Success (200 OK)
```json
{
  "success": true,
  "message": "Job updated successfully",
  "job": {
    "_id": "ObjectId",
    "jobId": "JOB-0001",
    "jobTitle": "Updated Job Title",
    // ... updated fields
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "message": "Job not found",
  "statusCode": 404
}
```

**400 Bad Request - Invalid Date**
```json
{
  "success": false,
  "message": "Job date cannot be in the past. Please select today or a future date.",
  "statusCode": 400
}
```

**400 Bad Request - Invalid Deadline**
```json
{
  "success": false,
  "message": "Application deadline cannot be before job date. Please select a date on or after the job date.",
  "statusCode": 400
}
```

---

## Job Deletion

### Endpoint
```
DELETE /api/admin/jobs/:id
```

### Authentication
- **Required:** Yes
- **Role:** ADMIN only

### Parameters
- `id`: Job ID (MongoDB ObjectId or JOB-xxxx format)

### Request Body
None required

### Deletion Behavior

1. **Cascading Deletion:**
   - All associated shifts are deleted
   - All associated applications are deleted
   - All associated payments/transactions are deleted (if applicable)

2. **Validation:**
   - Job must exist
   - Only admins can delete jobs
   - No validation for job status (can delete any job)

### Response

#### Success (200 OK)
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "message": "Job not found",
  "error": "NotFound"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Only admins can perform this action",
  "error": "ForbiddenError"
}
```

---

## Outlet Handling

### Outlet Resolution Priority

1. **Valid `outletId` (MongoDB ObjectId):**
   ```
   Priority 1: Check employer.outlets subdocument array
   Priority 2: Check separate Outlet collection
   Validation: Outlet must belong to selected employer
   ```

2. **Invalid or Missing `outletId`:**
   ```
   Use outletAddress if provided
   Fallback to locationDetails if outletAddress not provided
   Search existing outlets by address
   Create new outlet subdocument if not found
   ```

### Outlet Creation

When a new outlet is created (via `outletAddress` or `locationDetails`):

```javascript
{
  outletName: address.split(',')[0] || "New Outlet",
  outletAddress: address,
  contactNumber: null,
  managerName: null,
  managerContact: null,
  openingHours: null,
  closingHours: null
}
```

The outlet is added as a subdocument to the employer's `outlets` array.

### Outlet Validation Rules

- `outletId` must be a valid MongoDB ObjectId format
- Invalid `outletId` (e.g., "GT", "123") is automatically ignored
- At least one of: `outletId`, `outletAddress`, or `locationDetails` must be provided
- Outlet must belong to the selected employer (if using existing outlet)

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/jobs` | Get all jobs with filters | Yes (Admin) |
| GET | `/api/admin/jobs/:id` | Get job by ID | Yes (Admin) |
| POST | `/api/admin/jobs` | Create new job | Yes (Admin) |
| POST | `/api/admin/jobs/create` | Create new job (alias) | Yes (Admin) |
| PUT | `/api/admin/jobs/:id` | Update job | Yes (Admin) |
| DELETE | `/api/admin/jobs/:id` | Delete job | Yes (Admin) |
| PATCH | `/api/admin/jobs/:id/status` | Change job status | Yes (Admin) |

---

## Validation Rules

### Job Creation

1. **Required Fields:**
   - `jobTitle` (string, non-empty)
   - `jobDescription` (string, non-empty)
   - `jobDate` (YYYY-MM-DD format, >= today)
   - `employerId` (valid ObjectId or EMP-xxxx format)
   - `shifts` (array with at least 1 shift)
   - Either `outletId`, `outletAddress`, or `locationDetails`

2. **Shift Validation:**
   - `shiftDate` (required, YYYY-MM-DD, >= jobDate, not in past)
   - `startTime` (required, HH:mm format, 24-hour)
   - `endTime` (required, HH:mm format, 24-hour)
   - `rateType` (required, one of: "Hourly", "Weekly", "Monthly")
   - `rates` (required, number >= 0)
   - `vacancy` (required, number >= 1)
   - `standbyVacancy` (optional, number >= 0)

3. **Date Validation:**
   - `jobDate` must be today or future date
   - `shiftDate` must be >= `jobDate`
   - `applicationDeadline` must be >= `jobDate` (if provided)

4. **ID Validation:**
   - `employerId`: Accepts ObjectId or EMP-xxxx format
   - `outletId`: Must be valid ObjectId (if provided)
   - Invalid `outletId` is ignored, falls back to `outletAddress`/`locationDetails`

### Job Update

1. All fields are optional
2. Same validation rules apply to provided fields
3. Date validation is relaxed for historical records
4. Shifts array completely replaces existing shifts

### Job Deletion

1. Job must exist
2. Only admins can delete
3. Cascading deletion of related records

---

## Examples

### Example 1: Create Job with Valid Outlet ID

```json
POST /api/admin/jobs
{
  "jobDate": "2025-01-20",
  "jobTitle": "Waiter Position",
  "jobDescription": "Serve customers in restaurant",
  "employerId": "EMP-0001",
  "outletId": "507f1f77bcf86cd799439011",
  "postedBy": "admin",
  "shifts": [
    {
      "shiftDate": "2025-01-20",
      "startTime": "09:00",
      "endTime": "17:00",
      "breakDuration": 1,
      "rateType": "Hourly",
      "rates": 15,
      "vacancy": 3
    }
  ]
}
```

### Example 2: Create Job with Outlet Address (No Outlet ID)

```json
POST /api/admin/jobs
{
  "jobDate": "2025-01-20",
  "jobTitle": "Cashier Position",
  "jobDescription": "Handle cash transactions",
  "employerId": "EMP-0001",
  "outletAddress": "123 Main Street, Singapore 123456",
  "postedBy": "admin",
  "locationDetails": "Main branch",
  "shifts": [
    {
      "shiftDate": "2025-01-20",
      "startTime": "10:00",
      "endTime": "18:00",
      "breakDuration": 0.75,
      "rateType": "Hourly",
      "rates": 12,
      "vacancy": 2
    }
  ]
}
```

### Example 3: Create Job with Invalid Outlet ID (Auto-handled)

```json
POST /api/admin/jobs
{
  "jobDate": "2025-01-20",
  "jobTitle": "Developer Position",
  "jobDescription": "Web development work",
  "employerId": "EMP-0001",
  "outletId": "GT",  // Invalid - will be ignored
  "locationDetails": "Ram Tirth Manasarovar",  // Will be used instead
  "postedBy": "admin",
  "shifts": [
    {
      "shiftDate": "2025-01-20",
      "startTime": "10:00",
      "endTime": "18:00",
      "breakDuration": 0.75,
      "rateType": "Hourly",
      "rates": 10,
      "vacancy": 1
    }
  ]
}
```

**Result:** System automatically ignores invalid `outletId` "GT" and uses `locationDetails` to create/find outlet.

### Example 4: Update Job with Outlet Change

```json
PUT /api/admin/jobs/507f1f77bcf86cd799439011
{
  "jobTitle": "Updated Waiter Position",
  "jobDescription": "Updated description",
  "employerId": "EMP-0002",
  "outletAddress": "New Address, Singapore",
  "totalPositions": 10,
  "shifts": [
    {
      "shiftDate": "2025-01-20",
      "startTime": "09:00",
      "endTime": "17:00",
      "breakDuration": 1,
      "rateType": "Hourly",
      "rates": 18,
      "vacancy": 5
    },
    {
      "shiftDate": "2025-01-21",
      "startTime": "09:00",
      "endTime": "17:00",
      "breakDuration": 1,
      "rateType": "Hourly",
      "rates": 18,
      "vacancy": 5
    }
  ]
}
```

### Example 5: Update Job - Keep Existing Outlet

```json
PUT /api/admin/jobs/507f1f77bcf86cd799439011
{
  "jobTitle": "Updated Job Title",
  "totalPositions": 8
}
```

**Note:** If no outlet fields are provided, the existing job's outlet is preserved.

### Example 6: Delete Job

```json
DELETE /api/admin/jobs/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

## Error Handling

### Common Error Scenarios

1. **Invalid Employer ID:**
   - Error: `NotFoundError`
   - Message: "Employer not found with ID: {id}"
   - Solution: Verify employer exists and ID format is correct

2. **Invalid Outlet ID Format:**
   - Error: `ValidationError`
   - Message: "Either a valid outletId (MongoDB ObjectId), outletAddress, or locationDetails must be provided"
   - Solution: Provide valid ObjectId or use `outletAddress`/`locationDetails`

3. **Outlet Not Belonging to Employer:**
   - Error: `InvalidOutlet`
   - Message: "Outlet does not belong to the selected employer"
   - Solution: Select an outlet that belongs to the chosen employer

4. **Missing Required Fields:**
   - Error: `ValidationError`
   - Message: "{field} is required"
   - Solution: Provide all required fields

5. **Invalid Date Format:**
   - Error: `ValidationError`
   - Message: "Job date cannot be in the past" or "Invalid date format"
   - Solution: Use YYYY-MM-DD format and ensure date is today or future

6. **Invalid Shift Data:**
   - Error: `ValidationError`
   - Message: "Shift {n}: {field} is required" or "Shift {n}: {validation message}"
   - Solution: Ensure all shift fields are valid and meet requirements

---

## Important Notes

1. **Outlet Handling:**
   - Outlets are primarily stored as subdocuments in the Employer model
   - Separate Outlet collection exists for backward compatibility
   - System automatically creates outlets if not found when using `outletAddress` or `locationDetails`

2. **ID Formats:**
   - `employerId`: Accepts both MongoDB ObjectId and EMP-xxxx format
   - `outletId`: Must be valid MongoDB ObjectId (invalid formats are ignored)
   - `jobId`: Accepts both MongoDB ObjectId and JOB-xxxx format

3. **Date Handling:**
   - All dates must be in YYYY-MM-DD format
   - Job date must be today or future (for new jobs)
   - Shift dates must be >= job date
   - Application deadline must be >= job date

4. **Transaction Safety:**
   - All operations use MongoDB transactions
   - If any part fails, entire operation is rolled back
   - Ensures data consistency

5. **Auto-populated Fields:**
   - `industry`: Auto-populated from employer
   - `employerName`: Auto-populated from employer
   - `postedBy`: Always "admin" for admin-created jobs

---

## Testing Checklist

- [x] Create job with valid outlet ID
- [x] Create job with outlet address
- [x] Create job with location details
- [x] Create job with invalid outlet ID (auto-handled)
- [x] Create job with multiple shifts
- [x] Update job details
- [x] Update job shifts
- [x] Update job outlet
- [x] Delete job
- [x] Validate employer ID (ObjectId and EMP-xxxx)
- [x] Validate outlet belongs to employer
- [x] Validate date constraints
- [x] Validate shift requirements
- [x] Error handling for all scenarios

---

## Support

For issues or questions:
1. Check error messages for specific validation failures
2. Verify all required fields are provided
3. Ensure ID formats are correct
4. Check that dates meet validation requirements
5. Verify outlet belongs to selected employer

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** ✅ Production Ready
