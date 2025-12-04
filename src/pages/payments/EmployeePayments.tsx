"use client";

import { useEffect, useRef, useState } from "react";
import { Filter } from "lucide-react";
import Payments from "../../components/payments/Payments";
import WithDrawals from "../../components/payments/WithDrawals";
import { axiosInstance } from "../../lib/authInstances";
import PaymentFilters from "../../components/Filter/PaymentFilters";
import Servicereport from "../../components/payments/sevicereport";
import SalesReport from "../../components/payments/salesreport";
import Invoicereport from "../../components/payments/invoice";
import toast from "react-hot-toast";

export default function EmployeePayments() {
  const [activeTab, setActiveTab] = useState("payments");
  const [workerClientTab, setWorkerClientTab] = useState("workers");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLimitPopupOpen, setIsLimitPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [activeClientTab, setActiveClientTab] = useState("serviceReport");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsLimitPopupOpen(false);
      }
    };

    if (isLimitPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLimitPopupOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const endpoint = activeTab === "payments" ? "/payments" : "/withdrawals";
        const response = await axiosInstance.get(endpoint);
        setData(response?.data || null);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || "Failed to fetch data. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (workerClientTab === "workers") {
      fetchData();
    }
  }, [activeTab, workerClientTab]);

  return (
    <div className="w-full bg-[#F8F8F8] min-h-screen">
      <div className="flex flex-col space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#333333]">
            Payments & Transactions
          </h2>
          {loading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}





        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-gray-300 pb-4">
          {/* Tab Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setWorkerClientTab("workers")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${workerClientTab === "workers"
                ? "bg-[#0070F3] text-white"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Workers
            </button>
            <button
              onClick={() => setWorkerClientTab("clients")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${workerClientTab === "clients"
                ? "bg-[#0070F3] text-white"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Clients
            </button>
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-900 shadow-md transition-transform hover:scale-105"
              onClick={() => setIsLimitPopupOpen(!isLimitPopupOpen)}
            >
              <Filter size={20} color="#FFFFFF" />
            </button>
            {isLimitPopupOpen && (
              <div
                ref={popupRef}
                className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-md z-50"
              >
                <PaymentFilters />
              </div>
            )}
          </div>
        </div>


        {
          workerClientTab === "workers" ? <>
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "payments"
                  ? "bg-[#0070F3] text-white"
                  : "text-[#666666] hover:text-[#333333]"
                  }`}
                onClick={() => setActiveTab("payments")}
              >
                Payments
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "withdrawals"
                  ? "bg-[#0070F3] text-white"
                  : "text-[#666666] hover:text-[#333333]"
                  }`}
                onClick={() => setActiveTab("withdrawals")}
              >
                Withdrawals
              </button>
            </div>
            <div className="mt-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              ) : (
                <>
                  {activeTab === "payments" && <Payments data={data} />}
                  {activeTab === "withdrawals" && <WithDrawals data={data} />}
                </>
              )}
            </div>
          </> : <>

            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeClientTab === "serviceReport"
                  ? "bg-[#0070F3] text-white"
                  : "text-[#666666] hover:text-[#333333]"
                  }`}
                onClick={() => setActiveClientTab("serviceReport")}
              >
                Service Reports
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeClientTab === "salesReport"
                  ? "bg-[#0070F3] text-white"
                  : "text-[#666666] hover:text-[#333333]"
                  }`}
                onClick={() => setActiveClientTab("salesReport")}
              >
                Sales Report
              </button>

              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeClientTab === "invoice"
                  ? "bg-[#0070F3] text-white"
                  : "text-[#666666] hover:text-[#333333]"
                  }`}
                onClick={() => setActiveClientTab("invoice")}
              >
                Invoice
              </button>
            </div>

            <div className="mt-4">
              {activeClientTab === "serviceReport" && <Servicereport />}
              {activeClientTab === "salesReport" && <SalesReport />}
              {activeClientTab === "invoice" && <Invoicereport />}

            </div>
          </>
        }



      </div>
    </div>
  );
}
