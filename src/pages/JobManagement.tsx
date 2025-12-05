import {
  Ban,
  CalendarDays,
  Edit,
  Eye,
  FileX2,
  Filter,
  Info,
  PhoneCall,
  Plus,
  Trash2,
  UserCheck,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import DatePicker from "react-datepicker";
import { FaCaretDown } from "react-icons/fa";
import { CustomScrollbar } from "../components/layout/CustomScrollbar";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { axiosInstance } from "../lib/authInstances";
import { BiDuplicate } from "react-icons/bi";
import JobFilter from "../components/Filter/JobFilter";
import { convertIdToFourDigits, formatDate } from "../lib/utils";
import UpcomingDeploymentTable from "./UpcomingDeploymentTable";

interface Break {
  duration: string;
  status: "paid" | "unpaid";
}

interface Time {
  startTime: string;
  endTime: string;
}

interface Shift {
  id: string;
  time: Time[];
  breaks: Break[];
}

interface JobRow {
  role: string;
  jobId: string;
  date: string;
  numberOfShifts: number;
  shifts: Shift[];
  employer: string;
  outlet: {
    name: string;
    location: string;
  };
  vacancyUsers: string;
  standbyUsers: string;
  totalWage: number;
  status: "Active" | "Upcoming" | "Cancelled" | "Completed";
}

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
  const filter = searchParams.get("filter") || "";
  const [currentPage, setCurrentPage] = useState(1);
  const tabs = ["All Jobs", "Jobs-Today", "Active", "Pending", "Cancelled", "Completed", "Deactivated"];

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

  const [queryParams, setQueryParams] = useState({
    search: "",
    status: "",
    statuses: [] as string[],
    location: "",
    page: 1,
    limit: 5,
    sortOrder: "desc",
    startDate: new Date("2024-01-01").toISOString().split("T")[0],
    endDate: new Date("2024-12-31").toISOString().split("T")[0],
  });
  const [isPopupOpen, setIsPopupOpen] = useState<number | null>(null);
  const [jobsData, setJobsData] = useState<any[]>([]);
  const [totalData, setTotalData] = useState<any>({});
  const [startDate, setStartDate] = useState(new Date("2024-01-01"));
  const [endDate, setEndDate] = useState(new Date("2024-12-31"));
  const [isLimitPopupOpen, setIsLimitPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeJobs, setActiveJobs] = useState(0);
  const [upcomingJobs, setUpcomingJobs] = useState(0);
  const [cancelledJobs, setCancelledJobs] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState("desc");
  const [selectedEmployers, setSelectedEmployers] = useState<Employer[]>([]);
  const [activeTab, setActiveTab] = useState("All Jobs");
  const [showUpcomingTracking, setShowUpcomingTracking] = useState(false);


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
        return "bg-[#E5FFF6] text-green-600";
      case "Pending":
        return "bg-[#FFF4E8] text-[#D37700]";
      case "Ongoing":
        return "bg-[#FFF4E8] text-[#D37700]";
      case "Cancelled":
        return "bg-[#FFF0ED] text-[#E34E30]";
      case "Completed":
        return "bg-[#E0F0FF] text-[#0099FF]";
      case "Deactivated":
        return "bg-gray-200 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
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
      case "Deactivated":
        return "border-l-4 border-l-gray-400";
      default:
        return "border-l-4 border-l-transparent";
    }
  };

  const getBreakColor = (status: string) => {
    return status === "Paid"
      ? "bg-[#E5FFF6] text-[#049609]"
      : "bg-[#FFF0ED] text-[#E34E30]";
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

      if (response.data?.jobs) {
        setJobsData(response.data.jobs);
        setTotalData(response.data || {});
      } else {
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

  const totalPages = Math.ceil(
    (totalData?.totalCount || 0) / queryParams.limit
  );

  const updateJobStatus = async (jobId, status) => {
    try {
      await axiosInstance.put(`/jobs/${jobId}`, { status });
      // console.log(`Job ${jobId} status updated to ${status}`);
    } catch (error) {
      console.error(`Failed to update job ${jobId} status:`, error);
    }
  };

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

  const handlePopupToggle = (index: number) => {
    setIsPopupOpen(isPopupOpen === index ? null : index);
  };

  const handleActionClick = (action: string, id: number) => {
    // alert(`Action: ${action}, Row: ${index}`);
    if (action === "View") {
      navigate(`/jobs/${id}`);
    }
    if (action === "Modify") {
      navigate(`/jobs/${id}/modify`);
    }
    if (action === "Cancel Job") {
      axiosInstance
        .put(`/admin/jobs/cancel/${id}`)
        .then(() => {
          fetchJobDetails(queryParams);
          // Assign the jobs array or an empty array
        })
        .catch((error) => {
          console.error("Error fetching job details:", error);
        });
    }
    setIsPopupOpen(null);
  };

  useEffect(() => {
    const calculateStats = () => {
      if (jobsData && jobsData.length > 0) {
        const active = jobsData.filter((job) => job.status === "Active").length;
        const upcoming = jobsData.filter(
          (job) => job.status === "Ongoing"
        ).length;

        setActiveJobs(active);
        setUpcomingJobs(upcoming);

        // Calculate average attendance rate
        const totalAttendance = jobsData.reduce(
          (acc, job) => acc + (job.attendanceRate || 0),
          0
        );
        const avgAttendance =
          jobsData.length > 0 ? totalAttendance / jobsData.length : 0;
        setAttendanceRate(avgAttendance.toFixed(2)); // Round to 2 decimal places
      }
    };

    calculateStats();
  }, [jobsData]);


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
                const formattedStart = startDate.toISOString().split("T")[0];
                const formattedEnd = endDate.toISOString().split("T")[0];

                setQueryParams((prev) => ({
                  ...prev,
                  startDate: formattedStart,
                  endDate: formattedEnd,
                  page: 1,
                }));
              }}
              className="btn-primary text-xs sm:text-sm whitespace-nowrap"
            >
              Apply Filter
            </button>

            <Link to="/jobs/create-job">
              <button className="p-3 sm:p-[14px] rounded-full shadow-md bg-white hover:bg-gray-50 transition-all duration-200 border border-gray-200">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </Link>
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
                          location: newFilters.city?.[0] || "",
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
        <div
          className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 rounded-[30px] bg-white py-12 px-4"
          style={{ boxShadow: "0px 9px 20px 9px rgba(0, 0, 0, 0.09)" }}
        >
          <div className="rounded-lg flex flex-col items-center">
            <h2 className="text-[48px] leading-[60px] font-medium text-[#049609]">
              {(totalData?.totalActiveJobs || 0) + (totalData?.totalUpcomingJobs || 0)}
            </h2>
            <p className="text-[20px] leading-[25px] font-medium text-[#4c4c4c]">
              Active & Upcoming Jobs
            </p>
          </div>
          <div className="rounded-lg flex flex-col items-center">
            <h2 className="text-[48px] leading-[60px] font-medium text-[#e39127]">
              {totalData?.totalCompletedJobs || 0}
            </h2>
            <p className="text-[20px] leading-[25px] font-medium text-[#4c4c4c]">
              Completed Jobs
            </p>
          </div>
          <div className="rounded-lg flex flex-col items-center">
            <h2 className="text-[48px] leading-[60px] font-medium text-[#fd5426]">
              {totalData?.totalCancelledJobs || 0}
            </h2>
            <p className="text-[20px] leading-[25px] font-medium text-[#4c4c4c]">
              Cancelled Jobs
            </p>
          </div>
          <div className="rounded-lg flex flex-col items-center">
            <h2 className="text-[48px] leading-[60px] font-medium text-[#0099ff]">
              {totalData?.currentFulfilmentRate || 0}%
            </h2>
            <p className="text-[20px] leading-[25px] font-medium text-[#4c4c4c]">
              Current Fulfilment Rate
            </p>
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
        <div className="flex flex-wrap justify-center gap-2 mb-4 overflow-x-auto pb-2">
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
                  // Reset to default date range
                  const defaultStart = new Date("2024-01-01");
                  const defaultEnd = new Date("2024-12-31");
                  setStartDate(defaultStart);
                  setEndDate(defaultEnd);
                  dateParams = {
                    startDate: defaultStart.toISOString().split("T")[0],
                    endDate: defaultEnd.toISOString().split("T")[0],
                  };
                } else if (tab === "Jobs-Today") {
                  newStatus = "";
                  newStatuses = [];
                  // Set date to today for "Jobs-Today" filter
                  const today = new Date();
                  const todayStr = today.toISOString().split("T")[0];
                  setStartDate(today);
                  setEndDate(today);
                  dateParams = {
                    startDate: todayStr,
                    endDate: todayStr,
                  };
                } else if (tab === "Active") {
                  newStatus = "Active";
                  newStatuses = [];
                  // Keep current date range, don't reset
                  dateParams = {};
                } else if (tab === "Pending") {
                  newStatus = "Pending";
                  newStatuses = [];
                  dateParams = {};
                } else if (tab === "Cancelled") {
                  newStatus = "Cancelled";
                  newStatuses = [];
                  dateParams = {};
                } else if (tab === "Completed") {
                  newStatus = "Completed";
                  newStatuses = [];
                  dateParams = {};
                } else if (tab === "Deactivated") {
                  newStatus = "Deactivated";
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
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>


        {/* Jobs Table */}
        <div className="table-wrapper rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full border-collapse">

            <thead>
              <tr className="bg-[#EDF8FF]">
                <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Job Roles
                </th>
                <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Job Date
                </th>
                <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Shifts
                </th>
                <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Shift Timings
                </th>
                <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden lg:table-cell">
                  Shift ID
                </th>
                <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Employer
                </th>
                <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden md:table-cell">
                  Outlet
                </th>
                <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden lg:table-cell">
                  Breaks
                </th>
                <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden xl:table-cell">
                  Duration
                </th>
                <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Vacancy
                </th>
                <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden lg:table-cell">
                  Standby
                </th>
                <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden xl:table-cell">
                  Total Wage
                </th>
                <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Status
                </th>
                <th className="p-3 md:p-4 text-center sticky right-0 bg-[#EDF8FF]">
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
                    key={row._id || index}
                    className="border-b border-gray-300"
                  >
                    {/* Job Name & ID */}
                    <td
                      className="p-3 md:p-4 text-left border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleActionClick("View", row._id)}
                    >
                      <div className={`${getBorderColor(row.jobStatus)} pl-2`}>
                        <div className="font-medium text-blue-600 hover:underline text-sm sm:text-base">
                          {row.jobName || "N/A"}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          ID: #{convertIdToFourDigits(row._id)}
                        </div>
                      </div>
                    </td>

                    {/* Job Date */}
                    <td className="p-3 md:p-4 text-left border-b border-gray-200 text-xs sm:text-sm">
                      {row.date ? formatDate(row.date) : "N/A"}
                    </td>
                    {/* Number of Shifts */}
                    <td className="p-3 md:p-4 text-left border-b border-gray-200 text-xs sm:text-sm">
                      {row.shifts?.length || "0"}
                    </td>
                    {/* Shift Timings */}
                    <td className="p-3 md:p-4 text-left border-b border-gray-200">
                      <div className="flex flex-col gap-1.5">
                        {row.shifts?.length > 0
                          ? row.shifts.slice(0, 2).map((shift, i) => (
                            <div
                              key={i}
                              className="bg-[#048BE1] px-2 py-1 rounded-full font-medium text-white text-xs"
                            >
                              {`${shift.startTime} - ${shift.endTime}`}
                            </div>
                          ))
                          : <span className="text-xs sm:text-sm text-gray-500">N/A</span>}
                        {row.shifts?.length > 2 && (
                          <span className="text-xs text-gray-500">+{row.shifts.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    {/* Shift ID */}
                    <td className="p-3 md:p-4 text-left border-b border-gray-200 text-xs sm:text-sm hidden lg:table-cell">
                      {row.shifts?.length > 0
                        ? row.shifts.map((shift, i) => (
                          <div key={i} className="mb-1">
                            {convertIdToFourDigits(shift.shiftId)}
                          </div>
                        ))
                        : "N/A"}
                    </td>

                    {/* Employer */}
                    <td className="p-3 md:p-4 text-left border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        {row.employer?.logo ? (
                          <img
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded object-cover"
                            src={`${companyImage}${row.employer.logo}`}
                            alt="Company Logo"
                          />
                        ) : (
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                            {row.employer?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="text-xs sm:text-sm truncate">{row.employer?.name || "N/A"}</span>
                      </div>
                    </td>
                    {/* Outlet */}
                    <td className="p-3 md:p-4 text-left border-b border-gray-200 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {row.outlet?.logo ? (
                          <img
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded object-cover"
                            src={`${companyImage}${row.outlet.logo}`}
                            alt="Outlet Logo"
                          />
                        ) : (
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                            {row.outlet?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div>
                          <div className="text-xs sm:text-sm font-medium">{row.outlet?.name || "N/A"}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[120px]">
                            {row.outlet?.location || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Breaks */}
                    <td className="p-3 md:p-4 text-left border-b border-gray-200 text-xs sm:text-sm hidden lg:table-cell">
                      <div className="flex flex-col gap-1.5">
                        {row.shifts?.length > 0
                          ? row.shifts.map((shift, i) => {
                            const breakParts = shift.breakIncluded?.split(" ") || [];
                            const breakType = breakParts[2] || "";

                            return (
                              <div key={i} className="font-medium">
                                <span className="text-gray-700">{`${breakParts[0] || ""} ${breakParts[1] || ""} `}</span>
                                <span
                                  className={
                                    breakType === "Paid"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {breakType}
                                </span>
                              </div>
                            );
                          })
                          : "N/A"}
                      </div>
                    </td>

                    {/* Total Duration */}
                    <td className="p-3 md:p-4 text-left border-b border-gray-200 text-xs sm:text-sm hidden xl:table-cell">
                      {row.shifts?.[0]?.duration || "N/A"}
                    </td>
                    {/* Vacancy Users */}
                    <td className="p-3 md:p-4 text-left border-b border-gray-200 text-xs sm:text-sm font-medium">
                      {row.vacancyUsers || "0"}
                    </td>
                    {/* Standby Users */}
                    <td className="p-3 md:p-4 text-left border-b border-gray-200 text-xs sm:text-sm hidden lg:table-cell">
                      {row.standbyUsers || "0"}
                    </td>
                    {/* Total Wage */}
                    <td className="p-3 md:p-4 text-left border-b border-gray-200 text-xs sm:text-sm hidden xl:table-cell">
                      ${row.totalWage || "0"}
                    </td>
                    {/* Job Status */}
                    <td className="p-3 md:p-4 text-left border-b border-gray-200">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          row.jobStatus
                        )}`}
                      >
                        {row.jobStatus || "N/A"}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="p-3 md:p-4 text-center border-b border-gray-200 sticky right-0 bg-white">
                      <div className="relative">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          onClick={() => handlePopupToggle(index)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {isPopupOpen === index && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white shadow-lg border border-gray-200 rounded-lg z-20">
                            <button
                              className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => handleActionClick("View", row._id)}
                            >
                              <Eye size={16} /> View
                            </button>
                            <button
                              className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => handleActionClick("Modify", row._id)}
                            >
                              <Edit size={16} /> Modify
                            </button>
                            <button
                              className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-[#E34E30] hover:bg-red-50 transition-colors"
                              onClick={() =>
                                handleActionClick("Cancel Job", row._id)
                              }
                            >
                              <Ban size={16} color="#E34E30" /> Cancel Job
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="14" className="text-center py-4">
                    No jobs available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                  className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    pageNumber === currentPage
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
                  className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    totalPages === currentPage
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
    </div>
  );
};

export default JobManagement;
