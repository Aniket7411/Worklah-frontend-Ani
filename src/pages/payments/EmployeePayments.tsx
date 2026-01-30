"use client";

import { useEffect, useRef, useState } from "react";
import { Filter } from "lucide-react";
import Payments from "../../components/payments/Payments";
import EnhancedPayments from "../../components/payments/EnhancedPayments";
import WithDrawals from "../../components/payments/WithDrawals";
import { axiosInstance } from "../../lib/authInstances";
import PaymentFilters from "../../components/Filter/PaymentFilters";
import Servicereport from "../../components/payments/sevicereport";
import SalesReport from "../../components/payments/salesreport";
import Invoicereport from "../../components/payments/invoice";
import toast from "react-hot-toast";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function EmployeePayments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filter = searchParams.get("filter") || "";
  const [activeTab, setActiveTab] = useState("payments");
  const [workerClientTab, setWorkerClientTab] = useState("workers");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLimitPopupOpen, setIsLimitPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [activeClientTab, setActiveClientTab] = useState("serviceReport");

  // Get page title based on filter and active tab
  const getPageTitle = () => {
    // Only show filter-specific title for Workers tab
    if (workerClientTab === "workers") {
      switch (filter) {
        case "pending":
          return "Pending Wages Transfer";
        case "outstanding":
          return "Outstanding Payment";
        default:
          return "Payments & Transactions";
      }
    }
    // Clients tab always shows generic title
    return "Payments & Transactions";
  };

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

        // Use admin payments/transactions endpoint per API doc 16.1
        let endpoint = "/admin/payments/transactions";
        const params: Record<string, string> = {};
        if (activeTab === "payments") {
          // Payments tab: credit-type transactions
          params.type = "credit";
        } else {
          params.type = "debit";
          params.status = "pending";
        }
        params.page = "1";
        params.limit = "50";

        // Add filter query parameters from URL

        // Get URL search params
        const urlParams = new URLSearchParams(window.location.search);

        // Status filter
        const statusParam = urlParams.get('status');
        if (statusParam) {
          params.status = statusParam;
        } else if (filter === "pending" && activeTab === "payments") {
          params.status = "pending";
        } else if (filter === "outstanding" && activeTab === "payments") {
          params.status = "outstanding";
        }

        // Date range filters (API uses startDate, endDate)
        const dateFrom = urlParams.get('dateFrom') || urlParams.get('startDate');
        const dateTo = urlParams.get('dateTo') || urlParams.get('endDate');
        if (dateFrom) params.startDate = dateFrom;
        if (dateTo) params.endDate = dateTo;

        // Rate type filter
        const rateType = urlParams.get('rateType');
        if (rateType) params.rateType = rateType;

        const queryString = new URLSearchParams(params).toString();
        if (queryString) {
          endpoint += `?${queryString}`;
        }

        const response = await axiosInstance.get(endpoint);

        // Check for success field according to API spec
        if (response.data?.success === false) {
          throw new Error(response.data?.message || 'Failed to fetch data');
        }

        let responseData = response?.data || null;

        // Update: Use transactions array instead of withdrawals for withdrawals endpoint
        if (activeTab === "withdrawals" && responseData && responseData.transactions) {
          responseData = {
            ...responseData,
            transactions: responseData.transactions, // Already in correct format
          };
        }

        // If filter is applied, filter the data on frontend if backend doesn't support it
        if (responseData && responseData.payments) {
          if (filter === "pending") {
            responseData = {
              ...responseData,
              payments: responseData.payments.filter(
                (p: any) =>
                  p.status === "Pending" ||
                  p.paymentStatus === "Pending" ||
                  (p.status && p.status.toLowerCase() === "pending") ||
                  (p.paymentStatus && p.paymentStatus.toLowerCase() === "pending")
              ),
            };
          } else if (filter === "outstanding") {
            // Outstanding payments are those that are not paid/completed
            // This includes: unpaid, outstanding, pending approval that needs payment
            responseData = {
              ...responseData,
              payments: responseData.payments.filter(
                (p: any) => {
                  const status = (p.status || p.paymentStatus || "").toLowerCase();
                  const isOutstanding =
                    status === "outstanding" ||
                    status === "unpaid" ||
                    status === "pending" ||
                    (status !== "paid" &&
                      status !== "completed" &&
                      status !== "approved" &&
                      p.totalAmount &&
                      (typeof p.totalAmount === "string"
                        ? parseFloat(p.totalAmount.replace(/[^0-9.-]/g, "")) > 0
                        : parseFloat(p.totalAmount) > 0));

                  return isOutstanding;
                }
              ),
            };
          }
        }

        setData(responseData);
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
  }, [activeTab, workerClientTab, filter]);

  return (
    <div className="w-full bg-[#F8F8F8] min-h-screen">
      <div className="flex flex-col space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#333333]">
            {getPageTitle()}
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

        {/* Only show filter banner for Workers tab */}
        {filter && workerClientTab === "workers" && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>
              Showing filtered results for: <strong>{filter === "pending" ? "Pending Wages Transfer" : "Outstanding Payment"}</strong>
            </span>
            <button
              onClick={() => navigate('/payments')}
              className="text-blue-600 underline text-sm ml-4 hover:text-blue-800"
            >
              Clear Filter
            </button>
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
                className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-md z-50 max-h-[600px] overflow-y-auto"
              >
                <PaymentFilters
                  onApply={(filters) => {
                    // Filters are applied via URL navigation in PaymentFilters component
                    setIsLimitPopupOpen(false)
                  }}
                  onClose={() => setIsLimitPopupOpen(false)}
                />
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
                  {activeTab === "payments" && (
                    <>
                      <EnhancedPayments data={data} />
                      {filter && data && (!data.payments || data.payments.length === 0) && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mt-4">
                          No {filter === "pending" ? "pending" : "outstanding"} payments found. Try adjusting your filters or check back later.
                        </div>
                      )}
                    </>
                  )}
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
