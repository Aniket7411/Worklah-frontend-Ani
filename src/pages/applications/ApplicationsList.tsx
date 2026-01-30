import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  FileText,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";

interface Application {
  _id: string;
  userId: string;
  user?: { fullName?: string; phoneNumber?: string; email?: string; profilePicture?: string };
  jobId: string;
  job?: { jobName?: string; jobDate?: string };
  shiftId?: string;
  shift?: { startTime?: string; endTime?: string };
  status?: string;
  adminStatus?: string;
  appliedAt?: string;
}

const statusOptions = [
  { value: "", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

export default function ApplicationsList() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(limit));
      if (statusFilter) {
        params.set("status", statusFilter);
      }
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const response = await axiosInstance.get(`/admin/applications?${params.toString()}`);
      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to fetch applications");
      }
      setApplications(response.data?.applications || []);
      const pag = response.data?.pagination || {};
      setTotalPages(pag.totalPages || 1);
      setTotalItems(pag.totalItems || 0);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getStatusBadge = (adminStatus?: string, status?: string) => {
    const s = adminStatus || status || "Pending";
    const map: Record<string, string> = {
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Rejected: "bg-red-50 text-red-700 border-red-200",
      Upcoming: "bg-blue-50 text-blue-700 border-blue-200",
    };
    return (
      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${map[s] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
        {s === "Confirmed" ? "Approved" : s}
      </span>
    );
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
              <p className="mt-1 text-sm text-gray-500">
                {totalItems} application{totalItems !== 1 ? "s" : ""} total
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by job or applicant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value || "all"} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-500">Adjust filters or check back later.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Applicant</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Job</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Shift</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Applied</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{app.user?.fullName || "—"}</p>
                            <p className="text-sm text-gray-500">{app.user?.phoneNumber || app.user?.email || "—"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900">{app.job?.jobName || "—"}</p>
                          <p className="text-sm text-gray-500">{app.job?.jobDate ? new Date(app.job.jobDate).toLocaleDateString() : "—"}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {app.shift?.startTime && app.shift?.endTime
                            ? `${app.shift.startTime} - ${app.shift.endTime}`
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleString() : "—"}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(app.adminStatus, app.status)}</td>
                        <td className="px-6 py-4 text-center">
                          <Link to={`/applications/${app._id}`}>
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                          </Link>
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
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
