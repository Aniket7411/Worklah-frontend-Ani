import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";

interface Employer {
  id: string;
  name: string;
  outlets?: Array<{ id: string; address: string; name?: string }>;
}

interface Shift {
  id: number;
  startTime: string;
  endTime: string;
  breakDuration: number;
  totalWorkingHours: number;
  rateType: "Weekend" | "Weekday" | "Public Holiday";
  payPerHour: number;
  totalWages: number;
}

const NewJob: React.FC = () => {
  const navigate = useNavigate();
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
  });

  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: Date.now(),
      startTime: "09:00",
      endTime: "17:00",
      breakDuration: 0,
      totalWorkingHours: 8,
      rateType: "Weekday",
      payPerHour: 0,
      totalWages: 0,
    },
  ]);

  const [rateTypes, setRateTypes] = useState<string[]>([]);
  const [defaultPayRates, setDefaultPayRates] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchEmployers();
    fetchRateConfiguration();
  }, []);

  useEffect(() => {
    if (selectedEmployer) {
      const employer = employers.find((e) => e.id === selectedEmployer);
      if (employer?.outlets && employer.outlets.length > 0) {
        setAvailableOutlets(employer.outlets);
        setFormData((prev) => ({ ...prev, employerId: selectedEmployer, useManualOutlet: false }));
      } else {
        fetchEmployerOutlets(selectedEmployer);
      }
    } else {
      setAvailableOutlets([]);
      setFormData((prev) => ({ ...prev, outletId: "", useManualOutlet: true }));
    }
  }, [selectedEmployer, employers]);

  const fetchEmployers = async () => {
    try {
      const response = await axiosInstance.get("/employers?limit=100");
      if (response.data?.employers) {
        setEmployers(response.data.employers);
      }
    } catch (error) {
      console.error("Error fetching employers:", error);
    }
  };

  const fetchEmployerOutlets = async (employerId: string) => {
    try {
      const response = await axiosInstance.get(`/employers/${employerId}`);
      if (response.data?.employer?.outlets && response.data.employer.outlets.length > 0) {
        setAvailableOutlets(response.data.employer.outlets);
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
          const firstRateType = response.data.rateTypes[0];
          const defaultPayRate = response.data.defaultPayRates[firstRateType] || 0;
          setShifts([{
            id: Date.now(),
            startTime: "09:00",
            endTime: "17:00",
            breakDuration: 0,
            totalWorkingHours: 8,
            rateType: firstRateType as "Weekend" | "Weekday" | "Public Holiday",
            payPerHour: defaultPayRate,
            totalWages: defaultPayRate * 8,
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

          // Auto-calculate total wages
          updated.totalWages = updated.payPerHour * updated.totalWorkingHours;

          return updated;
        }
        return shift;
      })
    );
  };

  const addShift = () => {
    const defaultRateType = rateTypes.length > 0 ? rateTypes[0] : "Weekday";
    const defaultPayRate = defaultPayRates[defaultRateType] || 0;
    const newShift: Shift = {
      id: Date.now(),
      startTime: "09:00",
      endTime: "17:00",
      breakDuration: 0,
      totalWorkingHours: 8,
      rateType: defaultRateType as "Weekend" | "Weekday" | "Public Holiday",
      payPerHour: defaultPayRate,
      totalWages: defaultPayRate * 8,
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
    if (!formData.useManualOutlet && !formData.outletId) {
      toast.error("Please select an outlet");
      return false;
    }
    if (formData.useManualOutlet && !formData.outletAddress.trim()) {
      toast.error("Please enter outlet address");
      return false;
    }
    if (!formData.locationDetails.trim()) {
      toast.error("Location details is required");
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
      const jobData = {
        jobDate: formData.jobDate,
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        jobRoles: formData.jobRoles,
        employerId: formData.employerId || null,
        employerName: formData.employerName || null, // For manual entry
        outletId: formData.useManualOutlet ? null : formData.outletId,
        outletAddress: formData.useManualOutlet ? formData.outletAddress : null, // For manual entry
        totalPositions: formData.totalPositions,
        foodHygieneCertRequired: formData.foodHygieneCertRequired,
        jobStatus: formData.jobStatus,
        applicationDeadline: formData.applicationDeadline || null,
        jobRequirements: formData.jobRequirements
          ? formData.jobRequirements.split(",").map((r) => r.trim()).filter((r) => r)
          : [],
        locationDetails: formData.locationDetails,
        contactInfo: {
          phone: formData.contactPhone,
          email: formData.contactEmail,
        },
        shifts: shifts.map((shift) => ({
          startTime: shift.startTime,
          endTime: shift.endTime,
          breakDuration: shift.breakDuration,
          totalWorkingHours: shift.totalWorkingHours,
          rateType: shift.rateType,
          payPerHour: shift.payPerHour,
          totalWages: shift.totalWages,
        })),
      };

      const response = await axiosInstance.post("/jobs/create", jobData);

      if (response.status === 201 || response.status === 200) {
        toast.success("Job posting created successfully!");
        navigate("/jobs/job-management");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create job posting");
    } finally {
      setIsSubmitting(false);
    }
  };

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

                {/* Employer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employer <span className="text-red-500">*</span>
                  </label>
                  {employers.length > 0 ? (
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
                  {employers.length > 0 && !selectedEmployer && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEmployer("");
                          setFormData((prev) => ({ ...prev, employerId: "", employerName: "" }));
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Or enter employer name manually
                      </button>
                      {!selectedEmployer && (
                        <input
                          type="text"
                          name="employerName"
                          value={formData.employerName}
                          onChange={handleChange}
                          placeholder="Enter employer name manually"
                          className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
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
                      <input
                        type="text"
                        name="outletAddress"
                        value={formData.outletAddress}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Location Details */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Details <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="locationDetails"
                    value={formData.locationDetails}
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
                    value={formData.jobDescription}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter detailed job description, responsibilities, requirements..."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Job Requirements */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Requirements <span className="text-gray-400 text-xs">(Optional - comma-separated)</span>
                  </label>
                  <textarea
                    name="jobRequirements"
                    value={formData.jobRequirements}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g., Experience preferred, Food hygiene cert, Physical fitness"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
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
                            updateShift(shift.id, "rateType", newRateType as "Weekend" | "Weekday" | "Public Holiday");
                            // Auto-update pay rate if default exists for this rate type
                            if (defaultPayRates[newRateType]) {
                              updateShift(shift.id, "payPerHour", defaultPayRates[newRateType]);
                            }
                          }}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {rateTypes.length > 0 ? (
                            rateTypes.map((rateType) => (
                              <option key={rateType} value={rateType}>{rateType}</option>
                            ))
                          ) : (
                            <>
                              <option value="Weekday">Weekday</option>
                              <option value="Weekend">Weekend</option>
                              <option value="Public Holiday">Public Holiday</option>
                            </>
                          )}
                        </select>
                      </div>

                      {/* Pay/Hr */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Pay/Hr (SGD) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={shift.payPerHour}
                          onChange={(e) => updateShift(shift.id, "payPerHour", parseFloat(e.target.value) || 0)}
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
