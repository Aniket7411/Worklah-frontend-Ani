import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import { useAuth } from "../../context/AuthContext";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
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
import { transformEmployerList } from "../../utils/dataTransformers";

interface DeleteModalState {
  isOpen: boolean;
  employerId: string | null;
  employerName: string;
}

interface EmployerItem {
  employerId: string;
  companyLogo: string | null;
  companyLegalName: string;
  mainContactPerson: string;
  mainContactPersonPosition: string;
  mainContactNumber: string;
  companyEmail: string;
  outlets: number;
  serviceAgreement: string;
  industry: string;
  employerOriginalId: string;
  employerIdForAPI: string;
}

const Employers = () => {
  const [employers, setEmployers] = useState<EmployerItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    employerId: null,
    employerName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const itemsPerPage = 10;

  // Fetch employers data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/admin/employers?page=${currentPage}&limit=${itemsPerPage}`);

      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to fetch employers");
      }

      const employerData = transformEmployerList(response.data);
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
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter employers based on search query and filters
  const filteredEmployers = useMemo(() => {
    let filtered = [...employers];

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((employer) => {
        return (
          employer.companyLegalName.toLowerCase().includes(query) ||
          employer.mainContactPerson.toLowerCase().includes(query) ||
          employer.companyEmail.toLowerCase().includes(query) ||
          employer.mainContactNumber.includes(query) ||
          employer.employerId.toLowerCase().includes(query)
        );
      });
    }

    // Apply status filter
    if (filterStatus) {
      filtered = filtered.filter((employer) => employer.serviceAgreement === filterStatus);
    }

    // Apply industry filter
    if (filterIndustry) {
      filtered = filtered.filter((employer) => {
        const employerIndustry = employer.industry || "";
        return employerIndustry === filterIndustry;
      });
    }

    return filtered;
  }, [employers, searchQuery, filterStatus, filterIndustry]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const getEmployerApiId = useCallback((id: string) => {
    const employer = employers.find((emp) => emp.employerOriginalId === id);
    return employer?.employerIdForAPI || id;
  }, [employers]);

  const handleView = useCallback((id: string) => {
    navigate(`/employers/${getEmployerApiId(id)}`);
  }, [navigate, getEmployerApiId]);

  const handleEdit = useCallback((id: string) => {
    navigate(`/employers/${getEmployerApiId(id)}/edit`);
  }, [navigate, getEmployerApiId]);

  const handleDeleteClick = useCallback((id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      employerId: getEmployerApiId(id),
      employerName: name,
    });
  }, [getEmployerApiId]);

  const handleDelete = useCallback(async () => {
    if (!deleteModal.employerId) return;

    setIsDeleting(true);
    try {
      const res = await axiosInstance.delete(`/admin/employers/${deleteModal.employerId}`);

      if (res.data?.success === false) {
        toast.error(res.data?.message || "Failed to delete employer");
        return;
      }

      toast.success("Employer deleted successfully");
      setDeleteModal({ isOpen: false, employerId: null, employerName: "" });
      fetchData();
    } catch (error: any) {
      console.error("Error deleting employer:", error);
      toast.error(error?.response?.data?.message || "Failed to delete employer. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteModal, fetchData]);

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
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="pl-2 border-l-4 border-[#FED408]">
              <h1 className="text-2xl font-bold text-gray-900">Employers</h1>
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
                onClick={() => setShowFilterModal(true)}
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={() => handleView(employer.employerOriginalId)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              type="button"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden xl:inline">View</span>
                            </button>
                            <button
                              onClick={() => handleEdit(employer.employerOriginalId)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              type="button"
                              title="Edit Employer"
                            >
                              <Edit className="w-4 h-4" />
                              <span className="hidden xl:inline">Edit</span>
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteClick(employer.employerOriginalId, employer.companyLegalName)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                type="button"
                                title="Delete Employer"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden xl:inline">Delete</span>
                              </button>
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
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleView(employer.employerOriginalId)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        type="button"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleEdit(employer.employerOriginalId)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        type="button"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteClick(employer.employerOriginalId, employer.companyLegalName)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
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

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Filter Employers</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Agreement Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="In Discussion">In Discussion</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Industries</option>
                  <option value="F&B">F&B (Food & Beverage)</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Retail">Retail</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Construction">Construction</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setFilterStatus("");
                    setFilterIndustry("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, employerId: null, employerName: "" })}
        onConfirm={handleDelete}
        title="Delete Employer"
        message={`Are you sure you want to delete ${deleteModal.employerName}? This action cannot be undone. All employer data, jobs, and outlets will be permanently removed.`}
        confirmText={isDeleting ? "Deleting..." : "Delete Employer"}
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Employers;
