"use client";

import {
  ArrowLeft,
  Plus,
  Settings,
  MoreVertical,
  MapPin,
  Phone,
  Mail,
  Trash2,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";

export default function OutletDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [outletData, setOutletData] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const IMAGE_BASE_URL = "https://worklah.onrender.com";

  useEffect(() => {
    const fetchOutletData = async () => {
      if (!id) {
        setError("Outlet ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch outlet details - adjust endpoint based on API structure
        // This might be /employers/:employerId/outlets/:outletId or /outlets/:id
        const response = await axiosInstance.get(`/admin/outlets/${id}`);

        if (response.data?.success === false) {
          throw new Error(response.data?.message || "Failed to fetch outlet data");
        }

        const outlet = response.data?.outlet || response.data?.data || response.data;
        setOutletData(outlet);

        // Fetch jobs for this outlet
        const jobsResponse = await axiosInstance.get(`/admin/jobs?outletId=${id}&limit=100`);
        if (jobsResponse.data?.success !== false) {
          setJobs(jobsResponse.data?.jobs || []);
        }
      } catch (err: any) {
        console.error("Error fetching outlet data:", err);
        setError(err?.response?.data?.message || "Failed to load outlet data");
        toast.error(err?.response?.data?.message || "Failed to load outlet data");
      } finally {
        setLoading(false);
      }
    };

    fetchOutletData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading outlet details...</p>
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
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!outletData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No outlet data found</p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Heaader */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button className="p-[14px] rounded-[26px] shadow-lg bg-[#FFFFFF] hover:bg-gray-50 " onClick={() => navigate(-1)}>
            <ArrowLeft className="w-[24px] h-[24px]"  />
          </button>
          {outletData?.outletImage || outletData?.logo ? (
            <img
              src={
                (outletData.outletImage || outletData.logo).startsWith('http')
                  ? (outletData.outletImage || outletData.logo)
                  : `${IMAGE_BASE_URL}${outletData.outletImage || outletData.logo}`
              }
              alt={outletData.name || "Outlet"}
              width={120}
              height={40}
              className="object-contain"
            />
          ) : (
            <div className="w-[120px] h-[40px] bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm">
              {outletData.name?.charAt(0)?.toUpperCase() || "N/A"}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="p-[14px] rounded-[26px] shadow-lg bg-[#FFFFFF] hover:bg-gray-50">
            <Settings className="w-[24px] h-[24px]" />
          </button>
          <button className="p-[14px] rounded-[26px] shadow-lg bg-[#FFFFFF] hover:bg-gray-50 ">
            <Plus className="w-[24px] h-[24px]" />
          </button>
        </div>
      </div>

      {/* Company Info */}
      <div className="mb-8 pb-6 flex justify-between border-b border-gray-200">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2 mb-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{outletData.address || outletData.outletAddress || "N/A"}</span>
            </div>
            <button className="text-sm text-blue-600 hover:underline">
              Show on map
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{outletData.contact || outletData.managerContact || outletData.phone || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>{outletData.email || "N/A"}</span>
          </div>
        </div>
        <div className="text-end">
          <div className="text-sm text-gray-600">Employer:</div>
          {outletData.employer && (
            <div className="text-sm font-medium flex items-center gap-2">
              {outletData.employer.companyLogo && (
                <img 
                  src={
                    outletData.employer.companyLogo.startsWith('http')
                      ? outletData.employer.companyLogo
                      : `${IMAGE_BASE_URL}${outletData.employer.companyLogo}`
                  }
                  alt="Employer Logo"
                  className="w-6 h-6 object-contain"
                />
              )}
              <span className="uppercase text-sm">
                {outletData.employer.companyLegalName || outletData.employer.name || "N/A"}
              </span>
            </div>
          )}
          {outletData.operatingHours && (
            <>
              <div className="text-sm text-gray-600 mt-2">Operating Hours:</div>
              <div className="uppercase font-medium text-sm">
                {outletData.operatingHours || "N/A"}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-gray-600">
            Total Jobs Posted:
          </div>
          <div className="text-sm font-medium text-gray-600">Active Jobs:</div>
          <div className="text-sm font-medium text-gray-600">
            Average Attendance Rate:
          </div>
          <div className="text-sm font-medium text-gray-600">No-Show Rate:</div>
          <div className="text-sm font-medium text-gray-600">
            Top Roles Posted:
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-gray-600">
            {outletData.totalJobsPosted || outletData.stats?.totalJobsPosted || 0}
          </div>
          <div className="text-sm font-medium text-gray-600">
            {outletData.activeJobs || outletData.stats?.activeJobs || 0}
          </div>
          <div className="text-sm font-medium text-gray-600">
            {outletData.averageAttendanceRate 
              ? `${outletData.averageAttendanceRate.toFixed(1)}%`
              : outletData.stats?.averageAttendanceRate 
              ? `${outletData.stats.averageAttendanceRate.toFixed(1)}%`
              : "N/A"}
          </div>
          <div className="text-sm font-medium text-gray-600">
            {outletData.noShowRate 
              ? `${outletData.noShowRate.toFixed(1)}%`
              : outletData.stats?.noShowRate 
              ? `${outletData.stats.noShowRate.toFixed(1)}%`
              : "N/A"}
          </div>
          <div className="text-sm font-medium text-gray-600 flex gap-28">
            <span>
              {outletData.topRoles 
                ? outletData.topRoles.join(", ")
                : outletData.stats?.topRoles
                ? outletData.stats.topRoles.join(", ")
                : "N/A"}
            </span>
            <div className="flex gap-2">
              <button className="p-[7px] rounded-[26px] border bg-[#FFFFFF] hover:bg-gray-50 ">
                <Trash2 className="w-[12px] h-[12px]" />
              </button>
              <div>
              <select
                id="role"
                value={selectedRole}
                // onChange={handleChange}
                className="px-8 border rounded-full bg-[#EDF8FF]"
              >
                <option value="all">All</option>
                <option value="cashier">Cashier</option>
              </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Roles */}
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Top Roles Posted:</div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {outletData.topRoles 
              ? outletData.topRoles.join(", ")
              : outletData.stats?.topRoles
              ? outletData.stats.topRoles.join(", ")
              : "N/A"}
          </span>
          <button className="p-1 hover:bg-gray-100 rounded">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm">
              <th className="py-3 px-4 font-medium">Jobs</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Shifts</th>
              <th className="py-3 px-4 font-medium">Total Duration</th>
              <th className="py-3 px-4 font-medium">Vacancy filled</th>
              <th className="py-3 px-4 font-medium">Total pay/shift</th>
              <th className="py-3 px-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  No jobs found for this outlet
                </td>
              </tr>
            ) : (
              jobs.map((job, index) => {
                const jobId = job._id || job.id || job.jobId;
                const jobTitle = job.jobTitle || job.jobName || "N/A";
                const jobDate = job.jobDate || job.date;
                const jobStatus = job.jobStatus || job.status || "N/A";
                const shifts = job.shifts || [];
                const totalShifts = shifts.length;
                const totalDuration = shifts.reduce((sum: number, shift: any) => 
                  sum + (shift.totalWorkingHours || shift.totalHours || 0), 0
                );
                const breakDuration = shifts.reduce((sum: number, shift: any) => 
                  sum + (shift.breakDuration || shift.breakHours || 0), 0
                );
                const totalVacancy = shifts.reduce((sum: number, shift: any) => 
                  sum + (shift.vacancy || shift.availableVacancy || 0), 0
                );
                const filledVacancy = shifts.reduce((sum: number, shift: any) => 
                  sum + (shift.vacancyFilled || 0), 0
                );
                const standbyVacancy = shifts.reduce((sum: number, shift: any) => 
                  sum + (shift.standbyVacancy || shift.standby || 0), 0
                );
                const totalWage = shifts.reduce((sum: number, shift: any) => 
                  sum + (shift.totalWages || shift.totalWage || 0), 0
                );
                const payPerHour = totalDuration > 0 ? totalWage / totalDuration : 0;

                return (
                  <tr key={jobId || index} className="border-t">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                        />
                        <div>
                          <div className="font-medium">{jobTitle}</div>
                          <div className="text-sm text-gray-500">
                            {jobId ? `#${jobId.slice(-6)}` : "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          jobStatus === "Active"
                            ? "bg-green-100 text-green-800"
                            : jobStatus === "Completed"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {jobStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {jobDate 
                        ? new Date(jobDate).toLocaleDateString("en-GB", { 
                            day: "numeric", 
                            month: "short", 
                            year: "2-digit" 
                          })
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm">{totalShifts}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{totalDuration} Hrs</div>
                      {breakDuration > 0 && (
                        <div className="text-xs text-gray-500">
                          {breakDuration} Hrs (Break)
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{filledVacancy}/{totalVacancy}</span>
                        {standbyVacancy > 0 && (
                          <span className="text-xs text-gray-500">
                            Standby: {standbyVacancy}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">${totalWage.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        ${payPerHour.toFixed(2)}/hr
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={() => jobId && navigate(`/jobs/${jobId}`)}
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
