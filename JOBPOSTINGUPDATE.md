# Job Posting Update - Frontend Implementation

**Date:** January 2025  
**Status:** ✅ Completed  
**Component:** React.js Admin Panel  
**Files Updated:** `src/pages/jobManagemant/NewJob.tsx`

---

## 📋 **Overview**

This document specifies the complete requirements and implementation for the Job Posting section in the WorkLah Admin Panel. All fields are editable when creating/editing a job posting.

---

## 🎯 **Required Fields Structure**

### **1. Basic Job Information**

#### **Job Posting Date** ✅
- **Field Name:** `jobDate`
- **Type:** Date Input (Autofilled, Read-only)
- **Required:** Yes
- **Editable:** No (Auto-filled with current date)
- **Format:** YYYY-MM-DD
- **Default:** Today's date

#### **Job Title** ✅
- **Field Name:** `jobTitle`
- **Type:** Text Input
- **Required:** Yes
- **Editable:** Yes
- **Note:** This is the only title field. Job Roles field has been removed.

#### **Total Vacancies** ✅
- **Field Name:** `totalPositions`
- **Type:** Number Input
- **Required:** Yes
- **Editable:** Yes
- **Minimum:** 1
- **Validation:** Must be a positive integer

---

### **2. Employer & Location Information**

#### **Employer** ✅
- **Field Name:** `employerId`
- **Type:** Dropdown (Select)
- **Required:** Yes
- **Editable:** Yes
- **Behavior:**
  - Prefilled dropdown with all added employers
  - Auto-fills employer name and industry when selected
  - Fetches outlets for selected employer
  - Outlet options update based on selected employer

#### **Industry** ✅
- **Field Name:** `industry`
- **Type:** Text Input (Read-only)
- **Required:** Yes
- **Editable:** No (Auto-filled from selected employer)
- **Source:** Prefilled based on employer's industry

#### **Location** ✅
- **Field Name:** `locationDetails`
- **Type:** Text Input
- **Required:** Yes
- **Editable:** Yes
- **Behavior:**
  - Prefilled based on selected outlet's address
  - Can be manually edited if needed
  - Auto-updates when outlet is selected

#### **Outlet** ✅
- **Field Name:** `outletId` / `outletAddress`
- **Type:** Dropdown or Manual Input
- **Required:** Yes
- **Editable:** Yes
- **Behavior:**
  - Shows dropdown of outlets from selected employer
  - Can toggle to manual entry
  - Outlet options depend on selected employer

---

### **3. Job Details**

#### **Job Description** ✅
- **Field Name:** `jobDescription`
- **Type:** Textarea
- **Required:** Yes
- **Editable:** Yes
- **Placeholder:** "Enter detailed job description, responsibilities, requirements..."

#### **Job Status** ✅
- **Field Name:** `jobStatus`
- **Type:** Dropdown (Select)
- **Required:** Yes
- **Editable:** Yes
- **Options:**
  - Active
  - Filled
  - Cancelled
  - Expired
- **Default:** "Active"

#### **Application Deadline** ✅
- **Field Name:** `applicationDeadline`
- **Type:** DateTime Input
- **Required:** No (Optional)
- **Editable:** Yes
- **Format:** YYYY-MM-DDTHH:MM
- **Validation:** Must be on or after job posting date

#### **Dress Code** ✅
- **Field Name:** `dressCode`
- **Type:** Textarea
- **Required:** No (Optional)
- **Editable:** Yes
- **Placeholder:** "e.g., Uniform provided, Black pants and white shirt, Safety shoes required"

---

### **4. Skills** ✅

#### **Skills Array Format**
- **Field Name:** `skills`
- **Type:** Array of Strings (List)
- **Required:** No (Optional)
- **Editable:** Yes
- **Implementation:**
  - **NOT comma-separated** - Each skill is a separate item
  - Input field with "Add" button
  - Skills displayed as removable tags/chips
  - Press Enter or click "Add" to add skill
  - Click X on tag to remove skill
  - Stored as array: `["Skill1", "Skill2", "Skill3"]`

**UI Features:**
- Text input for entering new skill
- "Add" button to add skill to list
- Skills displayed as blue tags/chips
- Each tag has remove button (X)
- Visual list format (not comma-separated)

**Example:**
```
Input: "Customer Service"
Click Add → Tag appears: [Customer Service X]

Input: "Food Handling"
Click Add → Tag appears: [Customer Service X] [Food Handling X]
```

---

### **5. Food Hygiene Certificate** ✅

#### **Food Hygiene Cert Required**
- **Field Name:** `foodHygieneCertRequired`
- **Type:** Checkbox
- **Required:** No (Optional)
- **Editable:** Yes
- **Default:** `false`
- **Label:** "Food Hygiene Cert Required (Mandatory)"
- **Description:** "Workers must upload Food Hygiene Cert to apply for this job"

---

### **6. Shift Timings** (Multiple Days Supported) ✅

Each shift can be booked for different days. Multiple shifts can be added.

