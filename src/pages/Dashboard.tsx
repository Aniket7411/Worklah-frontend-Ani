import React, { useEffect, useState } from "react";
import JobPostChart from "../components/dashboard/JobPostChart";
import RevenueChart from "../components/dashboard/RevenueChart";
import DashboardCard from "../components/dashboard/DashboardCard";
import { Loader2, Calendar, X } from "lucide-react";
import { axiosInstance } from "../lib/authInstances";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedCard, setSelectedCard] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalJobs: 0,
    activatedHeroes: 0,
    vacancies: 0,
    vacanciesFilled: 0,
    pendingVerifications: 0,
    pendingPayments: 0,
    totalAmountPaid: 0,
    noShows: 0,
    verifiedHeroes: 0,
    revenue: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>("");
  const [employers, setEmployers] = useState<any[]>([]);
  const [showDateFilter, setShowDateFilter] = useState(false);

  const handleCardClick = (index: number) => {
    setSelectedCard(index);
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Build query params
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (selectedEmployerId && user?.role === "ADMIN") {
        params.append('employerId', selectedEmployerId);
      }
      
      const queryString = params.toString();
      // Use admin dashboard stats endpoint according to documentation
      const endpoint = `/admin/dashboard/stats${queryString ? `?${queryString}` : ''}`;
      
      const response = await axiosInstance.get(endpoint);
      
      // Check for success field according to API spec
      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to fetch dashboard data");
      }

      // Map response data - documentation shows 'stats' object
      const stats = response?.data?.stats || response?.data;
      setDashboardData({
        totalJobs: stats?.totalJobs || stats?.activeJobs || 0,
        activatedHeroes: stats?.activeUsers || stats?.activatedHeroes || 0,
        vacancies: stats?.vacancies || 0,
        vacanciesFilled: stats?.vacanciesFilled || 0,
        pendingVerifications: stats?.pendingApplications || stats?.pendingVerifications || 0,
        pendingPayments: stats?.pendingPayments || 0,
        totalAmountPaid: stats?.totalRevenue || stats?.totalAmountPaid || 0,
        noShows: stats?.noShows || 0,
        verifiedHeroes: stats?.verifiedHeroes || 0,
        revenue: stats?.revenue || response?.data?.revenue || {
          total: stats?.totalRevenue || 0,
          thisMonth: 0,
          lastMonth: 0,
        },
      });
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setError(error?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployers = async () => {
    if (user?.role !== "ADMIN") return;
    try {
      const response = await axiosInstance.get("/admin/employers?limit=100");
      if (response.data?.employers) {
        setEmployers(response.data.employers);
      }
    } catch (error) {
      console.error("Error fetching employers:", error);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchEmployers();
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange.startDate, dateRange.endDate, selectedEmployerId]);

  const cards = [
    {
      title: "No. of Active Job now",
      value: dashboardData.totalJobs,
      chartData: [0, 0, 0, 0, 0, 0, 0, 0],
      chartColor: ["#797979", "#FFFFFF"],
      icon: "/assets/icons/group1.svg",
    },
    {
      title: "Activated Hustle Heroes",
      value: dashboardData.activatedHeroes,
      chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      chartColor: ["#11FF00", "#FFFFFF"],
      icon: "/assets/icons/group2.svg",
    },
    {
      title: "Current Headcount Fulfilment",
      value: `${dashboardData.vacanciesFilled}/${dashboardData.vacancies}`,
      chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      chartColor: ["#4D5578", "#FFFFFF"],
      icon: "/assets/icons/group3.svg",
    },
    {
      title: "Pending Verifications",
      value: dashboardData.pendingVerifications,
      chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      chartColor: ["#0FA5C2", "#FFFFFF"],
      icon: "/assets/icons/group4.svg",
    },
    {
      title: "Pending Wages Transfer",
      value: dashboardData.pendingPayments,
      chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      chartColor: ["#FFDD1C", "#FFFFFF"],
      icon: "/assets/icons/group5.svg",
    },
    {
      title: "Outstanding Payment",
      value: dashboardData.totalAmountPaid,
      chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      chartColor: ["#178628", "#FFFFFF"],
      icon: "/assets/icons/group6.svg",
    },
    {
      title: "No Show",
      value: dashboardData.noShows,
      chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      chartColor: ["#797979", "#FFFFFF"],
      icon: "/assets/icons/group7.svg",
    },
    {
      title: "Verified Hustle Heroes",
      value: dashboardData.verifiedHeroes,
      chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      chartColor: ["#007BE5", "#FFFFFF"],
      icon: "/assets/icons/group2.svg",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl md:text-[24px] font-medium leading-[30px] text-[#1f2937] pl-2 border-l-4 md:border-l-[12px] border-[#FED408]">
          Dashboard Overview
        </h1>
        <div className="flex items-center gap-2">
          {(dateRange.startDate || dateRange.endDate || selectedEmployerId) && (
            <button
              onClick={() => {
                setDateRange({ startDate: "", endDate: "" });
                setSelectedEmployerId("");
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Date Range
          </button>
        </div>
      </div>

      {/* Date Range and Employer Filter */}
      {showDateFilter && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {user?.role === "ADMIN" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employer (Optional)
                </label>
                <select
                  value={selectedEmployerId}
                  onChange={(e) => setSelectedEmployerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Employers</option>
                  {employers.map((employer) => (
                    <option key={employer._id || employer.id} value={employer._id || employer.id}>
                      {employer.companyLegalName || employer.companyName || employer.name || `Employer ${employer._id || employer.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {(dateRange.startDate || dateRange.endDate || selectedEmployerId) && (
            <div className="mt-3 text-xs text-gray-500">
              Filtering dashboard data by {dateRange.startDate || dateRange.endDate ? "date range" : ""} {selectedEmployerId ? "and employer" : ""}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(index)}
            className={`cursor-pointer rounded-lg ${
              selectedCard === index
                ? "border-2 border-black"
                : "border border-gray-200"
            }`}
          >
            <DashboardCard
              title={card.title}
              value={card.value}
              chartData={card.chartData}
              chartColor={card.chartColor}
              icon={<img src={card.icon} className="text-blue-500 w-8 h-8" alt={card.title} />}
            />
          </div>
        ))}
      </div>

      <JobPostChart />
      <RevenueChart />
    </div>
  );
};

export default Dashboard;
