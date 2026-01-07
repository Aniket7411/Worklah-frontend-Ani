# Static Data Removal - Critical Fixes Required

**Priority: CRITICAL - Must be completed before production**

## Files with Static Data Found:

### ✅ FIXED
1. **src/components/employerDetail/AttendanceChart.tsx** - Fixed hardcoded chart data
2. **src/pages/employers/EmployerDetailPage.tsx** - Fixed hardcoded fallback values

### 🔴 CRITICAL - NEEDS FIXING

#### 1. src/pages/employers/OutletDetail.tsx
**Static Data Found:**
- Hardcoded outlet logo: `/assets/dominos-logo.png`
- Hardcoded address: "123 Orchard Road, Singapore"
- Hardcoded phone: "+65 1234 5678"
- Hardcoded email: "dominos@gmail.com"
- Hardcoded employer: "Right Service PTE. LTD"
- Hardcoded stats: 120, 2, 95%, 3%
- Hardcoded roles: "Cashier, Stock Handler, Cleaner"
- Hardcoded table rows: `[1, 2, 3, 4, 5].map()` with static job data
- Hardcoded operating hours: "9 AM - 9 PM"

**Required Action:**
- Fetch outlet data from API using `useParams()` to get outlet ID
- Use endpoint: `/outlets/:id` or `/employers/:employerId/outlets/:outletId`
- Display all data dynamically from API response
- Remove all hardcoded fallback values

#### 2. src/components/employerDetail/WorkHistory.tsx
**Status:** ✅ Already uses `workHistory` prop - static array is not used (can be removed for cleanup)

#### 3. src/pages/jobManagemant/modifyShifts/JobInfo.tsx
**Static Data Found:**
- Hardcoded company name: "RIGHT SERVICE PTE. LTD."
- Hardcoded outlet name: "Dominos"

**Required Action:**
- Get company/outlet data from job data or API
- Display dynamically

### ⚠️ MINOR - Default Values (OK for Forms)
These are acceptable as they're form defaults, not static display data:
- Default shift times: "09:00", "17:00" (in NewJob.tsx, ModifyJob.tsx)
- Default rate type: "Weekday" (in NewJob.tsx, ModifyJob.tsx)
- Default job status: "Active" (in NewJob.tsx)

## Testing Checklist After Fixes:

- [ ] OutletDetail page displays real outlet data
- [ ] All stats come from API
- [ ] Job table shows real jobs from API
- [ ] No hardcoded company names
- [ ] No hardcoded addresses
- [ ] No hardcoded contact info
- [ ] AttendanceChart fetches real data
- [ ] All components show empty state when no data
- [ ] All components show loading state while fetching

## Priority Order:
1. **OutletDetail.tsx** - Critical, completely static
2. **JobInfo.tsx** - Medium priority, has some static data
3. **Cleanup unused static arrays** - Low priority, but good practice

