import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import {
  ArrowLeft,
  User,
  Camera,
  FileText,
  Wallet2,
  Save,
  X,
  UploadCloud,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  PauseCircle,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
// @ts-ignore - Loader is a JSX file without types
import Loader from "../../components/Loader";
import JobHistory from "../../components/employerDetail/JobHistory";
import WorkHistory from "../../components/employerDetail/WorkHistory";
import ConfirmationModal from "../../components/ConfirmationModal";
import { Trash2 } from "lucide-react";

// Images come as complete URLs from backend - no base URL needed
import { isPlaceholderProfilePic } from "../../utils/avatarUtils";

const EditCandidateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showNRIC, setShowNRIC] = useState(false);
  const [schoolsList, setSchoolsList] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // User verification (backend: status, verificationStatus, verificationAction)
  const [verificationState, setVerificationState] = useState<{
    status?: string;
    verificationStatus?: string;
    verificationAction?: string | null;
  }>({});
  // User from GET /admin/users/:id – used for employmentStatus & phoneNumber when candidate record is sparse
  const [displayUser, setDisplayUser] = useState<{
    employmentStatus?: string | null;
    phoneNumber?: string | null;
    [key: string]: any;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [showSuspendReason, setShowSuspendReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalNote, setApprovalNote] = useState(""); // VERIFICATION_AND_ADMIN_ACTIONS.md §5.3: optional reason for Approve (audit)
  const [resumeDownloading, setResumeDownloading] = useState(false);
  const [resumeViewing, setResumeViewing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    nric: "",
    dateOfBirth: "",
    gender: "Male" as "Male" | "Female" | "Other",
    postalCode: "",
    streetAddress: "",
    profilePicture: null,
    nricFront: null,
    nricBack: null,
    plocImage: null,
    plocExpiryDate: "",
    foodHygieneCert: null,
    schools: "",
    studentPassImage: null,
    studentIdNo: "",
    eWalletAmount: 0,
    registrationType: "Singaporean/PR",
  });

  const [existingFiles, setExistingFiles] = useState({
    profilePicture: "",
    nricFront: "",
    nricBack: "",
    plocImage: "",
    foodHygieneCert: "",
    studentPassImage: "",
  });

  useEffect(() => {
    if (id) {
      fetchEmployeeData();
      fetchSchoolsList();
      fetchUserVerification();
    }
  }, [id]);

  // When user data loads (GET /admin/users), fill mobile from phoneNumber if form has no mobile (employer can then approve)
  useEffect(() => {
    if (!displayUser?.phoneNumber) return;
    setFormData((prev) => {
      if (prev.mobile && prev.mobile.trim() !== "") return prev;
      return { ...prev, mobile: displayUser.phoneNumber || prev.mobile };
    });
  }, [displayUser?.phoneNumber]);

  const fetchUserVerification = async () => {
    if (!id) return;
    try {
      const response = await axiosInstance.get(`/admin/users/${id}`);
      if (response.data?.success === false) return;
      const user = response.data?.user || response.data;
      setVerificationState({
        status: user.status,
        verificationStatus: user.verificationStatus ?? user.status,
        verificationAction: user.verificationAction ?? null,
      });
      setDisplayUser(user);
    } catch {
      // User might be candidate-only; verification section will not show or show unknown
    }
  };

  const mapCandidateToForm = (candidate: any) => {
    let registrationType: "Singaporean/PR" | "LTVP" | "Student Pass (Foreigner)" = "Singaporean/PR";
    if (candidate.workPassStatus === "LTVP" || candidate.workPassStatus === "Long Term Visit Pass Holder" || candidate.employmentStatus === "LTVP") {
      registrationType = "LTVP";
    } else if (candidate.workPassStatus === "Student Pass" || candidate.workPassStatus === "Student Pass (Foreigner)" || candidate.employmentStatus === "Student Pass") {
      registrationType = "Student Pass (Foreigner)";
    }

    return {
      formData: {
        fullName: candidate.fullName || candidate.name || "",
        mobile: candidate.mobile || candidate.phoneNumber || candidate.personalDetails?.contactNumber || "",
        email: candidate.email || candidate.personalDetails?.email || "",
        nric: candidate.nric || candidate.personalDetails?.nric || candidate.icNumber || "",
        dateOfBirth: candidate.dateOfBirth || candidate.dob || candidate.personalDetails?.dob || "",
        gender: (candidate.gender === "Other" || candidate.gender === "Female" || candidate.gender === "Male") ? candidate.gender : "Male",
        postalCode: candidate.postalCode || candidate.personalDetails?.postalCode || "",
        streetAddress: candidate.streetAddress || candidate.address || candidate.personalDetails?.street || "",
        profilePicture: null,
        nricFront: null,
        nricBack: null,
        plocImage: null,
        plocExpiryDate: candidate.plocExpiryDate || candidate.plocExpiry || "",
        foodHygieneCert: null,
        schools: candidate.schools || "",
        studentPassImage: null,
        studentIdNo: candidate.studentIdNo || candidate.studentId || "",
        eWalletAmount: candidate.eWalletAmount ?? candidate.walletBalance ?? candidate.personalDetails?.eWalletAmount ?? 0,
        registrationType,
      },
      existingFiles: {
        profilePicture: isPlaceholderProfilePic(candidate.profilePicture || candidate.selfie || "") ? "" : (candidate.profilePicture || candidate.selfie || ""),
        nricFront: candidate.nricFront || candidate.nricFrontImage || "",
        nricBack: candidate.nricBack || candidate.nricBackImage || "",
        plocImage: candidate.plocImage || "",
        foodHygieneCert: candidate.foodHygieneCert || "",
        studentPassImage: candidate.studentPassImage || candidate.studentCard || "",
      },
      verificationState: (candidate.status != null || candidate.verificationStatus != null) ? {
        status: candidate.status,
        verificationStatus: candidate.verificationStatus ?? candidate.status,
        verificationAction: candidate.verificationAction ?? null,
      } : undefined,
    };
  };

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      if (!id) {
        toast.error("Invalid candidate ID");
        navigate(-1);
        return;
      }

      let data: any;
      let candidate: any;

      try {
        const response = await axiosInstance.get(`/admin/candidates/${id}`);
        if (response.data?.success === false) throw new Error(response.data?.message || "Failed to fetch");
        data = response.data;
        candidate = data.candidate || data.candidateProfile || data.user || data;
      } catch {
        const fallback = await axiosInstance.get(`/admin/users/${id}`);
        if (fallback.data?.success === false) throw new Error(fallback.data?.message || "Failed to fetch");
        data = fallback.data;
        candidate = data.user || data;
      }

      if (!candidate) {
        throw new Error("Candidate data not found");
      }

      const mapped = mapCandidateToForm(candidate);
      setFormData(mapped.formData);
      setExistingFiles(mapped.existingFiles);
      setUserData(data);
      if (mapped.verificationState) {
        setVerificationState(mapped.verificationState);
      }
    } catch (error: unknown) {
      console.error("Error fetching employee data:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to load employee data";
      toast.error(errorMessage);
      // Don't navigate immediately, let user see the error
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolsList = async () => {
    try {
      const response = await axiosInstance.get("/admin/schools");
      if (response.data?.schools && Array.isArray(response.data.schools)) {
        setSchoolsList(response.data.schools);
      } else {
        setSchoolsList([]);
        toast.error("Failed to load schools list");
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
      setSchoolsList([]);
      toast.error("Failed to load schools list. Please contact support.");
    }
  };

  const fetchResumeBlob = async (resumeUrl: string): Promise<Blob> => {
    const res = await fetch(resumeUrl, { mode: "cors" });
    if (!res.ok) throw new Error("Failed to fetch resume");
    const blob = await res.blob();
    const type = blob.type === "application/pdf" ? blob.type : "application/pdf";
    return blob.type === type ? blob : new Blob([await blob.arrayBuffer()], { type: "application/pdf" });
  };

  const handleResumeView = async (resumeUrl: string) => {
    setResumeViewing(true);
    try {
      const blob = await fetchResumeBlob(resumeUrl);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      toast.success("Resume opened in new tab");
    } catch {
      toast.error("Could not load resume. Try Download instead.");
      window.open(resumeUrl, "_blank", "noopener,noreferrer");
    } finally {
      setResumeViewing(false);
    }
  };

  const handleResumeDownload = async (resumeUrl: string) => {
    setResumeDownloading(true);
    try {
      const blob = await fetchResumeBlob(resumeUrl);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${formData.fullName || "candidate"}.pdf`.replace(/[^a-zA-Z0-9.-]/g, "_");
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Resume downloaded");
    } catch {
      toast.error("Download failed. Opening in new tab – use browser Save to save as PDF.");
      window.open(resumeUrl, "_blank", "noopener,noreferrer");
    } finally {
      setResumeDownloading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-fill street address when postal code is entered (6 digits)
    if (name === "postalCode" && value.length === 6 && /^\d{6}$/.test(value)) {
      fetchPostalCodeAddress(value);
    }
  };

  const fetchPostalCodeAddress = async (postalCode: string) => {
    try {
      const response = await axiosInstance.get(`/admin/postal-code/${postalCode}`);
      if (response.data?.streetAddress) {
        setFormData(prev => ({ ...prev, streetAddress: response.data.streetAddress }));
      }
    } catch (error) {
      // Silently fail - user can enter manually
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const removeFile = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: null }));
    setExistingFiles(prev => ({ ...prev, [field]: "" }));
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const parseDateToInput = (dateString: string) => {
    if (!dateString) return "";
    try {
      // Handle DD/MM/YYYY format
      if (dateString.includes("/")) {
        const [day, month, year] = dateString.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const validateForm = () => {
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Postal code validation (6 digits)
    if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
      toast.error("Postal code must be exactly 6 digits");
      return false;
    }

    // Date of birth validation (DD/MM/YYYY)
    if (formData.dateOfBirth && !/^\d{2}\/\d{2}\/\d{4}$/.test(formatDateForDisplay(formData.dateOfBirth))) {
      toast.error("Date of birth must be in DD/MM/YYYY format");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      // Append all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if ((value as unknown) instanceof File) {
          formDataToSend.append(key, value as unknown as File);
        } else if (key !== "eWalletAmount" && value !== null && value !== undefined) {
          formDataToSend.append(key, String(value));
        }
      });

      // Convert date format if needed
      if (formData.dateOfBirth) {
        formDataToSend.set("dateOfBirth", formatDateForDisplay(formData.dateOfBirth));
      }

      const response = await axiosInstance.put(`/admin/candidates/${id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Check for success field according to API spec
      if (response.data?.success === false) {
        toast.error(response.data?.message || "Failed to update employee profile");
        return;
      }

      if (response.status === 200 || response.status === 201) {
        toast.success("Employee profile updated successfully!");
        navigate(-1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update employee profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const isSingaporeanPR = formData.registrationType === "Singaporean/PR";
  const isLTVP = formData.registrationType === "LTVP";
  const isStudentPass = formData.registrationType === "Student Pass (Foreigner)";
  const showEmail = !userData?.candidateProfile?.email && !userData?.email;

  // VERIFICATION_AND_ADMIN_ACTIONS.md §5.6: DELETE /admin/users/:userId; 403 = cannot delete admin, 404 = not found
  const handleDeleteCandidate = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(`/admin/users/${id}`);

      if (response.data?.success === false) {
        toast.error(response.data?.message || "Failed to delete user");
        return;
      }

      toast.success(response.data?.message || "User deleted successfully");
      navigate("/hustle-heroes");
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 403) toast.error(msg || "Cannot delete an admin user.");
      else if (status === 404) toast.error(msg || "User not found.");
      else toast.error(msg || "Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleVerifyUser = async (action: "Approved" | "Rejected" | "Suspended") => {
    if (!id) return;
    setIsVerifying(true);
    setShowRejectReason(false);
    setShowSuspendReason(false);
    try {
      const body: { action: string; reason?: string } = { action };
      const reason = rejectionReason.trim();
      if (reason) body.reason = reason; // §5.3: optional for Approve (audit); §5.4–5.5 optional for Reject/Suspend
      const response = await axiosInstance.put(`/admin/users/${id}/verify`, body);
      if (response.data?.success === false) {
        toast.error(response.data?.message || "Action failed");
        return;
      }
      const msg =
        action === "Approved"
          ? "User verified successfully"
          : action === "Rejected"
            ? "User rejected"
            : "User suspended";
      toast.success(response.data?.message || msg);
      setRejectionReason("");
      setApprovalNote("");
      await fetchUserVerification();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Request failed";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Employee Profile</h1>
        </div>

        {/* Profile Summary Card – employer can check and approve; show employment status & number from backend */}
        {userData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative">
                {existingFiles.profilePicture && !isPlaceholderProfilePic(existingFiles.profilePicture) ? (
                  <img
                    src={existingFiles.profilePicture}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{formData.fullName || "N/A"}</h2>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Employment status:</span>{" "}
                  {displayUser?.employmentStatus ?? userData?.user?.employmentStatus ?? (formData.registrationType === "Singaporean/PR" ? "Singaporean/Permanent Resident" : formData.registrationType === "LTVP" ? "Long Term Visit Pass Holder" : formData.registrationType === "Student Pass (Foreigner)" ? "Student Pass (Foreigner)" : formData.registrationType) ?? "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Phone number:</span>{" "}
                  {formData.mobile || displayUser?.phoneNumber || userData?.user?.phoneNumber || "N/A"}
                </p>
                <p className="text-sm text-gray-600">E-Wallet: ${formData.eWalletAmount.toFixed(2)}</p>
                {/* Resume: admin can view and download before approval (user.resumeUrl from GET /admin/users/:id) */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">Resume</p>
                  {(() => {
                    const resumeUrl =
                      displayUser?.resumeUrl ??
                      userData?.user?.resumeUrl ??
                      userData?.candidateProfile?.resumeUrl ??
                      userData?.candidate?.resumeUrl;
                    if (!resumeUrl || typeof resumeUrl !== "string") {
                      return <span className="text-sm text-amber-600">Not uploaded</span>;
                    }
                    return (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleResumeView(resumeUrl)}
                          disabled={resumeViewing}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {resumeViewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                          {resumeViewing ? "Opening..." : "View resume"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResumeDownload(resumeUrl)}
                          disabled={resumeDownloading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {resumeDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          {resumeDownloading ? "Downloading..." : "Download resume"}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification (backend: PUT /api/admin/users/:userId/verify) */}
        {id && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Account verification</h2>
            <p className="text-sm text-gray-600 mb-4">
              Status:{" "}
              <span
                className={`font-medium ${
                  verificationState.status === "Verified" ||
                  verificationState.verificationStatus === "Verified" ||
                  verificationState.status === "Activated" ||
                  verificationState.verificationStatus === "Approved"
                    ? "text-green-600"
                    : verificationState.status === "Rejected" || verificationState.verificationStatus === "Rejected"
                    ? "text-red-600"
                    : verificationState.status === "Suspended" || verificationState.verificationStatus === "Suspended"
                    ? "text-orange-600"
                    : "text-amber-600"
                }`}
              >
                {verificationState.verificationStatus ?? verificationState.status ?? "Pending"}
              </span>
            </p>
            {(() => {
              const s = (v: string | undefined) => (v || "").toLowerCase();
              const st = s(verificationState.status);
              const vs = s(verificationState.verificationStatus);
              const isVerified = ["verified", "approved", "activated", "active"].includes(st) || ["verified", "approved", "activated", "active"].includes(vs);
              const isRejected = st === "rejected" || vs === "rejected";
              const isSuspended = st === "suspended" || vs === "suspended";
              return (
                <div className="space-y-3">
                  {!isVerified && (
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional, for audit when approving)</label>
                      <input
                        type="text"
                        value={approvalNote}
                        onChange={(e) => setApprovalNote(e.target.value)}
                        placeholder="e.g. Documents verified"
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {!isVerified && (
                      <button
                        type="button"
                        disabled={isVerifying}
                        onClick={() => handleVerifyUser("Approved")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Approve
                      </button>
                    )}
                    {!isRejected && (
                      <button
                        type="button"
                        disabled={isVerifying}
                        onClick={() => { setShowRejectReason((v) => !v); setShowSuspendReason(false); }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    )}
                    {!isSuspended && (
                      <button
                        type="button"
                        disabled={isVerifying}
                        onClick={() => { setShowSuspendReason((v) => !v); setShowRejectReason(false); }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PauseCircle className="w-4 h-4" />
                        Suspend
                      </button>
                    )}
                  </div>
                {showRejectReason && (
                  <div className="flex flex-col gap-2 max-w-md">
                    <label className="text-sm font-medium text-gray-700">Rejection reason (optional)</label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Incomplete documents"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={() => handleVerifyUser("Rejected")}
                      className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Confirm reject
                    </button>
                  </div>
                )}
                {showSuspendReason && (
                  <div className="flex flex-col gap-2 max-w-md">
                    <label className="text-sm font-medium text-gray-700">Suspend reason (optional)</label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Policy violation"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={() => handleVerifyUser("Suspended")}
                      className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                    >
                      {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Confirm suspend
                    </button>
                  </div>
                )}
              </div>
              );
            })()}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="space-y-8">
            {/* Section 1: Basic Information */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name - Pre-filled, editable by admin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name (As per NRIC) <span className="text-gray-400 text-xs">(Pre-filled)</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Mobile Number - Pre-filled, editable by admin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-gray-400 text-xs">(Pre-filled)</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Email Address - Conditional visibility */}
                {showEmail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* NRIC or FIN No - Conditional masking */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NRIC or FIN No <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={isStudentPass && !showNRIC ? "password" : "text"}
                      name="nric"
                      value={formData.nric}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    />
                    {isStudentPass && (
                      <button
                        type="button"
                        onClick={() => setShowNRIC(!showNRIC)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNRIC ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  {isStudentPass && (
                    <p className="text-xs text-gray-500 mt-1">Masked for Student Pass holders</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span> <span className="text-gray-400 text-xs">(DD/MM/YYYY)</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={parseDateToInput(formData.dateOfBirth)}
                    onChange={(e) => {
                      const date = e.target.value;
                      if (date) {
                        const [year, month, day] = date.split("-");
                        setFormData(prev => ({ ...prev, dateOfBirth: `${day}/${month}/${year}` }));
                      }
                    }}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Gender – Male | Female | Other per ADMIN_PROFILE_AND_USER_UPDATE.md */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === "Male"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Male</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={formData.gender === "Female"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Female</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Other"
                        checked={formData.gender === "Other"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Other</span>
                    </label>
                  </div>
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code <span className="text-red-500">*</span> <span className="text-gray-400 text-xs">(6 digits)</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    maxLength={6}
                    pattern="\d{6}"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Street Address - Auto-filled from postal code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-gray-400 text-xs">(Auto-filled from postal code)</span>
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Documents & Certificates */}
            <section className="space-y-6 border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Documents & Certificates
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Picture - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture (Live Selfie) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "profilePicture")}
                      className="hidden"
                      id="profilePicture"
                      capture="user"
                    />
                    <label
                      htmlFor="profilePicture"
                      className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <Camera className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Upload Selfie</span>
                    </label>
                    {(formData.profilePicture || (existingFiles.profilePicture && !isPlaceholderProfilePic(existingFiles.profilePicture))) && (
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            formData.profilePicture && typeof formData.profilePicture === "object" && "size" in formData.profilePicture
                              ? URL.createObjectURL(formData.profilePicture as File)
                              : existingFiles.profilePicture
                          }
                          alt="Profile preview"
                          className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile("profilePicture")}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* NRIC Images - Conditional (Singaporean/PR) */}
                {isSingaporeanPR && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NRIC Image (Front) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "nricFront")}
                          className="hidden"
                          id="nricFront"
                        />
                        <label
                          htmlFor="nricFront"
                          className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <UploadCloud className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Upload Front</span>
                        </label>
                        {(formData.nricFront || existingFiles.nricFront) && (
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                formData.nricFront && typeof formData.nricFront === "object" && "size" in formData.nricFront
                                  ? URL.createObjectURL(formData.nricFront as File)
                                  : existingFiles.nricFront
                              }
                              alt="NRIC Front"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile("nricFront")}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NRIC Image (Back) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "nricBack")}
                          className="hidden"
                          id="nricBack"
                        />
                        <label
                          htmlFor="nricBack"
                          className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <UploadCloud className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Upload Back</span>
                        </label>
                        {(formData.nricBack || existingFiles.nricBack) && (
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                formData.nricBack && typeof formData.nricBack === "object" && "size" in formData.nricBack
                                  ? URL.createObjectURL(formData.nricBack as File)
                                  : existingFiles.nricBack
                              }
                              alt="NRIC Back"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile("nricBack")}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* PLOC Image - Conditional (LTVP) */}
                {isLTVP && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PLOC Image <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "plocImage")}
                          className="hidden"
                          id="plocImage"
                        />
                        <label
                          htmlFor="plocImage"
                          className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <UploadCloud className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Upload PLOC</span>
                        </label>
                        {(formData.plocImage || existingFiles.plocImage) && (
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                formData.plocImage && typeof formData.plocImage === "object" && "size" in formData.plocImage
                                  ? URL.createObjectURL(formData.plocImage as File)
                                  : existingFiles.plocImage
                              }
                              alt="PLOC"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile("plocImage")}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PLOC Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="plocExpiryDate"
                        value={formData.plocExpiryDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {/* Student Pass Fields - Conditional (Student Pass) */}
                {isStudentPass && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Schools <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="schools"
                        value={formData.schools}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select School</option>
                        {schoolsList.map((school) => (
                          <option key={school} value={school}>
                            {school}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student Pass Image <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "studentPassImage")}
                          className="hidden"
                          id="studentPassImage"
                        />
                        <label
                          htmlFor="studentPassImage"
                          className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <UploadCloud className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Upload Student Pass</span>
                        </label>
                        {(formData.studentPassImage || existingFiles.studentPassImage) && (
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                formData.studentPassImage && typeof formData.studentPassImage === "object" && "size" in formData.studentPassImage
                                  ? URL.createObjectURL(formData.studentPassImage as File)
                                  : existingFiles.studentPassImage
                              }
                              alt="Student Pass"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile("studentPassImage")}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student ID No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="studentIdNo"
                        value={formData.studentIdNo}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {/* Food Hygiene Cert - Optional but conditionally required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Hygiene Cert <span className="text-gray-400 text-xs">(Optional - Required if job listing mandates it)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, "foodHygieneCert")}
                      className="hidden"
                      id="foodHygieneCert"
                    />
                    <label
                      htmlFor="foodHygieneCert"
                      className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Upload Certificate</span>
                    </label>
                    {(formData.foodHygieneCert || existingFiles.foodHygieneCert) && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Certificate uploaded</span>
                        <button
                          type="button"
                          onClick={() => removeFile("foodHygieneCert")}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* E-Wallet Amount - Display only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-Wallet Amount <span className="text-gray-400 text-xs">(Display only)</span>
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                    <Wallet2 className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-semibold text-gray-900">${formData.eWalletAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Job History Section */}
            {userData && (
              <section className="space-y-6 border-t border-gray-200 pt-8">
                <h2 className="text-xl font-semibold text-gray-900">Job History</h2>
                <JobHistory jobHistory={userData.jobHistory || {}} />
                <h2 className="text-xl font-semibold text-gray-900 mt-6">Work History</h2>
                <WorkHistory workHistory={Array.isArray(userData.workHistory) ? userData.workHistory : []} />
              </section>
            )}

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 border border-red-300 rounded-lg text-red-700 font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete Profile
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteCandidate}
        title="Delete User"
        message={`Are you sure you want to delete ${formData.fullName || "this user"}? This action cannot be undone and will permanently remove all user data.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default EditCandidateProfile;
