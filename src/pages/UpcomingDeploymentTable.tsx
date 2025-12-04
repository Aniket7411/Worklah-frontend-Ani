import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { axiosInstance } from "../lib/authInstances";
import Papa from "papaparse";
import { saveAs } from "file-saver";

const UpcomingDeploymentTable = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [employerId, setEmployerId] = useState("");
  const [jobId, setJobId] = useState("");
  const [data, setData] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/jobs/deployment-tracking", {
        params: { ...filters, page, limit }
      });
      setData(response.data.data || []);
      setTotal(response.data.total || 0);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    axiosInstance.get("/employers").then((res) => setEmployers(res.data.employers || []));
    axiosInstance.get("/admin/jobs").then((res) => setJobs(res.data?.jobs || []));
  }, []);

  useEffect(() => {
    fetchData({
      startDate: startDate?.toISOString().split("T")[0],
      endDate: endDate?.toISOString().split("T")[0],
      employerId,
      jobId,
    });
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchData({
      startDate: startDate?.toISOString().split("T")[0],
      endDate: endDate?.toISOString().split("T")[0],
      employerId,
      jobId,
    });
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setEmployerId("");
    setJobId("");
    setPage(1);
    fetchData();
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "deployment_tracking.csv");
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md font-sans">
      {/* <h2 className="text-xl font-semibold mb-4">Upcoming Deployment Tracking</h2> */}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} className="px-4 py-2 border rounded-lg" placeholderText="Start Date" dateFormat="yyyy-MM-dd" />
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} className="px-4 py-2 border rounded-lg" placeholderText="End Date" dateFormat="yyyy-MM-dd" />

        <select className="px-4 py-2 border rounded-lg" value={employerId} onChange={(e) => setEmployerId(e.target.value)}>
          <option value="">Select Employer</option>
          {(Array.isArray(employers) ? employers : []).map((e) => (
            <option key={e._id} value={e._id}>{e.companyLegalName}</option>
          ))}
        </select>

        <select className="px-4 py-2 border rounded-lg" value={jobId} onChange={(e) => setJobId(e.target.value)}>
          <option value="">Select Job</option>
          {(Array.isArray(jobs) ? jobs : []).map((j) => (
            <option key={j._id} value={j._id}>{j.jobName}</option>
          ))}
        </select>

        <button onClick={handleFilter} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Filter</button>
        <button onClick={handleReset} className="px-4 py-2 bg-green-500 text-white rounded-lg">Reset</button>
        <button onClick={exportToCSV} className="px-4 py-2 bg-black text-white rounded-lg">Export</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center p-4">Loading...</p>
        ) : error ? (
          <p className="text-center p-4 text-red-500">{error}</p>
        ) : (
          <table className="min-w-full table-auto border text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3 text-left">Employer</th>
                <th className="p-3 text-left">Job</th>
                <th className="p-3 text-left">Outlet</th>
                <th className="p-3 text-left">Job Date</th>
                <th className="p-3 text-center text-red-500">RQST Jobs</th>
                <th className="p-3 text-center text-green-600">Approved Jobs</th>
                <th className="p-3 text-center text-purple-700">RQST Seats</th>
                <th className="p-3 text-center text-blue-700">Approved Seats</th>
                <th className="p-3 text-center text-cyan-700">Fulfillment</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{row.employerName}</td>
                  <td className="p-3">{row.jobName}</td>
                  <td className="p-3">{row.outletName}</td>
                  <td className="p-3 whitespace-nowrap">
  {row.date
    ? new Date(row.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A"}
</td>

                  <td className="p-3 text-center">{row.requestedJobs}</td>
                  <td className="p-3 text-center">{row.approvedJobs}</td>
                  <td className="p-3 text-center">{row.requestedSeats}</td>
                  <td className="p-3 text-center">{row.approvedSeats}</td>
                  <td className="p-3 text-center font-semibold text-blue-600">{row.fulfillmentRate}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm">Page {page} of {totalPages}</p>
        <div className="space-x-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingDeploymentTable;
