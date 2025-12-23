# Frontend Update Requirements

Based on backend changes to match `BACKEND_API_SPECIFICATION_FINAL.md`, here are the **required frontend updates**:

---

## 1. ⭐ Employer Creation - Credential Generation (CRITICAL)

### Request Update
When creating an employer, add the `generateCredentials` field:

```javascript
// FormData or JSON body
{
  // ... existing fields ...
  "generateCredentials": true  // NEW: Required boolean field
}
```

### Response Handling Update
The response now includes a `credentials` object:

```javascript
// Success Response (201)
{
  "success": true,
  "message": "Employer created successfully", // or "Employer created successfully, but email could not be sent"
  "employer": { /* employer object */ },
  "credentials": {  // NEW: Only present if generateCredentials was true
    "email": "contact@abc.com",
    "password": "SecureRandomPassword123!",
    "sentToEmail": true,
    "emailSent": true,
    "error": null  // Only present if email failed
  }
}
```

### Frontend Action Required
1. **Add checkbox/toggle** in employer creation form: "Generate Login Credentials"
2. **Display credentials** after successful creation:
   - Show email and password in a modal/dialog
   - Allow admin to copy credentials
   - Show warning if `emailSent: false` (email failed to send)
   - Display error message if `error` field is present

---

## 2. ⭐ Job Creation - `postedBy` Field (CRITICAL)

### Request Update
**MUST include `postedBy` field** when creating jobs:

```javascript
// POST /api/jobs/create
{
  // ... existing fields ...
  "postedBy": "admin",  // NEW: REQUIRED - "admin" or "employer"
  "employerId": null,   // OPTIONAL - Can be null for admin posts
  "employerName": "Admin/System",  // OPTIONAL - For admin posts
  "outletId": null,     // OPTIONAL - Can be null if outletAddress provided
  "outletAddress": "456 Orchard Rd"  // OPTIONAL - For manual entry
}
```

### Validation Rules
- **If admin is posting**: `postedBy: "admin"`, `employerId` can be `null`
- **If employer is posting**: `postedBy: "employer"`, `employerId` is auto-set from logged-in user
- **At least one required**: `outletId` OR `outletAddress`

### Frontend Action Required
1. **Determine `postedBy` value**:
   - If logged-in user role is `ADMIN` → `postedBy: "admin"`
   - If logged-in user role is `EMPLOYER` → `postedBy: "employer"`
2. **Update job creation form**:
   - For admin: Allow `employerId` to be null
   - For employer: Auto-set `employerId` from user's `employerId` (don't allow changing)
   - Show validation error if `postedBy: "employer"` but no `employerId`

---

## 3. Job Listing - New Response Fields

### Response Update
Jobs now include additional fields:

```javascript
{
  "success": true,
  "jobs": [
    {
      "jobId": "JOB-0001",
      // ... existing fields ...
      "postedBy": "admin",  // NEW: "admin" or "employer"
      "employerId": "EMP-0001",  // NEW: Can be null for admin posts
      "employerName": "ABC Pte Ltd",  // NEW
      "outletId": "outlet-1",  // NEW: Can be null
      "outletAddress": "456 Orchard Rd"  // NEW
    }
  ]
}
```

### Frontend Action Required
1. **Display `postedBy`** in job listings (optional badge/indicator)
2. **Handle null values** for `employerId` and `outletId` (admin posts)
3. **Use new fields** for filtering/display if needed

---

## 4. Employer Job Access (No Frontend Change Needed)

### Backend Behavior
- **Employers automatically see only their jobs** when calling `GET /api/jobs`
- No need to send `employerId` filter - backend auto-filters
- **Admins see all jobs** (unless filtered by query parameter)

### Frontend Action Required
- **No changes needed** - this is handled automatically by backend
- **Optional**: You can remove any `employerId` filter logic for employer users (backend handles it)

---

## 5. Withdrawal/Transaction Endpoints - Response Format

### Response Update
The response format has changed:

