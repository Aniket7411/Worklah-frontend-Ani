"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/authInstances";

const IMAGE_BASE_URL = "https://worklah.onrender.com";

interface InvoiceData {
    id?: string;
    _id?: string;
    employer?: {
        name?: string;
        companyLegalName?: string;
        logo?: string;
    };
    invoicePeriod?: string;
    jobsPosted?: number;
    jobsFulfilled?: number;
    fulfillmentRate?: number;
    numberOfOutlets?: number;
    hoursFulfilled?: number;
    totalHours?: number;
    subtotal?: number;
    gst?: number;
    total?: number;
}

export default function Invoicereport() {
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axiosInstance.get("/admin/invoice-report").catch(() => null);

                if (response?.data) {
                    setInvoices(response.data.invoices || response.data.data || []);
                } else {
                    // Fallback: fetch employers
                    const employersResponse = await axiosInstance.get("/employers");
                    const employers = employersResponse.data.employers || [];

                    const invoicesData = employers.map((emp: any) => ({
                        id: emp._id,
                        employer: {
                            name: emp.companyLegalName || emp.name,
                            logo: emp.companyLogo,
                        },
                        invoicePeriod: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
                        jobsPosted: emp.jobsPosted || 0,
                        jobsFulfilled: emp.jobsFulfilled || 0,
                        fulfillmentRate: emp.fulfillmentRate || 0,
                        numberOfOutlets: emp.outlets?.length || 0,
                        hoursFulfilled: emp.hoursFulfilled || 0,
                        totalHours: emp.totalHours || 0,
                        subtotal: emp.subtotal || 0,
                        gst: emp.gst || 0,
                        total: emp.total || 0,
                    }));

                    setInvoices(invoicesData);
                }
            } catch (err: any) {
                console.error("Error fetching invoice report:", err);
                setError("Failed to load invoice report data");
                setInvoices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
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
                            Invoice Period
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
                            No. of Outlets
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Hours Fulfilled
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Total Hours
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Subtotal
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            GST (8%)
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Total
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Download
                        </th>

                    </tr>
                </thead>
                <tbody className="bg-white">
                    {loading ? (
                        <tr>
                            <td colSpan={14} className="px-6 py-8 text-center">
                                <div className="flex justify-center items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-gray-600">Loading invoices...</span>
                                </div>
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan={14} className="px-6 py-8 text-center text-red-600">
                                {error}
                            </td>
                        </tr>
                    ) : invoices.length === 0 ? (
                        <tr>
                            <td colSpan={14} className="px-6 py-8 text-center text-gray-500">
                                No invoices found
                            </td>
                        </tr>
                    ) : (
                        invoices.map((invoice) => (
                            <tr key={invoice.id || invoice._id} className="hover:bg-[#F9FAFB]">
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-[#D1D5DB] text-[#0070F3] focus:ring-[#0070F3]"
                                    />
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {invoice.id?.slice(-4) || invoice._id?.slice(-4) || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap w-max overflow-hidden">
                                    <div className="flex items-center w-max">
                                        {invoice.employer?.logo ? (
                                            <img
                                                alt={invoice.employer?.name || 'Employer'}
                                                src={invoice.employer.logo.startsWith('http')
                                                    ? invoice.employer.logo
                                                    : `${IMAGE_BASE_URL}${invoice.employer.logo}`}
                                                width={32}
                                                height={32}
                                                className="h-8 w-8 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                                                {invoice.employer?.name?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                        )}
                                        <div className="ml-4 text-left">
                                            <div className="text-[12px] font-medium text-[#111827]">
                                                {invoice.employer?.name || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {invoice.invoicePeriod || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {invoice.jobsPosted || 0}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {invoice.jobsFulfilled || 0}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {invoice.fulfillmentRate ? `${invoice.fulfillmentRate}%` : '0%'}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {invoice.numberOfOutlets || 0}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {invoice.hoursFulfilled || 0} hrs
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {invoice.totalHours || 0} hrs
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    ${invoice.subtotal || 0}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    ${invoice.gst || 0}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    ${invoice.total || 0}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap">
                                    <button className="px-3 py-1 border border-[#D1D5DB] text-[#374151] rounded-md text-xs font-medium hover:bg-gray-50">
                                        Download
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
