import { id } from "date-fns/locale";
import { Eye, MoreVertical, RotateCcw } from "lucide-react";
import React, { useState } from "react";
import { FiEdit3 } from "react-icons/fi";

const jobs = [
  {
    id: "#12345",
    outlet: {
      title: "Cashier",
      img: "/assets/dominos-logo.png",
    },
    date: "11 Sept, 24",
    employer: "Right Service PTE. LTD",
    shifts: [
      {
        shiftId: "#12345",
        shiftTiming: "07:00 AM ---- 11:00 AM",
        clockedIn: "07:06 AM",
        clockedOut: "11:00 AM",
        breakIncluded: "1 Hrs",
        breakType: "Unpaid",
        fromConfirmed: "Confirmed",
        rateType: "Flat Rate",
        totalWage: "$80",
        wageGenerated: "$75",
        jobStatus: "Completed",
        paymentStatus: "Pending",
      },
    ],
  },
  {
    id: "#12346",
    outlet: {
      title: "Cashier",
      img: "/assets/dominos-logo.png",
    },
    date: "11 Sept, 24",
    employer: "Right Service PTE. LTD",
    shifts: [
      {
        shiftId: "#12345",
        shiftTiming: "07:00 AM ---- 11:00 AM",
        clockedIn: "07:06 AM",
        clockedOut: "11:00 AM",
        breakIncluded: "1 Hrs",
        breakType: "Unpaid",
        fromConfirmed: "Standby",
        rateType: "Flat Rate",
        totalWage: "$80",
        wageGenerated: "$75",
        jobStatus: "Completed",
        paymentStatus: "Pending",
      },
      {
        shiftId: "#12346",
        shiftTiming: "07:00 PM ---- 11:00 PM",
        clockedIn: "07:06 AM",
        clockedOut: "11:00 AM",
        breakIncluded: "1 Hrs",
        breakType: "Unpaid",
        fromConfirmed: "Standby",
        rateType: "Flat Rate",
        totalWage: "$80",
        wageGenerated: "$75",
        jobStatus: "Completed",
        paymentStatus: "Pending",
      },
    ],
  },
];

