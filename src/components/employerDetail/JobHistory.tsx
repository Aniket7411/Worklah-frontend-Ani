import { CalendarCheck, CalendarX2, Clock } from "lucide-react";
import React from "react";
import { GoChecklist } from "react-icons/go";
import { MdOutlineVerifiedUser } from "react-icons/md";

const JobHistory = ({ jobHistory }) => {

  return (
    <div className="grid grid-cols-3 gap-8 py-4">
      <StatItem
        icon={CalendarCheck}
        label="Attendance Rate"
        value={jobHistory?.attendanceRate ? `${jobHistory.attendanceRate}` : "N/A"}
      />
      <StatItem
        icon={MdOutlineVerifiedUser}
        label="Cancellation with Proof"
        value={jobHistory?.cancellationWithProof ?? "N/A"}
      />
      <StatItem
        icon={Clock}
        label="No Show"
        value={jobHistory?.neverTurnUp ?? "N/A"}
      />
      <StatItem
        icon={Clock}
        label="Total Working Hours"
        value={jobHistory?.workingHours ?? "N/A"}
      />
      <StatItem
        icon={GoChecklist}
        label="Total Completed Jobs"
        value={jobHistory?.totalCompletedJobs ?? "N/A"}
      />
      {/* <StatItem
        icon={CalendarX2}
        label="More than 24hrs Cancellation"
        value={jobHistory?.moreThan24hrsCancellation ?? "N/A"}
      /> */}
      <StatItem
        icon={CalendarX2}
        label="Less than 24hrs Cancellation"
        value={jobHistory?.lessThan24hrsCancellation ?? "N/A"}
      />
    </div>
  );
};

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
}

const StatItem: React.FC<StatItemProps> = ({ icon: Icon, label, value }) => (
  <div className="py-4">
    <div className="flex items-center gap-2 text-gray-600 mb-4">
      <Icon className="w-[20px] h-[20px]" color="#4c4c4c" />
      <span className="text-[16px] leading-[20px] text-[#4c4c4c] font-medium">
        {label}
      </span>
    </div>
    <p className="text-[24px] font-normal leading-[30px] text-[#000000]">{value}</p>
  </div>
);

export default JobHistory;
