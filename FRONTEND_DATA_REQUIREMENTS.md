# Frontend Data Requirements - WorkLah Admin Panel

**Date:** January 26, 2026  
**Purpose:** This document specifies what data should be displayed on each page of the admin panel. This is to be shared with the backend team to ensure API endpoints return the correct data.

---

## 📋 Overview

The admin panel has distinct sections that should display **ONLY** their respective data types:
- **Hustle Heroes** → Only Users (role: USER)
- **Employers** → Only Employers
- **Job Candidates** → Only Applicants for a specific job
- **Applications** → All job applications

---

## 1. Hustle Heroes Page (`/hustle-heroes`)

### Current Endpoint Used:
- `GET /api/admin/users?role=USER`

### Required Data:
**ONLY users who have registered in the mobile app (React Native app) with role = "USER"**

### What Should Be Displayed:
- User ID
- Full Name
- Gender
- Mobile Number
- IC Number (NRIC)
- Date of Birth
- Age
- Registration Date
- Status (Active, Suspended, etc.)
- Verification Status (Pending, Verified, Rejected)
- Profile Picture

### What Should NOT Be Displayed:
- ❌ Admin users (role: ADMIN)
- ❌ Employer users (role: EMPLOYER)
- ❌ Any data that is not a registered user from the mobile app

### API Endpoint Specification:
```
GET /api/admin/users
Query Parameters:
  - role: "USER" (required - must filter to only USER role)
  - page: (optional)
  - limit: (optional)
  - search: (optional)
  - profileCompleted: (optional)
  - status: (optional)
```

### Expected Response:
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
      "dob": "1990-01-15",
      "gender": "Male",
      "registrationDate": "2025-01-10T10:00:00Z",
      "workPassStatus": "Verified"
    }
  ],
  "pagination": {...}
}
```

### Filter Options:
- **Activated**: Users with status "Active" or "Approved"
- **Pending Verification**: Users with workPassStatus "Pending"
- **Verified**: Users with workPassStatus "Verified"
- **No Show**: Users with low turn-up rate or "No Show" status

---

## 2. Employers Page (`/employers`)

### Current Endpoint Used:
- `GET /api/admin/employers`

### Required Data:
**ONLY employers (companies/businesses) - NOT users**

### What Should Be Displayed:
- Employer ID (EMP-xxxx)
- Company Legal Name
- Company Logo
- Main Contact Person Name
- Main Contact Person Position
- Main Contact Number
- Company Email
- Number of Outlets
- Service Agreement Status
- Industry
- Status (Active, Suspended, etc.)
- Created Date

### What Should NOT Be Displayed:
- ❌ Users (role: USER)
- ❌ Admin users (role: ADMIN)
- ❌ Any individual user data

### API Endpoint Specification:
```
GET /api/admin/employers
Query Parameters:
  - page: (optional)
  - limit: (optional)
  - search: (optional)