const WorkHistory = ({ workHistory }) => {
  const [isJobMenuOpen, setIsJobMenuOpen] = useState<number | null>(null);

  const toggleJobMenu = (index: number) =>
    setIsJobMenuOpen((prev) => (prev === index ? null : index));

  // Ensure workHistory is an array
  const safeWorkHistory = Array.isArray(workHistory) ? workHistory : [];

  return (
    <div className="py-4 overflow-x-auto">
      <table className="w-full table-auto ">
        <thead>
          <tr className="text-center text-[#048be1] text-[16px] leading-[20px] font-semibold">
            <th className="py-2 px-4 text-center truncate">Job</th>
            <th className="py-2 px-4 text-center truncate">Job Id</th>
            <th className="py-2 px-4 text-center truncate">Date</th>
            <th className="py-2 px-4 text-center truncate">Employer</th>
            <th className="py-2 px-4 text-center truncate">Shift Timing</th>
            <th className="py-2 px-4 text-center truncate">Shift Id</th>
            <th className="py-2 px-4 text-center truncate">Clocked In</th>
            <th className="py-2 px-4 text-center truncate">Clocked Out</th>

            <th className="py-2 px-4 text-center truncate">Break Included</th>
            <th className="py-2 px-4 text-center truncate">Break Type</th>
            <th className="py-2 px-4 text-center truncate">
              Form Confirmed/Standby
            </th>
            <th className="py-2 px-4 text-center truncate">Rate Type</th>
            <th className="py-2 px-4 text-center truncate">Total Wage</th>
            <th className="py-2 px-4 text-center truncate">Wage Generated</th>
            <th className="py-2 px-4 text-center truncate">Job Status</th>
            <th className="py-2 px-4 text-center truncate">Payment Status</th>
          </tr>
        </thead>
        <tbody className="relative">
          {/* {jobs.map((job, index) => (
            <tr key={index} className="text-sm hover:bg-gray-50 normal-text">
              <td className="py-3 px-4 text-center truncate ">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleJobMenu(index)}
                    className="text-[#000000] hover:text-gray-700"
                  >
                    <MoreVertical />
                  </button>
                  {isJobMenuOpen === index && (
                    <div className="absolute top-10 left-0 mt-2 w-40 bg-white border rounded-lg shadow">
                      <div className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        <Eye />
                        <p>Detail view</p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-[16px] leading-[20px] text-[#000000] font-semibold">
                      {job.outlet.title}
                    </p>
                    <img
                      src={job.outlet.img}
                      alt="company logo"
                      className="w-28 h-4"
                    />
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-center truncate normal-text">
                {job.id}
              </td>
              <td className="py-3 px-4 text-center truncate normal-text">
                {job.date}
              </td>
              <td className="py-3 px-4 text-center truncate normal-text">
                {job.employer}
              </td>
              <td className="py-3 px-4 text-center truncate     text-[16px] leading-[20px] text-[#000000] font-semibold">
                <div className="flex flex-col items-center gap-8">
                  {job.shifts.map((item, id) => (
                    <p key={id}>{item.shiftTiming}</p>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4 text-center truncate normal-text">
                <div className="flex flex-col items-center gap-8">
                  {job.shifts.map((item, id) => (
                    <p key={id}>{item.shiftId}</p>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4 text-center truncate">
                <div className="flex flex-col items-center gap-4">
                  {job.shifts.map((item, id) => (
                    // <p key={id}>{item.shiftId}</p>
                    <div
                      key={id}
                      className="flex items-center gap-1 py-1 px-3 rounded-full border border-[#048BE1] w-fit"
                    >
                      <RotateCcw className="text-white p-1 rounded-full bg-[#CDCDCD] w-7 h-7" />
                      <p className="text-[16px] leading-[24px] font-medium text-[#000000] w-[70px] text-center">
                        {item.clockedIn}
                      </p>
                      <FiEdit3 className="text-white p-1 rounded-full bg-[#0099FF] w-7 h-7" />
                    </div>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4 text-center truncate">
                <div className="flex flex-col items-center gap-4">
                  {job.shifts.map((item, id) => (
                    // <p key={id}>{item.shiftId}</p>
                    <div
                      key={id}
                      className="flex items-center gap-1 py-1 px-3 rounded-full border border-[#048BE1] w-fit"
                    >
                      <RotateCcw className="text-white p-1 rounded-full bg-[#CDCDCD] w-7 h-7" />
                      <p className="text-[16px] leading-[24px] font-medium text-[#000000] w-[70px] text-center">
                        {item.clockedOut}
                      </p>
                      <FiEdit3 className="text-white p-1 rounded-full bg-[#0099FF] w-7 h-7" />
                    </div>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4 text-center truncate normal-text">
                <div className="flex flex-col items-center gap-8">
                  {job.shifts.map((item, id) => (
                    <p key={id}>{item.breakIncluded}</p>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4 text-center truncate normal-text">
                <div className="flex flex-col items-center gap-8">
                  {job.shifts.map((item, id) => (
                    <p key={id}>{item.breakType}</p>
                  ))}
                </div>
              </td>
             

              <td className="px-4 py-3 text-center truncate ">
                <div className="flex flex-col items-center gap-4">
                  {job.shifts.map((item, id) => (
                    <p
                      className={`px-2 py-2 rounded-full text-[16px] leading-[20px] font-medium ${
                        item.fromConfirmed === "Confirmed"
                          ? "bg-[#deffdf] text-[#049609]"
                          : "bg-[#fff7dc] text-[#d37700]"
                      }`}
                      key={id}
                    >
                      {item.fromConfirmed}
                    </p>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4 text-center truncate normal-text">
                <div className="flex flex-col items-center gap-8">
                  {job.shifts.map((item, id) => (
                    <p key={id}>{item.rateType}</p>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4 text-center truncate text-[16px] leading-[20px] font-medium">
                <div className="flex flex-col items-center gap-8">
                  {job.shifts.map((item, id) => (
                    <p key={id}>{item.totalWage}</p>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4 text-center truncate text-[16px] leading-[20px] font-medium">
                <div className="flex flex-col items-center gap-8">
                  {job.shifts.map((item, id) => (
                    <p key={id}>{item.wageGenerated}</p>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4 text-center truncate">
                <div className="flex flex-col items-center gap-4">
                  {job.shifts.map((item, id) => (
                    <p
                    className={`px-2 py-2 rounded-full text-[16px] leading-[20px] ${
                      item.jobStatus === "Completed"
                        ? "bg-[#e0f3ff] text-[#0099ff]"
                        : "bg-[#fff7dc] text-[#d37700]"
                    }`}
                    key={id}
                  >
                    {item.jobStatus}
                  </p>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4 text-center truncate">
                <div className="flex flex-col items-center gap-4">
                  {job.shifts.map((item, id) => (
                   <p
                   className={`px-2 py-2 rounded-full text-[16px] leading-[20px] ${
                     item.paymentStatus === "Completed"
                       ? "bg-[#e0f3ff] text-[#0099ff]"
                       : "bg-[#fff7dc] text-[#d37700]"
                   }`}
                   key={id}
                 >
                   {item.paymentStatus}
                 </p>
                  ))}
                </div>
              </td>
            </tr>
          ))} */}
          {safeWorkHistory.length === 0 ? (
            <tr>
              <td colSpan={16} className="py-8 text-center text-gray-500">
                No work history available
              </td>
            </tr>
          ) : (
            safeWorkHistory.map((job, index) => (
  <tr key={index} className="text-sm hover:bg-gray-50 normal-text">
    <td className="py-3 px-4 text-center truncate ">
      <div className="flex items-center gap-4">
        <button
          onClick={() => toggleJobMenu(index)}
          className="text-[#000000] hover:text-gray-700"
        >
          <MoreVertical />
        </button>
        {isJobMenuOpen === index && (
          <div className="absolute top-10 left-0 mt-2 w-40 bg-white border rounded-lg shadow">
            <div className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 cursor-pointer">
              <Eye />
              <p>Detail view</p>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center gap-2">
          <p className="text-[16px] leading-[20px] text-[#000000] font-semibold">
            {job.jobName}
          </p>
          {/* <img
            src="/assets/dominos-logo.png"
            alt="company logo"
            className="w-28 h-4"
          /> */}
        </div>
      </div>
    </td>
    <td className="py-3 px-4 text-center truncate normal-text">{job.jobId}</td>
    <td className="py-3 px-4 text-center truncate normal-text">{job.date}</td>
    <td className="py-3 px-4 text-center truncate normal-text">{job.employer}</td>
    <td className="py-3 px-4 text-center truncate normal-text">{job.shiftTiming}</td>
    <td className="py-3 px-4 text-center truncate normal-text">{job.shiftId}</td>
    <td className="py-3 px-4 text-center truncate">{job.clockedIn}</td>
    <td className="py-3 px-4 text-center truncate">{job.clockedOut}</td>
    <td className="py-3 px-4 text-center truncate normal-text">---------</td>
    <td className="py-3 px-4 text-center truncate normal-text">{job.breakType}</td>
    <td className="py-3 px-4 text-center truncate">
      <p
        className={`px-2 py-2 rounded-full text-[16px] leading-[20px] font-medium ${
          job.fromConfirmedStandby === "Confirmed"
            ? "bg-[#deffdf] text-[#049609]"
            : "bg-[#fff7dc] text-[#d37700]"
        }`}
      >
        {job.fromConfirmedStandby}
      </p>
    </td>
    <td className="py-3 px-4 text-center truncate normal-text">{job.rateType}</td>
    <td className="py-3 px-4 text-center truncate text-[16px] leading-[20px] font-medium">
      {job.totalWage}
    </td>
    <td className="py-3 px-4 text-center truncate text-[16px] leading-[20px] font-medium">
      {job.wageGenerated}
    </td>
    <td className="py-3 px-4 text-center truncate">
      <p
        className={`px-2 py-2 rounded-full text-[16px] leading-[20px] ${
          job.jobStatus === "Completed"
            ? "bg-[#e0f3ff] text-[#0099ff]"
            : "bg-[#fff7dc] text-[#d37700]"
        }`}
      >
        {job.jobStatus}
      </p>
    </td>
    <td className="py-3 px-4 text-center truncate">
      <p
        className={`px-2 py-2 rounded-full text-[16px] leading-[20px] ${
          job.paymentStatus === "Completed"
            ? "bg-[#e0f3ff] text-[#0099ff]"
            : "bg-[#fff7dc] text-[#d37700]"
        }`}
      >
        {job.paymentStatus}
      </p>
    </td>
  </tr>
))
          )}

        </tbody>
      </table>
    </div>
  );
};

export default WorkHistory;
