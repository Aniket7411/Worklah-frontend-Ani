"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/authInstances";

const IMAGE_BASE_URL = "https://worklah.onrender.com";

interface ServiceReportData {
    id?: string;
    _id?: string;
    employer?: {
        name?: string;
        companyLegalName?: string;
        logo?: string;
    };
    date?: string;
    jobRole?: string;
    scheduledShifts?: number;
    outletAddress?: string;
    completedShifts?: number;
    workersAssigned?: number;
    headcountAttendance?: number;
    hoursWorked?: number;
    issues?: string;
    clockedOut?: string;
}

export default function Servicereport() {
    const [reports, setReports] = useState<ServiceReportData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServiceReport = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axiosInstance.get("/admin/service-report").catch(() => null);
                
                if (response?.data) {
                    setReports(response.data.reports || response.data.data || []);
                } else {
                    // Fallback: fetch jobs
                    const jobsResponse = await axiosInstance.get("/admin/jobs?limit=50");
                    const jobs = jobsResponse.data.jobs || [];
                    
                    const reportsData = jobs.map((job: any) => ({
                        id: job._id,
                        employer: {
                            name: job.employer?.companyLegalName || job.employer?.name,
                            logo: job.employer?.logo,
                        },
                        date: job.date,
                        jobRole: job.jobName,
                        scheduledShifts: job.shifts?.length || 0,
                        outletAddress: job.outlet?.location || job.location,
                        completedShifts: job.completedShifts || 0,
                        workersAssigned: job.workersAssigned || 0,
                        headcountAttendance: job.headcountAttendance || 0,
                        hoursWorked: job.hoursWorked || 0,
                        issues: job.issues || 'None',
                        clockedOut: job.clockedOut || 'N/A',
                    }));
                    
                    setReports(reportsData);
                }
            } catch (err: any) {
                console.error("Error fetching service report:", err);
                setError("Failed to load service report data");
                setReports([]);
            } finally {
                setLoading(false);
            }
        };

        fetchServiceReport();
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
                            Employer
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Date
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Job Role
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Scheduled Shifts
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Outlet & Address
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Completed Shifts
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Workers Assigned
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Headcount attendance %
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Hours Worked
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Issues
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-center truncate text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                        >
                            Clocked Out
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





                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