```

### Expected Response:
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
      "outlets": [...],
      "status": "active",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

## 3. Job Candidates Page (`/jobs/:jobId/candidates`)

### Current Endpoint Used:
- `GET /api/admin/jobs/candidates/:jobId`

### Required Data:
**ONLY applicants/users who have applied for THIS SPECIFIC JOB**

### What Should Be Displayed:
- Application ID
- User Full Name
- User Profile Picture
- User Contact Number
- Shift Applied For (start time - end time)
- Application Status (Pending, Confirmed, Rejected)
- Admin Status (Pending, Confirmed, Rejected)
- Applied Date/Time
- User ID

### What Should NOT Be Displayed:
- ❌ Users who haven't applied for this job
- ❌ Employers
- ❌ Admins
- ❌ Applications for other jobs

### API Endpoint Specification:
```
GET /api/admin/jobs/candidates/:jobId
```

### Expected Response:
```json
{
  "success": true,
  "candidates": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "applicationId": "507f1f77bcf86cd799439016",
      "userId": "507f1f77bcf86cd799439011",
      "user": {
        "fullName": "John Doe",
        "phoneNumber": "+6512345678",
        "profilePicture": "https://worklah.onrender.com/uploads/profile.jpg",
        "email": "john@example.com"
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
  "job": {
    "jobName": "Waiter Position",
    "jobDate": "2025-01-15"
  },
  "pagination": {...}
}
```

---

## 4. All Applications Page (If exists)

### Recommended Endpoint:
- `GET /api/admin/applications`

### Required Data:
**ALL job applications across all jobs**

### What Should Be Displayed:
- Application ID
- User Information (name, profile picture)
- Job Information (job name, job date)
- Application Status
- Applied Date
- Shift Information

### API Endpoint Specification:
```
GET /api/admin/applications
Query Parameters:
  - page: (optional)
  - limit: (optional)
  - status: (optional) - Pending, Approved, Rejected
  - jobId: (optional) - Filter by job
  - userId: (optional) - Filter by user
  - startDate: (optional)
  - endDate: (optional)
```

---

## 5. Job Management Page (`/jobs/job-management`)

### Current Endpoint Used:
- `GET /api/admin/jobs`

### Required Data:
**ALL jobs posted in the system**

### What Should Be Displayed:
- Job ID
- Job Name/Title
- Job Date
- Job Status
- Employer Information
- Outlet Information
- Location
- Industry
- Total Positions
- Application Deadline
- Posted By (admin or employer)

### API Endpoint Specification:
```
GET /api/admin/jobs
Query Parameters:
  - page: (optional)
  - limit: (optional)
  - status: (optional)
  - employerId: (optional)
  - startDate: (optional)
  - endDate: (optional)
  - search: (optional)
```

---

## 🔍 Critical Issues Fixed

### Issue 1: Hustle Heroes Showing Admin Data ✅ FIXED
**Problem:** Was using `/admin/candidates` which might return admins  
**Solution:** ✅ Now using `/admin/users?role=USER` to get ONLY users  
**Status:** Frontend updated to use correct endpoint

### Issue 2: Data Mixing
**Problem:** Different pages might be showing wrong data types  
**Solution:** Ensure each endpoint returns ONLY the correct data type:
- `/admin/users?role=USER` → Only users
- `/admin/employers` → Only employers
- `/admin/jobs/candidates/:jobId` → Only applicants for that job

---

## 📝 Backend Requirements

### For `/api/admin/users` Endpoint:
1. **MUST** filter by role when `role=USER` is provided
2. **MUST NOT** return ADMIN or EMPLOYER roles when `role=USER` is specified
3. **MUST** return only users who registered via the mobile app
4. **MUST** include all user profile fields (nric, dob, gender, etc.)

### For `/api/admin/employers` Endpoint:
1. **MUST** return only employer records
2. **MUST NOT** return user data
3. **MUST** include outlets array for each employer

### For `/api/admin/jobs/candidates/:jobId` Endpoint:
1. **MUST** return only applicants for the specified job
2. **MUST** include user information for each applicant
3. **MUST** include shift information
4. **MUST NOT** return applicants for other jobs

---

## ✅ Testing Checklist

### Hustle Heroes Page:
- [ ] Shows ONLY users with role=USER
- [ ] Does NOT show admin users
- [ ] Does NOT show employer users
- [ ] Shows all user profile information
- [ ] Filters work correctly (activated, pending, verified, no-show)

### Employers Page:
- [ ] Shows ONLY employers
- [ ] Does NOT show users
- [ ] Shows all employer information
- [ ] Search and filters work correctly

### Job Candidates Page:
- [ ] Shows ONLY applicants for the specific job
- [ ] Does NOT show applicants for other jobs
- [ ] Shows user information for each applicant
- [ ] Shows shift information

---

## 🔗 Related API Documentation

Refer to `COMPLETE_API_DOCUMENTATION.md` for full API specifications:
- Section 13: User Management (Admin - ReactJS)
- Section 10: Employer Management (ReactJS)
- Section 11: Job Management (Admin - ReactJS)
- Section 12: Application Management (Admin - ReactJS)
- Section 15: Candidate Management (ReactJS)

---

## 📞 Notes for Backend Team

### Critical Requirements:

1. **Role Filtering is Critical**: 
   - The `/admin/users` endpoint **MUST** respect the `role` query parameter
   - When `role=USER` is provided, return **ONLY** users with role "USER"
   - **MUST NOT** return ADMIN or EMPLOYER roles when `role=USER` is specified
   - This is essential for the Hustle Heroes page to work correctly

2. **Data Separation**: 
   Each endpoint should return **ONLY** its specific data type. Do not mix:
   - ❌ Users should **NOT** appear in employer endpoints
   - ❌ Employers should **NOT** appear in user endpoints  
   - ❌ Admins should **NOT** appear in user endpoints
   - ❌ Users from other jobs should **NOT** appear in job-specific candidate endpoints

3. **Response Format**: 
   All endpoints should follow the standard response format:
   ```json
   {
     "success": true,
     "users": [...], // or "employers", "candidates", "applications" etc.
     "pagination": {
       "currentPage": 1,
       "totalPages": 10,
       "totalItems": 200,
       "itemsPerPage": 20
     }
   }
   ```

4. **Profile Completion**: 
   For users endpoint (`/admin/users`), ensure all profile fields are included:
   - `nric` or `icNumber` (IC/NRIC number)
   - `dob` (date of birth)
   - `gender` (Male/Female)
   - `phoneNumber` (contact number)
   - `profilePicture` (profile image URL)
   - `registrationDate` or `createdAt` (when user registered)
   - `workPassStatus` or `verificationStatus` (Pending/Verified/Rejected)
   - All these fields are displayed in the Hustle Heroes list

5. **User Registration Source**:
   - The `/admin/users?role=USER` endpoint should return **ONLY** users who registered via the mobile app (React Native app)
   - These are the "Hustle Heroes" - job seekers/part-time workers
   - Do not include admin-created users unless they also registered via the app

---

## 🔄 Frontend Changes Made

### Hustle Heroes Page (`src/pages/hustleHeroes/HustleHeroesList.tsx`):
- ✅ Changed endpoint from `/admin/candidates` to `/admin/users?role=USER`
- ✅ Added role filtering to ensure only USER role is displayed
- ✅ Updated data mapping to handle API response format
- ✅ Updated delete endpoint to use `/admin/users/:userId` instead of `/admin/candidates/:id`
- ✅ Added proper error handling and user feedback

### Data Mapping:
The frontend now maps API user data to the display format:
- `_id` → `id` (for internal use)
- `phoneNumber` → `mobile` (for display)
- `createdAt` → `registrationDate` (for display)
- `workPassStatus` or `verificationStatus` → status display

---

## ✅ Testing Checklist for Backend Team

### Test `/admin/users?role=USER`:
- [ ] Returns ONLY users with role="USER"
- [ ] Does NOT return any users with role="ADMIN"
- [ ] Does NOT return any users with role="EMPLOYER"
- [ ] Includes all required profile fields (nric, dob, gender, etc.)
- [ ] Returns users who registered via mobile app
- [ ] Pagination works correctly
- [ ] Search filter works correctly

### Test `/admin/employers`:
- [ ] Returns ONLY employer records
- [ ] Does NOT return any user data
- [ ] Includes outlets array for each employer

### Test `/admin/jobs/candidates/:jobId`:
- [ ] Returns ONLY applicants for the specified job
- [ ] Does NOT return applicants for other jobs
- [ ] Includes user information for each applicant
- [ ] Includes shift information

---

**End of Document**
