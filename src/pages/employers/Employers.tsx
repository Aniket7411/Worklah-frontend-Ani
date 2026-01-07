import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import { useAuth } from "../../context/AuthContext";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Building2,
  Phone,
  Mail,
  Store,
  Filter,
  X,
  Loader2,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Employer {
  employerId: string;
  companyLegalName: string;
  companyLogo: string | null;
  mainContactPerson: string;
  mainContactPersonPosition: string;
  mainContactNumber: string;
  companyEmail: string;
  outlets: number;
  serviceAgreement: string;
  employerOriginalId: string;
  employerIdForAPI: string;
}

const Employers: React.FC = () => {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{
    isOpen: boolean;
    employerId: string | null;
    employerName: string;
  }>({
    isOpen: false,
    employerId: null,
    employerName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const navigate = useNavigate();
  const { user } = useAuth();
  const images = "https://worklah.onrender.com";
  const isAdmin = user?.role === "ADMIN";
  const itemsPerPage = 10;

  // Fetch employers data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/admin/employers?page=${currentPage}&limit=${itemsPerPage}`);

      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to fetch employers");
      }

      if (!response.data || !Array.isArray(response.data.employers)) {
        throw new Error("Invalid API response format");
      }

      const employerData: Employer[] = response.data.employers.map((employer: any) => {
        const employerIdForAPI = employer.employerId || employer._id || employer.id;
        const mongoId = employer._id || employer.id;

        const employerIdDisplay = employerIdForAPI
          ? employerIdForAPI.startsWith("EMP-")
            ? employerIdForAPI.split("-")[1] || employerIdForAPI.slice(-4)
            : employerIdForAPI.slice(-4)
          : "N/A";

        const mainContactPerson =
          Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
            ? employer.mainContactPersons[0].name || "N/A"
            : employer.mainContactPersonName || employer.mainContactPerson?.name || "N/A";

        const mainContactPersonPosition =
          Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
            ? employer.mainContactPersons[0].position || employer.jobPosition || "N/A"
            : employer.mainContactPersonPosition || employer.mainContactPerson?.position || "N/A";

        const mainContactNumber =
          Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
            ? employer.mainContactPersons[0].number || employer.mainContactNumber || "N/A"
            : employer.mainContactNumber || employer.mainContactPersonNumber || "N/A";

        const companyLogoPath = employer.companyLogo ? employer.companyLogo.replace(/\\/g, "/") : null;

        return {
          employerId: employerIdDisplay,
          companyLogo: companyLogoPath ? `${images}${companyLogoPath}` : null,
          companyLegalName: employer.companyLegalName || employer.companyName || "N/A",
          mainContactPerson,
          mainContactPersonPosition,
          mainContactNumber,
          companyEmail: employer.emailAddress || employer.companyEmail || "N/A",
          outlets: Array.isArray(employer.outlets) ? employer.outlets.length : 0,
          serviceAgreement: employer.serviceAgreement || "N/A",
          employerOriginalId: mongoId || "",
          employerIdForAPI: employerIdForAPI || mongoId || "",
        };
      });

      setEmployers(employerData);
      const pagination = response.data.pagination || {};
      setTotalPages(pagination.totalPages || response.data.totalPages || 1);
      setTotalItems(pagination.totalItems || response.data.totalItems || employerData.length);
    } catch (error: any) {
      console.error("Error fetching employer data:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch employers. Please try again later.");
      setEmployers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Filter employers based on search query
  const filteredEmployers = useMemo(() => {
    if (!searchQuery.trim()) return employers;

    const query = searchQuery.toLowerCase();
    return employers.filter((employer) => {
      return (
        employer.companyLegalName.toLowerCase().includes(query) ||
        employer.mainContactPerson.toLowerCase().includes(query) ||
        employer.companyEmail.toLowerCase().includes(query) ||
        employer.mainContactNumber.includes(query) ||
        employer.employerId.toLowerCase().includes(query)
      );
    });
  }, [employers, searchQuery]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        const menuElement = menuRefs.current[openMenuId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    if (openMenuId) {
      // Use a slight delay to ensure menu button click completes first
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openMenuId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = (id: string) => {
    const employer = employers.find((emp) => emp.employerOriginalId === id);
    const apiId = employer?.employerIdForAPI || id;
    setOpenMenuId(null);
    navigate(`/employers/${apiId}`);
  };

  const handleEdit = (id: string) => {
    const employer = employers.find((emp) => emp.employerOriginalId === id);
    const apiId = employer?.employerIdForAPI || id;
    setOpenMenuId(null);
    navigate(`/employers/${apiId}/edit`);
  };

  const handleDeleteClick = (id: string, name: string) => {
    const employer = employers.find((emp) => emp.employerOriginalId === id);
    const apiId = employer?.employerIdForAPI || id;
    setOpenMenuId(null);
    setShowDeleteModal({
      isOpen: true,
      employerId: apiId,
      employerName: name,
    });
  };

  const handleDelete = async () => {
    if (!showDeleteModal.employerId) return;

    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(`/admin/employers/${showDeleteModal.employerId}`);

      if (response.data?.success === false) {
        toast.error(response.data?.message || "Failed to delete employer");
        return;
      }

      toast.success("Employer deleted successfully");
      setShowDeleteModal({ isOpen: false, employerId: null, employerName: "" });
      fetchData();
    } catch (error: any) {
      console.error("Error deleting employer:", error);
      toast.error(error?.response?.data?.message || "Failed to delete employer. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In Discussion":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Expired":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employers</h1>
              <p className="mt-1 text-sm text-gray-500">
                {totalItems} {totalItems === 1 ? "employer" : "employers"} registered
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 lg:flex-initial lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Button */}
              <button
                onClick={() => toast("Filter functionality coming soon", { icon: "ℹ️" })}
                className="p-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                title="Filter"
              >
                <Filter className="w-5 h-5 text-gray-600" />
              </button>

              {/* Add Employer Button */}
              {isAdmin && (
                <Link to="/employers/add-employer">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium">
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Employer</span>
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading employers...</p>
            </div>
          </div>
        ) : filteredEmployers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? "No employers found" : "No employers yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? "Try adjusting your search terms"
                : isAdmin
                  ? "Get started by adding your first employer"
                  : "No employers have been registered yet"}
            </p>
            {isAdmin && !searchQuery && (
              <Link to="/employers/add-employer">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm">
                  <Plus className="w-5 h-5" />
                  Add Your First Employer
                </button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contact Person
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Outlets
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredEmployers.map((employer, index) => (
                      <tr
                        key={employer.employerOriginalId || index}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        {/* Company */}
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {employer.companyLogo ? (
                                <img
                                  src={employer.companyLogo}
                                  alt={employer.companyLegalName}
                                  className="w-12 h-12 rounded-xl object-cover border-2 border-gray-100"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                  {employer.companyLegalName?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">
                                {employer.companyLegalName}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">ID: {employer.employerId}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Person */}
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium text-gray-900">{employer.mainContactPerson}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{employer.mainContactPersonPosition}</div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {employer.mainContactNumber}
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{employer.companyEmail}</span>
                          </div>
                        </td>

                        {/* Outlets */}
                        <td className="px-6 py-5 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                            <Store className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">{employer.outlets}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              employer.serviceAgreement
                            )}`}
                          >
                            {employer.serviceAgreement}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5 text-center whitespace-nowrap">
                          <div
                            className="relative"
                            ref={(el) => {
                              if (el) {
                                menuRefs.current[employer.employerOriginalId] = el;
                              }
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === employer.employerOriginalId ? null : employer.employerOriginalId);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              type="button"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            {openMenuId === employer.employerOriginalId && (
                              <div
                                className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleView(employer.employerOriginalId);
                                  }}
                                  className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  type="button"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEdit(employer.employerOriginalId);
                                  }}
                                  className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  type="button"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit Employer
                                </button>
                                <div className="border-t border-gray-100">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteClick(employer.employerOriginalId, employer.companyLegalName);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    type="button"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Employer
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, totalItems)}
                      </span>{" "}
                      of <span className="font-medium">{totalItems}</span> results
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {filteredEmployers.map((employer, index) => (
                <div
                  key={employer.employerOriginalId || index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {employer.companyLogo ? (
                        <img
                          src={employer.companyLogo}
                          alt={employer.companyLegalName}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-gray-100 flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                          {employer.companyLegalName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{employer.companyLegalName}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">ID: {employer.employerId}</p>
                      </div>
                    </div>
                    <div
                      className="relative flex-shrink-0"
                      ref={(el) => {
                        if (el) {
                          menuRefs.current[employer.employerOriginalId] = el;
                        }
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === employer.employerOriginalId ? null : employer.employerOriginalId);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        type="button"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {openMenuId === employer.employerOriginalId && (
                        <div
                          className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleView(employer.employerOriginalId);
                            }}
                            className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            type="button"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEdit(employer.employerOriginalId);
                            }}
                            className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            type="button"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Employer
                          </button>
                          <div className="border-t border-gray-100">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteClick(employer.employerOriginalId, employer.companyLegalName);
                              }}
                              className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                              type="button"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Employer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{employer.mainContactPerson}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{employer.mainContactPersonPosition}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {employer.mainContactNumber}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{employer.companyEmail}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {employer.outlets} {employer.outlets === 1 ? "outlet" : "outlets"}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          employer.serviceAgreement
                        )}`}
                      >
                        {employer.serviceAgreement}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Mobile Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <span className="text-sm text-gray-500">{totalItems} total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal.isOpen}
        onClose={() => setShowDeleteModal({ isOpen: false, employerId: null, employerName: "" })}
        onConfirm={handleDelete}
        title="Delete Employer"
        message={`Are you sure you want to delete ${showDeleteModal.employerName}? This action cannot be undone. All employer data, jobs, and outlets will be permanently removed.`}
        confirmText={isDeleting ? "Deleting..." : "Delete Employer"}
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Employers;
