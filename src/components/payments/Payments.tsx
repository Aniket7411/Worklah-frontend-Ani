"use client";

import { useState } from "react";
import { MoreVertical, CheckCircle, XCircle, RotateCcw, Eye, Download } from "lucide-react";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";

const IMAGE_BASE_URL = "https://worklah.onrender.com";

interface Payment {
  id?: string;
  _id?: string;
  paymentId?: string;
  worker?: {
    id?: string;
    name?: string;
    fullName?: string;
    avatar?: string;
    profilePicture?: string;
    nric?: string;
    icNumber?: string;
  };
  employee?: {
    id?: string;
    name?: string;
    nric?: string;
  };
  employer?: {
    name?: string;
    companyLegalName?: string;
    logo?: string;
  };
  job?: {
    id?: string;
    _id?: string;
    jobId?: string;
    employer?: string;
    outletAddress?: string;
  };
  outletAddress?: string;
  jobId?: string;
  day?: string;
  shiftDate?: string;
  date?: string;
  shift?: {
    date?: string;
    day?: string;
    timeIn?: string;
    timeOut?: string;
    breakTime?: number;
    totalWorkHour?: number;
  };
  payment?: {
    rateType?: string;
    payRate?: number;
    penaltyAmount?: number;
    totalAmount?: number;
  };
  timeIn?: string;
  startTime?: string;
  timeOut?: string;
  endTime?: string;
  breakTime?: string | number;
  breakHours?: number;
  totalWorkHour?: string | number;
  totalHours?: number;
  rateType?: string;
  payRate?: string | number;
  hourlyRate?: number;
  penaltyAmount?: string | number;
  penalty?: number;
  totalAmount?: string | number;
  totalWage?: number;
  status?: "Rejected" | "Pending" | "Approved";
  paymentStatus?: string;
  rejectionReason?: string;
  activityLog?: Array<{
    action: string;
    previousValue?: string;
    newValue?: string;
    userAccount: string;
    timestamp: string;
  }>;
}

interface PaymentsProps {
  data?: any;
}

