# Backend Update Requirements

This document outlines the backend changes required to support the new frontend implementation for employer management and job posting.

## Overview

The system has been updated so that:
1. **Only admins can add employers** - Role-based access control implemented
2. **Only admins can post jobs** - Role-based access control implemented
3. **Employer form has new required fields** - Industry type, name, address, contact numbers, email, outlets
4. **Job posting workflow changed** - Auto-population of employer details, removal of contact fields, new fields (dressCode, skills)

---

## 1. Employer Creation API Changes

### Endpoint: `POST /api/employers/create`

#### New Required Fields:
- `companyLegalName` (string, required) - Name of employer
- `industry` (string, required) - Industry type (Hospitality, IT, F&B, Hotel, Retail, Logistics, Healthcare, Education, Construction, Others)
- `hqAddress` (string, required) - Address
- `mainContactNumber` (string, required) - Contact number
- `alternateContactNumber` (string, required) - Alternate contact number
- `emailAddress` (string, required) - Email address

#### Existing Fields (unchanged):
- `companyLogo` (file, optional)
- `contactPersons` (array, optional) - Array of contact person objects
- `outlets` (array, required) - Array of outlet objects with:
  - `name` (string, required) - Outlet name
  - `address` (string, required) - Outlet address
  - `managerName` (string, optional)
  - `managerContact` (string, optional)
- `acraBizfileCert` (file, optional)
- `serviceAgreement` (string, optional)
- `serviceContract` (file, optional)
- `contractExpiryDate` (date, optional)
- `generateCredentials` (boolean, optional)

#### Removed Fields:
- `accountManager` (string) - **REMOVED** - No longer needed in the form

#### Validation Requirements:
- All new required fields must be validated
- Email must be valid email format
- Industry must be one of the predefined values
- At least one outlet must be provided
- **Each outlet must have both `name` and `address` fields** - Both are REQUIRED
- Outlet name cannot be empty or whitespace only
- Outlet address cannot be empty or whitespace only

#### FormData Structure for Outlets:
The frontend sends outlets as FormData with the following structure:
```
outlets[0][name] = "Outlet Name" (REQUIRED)
outlets[0][address] = "Outlet Address" (REQUIRED)
outlets[0][managerName] = "Manager Name" (OPTIONAL)
outlets[0][managerContact] = "Manager Contact" (OPTIONAL)
```

**IMPORTANT:** The backend MUST validate that:
1. At least one outlet is provided
2. Each outlet has a `name` field (not empty, not null, not undefined)
3. Each outlet has an `address` field (not empty, not null, not undefined)
4. Return error if any outlet is missing the `name` field:
   ```json
   {
     "success": false,
     "message": "Each outlet must have a name",
     "error": "ValidationError"
   }
   ```

#### Response:
```json
{
  "success": true,
  "message": "Employer created successfully",
  "employer": {
    "_id": "...",
    "companyLegalName": "...",
    "industry": "...",
    "hqAddress": "...",
    "mainContactNumber": "...",
    "alternateContactNumber": "...",
    "emailAddress": "...",
    "outlets": [...]
  },
  "credentials": {
    "email": "...",
    "password": "...",
    "emailSent": true
  }
}
```

---

## 2. Job Creation API Changes

### Endpoint: `POST /api/jobs/create`

#### Removed Fields:
- `contactInfo` (object) - **REMOVED** - No longer sent from frontend
  - `contactInfo.phone`
  - `contactInfo.email`

#### New Fields:
- `industry` (string, optional) - Auto-filled from selected employer's industry
- `dressCode` (string, optional) - Replaces `jobRequirements` field
- `skills` (array, required) - Array of skills (converted from comma-separated string)
  - Example: `["Customer service", "Food handling", "Cash handling"]`

#### Modified Fields:
- `jobRequirements` (array) - **REMOVED** - Replaced by `dressCode` and `skills`
- `employerId` (string, required) - Now required (admin must select an employer)
- `employerName` (string, optional) - Auto-filled from selected employer
- `outletId` (string, optional) - Required if not using manual outlet
- `outletAddress` (string, optional) - Required if using manual outlet entry

#### Existing Fields (unchanged):
- `jobDate` (date, required)
- `jobTitle` (string, required)
- `jobDescription` (string, required)
- `jobRoles` (string, required)
- `postedBy` (string, required) - "admin" (always for admin users)
- `totalPositions` (number, required)
- `foodHygieneCertRequired` (boolean, required)
- `jobStatus` (string, required)
- `applicationDeadline` (datetime, optional)
- `locationDetails` (string, required)
- `shifts` (array, required) - Array of shift objects

