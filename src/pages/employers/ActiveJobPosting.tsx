
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Eye,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  User,
  Mail,
  Building2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { FaRegAddressCard } from "react-icons/fa6";
import { LiaFileSignatureSolid } from "react-icons/lia";
import { PiFolderSimpleUserLight } from "react-icons/pi";
import { RiTriangleFill } from "react-icons/ri";
import { axiosInstance } from "../../lib/authInstances";
import { useNavigate, useParams } from "react-router-dom";
import { GoDuplicate } from "react-icons/go";
import { IoMdInformationCircleOutline } from "react-icons/io";

type Tab = {
  id: string;
  title: string;
  value: number;
  label: string;
};

const ActiveJobPosting = () => {
  const { id } = useParams<{ id: string }>();
  const [isJobMenuOpen, setIsJobMenuOpen] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("jobs");
  interface Job {
    _id?: string;
    jobId?: string;
    jobName?: string;
    jobTitle?: string;
    titleimage?: string;
    companyimage?: string;
    address?: string;
    date?: string;
    jobDate?: string;
    availableShifts?: number;
    vacancy?: number;
    jobStatus?: string;
    status?: string;
    shifts?: Array<{
      vacancyFilled?: number;
      standbyFilled?: number;
      breakHours?: number;
      duration?: number;
      payRate?: number;
      totalWage?: number;
      rateType?: string;
    }>;
  }

  interface Outlet {
    _id?: string;
    id?: string;
    name?: string;
    address?: string;
  }

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const tabs: Tab[] = [
    {
      id: "jobs",
      title: "Active job postings",
      value: jobs.length,
      label: "postings",
    },
    {
      id: "outlets",
      title: "Number of Outlets",
      value: outlets.length,
      label: "outlets",
    },
  ];


  const navigate = useNavigate();

  const images = "https://worklah.onrender.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // API accepts both MongoDB ObjectId and EMP-xxxx format
        // The id from URL params can be either format
        // Endpoint: GET /api/admin/employers/:id
        const response = await axiosInstance.get(`/admin/employers/${id}`);

        // Check for success field according to API spec
        if (response.data?.success === false) {
          throw new Error(response.data?.message || "Failed to fetch employer data");
        }

        // API response structure: { success: true, employer: {...} }
        const employerData = response.data?.employer || response.data;

        if (!employerData) {
          throw new Error("No employer data received");
        }

        setData({ employer: employerData });
        setJobs(Array.isArray(employerData.jobs) ? employerData.jobs : []);
        setOutlets(Array.isArray(employerData.outlets) ? employerData.outlets : []);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch data. Please try again.";
        setError(errorMessage);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, activeTab]);


  const toggleJobMenu = (index: number) =>
    setIsJobMenuOpen((prev) => (prev === index ? null : index));

  const handleActionClick = (action: string, index: number) => {
    const job = jobs[index];
    if (!job) return;

    const jobId = job._id || job.jobId || String(index);

    if (action === "View") {
      // Outlets are already shown in the outlets tab
      setActiveTab("outlets");
    } else if (action === "Show Job Details") {
      navigate(`/jobs/${jobId}`);
    } else if (action === "Edit") {
      navigate(`/jobs/${jobId}/modify`);
    } else if (action === "Duplicate") {
      // Handle duplicate action
    }
    setIsJobMenuOpen(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading employer data...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.employer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">No employer data available</p>
        </div>
      </div>
    );
  }

  const employer = data.employer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/jobs/create-job', { state: { employerId: id } })}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
                title="Create New Job for this Employer"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Create Job</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Company Logo and Basic Info */}
            <div className="flex items-start gap-4">
              {employer.companyLogo ? (
                <img
                  src={`${images}${employer.companyLogo.replace(/\\/g, '/')}`}
                  alt="Company Logo"
                  className="w-20 h-20 rounded-xl object-cover border-2 border-gray-100 shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-md">
                  {employer.companyLegalName?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-2xl font-bold text-gray-900">{employer.companyLegalName}</h1>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">
                    {employer.serviceAgreement || employer.contractStatus || "N/A"}
                  </span>
                  {employer.industry && (
                    <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 text-xs font-medium rounded-full">
                      {employer.industry}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{employer.mainContactNumber || employer.companyNumber || "N/A"}</span>
                  </div>
                  {employer.emailAddress && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{employer.emailAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">HQ Address</p>
                  <p className="text-sm text-gray-900">{employer.hqAddress || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Main Contact Person</p>
                  <p className="text-sm text-gray-900">
                    {(() => {
                      // According to API documentation: contactPersonName and jobPosition
                      // Support both old format (mainContactPersons array) and new format (contactPersonName, jobPosition)
                      const contactName = employer.contactPersonName 
                        || (employer.mainContactPersons && Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
                          ? employer.mainContactPersons[0].name
                          : employer.mainContactPersonName) || "N/A";
                      const contactPosition = employer.jobPosition 
                        || (employer.mainContactPersons && Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
                          ? employer.mainContactPersons[0].position
                          : employer.mainContactPersonPosition) || "N/A";
                      
                      if (contactName === "N/A" && contactPosition === "N/A") {
                        return "N/A";
                      } else if (contactPosition === "N/A") {
                        return contactName;
                      } else {
                        return `${contactName} (${contactPosition})`;
                      }
                    })()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contact Number</p>
                  <p className="text-sm text-gray-900">
                    {employer.mainContactNumber 
                      || (employer.mainContactPersons && Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
                        ? employer.mainContactPersons[0].number
                        : employer.mainContactPersonNumber) || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaRegAddressCard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Employer ID</p>
                  <p className="text-sm font-mono text-gray-900">
                    {employer.employerId ? `#${employer.employerId.split("-")[1] || employer.employerId.slice(-4)}` : (employer._id ? `#${employer._id.slice(-4)}` : "N/A")}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contract Start Date</p>
                  <p className="text-sm text-gray-900">
                    {employer.contractStartDate
                      ? new Date(employer.contractStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contract End Date</p>
                  <p className="text-sm text-gray-900">
                    {employer.contractExpiryDate || employer.contractEndDate
                      ? new Date(employer.contractExpiryDate || employer.contractEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <LiaFileSignatureSolid className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Service Agreement</p>
                  <p className="text-sm text-gray-900">{employer.serviceAgreement || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <PiFolderSimpleUserLight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Account Manager</p>
                  <p className="text-sm text-gray-900">{employer.accountManager || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 relative p-6 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md"
                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                }`}
              >
                <div className={`text-4xl font-bold mb-2 ${activeTab === tab.id ? "text-blue-600" : "text-gray-700"}`}>
                  {tab.value}
                </div>
                <div className={`text-sm font-medium ${activeTab === tab.id ? "text-blue-700" : "text-gray-600"}`}>
                  {tab.title}
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <RiTriangleFill className="w-6 h-6 text-blue-600" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Job Table */}
        {activeTab === "jobs" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Job Details
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Job ID
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Shifts
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vacancy
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Standby
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Wage
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {Array.isArray(jobs) && jobs.length > 0 ? jobs.map((job: Job, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {job?.titleimage && (
                            <img
                              className="w-10 h-10 rounded-lg object-cover"
                              src={job.titleimage}
                              alt={job.jobName || "Job"}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{job?.jobName || job?.jobTitle || "N/A"}</div>
                            {job?.companyimage && (
                              <img
                                className="h-4 mt-1"
                                src={job.companyimage}
                                alt="Company"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-mono text-gray-600">
                          {job?._id ? job._id.slice(-8) : "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{job?.address || "N/A"}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-sm text-gray-700">{job?.date || job?.jobDate || "N/A"}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-sm font-medium text-gray-900">{job?.availableShifts || 0}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {Array.isArray(job?.shifts) ? job.shifts.reduce((total: number, shift: any) => total + (shift.vacancyFilled || 0), 0) : 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {Array.isArray(job?.shifts) ? job.shifts.reduce((total: number, shift: any) => total + (shift.standbyFilled || 0), 0) : 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {Array.isArray(job?.shifts) ? job.shifts.reduce((total: number, shift: any) => total + (shift.duration || 0), 0) : 0} hrs
                        </div>
                        {Array.isArray(job?.shifts) && job.shifts.reduce((total: number, shift: any) => total + (shift.breakHours || 0), 0) > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            +{Array.isArray(job?.shifts) ? job.shifts.reduce((total: number, shift: any) => total + (shift.breakHours || 0), 0) : 0} breaks (unpaid)
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="text-sm text-gray-900">
                          {Array.isArray(job?.shifts) && job.shifts.length > 0 ? job.shifts[0].rateType : "N/A"}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          ${Array.isArray(job?.shifts) ? job.shifts.reduce((total: number, shift: any) => total + (shift.payRate || 0), 0) : 0}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          job?.jobStatus === "Active" || job?.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : job?.jobStatus === "Completed" || job?.status === "Completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {job?.jobStatus || job?.status || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          ${Array.isArray(job?.shifts) ? job.shifts.reduce((total: number, shift: any) => total + (shift.totalWage || 0), 0) : 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="relative inline-block">
                          <button
                            onClick={() => toggleJobMenu(index)}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            type="button"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {isJobMenuOpen === index && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                              <button
                                className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-xl"
                                onClick={() => handleActionClick("Show Job Details", index)}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => handleActionClick("Edit", index)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit Job
                              </button>
                              <button
                                className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors last:rounded-b-xl"
                                onClick={() => handleActionClick("Duplicate", index)}
                              >
                                <GoDuplicate className="w-4 h-4" />
                                Duplicate
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={11} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Building2 className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="text-gray-500 font-medium">No jobs found</p>
                          <p className="text-sm text-gray-400 mt-1">This employer hasn't posted any jobs yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Outlet Table */}
        {activeTab === "outlets" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Outlet Name
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact Person
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact Number
                    </th>
                    <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {Array.isArray(employer.outlets) && employer.outlets.length > 0 ? employer.outlets.map((outlet: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {outlet.outletImage && (
                            <img
                              className="w-10 h-10 rounded-lg object-cover"
                              src={`${images}${outlet.outletImage.replace(/\\/g, '/')}`}
                              alt={outlet.name || "Outlet"}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="text-sm font-semibold text-gray-900">
                            {outlet.name || outlet.outletName || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="max-w-xs truncate">{outlet.address || outlet.outletAddress || "N/A"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {outlet.outletType || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="text-sm text-gray-900">
                          {employer.contactPersonName 
                            || (employer.mainContactPersons && Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
                              ? employer.mainContactPersons[0].name
                              : employer.mainContactPersonName) || "N/A"}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>
                            {employer.mainContactNumber 
                              || (employer.mainContactPersons && Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
                                ? employer.mainContactPersons[0].number
                                : employer.mainContactPersonNumber) || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-sm text-gray-600">
                          Outlet details available in employer view
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Building2 className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="text-gray-500 font-medium">No outlets available</p>
                          <p className="text-sm text-gray-400 mt-1">This employer hasn't added any outlets yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveJobPosting;