export default function Payments({ data }: PaymentsProps) {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<{ [key: string]: string }>({});
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({});
  const [showRegenerateModal, setShowRegenerateModal] = useState<string | null>(null);
  const [regenerateData, setRegenerateData] = useState<{ [key: string]: any }>({});

  // Transform API data to component format
  const payments: Payment[] = data?.payments || data?.data || [];

  const formatPayment = (payment: any): Payment => {
    const employee = payment.employee || payment.worker;
    const shift = payment.shift || {};
    const paymentData = payment.payment || {};

    return {
      id: payment._id || payment.id || payment.paymentId || "",
      paymentId: payment.paymentId || payment._id || payment.id || "",
      employee: {
        id: employee?.id || "",
        name: employee?.fullName || employee?.name || "Unknown",
        nric: employee?.nric || employee?.icNumber || "N/A",
      },
      worker: {
        name: employee?.fullName || employee?.name || "Unknown",
        avatar: employee?.profilePicture || employee?.avatar || null,
        nric: employee?.nric || employee?.icNumber || "N/A",
      },
      employer: {
        name: payment.employer?.companyLegalName || payment.employer?.name || payment.job?.employer || "Unknown",
        logo: payment.employer?.logo || null,
      },
      job: {
        id: payment.job?._id || payment.job?.id || payment.jobId || "",
        jobId: payment.job?.jobId || payment.jobId || "",
        employer: payment.job?.employer || payment.employer?.name || "Unknown",
        outletAddress: payment.job?.outletAddress || payment.outletAddress || "N/A",
      },
      outletAddress: payment.job?.outletAddress || payment.outletAddress || "N/A",
      jobId: payment.job?._id?.slice(-4) || payment.job?.jobId || payment.jobId || "N/A",
      day: shift.day || payment.day || (shift.date ? new Date(shift.date).toLocaleDateString("en-US", { weekday: "long" }) : "N/A"),
      shiftDate: shift.date || payment.shiftDate || payment.date || "N/A",
      timeIn: shift.timeIn || payment.timeIn || payment.startTime || "N/A",
      timeOut: shift.timeOut || payment.timeOut || payment.endTime || "N/A",
      breakTime: shift.breakTime || payment.breakTime || payment.breakHours || 0,
      totalWorkHour: shift.totalWorkHour || payment.totalWorkHour || payment.totalHours || 0,
      rateType: paymentData.rateType || payment.rateType || "Flat Rate",
      payRate: paymentData.payRate || payment.payRate || payment.hourlyRate || 0,
      penaltyAmount: paymentData.penaltyAmount || payment.penaltyAmount || payment.penalty || 0,
      totalAmount: paymentData.totalAmount || payment.totalAmount || payment.totalWage || 0,
      status: (payment.status || payment.paymentStatus || "Pending") as "Rejected" | "Pending" | "Approved",
      rejectionReason: payment.rejectionReason || "",
      activityLog: payment.activityLog || [],
    };
  };

  const formattedPayments = payments.map(formatPayment);

  const handleStatusChange = async (paymentId: string, newStatus: string) => {
    if (newStatus === "Rejected" && !rejectionReasons[paymentId]) {
      toast.error("Please enter a rejection reason");
      return;
    }

    try {
      // API doc §16.2 / §16.3: PUT payments/transactions/:id/approve | .../reject
      const isApprove = newStatus === "Approved" || newStatus === "completed";
      const endpoint = isApprove
        ? `/admin/payments/transactions/${paymentId}/approve`
        : `/admin/payments/transactions/${paymentId}/reject`;
      const payload = isApprove
        ? undefined
        : { reason: rejectionReasons[paymentId] || "" };
      const response = await axiosInstance.put(endpoint, payload);

      // Check for success field according to API spec
      if (response.data?.success === false) {
        toast.error(response.data?.message || "Failed to update payment status");
        return;
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(`Payment ${newStatus.toLowerCase()} successfully`);
        setStatusUpdates((prev) => ({ ...prev, [paymentId]: newStatus }));
        setSelectedPayment(null);
        // Refresh data - you might want to call a refresh function here
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update payment status");
    }
  };

  const handleRegenerate = async (paymentId: string) => {
    const data = regenerateData[paymentId] || {};
    try {
      // Note: Regenerate endpoint may need to be implemented in backend
      // For now, using a generic endpoint - backend should implement this
      const response = await axiosInstance.post(`/admin/transactions/${paymentId}/regenerate`, data);

      if (response.status === 200 || response.status === 201) {
        toast.success("Payment regenerated successfully");
        setShowRegenerateModal(null);
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to regenerate payment");
    }
  };

  const getDayName = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { weekday: "long" });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
      <div className="min-w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                NRIC
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Employer
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                Outlet Address
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Job ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                Day
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shift Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                Time In
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                Time Out
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Break Time
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Total Work Hour
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Rate Type
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Pay/Hr
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Penalty Amount
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formattedPayments.length === 0 ? (
              <tr>
                <td colSpan={18} className="px-6 py-8 text-center text-gray-500">
                  No payments found
                </td>
              </tr>
            ) : (
              formattedPayments.map((payment) => {
                const currentStatus = statusUpdates[payment.id || ""] || payment.status || "Pending";
                const isRejected = currentStatus === "Rejected";
                const isPending = currentStatus === "Pending";

                return (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.paymentId?.slice(-6) || payment.id?.slice(-6) || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {payment.worker?.avatar ? (
                          <img
                            src={
                              payment.worker.avatar.startsWith("http")
                                ? payment.worker.avatar
                                : `${IMAGE_BASE_URL}${payment.worker.avatar}`
                            }
                            alt={payment.worker.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                            {payment.worker?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">{payment.worker?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {payment.worker?.nric || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {payment.employer?.logo ? (
                          <img
                            src={
                              payment.employer.logo.startsWith("http")
                                ? payment.employer.logo
                                : `${IMAGE_BASE_URL}${payment.employer.logo}`
                            }
                            alt={payment.employer.name}
                            className="h-6 w-6 rounded object-cover"
                          />
                        ) : null}
                        <span className="text-sm text-gray-900">{payment.employer?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 hidden xl:table-cell max-w-xs truncate">
                      {payment.job?.outletAddress || payment.outletAddress || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      <a
                        href={`/jobs/${payment.job?.id || payment.jobId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {payment.jobId}
                      </a>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">
                      {payment.day || getDayName(payment.shiftDate as string)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.shiftDate ? new Date(payment.shiftDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">
                      {payment.timeIn || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">
                      {payment.timeOut || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {typeof payment.breakTime === "number" ? `${payment.breakTime} hrs` : payment.breakTime || "0 hrs"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {typeof payment.totalWorkHour === "number"
                        ? `${payment.totalWorkHour.toFixed(2)} hrs`
                        : payment.totalWorkHour || "0 hrs"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {payment.rateType || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                      ${typeof payment.payRate === "number" ? payment.payRate.toFixed(2) : payment.payRate || "0.00"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 hidden lg:table-cell">
                      -${typeof payment.penaltyAmount === "number" ? payment.penaltyAmount.toFixed(2) : payment.penaltyAmount || "0.00"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${typeof payment.totalAmount === "number" ? payment.totalAmount.toFixed(2) : payment.totalAmount || "0.00"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={currentStatus}
                        onChange={(e) => {
                          if (e.target.value === "Rejected") {
                            setSelectedPayment(payment.id || null);
                          } else {
                            handleStatusChange(payment.id || "", e.target.value);
                          }
                        }}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${currentStatus === "Approved"
                            ? "bg-green-100 text-green-700"
                            : currentStatus === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center sticky right-0 bg-white">
                      <div className="relative">
                        <button
                          onClick={() => setSelectedPayment(selectedPayment === payment.id ? null : payment.id || null)}
                          className="p-1 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {selectedPayment === payment.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(payment.id || "", "Approved")}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedPayment(payment.id || null);
                                    if (!rejectionReasons[payment.id || ""]) {
                                      setRejectionReasons((prev) => ({ ...prev, [payment.id || ""]: "" }));
                                    }
                                  }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </>
                            )}
                            {isRejected && (
                              <button
                                onClick={() => setShowRegenerateModal(payment.id || null)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-blue-700 hover:bg-blue-50"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Regenerate Payment
                              </button>
                            )}
                            <button
                              onClick={() => {
                                // View details - you can implement a modal here
                                toast.info("View payment details");
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Rejection Reason Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Payment</h3>
            <textarea
              placeholder="Enter rejection reason..."
              value={rejectionReasons[selectedPayment] || ""}
              onChange={(e) =>
                setRejectionReasons((prev) => ({ ...prev, [selectedPayment]: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 resize-none"
              rows={4}
            />
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setSelectedPayment(null);
                  setRejectionReasons((prev) => {
                    const updated = { ...prev };
                    delete updated[selectedPayment];
                    return updated;
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(selectedPayment, "Rejected")}
                disabled={!rejectionReasons[selectedPayment]}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Payment Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Regenerate Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Rate (SGD/hr)</label>
                <input
                  type="number"
                  step="0.01"
                  value={regenerateData[showRegenerateModal]?.payRate || ""}
                  onChange={(e) =>
                    setRegenerateData((prev) => ({
                      ...prev,
                      [showRegenerateModal]: { ...prev[showRegenerateModal], payRate: parseFloat(e.target.value) },
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Leave empty to keep original"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penalty Amount (SGD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={regenerateData[showRegenerateModal]?.penaltyAmount || ""}
                  onChange={(e) =>
                    setRegenerateData((prev) => ({
                      ...prev,
                      [showRegenerateModal]: { ...prev[showRegenerateModal], penaltyAmount: parseFloat(e.target.value) },
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Leave empty to keep original"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Work Hour</label>
                <input
                  type="number"
                  step="0.25"
                  value={regenerateData[showRegenerateModal]?.totalWorkHour || ""}
                  onChange={(e) =>
                    setRegenerateData((prev) => ({
                      ...prev,
                      [showRegenerateModal]: { ...prev[showRegenerateModal], totalWorkHour: parseFloat(e.target.value) },
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Leave empty to keep original"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={regenerateData[showRegenerateModal]?.notes || ""}
                  onChange={(e) =>
                    setRegenerateData((prev) => ({
                      ...prev,
                      [showRegenerateModal]: { ...prev[showRegenerateModal], notes: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                  placeholder="Optional notes for regeneration"
                />
              </div>
            </div>
            <div className="flex gap-4 justify-end mt-6">
              <button
                onClick={() => {
                  setShowRegenerateModal(null);
                  setRegenerateData((prev) => {
                    const updated = { ...prev };
                    delete updated[showRegenerateModal];
                    return updated;
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRegenerate(showRegenerateModal)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
