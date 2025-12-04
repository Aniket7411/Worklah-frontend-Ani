"use client";

const IMAGE_BASE_URL = "https://worklah.onrender.com";

interface Payment {
  id?: string;
  _id?: string;
  worker?: {
    name?: string;
    fullName?: string;
    avatar?: string;
    profilePicture?: string;
    nric?: string;
    icNumber?: string;
  };
  employer?: {
    name?: string;
    companyLegalName?: string;
    logo?: string;
  };
  jobId?: string;
  job?: {
    _id?: string;
    jobId?: string;
  };
  day?: string;
  shiftDate?: string;
  date?: string;
  shiftId?: string;
  shift?: {
    _id?: string;
  };
  timeIn?: string;
  startTime?: string;
  timeOut?: string;
  endTime?: string;
  clockedIn?: string;
  actualStartTime?: string;
  clockedOut?: string;
  actualEndTime?: string;
  breakTime?: string;
  breakHours?: number;
  breakType?: string;
  duration?: string;
  totalHours?: number;
  totalWorkHour?: string;
  rateType?: string;
  payRate?: string;
  hourlyRate?: number;
  penaltyAmount?: string;
  penalty?: number;
  totalAmount?: string;
  totalWage?: number;
  status?: "Rejected" | "Pending" | "Approved";
  paymentStatus?: string;
}

interface PaymentsProps {
  data?: any;
}

export default function Payments({ data }: PaymentsProps) {
  // Transform API data to component format
  const payments: Payment[] = data?.payments || data?.data || [];
  
  const formatPayment = (payment: any): Payment => {
    return {
      id: payment._id || payment.id || '',
      worker: {
        name: payment.worker?.fullName || payment.worker?.name || 'Unknown',
        avatar: payment.worker?.profilePicture || payment.worker?.avatar || null,
        nric: payment.worker?.nric || payment.worker?.icNumber || 'N/A',
      },
      employer: {
        name: payment.employer?.companyLegalName || payment.employer?.name || 'Unknown',
        logo: payment.employer?.logo || null,
      },
      jobId: payment.job?._id?.slice(-4) || payment.jobId || 'N/A',
      day: payment.day || new Date(payment.date || payment.shiftDate).toLocaleDateString('en-US', { weekday: 'long' }) || 'N/A',
      shiftDate: payment.shiftDate || payment.date || 'N/A',
      shiftId: payment.shift?._id?.slice(-4) || payment.shiftId || 'N/A',
      timeIn: payment.timeIn || payment.startTime || 'N/A',
      timeOut: payment.timeOut || payment.endTime || 'N/A',
      clockedIn: payment.clockedIn || payment.actualStartTime || 'N/A',
      clockedOut: payment.clockedOut || payment.actualEndTime || 'N/A',
      breakTime: payment.breakTime || `${payment.breakHours || 0} Hr`,
      breakType: payment.breakType || 'Unpaid',
      duration: payment.duration || `${payment.totalHours || 0} Hrs`,
      totalWorkHour: payment.totalWorkHour || `${payment.totalHours || 0} Hrs`,
      rateType: payment.rateType || 'Flat Rate',
      payRate: payment.payRate || `$${payment.hourlyRate || 0}/Hr`,
      penaltyAmount: payment.penaltyAmount || (payment.penalty ? `-$${payment.penalty}` : '$0'),
      totalAmount: payment.totalAmount || `$${payment.totalWage || 0}`,
      status: (payment.status || payment.paymentStatus || 'Pending') as "Rejected" | "Pending" | "Approved",
    };
  };

  const formattedPayments = payments.map(formatPayment);

  return (
    <div className="overflow-x-auto border rounded-lg bg-white">
      <table className="min-w-full divide-y divide-[#E5E5E5]">
        <thead className="bg-[#F9FAFB]">
          <tr>
            <th scope="col" className="px-6 py-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#D1D5DB] text-[#0070F3] focus:ring-[#0070F3]"
              />
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Id #
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Worker name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              NRIC
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Employer
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Job ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Day
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Shift Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Shift ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Time In
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Time Out
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Clocked In
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Clocked Out
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Break Time
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Break Type
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Duration
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Total work hour
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Rate Type
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Pay Rate
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Penalty amount
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Total amount
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {formattedPayments.length === 0 ? (
            <tr>
              <td colSpan={21} className="px-6 py-8 text-center text-gray-500">
                No payments found
              </td>
            </tr>
          ) : (
            formattedPayments.map((payment) => (
            <tr key={payment.id} className="hover:bg-[#F9FAFB]">
              <td className="px-6 py-4 text-center truncate whitespace-nowrap">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#D1D5DB] text-[#0070F3] focus:ring-[#0070F3]"
                />
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.id}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap w-max overflow-hidden">
                <div className="flex items-center w-max bg-[#F6F6F6] rounded-full p-2">
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    {payment.worker?.avatar ? (
                      <img
                        alt={payment.worker?.name || 'Worker'}
                        src={payment.worker.avatar.startsWith('http') 
                          ? payment.worker.avatar 
                          : `${IMAGE_BASE_URL}${payment.worker.avatar}`}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                        {payment.worker?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-[#111827]">
                      {payment.worker?.name || 'Unknown'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.worker?.nric || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap w-max overflow-hidden">
                <div className="flex items-center w-max">
                  {payment.employer?.logo ? (
                    <img
                      alt={payment.employer?.name || 'Employer'}
                      src={payment.employer.logo.startsWith('http') 
                        ? payment.employer.logo 
                        : `${IMAGE_BASE_URL}${payment.employer.logo}`}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                      {payment.employer?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="ml-4 text-left">
                    <div className="text-[12px] font-medium text-[#111827]">
                      {payment.employer?.name || 'Unknown'}
                    </div>
                    <div className="text-[10px] font-medium text-[#111827]">
                      <a href="#" className="text-blue-400 underline">View Employer</a>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.jobId || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.day || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.shiftDate || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.shiftId || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.timeIn || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.timeOut || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.clockedIn || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.clockedOut || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.breakTime || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#FEE2E2] text-[#DC2626]">
                  {payment.breakType || 'Unpaid'}
                </span>
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.duration || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.totalWorkHour || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.rateType || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.payRate || 'N/A'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#DC2626]">
                {payment.penaltyAmount || '$0'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.totalAmount || '$0'}
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                ${
                  payment.status === "Approved" && "bg-[#D1FAE5] text-[#059669]"
                }
                ${payment.status === "Pending" && "bg-[#FEF3C7] text-[#D97706]"}
                ${
                  payment.status === "Rejected" && "bg-[#FEE2E2] text-[#DC2626]"
                }
              `}
                >
                  {payment.status || 'Pending'}
                </span>
              </td>
              <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                {payment.status === "Pending" ? (
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-[#0070F3] text-white rounded-md text-xs font-medium">
                      Approve
                    </button>
                    <button className="px-3 py-1 border border-[#D1D5DB] text-[#374151] rounded-md text-xs font-medium">
                      Re-Generate
                    </button>
                  </div>
                ) : (
                  <button className="px-3 py-1 border border-[#D1D5DB] text-[#374151] rounded-md text-xs font-medium">
                    See Details
                  </button>
                )}
              </td>
            </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
