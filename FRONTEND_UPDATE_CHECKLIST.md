# Frontend Update Checklist - Backend API Changes

**Date:** January 2025  
**Purpose:** Verify frontend compatibility with updated backend API

---

## ✅ Critical Updates Required

### 1. **Cookie Name Change** ⚠️ IMPORTANT
- **Backend Change:** Cookie name changed from `token` to `authToken`
- **Frontend Action Required:** 
  - Update cookie reading logic to use `authToken` instead of `token`
  - Update cookie setting logic after login
  - Verify axios interceptors use correct cookie name
- **Location to Check:**
  - Authentication service/utility
  - Axios configuration/interceptors
  - Login/logout functions

---

## ✅ Response Format Changes

### 2. **All Error Responses Now Include `success: false`**
- **Backend Change:** All error responses now follow this format:
  ```json
  {
    "success": false,
    "message": "Error message",
    "error": "ErrorType"
  }
  ```
- **Frontend Action Required:**
  - Verify error handling checks for `success: false` (should already be in place)
  - Ensure error toast notifications use `message` field
  - Update any error handling that relied on old format

### 3. **Login Response Format**
- **Backend Change:** User object now uses `_id` instead of `id`
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "...",
    "user": {
      "_id": "...",  // ✅ Changed from "id"
      "email": "...",
      "fullName": "...",
      "role": "ADMIN"
    }
  }
  ```
- **Frontend Action Required:**
  - Update code that accesses `user.id` to use `user._id`
  - Or add fallback: `const userId = user._id || user.id`

### 4. **Get Current User (`/user/me`) Response**
- **Backend Change:** Response format updated
- **Response Format:**
  ```json
  {
    "success": true,
    "user": {
      "_id": "...",
      "email": "...",
      "fullName": "...",
      "role": "ADMIN"
    }
  }
  ```
- **Frontend Action Required:**
  - Verify user object structure matches
  - Update any code using `user.id` to `user._id`

---

## ✅ New Endpoints Available

### 5. **Configuration Endpoints**
- **New Endpoints:**
  - `GET /admin/schools` - Get list of schools
  - `GET /admin/postal-code/:postalCode` - Get address from postal code
- **Frontend Action:** Optional - Can use these if needed

### 6. **Support Feedback Endpoint**
- **Endpoint:** `POST /support/feedback`
- **Request Body:**
  ```json
  {
    "subject": "Issue Subject",
    "message": "Issue description",
    "email": "user@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Feedback submitted successfully"
  }
  ```
- **Frontend Action:** Verify request format matches (only `subject`, `message`, `email` required)

---

## ✅ Dashboard Endpoints

### 7. **Dashboard Revenue Chart**
- **Endpoint:** `GET /dashboard/revenue`
- **Response Format:**
  ```json
  {
    "success": true,
    "revenueChart": {
      "labels": ["Jan", "Feb", "Mar", ...],
      "data": [10000, 15000, ...]
    },
    "totalRevenue": 100000
  }
  ```
- **Frontend Action:** Verify chart uses `revenueChart.labels` and `revenueChart.data`

### 8. **Dashboard Job Posts Chart**
- **Endpoint:** `GET /dashboard/job-posts`
- **Response Format:**
  ```json
  {
    "success": true,
    "jobPostsChart": {
      "labels": ["Jan", "Feb", "Mar"],
      "data": [50, 75, 60]
    }
  }
  ```
- **Frontend Action:** Verify chart uses `jobPostsChart.labels` and `jobPostsChart.data`

---

## ✅ Candidate Endpoints

### 9. **Get Candidates List**
- **Endpoint:** `GET /admin/candidates`
- **Query Parameters:**
  - `limit` (optional): Number of results
  - `sort` (optional): Sort order (e.g., "-createdAt" for newest first)
  - `search` (optional): Search in name, email, mobile
  - `status` (optional): Filter by status
- **Response Format:**
  ```json
  {
    "success": true,
    "candidates": [
      {
        "_id": "...",
        "id": "...",  // Alias for _id
        "fullName": "...",
        "mobile": "...",
        "email": "...",
        // ... other fields
      }
    ]
  }
  ```
- **Frontend Action:** 
  - Verify `sort` parameter works (e.g., `sort=-createdAt`)
  - Verify response structure matches

---

## ✅ Withdrawal Endpoints

### 10. **Create Withdrawal**
- **Endpoint:** `POST /withdrawals/create` (changed from `POST /withdrawals`)
- **Request Body:**
  ```json
  {
    "employeeId": "...",
    "amount": 500.00,
    "cashOutMethod": "PayNow"
  }
  ```
- **Frontend Action:** Update endpoint URL if using old route

---

## ✅ Error Handling Improvements

### 11. **Better Error Messages**
- **Backend Change:** More specific error messages for:
  - Invalid ID format (CastError)
  - Validation errors
  - Not found errors
- **Frontend Action:** 
  - Verify error messages are displayed correctly
  - Check that user-friendly messages are shown

### 12. **Global Error Handler**
- **Backend Change:** Added global error handler for unhandled errors
- **Frontend Action:** 
  - All errors should now have proper format
  - Verify error handling works correctly

---

## ✅ Employer ID Format Support

### 13. **Employer ID Format**
- **Backend Change:** Now supports both formats:
  - MongoDB ObjectId: `507f1f77bcf86cd799439011`
  - Employer ID: `EMP-e3d7`, `EMP-0001`, etc.
- **Frontend Action:** 
  - No changes needed - backend handles both formats
  - Frontend can send either format

---

## ⚠️ Breaking Changes Summary

1. **Cookie Name:** `token` → `authToken` ⚠️ **REQUIRES FRONTEND UPDATE**
2. **User ID Field:** `user.id` → `user._id` ⚠️ **REQUIRES FRONTEND UPDATE**
3. **Withdrawal Endpoint:** `/withdrawals` → `/withdrawals/create` (if using POST)

---

## ✅ Testing Checklist

### Authentication
- [ ] Login stores token in `authToken` cookie
- [ ] Logout clears `authToken` cookie
- [ ] `/user/me` returns user with `_id` field
- [ ] Error responses have `success: false`

### Dashboard
- [ ] Revenue chart displays correctly
- [ ] Job posts chart displays correctly
- [ ] Overview metrics load correctly

### Candidates
- [ ] Candidate list loads with sorting
- [ ] Search functionality works
- [ ] Response structure matches

### Error Handling
- [ ] All errors show proper messages
- [ ] Error format is consistent
- [ ] Network errors handled gracefully

### Withdrawals
- [ ] Create withdrawal uses correct endpoint
- [ ] Request format matches spec

---

## 📝 Notes

- All endpoints now return `success: true/false` field
- All error responses follow consistent format
- Cookie name change is the most critical update
- User ID field change affects user object access throughout the app

---

## 🔍 Files to Check in Frontend

1. **Authentication Service:**
   - Cookie handling
   - Token storage/retrieval
   - User object access

2. **Axios Configuration:**
   - Interceptors
   - Error handling
   - Cookie settings

3. **API Service Files:**
   - Dashboard API calls
   - Candidate API calls
   - Withdrawal API calls
   - Support feedback API calls

4. **Components Using User Data:**
   - Any component accessing `user.id`
   - User profile components
   - Navigation/header components

---

**END OF CHECKLIST**

