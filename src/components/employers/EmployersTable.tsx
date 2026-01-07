import React from "react";
import { MoreVertical, Edit, Trash2, Eye, Phone, Mail, Store } from "lucide-react";
import { Link } from "react-router-dom";

export interface Employer {
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

interface EmployersTableProps {
  employers: Employer[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  openMenuIndex: number | null;
  onToggleMenu: (index: number | null) => void;
}

const EmployersTable: React.FC<EmployersTableProps> = ({
  employers,
  onView,
  onEdit,
  onDelete,
  openMenuIndex,
  onToggleMenu,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
              Contact Person
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              Contact
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
              Email
            </th>
            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Outlets
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employers.map((employer, index) => (
            <tr
              key={employer.employerOriginalId || index}
              className="hover:bg-gray-50 transition-colors"
            >
              {/* Company Column */}
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {employer.companyLogo ? (
                      <img
                        src={employer.companyLogo}
                        alt={employer.companyLegalName}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center font-semibold text-blue-700 ${
                        employer.companyLogo ? "hidden" : "flex"
                      }`}
                    >
                      {employer.companyLegalName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {employer.companyLegalName}
                    </div>
                    <div className="text-xs text-gray-500">ID: {employer.employerId}</div>
                  </div>
                </div>
              </td>

              {/* Contact Person Column */}
              <td className="py-4 px-4 hidden md:table-cell">
                <div className="text-sm text-gray-900">{employer.mainContactPerson}</div>
                <div className="text-xs text-gray-500">{employer.mainContactPersonPosition}</div>
              </td>

              {/* Contact Column */}
              <td className="py-4 px-4 hidden lg:table-cell">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{employer.mainContactNumber}</span>
                </div>
              </td>

              {/* Email Column */}
              <td className="py-4 px-4 hidden md:table-cell">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{employer.companyEmail}</span>
                </div>
              </td>

              {/* Outlets Column */}
              <td className="py-4 px-4 text-center">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full">
                  <Store className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{employer.outlets}</span>
                </div>
              </td>

              {/* Status Column */}
              <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    employer.serviceAgreement === "Completed"
                      ? "bg-green-100 text-green-700"
                      : employer.serviceAgreement === "In Discussion"
                      ? "bg-blue-100 text-blue-700"
                      : employer.serviceAgreement === "Expired"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {employer.serviceAgreement}
                </span>
              </td>

              {/* Actions Column */}
              <td className="py-4 px-4 text-center">
                <div className="relative action-menu-container">
                  <button
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleMenu(openMenuIndex === index ? null : index);
                    }}
                    type="button"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {openMenuIndex === index && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => onToggleMenu(null)}
                        onTouchMove={(e) => e.preventDefault()}
                        style={{ touchAction: 'none', pointerEvents: 'auto' }}
                      />
                      <div 
                        className="absolute right-0 top-full mt-1 w-40 bg-white shadow-lg border border-gray-200 rounded-lg z-50 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.preventDefault()}
                        style={{ touchAction: 'none' }}
                      >
                        <button
                          className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleMenu(null);
                            // Use setTimeout to ensure menu closes and body scroll is restored before navigation
                            setTimeout(() => {
                              onView(employer.employerOriginalId);
                            }, 0);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleMenu(null);
                            // Use setTimeout to ensure menu closes and body scroll is restored before navigation
                            setTimeout(() => {
                              onEdit(employer.employerOriginalId);
                            }, 0);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <div className="border-t border-gray-100">
                          <button
                            className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => {
                              onDelete(employer.employerOriginalId, employer.companyLegalName);
                              onToggleMenu(null);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployersTable;

