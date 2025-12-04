import React, { useState, useEffect } from "react";
import {
  Ban,
  ChevronDown,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { CustomScrollbar } from "../../components/layout/CustomScrollbar";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import { convertIdToFourDigits } from "../../lib/utils";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { FaRegIdCard } from "react-icons/fa";
import { BiDonateBlood, BiSolidDonateBlood } from "react-icons/bi";
import { CiFlag1 } from "react-icons/ci";
import { FaLocationDot } from "react-icons/fa6";

interface Employee {
  id: string;
  fullName: string;
  avatarUrl: string;
  gender: string;
  mobile: string;
  nric: string;
  icNumber: string;
  dob: string;
  registrationDate: string;
  turnUpRate: string;
  workingHours: string;
  avgAttendRate: string;
  workPassStatus: "Verified" | "Approved" | "Pending" | "Rejected";
  profilePicture?: string;
}

export default function HustleHeroesList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState<number | null>(null);
  const [showRejectReasonId, setShowRejectReasonId] = useState<string | null>(
    null
  );
  const [rejectReasons, setRejectReasons] = useState<{ [key: string]: string }>(
    {}
  );
  // const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get("/admin/candidates");
        if (response?.data?.candidates) {
          setEmployees(response.data.candidates);
        }
      } catch (error: any) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);
  const toggleSelectAll = () => {
    if (selectedRows.length === employees.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(employees.map((emp) => emp.id));
    }
  };

  const formatDob = (dob: string) => {
    const date = new Date(dob);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const getOrdinal = (n: number) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
    return `${day}${getOrdinal(day)} ${month} ${year}`;
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return `${age} yrs`;
  };

  const toggleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handlePopupToggle = (index: number) => {
    setIsPopupOpen(isPopupOpen === index ? null : index);
  };

  const handleActionClick = (action: string, id: string) => {
    if (action === "View") {
      navigate(`/jobs/:jobId/candidates/${id}`);
    }
    if (action === "Edit") {
      navigate(`/edit-candidate-profile/${id}`);
    }
    setIsPopupOpen(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-green-50 text-green-600";
      case "Approved":
        return "bg-blue-50 text-blue-600";
      case "Pending":
        return "bg-orange-50 text-orange-600";
      case "Rejected":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const handleVerifyAction = (action: "Approve" | "Reject", id: string) => {
    if (action === "Reject" && !rejectReasons[id]) {
      alert("Please enter a rejection reason.");
      return;
    }

    axiosInstance
      .put(`/admin/verify-candidate/${id}`, {
        action: action === "Approve" ? "approve" : "reject",
        rejectionReason: rejectReasons[id] || "",
      })
      .then(() => {
        alert(`Candidate ${action}d`);
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === id
              ? {
                ...emp,
                workPassStatus: action === "Approve" ? "Verified" : "Rejected",
              }
              : emp
          )
        );
        setShowRejectReasonId(null);
      })
      .catch((err) => {
        console.error("Error updating candidate status:", err);
        alert("Failed to update status. Please try again.");
      });
  };

  const toggleRejectReason = (id: string) => {
    setShowRejectReasonId((prev) => (prev === id ? null : id));
  };

  return (
    <>




      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4">
        <h1 className="text-2xl sm:text-3xl md:text-[36px] font-[500] text-[#1F2937]">Hustle Heroes</h1>
        <div className="flex items-center gap-4">

          <button className="p-[14px] rounded-[26px] shadow-lg bg-dark hover:bg-slate-950 ">
            <Filter
              className="w-[20px] h-[20px]"
              color="#FFFFFF"
              fill="#ffffff"
            />
          </button>
        </div>
      </div>

      <div className="table-wrapper rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full border-collapse">

          <thead>
            <tr className="bg-[#EDF8FF]">
              <th className="p-3 md:p-4 text-center border-b border-gray-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                  checked={selectedRows.length === employees.length && employees.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b border-gray-300">ID</th>
              <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b border-gray-300">Full Name</th>
              <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b border-gray-300 hidden sm:table-cell">Gender</th>
              <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b border-gray-300 hidden md:table-cell">Mobile</th>
              <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b border-gray-300 hidden lg:table-cell">IC Number</th>
              <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b border-gray-300 hidden lg:table-cell">DOB</th>
              <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b border-gray-300 hidden xl:table-cell">Age</th>
              <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b border-gray-300 hidden xl:table-cell">
                Registration Date
              </th>
              <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b border-gray-300">
                Status
              </th>
              <th className="p-3 md:p-4 text-left text-xs sm:text-sm font-medium text-gray-700 border-b border-gray-300 hidden lg:table-cell">
                Verification
              </th>
              <th className="p-3 md:p-4 text-center border-b border-gray-300 sticky right-0 bg-[#EDF8FF]">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-gray-500">
                  No candidates found
                </td>
              </tr>
            ) : (
              employees.map((employee, index) => (
                <tr key={employee?.id || index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="p-3 md:p-4 text-center border-b border-gray-200">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                      checked={selectedRows.includes(employee?.id || "")}
                      onChange={() => toggleSelectRow(employee?.id || "")}
                    />
                  </td>
                  <td className="p-3 md:p-4 text-left text-xs sm:text-sm border-b border-gray-200">
                    {employee?.id ? convertIdToFourDigits(employee.id) : "N/A"}
                  </td>
                  <td className="p-3 md:p-4 text-left border-b border-gray-200">
                    <div className="flex items-center gap-2 justify-center">
                      {employee?.profilePicture ? (
                        <img
                          src={employee.profilePicture}
                          alt={employee?.fullName || "Profile"}
                          className="h-8 w-8 rounded-full bg-gray-200 object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          {employee?.fullName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                      <span
                        onClick={() =>
                          navigate(`/jobs/:jobId/candidates/${employee?.id || ""}`)
                        }
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        {employee?.fullName || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 truncate text-center border">
                    {employee?.gender === "Male"
                      ? "M"
                      : employee?.gender === "Female"
                        ? "F"
                        : "N/A"}
                  </td>
                  <td className="p-4 truncate text-center border">
                    {employee?.mobile || "N/A"}
                  </td>
                  <td className="p-4 truncate text-center border">
                    {employee?.nric || employee?.icNumber || "N/A"}
                  </td>
                  <td className="p-4 truncate text-center border">
                    {employee?.dob ? formatDob(employee.dob) : "N/A"}
                  </td>

                  <td className="p-4 truncate text-center border">
                    {employee?.dob ? calculateAge(employee.dob) : "N/A"}
                  </td>

                  <td className="p-4 truncate text-center border">
                    {employee?.registrationDate || "N/A"}
                  </td>
                  {/* <td className="p-4 truncate text-center border">{employee.turnUpRate}</td> */}
                  {/* <td className="p-4 truncate text-center border">{employee.workingHours}</td> */}
                  {/* <td className="p-4 truncate text-center border">{employee.avgAttendRate}</td> */}
                  <td className="p-4 truncate text-center border">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                        employee?.workPassStatus
                      )}`}
                    >
                      {employee?.workPassStatus || "Pending"}
                    </span>
                  </td>
                  <td className="p-4 truncate text-center border">
                    <div className="flex flex-col gap-2">
                      <button
                        className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 text-sm"
                        onClick={() => handleVerifyAction("Approve", employee?.id || "")}
                        disabled={employee?.workPassStatus === "Verified"}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 text-sm"
                        onClick={() => toggleRejectReason(employee?.id || "")}
                        disabled={employee?.workPassStatus === "Rejected"}
                      >
                        Reject
                      </button>
                      {showRejectReasonId === employee?.id && (
                        <>
                          <textarea
                            className="mt-2 p-2 border rounded w-full text-sm"
                            placeholder="Enter rejection reason..."
                            value={rejectReasons[employee?.id || ""] || ""}
                            onChange={(e) =>
                              setRejectReasons({
                                ...rejectReasons,
                                [employee?.id || ""]: e.target.value,
                              })
                            }
                          />
                          <button
                            className="mt-2 bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800 text-sm"
                            onClick={() =>
                              handleVerifyAction("Reject", employee?.id || "")
                            }
                          >
                            Reject Candidate
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-3 md:p-4 text-center border-b border-gray-200 sticky right-0 bg-white relative">
                    <div className="relative">
                      <button
                        className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={() => handlePopupToggle(index)}
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                      {isPopupOpen === index && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white shadow-lg border border-gray-200 rounded-lg z-20">
                          <button
                            className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => handleActionClick("View", employee?.id || "")}
                          >
                            <Eye size={16} />
                            View
                          </button>
                          <button
                            className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() =>
                              handleActionClick("Edit", employee?.id || "")
                            }
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          <button
                            className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-[#E34E30] hover:bg-red-50 transition-colors"
                            onClick={() => handleActionClick("Block", employee?.id || "")}
                          >
                            <Ban size={16} color="#E34E30" />
                            Block
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* <CustomScrollbar scrollContainerRef={scrollContainerRef} totalSteps={3} /> */}

    </>
  );
}
