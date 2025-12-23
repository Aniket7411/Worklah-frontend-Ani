import React, { useState, useEffect } from "react";
import {
  Ban,
  ChevronDown,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { CustomScrollbar } from "../../components/layout/CustomScrollbar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import { convertIdToFourDigits } from "../../lib/utils";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
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
  status?: string;
  verificationStatus?: string;
  attendanceStatus?: string;
  profilePicture?: string;
  [key: string]: any;
}

export default function HustleHeroesList() {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "";
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState<number | null>(null);
  const [showRejectReasonId, setShowRejectReasonId] = useState<string | null>(
    null
  );
  const [rejectReasons, setRejectReasons] = useState<{ [key: string]: string }>(
    {}
  );
  const [showDeleteModal, setShowDeleteModal] = useState<{ isOpen: boolean; candidateId: string | null; candidateName: string }>({
    isOpen: false,
    candidateId: null,
    candidateName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  // const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get page title based on filter
  const getPageTitle = () => {
    switch (filter) {
      case "activated":
        return "Activated Hustle Heroes";
      case "pending-verification":
        return "Pending Verifications";
      case "verified":
        return "Verified Hustle Heroes";
      case "no-show":
        return "No Show Hustle Heroes";
      default:
        return "Hustle Heroes";
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get("/admin/candidates");
        
        // Check for success field according to API spec
        if (response.data?.success === false) {
          console.error("Failed to fetch candidates:", response.data?.message);
          return;
        }
        
        const candidates = response?.data?.candidates || [];
        if (Array.isArray(candidates)) {
          setAllEmployees(candidates);
        } else {
          console.error('Invalid candidates data format');
          setAllEmployees([]);
        }
      } catch (error: any) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Filter employees based on URL parameter
  useEffect(() => {
    let filtered = [...allEmployees];

    switch (filter) {
      case "activated":
        // Filter for activated heroes (status: Active or Approved)
        filtered = allEmployees.filter(
          (emp) => emp.status === "Active" || emp.status === "Approved"
        );
        break;
      case "pending-verification":
        // Filter for pending verification (workPassStatus: Pending)
        filtered = allEmployees.filter(
          (emp) => emp.workPassStatus === "Pending" || emp.verificationStatus === "Pending"
        );
        break;
      case "verified":
        // Filter for verified heroes (workPassStatus: Verified)
        filtered = allEmployees.filter(
          (emp) => emp.workPassStatus === "Verified" || emp.verificationStatus === "Verified"
        );
        break;
      case "no-show":
        // Filter for no-show heroes (need to check if backend has this field)
        // For now, filtering by low turn-up rate or specific status
        filtered = allEmployees.filter(
          (emp) =>
            (emp.turnUpRate && parseFloat(emp.turnUpRate) < 50) ||
            emp.status === "No Show" ||
            emp.attendanceStatus === "No Show"
        );
        break;
      default:
        // Show all employees
        filtered = allEmployees;
    }

    setEmployees(filtered);
  }, [filter, allEmployees]);
  const toggleSelectAll = () => {
    if (selectedRows.length === employees.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(employees.map((emp) => emp.id));
    }
  };

  const formatDob = (dob: string) => {
    if (!dob) return "N/A";

    const date = new Date(dob);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "N/A";
    }

    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    // Validate day, month, and year are valid numbers
    if (isNaN(day) || isNaN(year) || !month) {
      return "N/A";
    }

    const getOrdinal = (n: number) => {
      if (isNaN(n)) return "";
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
    if (!dob) return "N/A";

    const birthDate = new Date(dob);
    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      return "N/A";
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    // Validate age is a valid number
    if (isNaN(age) || age < 0) {
      return "N/A";
    }

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
      // Fix navigation - need to find a job or use a different route
      // For now, navigate to edit page which shows profile
      navigate(`/edit-candidate-profile/${id}`);
    }
    if (action === "Edit") {
      navigate(`/edit-candidate-profile/${id}`);
    }
    if (action === "Delete") {
      const candidate = employees.find(emp => emp.id === id);
      setShowDeleteModal({
        isOpen: true,
        candidateId: id,
        candidateName: candidate?.fullName || "this candidate",
      });
    }
    setIsPopupOpen(null);
  };

  const handleDeleteCandidate = async () => {
    if (!showDeleteModal.candidateId) return;

    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(`/admin/candidates/${showDeleteModal.candidateId}`);
      
      if (response.data?.success === false) {
        toast.error(response.data?.message || "Failed to delete candidate");
        return;
      }

      toast.success("Candidate deleted successfully");
      setEmployees((prev) => prev.filter((emp) => emp.id !== showDeleteModal.candidateId));
      setAllEmployees((prev) => prev.filter((emp) => emp.id !== showDeleteModal.candidateId));
      setShowDeleteModal({ isOpen: false, candidateId: null, candidateName: "" });
    } catch (error: any) {
      console.error("Error deleting candidate:", error);
      toast.error(error?.response?.data?.message || "Failed to delete candidate. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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
      .then((response) => {
        // Check for success field according to API spec
        if (response.data?.success === false) {
          alert(response.data?.message || `Failed to ${action.toLowerCase()} candidate`);
          return;
        }
        
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
        <h1 className="text-2xl sm:text-3xl md:text-[36px] font-[500] text-[#1F2937]">{getPageTitle()}</h1>
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
                          navigate(`/edit-candidate-profile/${employee?.id || ""}`)
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
                    {employee?.registrationDate ? (() => {
                      try {
                        const regDate = new Date(employee.registrationDate);
                        if (isNaN(regDate.getTime())) {
                          return "N/A";
                        }
                        return regDate.toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        });
                      } catch {
                        return employee.registrationDate || "N/A";
                      }
                    })() : "N/A"}
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
                          <button
                            className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-[#E34E30] hover:bg-red-50 transition-colors"
                            onClick={() => handleActionClick("Delete", employee?.id || "")}
                          >
                            <Trash2 size={16} color="#E34E30" />
                            Delete
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal.isOpen}
        onClose={() => setShowDeleteModal({ isOpen: false, candidateId: null, candidateName: "" })}
        onConfirm={handleDeleteCandidate}
        title="Delete Candidate"
        message={`Are you sure you want to delete ${showDeleteModal.candidateName}? This action cannot be undone and will permanently remove all candidate data.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
