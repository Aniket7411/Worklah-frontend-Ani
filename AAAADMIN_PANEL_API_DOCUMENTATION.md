# WorkLah Admin Panel - API Documentation for React.js Developers

**📌 This is the MAIN API documentation file for React.js Admin Panel developers**

**Document Version:** 1.0.0  
**Last Updated:** January 2025  
**Purpose:** Complete API specification for React.js Admin Panel  
**Backend:** Node.js Express API  
**Frontend:** React.js (Admin-facing)

---

## 🎯 **FOR REACT.JS DEVELOPERS - READ THIS FIRST**

This document contains **ALL API endpoints** required by the React.js Admin Panel. The backend has been updated to match these specifications.

### 📋 **Files to Reference:**

1. **`ADMIN_PANEL.md`** - **PRIMARY FILE** (This contains all endpoint specifications)
2. **`DEVELOPER_HANDOFF_GUIDE.md`** - Critical requirements and implementation guidelines

---

## ⚠️ **CRITICAL REQUIREMENTS**

### 1. **ALL responses include `success` field** ✅
Every API response will have:
- Success: `{ "success": true, ... }`
- Error: `{ "success": false, "message": "...", ... }`

### 2. **Admin Authentication**
- **Login:** `POST /admin/login` (email/password) - Full URL: `/api/admin/login`
- **Logout:** `POST /admin/logout` - Full URL: `/api/admin/logout`
- **Get Current Admin:** `GET /admin/me` - Full URL: `/api/admin/me`
- Admin token stored in cookie or Authorization header
- Token expires in 7 days (604800 seconds)
- **Note:** Use endpoints without `/api` prefix when baseURL includes `/api`

### 3. **Base Configuration**

**Base URL:**
```
Production: https://worklah-updated-dec.onrender.com/api
Development: http://localhost:3000/api
```

**⚠️ CRITICAL: Endpoint Path Format**
- Base URL already includes `/api`
- Use endpoints WITHOUT `/api` prefix
- ✅ Correct: `/admin/login` → Full URL: `http://localhost:3000/api/admin/login`
- ❌ Wrong: `/api/admin/login` → Full URL: `http://localhost:3000/api/api/admin/login` (404 Error)

**Examples:**
- Base URL: `http://localhost:3000/api`
- Endpoint: `/admin/login` (NOT `/api/admin/login`)
- Endpoint: `/admin/notifications` (NOT `/api/admin/notifications`)
- Endpoint: `/admin/jobs` (NOT `/api/admin/jobs`)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {adminToken}
```

**Authentication:**
- All admin endpoints require authentication
- Token sent via `Authorization: Bearer {token}` header
- Invalid/expired tokens return `401 Unauthorized`

---

## 📚 **Main API Endpoint Categories**

The `ADMIN_PANEL.md` file contains detailed specifications for:

1. **Admin Authentication** (`POST /admin/login`, `POST /admin/logout`, `GET /admin/me`)
2. **Dashboard & Analytics** (`GET /admin/dashboard/stats`, `/admin/dashboard/charts`, etc.)
3. **Job Management** (CRUD operations for jobs: `/admin/jobs`)
4. **Application Management** (View, update, approve/reject: `/admin/applications`)
5. **User Management** (View users, verify candidates: `/admin/users`)
6. **Employer Management** (CRUD operations: `/admin/employers`)
7. **Outlet Management** (Manage outlets: `/admin/outlets`)
8. **Payment & Wallet Management** (View payments, process withdrawals: `/admin/transactions`)
9. **Notification Management** (Send notifications: `/admin/notifications`)
10. **Attendance Management** (View attendance records: `/admin/attendance`)
11. **QR Code Management** (Generate, view, delete QR codes: `/admin/qr-codes`)
12. **Reports & Analytics** (Generate reports: `/admin/reports`)
13. **Settings & Configuration** (Rate configuration, penalties: `/admin/settings`)

**⚠️ Remember:** All endpoints shown above are relative paths. When baseURL is `http://localhost:3000/api`, use them as-is (e.g., `/admin/login`), NOT with `/api` prefix.

---

## 🚀 **Quick Start for React Developers**

### 1. **Install Dependencies**
```bash
npm install axios
# or
yarn add axios
```

### 2. **Setup API Service**

Create an API service file (`services/api.js`):

```javascript
import axios from 'axios';

// ⚠️ IMPORTANT: Base URL already includes '/api'
// When making requests, use endpoints WITHOUT '/api' prefix
// Example: '/admin/login' NOT '/api/admin/login'
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL, // Already includes '/api'
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response.data, // Extract data from response
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
```

