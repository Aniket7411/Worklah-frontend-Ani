import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { axiosInstance } from "../../lib/authInstances";
import { Loader2 } from "lucide-react";

const RevenueChart = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Fetch revenue data from backend
        const revenueResponse = await axiosInstance.get("/dashboard/revenue");
        
        // Backend should return complete data structure
        const revenueChartData = revenueResponse?.data?.monthlyData || [];

        if (!Array.isArray(revenueChartData) || revenueChartData.length === 0) {
          setRevenueData([]);
          setTotalRevenue(0);
        } else {
          // Use data exactly as backend provides it
          // Backend should return: [{ name: "Jan", uv: 4000 }, ...]
          setRevenueData(revenueChartData);
          
          // Calculate total from backend data
          const total = revenueChartData.reduce((sum: number, item: any) => sum + (item.uv || item.amount || 0), 0);
          setTotalRevenue(total);
        }

        // Fetch new applications from backend
        const applicationsResponse = await axiosInstance.get(
          "/dashboard/recent-applications?limit=4"
        );
        const applications = applicationsResponse?.data?.applications || [];

        if (!Array.isArray(applications) || applications.length === 0) {
          setApplicants([]);
        } else {
          // Use data exactly as backend provides it
          const formattedApplicants = applications.map((app: any) => ({
            id: app._id,
            name: app.user?.fullName || app.candidateName || "",
            appliedFor: app.job?.jobName || "",
            avatar: app.user?.profileImage || "",
          }));
          setApplicants(formattedApplicants);
        }
      } catch (err: any) {
        console.error("Error fetching revenue data:", err);
        setError(err?.response?.data?.message || "Failed to load revenue data");
        // No dummy data - just empty arrays
        setRevenueData([]);
        setApplicants([]);
        setTotalRevenue(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[65%_35%] gap-4 p-4">
        <div className="p-4">
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[65%_35%] gap-4 p-4">
      {/* Left: Revenue Stats */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 border-l-[12px] pl-2 border-[#009CFF]">
            Revenue Stats
          </h2>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <p className="text-3xl font-bold text-gray-800 mb-2">
              ${totalRevenue >= 1000
                ? (totalRevenue / 1000).toFixed(1) + "k"
                : totalRevenue.toFixed(2)}{" "}
              <span className="text-sm font-normal">Total revenue</span>
            </p>
            <button className="text-blue-600 text-sm">Profit</button>
          </div>
          {revenueData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No revenue data available</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="uv"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorUv)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Right: New Applications */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-[12px] pl-2 border-[#009CFF]">
          New Applications
        </h2>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          {applicants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No new applications</p>
            </div>
          ) : (
            <ul className="">
              {applicants.map((applicant, index) => (
                <li key={applicant.id || index} className="flex items-center my-8">
                  {applicant.avatar && (
                    <img
                      src={applicant.avatar}
                      alt={applicant.name}
                      className="w-10 h-10 rounded-full mr-4 border object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">
                      {applicant.name || "Unknown"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Applied for {applicant.appliedFor || "Job"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
