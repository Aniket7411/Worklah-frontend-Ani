import React, { useEffect, useState } from "react";
import {
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Filter,
  Eye,
  Loader2,
} from "lucide-react";
import Pagination from "../../components/Pagination";
import { axiosInstance } from "../../lib/authInstances";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";

interface Employer {
  employerId: string; // Display format: "#e3d7"
  companyLegalName: string;
  companyLogo: string;
  mainContactPerson: string;
  mainContactPersonPosition: string;
  mainContactNumber: string;
  companyEmail: string;
  companyNumber: string;
  accountManager: string;
  industry: string;
  outlets: number;
  contractStartDate: string;
  contractEndDate: string;
  serviceAgreement: string;
  employerOriginalId: string; // MongoDB _id
  employerIdForAPI: string; // EMP-xxxx format (preferred) or _id (fallback)
}

const EmployerTable: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState<{ isOpen: boolean; employerId: string | null; employerName: string }>({
    isOpen: false,
    employerId: null,
    employerName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const images = "https://worklah.onrender.com";
  const isAdmin = user?.role === "ADMIN";

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/employers?page=${currentPage}&limit=10`);

      // Check for success field according to API spec
      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to fetch employers");
      }

      if (!response.data || !Array.isArray(response.data.employers)) {
        throw new Error("Invalid API response format");
      }

      const employerData = response.data.employers.map((employer: any) => {
        // Get employerId in EMP-xxxx format (preferred) or MongoDB _id (fallback)
        // According to API spec: prefer employerId format when available
        const employerIdForAPI = employer.employerId || employer._id || employer.id;
        const mongoId = employer._id || employer.id;

        // Display format: "#e3d7" from EMP-xxxx or last 4 chars of _id
        const employerIdDisplay = employerIdForAPI
          ? (employerIdForAPI.startsWith("EMP-")
            ? `#${employerIdForAPI.split("-")[1] || employerIdForAPI.slice(-4)}`
            : `#${employerIdForAPI.slice(-4)}`)
          : "N/A";

        // Handle mainContactPersons - API returns array
        const mainContactPerson = Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
          ? employer.mainContactPersons[0].name || "N/A"
          : employer.mainContactPersonName || employer.mainContactPerson?.name || "N/A";

        const mainContactPersonPosition = Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
          ? employer.mainContactPersons[0].position || employer.jobPosition || "N/A"
          : employer.mainContactPersonPosition || employer.mainContactPerson?.position || "N/A";

        // Handle contact number - from mainContactPersons array or mainContactNumber
        const mainContactNumber = Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0
          ? employer.mainContactPersons[0].number || employer.mainContactNumber || "N/A"
          : employer.mainContactNumber || employer.mainContactPersonNumber || "N/A";

        // Handle company logo path - normalize backslashes to forward slashes for URLs
        const companyLogoPath = employer.companyLogo
          ? employer.companyLogo.replace(/\\/g, '/')
          : null;

        return {
          employerId: employerIdDisplay,
          companyLogo: companyLogoPath ? `${images}${companyLogoPath}` : null,
          companyLegalName: employer.companyLegalName || employer.companyName || "N/A",
          hqAddress: employer.hqAddress || "N/A",
          mainContactPerson: mainContactPerson,
          mainContactPersonPosition: mainContactPersonPosition,
          mainContactNumber: mainContactNumber,
          companyEmail: employer.emailAddress || employer.companyEmail || "N/A",
          companyNumber: employer.officeNumber || employer.companyNumber || "N/A",
          accountManager: employer.accountManager || "N/A",
          industry: employer.industry || "N/A",
          outlets: Array.isArray(employer.outlets) ? employer.outlets.length : 0,
          contractStartDate: employer.contractStartDate?.substring(0, 10) || "N/A",
          contractEndDate: employer.contractExpiryDate?.substring(0, 10) || employer.contractEndDate?.substring(0, 10) || "N/A",
          serviceAgreement: employer.serviceAgreement || "N/A",
          employerOriginalId: mongoId || "",
          employerIdForAPI: employerIdForAPI || mongoId || ""
        };
      });

      setEmployers(employerData);
      // Handle pagination according to API spec structure
      const pagination = response.data.pagination || {};
      setTotalPages(pagination.totalPages || response.data.totalPages || 1);
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
  }, [currentPage]);



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePopupToggle = (index: number) => {
    setIsPopupOpen(isPopupOpen === index ? null : index);
  };

  const handleActionClick = (action: string, id: string | number) => {
    // Find employer by original ID (MongoDB _id)
    const employer = employers.find(emp =>
      emp.employerOriginalId === id ||
      emp.employerIdForAPI === id ||
      emp.employerId === id
    );

    // Use employerIdForAPI (EMP-xxxx format preferred) for API calls
    const apiId = employer?.employerIdForAPI || String(id);

    if (action === "View") {
      navigate(`/employers/${apiId}`);
    } else if (action === "Edit") {
      navigate(`/employers/${apiId}/edit`);
    } else if (action === "Delete") {
      setShowDeleteModal({
        isOpen: true,
        employerId: apiId,
        employerName: employer?.companyLegalName || "this employer",
      });
    }
    setIsPopupOpen(null);
  };

  const handleDelete = async () => {
    if (!showDeleteModal.employerId) return;

    setIsDeleting(true);
    try {
      // API accepts both EMP-xxxx format and MongoDB ObjectId
      const response = await axiosInstance.delete(`/employers/${showDeleteModal.employerId}`);

      // Check for success field according to API spec
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


  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isPopupOpen !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.action-menu-container')) {
          setIsPopupOpen(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopupOpen]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-[36px] font-[500] text-[#1F2937]">Employers</h1>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/employers/add-employer">
                <button className="p-3 sm:p-[14px] rounded-full shadow-md bg-white hover:bg-gray-50 transition-all duration-200 border border-gray-200">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </Link>
            )}
            <button className="p-3 sm:p-[14px] rounded-full shadow-md bg-dark hover:bg-slate-800 transition-all duration-200">
              <Filter
                className="w-5 h-5 sm:w-6 sm:h-6"
                color="#FFFFFF"
                fill="#ffffff"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#048BE1]" />
            <p className="text-gray-500 text-sm">Loading employers...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex-1 rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm flex flex-col">
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse table-fixed">

                <thead className="bg-[#EDF8FF] sticky top-0 z-20">
                  <tr>
                    <th className="w-[80px] py-5 px-4 border-b border-gray-300 text-left text-sm sm:text-base font-semibold text-gray-700">
                      ID
                    </th>
                    <th className="w-[90px] py-5 px-4 border-b border-gray-300 text-left text-sm sm:text-base font-semibold text-gray-700">
                      Logo
                    </th>
                    <th className="w-[160px] min-w-[160px] py-5 px-4 border-b border-gray-300 text-left text-sm sm:text-base font-semibold text-gray-700">
                      Company Name
                    </th>
                    <th className="w-[140px] min-w-[140px] py-5 px-4 border-b border-gray-300 text-left text-sm sm:text-base font-semibold text-gray-700 hidden md:table-cell">
                      Contact Person
                    </th>
                    <th className="w-[120px] min-w-[120px] py-5 px-4 border-b border-gray-300 text-left text-sm sm:text-base font-semibold text-gray-700 hidden lg:table-cell">
                      Position
                    </th>
                    <th className="w-[140px] min-w-[140px] py-5 px-4 border-b border-gray-300 text-left text-sm sm:text-base font-semibold text-gray-700 hidden lg:table-cell">
                      Contact Number
                    </th>
                    <th className="w-[200px] min-w-[200px] py-5 px-4 border-b border-gray-300 text-left text-sm sm:text-base font-semibold text-gray-700 hidden md:table-cell">
                      Email
                    </th>
                    <th className="w-[120px] min-w-[120px] py-5 px-4 border-b border-gray-300 text-left text-sm sm:text-base font-semibold text-gray-700 hidden xl:table-cell">
                      Company #
                    </th>
                    <th className="w-[140px] min-w-[140px] py-5 px-4 border-b border-gray-300 text-left text-sm sm:text-base font-semibold text-gray-700 hidden xl:table-cell">
                      Account Manager
                    </th>
                    <th className="w-[130px] min-w-[130px] py-5 px-4 border-b border-gray-300 text-left text-sm sm:text-base font-semibold text-gray-700 hidden lg:table-cell">
                      Industry
                    </th>
                    <th className="w-[90px] py-5 px-4 border-b border-gray-300 text-center text-sm sm:text-base font-semibold text-gray-700">
                      Outlets
                    </th>
                    <th className="w-[120px] min-w-[120px] py-5 px-4 border-b border-gray-300 text-left text-sm sm:text-base font-semibold text-gray-700 hidden xl:table-cell">
                      Start Date
                    </th>
                    <th className="w-[120px] min-w-[120px] py-5 px-4 border-b border-gray-300 text-left text-sm sm:text-base font-semibold text-gray-700 hidden xl:table-cell">
                      End Date
                    </th>
                    <th className="w-[140px] min-w-[140px] py-5 px-4 border-b border-gray-300 text-left text-sm sm:text-base font-semibold text-gray-700">
                      Agreement
                    </th>
                    <th className="w-[80px] py-5 px-4 border-b border-gray-300 text-center sticky right-0 bg-[#EDF8FF] z-30">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employers.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="p-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Plus className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium text-sm">No employers found</p>
                            <p className="text-gray-400 text-xs mt-1">Get started by adding your first employer</p>
                          </div>
                          {isAdmin && (
                            <Link to="/employers/add-employer">
                              <button className="mt-2 px-4 py-2 bg-[#048BE1] text-white rounded-lg hover:bg-[#0370b8] transition-colors text-sm font-medium">
                                Add Employer
                              </button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    employers.map((employer, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors bg-white">
                        <td className="py-5 px-4 text-left text-sm sm:text-base font-medium text-gray-700">
                          {employer.employerId}
                        </td>
                        <td className="py-5 px-4 text-left">
                          {employer.companyLogo ? (
                            <img
                              src={employer.companyLogo}
                              alt="Company Logo"
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                if (target.nextElementSibling) {
                                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-base sm:text-lg font-semibold text-blue-700 border border-blue-200 ${employer.companyLogo ? 'hidden' : ''}`}
                          >
                            {employer.companyLegalName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        </td>
                        <td className="py-5 px-4 text-left">
                          <div className="font-medium text-gray-900 text-sm sm:text-base truncate" title={employer.companyLegalName}>
                            {employer.companyLegalName}
                          </div>
                        </td>
                        <td className="py-5 px-4 text-left text-sm sm:text-base text-gray-700 hidden md:table-cell">
                          <div className="truncate" title={employer.mainContactPerson}>
                            {employer.mainContactPerson}
                          </div>
                        </td>
                        <td className="py-5 px-4 text-left text-sm sm:text-base text-gray-600 hidden lg:table-cell">
                          <div className="truncate" title={employer.mainContactPersonPosition}>
                            {employer.mainContactPersonPosition}
                          </div>
                        </td>
                        <td className="py-5 px-4 text-left text-sm sm:text-base text-gray-700 hidden lg:table-cell">
                          <div className="truncate" title={employer.mainContactNumber}>
                            {employer.mainContactNumber}
                          </div>
                        </td>
                        <td className="py-5 px-4 text-left text-sm sm:text-base text-gray-700 hidden md:table-cell">
                          <div className="truncate" title={employer.companyEmail}>
                            {employer.companyEmail}
                          </div>
                        </td>
                        <td className="py-5 px-4 text-left text-sm sm:text-base text-gray-700 hidden xl:table-cell">
                          <div className="truncate" title={employer.companyNumber}>
                            {employer.companyNumber}
                          </div>
                        </td>
                        <td className="py-5 px-4 text-left text-sm sm:text-base text-gray-700 hidden xl:table-cell">
                          <div className="truncate" title={employer.accountManager}>
                            {employer.accountManager}
                          </div>
                        </td>
                        <td className="py-5 px-4 text-left text-sm sm:text-base text-gray-700 hidden lg:table-cell">
                          <span className="inline-block px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 text-sm font-medium truncate max-w-full">
                            {employer.industry}
                          </span>
                        </td>
                        <td className="py-5 px-4 text-center text-sm sm:text-base">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                            {employer.outlets}
                          </span>
                        </td>
                        <td className="py-5 px-4 text-left text-sm sm:text-base text-gray-600 hidden xl:table-cell">
                          {employer.contractStartDate !== "N/A" ? employer.contractStartDate : "-"}
                        </td>
                        <td className="py-5 px-4 text-left text-sm sm:text-base text-gray-600 hidden xl:table-cell">
                          {employer.contractEndDate !== "N/A" ? employer.contractEndDate : "-"}
                        </td>
                        <td className="py-5 px-4 text-left">
                          <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${employer.serviceAgreement === "Completed"
                            ? "bg-[#DBF1FF] text-[#048BE1]"
                            : employer.serviceAgreement === "In Discussion"
                              ? "bg-[#DEFFDF] text-[#049609]"
                              : employer.serviceAgreement === "Expired"
                                ? "bg-[#FFECE8] text-[#E34E30]"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                            {employer.serviceAgreement}
                          </span>
                        </td>

                        <td className="py-5 px-4 text-center sticky right-0 bg-white z-30">
                          <div className="relative action-menu-container">
                            <button
                              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                              onClick={() => handlePopupToggle(index)}
                            >
                              <MoreVertical size={20} />
                            </button>
                            {isPopupOpen === index && (
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white shadow-xl border border-gray-200 rounded-lg z-50 overflow-hidden">
                                <button
                                  className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                                  onClick={() => handleActionClick("View", employers[index]?.employerOriginalId || "")}
                                >
                                  <Eye size={16} />
                                  View Details
                                </button>
                                <button
                                  className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                                  onClick={() =>
                                    handleActionClick("Edit", employers[index]?.employerOriginalId || "")
                                  }
                                >
                                  <Edit size={16} />
                                  Edit
                                </button>
                                <button
                                  className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm text-[#E34E30] hover:bg-red-50 transition-colors"
                                  onClick={() => handleActionClick("Delete", employers[index]?.employerOriginalId || "")}
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
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex-shrink-0 flex justify-center items-center mt-6">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal.isOpen}
        onClose={() => setShowDeleteModal({ isOpen: false, employerId: null, employerName: "" })}
        onConfirm={handleDelete}
        title="Delete Employer"
        message={`Are you sure you want to delete ${showDeleteModal.employerName}? This action cannot be undone and will permanently remove all employer data, including associated jobs and outlets.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default EmployerTable;
