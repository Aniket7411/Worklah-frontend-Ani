import React from "react";
import { Plus, Filter, Search } from "lucide-react";
import { Link } from "react-router-dom";

// Employers Header Component

interface EmployersHeaderProps {
  totalCount: number;
  isAdmin: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
}

const EmployersHeader: React.FC<EmployersHeaderProps> = ({
  totalCount,
  isAdmin,
  searchQuery,
  onSearchChange,
  onFilterClick,
}) => {
  return (
    <div className="flex-shrink-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-6 pb-4 border-b border-gray-200 bg-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Employers</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalCount} {totalCount === 1 ? "employer" : "employers"} registered
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employers..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {isAdmin && (
            <Link to="/employers/add-employer">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Add Employer</span>
              </button>
            </Link>
          )}
          <button
            onClick={onFilterClick}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployersHeader;

