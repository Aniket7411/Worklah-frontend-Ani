import {
  Ban,
  Briefcase,
  CalendarDays,
  Clock,
  Edit,
  Eye,
  Filter,
  PhoneCall,
  Plus,
  Trash2,
} from "lucide-react";
import ConfirmationModal from "../components/ConfirmationModal";
import toast from "react-hot-toast";
import React, { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import DatePicker from "react-datepicker";
import { FaCaretDown } from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { axiosInstance } from "../lib/authInstances";
import JobFilter from "../components/Filter/JobFilter";
import { convertIdToFourDigits, formatDate } from "../lib/utils";
import UpcomingDeploymentTable from "./UpcomingDeploymentTable";
import { useAuth } from "../context/AuthContext";




interface Employer {
  id: string;
  name: string;
  outlets?: Array<{
    id: string;
    name: string;
    isChecked?: boolean;
    [key: string]: any;
  }>;
  isChecked?: boolean;
  [key: string]: any;
}

const JobManagement = () => {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter") ?? "";
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const tabs = ["All Jobs", "Active", "Suspended", "Completed"];

  // Get page title based on filter
  const getPageTitle = () => {
    switch (filter) {
      case "active":
        return "Active Jobs";
      case "headcount-fulfillment":
        return "Current Headcount Fulfilment";
      default:
        return "Jobs";
    }
  };


  const [queryParams, setQueryParams] = useState<{
    search: string;
    status: string;
    statuses: string[];
    location: string;
    page: number;
    limit: number;
    sortOrder: string;
    startDate?: string;
    endDate?: string;
    date?: string;
    rateType?: string;
    postedBy?: string;
  }>({
    search: "",
    status: "",
    statuses: [] as string[],
    location: "",
    page: 1,
    limit: 5,
    sortOrder: "desc",
    // ✅ Removed hardcoded dates - date filters are now optional
    // startDate and endDate will only be added when user explicitly selects dates
  });
  const [isPopupOpen, setIsPopupOpen] = useState<number | null>(null);
  const [jobsData, setJobsData] = useState<any[]>([]);
  const [totalData, setTotalData] = useState<any>({});
  // ✅ Initialize with dynamic date range (for UI display only, not applied by default)
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLimitPopupOpen, setIsLimitPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState("desc");
  const [selectedEmployers] = useState<Employer[]>([]);
  const [activeTab, setActiveTab] = useState("All Jobs");
  const [showUpcomingTracking, setShowUpcomingTracking] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<{ isOpen: boolean; jobId: string | number | null; jobTitle: string }>({
    isOpen: false,
    jobId: null,
    jobTitle: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);


  const options = [
    // { label: "Most Recent Required", value: "mostRecent" },
    { label: "Ascending", value: "asc" },
    { label: "Descending", value: "desc" },
  ];

  const handleSelect = (value: string) => {
    let sortOrder = value === "mostRecent" ? "desc" : value;

    setSelectedOption(value);
    setQueryParams((prev) => ({
      ...prev,
      sortOrder,
      page: 1,
    }));
    setIsOpen(false);
  };

  const getLabel = (value: string) => {
    if (value === "asc") return "Ascending";
    if (value === "desc") return "Descending";
    return "Most Recent Required";
  };

  const popupRef = useRef<HTMLDivElement>(null);

  const companyImage = "https://worklah.onrender.com";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsLimitPopupOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isLimitPopupOpen || isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLimitPopupOpen, isOpen]);

  const CustomInput = React.forwardRef(({ value, onClick, label }: any, ref: any) => (
    <div
      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-500 transition-colors text-xs sm:text-sm"
      onClick={onClick}
      ref={ref}
    >
      <CalendarDays className="text-[#048be1] w-4 h-4" />
      <span className="text-gray-700 font-normal truncate">
        {value || label}
      </span>
    </div>
  ));

  const navigate = useNavigate();

  // const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#E5FFF6] text-green-700 border border-green-200";
      case "Pending":
        return "bg-[#FFF4E8] text-[#D37700] border border-orange-200";
      case "Ongoing":
        return "bg-[#FFF4E8] text-[#D37700] border border-orange-200";
      case "Upcoming":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Cancelled":
        return "bg-[#FFF0ED] text-[#E34E30] border border-red-200";
      case "Completed":
        return "bg-[#E0F0FF] text-[#0099FF] border border-blue-200";
      case "Suspended":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "Filled":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "Expired":
        return "bg-gray-100 text-gray-600 border border-gray-300";
      case "Deactivated":
        return "bg-gray-200 text-gray-600 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-300";
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case "Active":
        return "border-l-4 border-l-green-500";
      case "Pending":
        return "border-l-4 border-l-[#D37700]";
      case "Ongoing":
        return "border-l-4 border-l-[#D37700]";
      case "Upcoming":
        return "border-l-4 border-l-orange-500";
      case "Cancelled":
        return "border-l-4 border-l-[#E34E30]";
      case "Completed":
        return "border-l-4 border-l-[#0099FF]";
      case "Suspended":
        return "border-l-4 border-l-yellow-500";
      case "Deactivated":
        return "border-l-4 border-l-gray-400";
      default:
        return "border-l-4 border-l-transparent";
    }
  };


  const fetchJobDetails = async (params: any) => {
    // Get selected employer IDs and outlet IDs
    const selectedEmployerIds: string[] = [];
    const selectedOutletIds: string[] = [];

    selectedEmployers.forEach(emp => {
      if (emp.isChecked || (emp.outlets && emp.outlets.some((o: any) => o.isChecked))) {
        selectedEmployerIds.push(emp.id);
        // Collect outlet IDs if any are selected
        if (emp.outlets) {
          emp.outlets.forEach((outlet: any) => {
            if (outlet.isChecked) {
              selectedOutletIds.push(outlet.id);
            }
          });
        }
      }
    });

    try {
      setIsLoading(true);
      setError("");

      const updatedParams: any = {
        ...params,
      };

      // Add new filter parameters
      if (params.search) updatedParams.search = params.search;
      if (params.date) updatedParams.date = params.date;
      if (params.location) updatedParams.location = params.location;
      if (params.rateType) updatedParams.rateType = params.rateType;
      if (params.postedBy) updatedParams.postedBy = params.postedBy;

      // If outlets are selected, prefer outlet filtering
      if (selectedOutletIds.length > 0) {
        // If backend supports multiple outlet IDs, send them
        if (selectedOutletIds.length === 1) {
          updatedParams.outletId = selectedOutletIds[0];
        } else {
          // For multiple outlets, use first one for now (backend may need to support multiple)
          updatedParams.outletId = selectedOutletIds[0];
        }
      } else if (selectedEmployerIds.length > 0) {
        // Use employer ID if no outlets selected
        if (selectedEmployerIds.length === 1) {
          updatedParams.employerId = selectedEmployerIds[0];
        } else {
          // For multiple employers, use first one for now (backend may need to support multiple)
          updatedParams.employerId = selectedEmployerIds[0];
        }
      }

      // Handle status filtering - if statuses array has values, use it; otherwise use single status
      if (updatedParams.statuses && updatedParams.statuses.length > 0) {
        // Send multiple statuses as comma-separated
        updatedParams.status = updatedParams.statuses.join(",");
        delete updatedParams.statuses;
      }

      // ✅ Only add date filters if they are explicitly set (not empty)
      // If startDate or endDate are in params but empty/null, remove them
      if (updatedParams.startDate === "" || updatedParams.startDate === null || updatedParams.startDate === undefined) {
        delete updatedParams.startDate;
      }
      if (updatedParams.endDate === "" || updatedParams.endDate === null || updatedParams.endDate === undefined) {
        delete updatedParams.endDate;
      }
      // Only apply date range if both dates are provided
      if (updatedParams.startDate && !updatedParams.endDate) {
        delete updatedParams.startDate;
      }
      if (updatedParams.endDate && !updatedParams.startDate) {
        delete updatedParams.endDate;
      }

      // Remove empty values
      Object.keys(updatedParams).forEach(key => {
        if (updatedParams[key] === "" || updatedParams[key] === null || updatedParams[key] === undefined || (Array.isArray(updatedParams[key]) && updatedParams[key].length === 0)) {
          delete updatedParams[key];
        }
      });

      // Convert to query string
      const queryParams = new URLSearchParams();
      Object.keys(updatedParams).forEach(key => {
        if (Array.isArray(updatedParams[key])) {
          updatedParams[key].forEach((val: any) => queryParams.append(key, val));
        } else {
          queryParams.append(key, updatedParams[key].toString());
        }
      });

      const response = await axiosInstance.get(`/admin/jobs?${queryParams.toString()}`);

      // Check for success field according to API spec
      if (response.data?.success === false) {
        throw new Error(response.data?.message || 'Failed to fetch jobs');
      }

      const jobs = response.data?.jobs || [];
      if (Array.isArray(jobs)) {
        setJobsData(jobs);
        setTotalData(response.data || {});
      } else {
        console.error('Invalid jobs data format');
        setJobsData([]);
        setTotalData({});
      }
    } catch (err: any) {
      console.error("Error fetching job details:", err);
      setError(err?.response?.data?.message || "Failed to load jobs");
      setJobsData([]);
      setTotalData({});
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setQueryParams((prev) => ({
      ...prev,
      page: pageNumber,
    }));
  };

  // Handle pagination according to API spec structure
  const pagination = totalData?.pagination || {};
  const totalPages = pagination.totalPages || Math.ceil(
    (pagination.totalItems || totalData?.totalCount || 0) / queryParams.limit
  );


  // Apply filter from URL on mount
  useEffect(() => {
    if (filter === "active") {
      setQueryParams((prev) => ({
        ...prev,
        status: "Active",
        page: 1,
      }));
      setActiveTab("Active");
    } else if (filter === "headcount-fulfillment") {
      // For headcount fulfillment, show active jobs and highlight vacancy information
      setQueryParams((prev) => ({
        ...prev,
        status: "Active",
        page: 1,
      }));
      setActiveTab("Active");
    }
  }, [filter]);

  useEffect(() => {
    fetchJobDetails(queryParams);
    setCurrentPage(queryParams.page);
  }, [queryParams, selectedEmployers]);

  // ✅ Sync date pickers with queryParams (e.g., when switching tabs)
  useEffect(() => {
    if (queryParams.startDate && queryParams.endDate) {
      setStartDate(new Date(queryParams.startDate));
      setEndDate(new Date(queryParams.endDate));
    } else {
      // Clear date pickers if no date filters in queryParams
      setStartDate(null);
      setEndDate(null);
    }
  }, [queryParams.startDate, queryParams.endDate]);

  const handlePopupToggle = (index: number) => {
    setIsPopupOpen(isPopupOpen === index ? null : index);
  };

  const handleActionClick = (action: string, id: number) => {
    if (action === "View") {
      navigate(`/jobs/${id}`);
    }
    if (action === "Modify") {
      navigate(`/jobs/${id}/modify`);
    }
    if (action === "Cancel Job") {
      axiosInstance
        .put(`/jobs/${id}`, { status: 'Cancelled' })
        .then((response) => {
          // Check for success field according to API spec
          if (response.data?.success !== false) {
            toast.success("Job cancelled successfully");
            fetchJobDetails(queryParams);
          } else {
            toast.error(response.data?.message || "Failed to cancel job");
          }
        })
        .catch((error: any) => {
          console.error("Error cancelling job:", error);
          toast.error(error?.response?.data?.message || "Failed to cancel job. Please try again.");
        });
    }
    if (action === "Delete") {
      const job = jobsData.find(j => j.jobId === id);
      setShowDeleteModal({
        isOpen: true,
        jobId: id,
        jobTitle: job?.role || job?.jobTitle || "this job",
      });
    }
    setIsPopupOpen(null);
  };

  const handleDeleteJob = async () => {
    if (!showDeleteModal.jobId) return;

    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(`/admin/jobs/${showDeleteModal.jobId}`);

      if (response.data?.success === false) {
        toast.error(response.data?.message || "Failed to delete job");
        return;
      }

      toast.success("Job deleted successfully");
      setJobsData((prev) => prev.filter((job) => job.jobId !== showDeleteModal.jobId));
      setShowDeleteModal({ isOpen: false, jobId: null, jobTitle: "" });
      fetchJobDetails(queryParams);
    } catch (error: any) {
      console.error("Error deleting job:", error);
      toast.error(error?.response?.data?.message || "Failed to delete job. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };



  return (
    <div className="w-full max-w-full font-sans">
      {/* Jobs Section */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-[36px] font-[500] text-[#1F2937]">{getPageTitle()}</h1>

          <div className="flex flex-wrap items-center gap-3 md:gap-6 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 sm:flex-initial">
              <div className="flex-1 sm:flex-initial">
                <label className="block text-xs sm:text-[14px] leading-[20px] font-medium text-[#636363] mb-1">
                  Start Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="d MMM, yyyy"
                  customInput={<CustomInput label="Start Date" />}
                />
              </div>
              <div className="flex-1 sm:flex-initial">
                <label className="block text-xs sm:text-[14px] leading-[20px] font-medium text-[#636363] mb-1">
                  End Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  dateFormat="d MMM, yyyy"
                  customInput={<CustomInput label="End Date" />}
                />
              </div>
            </div>
            <button
              onClick={() => {
                // ✅ Only apply date filters if both dates are selected
                if (startDate && endDate) {
                  const formattedStart = startDate.toISOString().split("T")[0];
                  const formattedEnd = endDate.toISOString().split("T")[0];

                  setQueryParams((prev) => ({
                    ...prev,
                    startDate: formattedStart,
                    endDate: formattedEnd,
                    page: 1,
                  }));
                } else {
                  // ✅ Clear date filters if dates are not selected
                  setQueryParams((prev) => {
                    const newParams = { ...prev, page: 1 };
                    delete newParams.startDate;
                    delete newParams.endDate;
                    return newParams;
                  });
                }
              }}
              disabled={!startDate || !endDate}
              className="btn-primary text-xs sm:text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Filter
            </button>
            {/* ✅ Add Clear Filter button when dates are set */}
            {(queryParams.startDate || queryParams.endDate) && (
              <button
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                  setQueryParams((prev) => {
                    const newParams = { ...prev, page: 1 };
                    delete newParams.startDate;
                    delete newParams.endDate;
                    return newParams;
                  });
                }}
                className="btn-secondary text-xs sm:text-sm whitespace-nowrap"
              >
                Clear Dates
              </button>
            )}

            {isAdmin && (
              <Link to="/jobs/create-job">
                <button className="p-3 sm:p-[14px] rounded-full shadow-md bg-white hover:bg-gray-50 transition-all duration-200 border border-gray-200">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </Link>
            )}
            <div className="relative">
              <button
                className="p-3 sm:p-[14px] rounded-full shadow-md bg-dark hover:bg-slate-800 transition-all duration-200"
                onClick={() => setIsLimitPopupOpen(!isLimitPopupOpen)}
              >
                <Filter
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  color="#FFFFFF"
                  fill="#ffffff"
                />
              </button>

              {isLimitPopupOpen && (
                <div
                  ref={popupRef}
                  className="absolute right-0 top-full mt-2 bg-white border rounded-xl shadow-xl z-50 min-w-[280px]"
                >
                  <JobFilter
                    onApplyFilter={(newFilters) => {
                      setQueryParams((prev) => ({
                        ...prev,
                        status: "", // Clear single status when using filter
                        statuses: newFilters.status || [], // Use array of statuses from filter
                        location: newFilters.location || newFilters.city?.[0] || "",
                        search: newFilters.search || "",
                        date: newFilters.date || "",
                        rateType: newFilters.rateType || "",
                        postedBy: newFilters.postedBy || "",
                        page: 1,
                      }));
                      setActiveTab("All Jobs"); // Reset tab when filter is applied
                      setIsLimitPopupOpen(false); // Close the filter popup
                    }}
                    onClose={() => setIsLimitPopupOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          {/* Active & Upcoming Jobs */}
          <div className="bg-white rounded-lg p-4 lg:p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex flex-col items-center text-center">
              {/* <div className="mb-1.5 lg:mb-2">
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-green-50 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div> */}
              <h2 className="text-2xl lg:text-3xl xl:text-[32px] font-semibold text-[#049609] mb-1 leading-tight">
                {(totalData?.totalActiveJobs || 0) + (totalData?.totalUpcomingJobs || 0)}
              </h2>
              <p className="text-[11px] lg:text-xs font-medium text-gray-600 leading-tight">
                Active & Upcoming Jobs
              </p>
            </div>
          </div>

          {/* Completed Jobs */}
          <div className="bg-white rounded-lg p-4 lg:p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex flex-col items-center text-center">
              {/* <div className="mb-1.5 lg:mb-2">
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-orange-50 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 lg:w-6 lg:h-6 text-[#e39127]" />
                </div>
              </div> */}
              <h2 className="text-2xl lg:text-3xl xl:text-[32px] font-semibold text-[#e39127] mb-1 leading-tight">
                {totalData?.totalCompletedJobs || 0}
              </h2>
              <p className="text-[11px] lg:text-xs font-medium text-gray-600 leading-tight">
                Completed Jobs
              </p>
            </div>
          </div>

          {/* Cancelled Jobs */}
          <div className="bg-white rounded-lg p-4 lg:p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex flex-col items-center text-center">
              {/* <div className="mb-1.5 lg:mb-2">
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-red-50 flex items-center justify-center">
                  <Ban className="w-5 h-5 lg:w-6 lg:h-6 text-[#fd5426]" />
                </div>
              </div> */}
              <h2 className="text-2xl lg:text-3xl xl:text-[32px] font-semibold text-[#fd5426] mb-1 leading-tight">
                {totalData?.totalCancelledJobs || 0}
              </h2>
              <p className="text-[11px] lg:text-xs font-medium text-gray-600 leading-tight">
                Cancelled Jobs
              </p>
            </div>
          </div>

          {/* Current Fulfilment Rate */}
          <div className="bg-white rounded-lg p-4 lg:p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex flex-col items-center text-center">
              {/* <div className="mb-1.5 lg:mb-2">
                <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-blue-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-[#0099ff]" />
                </div>
              </div> */}
              <h2 className="text-2xl lg:text-3xl xl:text-[32px] font-semibold text-[#0099ff] mb-1 leading-tight">
                {typeof totalData?.currentFulfilmentRate === 'number'
                  ? `${totalData.currentFulfilmentRate.toFixed(1)}%`
                  : totalData?.currentFulfilmentRate
                    ? `${parseFloat(totalData.currentFulfilmentRate).toFixed(1)}%`
                    : '0%'}
              </h2>
              <p className="text-[11px] lg:text-xs font-medium text-gray-600 leading-tight">
                Current Fulfilment Rate
              </p>
            </div>
          </div>
        </div>


        {/*Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 py-3">
          <div className="relative inline-block text-left" ref={sortDropdownRef}>
            <div
              className="flex items-center gap-2 bg-white text-black border border-gray-300 px-3 py-2 rounded-lg cursor-pointer hover:border-gray-400 transition-colors text-sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              <p className="whitespace-nowrap">{getLabel(selectedOption)}</p>
              <FaCaretDown className="w-3 h-3" />
            </div>

            {isOpen && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                <ul className="py-1">
                  {options.map((option, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors text-sm"
                      onClick={() => handleSelect(option.value)}
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* <div className="flex items-center gap-4 bg-white text-black border border-black px-4 py-2 rounded-xl cursor-pointer">
            <p>All</p>
            <FaCaretDown />
          </div> */}
        </div>



        {/*Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                let newStatus = "";
                let newStatuses: string[] = [];
                let dateParams: any = {};

                if (tab === "All Jobs") {
                  newStatus = "";
                  newStatuses = [];
                  // ✅ For "All Jobs", don't apply date filters - show all jobs
                  setStartDate(null);
                  setEndDate(null);
                  dateParams = {}; // No date filters - shows all jobs
                } else if (tab === "Active") {
                  newStatus = "Active";
                  newStatuses = [];
                  // Keep current date range, don't reset
                  dateParams = {};
                } else if (tab === "Suspended") {
                  newStatus = "Suspended";
                  newStatuses = [];
                  dateParams = {};
                } else if (tab === "Completed") {
                  newStatus = "Completed";
                  newStatuses = [];
                  dateParams = {};
                }

                setQueryParams((prev) => ({
                  ...prev,
                  status: newStatus,
                  statuses: newStatuses,
                  ...dateParams,
                  page: 1,
                }));
              }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>


        {/* Active Filters Indicator */}
        {(queryParams.startDate || queryParams.endDate || queryParams.status || queryParams.search || queryParams.location) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-blue-900">Active Filters:</span>
              {queryParams.startDate && queryParams.endDate && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Date: {new Date(queryParams.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(queryParams.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              )}
              {queryParams.status && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Status: {queryParams.status}
                </span>
              )}
              {queryParams.search && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Search: {queryParams.search}
                </span>
              )}
              {queryParams.location && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Location: {queryParams.location}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setQueryParams({
                  search: "",
                  status: "",
                  statuses: [],
                  location: "",
                  page: 1,
                  limit: 5,
                  sortOrder: "desc",
                });
                setActiveTab("All Jobs");
              }}
              className="text-xs text-blue-700 hover:text-blue-900 font-medium underline"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Jobs Table */}
        <div className="table-wrapper rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">

              <thead>
                <tr className="bg-gradient-to-r from-[#EDF8FF] to-[#E0F0FF]">
                  <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                    Job Title & Details
                  </th>
                  <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                    Job Date
                  </th>
                  <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                    Shifts
                  </th>
                  <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                    Shift Timings
                  </th>
                  <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap hidden lg:table-cell">
                    Shift ID
                  </th>
                  <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                    Employer
                  </th>
                  <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap hidden md:table-cell">
                    Outlet
                  </th>
                  <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap hidden lg:table-cell">
                    Breaks
                  </th>
                  <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap hidden xl:table-cell">
                    Duration
                  </th>
                  <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                    Vacancy
                  </th>
                  <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap hidden lg:table-cell">
                    Standby
                  </th>
                  <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap hidden xl:table-cell">
                    Total Wage
                  </th>
                  <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                    Status
                  </th>
                  <th className="p-3 md:p-4 text-center sticky right-0 bg-gradient-to-r from-[#EDF8FF] to-[#E0F0FF] z-10">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={14} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">Loading jobs...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={14} className="text-center py-8">
                      <div className="text-red-500 mb-2">{error}</div>
                      <button
                        onClick={() => fetchJobDetails(queryParams)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : jobsData.length > 0 ? (
                  jobsData.map((row: any, index: number) => (
                    <tr
                      key={row.jobId || row._id || index}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      {/* Job Title & ID */}
                      <td
                        className="p-4 md:p-5 text-left border-b border-gray-200 cursor-pointer hover:bg-blue-50/50 transition-colors group"
                        onClick={() => handleActionClick("View", row._id || row.jobId)}
                      >
                        <div className={`${getBorderColor(row.jobStatus || row.status)} pl-3 py-1`}>
                          <div className="font-bold text-blue-700 hover:text-blue-800 group-hover:underline text-sm sm:text-base mb-1.5 flex items-center gap-2">
                            {row.jobTitle || row.jobName || "N/A"}
                            <span className="text-xs font-normal text-gray-400">
                              {row.jobId ? `#${row.jobId.slice(-4)}` : (row._id ? `#${convertIdToFourDigits(row._id)}` : "")}
                            </span>
                          </div>
                          {row.jobRoles && (
                            <div className="text-xs text-gray-600 mb-2 font-medium">
                              {row.jobRoles}
                            </div>
                          )}
                          {/* Skills/Requirements */}
                          {row.jobRequirements && Array.isArray(row.jobRequirements) && row.jobRequirements.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {row.jobRequirements.slice(0, 2).map((skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium border border-blue-200"
                                >
                                  {skill}
                                </span>
                              ))}
                              {row.jobRequirements.length > 2 && (
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium border border-gray-200">
                                  +{row.jobRequirements.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                          {row.jobDescription && (
                            <div className="text-xs text-gray-500 mt-2 line-clamp-2">
                              {row.jobDescription.substring(0, 80)}{row.jobDescription.length > 80 ? "..." : ""}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Job Date */}
                      <td className="p-4 md:p-5 text-left border-b border-gray-200">
                        <div className="flex flex-col gap-1.5">
                          {row.jobDate ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                <CalendarDays className="w-4 h-4 text-blue-600" />
                                <div className="text-xs sm:text-sm font-semibold text-gray-900">
                                  {formatDate(row.jobDate)}
                                </div>
                              </div>
                              {row.applicationDeadline && (
                                <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-200">
                                  Deadline: {new Date(row.applicationDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              )}
                            </>
                          ) : row.date ? (
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="w-4 h-4 text-blue-600" />
                              <span className="text-xs sm:text-sm font-semibold">{formatDate(row.date)}</span>
                            </div>
                          ) : (
                            <span className="text-xs sm:text-sm text-gray-400">N/A</span>
                          )}
                        </div>
                      </td>
                      {/* Number of Shifts */}
                      <td className="p-4 md:p-5 text-left border-b border-gray-200">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full">
                          <span className="text-sm font-bold text-blue-700">
                            {row.shifts?.length || row.shiftTiming ? (row.shifts?.length || 1) : "0"}
                          </span>
                        </div>
                      </td>
                      {/* Shift Timings */}
                      <td className="p-4 md:p-5 text-left border-b border-gray-200">
                        <div className="flex flex-col gap-1.5">
                          {row.shiftTiming?.display ? (
                            <div className="bg-gradient-to-r from-[#048BE1] to-[#0066CC] px-3 py-1.5 rounded-lg font-semibold text-white text-xs shadow-sm">
                              {row.shiftTiming.display}
                            </div>
                          ) : row.shifts?.length > 0 ? (
                            <>
                              {row.shifts.slice(0, 2).map((shift: any, i: number) => (
                                <div
                                  key={i}
                                  className="bg-gradient-to-r from-[#048BE1] to-[#0066CC] px-3 py-1.5 rounded-lg font-semibold text-white text-xs shadow-sm"
                                >
                                  {shift.startTime && shift.endTime
                                    ? `${shift.startTime} - ${shift.endTime}`
                                    : shift.shiftTiming?.display || "N/A"}
                                </div>
                              ))}
                              {row.shifts.length > 2 && (
                                <span className="text-xs text-gray-500 font-medium">+{row.shifts.length - 2} more shifts</span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs sm:text-sm text-gray-400 italic">No shifts</span>
                          )}
                        </div>
                      </td>
                      {/* Shift ID */}
                      <td className="p-3 md:p-4 text-left border-b border-gray-200 text-xs sm:text-sm hidden lg:table-cell">
                        {row.shifts?.length > 0
                          ? row.shifts.map((shift: any, i: number) => (
                            <div key={i} className="mb-1">
                              {convertIdToFourDigits(shift.shiftId || shift._id || shift.id || "")}
                            </div>
                          ))
                          : "N/A"}
                      </td>

                      {/* Employer */}
                      <td className="p-4 md:p-5 text-left border-b border-gray-200">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5">
                            {row.employer?.companyLogo ? (
                              <img
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                                src={row.employer.companyLogo.startsWith("http")
                                  ? row.employer.companyLogo
                                  : `${companyImage}${row.employer.companyLogo}`}
                                alt="Company Logo"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : row.employer?.logo ? (
                              <img
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                                src={`${companyImage}${row.employer.logo}`}
                                alt="Company Logo"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-sm font-bold text-blue-700 border-2 border-blue-200 shadow-sm">
                                {row.employer?.name?.charAt(0)?.toUpperCase() ||
                                  row.employerName?.charAt(0)?.toUpperCase() ||
                                  (row.postedBy === "admin" ? "A" : "?")}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate mb-1">
                                {row.employer?.name || row.employer?.companyLegalName || row.employerName || "N/A"}
                              </div>
                              {row.postedBy && (
                                <span className={`text-xs px-2 py-0.5 rounded-full inline-block font-semibold ${row.postedBy === "admin"
                                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                                  : "bg-green-100 text-green-700 border border-green-200"
                                  }`}>
                                  {row.postedBy === "admin" ? "Admin Post" : "Employer Post"}
                                </span>
                              )}
                            </div>
                          </div>
                          {row.contactInfo && (row.contactInfo.phone !== "N/A" || row.contactInfo.email !== "N/A") && (
                            <div className="text-xs text-gray-500 space-y-0.5">
                              {row.contactInfo.phone && row.contactInfo.phone !== "N/A" && (
                                <div className="flex items-center gap-1">
                                  <PhoneCall className="w-3 h-3" />
                                  <span>{row.contactInfo.phone}</span>
                                </div>
                              )}
                              {row.contactInfo.email && row.contactInfo.email !== "N/A" && (
                                <div className="truncate">{row.contactInfo.email}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Outlet */}
                      <td className="p-4 md:p-5 text-left border-b border-gray-200 hidden md:table-cell">
                        <div className="flex flex-col gap-1.5">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900">
                            {row.outlet?.name || row.outlet?.id || "N/A"}
                          </div>
                          <div className="text-xs text-gray-600 truncate max-w-[150px] flex items-start gap-1">
                            <span className="text-gray-400">📍</span>
                            <span>{row.outlet?.address || row.outletAddress || row.locationDetails || "N/A"}</span>
                          </div>
                          {row.locationDetails && row.outlet?.address && row.outlet.address !== row.locationDetails && (
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">
                              {row.locationDetails}
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Breaks */}
                      <td className="p-4 md:p-5 text-left border-b border-gray-200 hidden lg:table-cell">
                        <div className="flex flex-col gap-1.5">
                          {row.breakDuration ? (
                            <div className="text-xs sm:text-sm font-semibold text-gray-700">
                              {parseFloat(row.breakDuration.toString()).toFixed(2)} hrs
                            </div>
                          ) : row.shifts?.length > 0 ? (
                            row.shifts.map((shift: any, i: number) => {
                              const breakParts = shift.breakIncluded?.split(" ") || [];
                              const breakType = breakParts[2] || "";

                              return (
                                <div key={i} className="font-medium">
                                  <span className="text-gray-700 text-xs sm:text-sm">{`${breakParts[0] || ""} ${breakParts[1] || ""} `}</span>
                                  <span
                                    className={`text-xs sm:text-sm ${breakType === "Paid"
                                      ? "text-green-600 font-semibold"
                                      : "text-red-600 font-semibold"
                                      }`}
                                  >
                                    {breakType}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-xs sm:text-sm text-gray-400">N/A</span>
                          )}
                        </div>
                      </td>

                      {/* Total Duration */}
                      <td className="p-4 md:p-5 text-left border-b border-gray-200 hidden xl:table-cell">
                        <div className="flex flex-col gap-1.5">
                          {row.totalWorkingHours ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <div className="text-xs sm:text-sm font-bold text-gray-900">
                                  {parseFloat(row.totalWorkingHours.toString()).toFixed(2)} hrs
                                </div>
                              </div>
                              {row.breakDuration && parseFloat(row.breakDuration.toString()) > 0 && (
                                <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                  Break: {parseFloat(row.breakDuration.toString()).toFixed(2)} hrs
                                </div>
                              )}
                            </>
                          ) : row.shifts?.[0]?.duration ? (
                            <div className="text-xs sm:text-sm font-medium">{row.shifts[0].duration}</div>
                          ) : (
                            <div className="text-xs sm:text-sm text-gray-400">N/A</div>
                          )}
                        </div>
                      </td>
                      {/* Vacancy Users */}
                      <td className="p-3 md:p-4 text-left border-b border-gray-200">
                        <div className="flex flex-col gap-1">
                          {row.currentFulfilment ? (
                            <>
                              <div className="text-xs sm:text-sm font-semibold text-gray-900">
                                {row.currentFulfilment.display || `${row.currentFulfilment.filled}/${row.currentFulfilment.total}`}
                              </div>
                              <div className="text-xs text-gray-500">
                                {row.totalPositions || row.currentFulfilment.total} positions
                              </div>
                            </>
                          ) : (
                            <div className="text-xs sm:text-sm font-medium">
                              {row.vacancyUsers || row.totalPositions || "0"}
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Standby Users */}
                      <td className="p-3 md:p-4 text-left border-b border-gray-200 text-xs sm:text-sm hidden lg:table-cell">
                        {row.standbyUsers || "0"}
                      </td>
                      {/* Total Wage */}
                      <td className="p-3 md:p-4 text-left border-b border-gray-200 hidden xl:table-cell">
                        <div className="flex flex-col gap-1">
                          {row.totalWages ? (
                            <>
                              <div className="text-xs sm:text-sm font-semibold text-green-700">
                                ${parseFloat(row.totalWages.toString()).toFixed(2)}
                              </div>
                              {row.payPerHour && (
                                <div className="text-xs text-gray-500">
                                  ${row.payPerHour}/hr
                                </div>
                              )}
                              {row.rateType && (
                                <div className="text-xs text-gray-500">
                                  {row.rateType}
                                </div>
                              )}
                            </>
                          ) : row.totalWage ? (
                            <div className="text-xs sm:text-sm font-semibold text-green-700">
                              ${parseFloat(row.totalWage.toString()).toFixed(2)}
                            </div>
                          ) : (
                            <div className="text-xs sm:text-sm text-gray-500">$0.00</div>
                          )}
                        </div>
                      </td>
                      {/* Job Status */}
                      <td className="p-3 md:p-4 text-left border-b border-gray-200">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block w-fit ${getStatusColor(
                              row.jobStatus || row.status
                            )}`}
                          >
                            {row.jobStatus || row.status || "N/A"}
                          </span>
                          {row.foodHygieneCertRequired && (
                            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full inline-block w-fit">
                              Cert Required
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="p-3 md:p-4 text-center border-b border-gray-200 sticky right-0 bg-white z-10">
                        <div className="relative">
                          <button
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            onClick={() => handlePopupToggle(index)}
                            aria-label="Actions"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-600" />
                          </button>
                          {isPopupOpen === index && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white shadow-xl border border-gray-200 rounded-lg z-20 overflow-hidden">
                              <button
                                className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors border-b border-gray-100"
                                onClick={() => handleActionClick("View", row._id || row.jobId)}
                              >
                                <Eye size={16} className="text-blue-600" /> View Details
                              </button>
                              <button
                                className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors border-b border-gray-100"
                                onClick={() => handleActionClick("Modify", row._id || row.jobId)}
                              >
                                <Edit size={16} className="text-blue-600" /> Edit Job
                              </button>
                              <button
                                className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm text-[#E34E30] hover:bg-red-50 transition-colors"
                                onClick={() =>
                                  handleActionClick("Cancel Job", row._id || row.jobId)
                                }
                              >
                                <Ban size={16} color="#E34E30" /> Cancel Job
                              </button>
                              <button
                                className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm text-[#E34E30] hover:bg-red-50 transition-colors"
                                onClick={() =>
                                  handleActionClick("Delete", row._id || row.jobId)
                                }
                              >
                                <Trash2 size={16} color="#E34E30" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={14} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Briefcase className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-gray-500 font-medium">No jobs available</div>
                        <div className="text-sm text-gray-400">
                          {queryParams.startDate || queryParams.endDate
                            ? "Try adjusting your date filters"
                            : "Create a new job posting to get started"}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* <CustomScrollbar
          scrollContainerRef={scrollContainerRef}
          totalSteps={3}
        /> */}
        {/* Pagination */}
        <div className="flex flex-wrap justify-center items-center gap-2 mt-6 pb-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            ← Prev
          </button>

          {/* Dynamic page buttons */}
          <div className="flex flex-wrap gap-1">
            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${pageNumber === currentPage
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-2 py-2 text-gray-500">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${totalPages === currentPage
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Next →
          </button>
        </div>
        <div className="flex justify-center items-center mt-10 mb-2">
          <h2 className="text-xl font-semibold">Upcoming Deployment Tracking</h2>
          <button
            onClick={() => setShowUpcomingTracking((prev) => !prev)}
            className="px-4 py-2 ml-10 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showUpcomingTracking ? "Hide" : "Show"}
          </button>
        </div>

        {showUpcomingTracking && (
          <div className="mt-4">
            <UpcomingDeploymentTable />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal.isOpen}
        onClose={() => setShowDeleteModal({ isOpen: false, jobId: null, jobTitle: "" })}
        onConfirm={handleDeleteJob}
        title="Delete Job"
        message={`Are you sure you want to delete "${showDeleteModal.jobTitle}"? This action cannot be undone and will permanently remove the job posting and all associated data.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default JobManagement;
