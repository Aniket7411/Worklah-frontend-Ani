import React from "react";
import { MoreVertical, Edit, Trash2, Eye, Phone, Mail, Store, Building2 } from "lucide-react";
import { Employer } from "./EmployersTable";

interface EmployersCardProps {
  employers: Employer[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  openMenuIndex: number | null;
  onToggleMenu: (index: number | null) => void;
}

const EmployersCard: React.FC<EmployersCardProps> = ({
  employers,
  onView,
  onEdit,
  onDelete,
  openMenuIndex,
  onToggleMenu,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {employers.map((employer, index) => (
        <div
          key={employer.employerOriginalId || index}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative"
        >
          {/* Card Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {employer.companyLogo ? (
                  <img
                    src={employer.companyLogo}
                    alt={employer.companyLegalName}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center font-semibold text-blue-700 ${
                    employer.companyLogo ? "hidden" : "flex"
                  }`}
                >
                  {employer.companyLegalName?.charAt(0)?.toUpperCase() || "?"}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {employer.companyLegalName}
                </h3>
                <p className="text-xs text-gray-500">ID: {employer.employerId}</p>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative flex-shrink-0 action-menu-container">
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
          </div>

          {/* Card Body */}
          <div className="space-y-2">
            {/* Contact Person */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-20">Contact:</span>
              <span className="text-gray-900 font-medium flex-1 truncate">
                {employer.mainContactPerson}
              </span>
            </div>

            {/* Position */}
            {employer.mainContactPersonPosition && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 w-20">Position:</span>
                <span className="text-gray-600 flex-1 truncate">
                  {employer.mainContactPersonPosition}
                </span>
              </div>
            )}

            {/* Phone */}
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-900">{employer.mainContactNumber}</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 truncate">{employer.companyEmail}</span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <Store className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {employer.outlets} {employer.outlets === 1 ? "outlet" : "outlets"}
                </span>
              </div>
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployersCard;

