import {
  ArrowLeft,
  Briefcase,
  Pencil,
  Rows2,
  Trash2,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { TiDocumentText } from "react-icons/ti";
import { axiosInstance } from "../../lib/authInstances";
import { useNavigate, useParams } from "react-router-dom";

const IMAGE_BASE_URL = "https://worklah.onrender.com";

export default function ModifyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmployers, setIsLoadingEmployers] = useState(false);
  const [isLoadingOutlets, setIsLoadingOutlets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error states
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Dropdown states
  const [selectedCompanyOption, setSelectedCompanyOption] = useState("");
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [isOutletDropdownOpen, setIsOutletDropdownOpen] = useState(false);

  // Data states
  const [companies, setCompanies] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [filteredOutlets, setFilteredOutlets] = useState<any[]>([]);

  // Form state - simple variables
  const [jobName, setJobName] = useState("");
  const [jobLogo, setJobLogo] = useState("/assets/icons/plus-emoji.png");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("Hotel");
  const [jobScopeDescription, setJobScopeDescription] = useState("");
  const [jobRequirements, setJobRequirements] = useState("");

  // Date state - simple format
  const [date, setDate] = useState({
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  // Shifts state
  const [shifts, setShifts] = useState([{
    id: Date.now(),
    startTime: { hours: "09", minutes: "00", period: "AM" },
    endTime: { hours: "17", minutes: "00", period: "PM" },
    vacancy: 3,
    standbyVacancy: 1,
    duration: 4,
    breakHours: 1,
    breakType: "Paid",
    rateType: "Flat rate",
    payRate: 20,
    totalWage: 80,
  }]);

  // Fetch employers
  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        setIsLoadingEmployers(true);
        const response = await axiosInstance.get("/employers");
        const employerList = response.data.employers;

        if (!Array.isArray(employerList)) {
          throw new Error("Invalid response format");
        }

        const formattedEmployers = employerList.map((employer) => ({
          value: employer._id,
          label: employer.companyLegalName,
          image: employer.companyLogo ? `${IMAGE_BASE_URL}${employer.companyLogo}` : "",
        }));

        setCompanies(formattedEmployers);
      } catch (err: any) {
        console.error("Error fetching employers:", err);
        setError("Failed to load employers");
      } finally {
        setIsLoadingEmployers(false);
      }
    };

    fetchEmployers();
  }, []);

  // Fetch outlets
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        setIsLoadingOutlets(true);
        const response = await axiosInstance.get("/outlets");
        const outletsData = response.data.data || [];

        const formattedOutlets = outletsData.map((outlet) => ({
          value: outlet._id,
          label: outlet.outletName,
          image: outlet.outletImage ? `${IMAGE_BASE_URL}${outlet.outletImage}` : "/static/outletImage.png",
          employerId: outlet.employerId || outlet.employer?._id || "",
        }));

        setOutlets(formattedOutlets);
      } catch (err: any) {
        console.error("Error fetching outlets:", err);
        setError("Failed to load outlets");
      } finally {
        setIsLoadingOutlets(false);
      }
    };

    fetchOutlets();
  }, []);

  // Filter outlets when employer changes
  useEffect(() => {
    if (selectedCompanyOption) {
      const filtered = outlets.filter(
        (outlet: any) => outlet.employerId === selectedCompanyOption
      );
      setFilteredOutlets(filtered);
      if (selectedOutlet && !filtered.find(o => o.value === selectedOutlet)) {
        setSelectedOutlet("");
      }
    } else {
      setFilteredOutlets([]);
      setSelectedOutlet("");
    }
  }, [selectedCompanyOption, outlets, selectedOutlet]);

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;

      try {
        setIsLoading(true);
        setError("");
        const response = await axiosInstance.get(`/admin/jobs/${jobId}`);
        const jobData = response.data.job;

        // Format shifts
        const formattedShifts = jobData.shifts.map((shift, index) => {
          const startParts = shift.startTime.split(":");
          const endParts = shift.endTime.split(":");
          
          return {
            id: Date.now() + index,
            startTime: {
              hours: startParts[0] || "09",
              minutes: startParts[1] || "00",
              period: shift.startMeridian || "AM",
            },
            endTime: {
              hours: endParts[0] || "17",
              minutes: endParts[1] || "00",
              period: shift.endMeridian || "PM",
            },
            vacancy: shift.vacancy || 3,
            standbyVacancy: shift.standbyVacancy || 1,
            duration: shift.totalDuration || shift.duration || 4,
            breakHours: shift.breakIncluded || shift.breakHours || 1,
            breakType: shift.breakType || "Paid",
            rateType: shift.rateType || "Flat rate",
            payRate: shift.payRate || 20,
            totalWage: shift.totalWage || 80,
          };
        });

        // Set form data
        setJobName(jobData.jobName || "");
        setJobLogo(jobData.jobLogo || "/assets/icons/plus-emoji.png");
        setLocation(jobData.location || "");
        setIndustry(jobData.industry || "Hotel");
        setJobScopeDescription(jobData.jobScope?.join(", ") || "");
        setJobRequirements(jobData.jobRequirements?.join(", ") || "");
        if (formattedShifts.length > 0) {
          setShifts(formattedShifts);
        }

        // Set date
        if (jobData.date) {
          const jobDate = new Date(jobData.date);
          setDate({
            day: jobDate.getDate(),
            month: jobDate.getMonth() + 1,
            year: jobDate.getFullYear(),
          });
        }

        // Set selected company and outlet
        if (jobData.employer?._id) {
          setSelectedCompanyOption(jobData.employer._id);
        }
        if (jobData.outlet?._id) {
          setSelectedOutlet(jobData.outlet._id);
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load job details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  // Calculate shift total wage
  const calculateShiftTotal = (shift: any) => {
    const totalWage = shift.rateType === "Hourly rate"
      ? shift.payRate * shift.duration
      : shift.payRate;
    return totalWage;
  };

  const handleCompanyOptionSelect = (value: string) => {
    setSelectedCompanyOption(value);
    setIsCompanyDropdownOpen(false);
    setSelectedOutlet(""); // Reset outlet
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "jobName") setJobName(value);
    else if (name === "location") setLocation(value);
    else if (name === "industry") setIndustry(value);
    else if (name === "jobScopeDescription") setJobScopeDescription(value);
    else if (name === "jobRequirements") setJobRequirements(value);
    
    setSubmitError("");
  };

  const handleDateChange = (field: string, value: string) => {
    setDate(prev => ({
      ...prev,
      [field]: parseInt(value),
    }));
  };

  const addShift = () => {
    const newShift = {
      id: Date.now(),
      startTime: { hours: "09", minutes: "00", period: "AM" },
      endTime: { hours: "17", minutes: "00", period: "PM" },
      vacancy: 3,
      standbyVacancy: 1,
      duration: 4,
      breakHours: 1,
      breakType: "Paid",
      rateType: "Flat rate",
      payRate: 20,
      totalWage: 80,
    };
    setShifts([...shifts, newShift]);
  };

  const deleteShift = (id: number) => {
    if (shifts.length <= 1) {
      setSubmitError("At least one shift is required");
      return;
    }
    setShifts(shifts.filter(shift => shift.id !== id));
  };

  const updateShift = (id: number, field: string, value: any) => {
    setShifts(shifts.map(shift => {
      if (shift.id === id) {
        const updatedShift = { ...shift, [field]: value };
        const totalWage = calculateShiftTotal(updatedShift);
        return { ...updatedShift, totalWage };
      }
      return shift;
    }));
  };

  const updateTime = (id: number, timeType: string, field: string, value: string) => {
    setShifts(shifts.map(shift => {
      if (shift.id === id) {
        return {
          ...shift,
          [timeType]: { ...shift[timeType], [field]: value },
        };
      }
      return shift;
    }));
  };

  const handleJobLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        setSubmitError("Please select a valid image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          setJobLogo(reader.result);
        }
      };
      reader.onerror = () => {
        setSubmitError("Failed to read image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!jobName.trim()) {
      setSubmitError("Job name is required");
      return false;
    }

    if (!selectedCompanyOption) {
      setSubmitError("Please select a company");
      return false;
    }

    if (!selectedOutlet) {
      setSubmitError("Please select an outlet");
      return false;
    }

    if (!location.trim()) {
      setSubmitError("Location is required");
      return false;
    }

    if (shifts.length === 0) {
      setSubmitError("At least one shift is required");
      return false;
    }

    for (const shift of shifts) {
      if (shift.vacancy < 0 || shift.standbyVacancy < 0) {
        setSubmitError("Headcount cannot be negative");
        return false;
      }
      if (shift.payRate <= 0) {
        setSubmitError("Pay rate must be greater than 0");
        return false;
      }
    }

    if (!jobScopeDescription.trim()) {
      setSubmitError("Job description is required");
      return false;
    }

    if (!jobRequirements.trim()) {
      setSubmitError("Job requirements are required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Format date
      const formattedDate = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;

      // Format shifts
      const formattedShifts = shifts.map((shift) => ({
        startTime: `${shift.startTime.hours}:${shift.startTime.minutes}`,
        startMeridian: shift.startTime.period,
        endTime: `${shift.endTime.hours}:${shift.endTime.minutes}`,
        endMeridian: shift.endTime.period,
        vacancy: shift.vacancy,
        standbyVacancy: shift.standbyVacancy,
        duration: shift.duration,
        breakHours: shift.breakHours,
        breakType: shift.breakType,
        rateType: shift.rateType,
        payRate: shift.payRate,
        totalWage: calculateShiftTotal(shift),
      }));

      const requestData = {
        jobName: jobName.trim(),
        employerId: selectedCompanyOption,
        outletId: selectedOutlet,
        date: formattedDate,
        location: location.trim(),
        industry: industry || "Hotel",
        jobScope: jobScopeDescription.split(", ").filter(s => s),
        jobRequirements: jobRequirements.split(", ").filter(s => s),
        shifts: formattedShifts,
      };

      const response = await axiosInstance.put(`/admin/jobs/${jobId}`, requestData);

      if (response.data) {
        navigate("/jobs/job-management");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setSubmitError(
        error?.response?.data?.message ||
        "Failed to update job. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-12 max-w-6xl">
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          className="p-2 rounded-full shadow-custom bg-white hover:bg-gray-50"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" color="#000000" />
        </button>
        <h1 className="text-lg font-medium">Modify</h1>
      </div>

      {(error || submitError) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error || submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Job Info Section */}
        <div className="pb-4 border-b">
          <h2 className="flex items-center gap-2 text-blue-500 text-xl">
            <Briefcase className="w-6 h-6" />
            Job Info
          </h2>
        </div>

        <div className="grid gap-6 mt-6 mb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job name</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-lg">
                  <div className="border-r px-2 border-dashed cursor-pointer">
                    <label htmlFor="jobLogoUpload" className="cursor-pointer">
                      <img
                        src={jobLogo}
                        alt="Job Logo"
                        width={38}
                        height={38}
                        className="rounded-full p-1"
                      />
                    </label>
                    <input
                      id="jobLogoUpload"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleJobLogoChange}
                    />
                  </div>
                  <input
                    type="text"
                    className="flex-1 border-none p-0 focus:outline-none"
                    name="jobName"
                    value={jobName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter job name"
                  />
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-lg">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              {isLoadingEmployers ? (
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading companies...
                </div>
              ) : (
                <div className="relative">
                  <div
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer"
                    onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                  >
                    {companies.find(opt => opt.value === selectedCompanyOption)?.image ? (
                      <img
                        src={companies.find(opt => opt.value === selectedCompanyOption)?.image}
                        alt="Company logo"
                        width={24}
                        height={24}
                        className="rounded"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                        {companies.find(opt => opt.value === selectedCompanyOption)?.label?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <p className="flex-1">
                      {companies.find(opt => opt.value === selectedCompanyOption)?.label || "Select Employer"}
                    </p>
                    <button
                      type="button"
                      className="p-1 rounded-lg hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>

                  {isCompanyDropdownOpen && (
                    <div className="absolute mt-2 bg-white border rounded-lg shadow-lg w-full z-10 max-h-60 overflow-y-auto">
                      {companies.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleCompanyOptionSelect(option.value)}
                        >
                          {option.image && (
                            <img
                              src={option.image}
                              alt={option.label}
                              width={24}
                              height={24}
                              className="rounded"
                            />
                          )}
                          <p>{option.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Outlet</label>
              {isLoadingOutlets ? (
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading outlets...
                </div>
              ) : (
                <div className="relative">
                  <div
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer"
                    onClick={() => setIsOutletDropdownOpen(!isOutletDropdownOpen)}
                  >
                    <img
                      src={outlets.find(opt => opt.value === selectedOutlet)?.image || `${IMAGE_BASE_URL}/static/outletImage.png`}
                      alt="Outlet logo"
                      width={24}
                      height={24}
                      className="rounded"
                    />
                    <p className="flex-1">
                      {outlets.find(opt => opt.value === selectedOutlet)?.label || "Select Outlet"}
                    </p>
                    <button
                      type="button"
                      className="p-1 rounded-lg hover:bg-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>

                  {isOutletDropdownOpen && (
                    <div className="absolute mt-2 bg-white border rounded-lg shadow-lg w-full z-10 max-h-60 overflow-y-auto">
                      {filteredOutlets.length > 0 ? filteredOutlets.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSelectedOutlet(option.value);
                            setIsOutletDropdownOpen(false);
                          }}
                        >
                          <img
                            src={option.image}
                            alt={option.label}
                            width={24}
                            height={24}
                            className="rounded"
                          />
                          <p>{option.label}</p>
                        </div>
                      )) : (
                        <div className="px-3 py-2 text-gray-500">No outlets available</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <div className="flex items-center gap-2">
                <select
                  id="day"
                  name="day"
                  value={date.day}
                  onChange={(e) => handleDateChange("day", e.target.value)}
                  className="w-20 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>

                <select
                  id="month"
                  name="month"
                  value={date.month}
                  onChange={(e) => handleDateChange("month", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                  ].map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  id="year"
                  name="year"
                  value={date.year}
                  onChange={(e) => handleDateChange("year", e.target.value)}
                  className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={2024 + i} value={2024 + i}>
                      {2024 + i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-lg">
                <input
                  type="text"
                  name="location"
                  value={location}
                  onChange={handleInputChange}
                  className="flex-1 border-none p-0 focus:outline-none"
                  required
                  placeholder="Enter location"
                />
                <button type="button" className="p-2 hover:bg-gray-100 rounded-lg">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-lg">
                <select
                  name="industry"
                  value={industry}
                  onChange={handleInputChange}
                  className="flex-1 border-none p-0 focus:outline-none"
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Retail">Retail</option>
                  <option value="Healthcare">Healthcare</option>
                </select>
                <button type="button" className="p-2 hover:bg-gray-100 rounded-lg">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shifts Info Section */}
        <div>
          <div className="pb-4 border-b mb-6">
            <div className="flex items-center gap-2 text-blue-500">
              <Rows2 className="w-5 h-5" />
              <h2 className="text-xl">Shifts Info</h2>
            </div>
          </div>

          <div className="space-y-6">
            {shifts.map((shift, index) => (
              <div key={shift.id} className="bg-white rounded-2xl border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Shift {index + 1}</h3>
                  {shifts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteShift(shift.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start time</label>
                    <div className="flex items-center gap-2 p-3 border rounded-xl bg-white h-12">
                      <input
                        type="text"
                        value={shift.startTime.hours}
                        onChange={(e) => updateTime(shift.id, "startTime", "hours", e.target.value)}
                        className="w-12 text-center focus:outline-none"
                        maxLength={2}
                      />
                      <span>:</span>
                      <input
                        type="text"
                        value={shift.startTime.minutes}
                        onChange={(e) => updateTime(shift.id, "startTime", "minutes", e.target.value)}
                        className="w-12 text-center focus:outline-none"
                        maxLength={2}
                      />
                      <select
                        className="ml-6 bg-blue-50 rounded-lg px-2 py-1 focus:outline-none text-sm"
                        value={shift.startTime.period}
                        onChange={(e) => updateTime(shift.id, "startTime", "period", e.target.value)}
                      >
                        <option>AM</option>
                        <option>PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">End time</label>
                    <div className="flex items-center gap-2 p-3 border rounded-xl bg-white h-12">
                      <input
                        type="text"
                        value={shift.endTime.hours}
                        onChange={(e) => updateTime(shift.id, "endTime", "hours", e.target.value)}
                        className="w-12 text-center focus:outline-none"
                        maxLength={2}
                      />
                      <span>:</span>
                      <input
                        type="text"
                        value={shift.endTime.minutes}
                        onChange={(e) => updateTime(shift.id, "endTime", "minutes", e.target.value)}
                        className="w-12 text-center focus:outline-none"
                        maxLength={2}
                      />
                      <select
                        className="ml-6 bg-blue-50 rounded-lg px-2 py-1 focus:outline-none text-sm"
                        value={shift.endTime.period}
                        onChange={(e) => updateTime(shift.id, "endTime", "period", e.target.value)}
                      >
                        <option>AM</option>
                        <option>PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vacancy</label>
                    <div className="flex justify-between items-center gap-2 p-3 border rounded-xl bg-white h-12">
                      <button
                        type="button"
                        className="bg-blue-50 rounded-lg px-2 py-1 focus:outline-none text-sm"
                        onClick={() => updateShift(shift.id, "vacancy", Math.max(0, shift.vacancy - 1))}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={shift.vacancy}
                        onChange={(e) => updateShift(shift.id, "vacancy", Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 text-center focus:outline-none"
                      />
                      <button
                        type="button"
                        className="bg-blue-50 rounded-lg px-2 py-1 focus:outline-none text-sm"
                        onClick={() => updateShift(shift.id, "vacancy", shift.vacancy + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Standby vacancy</label>
                    <div className="flex justify-between items-center gap-2 p-3 border rounded-xl bg-white h-12">
                      <button
                        type="button"
                        className="bg-blue-50 rounded-lg px-2 py-1 focus:outline-none text-sm"
                        onClick={() => updateShift(shift.id, "standbyVacancy", Math.max(0, shift.standbyVacancy - 1))}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={shift.standbyVacancy}
                        onChange={(e) => updateShift(shift.id, "standbyVacancy", Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 text-center focus:outline-none"
                      />
                      <button
                        type="button"
                        className="bg-blue-50 rounded-lg px-2 py-1 focus:outline-none text-sm"
                        onClick={() => updateShift(shift.id, "standbyVacancy", shift.standbyVacancy + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration</label>
                    <div className="flex items-center gap-2 p-3 border rounded-xl bg-white h-12">
                      <input
                        type="text"
                        value={shift.duration}
                        onChange={(e) => updateShift(shift.id, "duration", Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full text-center focus:outline-none"
                      />
                      <span className="text-gray-500">Hrs</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Break Hours</label>
                    <div className="flex justify-between items-center gap-2 p-3 border rounded-xl bg-white h-12">
                      <button
                        type="button"
                        className="bg-blue-50 rounded-lg px-2 py-1 focus:outline-none text-sm"
                        onClick={() => updateShift(shift.id, "breakHours", Math.max(0, shift.breakHours - 1))}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        value={shift.breakHours}
                        onChange={(e) => updateShift(shift.id, "breakHours", Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-12 text-center focus:outline-none"
                      />
                      <button
                        type="button"
                        className="bg-blue-50 rounded-lg px-2 py-1 focus:outline-none text-sm"
                        onClick={() => updateShift(shift.id, "breakHours", shift.breakHours + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Break Type</label>
                    <select
                      className="w-full h-12 px-3 border rounded-xl bg-white focus:outline-none"
                      value={shift.breakType}
                      onChange={(e) => updateShift(shift.id, "breakType", e.target.value)}
                    >
                      <option>Paid</option>
                      <option>Unpaid</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rate type</label>
                    <select
                      className="w-full h-12 px-3 border rounded-xl bg-white focus:outline-none"
                      value={shift.rateType}
                      onChange={(e) => updateShift(shift.id, "rateType", e.target.value)}
                    >
                      <option>Flat rate</option>
                      <option>Hourly rate</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pay rate/Hr</label>
                    <div className="flex items-center gap-2 p-3 border rounded-xl bg-white h-12">
                      <span className="text-gray-500">$</span>
                      <input
                        type="text"
                        value={shift.payRate}
                        onChange={(e) => updateShift(shift.id, "payRate", Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full focus:outline-none"
                      />
                      <span className="text-gray-500">/Hr</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Total Wage{" "}
                      <span className="text-xs text-gray-400">
                        (Rate x Duration = Total wage)
                      </span>
                    </label>
                    <div className="flex items-center gap-2 p-3 border rounded-xl bg-white h-12">
                      <span className="text-gray-500">$</span>
                      <input
                        type="text"
                        value={shift.totalWage || 0}
                        className="w-full focus:outline-none"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addShift}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Shift
          </button>
        </div>

        {/* Requirements Section */}
        <div>
          <div className="pb-4 border-b mb-6">
            <div className="flex items-center gap-2 text-blue-500">
              <TiDocumentText className="w-5 h-5" />
              <h2 className="text-xl">Requirements</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Job Scope Description</label>
              <div className="border rounded-lg p-2">
                <textarea
                  name="jobScopeDescription"
                  value={jobScopeDescription}
                  onChange={handleInputChange}
                  className="w-full min-h-[150px] p-2 border-0 focus:ring-0 focus:outline-none"
                  placeholder="Type your job description here"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Job Requirements</label>
              <div className="border rounded-lg p-2">
                <textarea
                  name="jobRequirements"
                  value={jobRequirements}
                  onChange={handleInputChange}
                  className="w-full min-h-[150px] p-2 border-0 focus:ring-0 focus:outline-none"
                  placeholder="Type your job requirements here"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 h-16 w-64 text-xl border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 h-16 w-64 bg-blue-500 text-xl text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
