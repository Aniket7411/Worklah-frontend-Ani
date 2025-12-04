import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Edit,
  FileX2,
  MapPin,
  Minus,
  MoreVertical,
  Plus,
  Settings,
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

  const maxStandby = 1;
  const maxVacancy = 3;
  const [isPopupOpen, setIsPopupOpen] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  // const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [jobsData, setJobsData] = useState({});
  const [shifts, setShifts] = useState([]);
  const [isLimitPopupOpen, setIsLimitPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [outlet, setOutet] = useState(null);


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
      const response = await axiosInstance.get(`/admin/jobs/${jobId}`);

      if (response?.data?.success) {
        const job = response?.data?.job;
        const outletId = job?.outlet?._id;
        if (outletId) {
          setOutet(outletId);
        }
        setJobsData(job);
        setShifts(job?.shifts || []);
      }
    } catch (error) {
      // Error handling
    }
  };
  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const penalties = [
    { condition: "5 minutes after applying", penalty: "No Penalty" },
    { condition: "48 Hours", penalty: "No Penalty" },
    { condition: "24 Hours (1st Time)", penalty: "$5 Penalty" },
    { condition: "24 Hours (2nd Time)", penalty: "$10 Penalty" },
    { condition: "24 Hours (3rd Time)", penalty: "$15 Penalty" },
    { condition: "No Show - During Shift", penalty: "$50 Penalty" },
  ];

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
        return "bg-[#E5FFF6] text-green-600";
      case "Ongoing":
        return "bg-[#FFF4E8] text-[#D37700]";
      case "Cancelled":
        return "bg-[#FFF0ED] text-[#E34E30]";
      case "Completed":
        return "bg-[#E0F0FF] text-[#0099FF]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };


  return (
    <div className="p-6 ">
      {/* Header Section */}
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full shadow-custom bg-white" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-7 h-7 " color="#000000" />
              </button>
              <div className="flex items-center gap-3">
                <div>
                  <img
                    src="/assets/tray-logo.png"
                    alt="tray logo"
                    className="w-12 h-12 mr-4"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">{jobsData.jobName}</h1>
                    <p className={`font-medium py-1 px-2 rounded-full ${getStatusColor(jobsData.status)}`}>
                      {jobsData.status}
                    </p>
                  </div>
                  <div className="bg-[#ECF8FF] p-2 rounded-xl flex items-center gap-3">
                    <div>
                      <div className="flex items-center justify-end gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsLimitPopupOpen(!isLimitPopupOpen);
                          }}
                        >
                          <FaCaretDown className="w-7 h-7 " />


                        </button>
                        <div className="flex flex-col gap3">
                          <img
                            src="/assets/dominos-logo.svg"
                            alt="tray logo"
                            className="w-24 h-8 mr-4"
                          />
                          <p>{jobsData.location}</p>
                        </div>

                        {isLimitPopupOpen && (
                          <div
                            ref={popupRef}
                            className="absolute right-[35%] top-[12%] mt-2 bg-white border rounded-[20px] shadow-lg z-50"
                          >
                            <OutletFilter />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-left flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <p className="text-[#4C4C4C] text-[16px] leading-[20px] font-semibold">
                  Employer : {jobsData.employer?.name}
                </p>
                <div className="flex w-max gap-1 items-center align-middle">
                  {jobsData.employer?.logo ? (
                    <img
                      src={jobsData.employer.logo}
                      alt="Company Logo"
                      className="w-9 h-9 mx-auto shadow-md rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 mx-auto shadow-md rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                      {jobsData.employer?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className=" flex flex-col text-left">
                    <p>{jobsData.company?.name}</p>
                  </div>
                </div>
              </div>
              <p className="text-[#4C4C4C] text-[16px] leading-[20px] font-semibold">
                Total Vacancy Candidate:{" "}
                <span className="font-semibold text-[#000000] text-[20px] leading-[25px]">
                  {jobsData.vacancyUsers}
                </span>
              </p>
              <p className="text-[#4C4C4C] text-[16px] leading-[20px] font-semibold">
                Total Standby :{" "}
                <span className="font-semibold text-[#000000] text-[20px] leading-[25px]">
                  {jobsData.standbyUsers}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end py-4">
            <button className="p-2 rounded-full bg-white mb-4 relative">
              <Settings
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-7 h-7"
              />
            </button>
            {isSettingsOpen && (
              <div className="absolute right-24 mt-2 w-36 top-20 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                <ul className="py-2">
                  {/* Edit Candidate */}
                  <li>
                    <Link to={`/jobs/${jobId}/modify`}>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-[#000000] hover:bg-gray-100">
                        <FiEdit3 className="w-4 h-4 mr-2 text-gray-500" />
                        Modify
                      </button>
                    </Link>
                  </li>
                  <li>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-[#941F15] hover:bg-red-100">
                      <FileX2
                        className="w-4 h-4 mr-2"
                        size={16}
                        color="#E34E30"
                      />
                      Deactivate
                    </button>
                  </li>
                  {/* Block Candidate */}
                  <li>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-[#941F15] hover:bg-red-100"
                      onClick={async () => {
                        try {
                          await axiosInstance.delete(`/admin/jobs/${jobId}`);
                          navigate(-1); // Go back one page after successful cancellation
                        } catch (error) {
                          console.error("Error cancelling job:", error);
                          // Optionally, show toast or alert here
                        }
                      }}
                    >
                      <Ban className="w-4 h-4 mr-2 text-red-500" />
                      Cancel Job
                    </button>
                  </li>

                </ul>
              </div>
            )}

            <div className="text-right flex flex-col gap-4">
              <p className="text-[#4C4C4C] text-[16px] leading-[20px] font-semibold">
                Job ID:{" "}
                <span className="font-normal text-[#000000] text-[16px] leading-[20px]">
                  #{convertIdToFourDigits(jobsData.jobId)}
                </span>
              </p>
              <p className="text-[#4C4C4C] text-[16px] leading-[20px] font-semibold">
                Date:{" "}
                <span className="font-normal text-[#000000] text-[16px] leading-[20px]">
                  {jobsData.date}
                  {/* {formatDate(`${jobsData?.dates[0]}`)} */}
                </span>
              </p>
              <div className="flex flex-col ">
                <div className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 " />
                  <p className="font-normal text-[#000000] text-[16px] leading-[20px]">
                    {jobsData.shortAddress}
                  </p>
                </div>
                {/* <p className="text-[12px] text-[#0099FF] leading-[18px] font-normal underline">
                  View on map
                </p> */}
              </div>
            </div>
            <div className="mt-4 flex gap-4">
              <Link to={`/jobs/${jobId}/candidates`}>
                <button className="bg-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                  View Candidates
                  <ArrowRight className="w-7 h-7" />
                </button>
              </Link>
              <Link to={`/jobs/${outlet}/outlate-attendnce`}>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                  Outlet Attendance Rate
                  <ArrowRight className="w-7 h-7" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Shifts Table */}
      {/* <div
        className="w-full overflow-x-auto no-scrollbar pt-8 pb-4"
        ref={scrollContainerRef}
      >
        <table className="table-auto w-full border-collapse relative"> */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse relative">

          <thead className="p-4">
            <tr className="bg-[#EDF8FF]">
              <th className="p-4 text-center whitespace-nowrap rounded-l-full "></th>
              <th className="p-4 text-center text-[16px] leading-[20px] truncate font-medium text-[#4C4C4C] border-r border-[#C6C6C6] whitespace-nowrap ">
                Shift Start Time
              </th>
              <th className="p-4 text-center text-[16px] leading-[20px] truncate font-medium text-[#4C4C4C] border-x border-[#C6C6C6] whitespace-nowrap">
                Shift End time
              </th>
              <th className="p-4 text-center text-[16px] leading-[20px] truncate font-medium text-[#4C4C4C] border-x border-[#C6C6C6] whitespace-nowrap">
                Shift ID
              </th>
              <th className="p-4 text-center text-[16px] leading-[20px] truncate font-medium text-[#4C4C4C] border-x border-[#C6C6C6] whitespace-nowrap">
                Vacancy Filled
              </th>
              <th className="p-4 text-center text-[16px] leading-[20px] truncate font-medium text-[#4C4C4C] border-x border-[#C6C6C6] whitespace-nowrap">
                Standby Filled
              </th>
              <th className="p-4 text-center text-[16px] leading-[20px] truncate font-medium text-[#4C4C4C] border-x border-[#C6C6C6] whitespace-nowrap">
                Total Duration
              </th>
              <th className="p-4 text-center text-[16px] leading-[20px] truncate font-medium text-[#4C4C4C] border-x border-[#C6C6C6] whitespace-nowrap">
                Rate Type
              </th>
              <th className="p-4 text-center text-[16px] leading-[20px] truncate font-medium text-[#4C4C4C] border-x border-[#C6C6C6] whitespace-nowrap">
                Break Included
              </th>
              <th className="p-4 text-center text-[16px] leading-[20px] truncate font-medium text-[#4C4C4C] border-x border-[#C6C6C6] whitespace-nowrap">
                Break Type
              </th>
              <th className="p-4 text-center text-[16px] leading-[20px] truncate font-medium text-[#4C4C4C] border-x border-[#C6C6C6] whitespace-nowrap">
                Rate
              </th>
              <th className="p-4 text-center text-[16px] leading-[20px] truncate font-medium text-[#4C4C4C] border-x border-[#C6C6C6] whitespace-nowrap">
                Total Wage
              </th>
              <th className="p-4 text-center text-[16px] leading-[20px] truncate font-medium text-[#4C4C4C] border-x border-[#C6C6C6] whitespace-nowrap">
                Job Status
              </th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift, index) => (
              <tr key={index} className="border-b border-[#C6C6C6] relative">
                <td className="p-4 text-center text-[16px] leading-[20px] truncate font-medium text-gray-500 border-l border-[#C6C6C6]">
                  <button className="p-4 hover:bg-gray-100 rounded-full">
                    <MoreVertical
                      className="h-6 w-6"
                      color="#000000"
                      onClick={() => handlePopupToggle(index)}
                    />
                  </button>
                  {isPopupOpen === index && (
                    <div className="absolute top-[80%] left-8 mt-1 w-32 bg-white shadow-md border border-gray-300 rounded-md z-10">
                      <button
                        className="flex items-center gap-2 p-2 w-full text-left text-gray-700 hover:bg-gray-100"
                        onClick={() => handleActionClick("Edit Shift", index)}
                      >
                        <Edit size={16} />
                        Edit Shift
                      </button>
                    </div>
                  )}
                </td>
                <td className="p-4 text-center text-[16px] leading-[20px] truncate font-medium  border-r border-[#C6C6C6]">
                  <span className="bg-[#048BE1] text-white px-3 py-2 text-center rounded-full">
                    {/* {shift.startTime}:{shift.startTime.minutes}{" "}
                  {shift.startTime.period} */}
                    {shift.startTime}
                  </span>
                </td>
                <td className="p-4 text-center text-[16px] leading-[20px] truncate font-medium  border-x border-[#C6C6C6]">
                  <span className="bg-[#048BE1] text-white px-3 py-2 text-center rounded-full">
                    {/* {shift.endTime.hours}:{shift.endTime.minutes}{" "}
                  {shift.endTime.period} */}
                    {shift.endTime}
                  </span>
                </td>
                <td className="p-4 text-center text-[16px] leading-[20px] truncate font-medium  border-x border-[#C6C6C6]">
                  {convertIdToFourDigits(shift.shiftId)}
                </td>
                <td className="p-4 text-center text-[16px] leading-[20px] truncate font-medium  border-x border-[#C6C6C6]">
                  <div className="flex items-center gap-4">
                    <button
                      className="px-2 py-2 bg-[#F1F1F1] rounded-full hover:bg-gray-300"
                      onClick={() => handleDecrease(shift.id, "vacancyFilled")}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <p>
                      {shift.vacancy > 0 ? shift.vacancy : "_"}/
                      {maxVacancy}
                    </p>

                    <button
                      className="px-2 py-2 bg-[#F1F1F1] rounded-full hover:bg-gray-300"
                      onClick={() =>
                        handleIncrease(shift.id, "vacancyFilled", 3)
                      }
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </td>
                <td className="p-4 text-center text-[16px] leading-[20px] truncate font-medium  border-x border-[#C6C6C6]">
                  <div className="flex items-center gap-4">
                    <button
                      className="px-2 py-2 bg-[#F1F1F1] rounded-full hover:bg-gray-300"
                      onClick={() => handleDecrease(shift.id, "standbyFilled")}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <p>
                      {shift.standbyVacancy > 0 ? shift.standbyVacancy : "_"}/
                      {maxStandby}
                    </p>

                    <button
                      className="px-2 py-2 bg-[#F1F1F1] rounded-full hover:bg-gray-300"
                      onClick={() =>
                        handleIncrease(shift.shiftId, "standbyFilled", 1)
                      }
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </td>
                <td className="p-4 text-center text-[16px] leading-[20px] truncate font-medium  border-x border-[#C6C6C6]">
                  {shift.totalDuration}
                </td>
                <td className="p-4 text-center text-[16px] leading-[20px] truncate font-medium  border-x border-[#C6C6C6]">
                  <p className="px-2 py-1 rounded-full bg-[#EDEDED]">
                    {shift.rateType}
                  </p>
                </td>
                <td className="p-4 text-center text-[16px] leading-[20px] truncate font-medium  border-x border-[#C6C6C6]">
                  {shift.breakIncluded}
                </td>
                <td className="p-4 text-center text-[16px] leading-[20px] truncate font-medium  border-x border-[#C6C6C6]">
                  <p
                    className={`${shift.breakType === "Paid"
                      ? "text-[#049609]"
                      : "text-[#E34E30]"
                      }`}
                  >
                    {shift.breakType}
                  </p>
                </td>
                <td className="p-4 text-center text-[16px] leading-[20px] truncate font-medium  border-x border-[#C6C6C6]">
                  {shift.payRate}
                </td>
                <td className="p-4 text-center text-[16px] leading-[20px] truncate font-medium  border-x border-[#C6C6C6]">
                  {shift.totalWage}
                </td>
                <td className="p-4 text-center text-[16px] leading-[20px] truncate font-medium  border-x border-[#C6C6C6]">
                  <p
                    className={`px-2 py-1 rounded-full ${getStatusColor(jobsData.jobStatus)
                      } `}
                  >
                    {jobsData.jobStatus}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* <CustomScrollbar scrollContainerRef={scrollContainerRef} totalSteps={3} /> */}

      {/* Job Scope and Requirements */}
      <div className="mt-8 p-4">
        <div>
          <div className="flex items-center gap-2 py-3 text-[16px] leading-[20px] font-medium">
            <RiFocus3Line className="w-6 h-6" />
            <h2>Job Scope</h2>
          </div>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-[16px] leading-[22px]">
            <li>Station at tray collection section</li>
            <li>Clearing & Cleaning of table and tray</li>
            <li>Maintain floor cleanliness (Sweep/Mop)</li>
            <li>Push trolley to the dishwashing area</li>
          </ul>
        </div>

        <div className="py-4">
          <div className="flex items-center gap-2 py-3 text-[16px] leading-[20px] font-medium ">
            <AiOutlineFileDone className="w-6 h-6" />
            <h2>Job Requirements</h2>
          </div>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-[16px] leading-[22px]">
            <li>Black T-shirt</li>
            <li>Dark colored long pants / Jeans</li>
            <li>Covered Shoes</li>
            <li>
              Must arrive at least 15 mins before job start time for briefing
            </li>
            <li>Smoking is strictly not allowed</li>
            <li>Do not turn up without prior notice</li>
            <li>Adhere to safety protocols and company policies</li>
          </ul>
        </div>
      </div>

      {/* Penalties Section */}
      <div className="mt-6 ">
        <h2 className="text-[16px] leading-[19px] font-medium text-[#9F120E]">
          Shift Cancellation Penalties
        </h2>

        <div className="">
          {[
            {
              frame: "5 Times after applying",
              penalty: "No Penalty",
            },
            {
              frame: "> 48 Hours",
              penalty: "No Penalty",
            },
            {
              frame: "> 24 Hours (1st Time)",
              penalty: "$5 Penalty",
            },
            {
              frame: "> 24 Hours (2nd Time)",
              penalty: "$10 Penalty",
            },
            {
              frame: "> 24 Hours (3rd Time)",
              penalty: "$15 Penalty",
            },
            {
              frame: "No Show - During Shift",
              penalty: "$50 Penalty",
            },
          ].map((item, index) => {
            const penaltyValue = parseInt(
              item.penalty.replace("$", "").replace(" Penalty", "")
            );

            // Determine penalty text color
            const penaltyColor =
              penaltyValue >= 50
                ? "text-[#941F15]" // Darkest red for $50 or more
                : penaltyValue >= 15
                  ? "text-[#941F15]" // Dark red for $15 or more
                  : penaltyValue >= 10
                    ? "text-[#BB2F23]" // Bold red for $10
                    : penaltyValue >= 5
                      ? "text-[#D14236]" // Light red for $5
                      : "text-[#797979]";

            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-16">
                  <p className="text-[16px] leading-[22px] font-normal text-[#000000]">
                    {item.frame}
                  </p>
                </div>
                <p
                  className={`py-3 px-6 text-[16px] leading-[19px] font-medium ${penaltyColor}`}
                >
                  {item.penalty}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
