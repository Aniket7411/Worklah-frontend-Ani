import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Save,
  Plus,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { buildJobData } from "../../utils/dataTransformers";
import { AddressAutocomplete } from "../../components/location";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Loader from "../../components/Loader.jsx";

interface Employer {
  id: string;
  name: string;
  companyLegalName?: string;
  companyLogo?: string;
  outlets?: Array<{ id: string; address: string; name?: string }>;
}

interface Shift {
  id: number;
  shiftDate?: string; // Shift date for this specific shift
  startTime: string;
  endTime: string;
  breakDuration: number;
  totalWorkingHours: number;
  rateType: "Hourly" | "Weekly" | "Monthly"; // Updated to match backend spec
  rates?: number; // Pay rate (can be hourly, weekly, or monthly)
  payPerHour?: number; // Legacy field, maps to rates
  totalWages: number;
  vacancy?: number; // Required: minimum 1 (matches backend spec)
  standbyVacancy?: number; // Optional: default 0 (matches backend spec)
}

// Convert ISO date/datetime to local YYYY-MM-DDTHH:mm for datetime-local input
function toLocalDateTimeString(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

// Normalize and deduplicate outlets from API (avoid showing duplicate entries)
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

const ModifyJob: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [selectedEmployer, setSelectedEmployer] = useState<string>("");
  const [availableOutlets, setAvailableOutlets] = useState<Array<{ id: string; address: string; name?: string }>>([]);

  const [formData, setFormData] = useState({
    jobDate: new Date().toISOString().split("T")[0],
    jobTitle: "",
    jobDescription: "",
    jobRoles: "",
    employerId: "",
    employerName: "", // For manual entry
    outletId: "",
    outletAddress: "", // For manual entry
    useManualOutlet: false, // Toggle between dropdown and manual entry
    totalPositions: 1,
    foodHygieneCertRequired: false,
    jobStatus: "Active",
    applicationDeadline: "",
    jobRequirements: "",
    locationDetails: "",
    contactPhone: "",
    contactEmail: "",
    currentFulfilment: { filled: 0, total: 1 },
  });

  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: Date.now(),
      shiftDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "17:00",
      breakDuration: 0,
      totalWorkingHours: 8,
      rateType: "Hourly",
      rates: 0,
      payPerHour: 0,
      totalWages: 0,
      vacancy: 1, // Required: minimum 1 (matches backend spec)
      standbyVacancy: 0, // Optional: default 0 (matches backend spec)
    },
  ]);

  const [rateTypes, setRateTypes] = useState<string[]>([]);
  const [defaultPayRates, setDefaultPayRates] = useState<{ [key: string]: number }>({});
  const IMAGE_BASE_URL = "https://worklah.onrender.com";

  // Get selected employer data for display
  const selectedEmployerData = selectedEmployer
    ? employers.find((e) => e.id === selectedEmployer)
    : null;
  const companyName = selectedEmployerData
    ? ((selectedEmployerData as any)?.name || (selectedEmployerData as any)?.companyLegalName || formData.employerName)
    : "";
  const companyLogo = selectedEmployerData ? (selectedEmployerData as any)?.companyLogo : null;

  useEffect(() => {
    fetchEmployers();
    fetchRateConfiguration();
    if (jobId) {
      fetchJobData();
    }
  }, [jobId]);

  // When editing, resolve employer id so company name/logo display works (match by id or _id)
  useEffect(() => {
    if (jobId && formData.employerId && employers.length > 0) {
      const matched = employers.find(
        (e) => e.id === formData.employerId || (e as any)._id === formData.employerId
      );
      if (matched && selectedEmployer !== matched.id) setSelectedEmployer(matched.id);
    }
  }, [jobId, formData.employerId, employers]);

  useEffect(() => {
    if (selectedEmployer) {
      const employer = employers.find((e) => e.id === selectedEmployer);
      if (employer?.outlets && employer.outlets.length > 0) {
        setAvailableOutlets(normalizeOutlets(employer.outlets));
        setFormData((prev) => ({ ...prev, useManualOutlet: false }));
      } else {
        fetchEmployerOutlets(selectedEmployer);
      }
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
      }
    } catch (error) {
      console.error("Error fetching rate configuration:", error);
      setRateTypes([]);
    }
  };

  const fetchJobData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/jobs/${jobId}`);
      const job = response.data?.job || response.data;

      if (job) {
        const jobDate = job.jobDate || job.date || new Date().toISOString().split("T")[0];
        const employerId = job.employerId || job.employer?.employerId || job.employer?._id || job.employer?.id || "";
        const outletId = job.outlet?._id || job.outlet?.id || job.outletId || "";
        const hasOutletId = !!outletId;
        setFormData({
          jobDate,
          jobTitle: job.jobTitle || job.jobName || "",
          jobDescription: job.jobDescription || job.jobScope || "",
          jobRoles: job.jobRoles || "",
          employerId,
          employerName: job.employerName || job.employer?.name || job.employer?.companyLegalName || "",
          outletId,
          outletAddress: job.outletAddress || job.outlet?.address || "",
          useManualOutlet: !hasOutletId && !!(job.outletAddress || job.outlet?.address),
          totalPositions: job.totalPositions || job.totalPositionsNeeded || 1,
          foodHygieneCertRequired: job.foodHygieneCertRequired || false,
          jobStatus: job.jobStatus || job.status || "Active",
          applicationDeadline: job.applicationDeadline ? toLocalDateTimeString(job.applicationDeadline) : "",
          jobRequirements: Array.isArray(job.skills) ? job.skills.join(", ") : Array.isArray(job.requirements) ? job.requirements.join(", ") : job.jobRequirements || "",
          locationDetails: job.locationDetails || job.location || "",
          contactPhone: job.contactInfo?.phone || "",
          contactEmail: job.contactInfo?.email || "",
          currentFulfilment: job.currentFulfilment || { filled: 0, total: job.totalPositions || 1 },
        });

        setSelectedEmployer(employerId);

        // Pre-fill outlets from job's employer if available (so outlet dropdown is populated before useEffect)
        if (job.employer?.outlets && Array.isArray(job.employer.outlets) && job.employer.outlets.length > 0) {
          setAvailableOutlets(normalizeOutlets(job.employer.outlets));
        }

        // Handle shifts - pre-select all existing shifts from job (multiple shifts supported)
        if (job.shifts && Array.isArray(job.shifts) && job.shifts.length > 0) {
          setShifts(
            job.shifts.map((shift: any, index: number) => ({
              id: Date.now() + index,
              shiftDate: shift.shiftDate || shift.date || jobDate,
              startTime: shift.startTime || "09:00",
              endTime: shift.endTime || "17:00",
              breakDuration: shift.breakDuration ?? shift.breakHours ?? 0,
              totalWorkingHours: shift.totalWorkingHours ?? shift.duration ?? 8,
              rateType: shift.rateType || "Hourly",
              rates: shift.rates ?? shift.payPerHour ?? shift.payRate ?? 0,
              payPerHour: shift.rates ?? shift.payPerHour ?? shift.payRate ?? 0,
              totalWages: shift.totalWages ?? shift.totalWage ?? 0,
              vacancy: shift.vacancy ?? 1,
              standbyVacancy: shift.standbyVacancy ?? 0,
            }))
          );
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load job data");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalWorkingHours = (startTime: string, endTime: string, breakDuration: number): number => {
    const start = new Date(`2000-01-01T${startTime}`);
    let end = new Date(`2000-01-01T${endTime}`);

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

          if (field === "startTime" || field === "endTime" || field === "breakDuration") {
            updated.totalWorkingHours = calculateTotalWorkingHours(
              updated.startTime,
              updated.endTime,
              updated.breakDuration
            );
          }

          // Calculate total wages by rate type (Hourly / Weekly / Monthly)
          const rate = updated.rates ?? updated.payPerHour ?? 0;
          if (updated.rateType === "Hourly") {
            updated.totalWages = rate * updated.totalWorkingHours;
          } else if (updated.rateType === "Weekly" || updated.rateType === "Monthly") {
            updated.totalWages = rate;
          } else {
            updated.totalWages = rate * updated.totalWorkingHours;
          }

          return updated;
        }
        return shift;
      })
    );
  };

  const addShift = () => {
    const defaultRateType = rateTypes.length > 0 ? rateTypes[0] : "Hourly";
    const defaultPayRate = defaultPayRates[defaultRateType] || 0;
    const defaultDate = shifts.length > 0 && shifts[shifts.length - 1].shiftDate
      ? (() => {
          const lastDate = new Date(shifts[shifts.length - 1].shiftDate!);
          lastDate.setDate(lastDate.getDate() + 1);
          return lastDate.toISOString().split("T")[0];
        })()
      : formData.jobDate || new Date().toISOString().split("T")[0];
    const newShift: Shift = {
      id: Date.now(),
      shiftDate: defaultDate,
      startTime: "09:00",
      endTime: "17:00",
      breakDuration: 0,
      totalWorkingHours: 8,
      rateType: defaultRateType as "Hourly" | "Weekly" | "Monthly",
      rates: defaultPayRate,
      payPerHour: defaultPayRate,
      totalWages: defaultRateType === "Hourly" ? defaultPayRate * 8 : defaultPayRate,
      vacancy: 1,
      standbyVacancy: 0,
    };
    setShifts([...shifts, newShift]);
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

    // Auto-fill location details from outlet
    if (name === "outletId" && value) {
      const outlet = availableOutlets.find((o) => o.id === value);
      if (outlet) {
        setFormData((prev) => ({ ...prev, locationDetails: outlet.address, outletAddress: outlet.address }));
      }
    }

    // Auto-fill location details from manual outlet entry
    if (name === "outletAddress") {
      setFormData((prev) => ({ ...prev, locationDetails: value }));
    }

    // Auto-fill contact info from employer
    if (name === "employerId" && value) {
      const employer = employers.find((e) => e.id === value);
      if (employer) {
        setFormData((prev) => ({
          ...prev,
          employerId: value,
          employerName: (employer as any).name || (employer as any).companyLegalName || ""
        }));
      }
    }
  };

  const validateForm = () => {
    if (!formData.jobTitle.trim()) {
      toast.error("Job title is required");
      return false;
    }
    if (!formData.jobDescription.trim()) {
      toast.error("Job description is required");
      return false;
    }
    if (!formData.jobRoles.trim()) {
      toast.error("Job roles is required");
      return false;
    }
    if (!formData.employerId && !formData.employerName.trim()) {
      toast.error("Please select an employer or enter employer name");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Convert jobRequirements to skills array (backend expects 'skills' field)
      const skillsArray = formData.jobRequirements
        ? formData.jobRequirements.split(",").map((s) => s.trim()).filter((s) => s)
        : [];

      // Use buildJobData utility to match backend spec
      const jobData = buildJobData(
        {
          ...formData,
          skills: skillsArray, // Map jobRequirements to skills for API
          employerId: formData.employerId || null,
          outletId: formData.useManualOutlet ? null : formData.outletId,
          outletAddress: formData.useManualOutlet ? formData.outletAddress : null,
        },
        shifts.map((shift) => ({
          ...shift,
          rates: shift.rates || shift.payPerHour || 0, // Ensure rates is set
          shiftDate: shift.shiftDate || formData.jobDate,
        })),
        "ADMIN" // Admin role for modify
      );

      // Backend endpoint: PUT /api/admin/jobs/:id
      const response = await axiosInstance.put(`/admin/jobs/${jobId}`, jobData);

      // Check for success field according to API spec
      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to update job");
      }

      if (response.status === 200 || response.status === 201) {
        toast.success("Job posting updated successfully!");
        navigate(`/jobs/${jobId}`);
      }
    } catch (error: any) {
      // Enhanced error handling with detailed messages
      const errorResponse = error?.response?.data;
      const errorMessage = errorResponse?.message || "Failed to update job posting";
      const errorDetails = errorResponse?.error || "";
      const statusCode = error?.response?.status;

      // Detailed error messages based on status code and error type
      let displayMessage = errorMessage;

      if (statusCode === 400) {
        // Validation errors
        if (errorMessage.includes("date") || errorMessage.includes("Date") || errorMessage.includes("deadline")) {
          displayMessage = errorMessage.toLowerCase().includes("deadline")
            ? `Date validation: ${errorMessage}`
            : `Date validation: ${errorMessage}. When editing, ensure application deadline is on or after job date.`;
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
        displayMessage = "Permission Denied: You don't have permission to update jobs.";
      } else if (statusCode === 404) {
        displayMessage = "Resource Not Found: The job you're trying to update doesn't exist.";
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
      console.error("Job update error:", {
        statusCode,
        message: errorMessage,
        details: errorDetails,
        fullError: error
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const totalWages = shifts.reduce((sum, shift) => sum + shift.totalWages, 0);

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Job Posting</h1>
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
                {/* Job Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="jobDate"
                    value={formData.jobDate}
                    onChange={handleChange}
                    min={jobId ? undefined : new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                {/* Job Roles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Roles <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jobRoles"
                    value={formData.jobRoles}
                    onChange={handleChange}
                    placeholder="e.g., Waiter, Cashier, Kitchen Staff"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Total Positions Needed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Positions Needed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalPositions"
                    value={formData.totalPositions}
                    onChange={handleChange}
                    min={1}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Current Fulfilment - Display only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Fulfilment <span className="text-gray-400 text-xs">(Auto-calculated)</span>
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium">
                    {formData.currentFulfilment.filled}/{formData.currentFulfilment.total}
                  </div>
                </div>

                {/* Employer - fixed when editing; no re-selection required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employer <span className="text-red-500">*</span>
                  </label>
                  {jobId && formData.employerId ? (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {companyLogo && selectedEmployerData && (
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
                          <p className="text-sm font-semibold text-gray-900">
                            {companyName || formData.employerName || "Employer"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Employer is fixed for this job (cannot be changed when editing).</p>
                        </div>
                      </div>
                    </div>
                  ) : employers.length > 0 ? (
                    <>
                      <select
                        name="employerId"
                        value={selectedEmployer}
                        onChange={(e) => {
                          setSelectedEmployer(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            employerId: e.target.value,
                            employerName: "",
                            outletId: "",
                            useManualOutlet: false
                          }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Employer</option>
                        {employers.map((employer) => (
                          <option key={employer.id} value={employer.id}>
                            {(employer as any).name || (employer as any).companyLegalName || `Employer ${employer.id}`}
                          </option>
                        ))}
                      </select>
                      {selectedEmployer && selectedEmployerData && (
                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
                          {companyLogo ? (
                            <img
                              src={companyLogo.startsWith("http") ? companyLogo : `${IMAGE_BASE_URL}${companyLogo}`}
                              alt="Company Logo"
                              className="w-12 h-12 rounded-lg object-cover border border-gray-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 border border-gray-300 flex items-center justify-center">
                              <span className="text-xs text-gray-500">No Logo</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Company: {companyName}</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 mb-2">No employers found. Enter manually:</p>
                      <input
                        type="text"
                        name="employerName"
                        value={formData.employerName}
                        onChange={handleChange}
                        placeholder="Enter employer name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Outlet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outlet <span className="text-red-500">*</span>
                  </label>
                  {formData.useManualOutlet || availableOutlets.length === 0 ? (
                    <div className="space-y-2">
                      <AddressAutocomplete
                        value={formData.outletAddress}
                        onChange={(val) => setFormData((prev) => ({ ...prev, outletAddress: val, locationDetails: val }))}
                        onPlaceSelect={(result) => setFormData((prev) => ({ ...prev, outletAddress: result.address, locationDetails: result.address }))}
                        placeholder="Start typing address (e.g., Blk 123 Ang Mo Kio Avenue 3)"
                        country="sg"
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
                        value={formData.outletId}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Outlet</option>
                        {availableOutlets.map((outlet) => (
                          <option key={outlet.id} value={outlet.id}>
                            {outlet.name || outlet.address}
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
                    value={formData.jobStatus}
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
                    value={formData.applicationDeadline}
                    onChange={handleChange}
                    min={formData.jobDate ? `${formData.jobDate}T00:00` : undefined}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.jobDate ? `Deadline must be on or after job date (${formData.jobDate})` : "Set job date first if you want a deadline"}
                  </p>
                </div>

                {/* Location Details – Google Places: type and select to auto-fill */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Details <span className="text-red-500">*</span>
                    <span className="text-gray-400 text-xs font-normal ml-2">(Singapore – type to fetch from Google)</span>
                  </label>
                  <AddressAutocomplete
                    value={formData.locationDetails}
                    onChange={(val) => setFormData((prev) => ({ ...prev, locationDetails: val }))}
                    onPlaceSelect={(result) => setFormData((prev) => ({ ...prev, locationDetails: result.address }))}
                    placeholder="Start typing address or use outlet above"
                    country="sg"
                  />
                </div>

                {/* Job Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter detailed job description, responsibilities, requirements..."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Job Requirements / Skills */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills / Job Requirements <span className="text-gray-400 text-xs">(Optional - comma-separated, will be saved as array)</span>
                  </label>
                  <textarea
                    name="jobRequirements"
                    value={formData.jobRequirements}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g., Experience preferred, Food hygiene cert, Physical fitness (Enter comma-separated values)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Note: These will be converted to an array format when saved. Example: "Skill1, Skill2" → ["Skill1", "Skill2"]
                  </p>
                </div>

                {/* Contact Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="Auto-filled from employer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="Auto-filled from employer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                          value={shift.shiftDate ?? formData.jobDate}
                          onChange={(e) => updateShift(shift.id, "shiftDate", e.target.value)}
                          min={formData.jobDate || (jobId ? undefined : new Date().toISOString().split("T")[0])}
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
                            const newRateType = e.target.value as "Hourly" | "Weekly" | "Monthly";
                            updateShift(shift.id, "rateType", newRateType);
                            if (defaultPayRates[newRateType] != null) {
                              updateShift(shift.id, "rates", defaultPayRates[newRateType]);
                              updateShift(shift.id, "payPerHour", defaultPayRates[newRateType]);
                            }
                          }}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Hourly">Hourly</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                      </div>

                      {/* Rates (Pay/Hr, Pay/Week, or Pay/Month) */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {shift.rateType === "Hourly" ? "Rate/Hr (SGD)" : shift.rateType === "Weekly" ? "Rate/Week (SGD)" : "Rate/Month (SGD)"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={shift.rates ?? shift.payPerHour ?? 0}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value) || 0;
                            updateShift(shift.id, "rates", v);
                            updateShift(shift.id, "payPerHour", v);
                          }}
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
                          value={shift.vacancy || 1}
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
                          value={shift.standbyVacancy || 0}
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
                    <span className="ml-2 font-semibold text-gray-900">{formData.totalPositions}</span>
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Update Job Posting
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

export default ModifyJob;
