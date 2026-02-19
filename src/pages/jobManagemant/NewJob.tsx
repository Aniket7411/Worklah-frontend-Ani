import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Plus,
  Trash2,
  Save,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { buildJobData } from "../../utils/dataTransformers";

interface Employer {
  id: string;
  name: string;
  companyLegalName?: string;
  companyLogo?: string;
  outlets?: Array<{ id: string; address: string; name?: string }>;
}

interface Shift {
  id: number;
  shiftDate: string; // Shift date for this specific shift
  startTime: string;
  endTime: string;
  breakDuration: number;
  totalWorkingHours: number;
  rateType: "Hourly" | "Weekly" | "Monthly"; // Updated rate types
  rates: number; // Pay rate (can be hourly, weekly, or monthly)
  totalWages: number;
  vacancy: number; // Required: minimum 1 (matches backend spec)
  standbyVacancy: number; // Optional: default 0 (matches backend spec)
}

/** Format date in local timezone (YYYY-MM-DD) - avoids UTC shifting to past date */
function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
/** Get today's date in local timezone */
function getLocalDateString(): string {
  return formatLocalDate(new Date());
}

// Normalize and deduplicate outlets from API (may use _id or id; avoid showing duplicate entries)
function normalizeOutlets(raw: any[]): Array<{ id: string; address: string; name?: string }> {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const seen = new Set<string>();
  return raw
    .map((o: any) => ({
      id: o._id || o.id || "",
      address: o.address || o.outletAddress || o.location || "",
      name: o.name || o.outletName || "",
    }))
    .filter((o) => o.id && !seen.has(o.id) && seen.add(o.id));
}

