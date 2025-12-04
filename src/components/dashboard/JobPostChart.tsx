import { ArrowRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import { AgCharts } from "ag-charts-react";
import { axiosInstance } from "../../lib/authInstances";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const JobsBarChart = ({ data }: { data: any[] }) => {
  const [options, setOptions] = useState({
    data: data,
    series: [
      {
        type: "bar",
        xKey: "month",
        yKey: "jobsPosted",
        fill: "#003D64",
        barStyle: {
          radius: 10,
        },
      },
    ],
    axes: [
      {
        type: "category",
        position: "bottom",
      },
      {
        type: "number",
        position: "left",
        label: {
          formatter: (params: any) => {
            const value = params.value;
            return `${value / 1000}k`;
          },
        },
        gridStyle: [
          {
            stroke: "gray",
            lineDash: [10, 3],
          },
        ],
      },
    ],
  });

  useEffect(() => {
    setOptions((prev) => ({ ...prev, data }));
  }, [data]);

  return <AgCharts options={options} />;
};

const JobPostChart = () => {
  const [jobPostData, setJobPostData] = useState<any[]>([]);
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [totalJobsPosted, setTotalJobsPosted] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobPostData = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Fetch monthly job post data from backend
        const chartResponse = await axiosInstance.get("/dashboard/job-posts");
        
        // Backend should return complete data structure with all months
        const chartData = chartResponse?.data?.monthlyData || [];
        
        if (!Array.isArray(chartData) || chartData.length === 0) {
          setJobPostData([]);
          setTotalJobsPosted(0);
        } else {
          // Use data exactly as backend provides it
          // Backend should return: [{ month: "Jan", jobsPosted: 10 }, ...]
          setJobPostData(chartData);
          
          // Calculate total from backend data
          const total = chartData.reduce((sum: number, item: any) => sum + (item.jobsPosted || 0), 0);
          setTotalJobsPosted(total);
        }

        // Fetch recent posted jobs from backend
        const jobsResponse = await axiosInstance.get("/admin/jobs?limit=3&sortOrder=desc");
        const jobs = jobsResponse?.data?.jobs || [];
        
        if (!Array.isArray(jobs) || jobs.length === 0) {
          setPostedJobs([]);
        } else {
          // Use data exactly as backend provides it
          const formattedJobs = jobs.map((job: any) => ({
            id: job._id,
            title: job.jobName || "",
            applicants: job.applicantsCount || 0,
            icon: job.jobLogo || "",
            postedBy: job.employer?.companyLegalName || "",
          }));
          setPostedJobs(formattedJobs);
        }
      } catch (err: any) {
        console.error("Error fetching job post data:", err);
        setError(err?.response?.data?.message || "Failed to load job post data");
        // No dummy data - just empty arrays
        setJobPostData([]);
        setPostedJobs([]);
        setTotalJobsPosted(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobPostData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="col-span-2 bg-white border rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
        <div className="col-span-1 bg-white border rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {/* Left: Total Job Posted */}
      <div className="col-span-2 bg-white border rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Total Job Posted</h2>
          <Link to="/jobs/job-management">
            <button className="text-sm flex items-center gap-1 hover:text-blue-600">
              <p>Detail statistics</p>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        {jobPostData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>No job post data available</p>
          </div>
        ) : (
          <>
            <div className="h-64">
              <JobsBarChart data={jobPostData} />
            </div>
            <div className="flex justify-center items-center mt-4">
              <p className="text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                {totalJobsPosted >= 1000
                  ? `${(totalJobsPosted / 1000).toFixed(1)}k`
                  : totalJobsPosted}{" "}
                job posted
              </p>
            </div>
          </>
        )}
      </div>

      {/* Right: Posted Jobs */}
      <div className="col-span-1 w-full max-w-sm bg-white border border-gray-200 rounded-lg p-4 shadow">
        <div className="flex justify-between items-center pb-4 border-b-2 border-gray-300">
          <h3 className="text-lg font-semibold text-gray-800">Posted Jobs</h3>
          <Link
            to="/jobs/job-management"
            className="text-sm text-blue-600 hover:underline"
          >
            view list
          </Link>
        </div>

        {postedJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No jobs posted yet</p>
          </div>
        ) : (
          <div>
            {postedJobs.map((job, index) => (
              <Link key={job.id || index} to={`/jobs/${job.id}`}>
                <div className="flex justify-between items-center my-4 py-2 border-b last:border-b-0 hover:bg-gray-50 rounded p-2 transition-colors">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 flex gap-2 items-center">
                      {job.icon && (
                        <img
                          className="w-8 h-8 rounded-full object-cover"
                          src={job.icon}
                          alt={job.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <p>{job.title}</p>
                    </h4>
                    <p className="text-sm text-gray-600">
                      Applicants: {job.applicants}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Posted by:</p>
                    <p className="text-sm text-gray-600">{job.postedBy || "N/A"}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPostChart;
