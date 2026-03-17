import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../lib/authInstances";

/**
 * Overview table: one row per shift with date, opening, closing, break, manpower vacancy, applicants.
 * Supports multiple shifts across multiple days (e.g. 7 shifts).
 * Props: jobId (fetch job) or job (object with shifts[]).
 */
export default function OverViewTable({ jobId, job: jobProp }) {
  const [job, setJob] = useState(jobProp || null);
  const [loading, setLoading] = useState(!jobProp && !!jobId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (jobProp) {
      setJob(jobProp);
      setLoading(false);
      setError(null);
      return;
    }
    if (!jobId) {
      setJob(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    axiosInstance
      .get(`/admin/jobs/${jobId}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.job || res.data;
        if (data) setJob(data);
        else setError("Job not found");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || "Failed to load job");
        setJob(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [jobId, jobProp]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">Loading overview...</div>
    );
  }
  if (error) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">{error}</div>
    );
  }
  if (!job) {
    return (
      <div className="p-4 text-center text-gray-500">No job data. Pass jobId or job.</div>
    );
  }

  const shifts = Array.isArray(job.shifts) ? job.shifts : [];
  const hasShifts = shifts.length > 0;

  return (
    <div className="p-4 overflow-x-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Shifts overview</h3>
      {!hasShifts ? (
        <p className="text-gray-500">No shifts for this job.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left font-medium">Date</th>
              <th className="border border-gray-300 p-2 text-left font-medium">Shift</th>
              <th className="border border-gray-300 p-2 text-left font-medium">Opening</th>
              <th className="border border-gray-300 p-2 text-left font-medium">Closing</th>
              <th className="border border-gray-300 p-2 text-left font-medium">Break</th>
              <th className="border border-gray-300 p-2 text-left font-medium">Manpower / Vacancy</th>
              <th className="border border-gray-300 p-2 text-left font-medium">Applicants</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift, index) => {
              const date = shift.shiftDate || shift.date || job.jobDate || "—";
              const opening = shift.startTime || shift.opening || "—";
              const closing = shift.endTime || shift.closing || "—";
              const breakMins = shift.breakDuration ?? shift.breakHours ?? 0;
              const breakLabel = typeof breakMins === "number" ? `${breakMins} min` : breakMins;
              const vacancy = shift.vacancy ?? shift.availableVacancy ?? shift.manpower ?? "—";
              const applicants = shift.applicantsCount ?? shift.applicants ?? shift.filled ?? "—";
              return (
                <tr key={shift._id || shift.id || index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">{date}</td>
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2">{opening}</td>
                  <td className="border border-gray-300 p-2">{closing}</td>
                  <td className="border border-gray-300 p-2">{breakLabel}</td>
                  <td className="border border-gray-300 p-2">{vacancy}</td>
                  <td className="border border-gray-300 p-2">{applicants}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
