# Employer Section Update - Frontend Implementation

**Date:** January 2025  
**Status:** ✅ Completed  
**Component:** React.js Admin Panel  
**Files Updated:** `src/pages/employers/AddEmployer.tsx`, `src/pages/employers/EditEmployer.tsx`

---

## 📋 **Overview**

This document specifies the complete requirements and implementation for the Employer section in the WorkLah Admin Panel. All fields are editable when adding/editing an employer.

---

## 🎯 **Required Fields Structure**

### **1. Basic Employer Information**

#### **Name of Employer** ✅
- **Field Name:** `companyLegalName`
- **Type:** Text Input
- **Required:** Yes
- **Editable:** Yes

#### **Industry Type** ✅
- **Field Name:** `industry` / `customIndustry`
- **Type:** Dropdown with Custom Input Option
- **Required:** Yes
- **Editable:** Yes
- **Options:**
  - Hospitality
  - IT
  - F&B (Food & Beverage)
  - Hotel
  - Retail
  - Logistics
  - Healthcare
  - Education
  - Construction
  - **Others (Add Custom)** - Shows text input when selected
- **Implementation:** When "Others" is selected, a text input appears for custom industry entry

#### **Employer Address** ✅
- **Field Name:** `hqAddress`
- **Type:** Textarea with Google Places Autocomplete
- **Required:** Yes
- **Editable:** Yes
- **Google API Integration:** Yes
- **Location Restriction:** Singapore addresses only
- **Address Format (Singapore):**
  ```
  Blk 123
  Ang Mo Kio Avenue 3
  #05-67
  Singapore 560123
  ```
- **Features:**
  - Autocomplete dropdown with suggestions
  - Real-time address validation
  - Geocoding support (lat/lng stored if needed)

---

### **2. Contact Information of Employer**

#### **Employer Position** ✅
- **Field Name:** `employerPosition`
- **Type:** Text Input
- **Required:** Yes
- **Editable:** Yes

#### **Contact Number** ✅
- **Field Name:** `mainContactNumber`
- **Type:** Tel Input
- **Required:** Yes
- **Editable:** Yes

#### **Alternate Contact Number** ✅
- **Field Name:** `alternateContactNumber`
- **Type:** Tel Input
- **Required:** No (Optional)
- **Editable:** Yes
- **Note:** Changed from required to optional

#### **Position in Company** ✅
- **Field Name:** `jobPosition`
- **Type:** Text Input
- **Required:** No (Optional)
- **Editable:** Yes

#### **Email Address** ✅
- **Field Name:** `emailAddress`
- **Type:** Email Input
- **Required:** Yes
- **Editable:** Yes
- **Validation:** Email format validation

---

### **3. Outlet Details** (Multiple Outlets Allowed)

Each outlet can have the following fields:

#### **Outlet Name** ✅
- **Field Name:** `outlets[index].name`
- **Type:** Text Input
- **Required:** Yes
- **Editable:** Yes

#### **Outlet Contact Number** ✅
- **Field Name:** `outlets[index].contactNumber`
- **Type:** Tel Input
- **Required:** No (Optional)
- **Editable:** Yes
- **Note:** NEW FIELD - Added to outlet details

#### **Outlet Address** ✅
- **Field Name:** `outlets[index].address`
- **Type:** Textarea with Google Places Autocomplete
- **Required:** Yes
- **Editable:** Yes
- **Google API Integration:** Yes
- **Location Restriction:** Singapore addresses only
- **Address Format:** Same as employer address format

#### **Manager Name** ✅
- **Field Name:** `outlets[index].managerName`
- **Type:** Text Input
- **Required:** No (Optional)
- **Editable:** Yes

#### **Alternate Contact Number (Manager)** ✅
- **Field Name:** `outlets[index].managerContact`
- **Type:** Tel Input
- **Required:** No (Optional)
- **Editable:** Yes
- **Note:** This is the manager's alternate contact number

---

## 🔧 **Technical Implementation**

### **Dependencies Added**

```json
{
  "@react-google-maps/api": "^2.19.3",
  "use-places-autocomplete": "^4.0.0"
}
```

### **Google Maps API Setup**

1. **Environment Variable Required:**
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

2. **API Configuration:**
   - Libraries loaded: `places`
   - Country restriction: `sg` (Singapore only)
   - Debounce: 300ms

3. **Features:**
   - Autocomplete suggestions
   - Address validation
   - Geocoding (lat/lng extraction)

### **Data Structure**

