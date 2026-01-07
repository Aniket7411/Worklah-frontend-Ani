import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmployeeStatCard from "../../components/employerDetail/EmployeeStatCard";
import AttendanceChart from "../../components/employerDetail/AttendanceChart";
import {
  ArrowLeft,
  InstagramIcon,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Settings,
} from "lucide-react";
import JobTable from "../../components/employerDetail/JobTable";
import { axiosInstance } from "../../lib/authInstances";

const getColor = (value: number): string => {
  if (value < 20) return "red";
  if (value >= 20 && value < 89) return "green";
  return "orange";
};

const EmployerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { jobId } = useParams(); // Extract jobId from URL
  const [employerData, setEmployerData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return; // Ensure ID exists before making API call

    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/admin/outlets/${jobId}/attendance`
        );
        if (response.data.success) {
          setEmployerData(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load employer data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex gap-4 mb-6 items-center">
            <ArrowLeft
              className="rounded-full p-2 shadow-lg w-10 h-10 cursor-pointer"
              onClick={() => navigate(-1)}
            />
            <img
              src="/assets/ecompany.png"
              className="w-10 h-10"
              alt="Company Logo"
            />
            <h1 className="text-4xl font-bold">
              {employerData?.outlet?.name || "N/A"}
            </h1>
          </div>
        </div>
        <div>
          <button className="text-gray-500 hover:text-black mx-2">
            <Plus className="rounded-full p-2 shadow-lg w-10 h-10" />
          </button>
          <button className="text-gray-500 hover:text-black mx-2">
            <Settings className="rounded-full p-2 shadow-lg w-10 h-10" />
          </button>
        </div>
      </div>

      {/* Employer Details */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex gap-2 items-center">
          <MapPin className="w-4 h-4" />
          <p className="text-[16px] leading-[20px] font-normal text-[#000000]">
            {employerData?.outlet?.address || "N/A"}
          </p>
          <a className="text-[12px] text-[#0099FF] leading-[18px] cursor-pointer underline">
            View on map
          </a>
        </div>
        <div className="flex gap-2 text-base font-normal items-center">
          <Phone className="w-4 h-4" />
          <p className="text-[14px] leading-[18px] font-normal text-[#000000]">
            {employerData?.outlet?.contact || "N/A"}
          </p>
        </div>
        <div className="flex gap-2 text-base font-normal items-center">
          <Mail className="w-4 h-4" />
          <p className="text-[14px] leading-[18px] font-normal text-[#000000]">
            {employerData?.outlet?.email || "N/A"}
          </p>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="flex justify-between border-b-2 border-b-[#D9D9D9] pb-4">
        <div className="flex items-center gap-4 mt-2">
          <button className="bg-gray-100 rounded-full p-2 hover:bg-gray-200">
            <img
              className="w-6 h-6"
              src="/assets/icons/skype.svg"
              alt="Skype"
            />
          </button>
          <button className="bg-gray-100 rounded-full p-2 hover:bg-gray-200">
            <Linkedin className="w-6 h-6" color="gray" fill="gray" />
          </button>
          <button className="bg-gray-100 rounded-full p-2 hover:bg-gray-200">
            <InstagramIcon className="w-6 h-6" color="white" fill="gray" />
          </button>
          <button className="bg-gray-100 rounded-full p-2 hover:bg-gray-200">
            <MessageSquare className="w-6 h-6" color="gray" fill="gray" />
          </button>
        </div>
        <div className="flex flex-col items-end">
          <h2 className="text-base font-semibold text-left">
            Employer: {employerData?.outlet?.employer || employerData?.employer?.companyLegalName || "N/A"}
          </h2>
          {employerData?.employer?.companyLogo && (
            <div className="flex gap-1 items-center">
              <img 
                src={employerData.employer.companyLogo.startsWith('http') 
                  ? employerData.employer.companyLogo 
                  : `https://worklah.onrender.com${employerData.employer.companyLogo}`} 
                alt="Company Logo" 
                className="w-8 h-8 object-contain"
              />
              <p className="uppercase text-base">
                {employerData?.employer?.companyLegalName || "N/A"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ensure employerData and attendanceMetrics exist before accessing values */}
      <div className="grid grid-cols-4 gap-6 mt-6 border-b-2 border-b-[#D9D9D9] pb-4">
        <EmployeeStatCard
          value={employerData?.attendanceMetrics?.totalJobsPosted || 0}
          label="Total Jobs Posted"
          color="gray"
        />
        <EmployeeStatCard
          value={employerData?.attendanceMetrics?.shiftsFullyAttended || 0}
          label="Shifts Fully Attended"
          color="green"
        />
        <EmployeeStatCard
          value={employerData?.attendanceMetrics?.shiftsPartiallyAttended || 0}
          label="Shifts Partially Attended (<50% absentees)"
          color="orange"
        />
        <EmployeeStatCard
          value={employerData?.attendanceMetrics?.shiftsLeastAttended || 0}
          label="Shifts Least Attended (>50% absentees)"
          color="red"
        />
      </div>

      {/* Circle Stats */}
      <div className="grid grid-cols-3 gap-6 mt-6 border-b-2 border-b-[#D9D9D9] pb-4">
        <EmployeeStatCard
          value={employerData?.attendanceMetrics?.overallAttendanceRate || 0}
          label="Overall Attendance Rate"
          color={getColor(
            employerData?.attendanceMetrics?.overallAttendanceRate || 0
          )}
        />
        <EmployeeStatCard
          value={employerData?.attendanceMetrics?.noShowRate || 0}
          label="No Show Rate"
          color={getColor(employerData?.attendanceMetrics?.noShowRate || 0)}
        />
        <EmployeeStatCard
          value={employerData?.attendanceMetrics?.standbyEffectiveness || 0}
          label="Standby Effectiveness"
          color={getColor(
            employerData?.attendanceMetrics?.standbyEffectiveness || 0
          )}
        />
      </div>

      {/* Attendance Chart */}
      <div className="mt-8">
        <AttendanceChart 
          outletId={jobId}
          averageAttendance={employerData?.attendanceMetrics?.overallAttendanceRate}
          attendanceData={employerData?.attendanceChartData}
        />
      </div>
      <div className="mt-2">
      {employerData?.summaryTable && employerData?.attendanceTableData ? (
        <JobTable 
          summaryData={employerData.summaryTable} 
          jobData={employerData.attendanceTableData} 
        />
      ) : (
        <p>Loading job table...</p>
      )}
</div>
    </div>
  );
};

export default EmployerDetailPage;
