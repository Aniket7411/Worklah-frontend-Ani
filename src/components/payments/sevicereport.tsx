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
                    {loading ? (
                        <tr>
                            <td colSpan={13} className="px-6 py-8 text-center">
                                <div className="flex justify-center items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-gray-600">Loading service reports...</span>
                                </div>
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan={13} className="px-6 py-8 text-center text-red-600">
                                {error}
                            </td>
                        </tr>
                    ) : reports.length === 0 ? (
                        <tr>
                            <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                                No service reports found
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
                                    <div className="flex items-center w-max">
                                        {report.employer?.logo ? (
                                            <img
                                                alt={report.employer?.name || 'Employer'}
                                                src={report.employer.logo.startsWith('http')
                                                    ? report.employer.logo
                                                    : `${IMAGE_BASE_URL}${report.employer.logo}`}
                                                width={32}
                                                height={32}
                                                className="h-8 w-8 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                                                {report.employer?.name?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                        )}
                                        <div className="ml-4 text-left">
                                            <div className="text-[12px] font-medium text-[#111827]">
                                                {report.employer?.name || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.date ? new Date(report.date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.jobRole || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.scheduledShifts || 0}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.outletAddress || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.completedShifts || 0}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.workersAssigned || 0}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.headcountAttendance || 0}%
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.hoursWorked || 0} hrs
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.issues || 'None'}
                                </td>
                                <td className="px-6 py-4 text-center truncate whitespace-nowrap text-sm text-[#6B7280]">
                                    {report.clockedOut || 'N/A'}
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
        </div >
    );
}
