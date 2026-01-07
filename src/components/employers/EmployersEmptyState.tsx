import React from "react";
import { Building2, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface EmployersEmptyStateProps {
  isAdmin: boolean;
}

const EmployersEmptyState: React.FC<EmployersEmptyStateProps> = ({ isAdmin }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-4">
        <Building2 className="w-10 h-10 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No employers found</h3>
      <p className="text-gray-500 text-sm text-center max-w-md mb-6">
        Get started by adding your first employer to the system
      </p>
      {isAdmin && (
        <Link to="/employers/add-employer">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add First Employer</span>
          </button>
        </Link>
      )}
    </div>
  );
};

export default EmployersEmptyState;

