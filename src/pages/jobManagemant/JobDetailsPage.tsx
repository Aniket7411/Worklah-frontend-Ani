import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Briefcase,
  CalendarDays,
  Clock,
  Edit,
  FileX2,
  MapPin,
  Minus,
  MoreVertical,
  PhoneCall,
  Plus,
  Settings,
  UserCheck,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CustomScrollbar } from "../../components/layout/CustomScrollbar";
import { RiFocus3Line } from "react-icons/ri";
import { AiOutlineFileDone } from "react-icons/ai";
import { FiEdit3 } from "react-icons/fi";
import { axiosInstance } from "../../lib/authInstances";
import { convertIdToFourDigits, formatDate } from "../../lib/utils";
import OutletFilter from "../../components/Filter/OutletFilter";

const JobDetailsPage = () => {
  const companyImage = "https://worklah.onrender.com";
  const [maxStandby, setMaxStandby] = useState<number>(1);
  const [maxVacancy, setMaxVacancy] = useState<number>(3);
  const [isPopupOpen, setIsPopupOpen] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [jobsData, setJobsData] = useState<any>({});
  const [shifts, setShifts] = useState<any[]>([]);
  const [isLimitPopupOpen, setIsLimitPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [outlet, setOutet] = useState(null);
  const [penalties, setPenalties] = useState<Array<{ condition: string; penalty: string }>>([]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsLimitPopupOpen(false);
      }
    };

    if (isLimitPopupOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isLimitPopupOpen]);

  const { jobId } = useParams();

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/jobs/${jobId}`);

      // Check for success field according to API spec
      if (response?.data?.success === false) {
        setError(response.data?.message || "Failed to fetch job details");
        return;
      }

      if (response?.data?.success !== false) {
        const job = response?.data?.job || response?.data;
        const outletId = job?.outlet?._id || job?.outlet?.id || job?.outletId;
        if (outletId) {
          setOutet(outletId);
        }
        setJobsData(job);
        // Handle both old and new API structures
        setShifts(job?.shifts || (job?.shiftTiming ? [job] : []));
        // Set dynamic max values from job data
        setMaxStandby(job?.maxStandby ?? job?.standbyLimit ?? 1);
        setMaxVacancy(job?.maxVacancy ?? job?.vacancyLimit ?? job?.totalPositions ?? 3);
      }
    } catch (error: any) {
      console.error("Error fetching job details:", error);
      setError(error?.response?.data?.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    // Fetch penalties from API or use job-specific penalties
    const fetchPenalties = async () => {
      try {
        // Try to fetch penalties from job data first
        if (jobsData?.penalties && Array.isArray(jobsData.penalties)) {
          setPenalties(jobsData.penalties);
          return;
        }
        
        // Try to fetch default penalties from API
        const response = await axiosInstance.get("/admin/penalties").catch(() => null);
        if (response?.data?.penalties) {
          setPenalties(response.data.penalties);
          return;
        }
        
        // Fallback to empty array if no penalties found
        setPenalties([]);
      } catch (error) {
        console.error("Error fetching penalties:", error);
        setPenalties([]);
      }
    };

    if (jobsData?._id || jobsData?.id) {
      fetchPenalties();
    }
  }, [jobsData]);

  const handleIncrease = (id, key, maxValue) => {
    setShifts((prevShifts) =>
      prevShifts.map((shift) =>
        shift.id === id
          ? { ...shift, [key]: Math.min(shift[key] + 1, maxValue) }
          : shift
      )
    );
  };

  const handleDecrease = (id, key) => {
    setShifts((prevShifts) =>
      prevShifts.map((shift) =>
        shift.id === id
          ? { ...shift, [key]: Math.max(shift[key] - 1, 0) }
          : shift
      )
    );
  };
  const handlePopupToggle = (index: number) => {
    setIsPopupOpen(isPopupOpen === index ? null : index);
  };

  const handleActionClick = (action: string, id: number) => {
    // alert(`Action: ${action}, Row: ${index}`);
    if (action === "Edit Shift") {
      navigate(`/jobs/${id}`);
    }
    setIsPopupOpen(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#E5FFF6] text-green-700 border border-green-200";
      case "Ongoing":
        return "bg-[#FFF4E8] text-[#D37700] border border-orange-200";
      case "Upcoming":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Pending":
        return "bg-[#FFF4E8] text-[#D37700] border border-orange-200";
      case "Cancelled":
        return "bg-[#FFF0ED] text-[#E34E30] border border-red-200";
      case "Completed":
        return "bg-[#E0F0FF] text-[#0099FF] border border-blue-200";
      case "Deactivated":
        return "bg-gray-200 text-gray-600 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-300";
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold mb-2">Error</p>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-3">
              <button 
                className="p-2 rounded-full shadow-md bg-white hover:bg-gray-50 transition-colors" 
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {jobsData.jobTitle || jobsData.jobName || "Job Details"}
                  </h1>
                  {jobsData.jobStatus && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(jobsData.jobStatus)}`}>
                      {jobsData.jobStatus}
                    </span>
                  )}
                </div>
                {jobsData.jobRoles && (
                  <p className="text-gray-600 font-medium">{jobsData.jobRoles}</p>
                )}
              </div>
            </div>

            {/* Company/Employer Info */}
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="flex-shrink-0">
                {jobsData.employer?.companyLogo ? (
                  <img
                    src={jobsData.employer.companyLogo.startsWith("http") 
                      ? jobsData.employer.companyLogo 
                      : `${companyImage}${jobsData.employer.companyLogo}`}
                    alt="Company Logo"
                    className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : jobsData.employer?.logo ? (
                  <img
                    src={jobsData.employer.logo.startsWith("http")
                      ? jobsData.employer.logo
                      : `${companyImage}${jobsData.employer.logo}`}
                    alt="Company Logo"
                    className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center text-xl font-bold text-blue-700 border-2 border-white shadow-md">
                    {jobsData.employer?.name?.charAt(0)?.toUpperCase() || 
                     jobsData.employerName?.charAt(0)?.toUpperCase() || 
                     (jobsData.postedBy === "admin" ? "A" : "?")}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <p className="text-lg font-semibold text-gray-900">
                    {jobsData.employer?.name || jobsData.employer?.companyLegalName || jobsData.employerName || "N/A"}
                  </p>
                  {jobsData.postedBy && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      jobsData.postedBy === "admin" 
                        ? "bg-blue-100 text-blue-700 border border-blue-200" 
                        : "bg-green-100 text-green-700 border border-green-200"
                    }`}>
                      {jobsData.postedBy === "admin" ? "Admin Post" : "Employer Post"}
                    </span>
                  )}
                </div>
                {jobsData.outlet?.name && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{jobsData.outlet.name}</span>
                  </div>
                )}
                {(jobsData.outlet?.address || jobsData.outletAddress || jobsData.locationDetails) && (
                  <div className="flex items-start gap-2 text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      {jobsData.outlet?.address || jobsData.outletAddress || jobsData.locationDetails}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Key Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Job ID</p>
                <p className="text-sm font-bold text-gray-900">
                  {jobsData.jobId ? `#${jobsData.jobId.slice(-4)}` : (jobsData._id ? `#${convertIdToFourDigits(jobsData._id)}` : "N/A")}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Job Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {jobsData.jobDate ? formatDate(jobsData.jobDate) : (jobsData.date ? formatDate(jobsData.date) : "N/A")}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Vacancy</p>
                <p className="text-sm font-bold text-blue-600">
                  {jobsData.currentFulfilment?.display || `${jobsData.currentFulfilment?.filled || 0}/${jobsData.currentFulfilment?.total || jobsData.totalPositions || 0}` || jobsData.vacancyUsers || "0"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Total Wage</p>
                <p className="text-sm font-bold text-green-600">
                  ${jobsData.totalWages ? parseFloat(jobsData.totalWages.toString()).toFixed(2) : (jobsData.totalWage || "0.00")}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end lg:items-start gap-4">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link to={`/jobs/${jobId}/candidates`}>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-md transition-colors">
                  <UserCheck className="w-5 h-5" />
                  View Candidates
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              {outlet && (
                <Link to={`/jobs/${outlet}/outlate-attendnce`}>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-md transition-colors">
                    <Clock className="w-5 h-5" />
                    Attendance Rate
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              )}
              <div className="relative">
                <button 
                  className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                >
                  <Settings className="w-5 h-5 text-gray-700" />
                </button>
                {isSettingsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    <ul className="py-1">
                      <li>
                        <Link to={`/jobs/${jobId}/modify`}>
                          <button className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors">
                            <Edit className="w-4 h-4 mr-2 text-blue-600" />
                            Edit Job
                          </button>
                        </Link>
                      </li>
                      <li className="border-t border-gray-100">
                        <button 
                          className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          onClick={async () => {
                            try {
                              const response = await axiosInstance.delete(`/jobs/${jobId}`);
                              if (response.data?.success === false) {
                                alert(response.data?.message || "Failed to cancel job");
                                return;
                              }
                              navigate(-1);
                            } catch (error: any) {
                              console.error("Error cancelling job:", error);
                              alert(error?.response?.data?.message || "Failed to cancel job");
                            }
                          }}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Cancel Job
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 w-full lg:w-auto lg:min-w-[200px]">
              <div className="space-y-3">
                {jobsData.totalWorkingHours && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Working Hours</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {parseFloat(jobsData.totalWorkingHours.toString()).toFixed(2)} hrs
                    </p>
                  </div>
                )}
                {jobsData.shiftTiming?.display && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Shift Timing</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {jobsData.shiftTiming.display}
                    </p>
                  </div>
                )}
                {jobsData.applicationDeadline && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Application Deadline</p>
                    <p className="text-sm font-semibold text-orange-600">
                      {new Date(jobsData.applicationDeadline).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
                {jobsData.rateType && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Rate Type</p>
                    <p className="text-sm font-semibold text-gray-900">{jobsData.rateType}</p>
                  </div>
                )}
                {jobsData.payPerHour && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Pay Rate</p>
                    <p className="text-sm font-semibold text-green-600">
                      ${parseFloat(jobsData.payPerHour.toString()).toFixed(2)}/hr
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shifts Table */}
      {shifts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#EDF8FF] to-[#E0F0FF]">
            <h2 className="text-lg font-semibold text-gray-900">Shift Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">

              <thead>
                <tr className="bg-gradient-to-r from-[#EDF8FF] to-[#E0F0FF]">
                  <th className="p-4 text-center whitespace-nowrap"></th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-800 whitespace-nowrap border-r border-gray-200">
                    Start Time
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-800 whitespace-nowrap border-x border-gray-200">
                    End Time
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-800 whitespace-nowrap border-x border-gray-200">
                    Shift ID
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-800 whitespace-nowrap border-x border-gray-200">
                    Vacancy
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-800 whitespace-nowrap border-x border-gray-200">
                    Standby
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-800 whitespace-nowrap border-x border-gray-200">
                    Duration
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-800 whitespace-nowrap border-x border-gray-200">
                    Rate Type
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-800 whitespace-nowrap border-x border-gray-200">
                    Break
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-800 whitespace-nowrap border-x border-gray-200">
                    Break Type
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-800 whitespace-nowrap border-x border-gray-200">
                    Rate/hr
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-800 whitespace-nowrap border-x border-gray-200">
                    Total Wage
                  </th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift: any, index: number) => (
                  <tr key={shift.shiftId || shift.id || index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors relative">
                    <td className="p-4 text-center border-l border-gray-200">
                      <div className="relative">
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          onClick={() => handlePopupToggle(index)}
                        >
                          <MoreVertical className="h-5 w-5 text-gray-600" />
                        </button>
                        {isPopupOpen === index && (
                          <div className="absolute left-0 top-full mt-1 w-36 bg-white shadow-xl border border-gray-200 rounded-lg z-10 overflow-hidden">
                            <button
                              className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                              onClick={() => handleActionClick("Edit Shift", shift.shiftId || shift.id || index)}
                            >
                              <Edit size={16} className="text-blue-600" />
                              Edit Shift
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center border-r border-gray-200">
                      {shift.startTime || shift.shiftTiming?.startTime ? (
                        <span className="bg-gradient-to-r from-[#048BE1] to-[#0066CC] text-white px-3 py-1.5 rounded-lg font-semibold text-sm">
                          {shift.startTime || shift.shiftTiming.startTime}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-center border-x border-gray-200">
                      {shift.endTime || shift.shiftTiming?.endTime ? (
                        <span className="bg-gradient-to-r from-[#048BE1] to-[#0066CC] text-white px-3 py-1.5 rounded-lg font-semibold text-sm">
                          {shift.endTime || shift.shiftTiming.endTime}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-center border-x border-gray-200">
                      <span className="text-sm font-medium text-gray-700">
                        {shift.shiftId ? `#${shift.shiftId.slice(-4)}` : (shift.id ? convertIdToFourDigits(shift.id.toString()) : "N/A")}
                      </span>
                    </td>
                    <td className="p-4 text-center border-x border-gray-200">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                          onClick={() => handleDecrease(shift.id || shift.shiftId, "vacancyFilled")}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold min-w-[40px]">
                          {shift.vacancy || shift.vacancyFilled || 0}/{maxVacancy}
                        </span>
                        <button
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                          onClick={() => handleIncrease(shift.id || shift.shiftId, "vacancyFilled", maxVacancy)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center border-x border-gray-200">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                          onClick={() => handleDecrease(shift.id || shift.shiftId, "standbyFilled")}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold min-w-[40px]">
                          {shift.standbyVacancy || shift.standbyFilled || 0}/{maxStandby}
                        </span>
                        <button
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                          onClick={() => handleIncrease(shift.id || shift.shiftId, "standbyFilled", maxStandby)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center border-x border-gray-200">
                      <span className="text-sm font-medium text-gray-700">
                        {shift.totalDuration || shift.totalWorkingHours ? `${parseFloat((shift.totalDuration || shift.totalWorkingHours).toString()).toFixed(2)} hrs` : "N/A"}
                      </span>
                    </td>
                    <td className="p-4 text-center border-x border-gray-200">
                      {shift.rateType ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
                          {shift.rateType}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-center border-x border-gray-200">
                      <span className="text-sm text-gray-700">
                        {shift.breakIncluded || shift.breakDuration ? `${parseFloat((shift.breakIncluded || shift.breakDuration).toString()).toFixed(2)} hrs` : "N/A"}
                      </span>
                    </td>
                    <td className="p-4 text-center border-x border-gray-200">
                      {shift.breakType ? (
                        <span className={`text-sm font-semibold ${shift.breakType === "Paid" ? "text-green-600" : "text-red-600"}`}>
                          {shift.breakType}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-center border-x border-gray-200">
                      <span className="text-sm font-semibold text-gray-700">
                        ${shift.payRate || shift.payPerHour ? parseFloat((shift.payRate || shift.payPerHour).toString()).toFixed(2) : "0.00"}
                      </span>
                    </td>
                    <td className="p-4 text-center border-x border-gray-200">
                      <span className="text-sm font-bold text-green-600">
                        ${shift.totalWage || shift.totalWages ? parseFloat((shift.totalWage || shift.totalWages).toString()).toFixed(2) : "0.00"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {shifts.length === 0 && jobsData.shiftTiming && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shift Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Shift Timing</p>
              <p className="text-lg font-bold text-blue-700">{jobsData.shiftTiming.display}</p>
            </div>
            {jobsData.totalWorkingHours && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                <p className="text-lg font-bold text-gray-900">{parseFloat(jobsData.totalWorkingHours.toString()).toFixed(2)} hrs</p>
              </div>
            )}
          </div>
        </div>
      )}


      {/* <CustomScrollbar scrollContainerRef={scrollContainerRef} totalSteps={3} /> */}

      {/* Job Description, Scope and Requirements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        {jobsData.jobDescription && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileX2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {jobsData.jobDescription}
            </p>
          </div>
        )}

        {jobsData.jobRequirements && Array.isArray(jobsData.jobRequirements) && jobsData.jobRequirements.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AiOutlineFileDone className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Job Requirements & Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {jobsData.jobRequirements.map((requirement: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg font-medium border border-blue-200"
                >
                  {requirement}
                </span>
              ))}
            </div>
          </div>
        )}

        {jobsData.requirements && Array.isArray(jobsData.requirements) && jobsData.requirements.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <RiFocus3Line className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Additional Requirements</h2>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              {jobsData.requirements.map((req: string, index: number) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Penalties Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Ban className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Shift Cancellation Penalties
          </h2>
        </div>

        <div className="space-y-3">
          {penalties.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No penalties configured for this job.
            </div>
          ) : (
            penalties.map((item, index) => {
            const penaltyValue = parseInt(
              item.penalty.replace("$", "").replace(" Penalty", "").replace("No Penalty", "0")
            );

            // Determine penalty text color
            const penaltyColor =
              penaltyValue >= 50
                ? "text-red-800 bg-red-50 border-red-200"
                : penaltyValue >= 15
                  ? "text-red-700 bg-red-50 border-red-200"
                  : penaltyValue >= 10
                    ? "text-red-600 bg-orange-50 border-orange-200"
                    : penaltyValue >= 5
                      ? "text-orange-600 bg-orange-50 border-orange-200"
                      : "text-gray-600 bg-gray-50 border-gray-200";

            return (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900">
                  {item.condition}
                </p>
                <p
                  className={`py-1.5 px-4 rounded-lg text-sm font-semibold border ${penaltyColor}`}
                >
                  {item.penalty}
                </p>
              </div>
            );
          }))
          }
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
