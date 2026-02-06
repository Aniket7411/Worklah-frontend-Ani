import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle, XCircle, User, Briefcase, Clock, FileText, Image } from "lucide-react";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";

interface ApplicationDetailData {
  _id: string;
  userId: string;
  user?: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    profilePicture?: string;
    profileCompleted?: boolean;
    employmentStatus?: string;
    dateOfBirth?: string;
    gender?: string;
    postalCode?: string;
    address?: string;
    nric?: string;
    resumeUrl?: string | null;
    nricFrontImage?: string | null;
    nricBackImage?: string | null;
    status?: string;
  };
  jobId: string;
  job?: {
    jobName?: string;
    jobDate?: string;
    jobTitle?: string;
    location?: string;
    employer?: { companyLegalName?: string };
    outlet?: { name?: string; address?: string };
  };
  shiftId?: string;
  shift?: {
    startTime?: string;
    endTime?: string;
    duration?: number;
    payRate?: number;
    totalWage?: number;
    breakType?: string;
  };
  status?: string;
  adminStatus?: string;
  appliedAt?: string;
  adminNotes?: string;
  rejectionReason?: string;
}

export default function ApplicationDetail() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<ApplicationDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approveNotes, setApproveNotes] = useState("");

  const fetchApplication = async () => {
    if (!applicationId) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/applications/${applicationId}`);
      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to fetch application");
      }
      setApplication(response.data?.application || null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load application");
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const handleApprove = async () => {
    if (!applicationId) return;
    setActionLoading(true);
    try {
      await axiosInstance.post(`/admin/applications/${applicationId}/approve`, {
        notes: approveNotes || undefined,
      });
      toast.success("Application approved successfully");
      setApproveNotes("");
      fetchApplication();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!applicationId || !rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    setActionLoading(true);
    try {
      await axiosInstance.post(`/admin/applications/${applicationId}/reject`, {
        reason: rejectReason.trim(),
        notes: rejectReason.trim(),
      });
      toast.success("Application rejected");
      setRejectModal(false);
      setRejectReason("");
      fetchApplication();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectReasonTemplates = [
    "Resume required for this role",
    "NRIC documents required",
    "Incomplete profile",
    "Documents do not meet job requirements",
    "Other (specify below)",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 mb-4">Application not found.</p>
        <button
          onClick={() => navigate("/applications")}
          className="text-blue-600 hover:underline"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  const isPending = (application.adminStatus || application.status) === "Pending" || !application.adminStatus;
  const status = application.adminStatus || application.status || "Pending";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate("/applications")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Applications
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">Application Detail</h1>
          <span
            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${status === "Pending"
                ? "bg-amber-100 text-amber-800"
                : status === "Confirmed" || status === "Approved" || status === "Upcoming"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
          >
            {status === "Confirmed" ? "Approved" : status}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Applicant – cross-check details per ADMIN_APPLICANT_REVIEW_AND_APPROVAL.md */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <User className="w-5 h-5" />
              Applicant
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap gap-6">
                {application.user?.profilePicture ? (
                  <img
                    src={application.user.profilePicture}
                    alt={application.user.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-semibold">
                    {application.user?.fullName?.charAt(0) || "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{application.user?.fullName || "—"}</p>
                  <p className="text-sm text-gray-600">{application.user?.email || "—"}</p>
                  <p className="text-sm text-gray-600">{application.user?.phoneNumber || "—"}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Profile completed: {application.user?.profileCompleted ? "Yes" : "No"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status: {application.user?.status ?? "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm border-t border-gray-200 pt-3">
                <p><span className="text-gray-500">Employment status:</span> {application.user?.employmentStatus || "—"}</p>
                <p><span className="text-gray-500">DOB:</span> {application.user?.dateOfBirth ? new Date(application.user.dateOfBirth).toLocaleDateString() : "—"}</p>
                <p><span className="text-gray-500">Gender:</span> {application.user?.gender || "—"}</p>
                <p><span className="text-gray-500">Postal code:</span> {application.user?.postalCode || "—"}</p>
                <p className="sm:col-span-2"><span className="text-gray-500">Address:</span> {application.user?.address || "—"}</p>
                <p><span className="text-gray-500">NRIC:</span> {application.user?.nric || "—"}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Documents (cross-check)</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Resume:</span>
                    {application.user?.resumeUrl ? (
                      <a href={application.user.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View resume</a>
                    ) : (
                      <span className="text-amber-600 text-sm">Not uploaded</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">NRIC:</span>
                    {application.user?.nricFrontImage || application.user?.nricBackImage ? (
                      <span className="flex gap-2">
                        {application.user.nricFrontImage && (
                          <a href={application.user.nricFrontImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Front</a>
                        )}
                        {application.user.nricBackImage && (
                          <a href={application.user.nricBackImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Back</a>
                        )}
                      </span>
                    ) : (
                      <span className="text-amber-600 text-sm">Not uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Job & Shift */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <Briefcase className="w-5 h-5" />
              Job & Shift
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p><span className="text-gray-500">Job:</span> {application.job?.jobName || application.job?.jobTitle || "—"}</p>
              <p><span className="text-gray-500">Date:</span> {application.job?.jobDate ? new Date(application.job.jobDate).toLocaleDateString() : "—"}</p>
              <p><span className="text-gray-500">Employer:</span> {application.job?.employer?.companyLegalName || "—"}</p>
              <p><span className="text-gray-500">Outlet:</span> {application.job?.outlet?.name || "—"} {application.job?.outlet?.address && `(${application.job.outlet.address})`}</p>
              {application.shift && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>
                    {application.shift.startTime} – {application.shift.endTime}
                    {application.shift.duration != null && ` (${application.shift.duration}h)`}
                    {application.shift.payRate != null && ` · $${application.shift.payRate}/hr`}
                    {application.shift.totalWage != null && ` · Total $${application.shift.totalWage}`}
                  </span>
                </div>
              )}
            </div>
          </section>

          <p className="text-sm text-gray-500">
            Applied: {application.appliedAt ? new Date(application.appliedAt).toLocaleString() : "—"}
          </p>

          {/* Actions for Pending */}
          {isPending && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional, for approval)</label>
                <input
                  type="text"
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  placeholder="e.g. Good profile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 items-end">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Approve
                </button>
                <button
                  onClick={() => setRejectModal(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject modal – reason required; templates per ADMIN_APPLICANT_REVIEW_AND_APPROVAL.md */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Application</h3>
            <p className="text-sm text-gray-600 mb-3">Provide a reason for rejection (required). The user will see this so they know what to improve.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {rejectReasonTemplates.map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => template !== "Other (specify below)" && setRejectReason(template)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
                >
                  {template}
                </button>
              ))}
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (required)..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setRejectModal(false); setRejectReason(""); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
