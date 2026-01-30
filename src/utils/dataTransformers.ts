/**
 * Data Transformation Utilities
 * Clean, fast data transformation functions for API responses
 */

/**
 * Transform employer data from API to frontend format
 * Images come as complete URLs from backend (e.g., "https://worklah.onrender.com/uploads/profile/admin123.jpg")
 */
export const transformEmployer = (employer) => {
  const employerIdForAPI = employer.employerId || employer._id || employer.id;
  const mongoId = employer._id || employer.id;

  // Format employer ID for display (extract number from EMP-1234 format)
  const employerIdDisplay = employerIdForAPI
    ? employerIdForAPI.startsWith("EMP-")
      ? employerIdForAPI.split("-")[1] || employerIdForAPI.slice(-4)
      : employerIdForAPI.slice(-4)
    : "N/A";

  // Extract contact person info (support multiple formats)
  const mainContactPerson =
    employer.contactPersonName ||
    (Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
      ? employer.mainContactPersons[0].name
      : employer.mainContactPersonName || employer.mainContactPerson?.name) ||
    "N/A";

  const mainContactPersonPosition =
    employer.jobPosition ||
    (Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
      ? employer.mainContactPersons[0].position
      : employer.mainContactPersonPosition || employer.mainContactPerson?.position) ||
    "N/A";

  const mainContactNumber =
    employer.mainContactNumber ||
    (Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
      ? employer.mainContactPersons[0].number
      : employer.mainContactPersonNumber) ||
    "N/A";

  // Use image URL directly from API (already complete URL)
  const companyLogo = employer.companyLogo || null;

  return {
    employerId: employerIdDisplay,
    companyLogo: companyLogo,
    companyLegalName: employer.companyLegalName || employer.companyName || "N/A",
    mainContactPerson,
    mainContactPersonPosition,
    mainContactNumber,
    companyEmail: employer.emailAddress || employer.companyEmail || "N/A",
    outlets: Array.isArray(employer.outlets) ? employer.outlets.length : 0,
    serviceAgreement: employer.serviceAgreement || "N/A",
    industry: employer.industry || "",
    employerOriginalId: mongoId || "",
    employerIdForAPI: employerIdForAPI || mongoId || "",
  };
};

/**
 * Transform employer list from API response
 */
export const transformEmployerList = (response: any) => {
  if (!response?.employers || !Array.isArray(response.employers)) {
    return [];
  }
  return response.employers.map(transformEmployer);
};

/**
 * Build FormData for employer creation/update - SIMPLIFIED
 * Uses JSON for complex data, FormData only for files
 */
export const buildEmployerFormData = (formData: any, outlets: any[], industry: string, generateCredentials: boolean = false) => {
  const formDataToSend = new FormData();

  // Build clean data object
  const employerData: any = {
    companyLegalName: formData.companyLegalName,
    companyNumber: formData.companyNumber?.trim() || null, // Optional - null if empty
    hqAddress: formData.hqAddress,
    contactPersonName: formData.contactPersonName,
    jobPosition: formData.jobPosition || "",
    mainContactNumber: formData.mainContactNumber,
    alternateContactNumber: formData.alternateContactNumber || "",
    emailAddress: formData.emailAddress,
    accountManager: formData.accountManager || "",
    industry: industry,
    serviceAgreement: formData.serviceAgreement || "Active",
    contractExpiryDate: formData.contractExpiryDate || null,
    generateCredentials: generateCredentials,
    // Outlets: do not send barcode - backend auto-generates on creation (updatebarcodecreation.md)
    outlets: outlets.filter(outlet =>
      outlet.name?.trim() &&
      outlet.managerName?.trim() &&
      outlet.contactNumber?.trim() &&
      outlet.address?.trim()
    ).map(outlet => ({
      name: outlet.name,
      managerName: outlet.managerName,
      contactNumber: outlet.contactNumber,
      address: outlet.address,
      openingHours: outlet.openingHours || null,
      closingHours: outlet.closingHours || null,
      isActive: outlet.isActive !== undefined ? outlet.isActive : true
    }))
  };

  // Append files separately
  if (formData.companyLogo instanceof File) {
    formDataToSend.append('companyLogo', formData.companyLogo);
  }
  if (formData.acraBizfileCert instanceof File) {
    formDataToSend.append('acraBizfileCert', formData.acraBizfileCert);
  }
  if (formData.serviceContract instanceof File) {
    formDataToSend.append('serviceContract', formData.serviceContract);
  }

  // Append all other data as JSON string (backend will parse it)
  formDataToSend.append('data', JSON.stringify(employerData));

  return formDataToSend;
};

