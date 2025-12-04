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
  Wallet2,
  User,
  MapPin,
  Flag,
  ImageIcon,
  PencilIcon,
  CalendarIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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

import { Link, useNavigate, useParams } from "react-router-dom";
import JobHistory from "../../components/employerDetail/JobHistory";
import WorkHistory from "../../components/employerDetail/WorkHistory";
import { axiosInstance } from "../../lib/authInstances";
import uploadImageOnCloudinary from "../../utils/images/imageUpload";
import toast from "react-hot-toast";

interface PersonalDetails {
  EWalletAmount: string;
  Race: string;
  NRIC: string;
  PostalCode: string;
  FoodHygineCert: string;
  Photo: string;
  Nationality: string;
  nricFront: string;
  nricBack: string;
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

export default function EditCandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<any>(null);
  console.log("userData", userData);
  const [formData, setFormData] = useState({
    name: "",
    gender: "Male",
    workPassStatus: "Verified",
    dob: "01/01/2002",
    status: "",
    mobile: "",
    email: "",
    postalCode: "",
    country: "",
    city: "",
    street: "",
    town: "", // add this line
    foodHygieneCert: null,
    selfie: null,
    nricFront: null,
    nricBack: null,
    finFront: null,
    finBack: null,
    plocImage: null,
    studentCard: null,
    plocExpiry: "",
    studentId: "",
    nricNo: ""

  });

  const [activeTab, setActiveTab] = useState("jobHistory");

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const tabs = [
    { id: "jobHistory", label: "Job History", icon: History },
    { id: "workHistory", label: "Work History", icon: CalendarClock },
  ];

  const personalDetails: PersonalDetails = {
    EWalletAmount:
      userData?.candidateProfile?.personalDetails?.eWalletAmount || "N/A",
    // Race: userData?.candidateProfile?.personalDetails?.race || "N/A",
    NRIC: userData?.candidateProfile?.personalDetails?.nric || "N/A",
    PostalCode:
      userData?.candidateProfile?.personalDetails?.postalCode || "N/A",
    // FoodHygineCert: userData?.candidateProfile?.personalDetails?.foodHygieneCert || "N/A",
    // Photo: userData?.candidateProfile?.personalDetails?.photo || "N/A",
    Nationality:
      userData?.candidateProfile?.personalDetails?.nationality || "N/A",
    nricFront: userData?.candidateProfile?.personalDetails?.nricFront || "N/A",
    nricBack: userData?.candidateProfile?.personalDetails?.nricBack || "N/A",
  };

  const activeJobs: ActiveJobs = {
    job: "Tray Collecter",
    ongoingShift: "07:00 PM ---- 11:00 PM",
    clockedIn: "07:06 AM",
    employer: "Right Service PTE. LTD.",
    duration: "4 Hrs",
    clockedOut: " -- ",
    date: "10 Sep, 24",
    totalWage: " $72",
    wageGenerated: "$--",
    rateType: "Flat Rate",
  };

  const customLabels: Record<string, string> = {
    EWalletAmount: "E-Wallet Amount",
    // Race: "Race",
    NRIC: "NRIC",
    PostalCode: "Postal Code",
    // FoodHygineCert: "Food & Hygiene Cert",
    // Photo: "Photo",
    Nationality: "Nationality",
    nricFront: "NRIC Front",
    nricBack: "NRIC Back",
  };

  const navigate = useNavigate();

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

