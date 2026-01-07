import React from "react";
import { Loader2 } from "lucide-react";

const EmployersLoadingState: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <div className="text-center">
          <p className="text-gray-700 font-medium">Loading employers</p>
          <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
};

export default EmployersLoadingState;

