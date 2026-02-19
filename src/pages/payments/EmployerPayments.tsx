import { useEffect, useRef, useState } from "react";
import { Filter } from "lucide-react";
import EnhancedPayments from "../../components/payments/EnhancedPayments";
import { axiosInstance } from "../../lib/authInstances";
import PaymentFilters from "../../components/Filter/PaymentFilters";
import toast from "react-hot-toast";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function EmployerPayments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filter = searchParams.get("filter") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLimitPopupOpen, setIsLimitPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const getPageTitle = () => {
    switch (filter) {
      case "pending":
        return "Pending Employer Payments";
      case "outstanding":
        return "Outstanding Employer Payment";
      default:
        return "Employer Payments";
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
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

        let endpoint = "/admin/payments/transactions";
        const params: Record<string, string> = {
          type: "credit",
          page: "1",
          limit: "50",
        };
        // Request employer-only payments; backend may support payerType or payerRole
        params.payerType = "employer";

        const urlParams = new URLSearchParams(window.location.search);
        const statusParam = urlParams.get("status");
        if (statusParam) {
          params.status = statusParam;
        } else if (filter === "pending") {
          params.status = "pending";
        } else if (filter === "outstanding") {
          params.status = "outstanding";
        }
        const dateFrom = urlParams.get("dateFrom") || urlParams.get("startDate");
        const dateTo = urlParams.get("dateTo") || urlParams.get("endDate");
        if (dateFrom) params.startDate = dateFrom;
        if (dateTo) params.endDate = dateTo;
        const rateType = urlParams.get("rateType");
        if (rateType) params.rateType = rateType;

        const queryString = new URLSearchParams(params).toString();
        if (queryString) endpoint += `?${queryString}`;

        const response = await axiosInstance.get(endpoint);

        if (response.data?.success === false) {
          throw new Error(response.data?.message || "Failed to fetch data");
        }

        let responseData = response?.data || null;
        const list = responseData?.payments || responseData?.transactions || [];
        const employerOnly = Array.isArray(list)
          ? list.filter(
              (p: any) => p.payerType === "employer" || p.employerId || p.employer
            )
          : list;
        if (responseData) {
          responseData = {
            ...responseData,
            payments: employerOnly,
            transactions: employerOnly,
          };
        }
        setData(responseData);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || "Failed to fetch employer payments. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  return (
    <div className="w-full bg-[#F8F8F8] min-h-screen">
      <div className="flex flex-col space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#333333]">{getPageTitle()}</h2>
          {loading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {filter && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>
              Showing filtered results for:{" "}
              <strong>
                {filter === "pending" ? "Pending Employer Payments" : "Outstanding Employer Payment"}
              </strong>
            </span>
            <button
              onClick={() => navigate("/employer-payments")}
              className="text-blue-600 underline text-sm ml-4 hover:text-blue-800"
            >
              Clear Filter
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-gray-300 pb-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate("/payments")}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Worker Payments
            </button>
            <button
              onClick={() => navigate("/employer-payments")}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-[#0070F3] text-white"
            >
              Employer Payments
            </button>
          </div>
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
                  basePath="/employer-payments"
                  onApply={() => setIsLimitPopupOpen(false)}
                  onClose={() => setIsLimitPopupOpen(false)}
                />
              </div>
            )}
          </div>
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
              <EnhancedPayments data={data} />
              {filter && data && (!data.payments || data.payments.length === 0) && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mt-4">
                  No {filter === "pending" ? "pending" : "outstanding"} employer payments found. Try
                  adjusting your filters or check back later.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