  const getImageUrl = useCallback(async (e, type) => {
    // debugger
    try {
      setLoading(true)
      const url = await uploadImageOnCloudinary(e);
      setLoading(false)
      console.log("Uploaded URL:", url);

      setFormData((prevState) => ({
        ...prevState,
        [type]: url, // Save the URL in the formData
      }));

      // Set preview for the uploaded image
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    //debugger
    const { name, value } = e.target;

    if (name === 'plocExpiry') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to midnight

      if (selectedDate < today) {
        alert("this date is not valid");
        return; // Stop here if invalid
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  useEffect(() => {
    // debugger;
    axiosInstance
      .get(`/admin/candidates/${id}`)
      .then((response) => {
        const { candidateProfile } = response.data;
        setUserData(response.data);

        setFormData({
          name: candidateProfile.fullName || "",
          gender: candidateProfile.gender || "Male",
          workPassStatus: candidateProfile.employmentStatus || "",
          dob: candidateProfile.dob || "",
          status: candidateProfile.employmentStatus || "",
          mobile: candidateProfile.personalDetails?.contactNumber || "",
          email: candidateProfile.email || "",
          postalCode: candidateProfile.personalDetails?.postalCode || "",
          country: candidateProfile.personalDetails?.nationality || "",
          city: candidateProfile.personalDetails?.city || "",
          street: candidateProfile.personalDetails?.street || "",
          // town is not included in your formData, add it if needed
          town: candidateProfile.personalDetails?.town || "",
          foodHygieneCert: candidateProfile?.foodHygieneCert || null,
          selfie: candidateProfile?.selfie || null,
          nricFront: candidateProfile?.nricFront || null,
          nricBack: candidateProfile?.nricBack || null,
          finFront: candidateProfile?.finFront || null,
          finBack: candidateProfile?.finBack || null,
          plocImage: candidateProfile?.plocImage || null,
          studentCard: candidateProfile?.studentCard || null,
          plocExpiry: candidateProfile?.plocExpiry || "",
          studentId: candidateProfile?.studentId || "",
          nricNo: candidateProfile?.nricNo || "",
        });
      })
      .catch((error) => {
        console.error("Error fetching employee:", error);
      });
  }, []);

  const InputForRole = {
    "Singaporean/Permanent Resident": [
      "nricFront",
      "nricBack",
      "finFront",
      "finBack",
      "selfie",
      "foodHygieneCert"
    ],
    "Long Term Visit Pass Holder": [
      "plocImage",
      "selfie",
      "foodHygieneCert"
    ],
    "Student Pass": [
      "studentCard",
      "foodHygieneCert",
      "selfie",

    ],
    "No Valid Work Pass": [
      "selfie",
      "foodHygieneCert"
    ]
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    //debugger
    const formDataToSend = {
      fullName: formData.name,
      phoneNumber: formData.mobile,
      email: formData.email,
      gender: formData.gender,
      dob: formData.dob,
      city: formData.city,
      town: formData.town,
      country: formData.country,
      employmentStatus: formData.status,
      foodHygieneCert: formData.foodHygieneCert,
      selfie: formData.selfie,
      nricFront: formData.nricFront,
      nricBack: formData.nricBack,
      finFront: formData.finFront,
      finBack: formData.finBack,
      plocImage: formData.plocImage,
      studentCard: formData.studentCard,
      plocExpiry: formData.plocExpiry,
      studentId: formData.studentId,
      nricNo: formData.nricNo


    };
    console.log("submit", formDataToSend);

    try {
      const response = await axiosInstance.post(
        `/admin/candidates/${id}`,
        formDataToSend,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log(response);

      if (!response.status == 200) {
        throw new Error("Failed to update profile");
      }

      console.log("Profile updated successfully:", response);
      alert("Profile updated successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const getIcon = (key: string) => {
    switch (key) {
      case "EWalletAmount":
        return <Wallet2 className="w-5 h-5 text-[#048BE1]" />;
      // case "Race":
      //   return <User className="w-5 h-5 text-[#048BE1]" />;
      case "NRIC":
        return <FaRegIdCard className="w-5 h-5 text-[#048BE1]" />;
      case "PostalCode":
        return <MapPin className="w-5 h-5 text-[#048BE1]" />;
      // case "FoodHygineCert":
      //   return <FaHandHoldingWater className="w-5 h-5 text-[#048BE1]" />;
      // case "Photo":
      //   return <ImageIcon className="w-5 h-5 text-[#048BE1]" />;
      case "Nationality":
        return <MdOutlineOutlinedFlag className="w-5 h-5 text-[#048BE1]" />;
      case "nricFront":
        return <TbUserHexagon className="w-6 h-6 text-[#048BE1]" />;
      case "nricBack":
        return <TbUserHexagon className="w-6 h-6 text-[#048BE1]" />;
      default:
        return null;
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading candidate profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className=" mx-auto px-4 -mt-14">
        <div className="gap-6 flex flex-col">
          {/* Profile Card */}
          <div className=" p-6  z-10">
            <div className="flex justify-between items-start pb-2">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src="./assets/teamm1.svg"
                    alt="Profile"
                    width={100}
                    height={100}
                    className="rounded-full "
                  />
                </div>
                {/* <div className="flex flex-col items-start gap-1">
                  <p className="text-[16px] leading-[24px] font-medium text-[#4c4c4c]">
                    ID:{" "}
                    <span className="text-[#000000] text-[16px] leading-[24px] font-medium ml-2">
                      {" "}
                      24575
                    </span>
                  </p>
                </div> */}
              </div>
            </div>

            <div className=" flex justify-between pb-6 border-b border-[#DDDDDD]">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center">
                  <h1 className=" text-[24px] leading-[30px] font-medium">
                    {userData?.candidateProfile?.fullName || "N/A"}{" "}
                  </h1>
                  <span className="text-[#049609] bg-[#CEFFCF] rounded-full px-3 py-0.5 mt-2 text-[16px] leading-[24px] font-medium ml-2">
                    {" "}
                    {userData?.candidateProfile?.employmentStatus}
                  </span>
                </div>

                <p className="text-[16px] leading-[24px] font-medium text-[#4c4c4c]">
                  Age:{" "}
                  <span className="text-[#000] text-[16px] leading-[24px] font-medium ml-2">
                    {" "}
                    {userData?.candidateProfile?.personalDetails.age}
                  </span>
                </p>

                <p className="text-[16px] leading-[24px] font-medium text-[#4c4c4c]">
                  DOB:{" "}
                  <span className="text-[#000] text-[16px] leading-[24px] font-medium ml-2">
                    {" "}
                    {userData?.candidateProfile?.personalDetails.dob}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#4C4C4C] font-medium mt-2">
                  <p className="text-[16px] leading-[24px] font-medium text-[#4c4c4c]">
                    Registered at:{" "}
                    <span className="text-[#000000] text-[16px] leading-[24px] font-medium ml-2">
                      {userData?.candidateProfile?.registeredAt}
                    </span>
                  </p>
                </p>
                <p className="text-sm text-[#4C4C4C] font-medium mt-2">
                  <p className="text-[16px] leading-[24px] font-medium text-[#4c4c4c]">
                    Contact Number:{" "}
                    <span className="text-[#000000] text-[16px] leading-[24px] font-medium ml-2">
                      {
                        userData?.candidateProfile?.personalDetails
                          .contactNumber
                      }
                    </span>
                  </p>
                </p>
                {/* <p className="text-sm text-[#4C4C4C] font-medium mt-2">
                  <p className="text-[16px] leading-[24px] font-medium text-[#4c4c4c]">
                    Email Address:{" "}
                    <span className="text-[#000000] text-[16px] leading-[24px] font-medium ml-2">
                    {userData.candidateProfile?.personalDetails.contactNumber}
                    </span>
                  </p>
                </p> */}
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
                      {/* Icon */}
                      <div className="w-5 h-5 mt-0.5">{getIcon(key)}</div>

                      {/* Label and Value */}
                      <div>
                        <p className="text-[16px] font-medium leading-[24px] text-[#048BE1]">
                          {customLabels[key] ||
                            key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                      </div>
                    </div>
                    {/* Render as image if it's NRIC front/back */}
                  </div>
                ))}
              </div>
            </div>
          </div>

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
              ${
                activeTab === tab.id
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

            {/* {activeTab === "jobHistory" ? <JobHistory /> : <WorkHistory />} */}
            {/* {activeTab === "jobHistory" ? <JobHistory /> :  <JobHistory />  } */}

            {/* Title Section (Optional) */}
            <h2 className="text-2xl font-semibold mb-6">Job Overview</h2>

            <div className="mb-12">
              <h3 className="text-xl font-medium mb-4">Job History</h3>
              <JobHistory jobHistory={userData?.workHistory || {}} />
            </div>

            {/* JobHistory Section */}
            <div className="">
              <h3 className="text-xl font-medium mb-4 ">Work History</h3>
              <WorkHistory workHistory={userData?.jobHistory || {}} />
            </div>

            {/* WorkHistory Section */}
          </div>

          {/* form */}
          <div className="p-6 pt-6 border-t border-[#DDDDDD]">
            <div className="flex items-center gap-2 mb-6">
              <PencilIcon className="w-4 h-4" />
              <h1 className="text-lg font-medium">Edit Candidate Details</h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Candidate Name */}
              <div>
                <label className="block text-sm mb-2">Candidate Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg pr-10"
                  />
                  <PencilIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg appearance-none bg-white"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Work Pass Status */}
              <div>
                <label className="block text-sm mb-2">Work Pass Status</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg appearance-none bg-white"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option>Singaporean/Permanent Resident</option>
                  <option>Long Term Visit Pass Holder</option>
                  <option>Student Pass</option>
                  <option>No Valid Work Pass</option>
                </select>
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm mb-2">DOB</label>
                <div
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  className="flex gap-2"
                >
                  <select className="px-3 py-2 border rounded-lg appearance-none bg-white">
                    <option>1</option>
                    {/* Add more days */}
                  </select>
                  <select className="px-3 py-2 border rounded-lg appearance-none bg-white">
                    <option>January</option>
                    {/* Add more months */}
                  </select>
                  <select className="px-3 py-2 border rounded-lg appearance-none bg-white">
                    <option>2024</option>
                    {/* Add more years */}
                  </select>
                  <button
                    type="button"
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm mb-2">Mobile Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg pr-10"
                  />
                  <PencilIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    name="email"
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg pr-10"
                  />
                  <PencilIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Postal code */}
              <div>
                <label className="block text-sm mb-2">Postal code</label>
                <div className="relative">
                  <input
                    type="text"
                    name="postalCode"
                    onChange={handleChange}
                    value={formData.postalCode}
                    className="w-full px-3 py-2 border rounded-lg pr-10"
                  />
                  <PencilIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  onChange={handleChange}
                  value={formData.country}
                  className="w-full px-3 py-2 bg-gray-100 rounded-lg"
                // disabled
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm mb-2">City</label>
                <input
                  name="city"
                  onChange={handleChange}
                  type="text"
                  value={formData.city}
                  className="w-full px-3 py-2 bg-gray-100 rounded-lg"
                // disabled
                />
              </div>

              {/* Street/Town */}
              <div>
                <label className="block text-sm mb-2">Street/Town</label>
                <div className="relative">
                  <input
                    type="text"
                    name="town"
                    onChange={handleChange}
                    value={formData.town}
                    className="w-full px-3 py-2 border rounded-lg pr-10"
                  />
                  <PencilIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* upload NRIC Front */}
              {loading === false ? (
                <>
                  {InputForRole[formData.workPassStatus]?.map((doc, index) => (
                    <div key={doc} className="mb-4">
                      <label className="block text-sm mb-2 capitalize">
                        Upload {doc}
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,application/pdf,text/plain"
                          className="w-full border border-gray-300 rounded-lg p-3"
                          onChange={(e) => getImageUrl(e, doc)}
                        />

                        {formData[doc] != null && (
                          <img
                            src={formData[doc]}
                            alt={`${doc} preview`}
                            className="mt-2 rounded-md max-h-40 object-contain"
                          />
                        )}

                        <PencilIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p>loading....</p>
                </>
              )}

              {formData.workPassStatus === "Long Term Visit Pass Holder" && (
                <div>
                  <label className="block text-sm mb-2">ploc expiry date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="plocExpiry"
                      value={formData.plocExpiry}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg pr-10"
                      required
                    />
                    <PencilIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              )}

              {formData.workPassStatus === "Student Pass" && (
                <div>
                  <label className="block text-sm mb-2">StudentID</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg pr-10"
                      required
                    />
                    <PencilIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              )}

              {formData.workPassStatus === "Singaporean/Permanent Resident" && (
                <div>
                  <label className="block text-sm mb-2">NRIC/FIN no.</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="nricNo"
                      value={formData.nricNo}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg pr-10"
                      required
                    />
                    <PencilIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              )}

              {/* <div>
                <label className="block text-sm mb-2"></label>
                <select className="w-full px-3 py-2 border rounded-lg appearance-none bg-white"
                name="status"
                value={formData.status}
                onChange={handleChange}>
                  <option>Singaporean/Permanent Resident</option>
                  <option>Long Term Visit Pass Holder</option>
                  <option>Student Pass</option>
                  <option>No Valid Work Pass</option>
                </select>
              </div> */}

              {/* Full Address */}
              {/* <div className="">
                <label className="block text-sm mb-2">Full Address</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.fullAddress}
                    className="w-full px-3 py-2 border rounded-lg pr-10"
                  />
                  <PencilIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div></div> */}

              {/* Buttons */}

              <div className="flex w-full items-start mx-[25%] gap-4 mt-20">
                <button
                  type="button"
                  className="flex-1 px-14 py-4 border border-[#0099FF] text-[#0099FF] rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-14 py-4 bg-[#0099FF] text-white rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
