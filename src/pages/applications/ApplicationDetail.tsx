import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle, XCircle, User, Briefcase, Clock, FileText, Image, Copy, Building2, MapPin, Hash } from "lucide-react";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";
import { getProfilePicUrl } from "../../utils/avatarUtils";
import { normalizeApplicationId } from "../../utils/applicationId";
import {
  getJobClockInBarcode,
  getJobDisplayCode,
  getJobEmployerLabel,
  getJobOutletName,
  getJobWorkLocationLine,
} from "../../utils/applicationJobDisplay";
import { copyTextToClipboard } from "../../utils/clipboard";

interface ApplicationDetailData {
  _id: string;
  userId: string;
  user?: {
    _id?: string;
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
  job?: Record<string, unknown> & {
    _id?: string;
    jobName?: string;
    jobDate?: string;
    jobTitle?: string;
    jobId?: string;
    employerName?: string;
    employer?: string | { companyLegalName?: string; name?: string };
    outlet?: string | { name?: string; address?: string; outletName?: string; outletAddress?: string };
    outletAddress?: string;
    outletId?: string;
    location?: string;
    locationDetails?: string;
    shortAddress?: string;
    dressCode?: string;
    barcodes?: Array<{ barcode?: string; outletName?: string; outletId?: string }>;
    qrCodes?: Array<{ barcode?: string; outletName?: string; qrCodeImage?: string }>;
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
  /** true = candidate confirmed attendance; false = awaiting candidate confirm (native app) */
  candidateConfirmed?: boolean;
  appliedAt?: string;
  adminNotes?: string;
  rejectionReason?: string;
}

export default function ApplicationDetail() {
  const { applicationId: applicationIdParam } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const applicationId = useMemo(
    () => normalizeApplicationId(applicationIdParam),
    [applicationIdParam]
  );
  const [application, setApplication] = useState<ApplicationDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approveNotes, setApproveNotes] = useState("");
  const [postalResolvedAddress, setPostalResolvedAddress] = useState<string | null>(null);
  const [postalLookupLoading, setPostalLookupLoading] = useState(false);

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
    if (!applicationId) {
      setLoading(false);
      setApplication(null);
      return;
    }
    fetchApplication();
  }, [applicationId]);

  // Enrich candidate location for admin: SG postal → street (same API as edit candidate)
  useEffect(() => {
    const pc = application?.user?.postalCode;
    if (!pc) {
      setPostalResolvedAddress(null);
      return;
    }
    const trimmed = String(pc).trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setPostalResolvedAddress(null);
      return;
    }
    let cancelled = false;
    setPostalLookupLoading(true);
    axiosInstance
      .get(`/admin/postal-code/${trimmed}`)
      .then((res) => {
        if (cancelled) return;
        const street = res.data?.streetAddress;
        setPostalResolvedAddress(typeof street === "string" && street.trim() ? street.trim() : null);
      })
      .catch(() => {
        if (!cancelled) setPostalResolvedAddress(null);
      })
      .finally(() => {
        if (!cancelled) setPostalLookupLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [application?.user?.postalCode, application?._id]);

  if (applicationIdParam && !applicationId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <p className="text-gray-900 font-semibold mb-2">Invalid application ID</p>
        <p className="text-sm text-gray-600 text-center max-w-md mb-4">
          The link must use a valid MongoDB application id (24 hex characters). Do not pass a whole application object in the URL.
        </p>
        <button
          type="button"
          onClick={() => navigate("/applications")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to applications
        </button>
      </div>
    );
  }

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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate("/applications")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Applications
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Application Detail</h1>
            {(status === "Confirmed" || status === "Approved") && (
              <p className="mt-1 text-sm text-gray-600">
                Candidate confirmed:{" "}
                {application.candidateConfirmed === true ? (
                  <span className="font-medium text-emerald-700">Yes</span>
                ) : (
                  <span className="font-medium text-amber-700">Awaiting candidate confirm</span>
                )}
              </p>
            )}
          </div>
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
                {getProfilePicUrl(application.user?.profilePicture) ? (
                  <img
                    src={getProfilePicUrl(application.user?.profilePicture)}
                    alt={application.user?.fullName}
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
                <p>
                  <span className="text-gray-500">Postal code:</span> {application.user?.postalCode || "—"}
                  {postalLookupLoading && (
                    <span className="ml-2 text-xs text-blue-600">Looking up address…</span>
                  )}
                </p>
                <p className="sm:col-span-2">
                  <span className="text-gray-500">Address on profile:</span> {application.user?.address || "—"}
                </p>
                {postalResolvedAddress && (
                  <p className="sm:col-span-2 text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium">Resolved from postal (Singapore):</span> {postalResolvedAddress}
                    <button
                      type="button"
                      onClick={() => copyTextToClipboard(postalResolvedAddress, "Address copied")}
                      className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-700 underline"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </p>
                )}
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

          {/* Employer & work site (API may use flat employerName / outlet ids — helpers normalize) */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <Building2 className="w-5 h-5" />
              Employer & work site
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Employer:</span>{" "}
                <span className="font-medium text-gray-900">{getJobEmployerLabel(application.job)}</span>
              </p>
              <p>
                <span className="text-gray-500">Outlet:</span>{" "}
                <span className="font-medium text-gray-900">{getJobOutletName(application.job)}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span>
                  <span className="text-gray-500">Work location:</span>{" "}
                  {getJobWorkLocationLine(application.job)}
                </span>
              </p>
              {application.job?.dressCode && (
                <p>
                  <span className="text-gray-500">Dress code:</span> {application.job.dressCode}
                </p>
              )}
            </div>
          </section>

          {/* Worker clock-in: display code + barcode (native app manual entry / scan) */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <Hash className="w-5 h-5" />
              Worker clock-in codes
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3 text-sm">
              <p className="text-amber-900 text-xs sm:text-sm">
                Workers can scan a QR/barcode at the outlet, or enter the job code in the app if manual entry is enabled on native.
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                {getJobDisplayCode(application.job) && (
                  <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2">
                    <span className="text-gray-500 text-xs">Job code</span>
                    <code className="font-mono font-semibold text-amber-900">{getJobDisplayCode(application.job)}</code>
                    <button
                      type="button"
                      onClick={() => copyTextToClipboard(getJobDisplayCode(application.job) || "", "Job code copied")}
                      className="p-1 rounded hover:bg-amber-100 text-amber-800"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {getJobClockInBarcode(application.job) &&
                  getJobClockInBarcode(application.job) !== getJobDisplayCode(application.job) && (
                    <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2">
                      <span className="text-gray-500 text-xs">Barcode value</span>
                      <code className="font-mono font-semibold text-amber-900">{getJobClockInBarcode(application.job)}</code>
                      <button
                        type="button"
                        onClick={() =>
                          copyTextToClipboard(getJobClockInBarcode(application.job) || "", "Barcode copied")
                        }
                        className="p-1 rounded hover:bg-amber-100 text-amber-800"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
              </div>
              {!getJobDisplayCode(application.job) && !getJobClockInBarcode(application.job) && (
                <p className="text-amber-800 text-xs">No job/barcode code on this record. Open the job page or QR management after backend attaches barcodes.</p>
              )}
            </div>
          </section>

          {/* Job & Shift */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <Briefcase className="w-5 h-5" />
              Job & shift
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p><span className="text-gray-500">Job:</span> {application.job?.jobName || application.job?.jobTitle || "—"}</p>
              <p><span className="text-gray-500">Date:</span> {application.job?.jobDate ? new Date(application.job.jobDate).toLocaleDateString() : "—"}</p>
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

          {/* Native app flow note */}
          <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            After you approve, the candidate gets a notification in the app and must confirm or cancel. Only confirmed shifts appear in their Upcoming Shifts.
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
