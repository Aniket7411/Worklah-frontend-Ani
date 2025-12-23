
import { useEffect, useRef, useState } from "react";

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
        const response = await axiosInstance.get(`/employers/${id}`);

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
      navigate(`/employers/${id}/outletDetails`);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading employer data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
    <div className="p-6 min-h-screen font-sans">
      {/* Header Section */}
      <div className="p-4">
        <div className="flex pb-3 justify-between items-center">
          <div>
            <button
              className="p-[14px] rounded-[26px] shadow-lg bg-[#FFFFFF] hover:bg-gray-50 "
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-[24px] h-[24px]" />
            </button>
          </div>
          <div>
            <div className="flex items-center justify-end gap-4">
              <button 
                onClick={() => navigate('/jobs/create-job', { state: { employerId: id } })}
                className="p-[14px] rounded-[26px] shadow-lg bg-[#FFFFFF] hover:bg-gray-50 "
                title="Create New Job for this Employer"
              >
                <Plus className="w-[24px] h-[24px]" />
              </button>
            </div>
          </div>
        </div>
        <div>
          {/* Company Info */}
          <div className="flex">
            {employer.companyLogo ? (
              <img
                src={`${images}${employer.companyLogo.replace(/\\/g, '/')}`}
                alt="Company Logo"
                className="w-28 h-28 rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-28 h-28 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-2xl font-semibold text-blue-700">
                {employer.companyLegalName?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div className="ml-4 h-28 flex flex-col justify-between">
              <h1 className="text-lg flex items-center gap-2 font-semibold">
                <span>{employer.companyLegalName}</span>{" "}
                <span className="px-6  py-1 bg-[#CEFFCF] text-[#049609] text-sm font-medium rounded-full mt-1">
                  {employer.serviceAgreement || employer.contractStatus || "N/A"}
                </span>
              </h1>
              <div>
                <span className="px-6  py-1 bg-[#FFE4DF] text-[#000000] font-medium text-sm rounded-lg mt-1">
                  {employer.industry}
                </span>
              </div>
              <div>
                <h1 className="text-lg flex items-center gap-2 font-semibold">
                  <Phone className="w-4 h-4" />

                  <span className="py-1 text-[#000] font-medium text-sm rounded-lg mt-1">
                    {employer.mainContactNumber || employer.companyNumber || "N/A"}
                  </span>
                </h1>
              </div>
            </div>
          </div>
          <div className="flex gap-12 py-4">
            <div className="text-md flex flex-col font-medium justify-start gap-2">
              <p className="flex gap-1 text-start items-center">
                <span className="flex gap-1 text-[#048BE1] items-center">
                  <MapPin className="w-4 h-4" />
                  HQ Address:
                </span>{" "}
                {employer.hqAddress}
              </p>
              <p className="flex gap-1 text-start items-center">
                <span className="flex gap-1 text-[#048BE1] items-center">
                  <User className="w-4 h-4" />
                  Main Contact Person:
                </span>{" "}
                {(() => {
                  const contactName = employer.mainContactPersons && Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
                    ? employer.mainContactPersons[0].name
                    : employer.mainContactPersonName || "N/A";
                  const contactPosition = employer.mainContactPersons && Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
                    ? employer.mainContactPersons[0].position
                    : employer.mainContactPersonPosition || employer.jobPosition || "N/A";
                  
                  if (contactName === "N/A" && contactPosition === "N/A") {
                    return "N/A";
                  } else if (contactPosition === "N/A") {
                    return contactName;
                  } else {
                    return (
                      <>
                        {contactName}
                        <i className="font-normal">
                          {" ("}{contactPosition}{")"}
                        </i>
                      </>
                    );
                  }
                })()}
              </p>
              <p className="flex gap-1 text-start items-center">
                <span className="flex gap-1 text-[#048BE1] items-center">
                  <Phone className="w-4 h-4" />
                  Main Contact Number:
                </span>{" "}
                {employer.mainContactPersons && Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
                  ? employer.mainContactPersons[0].number
                  : employer.mainContactPersonNumber || employer.mainContactNumber || "N/A"}
              </p>
              <p className="flex gap-1 text-start items-center">
                <span className="flex gap-1 text-[#048BE1] items-center">
                  <FaRegAddressCard className="w-4 h-4" />
                  Employee ID:
                </span>{" "}
                {employer.employerId ? `#${employer.employerId.split("-")[1] || employer.employerId.slice(-4)}` : (employer._id ? `#${employer._id.slice(-4)}` : "N/A")}
              </p>
            </div>
            <div className="text-md flex flex-col font-medium justify-start gap-2">
              <p className="flex gap-1 text-start items-center">
                <span className="flex gap-1 text-[#048BE1] items-center">
                  <Calendar className="w-4 h-4" />
                  Contact Start Date:
                </span>{" "}
                {employer.contractStartDate
                  ? new Date(employer.contractStartDate).toISOString().split("T")[0]
                  : "N/A"}
                {/* {employer.contractStartDate} */}
              </p>
              <p className="flex gap-1 text-start items-center">
                <span className="flex gap-1 text-[#048BE1] items-center">
                  <Calendar className="w-4 h-4" />
                  Contract End Date:
                </span>{" "}
                {employer.contractExpiryDate || employer.contractEndDate
                  ? new Date(employer.contractExpiryDate || employer.contractEndDate).toISOString().split("T")[0]
                  : "N/A"}
                {/* {employer.contractEndDate} */}
              </p>
              <p className="flex gap-1 text-start items-center">
                <span className="flex gap-1 text-[#048BE1] items-center">
                  <LiaFileSignatureSolid className="w-4 h-4" />
                  Service Agreement:
                </span>{" "}
                {employer.serviceAgreement || "N/A"}
              </p>
              <p className="flex gap-1 text-start items-center">
                <span className="flex gap-1 text-[#048BE1] items-center">
                  <PiFolderSimpleUserLight className="w-4 h-4" />
                  Account Manager:
                </span>{" "}
                {employer.accountManager || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex w-1/2 gap-4 mt-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          <div className="flex space-x-4 border-b-[14px] border-[#0099FF] rounded-b-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 relative pb-6 text-center"
              >
                <div className="text-4xl font-medium mb-2">{tab.value}</div>
                <div className="text-sm text-gray-600">{tab.title}</div>
                {activeTab === tab.id && (
                  <div className="relative flex justify-center">
                    <RiTriangleFill
                      className="w-8 h-8 absolute text-center"
                      fill="#0099FF"
                    />
                  </div>
                )}
              </button>
            ))}
            {/* <div className="absolute bottom-0 left-0 w-full h-5 bg-[#0099FF] rounded-full" /> */}
          </div>
        </div>
      </div>

      {/* Job Table */}
      {activeTab === "jobs" && (
        <div className="mt-6 p-4 overflow-x-auto ">
          <table className="w-full table-auto relative">
            <thead>
              <tr className="text-left text-sm">
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] text-[16px] leading-[20px] font-normal rounded-l-lg ">
                  Jobs
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] text-[16px] leading-[20px] font-normal">
                  Id
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] text-[16px] leading-[20px] font-normal">
                  Address
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] text-[16px] leading-[20px] font-normal">
                  Date
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] text-[16px] leading-[20px] font-normal">
                  Available Shifts
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] text-[16px] leading-[20px] font-normal">
                  Vacancy Filled
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] text-[16px] leading-[20px] font-normal">
                  Standby Filled
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] text-[16px] leading-[20px] font-normal">
                  Breaks Included
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] text-[16px] leading-[20px] font-normal">
                  Total Duration
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] text-[16px] leading-[20px] font-normal">
                  Rate Type
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] text-[16px] leading-[20px] font-normal">
                  Rate
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] text-[16px] leading-[20px] font-normal">
                  Job Status
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] text-[16px] leading-[20px] font-normal">
                  Total Wage
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] text-[16px] leading-[20px] font-normal rounded-r-lg"></th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(jobs) && jobs.length > 0 ? jobs.map((job: Job, index: number) => (
                <tr key={index} className="text-sm border-b-2 ">
                  <td className="py-6 px-8 truncate text-center text-[20px] leading-[25px] font-semibold">
                    <div>
                      <div className="flex gap-2">
                        {" "}
                        <img
                          className="h-5"
                          src={job?.titleimage}
                          alt={job?.titleimage}
                        />
                        {job?.jobName}
                      </div>
                      <img
                        className="h-5 mt-2"
                        src={job?.companyimage}
                        alt={job?.companyimage}
                      />
                    </div>
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-normal">
                    {job?._id}
                  </td>
                  <td className="py-6 px-8 truncate text-[16px] leading-[20px] font-normal">
                    {job?.address}
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-normal ">
                    {job?.date}
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-normal">
                    {job?.availableShifts}
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-medium">
                    {Array.isArray(job?.shifts) ? job.shifts.reduce((total: number, shift: any) => total + (shift.vacancyFilled || 0), 0) : 0}
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-medium">
                    {Array.isArray(job?.shifts) ? job.shifts.reduce((total: number, shift: any) => total + (shift.standbyFilled || 0), 0) : 0}
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-medium">
                    {Array.isArray(job?.shifts) ? job.shifts.reduce((total: number, shift: any) => total + (shift.breakHours || 0), 0) : 0}
                    <br />
                    <span className="text-[16px] leading-[20px] font-medium text-[#676767]">
                      (Unpaid)
                    </span>
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-medium">
                    {Array.isArray(job?.shifts) ? job.shifts.reduce((total: number, shift: any) => total + (shift.duration || 0), 0) : 0}

                  </td>
                  <td className="py-3 px-4 text-center text-[16px] leading-[20px] font-normal">
                    {job?.vacancy}
                    <br />
                    <span className="text-blue-500 bg-[#FFF1E3] px-3 py-1 rounded-full mt-1">
                      Standby:{Array.isArray(job?.shifts) && job.shifts.length > 0 ? job.shifts[0].rateType : "N/A"}

                    </span>
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-normal">
                    {Array.isArray(job?.shifts) ? job.shifts.reduce((total: number, shift: any) => total + (shift.payRate || 0), 0) : 0}
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-normal">
                    {job?.jobStatus || "N/A"}
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-semibold">
                    {Array.isArray(job?.shifts) ? job.shifts.reduce((total: number, shift: any) => total + (shift.totalWage || 0), 0) : 0}
                    {isJobMenuOpen === index && (
                      <div className="absolute top-[30%] right-12 mt-1 w-fit bg-white shadow-md border border-gray-300 rounded-md z-10">
                        <button
                          className="flex items-center gap-2 p-2 w-full text-left text-gray-700 hover:bg-gray-100"
                          onClick={() => handleActionClick("View", index)}
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          className="flex items-center gap-2 p-2 w-full text-left text-gray-700 hover:bg-gray-100"
                          onClick={() => handleActionClick("Edit", index)}
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          className="flex items-center gap-2 p-2 w-full text-left text-gray-700 hover:bg-gray-100"
                          onClick={() => handleActionClick("Duplicate", index)}
                        >
                          <GoDuplicate size={16} />
                          Duplicate
                        </button>
                        <button
                          className="flex items-center gap-2 p-2 w-full text-left text-gray-700 hover:bg-gray-100"
                          onClick={() =>
                            handleActionClick("Show Job Details", index)
                          }
                        >
                          <IoMdInformationCircleOutline size={16} />
                          Show Job Details
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="relative py-6 px-8 truncate text-center text-[16px] leading-[20px] font-normal">
                    <button
                      onClick={() => toggleJobMenu(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <MoreVertical />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-gray-500">
                    No jobs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* outlet table */}
      {activeTab === "outlets" && (
        <div className="mt-6 p-4 overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm">
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] rounded-l-lg">
                  Outlet Name
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF]">
                  Location
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF]">
                  Active Jobs
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF]">
                  Contact
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF]">
                  Operating Hours
                </th>
                <th className="py-2 px-4 truncate text-center bg-[#EDF8FF] rounded-r-lg">
                  Worker Feedback
                </th>
              </tr>
            </thead>
            <tbody>
              {/* {outlets.map((outlet, index) => (
                <tr key={index} className="text-sm border-b-2">
                  <td className="py-6 px-8 truncate text-center">
                    <div>
                      <img
                        className="h-5 mt-2"
                        src={outlet.outletName}
                        alt={outlet.outletName}
                      />
                    </div>
                  </td>
                  <td className="py-6 px-8 truncate text-center">
                    {outlet.location}
                  </td>
                  <td className="py-6 px-8 truncate">{outlet.activejobs}</td>
                  <td className="py-6 px-8 truncate text-center">
                    {outlet.contact}
                  </td>
                  <td className="py-6 px-8 truncate text-center">
                    {outlet.operatinghours}
                  </td>
                  <td className="py-6 px-8 truncate text-center">
                    {outlet.workerfeedback}
                  </td>
                </tr>
              ))} */}
              {Array.isArray(employer.outlets) && employer.outlets.length > 0 ? employer.outlets.map((outlet: any, index: number) => (
                <tr key={index} className="text-sm border-b-2">
                  <td className="py-6 px-8 truncate text-center">
                    <div className="flex items-center justify-center gap-3">
                      {outlet.outletImage ? (
                        <img
                          className="h-5"
                          src={`${images}${outlet.outletImage.replace(/\\/g, '/')}`}
                          alt={outlet.name || "Outlet"}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div>{outlet.name || outlet.outletName || "N/A"}</div>
                    </div>
                  </td>
                  <td className="py-6 px-8 truncate text-center">
                    {outlet.address || outlet.outletAddress || "N/A"}
                  </td>
                  <td className="py-6 px-8 truncate text-center">
                    {outlet.outletType || "N/A"}
                  </td>
                  <td className="py-6 px-8 truncate text-center">
                    {employer.mainContactPersons && Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
                      ? employer.mainContactPersons[0].name
                      : employer.mainContactPersonName || "N/A"}
                  </td>
                  <td className="py-6 px-8 truncate text-center">
                    {employer.mainContactPersons && Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
                      ? employer.mainContactPersons[0].number
                      : employer.mainContactPersonNumber || employer.mainContactNumber || "N/A"}
                  </td>
                  <td className="py-6 px-8 truncate text-center">
                    {employer.mainContactPersons && Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
                      ? employer.mainContactPersons[0].position
                      : employer.mainContactPersonPosition || employer.jobPosition || "N/A"}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No outlets available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActiveJobPosting;
