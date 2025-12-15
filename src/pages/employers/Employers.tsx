import React, { useEffect, useState } from "react";
import {
  MoreVertical,
  PhoneCall,
  Edit,
  Trash2,
  UserCheck,
  Plus,
  Filter,
  Eye,
  Ban,
} from "lucide-react";
import Pagination from "../../components/Pagination";
import { axiosInstance } from "../../lib/authInstances";
import { Link, useNavigate } from "react-router-dom";
import { CustomScrollbar } from "../../components/layout/CustomScrollbar";

interface Employer {
  employerId: string;
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
}

const EmployerTable: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const navigate = useNavigate()
  const images = "https://worklah.onrender.com"

  // useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/employers?page=${currentPage}&limit=10`);

      // Check for success field according to API spec
      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to fetch employers");
      }

      if (!response.data || !Array.isArray(response.data.employers)) {
        throw new Error("Invalid API response format");
      }

      const employerData = response.data.employers.map((employer: any) => ({
        employerId: `#${employer._id.slice(-4)}`,
        companyLogo: employer.companyLogo ? `${images}${employer.companyLogo}` : null,

        companyLegalName: employer.companyLegalName || employer.companyName,
        hqAddress: employer.hqAddress,
        mainContactPerson: employer.mainContactPersonName || "N/A", // Fix Key
        mainContactPersonPosition: employer.mainContactPersonPosition || "N/A",
        mainContactNumber: employer.mainContactPersonNumber || "N/A", // Fix Key
        companyEmail: employer.companyEmail || "N/A",
        companyNumber: employer.companyNumber || "N/A",
        accountManager: employer.accountManager || "N/A",
        industry: employer.industry || "N/A",
        // outlets: employer.outlets || 0,
        outlets: Array.isArray(employer.outlets) ? employer.outlets.length : 0,
        contractStartDate: employer.contractStartDate?.substring(0, 10) || "N/A",
        contractEndDate: employer.contractEndDate?.substring(0, 10) || "N/A",
        serviceAgreement: employer.serviceAgreement || "N/A",
        employerOriginalId: employer._id
      }));


      setEmployers(employerData);
      // Handle pagination according to API spec structure
      const pagination = response.data.pagination || {};
      setTotalPages(pagination.totalPages || response.data.totalPages || 1);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("Failed to fetch employers. Please try again later.");
      console.error("Error fetching employer data:", error);
    }
  };

  //   fetchData();
  // }, [currentPage]);

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
    if (action === "View") {
      navigate(`/employers/${id}`);
    } else if (action === "Edit") {
      navigate(`/employers/${id}/edit`);
    }
    setIsPopupOpen(null);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this employer?");
    if (!confirmDelete) return;

    try {
      const response = await axiosInstance.delete(`/employers/${id}`);
      
      // Check for success field according to API spec
      if (response.data?.success === false) {
        alert(response.data?.message || "Failed to delete employer");
        return;
      }

      setEmployers((prevEmployers) => prevEmployers.filter(emp => emp.employerId !== id));

      alert("Employer deleted successfully!");

      fetchData();
    } catch (error) {
      console.error("Error deleting employer:", error);
      alert("Failed to delete employer. Please try again.");
    }
  };


  return (
    <div className="w-full max-w-full">
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-[36px] font-[500] text-[#1F2937]">Employers</h1>

          <div className="flex items-center gap-3">
            <Link to="/employers/add-employer">
              <button className="p-3 sm:p-[14px] rounded-full shadow-md bg-white hover:bg-gray-50 transition-all duration-200 border border-gray-200">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </Link>
            <button className="p-3 sm:p-[14px] rounded-full shadow-md bg-dark hover:bg-slate-800 transition-all duration-200">
              <Filter
                className="w-5 h-5 sm:w-6 sm:h-6"
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
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  ID
                </th>
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Logo
                </th>
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Company Name
                </th>
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden lg:table-cell">
                  Contact Person
                </th>
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden xl:table-cell">
                  Position
                </th>
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden xl:table-cell">
                  Contact Number
                </th>
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden lg:table-cell">
                  Email
                </th>
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden 2xl:table-cell">
                  Company #
                </th>
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden 2xl:table-cell">
                  Account Manager
                </th>
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden xl:table-cell">
                  Industry
                </th>
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Outlets
                </th>
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden 2xl:table-cell">
                  Start Date
                </th>
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden 2xl:table-cell">
                  End Date
                </th>
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  Agreement
                </th>
                <th className="py-3 px-3 md:px-4 border-b border-gray-300 text-center sticky right-0 bg-[#EDF8FF]">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {employers.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-gray-500">
                    No employers found
                  </td>
                </tr>
              ) : (
                employers.map((employer, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">

                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-left text-xs sm:text-sm">
                      {employer.employerId}
                    </td>
                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-left">
                      {employer.companyLogo ? (
                        <img
                          src={employer.companyLogo}
                          alt="Company Logo"
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                          {employer.companyLegalName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </td>
                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-left text-xs sm:text-sm font-medium">
                      {employer.companyLegalName}
                    </td>
                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-left text-xs sm:text-sm hidden lg:table-cell">
                      {employer.mainContactPerson}
                    </td>
                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-left text-xs sm:text-sm hidden xl:table-cell">
                      {employer.mainContactPersonPosition}
                    </td>
                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-left text-xs sm:text-sm hidden xl:table-cell">
                      {employer.mainContactNumber}
                    </td>
                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-left text-xs sm:text-sm hidden lg:table-cell truncate max-w-[200px]">
                      {employer.companyEmail}
                    </td>
                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-left text-xs sm:text-sm hidden 2xl:table-cell">
                      {employer.companyNumber}
                    </td>
                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-left text-xs sm:text-sm hidden 2xl:table-cell">
                      {employer.accountManager}
                    </td>
                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-left text-xs sm:text-sm hidden xl:table-cell">
                      {employer.industry}
                    </td>
                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-left text-xs sm:text-sm font-medium">
                      {employer.outlets}
                    </td>
                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-left text-xs sm:text-sm hidden 2xl:table-cell">
                      {employer.contractStartDate}
                    </td>
                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-left text-xs sm:text-sm hidden 2xl:table-cell">
                      {employer.contractEndDate}
                    </td>
                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-left">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        employer.serviceAgreement === "Completed"
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

                    <td className="border-b border-gray-200 py-3 px-3 md:px-4 text-center sticky right-0 bg-white">
                      <div className="relative">
                        <button
                          className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                          onClick={() => handlePopupToggle(index)}
                        >
                          <MoreVertical size={18} />
                        </button>
                        {isPopupOpen === index && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white shadow-lg border border-gray-200 rounded-lg z-20">
                            <button
                              className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => handleActionClick("View", employers[index]?.employerOriginalId || "")}
                            >
                              <Eye size={16} />
                              View
                            </button>
                            <button
                              className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() =>
                                handleActionClick("Edit", employers[index]?.employerOriginalId || "")
                              }
                            >
                              <Edit size={16} />
                              Edit
                            </button>
                            <button
                              className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-[#E34E30] hover:bg-red-50 transition-colors"
                              onClick={() => handleActionClick("Block", index)}
                            >
                              <Ban size={16} color="#E34E30" />
                              Block
                            </button>
                            <button
                              className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-[#E34E30] hover:bg-red-50 transition-colors"
                              onClick={() => handleDelete(employers[index]?.employerOriginalId || "")}
                            >
                              <Trash2 size={16} color="#E34E30" />
                              Remove
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
        {/* <CustomScrollbar
          scrollContainerRef={scrollContainerRef}
          totalSteps={3}
        /> */}
        {/* Pagination */}
        {/* <div className="flex justify-center items-center gap-2 mt-20">
          <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
            ←
          </button>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-blue-500 rounded-md bg-blue-500 text-white">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
              3
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
              4
            </button>
            <span className="px-3 py-1">...</span>
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
              55
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
              56
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
              57
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
              58
            </button>
          </div>
          <button className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
            →
          </button>
        </div> */}

        <div className="flex flex-col items-center justify-center bg-gray-50">
          <Pagination
            totalPages={totalPages} // Adjust the total pages
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployerTable;
