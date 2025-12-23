# Employer API Format Specification

This document provides the exact format for employer-related API endpoints that the frontend should use.

---

## Base URL
```
http://localhost:3000/api
```

---

## 1. Get Single Employer

**Endpoint:** `GET /employers/:id`

### ID Format Support

The `:id` parameter accepts **TWO formats**:

1. **MongoDB ObjectId** (24-character hex string)
   - Example: `507f1f77bcf86cd799439011`
   - Format: `[0-9a-f]{24}`

2. **Employer ID** (EMP-xxxx format)
   - Example: `EMP-e3d7`, `EMP-0001`, `EMP-1234`
   - Format: `EMP-[0-9a-f]{1,4}`
   - The suffix can be 1-4 hexadecimal characters (case-insensitive)
   - Leading zeros are optional (e.g., `EMP-1` = `EMP-0001`)

### Request Examples

```bash
# Using MongoDB ObjectId
GET http://localhost:3000/api/employers/507f1f77bcf86cd799439011

# Using Employer ID (recommended)
GET http://localhost:3000/api/employers/EMP-e3d7
GET http://localhost:3000/api/employers/EMP-0001
GET http://localhost:3000/api/employers/EMP-1234
```

### Success Response (200)

```json
{
  "success": true,
  "employer": {
    "_id": "507f1f77bcf86cd799439011",
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

### Error Responses

**400 - Invalid ID Format:**
```json
{
  "success": false,
  "message": "Invalid employer ID format. Use MongoDB ObjectId or employerId format (EMP-xxxx)"
}
```

**404 - Employer Not Found:**
```json
{
  "success": false,
  "message": "Employer not found"
}
```

---

## 2. Get Employers List

**Endpoint:** `GET /employers?page=1&limit=10`

### Query Parameters

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in company name, email, or contact person name
- `industry` (optional): Filter by industry
- `serviceAgreement` (optional): Filter by service agreement status

### Success Response (200)

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

---

## 3. Create Employer (Admin Only)

**Endpoint:** `POST /employers/create`

**Authorization:** ADMIN role required

**Content-Type:** `multipart/form-data`

### Request Fields

**Required Fields:**
- `companyLegalName` (string): Company legal name
- `industry` (string): One of: `["Hospitality", "IT", "F&B", "Hotel", "Retail", "Logistics", "Healthcare", "Education", "Construction", "Others"]`
- `hqAddress` (string): Headquarters address
- `mainContactNumber` (string): Main contact number
- `alternateContactNumber` (string): Alternate contact number
- `emailAddress` (string): Valid email address
- `outlets[0][name]` (string): **REQUIRED** - Outlet name (cannot be empty or whitespace)
- `outlets[0][address]` (string): **REQUIRED** - Outlet address (cannot be empty or whitespace)

**Optional Fields:**
- `companyLogo` (file): Company logo image
- `contactPersons[0][name]` (string): Contact person name
- `contactPersons[0][position]` (string): Contact person position
- `contactPersons[0][number]` (string): Contact person number
- `outlets[0][managerName]` (string): Outlet manager name
- `outlets[0][managerContact]` (string): Outlet manager contact
- `acraBizfileCert` (file): ACRA business file certificate
- `serviceAgreement` (string): Service agreement status
- `serviceContract` (file): Service contract PDF
- `contractExpiryDate` (string): Contract expiry date (YYYY-MM-DD)
- `generateCredentials` (string): "true" to generate login credentials

### Success Response (201)

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

### Error Responses

**400 - Validation Error:**
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
  "message": "Each outlet must have an address",
  "error": "ValidationError"
}
```

**403 - Forbidden:**
```json
{
  "success": false,
  "message": "Only admins can perform this action",
  "error": "ForbiddenError"
}
```

---

## 4. Update Employer

**Endpoint:** `PUT /employers/:id`

**Content-Type:** `multipart/form-data`

**ID Format:** Same as Get Single Employer (supports both ObjectId and EMP-xxxx)

### Request Fields

Same as Create Employer (all fields optional for updates)

### Success Response (200)

```json
{
  "success": true,
  "message": "Employer updated successfully",
  "employer": {...}
}
```

---

## 5. Delete Employer

**Endpoint:** `DELETE /employers/:id`

**ID Format:** Same as Get Single Employer (supports both ObjectId and EMP-xxxx)

### Success Response (200)

```json
{
  "success": true,
  "message": "Employer deleted successfully"
}
```

---

## Important Notes

1. **ID Format Priority:**
   - The API accepts both MongoDB ObjectId and `employerId` (EMP-xxxx) formats
   - For consistency, use `employerId` format (EMP-xxxx) when available
   - The `employerId` is generated from the last 4 characters of the MongoDB `_id`

2. **Outlet Validation:**
   - At least one outlet is **REQUIRED**
   - Each outlet **MUST** have both `name` and `address`
   - Both fields cannot be empty, null, undefined, or whitespace-only

3. **Response Fields:**
   - All responses include `_id` (MongoDB ObjectId) and `employerId` (EMP-xxxx format)
   - `accountManager` field is always "N/A" (field removed from schema but kept in API for compatibility)
   - `contractStartDate` and `contractExpiryDate` return `null` if not set (not "N/A")

4. **File Paths:**
   - Backend may return paths with backslashes (`\`), frontend should normalize to forward slashes (`/`)

5. **Pagination:**
   - Default page: 1
   - Default limit: 10
   - Pagination metadata is included in all list responses

---

## Frontend Implementation Guide

### Recommended Approach

```javascript
// Use employerId format when available
const employerId = employer.employerId; // "EMP-e3d7"
const response = await fetch(`http://localhost:3000/api/employers/${employerId}`);

// Or use MongoDB _id if employerId is not available
const mongoId = employer._id; // "507f1f77bcf86cd799439011"
const response = await fetch(`http://localhost:3000/api/employers/${mongoId}`);
```

### Error Handling

```javascript
try {
  const response = await fetch(`http://localhost:3000/api/employers/${id}`);
  const data = await response.json();
  
  if (!data.success) {
    // Handle API error
    console.error(data.message);
    // data.error contains error type: "ValidationError", "ForbiddenError", etc.
  }
} catch (error) {
  // Handle network error
  console.error('Network error:', error);
}
```

---

**Last Updated:** 2024-12-22

