# Backend Update - Employer Contact Information Simplification

**Date:** January 2025  
**Priority:** Minor Update  
**Affected Endpoints:** Employer creation and update endpoints

---

## 📋 **Summary**

The employer contact information form has been simplified. The frontend now sends a simplified contact structure instead of the previous complex nested structure.

---

## 🔄 **Changes Required**

### **1. Employer Creation/Update Endpoints**

**Affected Endpoints:**
- `POST /api/admin/employers` - Create employer
- `PUT /api/admin/employers/:employerId` - Update employer

### **2. Removed Fields**

The following fields should be **removed** or **ignored** from the request:

1. ❌ `employerPosition` - Removed (was required, now removed)
2. ❌ `officeNumber` - Removed (was optional)
3. ❌ `contactPersons[]` - Removed (array of contact persons with name, position, number)
   - Previously: `contactPersons[0][name]`, `contactPersons[0][position]`, `contactPersons[0][number]`

### **3. New/Updated Fields**

The following fields are now used:

1. ✅ `contactPersonName` - **NEW** (required)
   - Single name field for the main contact person
   - Previously: Multiple contact persons in array

2. ✅ `jobPosition` - **KEEP** (optional)
   - Position in company
   - Field name remains the same

3. ✅ `mainContactNumber` - **KEEP** (required)
   - Main contact number
   - Field name remains the same

4. ✅ `alternateContactNumber` - **KEEP** (optional)
   - Alternate contact number
   - Field name remains the same

5. ✅ `emailAddress` - **KEEP** (required)
   - Email address
   - Field name remains the same

---

## 📝 **Request Body Format**

### **Before (Old Format):**
```json
{
  "companyLegalName": "ABC Company",
  "employerPosition": "Manager",  // ❌ REMOVED
  "jobPosition": "HR Manager",
  "mainContactNumber": "1234567890",
  "alternateContactNumber": "0987654321",
  "emailAddress": "contact@abc.com",
  "officeNumber": "12345",  // ❌ REMOVED
  "contactPersons": [  // ❌ REMOVED
    {
      "name": "John Doe",
      "position": "CEO",
      "number": "7275061192"
    }
  ]
}
```

### **After (New Format):**
```json
{
  "companyLegalName": "ABC Company",
  "contactPersonName": "John Doe",  // ✅ NEW - Single name field
  "jobPosition": "HR Manager",  // ✅ KEEP (optional)
  "mainContactNumber": "1234567890",  // ✅ KEEP (required)
  "alternateContactNumber": "0987654321",  // ✅ KEEP (optional)
  "emailAddress": "contact@abc.com"  // ✅ KEEP (required)
}
```

---

## 🔧 **Implementation Notes**

### **1. Validation Updates**

**Required Fields:**
- ✅ `contactPersonName` - **NEW REQUIRED FIELD**
- ✅ `mainContactNumber` - Required (unchanged)
- ✅ `emailAddress` - Required (unchanged)

**Optional Fields:**
- ✅ `jobPosition` - Optional (unchanged)
- ✅ `alternateContactNumber` - Optional (unchanged)

**Removed Validations:**
- ❌ `employerPosition` - No longer required
- ❌ `officeNumber` - No longer accepted
- ❌ `contactPersons[]` - No longer accepted

### **2. Database Schema Updates**

**Option 1: Keep backward compatibility (Recommended)**
- Keep existing fields in database
- Map `contactPersonName` to existing field (e.g., `mainContactPersonName`)
- Ignore `employerPosition` and `officeNumber` if sent
- Ignore `contactPersons[]` array if sent

**Option 2: Update schema (Breaking change)**
- Add `contactPersonName` field
- Remove `employerPosition` field (or mark as deprecated)
- Remove `officeNumber` field (or mark as deprecated)
- Remove `contactPersons[]` array field (or mark as deprecated)

### **3. Response Format**

The response should return the simplified structure:

```json
{
  "success": true,
  "employer": {
    "_id": "...",
    "employerId": "EMP-1234",
    "companyLegalName": "ABC Company",
    "contactPersonName": "John Doe",  // ✅ NEW
    "jobPosition": "HR Manager",  // ✅ KEEP
    "mainContactNumber": "1234567890",  // ✅ KEEP
    "alternateContactNumber": "0987654321",  // ✅ KEEP
    "emailAddress": "contact@abc.com"  // ✅ KEEP
  }
}
```

---

## ✅ **Migration Checklist**

- [ ] Update `POST /api/admin/employers` endpoint
  - [ ] Accept `contactPersonName` as required field
  - [ ] Remove validation for `employerPosition`
  - [ ] Remove handling of `officeNumber`
  - [ ] Remove handling of `contactPersons[]` array
  - [ ] Update validation to require `contactPersonName`

- [ ] Update `PUT /api/admin/employers/:employerId` endpoint
  - [ ] Accept `contactPersonName` for updates
  - [ ] Remove validation for `employerPosition`
  - [ ] Remove handling of `officeNumber`
  - [ ] Remove handling of `contactPersons[]` array

- [ ] Update database schema (if needed)
  - [ ] Add `contactPersonName` field
  - [ ] Mark `employerPosition` as deprecated (optional)
  - [ ] Mark `officeNumber` as deprecated (optional)
  - [ ] Mark `contactPersons[]` as deprecated (optional)

- [ ] Update response format
  - [ ] Return `contactPersonName` in responses
  - [ ] Remove `employerPosition` from responses (or mark deprecated)
  - [ ] Remove `officeNumber` from responses (or mark deprecated)
  - [ ] Remove `contactPersons[]` from responses (or mark deprecated)

- [ ] Test endpoints
  - [ ] Test creating employer with new format
  - [ ] Test updating employer with new format
  - [ ] Verify backward compatibility (if keeping old fields)

---

## 🔄 **Backward Compatibility**

**Recommended Approach:**
- Accept both old and new formats during transition period
- Prefer new format (`contactPersonName`) if provided
- Fallback to old format (`contactPersons[0].name`) if new format not provided
- Log deprecation warnings for old format usage

**Example:**
```javascript
// Pseudo-code
const contactPersonName = 
  req.body.contactPersonName ||  // New format
  req.body.contactPersons?.[0]?.name ||  // Old format fallback
  null;

if (!contactPersonName) {
  return res.status(400).json({
    success: false,
    message: "Contact person name is required"
  });
}
```

---

## 📞 **Questions or Issues?**

If you have any questions or need clarification:
1. Check the frontend code in `src/pages/employers/AddEmployer.tsx`
2. Review the form submission logic around line 298-330
3. Contact the frontend team for any discrepancies

---

**Last Updated:** January 2025  
**Version:** 1.0.0

