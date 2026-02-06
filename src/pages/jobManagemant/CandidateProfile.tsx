"use client";

import {
  ArrowLeft,
  Settings,
  MessagesSquare,
  Clock,
  MessageSquare,
  Camera,
  History,
  CalendarClock,
  CalendarCheck,
  CalendarX2,
  Ban,
  Image,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaRegIdCard } from "react-icons/fa";
import {
  MdOutlineDateRange,
  MdOutlineOutlinedFlag,
  MdOutlineVerifiedUser,
} from "react-icons/md";
import { TbGenderGenderfluid } from "react-icons/tb";
import { CiUser } from "react-icons/ci";
import { GoChecklist } from "react-icons/go";
import { FiEdit3 } from "react-icons/fi";
import { FaHandHoldingWater } from "react-icons/fa";
import { TbUserHexagon } from "react-icons/tb";

import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import JobHistory from "../../components/employerDetail/JobHistory";
import WorkHistory from "../../components/employerDetail/WorkHistory";
import { axiosInstance } from "../../lib/authInstances";
import OverViewTable from "./OverViewTable";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

interface PersonalDetails {
  candidateId: string;
  contactNumber: string;
  dob: string;
  gender: string;
  nric: string;
  nationality: string;
  race: string;
  paynowNum: string;
  foodHygineCert: string;
  icNumber: string;
  // nricFront: string;
  // nricBack: string;
}

interface ActiveJobs {
  job: string;
  ongoingShift: string;
  clockedIn: string;
  employer: string;
  duration: string;
  clockedOut: string;
  date: string;
  totalWage: string;
  wageGenerated: string;
  rateType: string;
}


interface Employee {
  id: string;
  fullName: string;
  avatarUrl: string;
  gender: string;
  mobile: string;
  // nric: string;
  icNumber: string;
  dob: string;
  registrationDate: string;
  turnUpRate: string;
  workingHours: string;
  avgAttendRate: string;
  workPassStatus: "Verified" | "Approved" | "Pending" | "Rejected";
  profilePicture?: string;
}