/**
 * Build job data object for API
 * Matches backend API specification from BUACKEND_IMPLEMENTATION_GUIDE.md
 */
export const buildJobData = (formData: any, shifts: any[], userRole: string, userId?: string) => {
  const isAdmin = userRole === "ADMIN";
  const isEmployer = userRole === "EMPLOYER";
  const finalEmployerId = isEmployer && userId ? userId : formData.employerId || null;
  const finalPostedBy = isAdmin ? "admin" : "employer";

  return {
    jobDate: formData.jobDate || "",
    jobTitle: formData.jobTitle || "",
    jobDescription: formData.jobDescription || "",
    employerId: finalEmployerId,
    employerName: formData.employerName || null,
    industry: formData.industry || null,
    postedBy: finalPostedBy,
    outletId: formData.useManualOutlet ? null : (formData.outletId || null),
    outletAddress: formData.useManualOutlet
      ? (formData.outletAddress || null)
      : null,
    locationDetails: formData.locationDetails || null,
    totalPositions: formData.totalPositions || 1,
    foodHygieneCertRequired: formData.foodHygieneCertRequired || false,
    jobStatus: formData.jobStatus || "Active",
    applicationDeadline: formData.applicationDeadline || null,
    dressCode: formData.dressCode || null,
    skills: Array.isArray(formData.skills) ? formData.skills : [],
    shifts: shifts.map((shift) => ({
      shiftDate: shift.shiftDate || formData.jobDate || "",
      startTime: shift.startTime || "",
      endTime: shift.endTime || "",
      breakDuration: shift.breakDuration || 0,
      totalWorkingHours: shift.totalWorkingHours || 0,
      rateType: shift.rateType || "Hourly",
      rates: shift.rates || shift.payPerHour || 0,
      totalWages: shift.totalWages || 0,
      vacancy: shift.vacancy || 1, // Required: minimum 1
      standbyVacancy: shift.standbyVacancy || 0, // Optional: default 0
    })),
  };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return true; // Optional field
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Build FormData for employer update - SIMPLIFIED
 */
export const buildEmployerUpdateFormData = (formData: any, outlets: any[], industry: string) => {
  const formDataToSend = new FormData();

  // Build clean data object
  const employerData: any = {
    companyLegalName: formData.companyLegalName,
    companyNumber: formData.companyNumber?.trim() || null, // Optional - null if empty
    hqAddress: formData.hqAddress,
    contactPersonName: formData.contactPersonName,
    jobPosition: formData.jobPosition || "",
    mainContactNumber: formData.mainContactNumber,
    alternateContactNumber: formData.alternateContactNumber || "",
    emailAddress: formData.emailAddress,
    accountManager: formData.accountManager || "",
    industry: industry,
    serviceAgreement: formData.serviceAgreement || "Active",
    contractExpiryDate: formData.contractExpiryDate || null,
    // Outlets: do not send barcode - backend auto-generates on creation (updatebarcodecreation.md)
    outlets: outlets.filter(outlet =>
      outlet.name?.trim() &&
      outlet.managerName?.trim() &&
      outlet.contactNumber?.trim() &&
      outlet.address?.trim()
    ).map(outlet => ({
      _id: outlet._id || null,
      name: outlet.name,
      managerName: outlet.managerName,
      contactNumber: outlet.contactNumber,
      address: outlet.address,
      openingHours: outlet.openingHours || null,
      closingHours: outlet.closingHours || null,
      isActive: outlet.isActive !== undefined ? outlet.isActive : true
    }))
  };

  // Append files separately
  if (formData.companyLogo instanceof File) {
    formDataToSend.append('companyLogo', formData.companyLogo);
  }
  if (formData.acraBizfileCert instanceof File) {
    formDataToSend.append('acraBizfileCert', formData.acraBizfileCert);
  }
  if (formData.serviceContract instanceof File) {
    formDataToSend.append('serviceContract', formData.serviceContract);
  }

  // Append all other data as JSON string
  formDataToSend.append('data', JSON.stringify(employerData));

  return formDataToSend;
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const validateDate = (date: string): boolean => {
  if (!date) return true; // Optional field
  const re = /^\d{4}-\d{2}-\d{2}$/;
  return re.test(date);
};

