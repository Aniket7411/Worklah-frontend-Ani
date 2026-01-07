import { ArrowDown, ChevronDown, Edit } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../../../lib/authInstances";
import { Loader2 } from "lucide-react";

const JobInfo: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [jobData, setJobData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const IMAGE_BASE_URL = "https://worklah.onrender.com";

  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobId) {
        setError("Job ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/admin/jobs/${jobId}`);
        
        if (response.data?.success === false) {
          throw new Error(response.data?.message || "Failed to fetch job data");
        }

        const job = response.data?.job || response.data;
        setJobData(job);
      } catch (err: any) {
        console.error("Error fetching job data:", err);
        setError(err?.response?.data?.message || "Failed to load job data");
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">{error || "No job data found"}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center min-h-screen ">
      <div className="max-w-6xl w-full rounded-lg ">
        <form>
          <div className="grid grid-cols-2 gap-10 pb-32">
            {/* Job Name */}
            <div>
              <label className="block text-[16px] font-medium text-[#4C4C4C] leading-[24px]">
                Job Name
              </label>
              <div className="flex items-center justify-between gap-6 mt-2 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg">
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    className="text-blue-500 text-sm underline hover:text-blue-700"
                  >
                    <img
                      src="./assets/icons/dropdown.png"
                      alt="dropdown"
                      className="w-7 h-7"
                    />
                  </button>
                  <p className="text-[16px] font-medium text-[#000000] leading-[24px]">
                    {jobData.jobTitle || jobData.jobName || "N/A"}
                  </p>
                </div>
                <div>
                  <img
                    src="./assets/icons/edit.png"
                    alt="dropdown"
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-[16px] font-medium text-[#4C4C4C] leading-[24px]">
                Company
              </label>
              <div className="flex items-center gap-6 mt-2 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg">
                <button
                  type="button"
                  className="text-blue-500 text-sm underline hover:text-blue-700"
                >
                  <img
                    src="./assets/icons/dropdown.png"
                    alt="dropdown"
                    className="w-7 h-7"
                  />
                </button>
                <div className="flex items-center gap-2">
                  {jobData.employer?.companyLogo && (
                    <img
                      src={
                        jobData.employer.companyLogo.startsWith('http')
                          ? jobData.employer.companyLogo
                          : `${IMAGE_BASE_URL}${jobData.employer.companyLogo}`
                      }
                      alt="Company Logo"
                      className="w-8 h-8 rounded-full object-contain"
                    />
                  )}
                  <p className="text-[16px] font-normal text-[#000000] leading-[24px]">
                    {jobData.employer?.companyLegalName || jobData.employerName || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Change Outlet */}
            <div>
              <label className="block text-[16px] font-medium text-[#4C4C4C] leading-[24px]">
                Change Outlet
              </label>
              <div className="flex items-center justify-between gap-6 mt-2 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg">
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    className="text-blue-500 text-sm underline hover:text-blue-700"
                  >
                    <img
                      src="./assets/icons/dropdown.png"
                      alt="dropdown"
                      className="w-7 h-7"
                    />
                  </button>
                  <div className="flex items-center gap-2">
                    {jobData.outlet?.outletImage && (
                      <img
                        src={
                          jobData.outlet.outletImage.startsWith('http')
                            ? jobData.outlet.outletImage
                            : `${IMAGE_BASE_URL}${jobData.outlet.outletImage}`
                        }
                        alt="Outlet"
                        className="w-7 h-7 rounded-full object-contain"
                      />
                    )}
                    <p className="text-[16px] font-medium text-[#000000] leading-[19px]">
                      {jobData.outlet?.name || jobData.outletAddress || "N/A"}
                    </p>
                  </div>
                </div>
                <img
                  src="./assets/icons/edit.png"
                  alt="dropdown"
                  className="w-4 h-4"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[16px] font-medium text-[#4C4C4C] leading-[24px]">
                Category
              </label>
              <div className="flex items-center gap-6 mt-2 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg">
                <button
                  type="button"
                  className="text-blue-500 text-sm underline hover:text-blue-700"
                >
                  <img
                    src="./assets/icons/dropdown.png"
                    alt="dropdown"
                    className="w-7 h-7"
                  />
                </button>
                
                  <p className="text-[16px] py-2 px-3 rounded-full bg-[#E2F8FF] font-normal text-[#000000] leading-[24px]">
                    Cleaning
                  </p>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[16px] font-medium text-[#4C4C4C] leading-[24px]">
                Location
              </label>
              <div className="flex items-center justify-between gap-6 mt-2 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg">
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    className="text-blue-500 text-sm underline hover:text-blue-700"
                  >
                    <img
                      src="./assets/icons/dropdown.png"
                      alt="dropdown"
                      className="w-7 h-7"
                    />
                  </button>
                  <p className="text-[16px] font-nomral text-[#000000] leading-[19px]">
                    SengKang, Singpore
                  </p>
                </div>
                <a href="#" className="underline text-[#0099FF] text-[12px] font-normal leading-[18px]">View on map</a>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[16px] font-medium text-[#4C4C4C] leading-[24px]">
                Date
              </label>
              <div className="flex items-center gap-2 mt-2 w-full">
                <div className="flex items-center gap-6 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg w-[30%]">
                  <button
                    type="button"
                    className="text-blue-500 text-sm underline hover:text-blue-700"
                  >
                    <img
                      src="./assets/icons/dropdown.png"
                      alt="dropdown"
                      className="w-7 h-7"
                    />
                  </button>
                  <p className="text-[16px] font-nomral text-[#000000] leading-[19px]">
                    1
                  </p>
                </div>
                <div className="flex items-center gap-6 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg w-[40%]">
                  <button
                    type="button"
                    className="text-blue-500 text-sm underline hover:text-blue-700"
                  >
                    <img
                      src="./assets/icons/dropdown.png"
                      alt="dropdown"
                      className="w-7 h-7"
                    />
                  </button>
                  <p className="text-[16px] font-nomral text-[#000000] leading-[19px]">
                    January
                  </p>
                </div>
                <div className="flex items-center gap-6 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg w-[30%]">
                  <button
                    type="button"
                    className="text-blue-500 text-sm underline hover:text-blue-700"
                  >
                    <img
                      src="./assets/icons/dropdown.png"
                      alt="dropdown"
                      className="w-7 h-7"
                    />
                  </button>
                  <p className="text-[16px] font-nomral text-[#000000] leading-[19px]">
                    2024
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="py-12 flex items-center justify-center gap-8">
            <button
              type="button"
              className="px-24 py-4 text-[20px] leading-[30px] font-bold text-[#0099FF] bg-white border border-[#0099FF] rounded-md "
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-24 py-4 text-[20px] leading-[30px] font-bold  text-white bg-[#0099FF] rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobInfo;