#### Request Body Example:
```json
{
  "jobDate": "2024-12-20",
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
  "applicationDeadline": "2024-12-19T23:59:59",
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

#### Validation Requirements:
- `employerId` must be valid and exist
- `outletId` or `outletAddress` must be provided
- `skills` must be an array (even if empty)
- `dressCode` is optional
- All shift fields must be valid

---

## 3. Get Employer API Changes

### Endpoint: `GET /api/employers/:id`

#### Response Must Include:
- `industry` field (string) - Required for auto-population in job posting
- `outlets` array with complete outlet information:
  ```json
  {
    "success": true,
    "employer": {
      "_id": "...",
      "companyLegalName": "...",
      "industry": "Hospitality",
      "outlets": [
        {
          "_id": "...",
          "address": "...",
          "name": "...",
          "managerName": "...",
          "managerContact": "..."
        }
      ]
    }
  }
  ```

---

## 4. Get Employers List API

### Endpoint: `GET /api/employers?limit=100`

#### Response Must Include:
- All employers with `industry` field
- `outlets` array for each employer (for pre-population)
- Company name/legal name for display

#### Response Example:
```json
{
  "success": true,
  "employers": [
    {
      "_id": "...",
      "employerId": "EMP-e3d7",
      "companyLegalName": "Company Legal Name",
      "industry": "Hospitality",
      "hqAddress": "Address",
      "mainContactNumber": "1234567890",
      "alternateContactNumber": "0987654321",
      "emailAddress": "email@example.com",
      "officeNumber": "123456",
      "companyLogo": "uploads\\logo.png",
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
      "serviceAgreement": "Completed"
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

#### Important Notes:
- **employerId**: Backend should return `employerId` field (format: "EMP-xxxx" or similar) OR `_id` field
- **mainContactPersons**: Should be an array of contact person objects (not a single object)
- **emailAddress**: Field name is `emailAddress` (not `companyEmail`)
- **officeNumber**: Field name is `officeNumber` (not `companyNumber`)
- **contractExpiryDate**: Field name is `contractExpiryDate` (not `contractEndDate`)
- **companyLogo**: Path may contain backslashes (`\`) - frontend will normalize to forward slashes

---

## 5. Authorization & Role-Based Access Control

### Endpoints Requiring Admin Role:

1. **POST /api/employers/create**
   - Must check if user role is "ADMIN"
   - Return 403 Forbidden if not admin

2. **POST /api/jobs/create**
   - Must check if user role is "ADMIN"
   - Return 403 Forbidden if not admin
   - Set `postedBy` to "admin" automatically

### Implementation:
```javascript
// Middleware or route handler check
if (req.user?.role !== 'ADMIN') {
  return res.status(403).json({
    success: false,
    message: 'Only admins can perform this action'
  });
}
```

---

## 6. Database Schema Updates

### Employer Schema:
```javascript
{
  companyLegalName: { type: String, required: true },
  industry: { 
    type: String, 
    required: true,
    enum: ['Hospitality', 'IT', 'F&B', 'Hotel', 'Retail', 'Logistics', 'Healthcare', 'Education', 'Construction', 'Others']
  },
  hqAddress: { type: String, required: true },
  mainContactNumber: { type: String, required: true },
  alternateContactNumber: { type: String, required: true },
  emailAddress: { type: String, required: true },
  outlets: [{
    name: { type: String, required: true },
    address: { type: String, required: true },
    managerName: { type: String },
    managerContact: { type: String }
  }],
  // ... other fields
}
```

### Job Schema:
```javascript
{
  // ... existing fields
  industry: { type: String }, // Auto-filled from employer
  dressCode: { type: String }, // Replaces jobRequirements
  skills: [{ type: String }], // Array of skills
  status: { 
    type: String, 
    enum: ['Active', 'Suspended', 'Completed', 'Cancelled', 'Pending', 'Upcoming', 'Deactivated'],
    default: 'Active'
  },
  // Remove: contactInfo field
  // Remove: jobRequirements field (replaced by dressCode and skills)
}
```

### Job Status Values:
The following status values are supported:
- **Active** - Job is currently active and accepting applications
- **Suspended** - Job is temporarily suspended (can be reactivated later)
- **Completed** - Job has been completed
- **Cancelled** - Job has been cancelled
- **Pending** - Job is pending approval/activation
- **Upcoming** - Job is scheduled for future
- **Deactivated** - Job has been deactivated permanently

---

## 7. Migration Notes

### For Existing Data:
1. **Employers without required fields:**
   - Set default values or mark as incomplete
   - Add validation to prevent incomplete employer selection in job posting

2. **Jobs with old structure:**
   - Migrate `jobRequirements` to `dressCode` if applicable
   - Create `skills` array from existing data if possible
   - Remove `contactInfo` field or set to null

3. **Industry field:**
   - Add industry field to existing employers
   - Default to "Others" if not specified

4. **Outlet names:**
   - If existing outlets don't have names, add default names based on address or outlet ID
   - Ensure all outlets have both `name` and `address` before allowing job creation

---

## 8. Error Handling

### New Error Responses:

1. **Missing Required Fields:**
```json
{
  "success": false,
  "message": "Missing required fields: industry, alternateContactNumber",
  "error": "ValidationError"
}
```

2. **Missing Outlet Name:**
```json
{
  "success": false,
  "message": "Each outlet must have a name",
  "error": "ValidationError"
}
```

3. **Missing Outlet Address:**
```json
{
  "success": false,
  "message": "Each outlet must have an address",
  "error": "ValidationError"
}
```

4. **Empty Outlets Array:**
```json
{
  "success": false,
  "message": "At least one outlet with name and address is required",
  "error": "ValidationError"
}
```

2. **Invalid Industry:**
```json
{
  "success": false,
  "message": "Invalid industry type. Must be one of: Hospitality, IT, F&B, Hotel, Retail, Logistics, Healthcare, Education, Construction, Others",
  "error": "ValidationError"
}
```

3. **Unauthorized Access:**
```json
{
  "success": false,
  "message": "Only admins can perform this action",
  "error": "ForbiddenError"
}
```

7. **Missing Employer Selection:**
```json
{
  "success": false,
  "message": "Employer selection is required for job posting",
  "error": "ValidationError"
}
```

---

## 9. Testing Checklist

### Employer Creation:
- [ ] Test with all required fields
- [ ] Test with missing required fields
- [ ] Test with invalid industry
- [ ] Test with invalid email
- [ ] Test with non-admin user (should fail)
- [ ] Test outlet creation with employer

### Job Creation:
- [ ] Test job creation with selected employer
- [ ] Test auto-population of industry from employer
- [ ] Test auto-population of outlets from employer
- [ ] Test skills array conversion from comma-separated string
- [ ] Test with dressCode field
- [ ] Test without contactInfo (should not be sent)
- [ ] Test with non-admin user (should fail)
- [ ] Test validation for required fields
- [ ] Test job status values (Active, Suspended, Completed, etc.)
- [ ] Test job status filtering by status parameter

### API Responses:
- [ ] Verify employer list includes industry and outlets
- [ ] Verify employer detail includes all required fields
- [ ] Verify job creation response structure

---

## 10. Summary of Changes

### Frontend Changes:
1. ✅ AddEmployer form updated with required fields
2. ✅ Role-based access control for adding employers
3. ✅ NewJob form updated:
   - Auto-population of employer details
   - Auto-population of outlets
   - Removed contact fields
   - Added dressCode field
   - Added skills field (comma-separated input, array output)
4. ✅ Role-based access control for job posting
5. ✅ Nullish coalescing operators (??) added throughout

### Backend Changes Required:
1. ⚠️ Update employer creation endpoint with new required fields
2. ⚠️ Update job creation endpoint:
   - Remove contactInfo handling
   - Add dressCode field
   - Add skills array field
   - Add industry field (from employer)
3. ⚠️ Add role-based authorization checks
4. ⚠️ Update employer schema with new required fields
5. ⚠️ Update job schema (remove contactInfo, add dressCode, skills, industry)
6. ⚠️ Update employer GET endpoints to include industry and outlets
7. ⚠️ Add validation for new required fields
8. ⚠️ Update error messages for new validation rules

---

## Notes:
- All frontend changes have been completed
- Backend team needs to implement the API changes as outlined above
- Ensure backward compatibility where possible
- Test thoroughly before deployment

---

## 11. Additional Features Implemented (Complete Project)

### Delete Functionality:
1. **Delete Candidate/Profile**
   - Added delete button in Candidate Profile page (settings menu)
   - Added delete button in Edit Candidate Profile page
   - Added delete option in Hustle Heroes list (action menu)
   - All delete operations use confirmation modal
   - Proper error handling with toast notifications

2. **Delete Employer**
   - Added delete option in Employers list (action menu)
   - Confirmation modal with warning about associated data
   - Proper error handling

3. **Delete Job**
   - Added delete option in Job Management list (action menu)
   - Confirmation modal
   - Proper error handling

### Enhanced Features:
1. **Hustle Heroes Page**
   - View profile (navigates to edit page which shows full profile)
   - Edit profile (navigates to edit page)
   - Delete profile (with confirmation)
   - Fixed navigation links

2. **Applicant Management**
   - Improved status change handling
   - Better error messages with toast notifications
   - Rejection reason validation

3. **Error Handling**
   - All API calls use toast notifications
   - Proper error messages from backend
   - Fallback error messages
   - Loading states for all async operations

4. **Navigation**
   - All links properly configured
   - Fixed candidate profile navigation
   - Proper redirects after delete operations

### API Endpoints Used:
- `DELETE /api/admin/candidates/:id` - Delete candidate
- `DELETE /api/employers/:id` - Delete employer
- `DELETE /api/jobs/:id` - Delete job
- `PUT /api/admin/applications/status/:userId` - Update application status

### Components Created:
- `ConfirmationModal.tsx` - Reusable confirmation modal for delete operations

---

## 12. Job Status Management

### Job Status Values:
The frontend now supports the following job statuses:
- **All Jobs** - Shows all jobs regardless of status
- **Active** - Shows only active jobs
- **Suspended** - Shows only suspended jobs (temporarily paused)
- **Completed** - Shows only completed jobs

### API Endpoint Updates:

**GET /api/jobs** - Should support filtering by status:
- Query parameter: `status` (string, optional)
  - Values: "Active", "Suspended", "Completed", "Cancelled", "Pending", "Upcoming", "Deactivated"
  - If not provided, returns all jobs

**PUT /api/jobs/:id** - Update job status:
```json
{
  "status": "Suspended" // or any valid status value
}
```

### Status Change Rules:
- Jobs can be changed from "Active" to "Suspended" and back
- Jobs can be changed from "Active" to "Completed"
- Suspended jobs can be reactivated to "Active"
- Completed jobs should not be changed back to Active

---

## 13. Job Status Management & Filtering

### Frontend Tab Structure:
The frontend now displays only 4 tabs for job filtering:
1. **All Jobs** - Shows all jobs regardless of status
2. **Active** - Shows only jobs with status "Active"
3. **Suspended** - Shows only jobs with status "Suspended"
4. **Completed** - Shows only jobs with status "Completed"

### API Endpoint Updates:

**GET /api/jobs** - Should support filtering by status:
- Query parameter: `status` (string, optional)
  - Values: "Active", "Suspended", "Completed", "Cancelled", "Pending", "Upcoming", "Deactivated"
  - If not provided or empty string, returns all jobs
  - Example: `/api/jobs?status=Active` returns only active jobs
  - Example: `/api/jobs?status=Suspended` returns only suspended jobs

**PUT /api/jobs/:id** - Update job status:
```json
{
  "status": "Suspended" // or any valid status value
}
```

### Status Change Rules:
- Jobs can be changed from "Active" to "Suspended" and back to "Active"
- Jobs can be changed from "Active" to "Completed"
- Suspended jobs can be reactivated to "Active"
- Completed jobs should typically not be changed back to Active (business rule)

### Response Format:
When filtering by status, the API should return:
```json
{
  "success": true,
  "jobs": [...],
  "pagination": {
    "totalItems": 100,
    "totalPages": 10,
    "currentPage": 1,
    "limit": 10
  },
  "totalActiveJobs": 50,
  "totalCompletedJobs": 30,
  "totalCancelledJobs": 10,
  "currentFulfilmentRate": 85.5
}
```

---

## 14. Dynamic Data Requirements (Latest Update)

### Penalties API Endpoint:

**New Endpoint: `GET /api/admin/penalties`**

This endpoint should return default penalties configuration that can be used across the application.

#### Response Format:
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

#### Alternative: Job-Specific Penalties
Jobs can also have their own penalties array. If a job has `penalties` field, it should be used instead of default penalties.

#### Job Schema Update:
```javascript
{
  // ... existing fields
  penalties: [{
    condition: { type: String },
    penalty: { type: String }
  }], // Optional - job-specific penalties
  maxStandby: { type: Number }, // Optional - max standby limit
  maxVacancy: { type: Number }, // Optional - max vacancy limit
}
```

### Job Details API Updates:

**Endpoint: `GET /api/jobs/:id`**

#### Response Must Include:
- `penalties` array (if job-specific penalties exist, otherwise can be null/empty)
- `maxStandby` (number, optional) - Maximum standby positions allowed
- `maxVacancy` (number, optional) - Maximum vacancy positions allowed

#### Response Example:
```json
{
  "success": true,
  "job": {
    "_id": "...",
    "jobTitle": "...",
    "maxStandby": 1,
    "maxVacancy": 3,
    "penalties": [
      {
        "condition": "24 Hours (1st Time)",
        "penalty": "$5 Penalty"
      }
    ],
    "shifts": [...]
  }
}
```

### Shifts Data Structure:

**Endpoint: `GET /api/jobs/:id` (for ShiftsInfo component)**

The shifts array should include all necessary fields for the modify shifts functionality:

```json
{
  "shifts": [
    {
      "id": "...",
      "startTime": "09:00",
      "endTime": "17:00",
      "availableVacancy": 5,
      "standbyVacancy": 2,
      "totalHours": 8,
      "breakHours": 1,
      "breakType": "Paid",
      "totalWage": 100
    }
  ]
}
```

**Note:** The frontend will map these fields:
- `availableVacancy` or `vacancy` → availableVacancy
- `standbyVacancy` or `standby` → standbyVacancy
- `totalHours` or `totalWorkingHours` or `duration` → totalHours
- `breakHours` or `breakDuration` → breakHours
- `totalWage` or `totalWages` → totalWage

### Summary of New API Requirements:

1. **GET /api/admin/penalties** - Returns default penalties configuration
2. **Job Schema** - Add optional `penalties`, `maxStandby`, `maxVacancy` fields
3. **Job Details Response** - Include `penalties`, `maxStandby`, `maxVacancy` in response
4. **Shifts Data** - Ensure shifts include all fields needed for modification

### Backward Compatibility:

- If `penalties` endpoint doesn't exist, frontend will handle gracefully (empty array)
- If `maxStandby`/`maxVacancy` are not in job data, frontend uses defaults (1 and 3)
- All new fields are optional to maintain backward compatibility

---

## 13. Job Status Management & Filtering

### Frontend Tab Structure:
The frontend now displays only 4 tabs for job filtering:
1. **All Jobs** - Shows all jobs regardless of status (no status filter applied)
2. **Active** - Shows only jobs with status "Active"
3. **Suspended** - Shows only jobs with status "Suspended" (temporarily paused)
4. **Completed** - Shows only jobs with status "Completed"

### API Endpoint Updates:

**GET /api/jobs** - Should support filtering by status:
- Query parameter: `status` (string, optional)
  - Values: "Active", "Suspended", "Completed", "Cancelled", "Pending", "Upcoming", "Deactivated"
  - If not provided or empty string, returns all jobs
  - Example: `/api/jobs?status=Active` returns only active jobs
  - Example: `/api/jobs?status=Suspended` returns only suspended jobs
  - Example: `/api/jobs` (no status) returns all jobs

**PUT /api/jobs/:id** - Update job status:
```json
{
  "status": "Suspended" // or any valid status value
}
```

#### Response Format:
```json
{
  "success": true,
  "message": "Job status updated successfully",
  "job": {
    "_id": "...",
    "status": "Suspended",
    ...
  }
}
```

### Status Change Rules:
- Jobs can be changed from "Active" to "Suspended" and back to "Active"
- Jobs can be changed from "Active" to "Completed"
- Suspended jobs can be reactivated to "Active"
- Completed jobs should typically not be changed back to Active (business rule - implement validation if needed)

### Job Status Enum:
The backend should validate that job status is one of:
- `Active`
- `Suspended`
- `Completed`
- `Cancelled`
- `Pending`
- `Upcoming`
- `Deactivated`

### Response Format for Job List:
When filtering by status, the API should return:
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "...",
      "jobTitle": "...",
      "status": "Active",
      ...
    }
  ],
  "pagination": {
    "totalItems": 100,
    "totalPages": 10,
    "currentPage": 1,
    "limit": 10
  },
  "totalActiveJobs": 50,
  "totalCompletedJobs": 30,
  "totalCancelledJobs": 10,
  "currentFulfilmentRate": 85.5
}
```

### Testing:
- [ ] Test GET /api/jobs with status=Active filter
- [ ] Test GET /api/jobs with status=Suspended filter
- [ ] Test GET /api/jobs with status=Completed filter
- [ ] Test GET /api/jobs without status (should return all)
- [ ] Test PUT /api/jobs/:id to change status to Suspended
- [ ] Test PUT /api/jobs/:id to reactivate Suspended job
- [ ] Test invalid status value (should return validation error)


