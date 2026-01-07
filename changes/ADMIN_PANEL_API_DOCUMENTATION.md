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
- **Login:** `POST /api/admin/login` (email/password)
- **Logout:** `POST /api/admin/logout`
- **Get Current Admin:** `GET /api/admin/me`
- Admin token stored in cookie or Authorization header
- Token expires in 7 days (604800 seconds)

### 3. **Base Configuration**

**Base URL:**
```
Production: https://worklah.onrender.com/api
Development: http://localhost:3000/api
```

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

1. **Admin Authentication** (`POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me`)
2. **Dashboard & Analytics** (`GET /api/dashboard/overview`, `/revenue`, `/job-posts`, etc.)
3. **Job Management** (CRUD operations for jobs)
4. **Application Management** (View, update, approve/reject applications)
5. **User Management** (View users, verify candidates)
6. **Employer Management** (CRUD operations for employers)
7. **Outlet Management** (Manage outlets)
8. **Payment & Wallet Management** (View payments, process withdrawals)
9. **Notification Management** (Send notifications)
10. **Attendance Management** (View attendance records)
11. **Reports & Analytics** (Generate reports)
12. **Settings & Configuration** (Rate configuration, penalties, etc.)

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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Get Dashboard Overview
const getDashboardOverview = async () => {
  try {
    const response = await api.get('/dashboard/overview');
    if (response.success) {
      return response.data;
    }
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
    throw error;
  }
};
```

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

## 📞 **Support**

For questions or clarifications:
- Review `ADMIN_PANEL.md` for endpoint details
- Check `DEVELOPER_HANDOFF_GUIDE.md` for requirements
- Test endpoints using Postman collection: `WorkLah_Login_Collection.postman_collection.json`

---

**File Location:** `/ADMIN_PANEL.md` (in the project root)

**Last Updated:** January 2025