#### **Shift Date** ✅
- **Field Name:** `shifts[index].shiftDate`
- **Type:** Date Input
- **Required:** Yes
- **Editable:** Yes
- **Format:** YYYY-MM-DD
- **Default:** Job posting date (or next day if multiple shifts)
- **Validation:** Must be >= job posting date
- **Feature:** Can book shifts for multiple days

#### **Start Time** ✅
- **Field Name:** `shifts[index].startTime`
- **Type:** Time Input
- **Required:** Yes
- **Editable:** Yes
- **Format:** HH:MM (24-hour)
- **Default:** "09:00"

#### **End Time** ✅
- **Field Name:** `shifts[index].endTime`
- **Type:** Time Input
- **Required:** Yes
- **Editable:** Yes
- **Format:** HH:MM (24-hour)
- **Default:** "17:00"
- **Feature:** Supports overnight shifts (end time can be next day)

#### **Rate Type** ✅
- **Field Name:** `shifts[index].rateType`
- **Type:** Dropdown (Select)
- **Required:** Yes
- **Editable:** Yes
- **Options:**
  - **Hourly** - Rate per hour
  - **Weekly** - Rate per week
  - **Monthly** - Rate per month
- **Default:** "Hourly"

#### **Rates** ✅
- **Field Name:** `shifts[index].rates`
- **Type:** Number Input
- **Required:** Yes
- **Editable:** Yes
- **Label:** Dynamic based on rate type:
  - "Rate/Hr (SGD)" if Hourly
  - "Rate/Week (SGD)" if Weekly
  - "Rate/Month (SGD)" if Monthly
- **Format:** Decimal number (step: 0.01)
- **Minimum:** 0

#### **Auto-Calculated Fields:**
- **Total Working Hours:** Auto-calculated from start time, end time, and break duration
- **Total Wages:** Auto-calculated based on rate type:
  - **Hourly:** `rates × totalWorkingHours`
  - **Weekly:** `rates` (fixed)
  - **Monthly:** `rates` (fixed)

#### **Break Duration** ✅
- **Field Name:** `shifts[index].breakDuration`
- **Type:** Number Input (hours)
- **Required:** Yes
- **Editable:** Yes
- **Format:** Decimal (step: 0.25)
- **Default:** 0

---

## 🔧 **Technical Implementation**

### **Data Structure**

#### **FormData Interface:**
```typescript
interface FormData {
  jobDate: string; // Auto-filled, read-only
  jobTitle: string; // Required (only title field - jobRoles removed)
  totalPositions: number; // Required, min: 1
  employerId: string; // Required
  employerName: string; // Auto-filled
  industry: string; // Auto-filled from employer
  outletId: string; // Required (or outletAddress)
  outletAddress?: string; // If manual entry
  locationDetails: string; // Required, auto-filled from outlet
  jobDescription: string; // Required
  jobStatus: string; // Required, default: "Active"
  applicationDeadline?: string; // Optional
  dressCode?: string; // Optional
  skills: string[]; // Array format (not comma-separated)
  foodHygieneCertRequired: boolean; // Optional, default: false
}
```

#### **Shift Interface:**
```typescript
interface Shift {
  id: number;
  shiftDate: string; // Required, YYYY-MM-DD
  startTime: string; // Required, HH:MM
  endTime: string; // Required, HH:MM
  breakDuration: number; // Required, hours
  totalWorkingHours: number; // Auto-calculated
  rateType: "Hourly" | "Weekly" | "Monthly"; // Required
  rates: number; // Required, payment rate
  totalWages: number; // Auto-calculated
}
```

---

## 📝 **Form Validation**

### **Required Fields:**
1. ✅ Job Title
2. ✅ Total Vacancies (>= 1)
3. ✅ Employer Selection
4. ✅ Outlet Selection (or manual address)
5. ✅ Location Details
6. ✅ Job Description
7. ✅ Job Status
8. ✅ At least one shift with:
   - Shift Date
   - Start Time
   - End Time
   - Rate Type
   - Rates

### **Optional Fields:**
1. ✅ Application Deadline
2. ✅ Dress Code
3. ✅ Skills (array)
4. ✅ Food Hygiene Cert Required

