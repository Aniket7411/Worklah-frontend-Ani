import React, { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { axiosInstance } from "../../lib/authInstances";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Download, RefreshCw } from "lucide-react";

const IMAGE_BASE_URL = "https://worklah.onrender.com";

interface QRCodeJob {
  _id: string;
  jobId?: string;
  qrStatus?: "Generated" | "Sent" | "Pending";
  employer?: {
    _id: string;
    name?: string;
    companyLegalName?: string;
    logo?: string;
  };
  outlet?: {
    _id: string;
    name?: string;
    location?: string;
    logo?: string;
  };
  date?: string;
  shifts?: Array<{
    startTime?: string;
    endTime?: string;
  }>;
  jobStatus?: "Active" | "Upcoming" | "Completed" | "Cancelled";
  industry?: string;
}

const QRCodeManagement: React.FC = () => {
  const [jobs, setJobs] = useState<QRCodeJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<QRCodeJob | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchQRCodeJobs();
  }, []);

  const fetchQRCodeJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/admin/jobs?limit=100&status=Active,Upcoming");
      
      if (response?.data?.jobs) {
        const jobsData = response.data.jobs.map((job: any) => ({
          _id: job?._id || "",
          jobId: job?._id?.slice(-4) || "",
          qrStatus: job?.qrStatus || "Pending",
          employer: job?.employer || {},
          outlet: job?.outlet || {},
          date: job?.date || "",
          shifts: job?.shifts || [],
          jobStatus: job?.jobStatus || "Pending",
          industry: job?.employer?.industry || "N/A",
        }));
        
        setJobs(jobsData);
        if (jobsData.length > 0 && !selectedJob) {
          setSelectedJob(jobsData[0]);
        }
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to fetch QR code jobs";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrRef.current && selectedJob) {
      const canvas = qrRef.current.querySelector("canvas");
      if (canvas) {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `QR_${selectedJob?.jobId || selectedJob?._id || "code"}.png`;
        a.click();
        toast.success("QR Code downloaded successfully");
      }
    }
  };

  const generateQRData = (job: QRCodeJob | null) => {
    if (!job) return "";
    return JSON.stringify({
      jobId: job?._id || "",
      employer: job?.employer?.name || job?.employer?.companyLegalName || "",
      outlet: job?.outlet?.name || "",
      date: job?.date || "",
      status: job?.qrStatus || "Pending",
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Generated":
        return "text-blue-500";
      case "Sent":
        return "text-green-500";
      case "Active":
        return "text-green-500";
      case "Upcoming":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="text-xl md:text-2xl font-semibold">QR Code Management</h2>
        <button
          onClick={fetchQRCodeJobs}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white p-4 shadow-md rounded-lg overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 min-w-[800px]">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left">Job ID</th>
              <th className="border p-2 text-left">QR Code Status</th>
              <th className="border p-2 text-left">QR Code</th>
              <th className="border p-2 text-left">Employer Name</th>
              <th className="border p-2 text-left">Industry</th>
              <th className="border p-2 text-left">Job Date</th>
              <th className="border p-2 text-left">First Shift</th>
              <th className="border p-2 text-left">Job Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="border p-4 text-center text-gray-500">
                  No jobs available for QR code generation
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const qrData = generateQRData(job);
                const firstShift = job?.shifts?.[0];

                return (
                  <tr
                    key={job?._id}
                    className={`text-center cursor-pointer transition-colors ${
                      selectedJob?._id === job?._id ? "bg-blue-100" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <td className="border p-2">#{job?.jobId || "N/A"}</td>
                    <td className={`border p-2 ${getStatusColor(job?.qrStatus)}`}>
                      {job?.qrStatus || "Pending"}
                    </td>
                    <td className="border p-2">
                      <QRCodeCanvas value={qrData} size={50} />
                    </td>
                    <td className="border p-2 text-left">
                      {job?.employer?.name || job?.employer?.companyLegalName || "N/A"}
                    </td>
                    <td className="border p-2 text-left">{job?.industry || "N/A"}</td>
                    <td className="border p-2">{formatDate(job?.date)}</td>
                    <td className="border p-2">
                      {firstShift?.startTime && firstShift?.endTime
                        ? `${firstShift.startTime} - ${firstShift.endTime}`
                        : "N/A"}
                    </td>
                    <td className={`border p-2 ${getStatusColor(job?.jobStatus)}`}>
                      {job?.jobStatus || "N/A"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedJob && (
        <div className="mt-6 bg-white p-4 md:p-6 shadow-md rounded-lg max-w-md mx-auto">
          <div className="flex justify-center mb-4" ref={qrRef}>
            <QRCodeCanvas value={generateQRData(selectedJob)} size={150} />
          </div>
          <div className="text-center space-y-2 mb-4">
            <p className="text-lg font-semibold">
              {selectedJob?.employer?.name || selectedJob?.employer?.companyLegalName || "N/A"}
            </p>
            <p className="text-gray-600">
              Outlet: {selectedJob?.outlet?.name || "N/A"}
            </p>
            <p className="text-gray-600">
              Date: {formatDate(selectedJob?.date)}
            </p>
            <p className="text-gray-600">
              QR Status: <span className={getStatusColor(selectedJob?.qrStatus)}>
                {selectedJob?.qrStatus || "Pending"}
              </span>
            </p>
          </div>

          <button
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            onClick={downloadQRCode}
          >
            <Download size={18} />
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodeManagement;
