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
                            GST (8%)
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
                    {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-[#F9FAFB]">
                            <td className="px-6 py-4 text-center truncate whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-[#D1D5DB] text-[#0070F3] focus:ring-[#0070F3]"
                                />
                            </td>
                            <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                {payment.id}
                            </td>
                            <td className="px-6 py-4 text-center truncate whitespace-nowrap w-max overflow-hidden">
                                <div className="flex items-center w-max bg-[#F6F6F6] rounded-full p-2">
                                    <div className="h-8 w-8 rounded-full overflow-hidden">
                                        <img
                                            alt={payment.worker.name}
                                            src={payment.worker.avatar}
                                            width={32}
                                            height={32}
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-[#111827]">
                                            {payment.worker.name}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                {payment.worker.nric}
                            </td>
                            <td className="px-6 py-4 text-center truncate whitespace-nowrap w-max overflow-hidden">
                                <div className="flex items-center w-max">
                                    <img
                                        alt={payment.employer.name}
                                        src={payment.employer.logo}
                                        width={32}
                                        height={32}
                                        className="h-8 w-8 rounded"
                                    />
                                    <div className="ml-4 text-left">
                                        <div className="text-[12px] font-medium text-[#111827]">
                                            {payment.employer.name}
                                        </div>
                                        <div className="text-[10px] font-medium text-[#111827]">
                                            <a href="#" className="text-blue-400 underline">View Employer</a>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                {payment.jobId}
                            </td>
                            <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                {payment.day}
                            </td>
                            <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                {payment.shiftDate}
                            </td>
                            <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                {payment.shiftId}
                            </td>
                            <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                {payment.timeIn}
                            </td>
                            <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                {payment.timeOut}
                            </td>
                            <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                {payment.clockedIn}
                            </td>
                            <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                {payment.clockedOut}
                            </td>
                            <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                {payment.breakTime}
                            </td>


                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
