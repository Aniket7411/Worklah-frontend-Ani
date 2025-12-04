"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/authInstances";

const IMAGE_BASE_URL = "https://worklah.onrender.com";

interface SalesReportData {
    id?: string;
    _id?: string;
    employer?: {
        name?: string;
        companyLegalName?: string;
        logo?: string;
    };
    jobsPosted?: number;
    jobsFulfilled?: number;
    fulfillmentRate?: number;
    revenue?: number;
    hoursFulfilled?: number;
}

export default function SalesReport() {
    const [reports, setReports] = useState<SalesReportData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSalesReport = async () => {
            try {
                setLoading(true);
                setError(null);
                // Try to fetch sales report from API
                // If endpoint doesn't exist, fetch employers and calculate stats
                const response = await axiosInstance.get("/admin/sales-report").catch(() => null);
                
                if (response?.data) {
                    setReports(response.data.reports || response.data.data || []);
                } else {
                    // Fallback: fetch employers and show empty state or calculate from available data
                    const employersResponse = await axiosInstance.get("/employers");
                    const employers = employersResponse.data.employers || [];
                    
                    // Transform employers to sales report format
                    const reportsData = employers.map((emp: any) => ({
                        id: emp._id,
                        employer: {
                            name: emp.companyLegalName || emp.name,
                            logo: emp.companyLogo,
                        },
                        jobsPosted: emp.jobsPosted || 0,
                        jobsFulfilled: emp.jobsFulfilled || 0,
                        fulfillmentRate: emp.fulfillmentRate || 0,
                        revenue: emp.revenue || 0,
                        hoursFulfilled: emp.hoursFulfilled || 0,
                    }));
                    
                    setReports(reportsData);
                }
            } catch (err: any) {
                console.error("Error fetching sales report:", err);
                setError("Failed to load sales report data");
                setReports([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSalesReport();
    }, []);

    return (
        <div className="overflow-x-auto border rounded-lg bg-white">
            <table className="min-w-full divide-y divide-[#E5E5E5]">
                <thead className="bg-[#F9FAFB]">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-[#D1D5DB] text-[#0070F3] focus:ring-[#0070F3]"
                            />
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Id #
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Employer
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Jobs Posted
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Jobs Fulfilled
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Fulfillment rate (%)
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Revenue
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Hours Fulfilled
                        </th>

                    </tr>
                </thead>
                <tbody className="bg-white">
                    {loading ? (
                        <tr>
                            <td colSpan={8} className="px-6 py-8 text-center">
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan={8} className="px-6 py-8 text-center text-red-500">
                                {error}
                            </td>
                        </tr>
                    ) : reports.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                No sales report data available
                            </td>
                        </tr>
                    ) : (
                        reports.map((report) => (
                            <tr key={report.id || report._id} className="hover:bg-[#F9FAFB]">
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-[#D1D5DB] text-[#0070F3] focus:ring-[#0070F3]"
                                    />
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.id?.slice(-4) || report._id?.slice(-4) || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap w-max overflow-hidden">
                                    <div className="flex items-center w-max">
                                        <img
                                            alt={report.employer?.name || 'Employer'}
                                            src={report.employer?.logo?.startsWith('http') 
                                                ? report.employer.logo 
                                                : `${IMAGE_BASE_URL}${report.employer?.logo}`}
                                            width={32}
                                            height={32}
                                            className="h-8 w-8 rounded"
                                        />
                                        <div className="ml-4 text-left">
                                            <div className="text-[12px] font-medium text-[#111827]">
                                                {report.employer?.name || 'Unknown'}
                                            </div>
                                            <div className="text-[10px] font-medium text-[#111827]">
                                                <a href="#" className="text-blue-400 underline">View Employer</a>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.jobsPosted || 0}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.jobsFulfilled || 0}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.fulfillmentRate ? `${report.fulfillmentRate}%` : '0%'}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    ${report.revenue || 0}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.hoursFulfilled || 0} hrs
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