```javascript
// GET /api/withdrawals
{
  "success": true,
  "transactions": [  // Changed from "withdrawals"
    {
      "transactionId": "TXN-0001",
      "employee": {
        "id": "worker-001",
        "name": "John Doe",
        "nric": "S1234567A"
      },
      "transactionType": "Cash In",  // or "Cash Out"
      "date": "2025-05-15",
      "details": {
        "type": "Job ID",
        "jobId": "JOB-0001",
        "description": "Job ID: JOB-0001"
      },
      "amount": {
        "value": 150.00,
        "display": "+$150.00"  // or "-$150.00" for Cash Out
      },
      "cashOutMethod": null,  // Only for Cash Out
      "status": "Processed",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": { /* pagination object */ }
}
```

### Frontend Action Required
1. **Update response parsing**: Change from `response.withdrawals` to `response.transactions`
2. **Update field names**: Use new structure (`transactionId`, `employee`, `amount.display`, etc.)
3. **Handle `amount.display`**: Use the formatted string for display

---

## 6. Dashboard Endpoints - New Query Parameters

### Request Update
Dashboard endpoints now support filtering:

```javascript
// GET /api/dashboard/overview?startDate=2024-01-01&endDate=2024-12-31&employerId=EMP-0001
```

### Response Update
Dashboard response now includes:

```javascript
{
  "success": true,
  "totalJobs": 150,
  "activatedHeroes": 500,
  // ... existing fields ...
  "revenue": {  // NEW
    "total": 100000.00,
    "thisMonth": 25000.00,
    "lastMonth": 22000.00
  },
  "jobPostingChart": {  // NEW
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "data": [10, 15, 20, 18, 25, 30]
  },
  "revenueChart": {  // NEW
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "data": [5000, 6000, 7000, 6500, 8000, 9000]
  }
}
```

### Frontend Action Required
1. **Add date range filters** to dashboard UI
2. **Add employer filter** dropdown (for admin users)
3. **Display new chart data** (`jobPostingChart`, `revenueChart`)
4. **Display revenue stats** (`revenue.total`, `revenue.thisMonth`, `revenue.lastMonth`)

---

## 7. Job Filters - New Query Parameters

### Request Update
Job listing now supports additional filters:

```javascript
// GET /api/jobs?postedBy=admin&search=waiter&date=2025-05-15&location=Orchard&rateType=Weekend
```

### New Query Parameters
- `postedBy`: "admin" | "employer" - Filter by who posted
- `search`: string - Search in job title and description
- `date`: YYYY-MM-DD - Filter by specific job date
- `location`: string - Filter by location/outlet
- `rateType`: "Weekend" | "Weekday" | "Public Holiday"

### Frontend Action Required
1. **Add filter UI** for new parameters (optional, but recommended)
2. **Update API calls** to include new filters when user selects them

---

## 8. Authentication - EMPLOYER Role Support

### Backend Update
- User model now supports `role: "EMPLOYER"`
- Employers can login and access job endpoints

### Frontend Action Required
1. **Handle EMPLOYER role** in authentication logic
2. **Show employer-specific UI** when `user.role === "EMPLOYER"`
3. **Redirect employers** to appropriate dashboard/views
4. **Hide admin-only features** for employer users

---

## Summary of Critical Frontend Updates

### ⚠️ MUST UPDATE (Breaking Changes)
1. ✅ **Job Creation**: Add `postedBy` field (REQUIRED)
2. ✅ **Employer Creation**: Handle `credentials` in response
3. ✅ **Withdrawal Endpoints**: Update to use `transactions` array

### 📝 SHOULD UPDATE (New Features)
4. ✅ **Dashboard**: Add date range and employer filters
5. ✅ **Job Filters**: Add new filter options
6. ✅ **Display**: Show `postedBy` and new fields in job listings

### ℹ️ NO CHANGE NEEDED (Backend Handles)
7. ✅ **Employer Job Filtering**: Backend auto-filters - no frontend change needed

---

## Testing Checklist

- [ ] Create employer with `generateCredentials: true` - verify credentials displayed
- [ ] Create employer with `generateCredentials: false` - verify no credentials in response
- [ ] Create job as admin with `postedBy: "admin"` - verify works with null employerId
- [ ] Create job as employer with `postedBy: "employer"` - verify employerId auto-set
- [ ] Login as employer - verify only sees own jobs
- [ ] Dashboard with date filters - verify data updates
- [ ] Withdrawal endpoint - verify new response format works
- [ ] Job filters - verify new filters work correctly

---

**Last Updated:** December 2024  
**Backend Version:** 3.0.0