### 3. **Example Usage**

```javascript
// Admin Login
// ✅ CORRECT: '/admin/login' (baseURL already includes '/api')
// ❌ WRONG: '/api/admin/login' (would result in '/api/api/admin/login')
const loginAdmin = async (email, password) => {
  try {
    const response = await api.post('/admin/login', { email, password });
    if (response.success) {
      localStorage.setItem('adminToken', response.token);
      return response.admin;
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Get Dashboard Stats
// ✅ CORRECT: '/admin/dashboard/stats'
const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard/stats');
    if (response.success) {
      return response.stats;
    }
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
    throw error;
  }
};

// Get Admin Notifications
// ✅ CORRECT: '/admin/notifications?limit=50'
// ❌ WRONG: '/api/admin/notifications?limit=50' (404 Error)
const getNotifications = async (limit = 50) => {
  try {
    const response = await api.get('/admin/notifications', {
      params: { limit }
    });
    if (response.success) {
      return response.notifications;
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};

// Get All Jobs
// ✅ CORRECT: '/admin/jobs'
const getAllJobs = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/admin/jobs', {
      params: { page, limit }
    });
    if (response.success) {
      return response.jobs;
    }
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    throw error;
  }
};

// Get All QR Codes
// ✅ CORRECT: '/admin/qr-codes'
// ❌ WRONG: '/api/admin/qr-codes' (404 Error)
const getAllQRCodes = async (employerId, outletId, status) => {
  try {
    const response = await api.get('/admin/qr-codes', {
      params: {
        employerId, // optional: filter by employer
        outletId,   // optional: filter by outlet
        status      // optional: 'Active' or 'Inactive'
      }
    });
    if (response.success) {
      return response.qrCodes;
    }
  } catch (error) {
    console.error('Failed to fetch QR codes:', error);
    throw error;
  }
};

// Generate QR Code
// ✅ CORRECT: '/admin/qr-codes/generate'
const generateQRCode = async (employerId, outletId) => {
  try {
    const response = await api.post('/admin/qr-codes/generate', {
      employerId, // required
      outletId    // required
    });
    if (response.success) {
      return response.qrCode;
    }
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw error;
  }
};

// Delete QR Code
// ✅ CORRECT: '/admin/qr-codes/:qrCodeId'
const deleteQRCode = async (qrCodeId) => {
  try {
    const response = await api.delete(`/admin/qr-codes/${qrCodeId}`);
    if (response.success) {
      return response.message;
    }
  } catch (error) {
    console.error('Failed to delete QR code:', error);
    throw error;
  }
};
```

---

## 📱 **QR Code Management Endpoints**

### Get All QR Codes
**Endpoint:** `GET /admin/qr-codes`  
**Full URL:** `https://worklah-updated-dec.onrender.com/api/admin/qr-codes`  
**Access:** Admin only

**Query Parameters:**
- `employerId` (optional): Filter by employer ID
- `outletId` (optional): Filter by outlet ID
- `status` (optional): Filter by status - `"Active"` or `"Inactive"`

**Example Request:**
```javascript
// Get all QR codes
const qrCodes = await api.get('/admin/qr-codes');

// Get active QR codes for a specific employer
const activeQRCodes = await api.get('/admin/qr-codes', {
  params: {
    employerId: '507f1f77bcf86cd799439012',
    status: 'Active'
  }
});
```

**Success Response (200):**
```json
{
  "success": true,
  "qrCodes": [
    {
      "_id": "507f1f77bcf86cd799439025",
      "qrCodeId": "A-1234",
      "employerId": "507f1f77bcf86cd799439012",
      "employer": {
        "_id": "507f1f77bcf86cd799439012",
        "companyLegalName": "ABC Restaurant Pte Ltd",
        "logo": "https://worklah.onrender.com/uploads/logo.png"
      },
      "outletId": "507f1f77bcf86cd799439013",
      "outlet": {
        "_id": "507f1f77bcf86cd799439013",
        "outletName": "Orchard Branch",
        "outletAddress": "123 Orchard Road"
      },
      "status": "Active",
      "generatedAt": "2024-12-25T10:00:00Z",
      "validFrom": "2024-12-25T00:00:00Z",
      "validUntil": "2024-12-26T00:00:00Z"
    }
  ]
}
```

---