#### **FormData Interface:**
```typescript
interface FormData {
  employerId: string; // Auto-generated
  companyLegalName: string; // Required
  hqAddress: string; // Required
  employerPosition: string; // Required
  jobPosition: string; // Optional
  mainContactNumber: string; // Required
  alternateContactNumber: string; // Optional
  emailAddress: string; // Required
  industry: string; // Required (or customIndustry)
  customIndustry: string; // Required if industry is "Others"
  // ... other fields
}
```

#### **Outlet Interface:**
```typescript
interface Outlet {
  name: string; // Required
  address: string; // Required
  contactNumber?: string; // Optional - NEW
  managerName?: string; // Optional
  managerContact?: string; // Optional
}
```

---

## 📝 **Form Validation**

### **Required Fields:**
1. ✅ Name of Employer
2. ✅ Industry Type (or custom industry)
3. ✅ Employer Address
4. ✅ Employer Position
5. ✅ Contact Number
6. ✅ Email Address
7. ✅ At least one outlet with name and address

### **Optional Fields:**
1. ✅ Alternate Contact Number
2. ✅ Position in Company
3. ✅ Office Number
4. ✅ Outlet Contact Number
5. ✅ Manager Name
6. ✅ Manager Alternate Contact Number

### **Validation Rules:**
- Email format validation
- Singapore address format suggestion
- At least one outlet required
- Industry must be selected or custom entered

---

## 🔄 **API Integration**

### **Create Employer Endpoint:**
```
POST /api/admin/employers
Content-Type: multipart/form-data
```

**FormData Fields:**
```
companyLegalName: string
hqAddress: string
employerPosition: string
jobPosition?: string
mainContactNumber: string
alternateContactNumber?: string
emailAddress: string
industry: string (or customIndustry)

outlets[0][name]: string
outlets[0][address]: string
outlets[0][contactNumber]?: string
outlets[0][managerName]?: string
outlets[0][managerContact]?: string
...
```

### **Update Employer Endpoint:**
```
PUT /api/admin/employers/:employerId
Content-Type: multipart/form-data
```
(Same fields as create)

---

## 🎨 **UI/UX Features**

### **Industry Type:**
- Dropdown with predefined options
- "Others (Add Custom)" option shows text input
- Back button to return to dropdown

### **Address Fields:**
- Autocomplete dropdown appears as user types
- Shows Singapore addresses only
- Format hint displayed below input
- Supports multi-line address format

### **Outlet Management:**
- "Add Outlet" button to add multiple outlets
- Remove button for each outlet (if more than one)
- Each outlet form is clearly separated
- All outlet fields are editable

---

## ✅ **Checklist**

### **Frontend Implementation:**
- [x] Name of Employer field
- [x] Industry type dropdown with custom option
- [x] Employer address with Google Places API
- [x] Employer position field
- [x] Contact number field
- [x] Alternate contact number (optional)
- [x] Position in company field
- [x] Email address field
- [x] Outlet name field
- [x] Outlet contact number field (NEW)
- [x] Outlet address with Google Places API
- [x] Manager name field
- [x] Manager alternate contact number field
- [x] Multiple outlets support
- [x] Form validation
- [x] All fields editable

### **Google Maps Integration:**
- [x] Google Places API loaded
- [x] Autocomplete for employer address
- [x] Autocomplete for outlet addresses
- [x] Singapore location restriction
- [x] Address format validation

---

## 🚀 **Deployment Requirements**

### **Environment Variables:**
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### **Google Maps API Setup:**
1. Create Google Cloud Project
2. Enable Places API
3. Create API Key
4. Restrict API Key to:
   - HTTP referrers (your domain)
   - Places API only

---

## 📱 **User Flow**

1. **Add Employer:**
   - Admin clicks "Add Employer"
   - Fills in required fields
   - Selects industry or enters custom
   - Types address (autocomplete appears)
   - Adds contact information
   - Adds outlet(s) with details
   - Submits form

2. **Edit Employer:**
   - Admin clicks "Edit" on existing employer
   - All fields are pre-populated
   - Can modify any field
   - Can add/remove outlets
   - Saves changes

---

## 🔍 **Testing Checklist**

- [ ] Name of employer validation
- [ ] Industry dropdown and custom input
- [ ] Google Places autocomplete for employer address
- [ ] Employer position required validation
- [ ] Contact number required validation
- [ ] Alternate contact number optional
- [ ] Email format validation
- [ ] Outlet name required
- [ ] Outlet contact number optional
- [ ] Google Places autocomplete for outlet addresses
- [ ] Multiple outlets add/remove
- [ ] Form submission with all fields
- [ ] Form submission with minimal required fields
- [ ] Edit employer with existing data

---

## 📞 **Support**

For questions or issues:
- Review this document for field specifications
- Check Google Maps API documentation for address autocomplete
- Verify environment variables are set correctly

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** ✅ **READY FOR TESTING**

