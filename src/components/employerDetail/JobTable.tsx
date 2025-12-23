import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

const JobTable: React.FC<{ summaryData: any; jobData: any }> = ({ summaryData, jobData }) => {

  const months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="p-4">
      {/* Month Tabs */}
      <div className="relative flex items-center">
        <button className="absolute left-0 z-999" onClick={scrollLeft}>
          <ChevronLeft className="rounded-full p-2 shadow-lg w-10 h-10" />
        </button>
        <div ref={scrollContainerRef} className="flex-1 overflow-x-hidden scrollbar-hide mx-8 z-0">
          <div className="flex gap-2 px-4">
            {months.map((month, index) => (
              <button
                key={month}
                className={`px-6 py-3 m-1 border rounded-full text-sm ${
                  selectedMonth === index ? "bg-blue-300" : "hover:bg-blue-100"
                }`}
                onClick={() => setSelectedMonth(index)}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
        <button className="absolute right-0 z-999" onClick={scrollRight}>
          <ChevronRight className="rounded-full p-2 shadow-lg w-10 h-10" />
        </button>
      </div>

      {/* Summary Section */}
      <div className="mt-4 p-4 text-sm">
        <table className="table-auto w-full border-separate border-spacing-y-4">
          <thead>
            <tr className="bg-[#EDF8FF]">
              <th className="px-6 py-4 text-center rounded-l-full">Jobs Posted:</th>
              <th className="px-6 py-4 text-center">Filled Vacancy:</th>
              <th className="px-6 py-4 text-center">Filled Standby:</th>
              <th className="px-6 py-4 text-center">Standby Absentees:</th>
              <th className="px-6 py-4 text-center rounded-r-full">Avg. Monthly Att.:</th>
            </tr>
          </thead>
          <tbody>
            {summaryData && (
              <tr className="bg-gray-50 shadow-md">
                <td className="px-6 py-6 text-center">{summaryData.jobsPosted}</td>
                <td className="px-6 py-6 text-center">{summaryData.filledVacancy}</td>
                <td className="px-6 py-6 text-center">{summaryData.filledStandby}</td>
                <td className="px-6 py-6 text-center">{summaryData.standbyAbsentees}</td>
                <td className="px-6 py-6 text-center">{summaryData.avgMonthlyAttendance}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Job Data Table */}
      <div className="mt-4 overflow-auto bg-white rounded-md shadow-md max-h-[704px] border border-gray-300">
        <div className="p-4 bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="table-auto w-full text-sm">
            <thead className="bg-gray-300">
              <tr>
                <th className="px-8 py-4 text-center text-gray-700 rounded-l-lg">Date</th>
                <th className="px-8 py-4 text-center text-gray-700">Jobs</th>
                <th className="px-8 py-4 text-center text-gray-700">Job Status</th>
                <th className="px-8 py-4 text-center text-gray-700">Shift Time</th>
                <th className="px-8 py-4 text-center text-gray-700">Vacancy Filled</th>
                <th className="px-8 py-4 text-center text-gray-700">Standby Filled</th>
                <th className="px-8 py-4 text-center text-gray-700 rounded-r-lg">Total Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border border-gray-300">
              {jobData?.map((data: any, index: number) => (
                <React.Fragment key={index}>
                  {data.jobs.map((job: any, jobIndex: number) => (
                    <tr key={jobIndex} className="bg-gray-50">
                      {jobIndex === 0 && (
                        <td rowSpan={data.jobs.length} className="px-2 py-2 text-center border-r text-[16px]">
                          {data.date}
                        </td>
                      )}
                      <td className="px-2 py-2 border-r">{job.jobName}</td>
                      <td className="px-2 py-2 border-r">
                        <span className="px-14 py-2 ms-2 mt-2 text-center rounded-full bg-green-100 text-green-600">
                          {job.jobStatus}
                        </span>
                      </td>
                      <td className="px-2 py-2 border-r">{`${job.shiftTime} ${job.shiftMeridian} - ${job.shiftEndTime} ${job.shiftEndMeridian}`}</td>
                      <td className="px-2 py-2 border-r">{job.vacancyFilled}</td>
                      <td className="px-2 py-2 border-r">{job.standbyFilled}</td>
                      <td className="px-2 py-2 border-r">{job.totalApplied}</td>
                    </tr>
                  ))}
                  <tr className="h-4">
                    <td colSpan={7} className="border-none"></td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobTable;
