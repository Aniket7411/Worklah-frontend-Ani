"use client";

import { useState, useEffect } from "react";
import { Calendar, Mail, Download, Plus, Search, Filter } from "lucide-react";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

export default function TimesheetManagement() {
  const [loading, setLoading] = useState(false);
  const [timesheets, setTimesheets] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchTimesheets();
    fetchUpcomingJobs();
  }, []);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/timesheets");
      if (response.data?.success !== false && response.data?.timesheets) {
        setTimesheets(response.data.timesheets);
      }
    } catch (err) {
      console.error("Error fetching timesheets:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingJobs = async () => {
    try {
      const response = await axiosInstance.get("/admin/jobs?status=Active,Upcoming&limit=100");
      if (response.data?.success !== false && response.data?.jobs) {
        setJobs(response.data.jobs);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const handleGenerateTimesheet = async () => {
    if (!selectedJob || !selectedDate) {
      toast.error("Please select a job and date");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post("/admin/timesheets/generate", {
        jobId: selectedJob,
        date: selectedDate,
        autoEmail: true, // Auto-email 2 days before shift
      });

      if (response.data?.success !== false) {
        toast.success("Timesheet generated and email sent successfully");
        setShowGenerateModal(false);
        setSelectedJob("");
        setSelectedDate("");
        fetchTimesheets();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate timesheet");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (timesheetId) => {
    try {
      const response = await axiosInstance.post(`/admin/timesheets/${timesheetId}/send-email`);
      if (response.data?.success !== false) {
        toast.success("Email sent successfully");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send email");
    }
  };

  const handleDownload = async (timesheetId, type = "pdf") => {
    try {
      const response = await axiosInstance.get(`/admin/timesheets/${timesheetId}/download?format=${type}`, {
        responseType: "blob",
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `timesheet-${timesheetId}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Timesheet downloaded as ${type.toUpperCase()}`);
    } catch (err) {
      toast.error("Failed to download timesheet");
    }
  };

  const filteredTimesheets = timesheets.filter(ts => {
    const searchLower = searchQuery.toLowerCase();
    return (
      ts.jobId?.toLowerCase().includes(searchLower) ||
      ts.employerName?.toLowerCase().includes(searchLower) ||
      ts.jobTitle?.toLowerCase().includes(searchLower)
    );
  });

  if (loading && timesheets.length === 0) return <Loader />;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Timesheet Management</h2>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Generate Timesheet
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by job ID, employer, or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Timesheets Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated At</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTimesheets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No timesheets found. Generate one to get started.
                  </td>
                </tr>
              ) : (
                filteredTimesheets.map((timesheet) => (
                  <tr key={timesheet._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {timesheet.jobId?.slice(-6) || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{timesheet.jobTitle || "N/A"}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{timesheet.employerName || "N/A"}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {timesheet.shiftDate ? new Date(timesheet.shiftDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        timesheet.type === "Before Shift" ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {timesheet.type || "Before Shift"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        timesheet.status === "Sent" ? "bg-green-100 text-green-800" :
                        timesheet.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {timesheet.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {timesheet.createdAt ? new Date(timesheet.createdAt).toLocaleString() : "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleSendEmail(timesheet._id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Send Email"
                        >
                          <Mail size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(timesheet._id, "pdf")}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(timesheet._id, "excel")}
                          className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                          title="Download Excel"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Generate Timesheet</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Job <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a job</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.jobTitle || job.title || "Job"} - {job.employer?.companyLegalName || job.employer?.name || ""} ({new Date(job.date || job.shiftDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shift Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">Auto-Email Feature:</p>
                <p>Timesheet will be automatically emailed to the client 2 days before the shift date.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setSelectedJob("");
                  setSelectedDate("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateTimesheet}
                disabled={loading || !selectedJob || !selectedDate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