export default function ProfileDashboard() {



  const [employees, setEmployees] = useState<Employee[]>([]);
  const { id } = useParams();
  const [userData, setUserData] = useState<any>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navigate = useNavigate();

  const personalDetails: PersonalDetails = {
    candidateId: userData?.candidateProfile?.candidateId || "N/A",
    contactNumber:
      userData?.candidateProfile?.personalDetails?.contactNumber || "N/A",
    dob: userData?.candidateProfile?.personalDetails?.dob || "N/A",
    gender: userData?.candidateProfile?.personalDetails?.gender || "N/A",
    nric: userData?.candidateProfile?.personalDetails?.nric || "N/A",
    nationality:
      userData?.candidateProfile?.personalDetails?.nationality || "N/A",
    paynowNum:
      userData?.candidateProfile?.personalDetails?.paynowNumber || "N/A",
    // race: userData?.candidateProfile?.personalDetails?.race || "N/A",
    // foodHygineCert:
    //   userData?.candidateProfile?.personalDetails?.foodHygieneCert || "N/A",
    icNumber: userData?.candidateProfile?.personalDetails?.icNumber || "N/A",
    //nricFront: userData?.candidateProfile?.personalDetails?.nricFront || "N/A",
    //nricBack: userData?.candidateProfile?.personalDetails?.nricBack || "N/A",
  };

  const activeJobs: ActiveJobs = {
    job: userData?.activeJob?.jobName || "N/A",
    ongoingShift: `${userData?.activeJob?.shiftStartTime || "N/A"} ---- ${
      userData?.activeJob?.shiftEndTime || "N/A"
    }`,
    clockedIn: userData?.activeJob?.clockedIn || "N/A",
    employer: userData?.activeJob?.employer || "N/A",
    duration: userData?.activeJob?.duration || "N/A",
    clockedOut: userData?.activeJob?.clockedOut || "N/A",
    date: userData?.activeJob?.date || "N/A",
    totalWage: userData?.activeJob?.totalWage || "N/A",
    wageGenerated: userData?.activeJob?.wageGenerated || "N/A",
    rateType: userData?.activeJob?.rateType || "N/A",
  };

  const customLabels: Record<string, string> = {
    candidateId: "Candidate ID",
    contactNumber: "Contact Number",
    dob: "DOB",
    gender: "Gender",
    nric: "NRIC",
    nationality: "Nationality",
    paynowNum: "Paynow Number",
    race: "Race",
    foodHygineCert: "Food & Hygiene cert.",
    icNumber: "IC number",
    // nricFront: "Nric Front",
    // nricBack: "Nric Back",
  };

  const customLablesActiveJobs: Record<string, string> = {
    job: "Job",
    ongoingShift: "Ongoing shift",
    clockedIn: "Clocked In Time",
    employer: "Employer",
    duration: "Duration",
    clockedOut: "Clcoked Out time ",
    date: "Date",
    totalWage: "Total Wage",
    wageGenerated: "Wage Generated",
    rateType: "Rate Type",
  };

  const InputForRole = {
    "Singaporean/Permanent Resident": [
      "nricFront",
      "nricBack",
      "finFront",
      "finBack",
      "selfie",
      "foodHygieneCert",
    ],
    "Long Term Visit Pass Holder": ["plocImage", "selfie", "foodHygieneCert"],
    "Student Pass": ["studentCard", "foodHygieneCert", "selfie"],
    "No Valid Work Pass": ["selfie", "foodHygieneCert"],
  };

  useEffect(() => {
    if (!id) return;
    // Fetch employees from API
    axiosInstance
      .get(`/admin/candidates/${id}`)
      .then((response) => {
        // console.log("response", response.data)
        setUserData(response.data);
      })
      .catch((error: any) => {
        console.error("Error fetching employees:", error);
        toast.error(error?.response?.data?.message || "Failed to load candidate data");
        navigate("/hustle-heroes");
      });
  }, [id, navigate]);

  const getIcon = (key: string) => {
    switch (key) {
      case "candidateId":
        return <FaRegIdCard className="w-5 h-5 text-[#048BE1]" />;
      case "contactNumber":
        return <MessageSquare className="w-5 h-5 text-[#048BE1]" />;
      case "dob":
        return <MdOutlineDateRange className="w-6 h-6 text-[#048BE1]" />;
      case "gender":
        return <TbGenderGenderfluid className="w-6 h-6 text-[#048BE1]" />;
      // case "nric":
      //   return <FaRegIdCard className="w-5 h-5 text-[#048BE1]" />;
      case "nationality":
        return <MdOutlineOutlinedFlag className="w-7 h-7 text-[#048BE1]" />;
      case "race":
        return <CiUser className="w-6 h-6 text-[#048BE1]" />;
      case "paynowNum":
        return <CiUser className="w-6 h-6 text-[#048BE1]" />;
      case "foodHygineCert":
        return <FaHandHoldingWater className="w-6 h-6 text-[#048BE1] " />;
      case "icNumber":
        return <TbUserHexagon className="w-6 h-6 text-[#048BE1]" />;
      // case "nricFront":
      //   return <TbUserHexagon className="w-6 h-6 text-[#048BE1]" />;
      // case "nricBack":
      //   return <TbUserHexagon className="w-6 h-6 text-[#048BE1]" />;
      default:
        return null;
    }
  };

   const [rejectReasons, setRejectReasons] = useState<{ [key: string]: string }>(
      {}
    );

    const [showRejectReasonId, setShowRejectReasonId] = useState<string | null>(
        null
      );

    const toggleRejectReason = (candidateId: string) => {
      setShowRejectReasonId((prev) => (prev === candidateId ? null : candidateId));
    };

    const rejectReasonTemplates = [
      "Resume required for this role",
      "NRIC documents required",
      "Incomplete profile",
      "Documents do not meet requirements",
      "Other (specify below)",
    ];

   const handleVerifyAction = (action: "Approve" | "Reject", candidateId: string) => {
      if (action === "Reject" && !rejectReasons[candidateId]?.trim()) {
        toast.error("Please enter a rejection reason.");
        return;
      }
      axiosInstance
        .put(`/admin/verify-candidate/${candidateId}`, {
          action: action === "Approve" ? "approve" : "reject",
          rejectionReason: action === "Reject" ? (rejectReasons[candidateId] || "").trim() : undefined,
        })
        .then(() => {
          toast.success(`Candidate ${action === "Approve" ? "verified" : "rejected"}`);
          setShowRejectReasonId(null);
          setRejectReasons((prev) => ({ ...prev, [candidateId]: "" }));
          // Refetch candidate to show updated status
          return axiosInstance.get(`/admin/candidates/${candidateId}`);
        })
        .then((res) => {
          if (res?.data) setUserData(res.data);
        })
        .catch((err) => {
          console.error(err);
          toast.error(err?.response?.data?.message || "Failed to update status.");
        });
    };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div
        className="relative h-64 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://www.shutterstock.com/image-photo/project-manager-working-ai-management-260nw-2424036963.jpg')",
        }}
      >
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            className="p-2 rounded-full shadow-custom bg-white"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 " color="#000000" />
          </button>
          <div className="flex gap-4">
            <button className="px-4 py-3 rounded-[10px] bg-white flex items-center text-black gap-3">
              <Camera className="w-6 h-6" />
              Change cover
            </button>
            <button onClick={toggleMenu} className="p-4 rounded-full bg-white">
              <Settings className="w-6 h-6" />
            </button>
          </div>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 top-14 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
              <ul className="py-2">
                {/* Edit Candidate */}
                <li>
                  <Link to={`/edit-candidate-profile/${id}`}>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-[#000000] hover:bg-gray-100">
                      <FiEdit3 className="w-4 h-4 mr-2 text-gray-500" />
                      Edit Candidate
                    </button>
                  </Link>
                </li>
                {/* Block Candidate */}
                <li>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-[#941F15] hover:bg-red-100">
                    <Ban className="w-4 h-4 mr-2 text-red-500" />
                    Block Candidate
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className=" mx-auto px-4 -mt-20">
        <div className="gap-6 flex flex-col">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 z-10">
            <div className="flex justify-between items-start  pb-6 border-b border-[#DDDDDD]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {userData?.candidateProfile?.profilePicture ? (
                    <img
                      src={userData.candidateProfile.profilePicture}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="rounded-full border-2 border-dotted border-black object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full border-2 border-dotted border-black bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-500">
                      {userData?.candidateProfile?.fullName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <h1 className=" text-[24px] leading-[30px] font-medium">
                    {userData?.candidateProfile?.fullName || "N/A"}
                  </h1>
                  <p className="text-[16px] leading-[24px] font-medium text-[#4c4c4c]">
                    Work pass status:{" "}
                    <span className="text-[#049609] text-[16px] leading-[24px] font-medium ml-2">
                      {" "}
                      {userData?.candidateProfile?.employmentStatus || userData?.candidateProfile?.workPassStatus || "N/A"}
                    </span>
                  </p>
                  {userData?.candidateProfile?.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      <span className="font-medium">Previous rejection reason: </span>
                      {userData.candidateProfile.rejectionReason}
                    </div>
                  )}
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                      onClick={() => handleVerifyAction("Approve", id || "")}
                    >
                      Verify (Approve)
                    </button>
                    <button
                      className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                      onClick={() => toggleRejectReason(id || "")}
                    >
                      Reject
                    </button>
                    {showRejectReasonId === id && (
                      <>
                        <p className="text-xs text-gray-500">User will see this reason. Quick suggestions:</p>
                        <div className="flex flex-wrap gap-1">
                          {rejectReasonTemplates.map((template) => (
                            <button
                              key={template}
                              type="button"
                              onClick={() => template !== "Other (specify below)" && setRejectReasons((prev) => ({ ...prev, [id || ""]: template }))}
                              className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-100"
                            >
                              {template}
                            </button>
                          ))}
                        </div>
                        <textarea
                          className="mt-2 p-2 border rounded w-full text-sm"
                          placeholder="Rejection reason (required)..."
                          value={rejectReasons[id || ""] || ""}
                          onChange={(e) =>
                            setRejectReasons((prev) => ({
                              ...prev,
                              [id || ""]: e.target.value,
                            }))
                          }
                        />
                        <button
                          className="mt-2 bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!rejectReasons[id || ""]?.trim()}
                          onClick={() => handleVerifyAction("Reject", id || "")}
                        >
                          Reject Candidate
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#4C4C4C] font-medium mt-2">
                <p className="text-[16px] leading-[24px] font-medium text-[#4c4c4c]">
                  Registered at:{" "}
                  <span className="text-[#000000] text-[16px] leading-[24px] font-medium ml-2">
                    {userData?.candidateProfile?.registeredAt || "N/A"}
                  </span>
                </p>
              </p>

              {/* Documents cross-check per ADMIN_APPLICANT_REVIEW_AND_APPROVAL.md */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Documents (cross-check)</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Resume: </span>
                    {(userData?.candidateProfile?.resumeUrl ?? userData?.resumeUrl) ? (
                      <a href={userData?.candidateProfile?.resumeUrl || userData?.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View resume</a>
                    ) : (
                      <span className="text-amber-600">Not uploaded</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">NRIC: </span>
                    {(userData?.candidateProfile?.nricFront || userData?.candidateProfile?.nricFrontImage || userData?.candidateProfile?.nricBack || userData?.candidateProfile?.nricBackImage) ? (
                      <span className="flex gap-2 flex-wrap">
                        {(userData?.candidateProfile?.nricFront || userData?.candidateProfile?.nricFrontImage) && (
                          <a href={userData?.candidateProfile?.nricFront || userData?.candidateProfile?.nricFrontImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Front</a>
                        )}
                        {(userData?.candidateProfile?.nricBack || userData?.candidateProfile?.nricBackImage) && (
                          <a href={userData?.candidateProfile?.nricBack || userData?.candidateProfile?.nricBackImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Back</a>
                        )}
                      </span>
                    ) : (
                      <span className="text-amber-600">Not uploaded</span>
                    )}
                  </div>
                  {userData?.candidateProfile?.profileCompleted !== undefined && (
                    <div>
                      <span className="text-gray-500">Profile completed: </span>
                      <span className={userData.candidateProfile.profileCompleted ? "text-green-600" : "text-amber-600"}>
                        {userData.candidateProfile.profileCompleted ? "Yes" : "No"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="font-semibold mb-4 text-[16px] leading-[24px] text-[#000000]">
                Personal Details
              </h2>
              <div className=" mt-8 grid grid-cols-4 gap-6">
                {Object.entries(personalDetails).map(([key, value]) => (
                  <div className="flex flex-col">
                    <div key={key} className="flex items-start gap-3 my-3">
                      <div className="w-5 h-5 mt-0.5">{getIcon(key)}</div>
                      <div>
                      <p className="text-[16px] font-medium leading-[24px] text-[#048BE1]">
                          {customLabels[key] ||
                            key.replace(/([A-Z])/g, " $1").trim()
                          }
                        </p>
                      </div>
                    </div>

                    {/* Render as image if it's NRIC front/back */}
                    <p className="text-[16px] leading-[24px] font-normal text-[#000000]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

            

              <h3 className="text-xl font-semibold mb-4">Documents</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {InputForRole[
                  userData?.candidateProfile?.employmentStatus
                ]?.map((doc, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center bg-white rounded-lg shadow-md p-4"
                  >
                    <img
                      src={userData?.candidateProfile[doc]}
                      alt={`${doc} preview`}
                      className="w-full h-40 object-contain rounded-md mb-2 border border-gray-200"
                    />
                    <p className="text-sm text-gray-700 font-medium text-center break-words">
                      {doc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>


            {/* overview table */}
            {/* <OverViewTable/> */}


          {/* Stats Section */}
          <div className="bg-white rounded-3xl py-8 px-12 shadow-sm border border-gray-200 z-10">
            {/* <div className="flex gap-6 py-8 border-b">
              {tabs.map((tab) => {
                const Icon = tab.icon; // Get the icon for the current tab
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)} // Set the active tab on click
                    className={`px-[38px] py-[18px] flex items-center gap-4 rounded-[10px] text-[16px] leading-[20px] font-medium 
              ${activeTab === tab.id
                        ? "bg-[#048BE1] text-white " // Active styles
                        : "bg-[#EBEBEB] text-black" // Inactive styles
                      }`}
                  >
                    <Icon
                      className={activeTab === tab.id ? "h-7 w-7" : "h-6 w-6"}
                      color={activeTab === tab.id ? "#ffffff" : "#000000"}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div> */}

            {/* <JobHistory jobHistory={userData?.workHistory || {}} />
            <WorkHistory workHistory={userData?.jobHistory || []} /> */}

            <h2 className="text-2xl font-semibold mb-6">Job Overview</h2>

            <div className="mb-12">
              <h3 className="text-xl font-medium mb-4 ">Work History</h3>
              {/* <WorkHistory /> */}
              <JobHistory jobHistory={userData?.workHistory || {}} />
            </div>

            {/* JobHistory Section */}
            <div className="">
              <h3 className="text-xl font-medium mb-4">Job History</h3>
              <WorkHistory workHistory={userData?.jobHistory || []} />
            </div>

            {/* {activeTab === "jobHistory" ? (
              <WorkHistory workHistory={userData?.jobHistory || []} />
            ) : activeTab === "workHistory" ? (
              <JobHistory jobHistory={userData?.workHistory || {}} />
            ) : (
              <div></div>
            )} */}
          </div>
          <div className=" bg-white rounded-3xl p-6 shadow-sm border border-gray-200 px-12">
            <h2 className="font-semibold mb-4 text-[16px] text-[#000000]">
              Active Jobs
            </h2>
            <div className=" mt-8 grid grid-cols-3 items-center gap-6">
              {Object.entries(activeJobs).map(([key, value]) => (
                <div className="flex flex-col">
                  <div>
                    <p className="text-[16px] font-medium leading-[20px] text-[#0099ff]">
                      {customLablesActiveJobs[key] ||
                        key.replace(/([A-Z])/g, " $1").trim()}
                      :
                    </p>
                  </div>
                  {key === "job" && (
                    <p className="text-[16px] leading-[24px] font-medium text-[#000000]">
                      {value}{" "}
                      <span className="ml-1 text-[#049609] text-[16px] font-normal leading-[20px] py-2 px-4 bg-[#ECFFEA] rounded-full">
                        Active
                      </span>
                    </p>
                  )}
                  {key !== "job" &&
                    key !== "clockedOut" &&
                    key !== "clockedIn" &&
                    key !== "wageGenerated" &&
                    key !== "totalWage" && (
                      <p className="text-[16px] leading-[24px] font-medium text-[#000000]">
                        {value}
                      </p>
                    )}
                  {(key === "clockedOut" || key === "clockedIn") && (
                    <div className="flex items-center gap-1 py-1 px-3 rounded-full border border-[#048BE1] w-fit">
                      <RotateCcw className="text-white p-1 rounded-full bg-[#CDCDCD] w-7 h-7" />
                      <p className="text-[16px] leading-[24px] font-medium text-[#000000] w-[70px] text-center">
                        {value}
                      </p>
                      <FiEdit3 className="text-white p-1 rounded-full bg-[#0099FF] w-7 h-7" />
                    </div>
                  )}
                  {(key === "wageGenerated" || key === "totalWage") && (
                    <>
                      <p className="text-[16px] leading-[24px] font-medium text-[#000000]">
                        {value}
                      </p>
                      <p className="text-[14px] leading-[17px] font-normal text-[#4c4c4c]">
                        1 Hrs (Unpaid Break)
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteCandidate}
        title="Delete Candidate"
        message={`Are you sure you want to delete ${userData?.candidateProfile?.fullName || "this candidate"}? This action cannot be undone and will permanently remove all candidate data.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
