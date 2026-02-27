import React, { useState, useEffect } from "react";
import {
  Ban,
  CheckCircle,
  ChevronDown,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  PauseCircle,
  Plus,
  Trash2,
  XCircle,
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
import { FaLocationDot } from "react-icons/fa6";
import { getProfilePicUrl } from "../../utils/avatarUtils";

// User/Employee interface for Hustle Heroes (users registered via mobile app)
interface Employee {
  id?: string;
  _id?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  mobile?: string;
  gender?: string;
  dob?: string;
  nric?: string;
  icNumber?: string;
  profilePicture?: string;
  avatarUrl?: string;
  registrationDate?: string;
  createdAt?: string;
  role?: string;
  status?: string;
  workPassStatus?: "Verified" | "Approved" | "Pending" | "Rejected" | "Suspended";
  verificationStatus?: string;
  profileCompleted?: boolean;
  turnUpRate?: string;
  attendanceStatus?: string;
}

// VERIFICATION_AND_ADMIN_ACTIONS.md §5.1: status query = Approved | Pending | Rejected | Suspended
const FILTER_TO_STATUS: Record<string, string> = {
  "pending-verification": "Pending",
  verified: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

// REACT_ADMIN_HANDOVER.md: GET /admin/users with optional page, limit, search, role=USER, status
const DEFAULT_PAGE_SIZE = 20;

export default function HustleHeroesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "";
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(""); // controlled input; submit sets searchQuery
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ currentPage: number; totalPages: number; totalItems: number; itemsPerPage: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{ isOpen: boolean; candidateId: string | null; candidateName: string }>({
    isOpen: false,
    candidateId: null,
    candidateName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Get page title based on filter (VERIFICATION_AND_ADMIN_ACTIONS.md §2.1)
  const getPageTitle = () => {
    switch (filter) {
      case "activated":
        return "Activated Hustle Heroes";
      case "pending-verification":
        return "Pending Verifications";
      case "verified":
        return "Verified Hustle Heroes";
      case "rejected":
        return "Rejected Users";
      case "suspended":
        return "Suspended Users";
      case "no-show":
        return "No Show Hustle Heroes";
      default:
        return "Hustle Heroes";
    }
  };

  const fetchEmployees = async (pageToFetch: number = 1) => {
    setIsLoading(true);
    try {
      // REACT_ADMIN_HANDOVER.md + VERIFICATION_AND_ADMIN_ACTIONS.md: page, limit, search, role=USER, status
      const params: Record<string, string | number> = {
        role: "USER",
        limit: DEFAULT_PAGE_SIZE,
        page: pageToFetch,
      };
      const statusParam = FILTER_TO_STATUS[filter];
      if (statusParam) params.status = statusParam;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await axiosInstance.get("/admin/users", { params });

      if (response.data?.success === false) {
        toast.error(response.data?.message || "Failed to fetch users");
        return;
      }

      const users = response?.data?.users || [];
      const validUsers = Array.isArray(users)
        ? users.filter((u: any) => (u.role || "").toString().toLowerCase() === "user")
        : [];
      const mapped: Employee[] = validUsers.map((user: any) => ({
        id: user._id || user.id,
        _id: user._id || user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        mobile: user.phoneNumber || user.mobile,
        gender: user.gender,
        dob: user.dob,
        nric: user.nric || user.icNumber,
        icNumber: user.nric || user.icNumber,
        profilePicture: user.profilePicture,
        avatarUrl: user.profilePicture,
        registrationDate: user.createdAt || user.registrationDate,
        createdAt: user.createdAt,
        role: user.role,
        status: user.status,
        workPassStatus: user.workPassStatus || user.verificationStatus,
        verificationStatus: user.verificationStatus || user.workPassStatus,
        profileCompleted: user.profileCompleted,
        turnUpRate: user.turnUpRate,
        attendanceStatus: user.attendanceStatus,
      }));

      setEmployees(mapped);
      setAllEmployees(mapped);
      setPagination(response?.data?.pagination || null);
      setPage(pageToFetch);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch users. Please try again.");
      setEmployees([]);
      setAllEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(1);
  }, [filter, searchQuery]);

  // When filter/search change, fetch resets to page 1 (handled in useEffect). No client-side filter – backend returns filtered list.
  const toggleSelectAll = () => {
    if (selectedRows.length === employees.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(employees.map((emp) => emp.id || emp._id || "").filter(id => id !== ""));
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
    const candidate = employees.find((emp) => (emp.id || emp._id) === id);
    const name = candidate?.fullName || "this user";
    if (action === "View") {
      navigate(`/edit-candidate-profile/${id}`);
    }
    if (action === "Edit") {
      navigate(`/edit-candidate-profile/${id}`);
    }
    if (action === "Approve") {
      setActionModal({ open: true, type: "approve", userId: id, userName: name, reason: "" });
    }
    if (action === "Reject") {
      setActionModal({ open: true, type: "reject", userId: id, userName: name, reason: "" });
    }
    if (action === "Suspend") {
      setActionModal({ open: true, type: "suspend", userId: id, userName: name, reason: "" });
    }
    if (action === "Delete") {
      setShowDeleteModal({ isOpen: true, candidateId: id, candidateName: name });
    }
    setIsPopupOpen(null);
  };

  const handleDeleteCandidate = async () => {
    if (!showDeleteModal.candidateId) return;

    setIsDeleting(true);
    try {
      // Delete user endpoint according to API documentation
      // Note: We might need to use /admin/users/:userId instead of /admin/candidates/:id
      const response = await axiosInstance.delete(`/admin/users/${showDeleteModal.candidateId}`);
      
      if (response.data?.success === false) {
        toast.error(response.data?.message || "Failed to delete candidate");
        return;
      }

      toast.success("User deleted successfully");
      setShowDeleteModal({ isOpen: false, candidateId: null, candidateName: "" });
      await fetchEmployees(page);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      const status = error?.response?.status;
      const msg = error?.response?.data?.message;
      if (status === 403) toast.error(msg || "Cannot delete an admin user.");
      else if (status === 404) toast.error(msg || "User not found.");
      else toast.error(msg || "Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status || "";
    switch (s) {
      case "Verified":
      case "Approved":
      case "Activated":
        return "bg-green-50 text-green-600";
      case "Pending":
        return "bg-amber-50 text-amber-600";
      case "Rejected":
        return "bg-red-50 text-red-600";
      case "Suspended":
        return "bg-orange-50 text-orange-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  // VERIFICATION_AND_ADMIN_ACTIONS.md: Approve, Reject, Suspend, Delete with confirmations
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    type: "approve" | "reject" | "suspend";
    userId: string;
    userName: string;
    reason: string;
  }>({ open: false, type: "approve", userId: "", userName: "", reason: "" });
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyUser = async (userId: string, action: "Approved" | "Rejected" | "Suspended", reason?: string) => {
    setIsVerifying(true);
    try {
      const body: { action: string; reason?: string } = { action };
      if (reason && reason.trim()) body.reason = reason.trim(); // §5.3 optional for Approve; §5.4–5.5 for Reject/Suspend
      const response = await axiosInstance.put(`/admin/users/${userId}/verify`, body);
      if (response.data?.success === false) {
        toast.error(response.data?.message || "Action failed");
        return;
      }
      const msg =
        action === "Approved"
          ? "User verified successfully"
          : action === "Rejected"
            ? "User rejected"
            : "User suspended";
      toast.success(response.data?.message || msg);
      setActionModal((m) => ({ ...m, open: false }));
      await fetchEmployees(page);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setIsVerifying(false);
    }
  };


  return (
    <>




      <div className="flex flex-col gap-4 mb-6 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-[36px] font-[500] text-[#1F2937]">{getPageTitle()}</h1>
        </div>
        {/* REACT_ADMIN_HANDOVER.md: optional search; VERIFICATION_AND_ADMIN_ACTIONS.md: filter by status */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              placeholder="Search by name, email, phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), setSearchQuery(searchInput))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setSearchQuery(searchInput)}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchInput(""); setSearchQuery(""); }}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "", label: "All" },
              { key: "pending-verification", label: "Pending" },
              { key: "verified", label: "Approved" },
              { key: "rejected", label: "Rejected" },
              { key: "suspended", label: "Suspended" },
            ].map(({ key, label }) => (
              <button
                key={key || "all"}
                type="button"
                onClick={() => setSearchParams(key ? { filter: key } : {})}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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
            {isLoading ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              employees.map((employee, index) => (
                <tr key={employee?.id || employee?._id || index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="p-3 md:p-4 text-center border-b border-gray-200">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                    checked={selectedRows.includes(employee?.id || employee?._id || "")}
                    onChange={() => toggleSelectRow(employee?.id || employee?._id || "")}
                    />
                  </td>
                  <td className="p-3 md:p-4 text-left text-xs sm:text-sm border-b border-gray-200">
                    {employee?.id || employee?._id ? convertIdToFourDigits(employee.id || employee._id || "") : "N/A"}
                  </td>
                  <td className="p-3 md:p-4 text-left border-b border-gray-200">
                    <div className="flex items-center gap-2 justify-center">
                      {(() => {
                        const picUrl = getProfilePicUrl(employee?.profilePicture || employee?.avatarUrl);
                        return picUrl ? (
                          <img
                            src={picUrl}
                            alt={employee?.fullName || "Profile"}
                            className="h-8 w-8 rounded-full bg-gray-200 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : null;
                      })()}
                      {!getProfilePicUrl(employee?.profilePicture || employee?.avatarUrl) && (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          {employee?.fullName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                      <span
                        onClick={() =>
                          navigate(`/edit-candidate-profile/${employee?.id || employee?._id || ""}`)
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
                        : employee?.gender === "Other"
                          ? "Other"
                          : "N/A"}
                  </td>
                  <td className="p-4 truncate text-center border">
                    {employee?.mobile || employee?.phoneNumber || "N/A"}
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
                    {employee?.registrationDate || employee?.createdAt ? (() => {
                      try {
                        const regDate = new Date(employee.registrationDate || employee.createdAt || "");
                        if (isNaN(regDate.getTime())) {
                          return "N/A";
                        }
                        return regDate.toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        });
                      } catch {
                        return employee.registrationDate || employee.createdAt || "N/A";
                      }
                    })() : "N/A"}
                  </td>
                  {/* <td className="p-4 truncate text-center border">{employee.turnUpRate}</td> */}
                  {/* <td className="p-4 truncate text-center border">{employee.workingHours}</td> */}
                  {/* <td className="p-4 truncate text-center border">{employee.avgAttendRate}</td> */}
                  <td className="p-4 truncate text-center border">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                        employee?.verificationStatus ?? employee?.status ?? employee?.workPassStatus
                      )}`}
                    >
                      {employee?.verificationStatus ?? employee?.status ?? employee?.workPassStatus ?? "Pending"}
                    </span>
                  </td>
                  <td className="p-4 truncate text-center border">
                    <span className="text-xs text-gray-500">
                      {employee?.verificationStatus ?? employee?.workPassStatus ?? employee?.status ?? "Pending"}
                    </span>
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
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white shadow-lg border border-gray-200 rounded-lg z-20">
                          <button
                            className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => handleActionClick("View", employee?.id || employee?._id || "")}
                          >
                            <Eye size={16} />
                            View
                          </button>
                          <button
                            className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => handleActionClick("Edit", employee?.id || employee?._id || "")}
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          {(() => {
                            const vs = (employee?.verificationStatus || "").toLowerCase();
                            const st = (employee?.status || "").toLowerCase();
                            const isVerified = ["approved", "verified", "activated", "active"].includes(vs) || ["approved", "verified", "activated", "active"].includes(st);
                            return !isVerified && (
                              <button
                                className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-green-600 hover:bg-green-50 transition-colors"
                                onClick={() => handleActionClick("Approve", employee?.id || employee?._id || "")}
                              >
                                <CheckCircle size={16} />
                                Approve
                              </button>
                            );
                          })()}
                          <button
                            className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                            onClick={() => handleActionClick("Reject", employee?.id || employee?._id || "")}
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                          <button
                            className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                            onClick={() => handleActionClick("Suspend", employee?.id || employee?._id || "")}
                          >
                            <PauseCircle size={16} />
                            Suspend
                          </button>
                          <button
                            className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-[#E34E30] hover:bg-red-50 transition-colors"
                            onClick={() => handleActionClick("Delete", employee?.id || employee?._id || "")}
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

      {/* REACT_ADMIN_HANDOVER.md: optional page, limit – pagination when backend returns it */}
      {pagination && pagination.totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-between px-4 py-3 border border-t-0 border-gray-200 rounded-b-lg bg-gray-50 text-sm">
          <span className="text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
            {pagination.totalItems != null && ` (${pagination.totalItems} total)`}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fetchEmployees(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => fetchEmployees(page + 1)}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal.isOpen}
        onClose={() => setShowDeleteModal({ isOpen: false, candidateId: null, candidateName: "" })}
        onConfirm={handleDeleteCandidate}
        title="Delete User"
        message={`Are you sure you want to delete ${showDeleteModal.candidateName}? This action cannot be undone and will permanently remove all user data.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />

      {/* Approve / Reject / Suspend confirmation modal (VERIFICATION_AND_ADMIN_ACTIONS.md) */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {actionModal.type === "approve" && "Approve user"}
              {actionModal.type === "reject" && "Reject user"}
              {actionModal.type === "suspend" && "Suspend user"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {actionModal.type === "approve" &&
                `Approve ${actionModal.userName}? They will be able to apply to jobs in the app.`}
              {actionModal.type === "reject" &&
                `Reject ${actionModal.userName}? They will not be able to apply until approved.`}
              {actionModal.type === "suspend" &&
                `Suspend ${actionModal.userName}? They will not be able to apply until you approve again.`}
            </p>
            {/* VERIFICATION_AND_ADMIN_ACTIONS.md §5.3–5.5: optional reason for Approve (audit), Reject, Suspend */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {actionModal.type === "approve" ? "Note (optional, for audit)" : "Reason (optional)"}
              </label>
              <input
                type="text"
                value={actionModal.reason}
                onChange={(e) => setActionModal((m) => ({ ...m, reason: e.target.value }))}
                placeholder={
                  actionModal.type === "approve"
                    ? "e.g. Documents verified"
                    : actionModal.type === "reject"
                      ? "e.g. Incomplete documents"
                      : "e.g. Policy violation"
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setActionModal((m) => ({ ...m, open: false }))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isVerifying}
                onClick={() => {
                  const action =
                    actionModal.type === "approve"
                      ? "Approved"
                      : actionModal.type === "reject"
                        ? "Rejected"
                        : "Suspended";
                  handleVerifyUser(actionModal.userId, action, actionModal.reason);
                }}
                className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                  actionModal.type === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : actionModal.type === "reject"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {isVerifying ? "..." : actionModal.type === "approve" ? "Approve" : actionModal.type === "reject" ? "Reject" : "Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
