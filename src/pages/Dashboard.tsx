import React, { useEffect, useState } from "react";
import JobPostChart from "../components/dashboard/JobPostChart";
import RevenueChart from "../components/dashboard/RevenueChart";
import DashboardCard from "../components/dashboard/DashboardCard";
import { Loader2 } from "lucide-react";
import { axiosInstance } from "../lib/authInstances";

const Dashboard = () => {
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
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const handleCardClick = (index: number) => {
    setSelectedCard(index);
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axiosInstance.get(`/dashboard/overview`);

      setDashboardData({
        totalJobs: response?.data?.totalJobs || 0,
        activatedHeroes: response?.data?.activatedHeroes || 0,
        vacancies: response?.data?.vacancies || 0,
        vacanciesFilled: response?.data?.vacanciesFilled || 0,
        pendingVerifications: response?.data?.pendingVerifications || 0,
        pendingPayments: response?.data?.pendingPayments || 0,
        totalAmountPaid: response?.data?.totalAmountPaid || 0,
        noShows: response?.data?.noShows || 0,
        verifiedHeroes: response?.data?.verifiedHeroes || 0,
      });
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setError(error?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      </div>

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
