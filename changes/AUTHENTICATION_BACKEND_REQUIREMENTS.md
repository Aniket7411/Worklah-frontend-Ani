# Authentication Backend Requirements

**Document Version:** 1.0.0  
**Last Updated:** January 2025  
**Purpose:** Backend requirements for proper authentication token handling

---

## Overview

The frontend expects the backend to handle authentication tokens properly to prevent automatic logout issues. This document outlines the requirements for the backend authentication system.

---

## Current Frontend Implementation

The frontend stores authentication tokens in **two places** for redundancy:
1. **localStorage** (primary storage)
2. **Cookies** (backup storage)

Both are synchronized to ensure persistence across browser sessions and page refreshes.

---

## Backend Requirements

### 1. Login Endpoint (`POST /user/login`)

**Required Response Format:**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Critical Requirements:**
- ✅ **MUST return `token` field** in the response body
- ✅ Token should be a valid JWT token
- ✅ Token should have expiration time (recommended: 7 days)
- ✅ Token should be included in the `Authorization: Bearer {token}` header format

**Optional (Recommended):**
- Backend can also set the token as an HTTP-only cookie for additional security
- If setting cookie, use `httpOnly: true` and `sameSite: 'lax'` or `'strict'`

**Example Backend Implementation (Node.js/Express):**

```javascript
app.post('/api/user/login', async (req, res) => {
  try {
    // Validate credentials
    const user = await User.findOne({ email: req.body.email });
    if (!user || !await bcrypt.compare(req.body.password, user.password)) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // OPTIONAL: Set token as HTTP-only cookie (recommended for security)
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // REQUIRED: Return token in response body
    res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      token: token // REQUIRED: Frontend needs this
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again."
    });
  }
});
```

---

### 2. Get Current User Endpoint (`GET /user/me`)

**Required Response Format:**

```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "ADMIN"
  }
}
```

**Token Validation:**
- Backend should accept token from either:
  - `Authorization: Bearer {token}` header (primary method)
  - `authToken` cookie (if backend sets cookies)

**Critical Requirements:**
- ✅ **MUST validate the token** before returning user data
- ✅ **MUST return `success: true`** for valid tokens
- ✅ **MUST return 401 Unauthorized** for invalid/expired tokens
- ✅ **MUST return user object** with required fields: `_id`, `email`, `fullName`, `role`

**Example Backend Implementation:**

```javascript
const authenticateToken = (req, res, next) => {
  // Try to get token from Authorization header first
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  // If not in header, try cookie
  const cookieToken = req.cookies?.authToken || token;

  if (!cookieToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided"
    });
  }

  jwt.verify(cookieToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or expired token"
      });
    }
    
    req.user = decoded;
    next();
  });
};

app.get('/api/user/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data"
    });
  }
});
```

---

### 3. Logout Endpoint (`POST /user/logout`)

**Required Response Format:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Critical Requirements:**
- ✅ **MUST clear the token cookie** (if using cookies)
- ✅ **MUST return success response** even if token is already invalid
- ✅ Backend can optionally invalidate token in database (recommended for security)

**Example Backend Implementation:**

```javascript
app.post('/api/user/logout', (req, res) => {
  // Clear cookie if using cookies
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  // OPTIONAL: Invalidate token in database (blacklist)
  // await TokenBlacklist.add(req.user.tokenId);

  res.json({
    success: true,
    message: "Logged out successfully"
  });
});
```

---

## Token Format Requirements

### JWT Token Structure

The JWT token should contain at minimum:
- `userId` or `_id`: User's unique identifier
- `email`: User's email address
- `role`: User's role (ADMIN, USER, EMPLOYER)

**Example JWT Payload:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "admin@example.com",
  "role": "ADMIN",
  "iat": 1704067200,
  "exp": 1704672000
}
```

### Token Expiration

- **Recommended expiration:** 7 days (604800 seconds)
- **Minimum expiration:** 1 day (for security)
- **Maximum expiration:** 30 days (for user convenience)

---

## Error Handling

### Invalid/Expired Token Response

When a token is invalid or expired, the backend MUST return:

**Status Code:** `401 Unauthorized`

**Response Body:**
```json
{
  "success": false,
  "message": "Unauthorized: Invalid or expired token"
}
```

### Missing Token Response

When no token is provided:

**Status Code:** `401 Unauthorized`

**Response Body:**
```json
{
  "success": false,
  "message": "Unauthorized: No token provided"
}
```

---

## Security Best Practices

### Recommended Implementation

1. **Use HTTP-only Cookies (Optional but Recommended):**
   - Set token as HTTP-only cookie to prevent XSS attacks
   - Frontend will still work with token in response body
   - Backend can read from cookie instead of header

2. **Token Refresh (Optional):**
   - Implement refresh token mechanism for better security
   - Short-lived access tokens (15-30 minutes)
   - Long-lived refresh tokens (7-30 days)

3. **Token Blacklisting (Optional):**
   - Store invalidated tokens in database
   - Check blacklist on each request
   - Useful for logout and password change scenarios

4. **HTTPS in Production:**
   - Always use HTTPS in production
   - Set `secure: true` flag for cookies in production

---

## Testing Checklist

Before marking authentication as complete, verify:

- [ ] Login returns `token` in response body
- [ ] Token is valid JWT format
- [ ] Token contains user information (userId, email, role)
- [ ] `/user/me` endpoint validates token correctly
- [ ] `/user/me` returns user data for valid token
- [ ] `/user/me` returns 401 for invalid token
- [ ] `/user/me` returns 401 for expired token
- [ ] `/user/me` returns 401 for missing token
- [ ] Logout endpoint clears cookies (if using cookies)
- [ ] All protected endpoints validate token
- [ ] Token expiration is set correctly (7 days recommended)
- [ ] Error responses include `success: false` and `message` fields

---

## Current Frontend Behavior

The frontend will:

1. **On Login:**
   - Store token in localStorage (primary)
   - Store token in cookies (backup)
   - Use token from localStorage for API requests
   - Fallback to cookies if localStorage is unavailable

2. **On Page Load:**
   - Check localStorage first for token
   - If not found, check cookies
   - If token found in cookies, sync to localStorage
   - Validate token with `/user/me` endpoint
   - Keep user logged in if token is valid

3. **On API Requests:**
   - Send token in `Authorization: Bearer {token}` header
   - Token retrieved from localStorage (or cookies as fallback)

4. **On Logout:**
   - Clear token from localStorage
   - Clear token from cookies
   - Call backend logout endpoint

5. **On 401 Error:**
   - Clear token from both storage locations
   - Redirect to login page
   - Show "Session expired" message

---

## Quick Fix Checklist

If users are experiencing automatic logout:

1. ✅ Verify login endpoint returns `token` field
2. ✅ Verify token is valid JWT format
3. ✅ Verify token expiration is set (recommended: 7 days)
4. ✅ Verify `/user/me` endpoint validates token correctly
5. ✅ Verify `/user/me` returns proper user object
6. ✅ Verify all protected endpoints accept `Authorization: Bearer {token}` header
7. ✅ Verify 401 errors are returned for invalid tokens
8. ✅ Check token expiration time (should not be too short)

---

## Contact & Support

If you have questions or need clarification:
- Review the frontend code: `src/context/AuthContext.tsx`
- Review API documentation: `BACKEND_API_DOCUMENTATIONn.md`
- Check axios configuration: `src/lib/authInstances.ts`

---

**END OF DOCUMENTATION**

