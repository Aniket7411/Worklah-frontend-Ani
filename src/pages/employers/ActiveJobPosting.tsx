
import React, { act, useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  Ban,
  Calendar,
  ChevronDown,
  ChevronsDownUp,
  CircleOff,
  Edit,
  Eye,
  Hand,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Settings,
  Trash2,
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
const outlets = [
  {
    outletName: "/assets/dominos-logo.png",
    location: "123 Orchard Road, Singapore.",
    activejobs: "2",
    contact: "+61 6534532242",
    operatinghours: "9AM-9PM",
    workerfeedback: "4.2/5",
  },
];


const ActiveJobPosting = () => {
  const { id } = useParams<{ id: string }>();
  const [isJobMenuOpen, setIsJobMenuOpen] = useState<number | null>(null);
  const [isLimitPopupOpen, setIsLimitPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>("jobs");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState([]);
  const [outlets, setOutlets] = useState([]);

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
        const response = await axiosInstance.get(`/employers/${id}`);
        setData(response?.data);
        setJobs(response?.data?.jobs || []);
        setOutlets(response.data.employer.outlets || []);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, activeTab]); // Added `id` dependency

  // Close the popup when clicking outside
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
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLimitPopupOpen]);

  const toggleJobMenu = (index: number) =>
    setIsJobMenuOpen((prev) => (prev === index ? null : index));

  const handleActionClick = (action: string, id: number) => {
    if (action === "View") {
      navigate(`/employers/${id}/outletDetails`);
    }
    if (action === "Show Job Details") {
      navigate(`/jobs/${id}`);
    }
    setIsJobMenuOpen(null);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!data || !data.employer) return <p>No data available</p>;

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
                onClick={() => setIsLimitPopupOpen(!isLimitPopupOpen)}
                className="p-[14px] rounded-[26px] shadow-lg bg-[#FFFFFF] hover:bg-gray-50"
              >
                <Settings className="w-[24px] h-[24px]" />
              </button>

              {/* Set Job Posting Limit Popup */}
              {isLimitPopupOpen && (
                <div
                  ref={popupRef}
                  className="absolute right-[16%] top-[12%] mt-2 w-52 bg-white border rounded-[20px] shadow-lg p-3"
                >
                  {/* Header */}
                  <div className="flex items-center mb-3 gap-2">
                    <ChevronsDownUp className="w-4 h-4" />
                    <h2 className="text-[16px] font-semibold text-gray-800">
                      Set Job Posting Limit
                    </h2>
                  </div>

                  {/* Limit Selector */}
                  <div className="flex items-center justify-between mb-4 border-b border-[#EBEBEB] py-3">
                    <button className="px-2 py-1 text-sm font-semibold bg-black text-white rounded-full hover:bg-gray-700">
                      -10
                    </button>
                    <span className="w-12 text-center border border-gray-300 rounded-md text-sm py-1">
                      50
                    </span>
                    <button className="px-2 py-1 text-sm font-semibold bg-black text-white rounded-full hover:bg-gray-700">
                      +10
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button className="w-full text-[#E34E30] rounded-md flex items-center gap-2 text-sm border-b border-[#EBEBEB] py-3">
                      <Hand /> <span> Restrict</span>
                    </button>
                    <button className="w-full text-[#E34E30] rounded-md flex items-center gap-2 text-sm border-b border-[#EBEBEB] py-3">
                      <CircleOff /> <span> Block</span>
                    </button>
                    <button className="w-full text-[#E34E30] rounded-md flex items-center gap-2 text-sm py-3">
                      <Trash2 /> <span> Remove</span>
                    </button>
                  </div>
                </div>
              )}

              <button className="p-[14px] rounded-[26px] shadow-lg bg-[#FFFFFF] hover:bg-gray-50 ">
                <Plus className="w-[24px] h-[24px]" />
              </button>
            </div>
          </div>
        </div>
        <div>
          {/* Company Info */}
          <div className="flex">
            <img
              src={`${images}${employer.companyLogo}`}
              alt="Company Logo"
              className="w-28 h-28 rounded-lg"
            />
            <div className="ml-4 h-28 flex flex-col justify-between">
              <h1 className="text-lg flex items-center gap-2 font-semibold">
                <span>{employer.companyLegalName}</span>{" "}
                <span className="px-6  py-1 bg-[#CEFFCF] text-[#049609] text-sm font-medium rounded-full mt-1">
                  {employer.contractStatus}
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
                    {employer.companyNumber}
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
                {/* John Snow
                <i className="font-normal">
                  {"("}Manager{")"}
                </i> */}
                {employer.mainContactPersonName}
                <i className="font-normal">
                  {"("}
                  {employer.mainContactPersonPosition}
                  {")"}
                </i>
              </p>
              <p className="flex gap-1 text-start items-center">
                <span className="flex gap-1 text-[#048BE1] items-center">
                  <Phone className="w-4 h-4" />
                  Main Contact Number:
                </span>{" "}
                {employer.mainContactPersonNumber}
              </p>
              <p className="flex gap-1 text-start items-center">
                <span className="flex gap-1 text-[#048BE1] items-center">
                  <FaRegAddressCard className="w-4 h-4" />
                  Employee ID:
                </span>{" "}
                #3432
              </p>
            </div>
            <div className="text-md flex flex-col font-medium justify-start gap-2">
              <p className="flex gap-1 text-start items-center">
                <span className="flex gap-1 text-[#048BE1] items-center">
                  <Calendar className="w-4 h-4" />
                  Contact Start Date:
                </span>{" "}
                {
                  new Date(employer.contractStartDate)
                    .toISOString()
                    .split("T")[0]
                }
                {/* {employer.contractStartDate} */}
              </p>
              <p className="flex gap-1 text-start items-center">
                <span className="flex gap-1 text-[#048BE1] items-center">
                  <Calendar className="w-4 h-4" />
                  Contract End Date:
                </span>{" "}
                {new Date(employer.contractEndDate).toISOString().split("T")[0]}
                {/* {employer.contractEndDate} */}
              </p>
              <p className="flex gap-1 text-start items-center">
                <span className="flex gap-1 text-[#048BE1] items-center">
                  <LiaFileSignatureSolid className="w-4 h-4" />
                  Service Agreement:
                </span>{" "}
                Completed
              </p>
              <p className="flex gap-1 text-start items-center">
                <span className="flex gap-1 text-[#048BE1] items-center">
                  <PiFolderSimpleUserLight className="w-4 h-4" />
                  Account Manager:
                </span>{" "}
                {employer.accountManager}
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
              {jobs.map((job, index) => (
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
                    {job?.shifts.reduce((total, shift) => total + shift.vacancyFilled, 0)}
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-medium">
                    {job?.shifts.reduce((total, shift) => total + shift.standbyFilled, 0)}
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-medium">
                    {job?.shifts.reduce((total, shift) => total + shift.breakHours, 0)}
                    <br />
                    <span className="text-[16px] leading-[20px] font-medium text-[#676767]">
                      (Unpaid)
                    </span>
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-medium">
                    {job?.shifts.reduce((total, shift) => total + shift.duration, 0)}

                  </td>
                  <td className="py-3 px-4 text-center text-[16px] leading-[20px] font-normal">
                    {job?.vacancy}
                    <br />
                    <span className="text-blue-500 bg-[#FFF1E3] px-3 py-1 rounded-full mt-1">
                      Standby:{job?.shifts.reduce((total, shift) => shift.rateType, 0)}

                    </span>
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-normal">
                    {job?.shifts.reduce((total, shift) => total + shift.payRate, 0)}
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-normal">
                    {job?.jobStatus}
                  </td>
                  <td className="py-6 px-8 truncate text-center text-[16px] leading-[20px] font-semibold">
                    {job?.shifts.reduce((total, shift) => total + shift.totalWage, 0)}
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
              ))}
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
              {employer.outlets?.map((outlet, index) => (
                <tr key={index} className="text-sm border-b-2">
                  <td className="py-6 px-8 truncate text-center flex gap-3">
                    <div>
                      <img
                        className="h-5"
                        // src={outlet.outletImage}
                        src={`${images}${outlet.outletImage}`}
                        alt={outlet.outletImage}
                      />
                    </div>
                    <div>{outlet.outletName}</div>
                  </td>
                  <td className="py-6 px-8 truncate text-center">
                    {outlet.outletAddress}
                  </td>
                  <td className="py-6 px-8 truncate text-center">
                    {outlet.outletType}
                  </td>
                  <td className="py-6 px-8 truncate text-center">
                    {employer.mainContactPersonName}
                  </td>
                  <td className="py-6 px-8 truncate text-center">
                    {employer.mainContactPersonNumber}
                  </td>
                  <td className="py-6 px-8 truncate text-center">
                    {employer.mainContactPersonPosition}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActiveJobPosting;