const NewJob: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [selectedEmployer, setSelectedEmployer] = useState<string>("");
  const [availableOutlets, setAvailableOutlets] = useState<Array<{ id: string; address: string; name?: string }>>([]);
  const IMAGE_BASE_URL = "https://worklah.onrender.com";

  // Get employerId from navigation state if available
  const employerIdFromState = (location.state as any)?.employerId;

  const [formData, setFormData] = useState({
    jobDate: getLocalDateString(),
    jobTitle: "",
    jobDescription: "",
    employerId: "",
    employerName: "", // Auto-filled from employer
    industry: "", // Auto-filled from employer
    outletId: "",
    outletAddress: "", // Auto-filled from outlet
    useManualOutlet: false, // Toggle between dropdown and manual entry
    foodHygieneCertRequired: false,
    jobStatus: "Active",
    applicationDeadline: "",
    dressCode: "", // Replaces jobRequirements
    skills: [] as string[], // Array format - list of skills
    locationDetails: "",
  });

  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: Date.now(),
      shiftDate: getLocalDateString(),
      startTime: "09:00",
      endTime: "17:00",
      breakDuration: 0,
      totalWorkingHours: 8,
      rateType: "Hourly",
      rates: 0,
      totalWages: 0,
      vacancy: 1, // Required: minimum 1 (matches backend spec)
      standbyVacancy: 0, // Optional: default 0 (matches backend spec)
    },
  ]);

  const [skillInput, setSkillInput] = useState<string>(""); // Temporary input for adding skills

  const [rateTypes, setRateTypes] = useState<string[]>([]);
  const [defaultPayRates, setDefaultPayRates] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== "ADMIN") {
      toast.error("Only admins can post jobs");
      navigate("/jobs/job-management");
      return;
    }
    fetchEmployers();
    fetchRateConfiguration();
  }, [user, navigate]);

  // Pre-select employer if passed from navigation state
  useEffect(() => {
    if (employerIdFromState && employers.length > 0) {
      // Find employer by ID (could be EMP-xxxx format or MongoDB _id)
      const employer = employers.find(
        (e) => e.id === employerIdFromState ||
          (e as any)._id === employerIdFromState ||
          (e as any).employerId === employerIdFromState
      );
      if (employer) {
        setSelectedEmployer(employer.id);
      }
    }
  }, [employerIdFromState, employers]);

  useEffect(() => {
    if (selectedEmployer) {
      const employer = employers.find((e) => e.id === selectedEmployer);
      if (employer) {
        // Auto-fill employer details
        const employerName = (employer as any)?.name ?? (employer as any)?.companyLegalName ?? "";
        const industry = (employer as any)?.industry ?? "";

        setFormData((prev) => ({
          ...prev,
          employerId: selectedEmployer,
          employerName: employerName,
          industry: industry,
        }));

        // Fetch outlets for this employer (normalize and dedupe so 2 outlets don't show as 3)
        if (employer?.outlets && employer.outlets.length > 0) {
          setAvailableOutlets(normalizeOutlets(employer.outlets));
          setFormData((prev) => ({ ...prev, useManualOutlet: false }));
        } else {
          fetchEmployerOutlets(selectedEmployer);
        }
      }
    } else {
      setAvailableOutlets([]);
      setFormData((prev) => ({ ...prev, outletId: "", useManualOutlet: true }));
    }
  }, [selectedEmployer, employers]);

  const fetchEmployers = async () => {
    try {
      const response = await axiosInstance.get("/admin/employers?limit=100");
      if (response.data?.employers) {
        // Map employers to use employerId (EMP-xxxx) format when available, fallback to _id
        const mappedEmployers = response.data.employers.map((emp: any) => ({
          ...emp,
          id: emp.employerId || emp._id || emp.id, // Prefer EMP-xxxx format for API calls
        }));
        setEmployers(mappedEmployers);
      }
    } catch (error) {
      console.error("Error fetching employers:", error);
    }
  };

  const fetchEmployerOutlets = async (employerId: string) => {
    try {
      // API accepts both MongoDB ObjectId and EMP-xxxx format
      const response = await axiosInstance.get(`/admin/employers/${employerId}`);
      if (response.data?.employer?.outlets && response.data.employer.outlets.length > 0) {
        setAvailableOutlets(normalizeOutlets(response.data.employer.outlets));
        setFormData((prev) => ({ ...prev, useManualOutlet: false }));
      } else {
        // No outlets available, allow manual entry
        setAvailableOutlets([]);
        setFormData((prev) => ({ ...prev, useManualOutlet: true }));
      }
    } catch (error) {
      console.error("Error fetching outlets:", error);
      // On error, allow manual entry
      setAvailableOutlets([]);
      setFormData((prev) => ({ ...prev, useManualOutlet: true }));
    }
  };

  const fetchRateConfiguration = async () => {
    try {
      const response = await axiosInstance.get("/admin/rate-configuration");
      if (response.data?.rateTypes) {
        setRateTypes(response.data.rateTypes);
      }
      if (response.data?.defaultPayRates) {
        setDefaultPayRates(response.data.defaultPayRates);
        // Update default shift with first rate type and its default pay rate
        if (response.data.rateTypes && response.data.rateTypes.length > 0) {
          // Set default shift with today's date
          setShifts([{
            id: Date.now(),
            shiftDate: getLocalDateString(),
            startTime: "09:00",
            endTime: "17:00",
            breakDuration: 0,
            totalWorkingHours: 8,
            rateType: "Hourly",
            rates: 0,
            totalWages: 0,
          }]);
        }
      }
    } catch (error) {
      console.error("Error fetching rate configuration:", error);
      // Fallback to empty if backend doesn't provide
      setRateTypes([]);
    }
  };

  const calculateTotalWorkingHours = (startTime: string, endTime: string, breakDuration: number): number => {
    const start = new Date(`2000-01-01T${startTime}`);
    let end = new Date(`2000-01-01T${endTime}`);

    // Handle overnight shifts
    if (end <= start) {
      end = new Date(`2000-01-02T${endTime}`);
    }

    const diffMs = end.getTime() - start.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, totalHours - breakDuration);
  };

  const formatTimeDisplay = (startTime: string, endTime: string): string => {
    const start = new Date(`2000-01-01T${startTime}`);
    const startHour = start.getHours();
    const startMin = start.getMinutes();
    const startPeriod = startHour >= 12 ? "pm" : "am";
    const startHour12 = startHour % 12 || 12;

    let end = new Date(`2000-01-01T${endTime}`);
    if (end <= start) {
      end = new Date(`2000-01-02T${endTime}`);
    }
    const endHour = end.getHours();
    const endMin = end.getMinutes();
    const endPeriod = endHour >= 12 ? "pm" : "am";
    const endHour12 = endHour % 12 || 12;

    return `${startHour12}:${startMin.toString().padStart(2, "0")}${startPeriod} to ${endHour12}:${endMin.toString().padStart(2, "0")}${endPeriod}`;
  };

  const updateShift = (id: number, field: keyof Shift, value: any) => {
    setShifts((prevShifts) =>
      prevShifts.map((shift) => {
        if (shift.id === id) {
          const updated = { ...shift, [field]: value };

          // Auto-calculate total working hours
          if (field === "startTime" || field === "endTime" || field === "breakDuration") {
            updated.totalWorkingHours = calculateTotalWorkingHours(
              updated.startTime,
              updated.endTime,
              updated.breakDuration
            );
          }

          // Auto-calculate total wages based on rate type
          if (updated.rateType === "Hourly") {
            updated.totalWages = updated.rates * updated.totalWorkingHours;
          } else if (updated.rateType === "Weekly") {
            updated.totalWages = updated.rates; // Weekly rate is fixed
          } else if (updated.rateType === "Monthly") {
            updated.totalWages = updated.rates; // Monthly rate is fixed
          }

          return updated;
        }
        return shift;
      })
    );
  };

  const addShift = () => {
    // Default to next day if there are existing shifts
    const defaultDate = shifts.length > 0 && shifts[shifts.length - 1].shiftDate
      ? (() => {
        const lastDate = new Date(shifts[shifts.length - 1].shiftDate);
        lastDate.setDate(lastDate.getDate() + 1);
        return formatLocalDate(lastDate);
      })()
      : formData.jobDate || getLocalDateString();

    const newShift: Shift = {
      id: Date.now(),
      shiftDate: defaultDate,
      startTime: "09:00",
      endTime: "17:00",
      breakDuration: 0,
      totalWorkingHours: 8,
      rateType: "Hourly",
      rates: 0,
      totalWages: 0,
      vacancy: 1, // Required: minimum 1 (matches backend spec)
      standbyVacancy: 0, // Optional: default 0 (matches backend spec)
    };
    setShifts([...shifts, newShift]);
  };

  // Add skill to array
  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  // Remove skill from array
  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Handle Enter key for skill input
  const handleSkillKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const removeShift = (id: number) => {
    if (shifts.length > 1) {
      setShifts(shifts.filter((shift) => shift.id !== id));
    } else {
      toast.error("At least one shift is required");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Auto-fill location details and outlet address from outlet
    if (name === "outletId" && value) {
      const outlet = availableOutlets.find((o) => o.id === value);
      if (outlet) {
        const outletAddress = outlet.address ?? "";
        setFormData((prev) => ({
          ...prev,
          locationDetails: outletAddress,
          outletAddress: outletAddress
        }));
      }
    }

    // Auto-fill location details from manual outlet entry
    if (name === "outletAddress") {
      setFormData((prev) => ({ ...prev, locationDetails: value ?? "" }));
    }
  };

  const validateForm = () => {
    if (!formData.jobTitle?.trim()) {
      toast.error("Job title is required");
      return false;
    }
    if (!formData.jobDescription?.trim()) {
      toast.error("Job description is required");
      return false;
    }
    if (!selectedEmployer || selectedEmployer === "") {
      toast.error("Please select an employer");
      return false;
    }
    // Outlet validation: At least one of outletId, outletAddress, or locationDetails must be provided
    if (!formData.useManualOutlet && !formData.outletId) {
      toast.error("Please select an outlet");
      return false;
    }
    if (formData.useManualOutlet && !formData.outletAddress?.trim() && !formData.locationDetails?.trim()) {
      toast.error("Please provide either outlet address or location details");
      return false;
    }
    if (shifts.length === 0) {
      toast.error("At least one shift is required");
      return false;
    }
    return true;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userRole = user?.role || "ADMIN";
      const finalEmployerId = userRole === "EMPLOYER" && user?.employerId
        ? user.employerId
        : (selectedEmployer === "admin" ? null : (formData.employerId || null));

      const jobData = buildJobData(
        { ...formData, employerId: finalEmployerId || formData.employerId },
        shifts,
        userRole,
        user?.employerId
      );

      // NEW_END_TO_END_API_DOCUMENTATION.md: POST /admin/jobs or /admin/jobs/create – try both for backend compatibility
      let response: any;
      try {
        response = await axiosInstance.post("/admin/jobs", jobData);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          response = await axiosInstance.post("/admin/jobs/create", jobData);
        } else {
          throw err;
        }
      }

      // Check for success field according to API spec
      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to create job");
      }

      if (response.status === 201 || response.status === 200) {
        const createdJob = response.data?.job;
        const jobId = createdJob?._id || createdJob?.id;
        if (jobId) {
          try {
            const updated = await axiosInstance.get(`/admin/jobs/${jobId}`);
            if (updated?.data?.success !== false && updated?.data?.job) {
              toast.success("Job created. QR/Barcodes are attached to this job.");
              navigate(`/jobs/${jobId}`, { state: { job: updated.data.job } });
              return;
            }
          } catch (_) {
            // Fallback: still navigate to list
          }
        }
        toast.success("Job posting created successfully!");
        navigate(jobId ? `/jobs/${jobId}` : "/jobs/job-management");
      }
    } catch (error: any) {
      // Enhanced error handling with detailed messages
      const errorResponse = error?.response?.data;
      const errorMessage = errorResponse?.message || "Failed to create job posting";
      const errorDetails = errorResponse?.error || "";
      const statusCode = error?.response?.status;

      // Detailed error messages based on status code and error type
      let displayMessage = errorMessage;

      if (statusCode === 400) {
        // Validation errors
        if (errorMessage.includes("date") || errorMessage.includes("Date")) {
          displayMessage = `Date Validation Error: ${errorMessage}. Please select a valid date (today or future).`;
        } else if (errorMessage.includes("jobRequirements") || errorMessage.includes("array") || errorMessage.includes("skills")) {
          displayMessage = `Data Format Error: ${errorMessage}. Skills/Requirements must be provided as an array.`;
        } else if (errorMessage.includes("required") || errorMessage.includes("missing")) {
          displayMessage = `Missing Required Field: ${errorMessage}. Please fill in all required fields.`;
        } else if (errorMessage.includes("employer")) {
          displayMessage = `Employer Error: ${errorMessage}. Please select a valid employer or post as Admin.`;
        } else {
          displayMessage = `Validation Error: ${errorMessage}`;
        }
      } else if (statusCode === 401) {
        displayMessage = "Authentication Error: Please log in again to continue.";
      } else if (statusCode === 403) {
        displayMessage = "Permission Denied: You don't have permission to create jobs.";
      } else if (statusCode === 404) {
        displayMessage = "Resource Not Found: The requested resource doesn't exist.";
      } else if (statusCode === 500) {
        displayMessage = "Server Error: Something went wrong on the server. Please try again later or contact support.";
      } else if (errorDetails && errorDetails.includes("not a valid enum value")) {
        displayMessage = "Configuration Error: There's an issue with the employer data. Please contact support or try selecting a different employer.";
      } else if (!error?.response) {
        displayMessage = "Network Error: Unable to connect to the server. Please check your internet connection.";
      }

      // Show error with longer duration for important errors
      toast.error(displayMessage, {
        duration: statusCode === 400 || statusCode === 500 ? 6000 : 4000
      });

      // Log detailed error for debugging
      console.error("Job creation error:", {
        statusCode,
        message: errorMessage,
        details: errorDetails,
        fullError: error
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, shifts, user, selectedEmployer, validateForm, navigate]);

  const totalWages = shifts.reduce((sum, shift) => sum + shift.totalWages, 0);

  // Get today's date in YYYY-MM-DD format (local timezone) for min date validation
  const getTodayDateString = () => getLocalDateString();

  // Get minimum date for application deadline (should be >= job date or today)
  const getMinDeadlineDate = () => {
    if (formData.jobDate) {
      const jobDate = new Date(formData.jobDate);
      const today = new Date();
      return jobDate >= today ? formData.jobDate : getTodayDateString();
    }
    return getTodayDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Job Posting</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="space-y-8">
            {/* Section 1: Basic Job Information */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Basic Job Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Date - Today's date (local timezone) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Posting Date
                  </label>
                  <input
                    type="date"
                    name="jobDate"
                    value={formData.jobDate ?? getLocalDateString()}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="Enter job title"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>


                {/* Employer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employer <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <select
                      name="employerId"
                      value={selectedEmployer ?? ""}
                      onChange={(e) => {
                        setSelectedEmployer(e.target.value);
                        const selectedEmp = employers.find((emp) => emp.id === e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          employerId: e.target.value,
                          employerName: (selectedEmp as any)?.name ?? (selectedEmp as any)?.companyLegalName ?? "",
                          industry: (selectedEmp as any)?.industry ?? "",
                          outletId: "",
                          useManualOutlet: false
                        }));
                      }}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Employer</option>
                      {employers.map((employer) => (
                        <option key={employer.id} value={employer.id}>
                          {(employer as any)?.name ?? (employer as any)?.companyLegalName ?? `Employer ${employer.id}`}
                        </option>
                      ))}
                    </select>

                    {/* Display Company Logo, Name, and Industry when employer is selected */}
                    {selectedEmployer && (() => {
                      const selectedEmployerData = employers.find((e) => e.id === selectedEmployer);
                      const companyName = (selectedEmployerData as any)?.name ?? (selectedEmployerData as any)?.companyLegalName ?? formData.employerName ?? "";
                      const companyLogo = (selectedEmployerData as any)?.companyLogo;
                      const industry = (selectedEmployerData as any)?.industry ?? formData.industry ?? "";
                      return (
                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            {companyLogo && (
                              <img
                                src={companyLogo.startsWith("http") ? companyLogo : `${IMAGE_BASE_URL}${companyLogo}`}
                                alt="Company Logo"
                                className="w-12 h-12 rounded-lg object-cover border border-gray-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-900">Company: {companyName}</p>
                              {industry && (
                                <p className="text-xs text-gray-600 mt-1">Industry: {industry}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Industry (Auto-filled from employer) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry <span className="text-gray-400 text-xs">(Auto-filled from employer)</span>
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry ?? ""}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Outlet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outlet <span className="text-red-500">*</span>
                  </label>
                  {formData.useManualOutlet || availableOutlets.length === 0 ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="outletAddress"
                        value={formData.outletAddress ?? ""}
                        onChange={handleChange}
                        placeholder="Enter outlet address"
                        required={formData.useManualOutlet}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {selectedEmployer && availableOutlets.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, useManualOutlet: false, outletAddress: "" }))}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Or select from existing outlets
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <select
                        name="outletId"
                        value={formData.outletId ?? ""}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Outlet</option>
                        {availableOutlets.map((outlet) => (
                          <option key={outlet.id} value={outlet.id}>
                            {outlet.name ?? outlet.address}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, useManualOutlet: true, outletId: "" }))}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Or enter outlet address manually
                      </button>
                    </div>
                  )}
                </div>

                {/* Job Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jobStatus"
                    value={formData.jobStatus ?? "Active"}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Filled">Filled</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                {/* Application Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="applicationDeadline"
                    value={formData.applicationDeadline ?? ""}
                    onChange={handleChange}
                    min={`${getMinDeadlineDate()}T00:00`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deadline must be on or after {getMinDeadlineDate()}
                  </p>
                </div>

                {/* Location Details */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Details <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="locationDetails"
                    value={formData.locationDetails ?? ""}
                    onChange={handleChange}
                    placeholder="Auto-filled from outlet or enter manually"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Job Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription ?? ""}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter detailed job description, responsibilities, requirements..."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Dress Code */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dress Code <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    name="dressCode"
                    value={formData.dressCode ?? ""}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g., Uniform provided, Black pants and white shirt, Safety shoes required"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Skills - Array format (List) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills <span className="text-gray-400 text-xs">(Optional - Add skills as a list)</span>
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={handleSkillKeyPress}
                        placeholder="Enter skill and press Enter or click Add"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {formData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(index)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Skills are stored as an array. Each skill is a separate item in the list.
                  </p>
                </div>

                {/* Food Hygiene Cert Required */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="foodHygieneCertRequired"
                      checked={formData.foodHygieneCertRequired}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Food Hygiene Cert Required (Mandatory)
                    </span>
                    <span className="text-xs text-gray-500">
                      - Workers must upload Food Hygiene Cert to apply for this job
                    </span>
                  </label>
                </div>
              </div>
            </section>

            {/* Section 2: Shift Information */}
            <section className="space-y-6 border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Shift Information
                </h2>
                <button
                  type="button"
                  onClick={addShift}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Shift
                </button>
              </div>

              <div className="space-y-6">
                {shifts.map((shift, index) => (
                  <div key={shift.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Shift {index + 1}</h3>
                      {shifts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeShift(shift.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Shift Date */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Shift Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={shift.shiftDate}
                          onChange={(e) => updateShift(shift.id, "shiftDate", e.target.value)}
                          min={formData.jobDate || getLocalDateString()}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Shift Timing */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={shift.startTime}
                          onChange={(e) => updateShift(shift.id, "startTime", e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={shift.endTime}
                          onChange={(e) => updateShift(shift.id, "endTime", e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Shift Timing Display
                        </label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700">
                          {formatTimeDisplay(shift.startTime, shift.endTime)}
                        </div>
                      </div>

                      {/* Break Duration */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Break Duration (hours) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.25"
                          value={shift.breakDuration}
                          onChange={(e) => updateShift(shift.id, "breakDuration", parseFloat(e.target.value) || 0)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Total Working Hours - Auto-calculated */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Total Working Hours
                        </label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium">
                          {shift.totalWorkingHours.toFixed(2)} hrs
                        </div>
                      </div>

                      {/* Rate Type */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Rate Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={shift.rateType}
                          onChange={(e) => {
                            const newRateType = e.target.value;
                            updateShift(shift.id, "rateType", newRateType as "Hourly" | "Weekly" | "Monthly");
                          }}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Hourly">Hourly</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                      </div>

                      {/* Rates */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {shift.rateType === "Hourly" ? "Rate/Hr (SGD)" : shift.rateType === "Weekly" ? "Rate/Week (SGD)" : "Rate/Month (SGD)"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={shift.rates}
                          onChange={(e) => updateShift(shift.id, "rates", parseFloat(e.target.value) || 0)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Total Wages - Auto-calculated */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Total Wages (SGD)
                        </label>
                        <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-semibold">
                          ${shift.totalWages.toFixed(2)}
                        </div>
                      </div>

                      {/* Vacancy */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Vacancy <span className="text-red-500">*</span>
                          <span className="text-gray-400 text-xs font-normal ml-1">(Positions available)</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={shift.vacancy}
                          onChange={(e) => updateShift(shift.id, "vacancy", parseInt(e.target.value) || 1)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Standby Vacancy */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Standby Vacancy <span className="text-gray-400 text-xs">(Optional)</span>
                          <span className="text-gray-400 text-xs font-normal ml-1 block">(Backup positions)</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={shift.standbyVacancy}
                          onChange={(e) => updateShift(shift.id, "standbyVacancy", parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Shifts:</span>
                    <span className="ml-2 font-semibold text-gray-900">{shifts.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Positions:</span>
                    <span className="ml-2 font-semibold text-gray-900">{shifts.reduce((s, sh) => s + (sh.vacancy ?? 1), 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Wages:</span>
                    <span className="ml-2 font-semibold text-green-700">${totalWages.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Job Posting
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewJob;
