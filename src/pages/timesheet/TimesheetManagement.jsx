"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Download,
  Mail,
  Loader2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Building2,
  FileText,
} from "lucide-react";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";

export default function TimesheetManagement() {
  const [timesheets, setTimesheets] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [employerFilter, setEmployerFilter] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    employerId: "",
    startDate: "",
    endDate: "",
  });
  const [generating, setGenerating] = useState(false);

  const limit = 10;

  const fetchEmployers = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/admin/employers?limit=200");
      if (res.data?.success !== false && res.data?.employers) {
        setEmployers(res.data.employers);
      }
    } catch (err) {
      console.error("Error fetching employers:", err);
    }
  }, []);

  const fetchTimesheets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(limit));
      if (startDateFilter) params.set("startDate", startDateFilter);
      if (endDateFilter) params.set("endDate", endDateFilter);
      if (employerFilter) params.set("employerId", employerFilter);

      const response = await axiosInstance.get(`/admin/timesheets?${params.toString()}`);
      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to fetch timesheets");
      }
      setTimesheets(response.data?.timesheets || []);
      const pag = response.data?.pagination || {};
      setTotalPages(pag.totalPages || 1);
      setTotalItems(pag.totalItems || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load timesheets");
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, startDateFilter, endDateFilter, employerFilter]);

  useEffect(() => {
    fetchEmployers();
  }, [fetchEmployers]);

  useEffect(() => {
    fetchTimesheets();
  }, [fetchTimesheets]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!generateForm.employerId || !generateForm.startDate || !generateForm.endDate) {
      toast.error("Please select employer and date range");
      return;
    }
    setGenerating(true);
    try {
      const res = await axiosInstance.post("/admin/timesheets/generate", {
        employerId: generateForm.employerId,
        startDate: generateForm.startDate,
        endDate: generateForm.endDate,
      });
      if (res.data?.success !== false) {
        toast.success("Timesheet generated successfully");
        setShowGenerateModal(false);
        setGenerateForm({ employerId: "", startDate: "", endDate: "" });
        fetchTimesheets();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate timesheet");
    } finally {
      setGenerating(false);
    }
  };

  const handleSendEmail = async (timesheetId) => {
    setActionLoading(timesheetId);
    try {
      const res = await axiosInstance.post(`/admin/timesheets/${timesheetId}/send-email`);
      if (res.data?.success !== false) {
        toast.success("Timesheet email sent successfully");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send email");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (timesheetId) => {
    setActionLoading(`download-${timesheetId}`);
    try {
      const res = await axiosInstance.get(`/admin/timesheets/${timesheetId}/download`, {
        responseType: "blob",
      });
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timesheet-${timesheetId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Download started");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to download");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Timesheet Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                {totalItems} timesheet{totalItems !== 1 ? "s" : ""} total
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white"
              />
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white"
              />
              <select
                value={employerFilter}
                onChange={(e) => setEmployerFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white min-w-[180px]"
              >
                <option value="">All Employers</option>
                {employers.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.companyLegalName || emp.companyName || emp.name || emp._id}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Generate Timesheet
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : timesheets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No timesheets yet</h3>
            <p className="text-gray-500 mb-6">Generate a timesheet for an employer and date range.</p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              Generate Timesheet
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {timesheets.map((ts) => (
                      <tr key={ts._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">
                            {ts.employer?.companyLegalName || ts.employer?.companyName || ts.employerId || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {ts.startDate && ts.endDate
                            ? `${new Date(ts.startDate).toLocaleDateString()} – ${new Date(ts.endDate).toLocaleDateString()}`
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {ts.createdAt ? new Date(ts.createdAt).toLocaleString() : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSendEmail(ts._id)}
                              disabled={actionLoading === ts._id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                              title="Send email"
                            >
                              {actionLoading === ts._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                              Email
                            </button>
                            <button
                              onClick={() => handleDownload(ts._id)}
                              disabled={actionLoading === `download-${ts._id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                              title="Download PDF"
                            >
                              {actionLoading === `download-${ts._id}` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({totalItems} items)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Generate Timesheet
            </h3>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employer *</label>
                <select
                  value={generateForm.employerId}
                  onChange={(e) => setGenerateForm((f) => ({ ...f, employerId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select employer</option>
                  {employers.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.companyLegalName || emp.companyName || emp.name || emp._id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={generateForm.startDate}
                  onChange={(e) => setGenerateForm((f) => ({ ...f, startDate: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input
                  type="date"
                  value={generateForm.endDate}
                  onChange={(e) => setGenerateForm((f) => ({ ...f, endDate: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
