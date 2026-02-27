import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";
import { Download, Mail, RefreshCw } from "lucide-react";

interface Employer {
  _id: string;
  companyLegalName: string;
}

interface Timesheet {
  _id: string;
  employerId: string;
  employer?: {
    companyLegalName: string;
  };
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const TimesheetManagement: React.FC = () => {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSendingEmailId, setIsSendingEmailId] = useState<string | null>(null);
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);

  // Load employers for filter & generate form
  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const res = await axiosInstance.get("/admin/employers", {
          params: { limit: 1000 },
        });
        if (res.data?.success === false) {
          toast.error(res.data?.message || "Failed to load employers");
          return;
        }
        setEmployers(res.data?.employers || []);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            "Failed to load employers. Please try again."
        );
      }
    };
    fetchEmployers();
  }, []);

  const employerOptions = useMemo(
    () =>
      employers.map((e) => ({
        value: e._id,
        label: e.companyLegalName || e._id,
      })),
    [employers]
  );

  // Load timesheet list
  const fetchTimesheets = async (pageToLoad: number = 1) => {
    setIsLoadingList(true);
    try {
      const params: Record<string, string | number> = {
        page: pageToLoad,
        limit: 10,
      };
      if (selectedEmployerId) params.employerId = selectedEmployerId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axiosInstance.get("/admin/timesheets", { params });

      if (res.data?.success === false) {
        toast.error(res.data?.message || "Failed to load timesheets");
        return;
      }

      setTimesheets(res.data?.timesheets || []);
      setPagination(res.data?.pagination || null);
      setPage(pageToLoad);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load timesheets. Please try again."
      );
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchTimesheets(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployerId || !startDate || !endDate) {
      toast.error("Please select employer, start date and end date.");
      return;
    }
    setIsGenerating(true);
    try {
      const body = {
        employerId: selectedEmployerId,
        startDate,
        endDate,
      };
      const res = await axiosInstance.post("/admin/timesheets/generate", body);
      if (res.data?.success === false) {
        toast.error(res.data?.message || "Failed to generate timesheet");
        return;
      }
      toast.success(
        res.data?.message || "Timesheet generated successfully."
      );
      // Refresh list to include new timesheet
      fetchTimesheets(1);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to generate timesheet. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async (id: string) => {
    setIsSendingEmailId(id);
    try {
      const res = await axiosInstance.post(
        `/admin/timesheets/${id}/send-email`
      );
      if (res.data?.success === false) {
        toast.error(res.data?.message || "Failed to send email");
        return;
      }
      toast.success(
        res.data?.message || "Timesheet email sent successfully."
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to send timesheet email. Please try again."
      );
    } finally {
      setIsSendingEmailId(null);
    }
  };

  const handleDownload = async (id: string) => {
    setIsDownloadingId(id);
    try {
      // Download as PDF according to docs (binary response)
      const res = await axiosInstance.get(
        `/admin/timesheets/${id}/download`,
        {
          params: { format: "pdf" },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timesheet-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to download timesheet. Please try again."
      );
    } finally {
      setIsDownloadingId(null);
    }
  };

  const formatDate = (value: string) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-SG", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Timesheet Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate, email, and download employer timesheets
            (aligned with `NEW_END_TO_END_API_DOCUMENTATION.md` §8).
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchTimesheets(page)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Generate form */}
      <form
        onSubmit={handleGenerate}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900">
          Generate Timesheet
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employer
            </label>
            <select
              value={selectedEmployerId}
              onChange={(e) => setSelectedEmployerId(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select employer</option>
              {employerOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Timesheets table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Generated Timesheets
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Employer
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Period
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  Created at
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoadingList ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Loading timesheets...
                  </td>
                </tr>
              ) : timesheets.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No timesheets found. Generate one above to get started.
                  </td>
                </tr>
              ) : (
                timesheets.map((ts) => (
                  <tr key={ts._id}>
                    <td className="px-4 py-3 align-middle">
                      <span className="font-medium text-gray-900">
                        {ts.employer?.companyLegalName ||
                          employerOptions.find(
                            (e) => e.value === ts.employerId
                          )?.label ||
                          ts.employerId}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-gray-700">
                      {formatDate(ts.startDate)} – {formatDate(ts.endDate)}
                    </td>
                    <td className="px-4 py-3 align-middle text-gray-700">
                      {formatDate(ts.createdAt)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleSendEmail(ts._id)}
                          disabled={isSendingEmailId === ts._id}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Mail className="w-4 h-4" />
                          {isSendingEmailId === ts._id ? "Sending..." : "Email"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(ts._id)}
                          disabled={isDownloadingId === ts._id}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4" />
                          {isDownloadingId === ts._id
                            ? "Downloading..."
                            : "Download"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t border-gray-200 text-xs text-gray-600">
            <div>
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fetchTimesheets(page - 1)}
                disabled={page <= 1 || isLoadingList}
                className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => fetchTimesheets(page + 1)}
                disabled={
                  page >= (pagination?.totalPages || 1) || isLoadingList
                }
                className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimesheetManagement;