### **Auto-Filled Fields (Read-only):**
1. ✅ Job Posting Date (today's date)
2. ✅ Industry (from employer)
3. ✅ Location (from outlet, can be edited)

---

## 🔄 **API Integration**

### **Create Job Endpoint:**
```
POST /api/admin/jobs
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobDate": "2025-01-20",
  "jobTitle": "Waiter",
  "totalPositions": 5,
  "employerId": "EMP-1234",
  "employerName": "ABC Restaurant",
  "industry": "Hospitality",
  "outletId": "OUT-5678",
  "locationDetails": "123 Orchard Road",
  "jobDescription": "Serve customers...",
  "jobStatus": "Active",
  "applicationDeadline": "2025-01-25T23:59:59",
  "dressCode": "Uniform provided",
  "skills": ["Customer Service", "Food Handling", "Team Work"],
  "foodHygieneCertRequired": true,
  "shifts": [
    {
      "shiftDate": "2025-01-21",
      "startTime": "09:00",
      "endTime": "17:00",
      "breakDuration": 1,
      "totalWorkingHours": 7,
      "rateType": "Hourly",
      "rates": 12.50,
      "totalWages": 87.50
    },
    {
      "shiftDate": "2025-01-22",
      "startTime": "10:00",
      "endTime": "18:00",
      "breakDuration": 1,
      "totalWorkingHours": 7,
      "rateType": "Hourly",
      "rates": 12.50,
      "totalWages": 87.50
    }
  ]
}
```

---

## 🎨 **UI/UX Features**

### **Skills Input:**
- Text input field with "Add" button
- Enter key to add skill
- Skills displayed as removable tags
- Each tag has X button to remove
- Visual list format (NOT comma-separated)

### **Shift Management:**
- "Add Shift" button to add multiple shifts
- Each shift can have different date
- Remove button for each shift (if more than one)
- Auto-calculation of working hours and wages
- Dynamic label for rates field based on rate type

### **Employer/Outlet Selection:**
- Employer dropdown prefilled with all employers
- Outlet dropdown updates based on selected employer
- Toggle between dropdown and manual entry
- Auto-fills industry and location when employer/outlet selected

### **Auto-Filled Fields:**
- Job posting date (today's date, read-only)
- Industry (from employer, read-only)
- Location (from outlet, editable)

---

## ✅ **Checklist**

### **Frontend Implementation:**
- [x] Job posting date (autofilled, read-only)
- [x] Job title input
- [x] Total vacancies number input
- [x] Employer dropdown (prefilled)
- [x] Industry (prefilled from employer)
- [x] Location (prefilled from outlet)
- [x] Outlet selection (based on employer)
- [x] Job description textarea
- [x] Job status dropdown
- [x] Application deadline (optional, datetime)
- [x] Dress code textarea
- [x] Skills array format (list, not comma-separated)
- [x] Food Hygiene checkbox
- [x] Shift date (for each shift)
- [x] Start time
- [x] End time
- [x] Rate type (Hourly, Weekly, Monthly)
- [x] Rates (dynamic label based on rate type)
- [x] Multiple shifts support (multiple days)
- [x] Auto-calculation of working hours
- [x] Auto-calculation of total wages

---

## 📱 **User Flow**

1. **Create Job Posting:**
   - Admin navigates to "Create Job"
   - Job posting date is auto-filled (today)
   - Admin enters job title
   - Admin selects total vacancies
   - Admin selects employer (industry auto-fills)
   - Admin selects outlet (location auto-fills)
   - Admin enters job description
   - Admin selects job status
   - Admin optionally sets application deadline
   - Admin optionally enters dress code
   - Admin adds skills (one by one, as tags)
   - Admin checks Food Hygiene requirement if needed
   - Admin adds shift(s):
     - Selects shift date
     - Sets start time and end time
     - Selects rate type (Hourly/Weekly/Monthly)
     - Enters rates
     - System auto-calculates hours and wages
   - Admin can add multiple shifts for different days
   - Admin submits form

2. **Skills Management:**
   - Type skill name in input field
   - Press Enter or click "Add"
   - Skill appears as removable tag
   - Click X on tag to remove
   - Skills stored as array: `["Skill1", "Skill2"]`

3. **Shift Management:**
   - Click "Add Shift" to add new shift
   - Each shift can have different date
   - Enter shift details
   - System calculates hours and wages automatically
   - Remove shift if needed (minimum 1 shift required)

---

## 🔍 **Testing Checklist**

- [ ] Job posting date auto-filled correctly
- [ ] Job title validation
- [ ] Total vacancies validation (min: 1)
- [ ] Employer selection and auto-fill industry
- [ ] Outlet selection based on employer
- [ ] Location auto-filled from outlet
- [ ] Job description validation
- [ ] Job status dropdown
- [ ] Application deadline optional and validation
- [ ] Dress code optional
- [ ] Skills array input (add/remove)
- [ ] Skills stored as array (not comma-separated)
- [ ] Food Hygiene checkbox
- [ ] Shift date selection
- [ ] Start time and end time input
- [ ] Rate type dropdown (Hourly/Weekly/Monthly)
- [ ] Rates input with dynamic label
- [ ] Auto-calculation of working hours
- [ ] Auto-calculation of total wages (based on rate type)
- [ ] Multiple shifts support
- [ ] Remove shift functionality
- [ ] Form submission with all fields
- [ ] Form submission with minimal required fields

---

## 📞 **Support**

For questions or issues:
- Review this document for field specifications
- Check API documentation for endpoint details
- Verify employer/outlet data structure

---

## 🔄 **Key Changes from Previous Version**

1. **Job Roles Removed:** Only "Job Title" field is used now. "Job Roles" field has been completely removed.
2. **Skills:** Changed from comma-separated string to array format (list)
3. **Shift Date:** Added date field for each shift (supports multiple days)
4. **Rate Types:** Changed from "Weekday/Weekend/Public Holiday" to "Hourly/Weekly/Monthly"
5. **Rates Field:** Changed from "payPerHour" to "rates" with dynamic label
6. **Job Date:** Made read-only (autofilled)
7. **Wages Calculation:** Updated to handle Hourly/Weekly/Monthly rates

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** ✅ **READY FOR TESTING**

