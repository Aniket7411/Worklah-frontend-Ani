import { ArrowLeft, Eye, MoreVertical, RotateCcw, Settings, View, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FiCheck, FiEdit3, FiChevronDown } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/ConfirmationModal";
// import Image from "next/image"

interface Candidate {
  id: number;
  _id?: string;
  applicationId?: string;
  name: string;
  fullName?: string;
  gender: string;
  age: number;
  mobile: string;
  dob: string;
  nric: string;
  resumeUrl?: string | null;
  employmentStatus?: string;
  user?: { resumeUrl?: string | null; fullName?: string };
  startTime: string;
  endTime: string;
  clockedIn: string;
  clockedOut: string;
  completedJobs: number;
  status: string;
  jobStatus: string;
  wage: number;
  image: string;
  approvedStatus?: string;
  profilePicture?: string;
  shift?: Record<string, unknown>;
  confirmedOrStandby?: string;
}


export default function CandidateManagement() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [data, setData] = useState<any>(null)
  const [activeTime, setActiveTime] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<number | null>(null);
  const [isEditTime, setIsEditTime] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"All" | "Confirmed" | "Pending">("All");
  const [showConfirmModal, setShowConfirmModal] = useState<{ isOpen: boolean; userId: string | null; newStatus: string | null }>({
    isOpen: false,
    userId: null,
    newStatus: null,
  });
  const [showRejectionModal, setShowRejectionModal] = useState<{ isOpen: boolean; userId: string | null }>({
    isOpen: false,
    userId: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const rejectReasonTemplates = [
    "Resume required for this role",
    "NRIC documents required",
    "Incomplete profile",
    "Documents do not meet job requirements",
  ];



  const navigate = useNavigate()
  const { jobId } = useParams()

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/admin/jobs/candidates/${jobId}`);
      
      // Check for success field according to API spec
      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to fetch candidates");
      }
      
      setCandidates(response.data?.candidates || []);
      setData(response.data || {});
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load candidates. Please try again later.";
      setError(errorMessage);
      toast.error(errorMessage);
      setCandidates([]);
      setData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchCandidates();
    }
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchCandidates}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }



  const handleActionClick = (action: string, id: number) => {
    // alert(`Action: ${action}, Row: ${index}`);
    if (action === "View Candidate") {
      navigate(`/jobs/${jobId}/candidates/${id}`);
    }
    setIsPopupOpen(null);
  };
  const handlePopupToggle = (index: number) => {
    setIsPopupOpen(isPopupOpen === index ? null : index);
  };

  const handleStatusSelection = (userId: string, newStatus: string) => {
    if (newStatus === "Rejected") {
      setShowRejectionModal({ isOpen: true, userId });
      setRejectionReason("");
      return;
    }

    setShowConfirmModal({ isOpen: true, userId, newStatus });
  };

  const handleConfirmStatusChange = async () => {
    if (!showConfirmModal.userId || !showConfirmModal.newStatus) return;
    
    await handleApprovedStatusChange(showConfirmModal.userId, showConfirmModal.newStatus, null);
    setShowConfirmModal({ isOpen: false, userId: null, newStatus: null });
  };

  const handleConfirmRejection = async () => {
    if (!showRejectionModal.userId || !rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    await handleApprovedStatusChange(showRejectionModal.userId, "Rejected", rejectionReason.trim());
    setShowRejectionModal({ isOpen: false, userId: null });
    setRejectionReason("");
  };

  const handleApprovedStatusChange = async (
    applicationIdOrCandidateId: string, // applicationId for approve/reject endpoints
    newStatus: string,
    reason: string | null = null
  ) => {
    setIsUpdating(true);
    try {
      // According to API documentation:
      // - POST /api/admin/applications/:applicationId/approve (for approval)
      // - POST /api/admin/applications/:applicationId/reject (for rejection)
      const appId = applicationIdOrCandidateId;
      if (newStatus === "Approved" || newStatus === "Confirmed") {
        await axiosInstance.post(`/admin/applications/${appId}/approve`, {
          notes: reason || undefined
        });
      } else if (newStatus === "Rejected") {
        await axiosInstance.post(`/admin/applications/${appId}/reject`, {
          reason: reason || undefined,
          notes: reason || undefined
        });
      } else {
        const candidate = candidates.find((c: any) => c.id === appId || c._id === appId || c.applicationId === appId);
        const userId = (candidate as any)?.userId || (candidate as any)?.user?._id || (candidate as any)?.user?.id;
        if (userId && jobId) {
          await axiosInstance.put(`/admin/applications/status/${userId}`, {
            status: newStatus,
            jobId: jobId,
            rejectionReason: reason || undefined
          });
        } else {
          await axiosInstance.put(`/admin/applications/status/${appId}`, {
            status: newStatus,
            jobId: jobId,
            rejectionReason: reason || undefined
          });
        }
      }

      setCandidates((prev) =>
        prev.map((c) =>
          (c.id === applicationIdOrCandidateId || (c as any)._id === applicationIdOrCandidateId || (c as any).applicationId === applicationIdOrCandidateId) ? { 
            ...c, 
            approvedStatus: newStatus === "Approved" ? "Confirmed" : newStatus, 
            status: newStatus === "Approved" ? "Upcoming" : newStatus
          } : c
        )
      );
      
      toast.success(`Status updated to ${newStatus} successfully`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
  const shiftRange = `${candidate.shift?.startTime} - ${candidate.shift?.endTime}`;

  const matchesStatus =
    statusFilter === "All" || candidate.approvedStatus === statusFilter;

  const matchesTime =
    !activeTime || shiftRange === activeTime;

  return matchesStatus && matchesTime;
});

  


  return (
    <div className="p-4 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button className="rounded-full hover:bg-gray-100 cursor-pointer" onClick={() => navigate(-1)}>
            <ArrowLeft className="rounded-full p-2 shadow-lg w-10 h-10" />
          </button>
          <h1 className="text-xl font-semibold">Candidates</h1>
        </div>

        <div>
          <button className="text-gray-500 hover:text-black mx-2">
            <Settings className="rounded-full p-2 shadow-lg w-10 h-10" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex gap-1">
              <span className="text-base font-semibold text-[#4C4C4C]">
                Job:
              </span>
              <span className="text-base font-semibold">{data.job?.jobName}</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                Active
              </span>
            </div>
            <div className="flex gap-1">
              <span className="text-base font-semibold text-[#4C4C4C]">
                Employer:
              </span>
              <span className="text-base font-semibold">
                {data.job?.employer}
              </span>
            </div>
            <div className="flex gap-1">
              <span className="text-base font-semibold text-[#4C4C4C]">
                Date:
              </span>
              <span className="text-base font-semibold ">{data.job?.date}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-base font-semibold text-[#4C4C4C]">
              Current Headcounts:
              </span>
              <span className="text-base font-semibold">{data.job?.currentHeadCount}</span>
            </div>

          </div>
        </div>
        <div>
          <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-black/90">
            Export
          </button>
        </div>
      </div>

      <div className="flex mb-6 gap-2">
  <button
    onClick={() => setStatusFilter("All")}
    className={`px-4 py-2 text-base font-medium rounded-full ${
      statusFilter === "All" ? "bg-black text-white" : "bg-[#F4F4F4]"
    }`}
  >
    All Candidates ({data?.totalCandidates || 0})
  </button>
  <button
    onClick={() => setStatusFilter("Confirmed")}
    className={`px-4 py-2 text-base font-medium rounded-full ${
      statusFilter === "Confirmed" ? "bg-black text-white" : "bg-[#F4F4F4]"
    }`}
  >
    Confirmed Candidates ({data?.confirmedCount || 0})
  </button>
  <button
    onClick={() => setStatusFilter("Pending")}
    className={`px-4 py-2 text-base font-medium rounded-full ${
      statusFilter === "Pending" ? "bg-black text-white" : "bg-[#F4F4F4]"
    }`}
  >
    Pending Candidates ({data?.pendingCount || 0})
  </button>
</div>


      <div className="flex gap-2 mb-6 flex-wrap">
        {Array.from(
          new Set(
            candidates
              .filter((c) => c.shift?.startTime && c.shift?.endTime)
              .map((c) => `${c.shift.startTime} - ${c.shift.endTime}`)
          )
        ).map((range) => (
          <button
            key={range}
            className={`px-4 py-1 text-base font-medium border rounded-full ${activeTime === range
                ? "bg-[#048BE1] text-white border-[#048BE1]"
                : "text-black border-[#048BE1] hover:bg-gray-50"
              }`}
            onClick={() => setActiveTime(range)}
          >
            {range}
          </button>
        ))}
      </div>



      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 ">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500"></th>
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                Approved Status
              </th>
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                Full Name
              </th>
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                Gender
              </th>
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                Mobile
              </th>
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                Age
              </th>
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                NRIC
              </th>
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                Resume
              </th>
              {/* <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                Start Time
              </th>
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                End Time
              </th> */}
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                Clocked In
              </th>
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                Clocked Out
              </th>
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                Completed Jobs
              </th>
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                From Confirmed/Standby
              </th>
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                Job Status
              </th>
              <th className="px-4 py-3 truncate capitalize tracking-wider text-center text-sm font-medium border text-gray-500">
                Wage Generated
              </th>
              <th className="px-4 py-3 truncate capitalize tracking-wider"></th>
            </tr>
          </thead>

          <tbody>
            
          {filteredCandidates.map((candidate) => (
              <tr key={candidate.id} className="border-b last:border-b-0 relative">
                <td className="px-4 py-4 text-center truncate border text-[16px] leading-[20px] text-[#000000] font-medium">
                  {candidate.profilePicture ? (
                    <img
                      src={candidate.profilePicture}
                      alt={candidate.name || "Candidate Image"}
                      className="rounded-full max-w-none"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div 
                      className="rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500"
                      style={{
                        width: "40px",
                        height: "40px",
                      }}
                    >
                      {candidate.fullName?.charAt(0)?.toUpperCase() || candidate.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center border relative">
                  <select
                    value={candidate.approvedStatus}
                    onChange={(e) =>
                      handleStatusSelection(candidate.id, e.target.value)
                    }
                    className={`px-3 py-1 pr-6 rounded-full text-sm font-medium appearance-none w-full cursor-pointer ${candidate.approvedStatus === "Confirmed"
                      ? "bg-green-100 text-green-700"
                      : candidate.approvedStatus === "Pending"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <FiChevronDown className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
                </td>

                <td className="px-4 py-3 text-center truncate border capitalize text-[16px] leading-[20px] text-[#000000] font-medium">
                  {candidate.fullName || "N/A"}
                </td>
                <td className="px-4 py-3 text-center truncate border capitalize text-[16px] leading-[20px] text-[#000000] font-medium">
                  {candidate.gender || "N/A"}
                </td>
                <td className="px-4 py-3 text-center truncate border capitalize text-[16px] leading-[20px] text-[#000000] font-medium">
                  {candidate.mobile || "N/A"}
                </td>
                <td className="px-4 py-3 text-center truncate border capitalize text-[16px] leading-[20px] text-[#000000] font-medium">
                  {candidate.age || "N/A"}
                </td>
                <td className="px-4 py-3 text-center truncate border capitalize text-[16px] leading-[20px] text-[#000000] font-medium">
                  {candidate.nric || "N/A"}
                </td>
                <td className="px-4 py-3 text-center truncate border text-[16px] leading-[20px] text-[#000000] font-medium">
                  {(candidate.resumeUrl ?? candidate.user?.resumeUrl) ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">Has resume</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">No resume</span>
                  )}
                </td>
                {/* <td className="px-4 py-3 text-center truncate border capitalize text-[16px] leading-[20px] text-[#000000] font-medium">
                  <span className="px-2 py-1 bg-[#048BE1] text-white rounded-full ">
                    {candidate.shift?.startTime || "N/A"}

                  </span>
                </td>
                <td className="px-4 py-3 text-center truncate border capitalize text-[16px] leading-[20px] text-[#000000] font-medium">
                  <span className="px-2 py-1 bg-[#048BE1] text-white rounded-full ">
                    {candidate.shift?.endTime || "N/A"}
                  </span>
                </td> */}
                <td className="px-4 py-3 text-center truncate border capitalize text-[16px] leading-[20px] text-[#000000] font-medium">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 py-1 px-3 rounded-full border border-[#048BE1] w-fit">
                      <RotateCcw
                        className={`text-white p-1 rounded-full ${isEditTime ? "bg-black" : "bg-[#CDCDCD]"
                          } w-7 h-7`}
                      />
                      {isEditTime ? (
                        <>
                          <input
                            type="text"
                            className="text-[16px] leading-[24px] font-medium bg-[#EBEBEB] rounded-lg text-[#000000] w-[70px] text-center"
                            defaultValue={candidate.shift?.clockedIn}
                          />
                          <FiCheck
                            className="text-white p-1 rounded-full bg-[#049609] w-7 h-7 cursor-pointer"
                            onClick={() => setIsEditTime(false)} // Set back to false
                          />
                        </>
                      ) : (
                        <>
                          <p className="text-[16px] leading-[24px] font-medium text-[#000000] w-[70px] text-center">
                            {candidate.shift?.clockedIn}
                          </p>
                          <FiEdit3
                            className="text-white p-1 rounded-full bg-[#0099FF] w-7 h-7 cursor-pointer"
                            onClick={() => setIsEditTime(true)} // Set to true
                          />
                        </>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center truncate border capitalize text-[16px] leading-[20px] text-[#000000] font-medium">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 py-1 px-3 rounded-full border border-[#048BE1] w-fit">
                      <RotateCcw className="text-white p-1 rounded-full bg-[#CDCDCD] w-7 h-7" />
                      <p className="text-[16px] leading-[24px] font-medium text-[#000000] w-[70px] text-center">
                        {candidate.shift?.clockedOut}
                      </p>
                      <FiEdit3 className="text-white p-1 rounded-full bg-[#0099FF] w-7 h-7" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center truncate border capitalize text-[16px] leading-[20px] text-[#000000] font-medium">
                  {candidate.completedJobs}
                </td>
                <td className="px-4 py-3 text-center truncate border capitalize text-[16px] leading-[20px] text-[#000000] font-medium">
                  <span
                    className={`py-0.5 px-3 rounded-full ${candidate.status === "Confirmed"
                      ? "bg-[#DEFFDF] text-[#049609]"
                      : "bg-[#FFF7DC] text-[#D37700]"
                      }`}
                  >
                    {candidate.confirmedOrStandby}
                  </span>
                </td>
                <td className="px-4 py-3 text-center truncate border capitalize text-[16px] leading-[20px] text-[#000000] font-medium">
                  <span className="bg-[#E0F3FF] text-[#0099FF] px-3 py-0.5 rounded-full">
                    {data.job?.jobStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-center truncate border capitalize text-[16px] leading-[20px] text-[#000000] font-medium relative">
                  <div className="flex flex-col">
                    <span>{candidate.shift?.wageGenerated}</span>
                    <span className="text-xs text-gray-500">
                      {candidate.shift?.totalDuration} ({candidate.shift?.breakType} Break)
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center truncate border capitalize text-[16px] leading-[20px] text-[#000000] font-medium ">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => handlePopupToggle(candidate.id)}>
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {isPopupOpen === candidate.id && (
                      <div className="absolute top-[40%] right-12 mt-1 w-40 bg-white shadow-md border border-gray-300 rounded-md z-10">
                        <button
                          className="flex items-center gap-2 p-2 w-full text-left text-gray-700 hover:bg-gray-100"
                          onClick={() => handleActionClick("View Candidate", candidate.id)}
                        >
                          <Eye size={16} />
                          View Candidate
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCandidates.length === 0 && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <View className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium text-lg">No candidates found</p>
          <p className="text-gray-400 text-sm mt-1">
            {statusFilter !== "All" 
              ? `No ${statusFilter.toLowerCase()} candidates for this filter.`
              : "No candidates have applied for this job yet."}
          </p>
        </div>
      )}

      {/* Confirmation Modal for Status Change */}
      <ConfirmationModal
        isOpen={showConfirmModal.isOpen}
        onClose={() => setShowConfirmModal({ isOpen: false, userId: null, newStatus: null })}
        onConfirm={handleConfirmStatusChange}
        title="Confirm Status Change"
        message={`Are you sure you want to change the status to ${showConfirmModal.newStatus}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        type="info"
        isLoading={isUpdating}
      />

      {/* Rejection Reason Modal */}
      {showRejectionModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Reject Candidate</h3>
              <button
                onClick={() => {
                  setShowRejectionModal({ isOpen: false, userId: null });
                  setRejectionReason("");
                }}
                disabled={isUpdating}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-1">User will see this so they know what to improve.</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {rejectReasonTemplates.map((template) => (
                  <button
                    key={template}
                    type="button"
                    onClick={() => setRejectionReason(template)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
                  >
                    {template}
                  </button>
                ))}
              </div>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled={isUpdating}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowRejectionModal({ isOpen: false, userId: null });
                  setRejectionReason("");
                }}
                disabled={isUpdating}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                disabled={isUpdating || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Reject Candidate"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