### Generate QR Code
**Endpoint:** `POST /admin/qr-codes/generate`  
**Full URL:** `https://worklah-updated-dec.onrender.com/api/admin/qr-codes/generate`  
**Access:** Admin only

**Request Body:**
```json
{
  "employerId": "507f1f77bcf86cd799439012",
  "outletId": "507f1f77bcf86cd799439013"
}
```

**Example Request:**
```javascript
const generateQRCode = async (employerId, outletId) => {
  try {
    const response = await api.post('/admin/qr-codes/generate', {
      employerId,
      outletId
    });
    
    if (response.success) {
      console.log('QR Code generated:', response.qrCode);
      return response.qrCode;
    }
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw error;
  }
};
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "qrCode": {
    "_id": "507f1f77bcf86cd799439025",
    "qrCodeId": "A-1234",
    "employerId": "507f1f77bcf86cd799439012",
    "outletId": "507f1f77bcf86cd799439013",
    "qrData": "{\"employerId\":\"...\",\"outlet\":{...}}",
    "status": "Active",
    "generatedAt": "2024-12-25T10:00:00Z"
  }
}
```

**Error Responses:**
- `400`: Missing required fields (`employerId` or `outletId`)
- `404`: Employer or outlet not found
- `404`: No jobs found for employer-outlet combination

---

### Delete QR Code
**Endpoint:** `DELETE /admin/qr-codes/:qrCodeId`  
**Full URL:** `https://worklah-updated-dec.onrender.com/api/admin/qr-codes/:qrCodeId`  
**Access:** Admin only

**Example Request:**
```javascript
const deleteQRCode = async (qrCodeId) => {
  try {
    const response = await api.delete(`/admin/qr-codes/${qrCodeId}`);
    
    if (response.success) {
      console.log('QR Code deleted:', response.message);
      return response.message;
    }
  } catch (error) {
    console.error('Failed to delete QR code:', error);
    throw error;
  }
};

// Usage
await deleteQRCode('507f1f77bcf86cd799439025');
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "QR code deleted successfully"
}
```

**Error Responses:**
- `404`: QR code not found

---

## ✅ **Backend Status**

✅ **All admin endpoints are implemented and tested**
✅ **All responses include `success` field**
✅ **Authentication middleware working**
✅ **Role-based access control (ADMIN only) implemented**

---

## 📝 **Next Steps**

1. **Read `ADMIN_PANEL.md`** - Contains all endpoint details
2. **Review `DEVELOPER_HANDOFF_GUIDE.md`** - Important implementation guidelines
3. **Test endpoints** using Postman or the provided collection
4. **Implement React components** following the API specifications

---

## 🔧 **Troubleshooting**

### Common Issue: 404 Not Found with Duplicate `/api`

**Problem:**
```
Request URL: http://localhost:3000/api/api/admin/notifications
Status Code: 404 Not Found
```

**Cause:**
- Base URL already includes `/api`: `http://localhost:3000/api`
- Endpoint path also includes `/api`: `/api/admin/notifications`
- Result: Duplicate `/api/api/` in URL

**Solution:**
```javascript
// ❌ WRONG - Don't include '/api' in endpoint path
api.get('/api/admin/notifications');

// ✅ CORRECT - Use endpoint without '/api' prefix
api.get('/admin/notifications');
```

**Quick Fix Checklist:**
1. ✅ Check your `baseURL` in axios config - should be `http://localhost:3000/api`
2. ✅ Remove `/api` prefix from all endpoint paths
3. ✅ Use relative paths: `/admin/login`, `/admin/jobs`, etc.
4. ✅ Test with: `api.get('/admin/notifications', { params: { limit: 50 } })`

### Other Common Issues

**401 Unauthorized:**
- Token expired or invalid
- Solution: Clear token and redirect to login
- Check token in localStorage/cookies

**403 Forbidden:**
- User doesn't have ADMIN role
- Solution: Verify user role is "ADMIN"

**500 Internal Server Error:**
- Backend issue
- Solution: Check backend logs, verify endpoint exists

## 📞 **Support**

For questions or clarifications:
- Review `ADMIN_PANEL.md` for endpoint details
- Check `DEVELOPER_HANDOFF_GUIDE.md` for requirements
- Test endpoints using Postman collection: `WorkLah_Login_Collection.postman_collection.json`

---

**File Location:** `/ADMIN_PANEL.md` (in the project root)

**Last Updated:** January 2025  
**Version:** 1.2.0 (Added QR Code Management endpoints)

