import React, { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { axiosInstance } from "../../lib/authInstances";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Download, RefreshCw, Plus, Search, Printer, Filter, X, Eye } from "lucide-react";
import { useReactToPrint } from "react-to-print";

const IMAGE_BASE_URL = "https://worklah.onrender.com";

interface Employer {
  _id: string;
  employerId?: string;
  companyLegalName?: string;
  companyLogo?: string;
  industry?: string;
  outlets?: Outlet[];
}

interface Outlet {
  _id: string;
  outletName?: string;
  name?: string;
  outletAddress?: string;
  address?: string;
  contactNumber?: string;
}

interface QRCode {
  _id?: string; // MongoDB ID (from backend)
  id?: string; // Composite ID (for local use)
  qrCodeId: string; // Format: {employerId}-{outletId} (e.g., "A-1", "B-2")
  employerId: string;
  employerName: string;
  outletId: string;
  outletName: string;
  outletAddress: string;
  employer: Employer;
  outlet: Outlet;
  generatedAt?: string;
  status?: "Active" | "Inactive";
}

const QRCodeManagement: React.FC = () => {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEmployerFilter, setSelectedEmployerFilter] = useState<string>("all");
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [selectedEmployerForGen, setSelectedEmployerForGen] = useState<string>("");
  const [selectedOutletForGen, setSelectedOutletForGen] = useState<string>("");
  const [selectedJobForGen, setSelectedJobForGen] = useState<string>("");
  const [jobsForGen, setJobsForGen] = useState<any[]>([]);
  const [jobFilterId, setJobFilterId] = useState<string>("");
  const qrRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEmployers();
  }, []);

  useEffect(() => {
    fetchQRCodes();
  }, [jobFilterId]);

  const fetchEmployers = async () => {
    try {
      const response = await axiosInstance.get("/admin/employers?limit=100");
      if (response.data?.success !== false && response.data?.employers) {
        setEmployers(response.data.employers);
      }
    } catch (err) {
      console.error("Error fetching employers:", err);
    }
  };

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (jobFilterId) params.set("jobId", jobFilterId);
      const url = `/admin/qr-codes${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await axiosInstance.get(url);
      if (response?.data?.success !== false && response?.data?.qrCodes) {
        setQrCodes(response.data.qrCodes);
      } else if (response?.data?.success !== false && response?.data?.barcodes) {
        setQrCodes(response.data.barcodes);
      } else {
        await generateQRCodesFromEmployers();
      }
    } catch (err: any) {
      if (jobFilterId) setJobFilterId("");
      await generateQRCodesFromEmployers();
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodesFromEmployers = async () => {
    try {
      const response = await axiosInstance.get("/admin/employers?limit=100");
      if (response.data?.success !== false && response.data?.employers) {
        const allQRCodes: QRCode[] = [];

        response.data.employers.forEach((employer: any, empIndex: number) => {
          const employerId = employer.employerId || employer._id || `EMP${empIndex + 1}`;
          const employerLetter = String.fromCharCode(65 + empIndex); // A, B, C...

          if (employer.outlets && Array.isArray(employer.outlets) && employer.outlets.length > 0) {
            employer.outlets.forEach((outlet: any, outletIndex: number) => {
              const qrCodeId = `${employerLetter}-${outletIndex + 1}`;
              allQRCodes.push({
                id: `${employer._id}-${outlet._id}`,
                qrCodeId: qrCodeId,
                employerId: employer._id,
                employerName: employer.companyLegalName || employer.name || "N/A",
                outletId: outlet._id,
                outletName: outlet.outletName || outlet.name || `Outlet ${outletIndex + 1}`,
                outletAddress: outlet.outletAddress || outlet.address || "N/A",
                employer: employer,
                outlet: outlet,
                status: "Active"
              });
            });
          }
        });

        setQrCodes(allQRCodes);
      }
    } catch (err: any) {
      console.error("Error generating QR codes:", err);
      toast.error("Failed to load QR codes");
    }
  };

  const generateQRCodeId = (employerId: string, outletId: string): string => {
    // Find employer index
    const empIndex = employers.findIndex(emp => (emp._id === employerId || emp.employerId === employerId));
    const employerLetter = empIndex >= 0 ? String.fromCharCode(65 + empIndex) : "X";

    // Find outlet index for this employer
    const employer = employers.find(emp => (emp._id === employerId || emp.employerId === employerId));
    if (employer?.outlets) {
      const outletIndex = employer.outlets.findIndex(out => out._id === outletId);
      const outletNumber = outletIndex >= 0 ? outletIndex + 1 : 1;
      return `${employerLetter}-${outletNumber}`;
    }
    return `${employerLetter}-1`;
  };

  const generateQRData = (qrCode: QRCode | null): string => {
    if (!qrCode) return "";
    return JSON.stringify({
      qrCodeId: qrCode.qrCodeId,
      employerId: qrCode.employerId,
      outletId: qrCode.outletId,
      employerName: qrCode.employerName,
      outletName: qrCode.outletName,
      outletAddress: qrCode.outletAddress,
    });
  };

  const downloadQRCode = (qrCode?: QRCode) => {
    const targetQR = qrCode || selectedQRCode;
    if (!targetQR) return;

    if (qrRef.current) {
      const canvas = qrRef.current.querySelector("canvas");
      if (canvas) {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `QR_${targetQR.qrCodeId}_${targetQR.employerName.replace(/\s+/g, "_")}.png`;
        a.click();
        toast.success("QR Code downloaded successfully");
      }
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `QR_Code_${selectedQRCode?.qrCodeId || "print"}`,
  });

  const fetchJobsForOutlet = async (employerId: string, outletId: string) => {
    try {
      const response = await axiosInstance.get(`/admin/jobs?employerId=${employerId}&outletId=${outletId}&limit=100`);
      if (response.data?.jobs && Array.isArray(response.data.jobs)) {
        setJobsForGen(response.data.jobs);
      } else {
        setJobsForGen([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobsForGen([]);
    }
  };

  const handleGenerateQRCode = async () => {
    if (!selectedEmployerForGen || !selectedOutletForGen || !selectedJobForGen) {
      toast.error("Please select employer, outlet, and job");
      return;
    }

    try {
      const response = await axiosInstance.post("/admin/qr-codes/generate", {
        employerId: selectedEmployerForGen,
        outletId: selectedOutletForGen,
        jobId: selectedJobForGen,
      });

      if (response.data?.success !== false) {
        toast.success("QR Code generated successfully");
        setShowGenerateModal(false);
        setSelectedEmployerForGen("");
        setSelectedOutletForGen("");
        setSelectedJobForGen("");
        setJobsForGen([]);
        fetchQRCodes();
      } else {
        throw new Error(response.data?.message || "Failed to generate QR code");
      }
    } catch (err: any) {
      // If API doesn't exist yet, create locally
      const employer = employers.find(emp => emp._id === selectedEmployerForGen);
      const outlet = employer?.outlets?.find(out => out._id === selectedOutletForGen);

      if (employer && outlet) {
        const qrCodeId = generateQRCodeId(selectedEmployerForGen, selectedOutletForGen);
        const newQRCode: QRCode = {
          id: `${selectedEmployerForGen}-${selectedOutletForGen}`,
          qrCodeId: qrCodeId,
          employerId: selectedEmployerForGen,
          employerName: employer.companyLegalName || "N/A",
          outletId: selectedOutletForGen,
          outletName: outlet.outletName || outlet.name || "N/A",
          outletAddress: outlet.outletAddress || outlet.address || "N/A",
          employer: employer,
          outlet: outlet,
          status: "Active",
          generatedAt: new Date().toISOString(),
        };

        setQrCodes(prev => [...prev.filter(qr => qr.id !== newQRCode.id), newQRCode]);
        toast.success("QR Code generated successfully");
        setShowGenerateModal(false);
        setSelectedEmployerForGen("");
        setSelectedOutletForGen("");
        setSelectedJobForGen("");
        setJobsForGen([]);
      }
    }
  };

  const handleDeleteQRCode = async (qrCodeIdOrId: string) => {
    if (!confirm("Are you sure you want to delete this QR code?")) return;

    try {
      // Use _id if available (from backend), otherwise use the provided ID
      const qrCode = qrCodes.find(qr => qr._id === qrCodeIdOrId || qr.id === qrCodeIdOrId || qr.qrCodeId === qrCodeIdOrId);
      const deleteId = qrCode?._id || qrCodeIdOrId;

      const response = await axiosInstance.delete(`/admin/qr-codes/${deleteId}`).catch(() => null);

      if (response?.data?.success !== false) {
        toast.success("QR Code deleted successfully");
        // Remove from local state
        setQrCodes(prev => prev.filter(qr => qr._id !== deleteId && qr.id !== qrCodeIdOrId));
      } else {
        // Delete locally if API doesn't exist
        setQrCodes(prev => prev.filter(qr => qr.id !== qrCodeIdOrId && qr._id !== deleteId));
        toast.success("QR Code deleted successfully");
      }

      fetchQRCodes();
      if (selectedQRCode?.id === qrCodeIdOrId || selectedQRCode?._id === deleteId) {
        setSelectedQRCode(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete QR code");
    }
  };

  const filteredQRCodes = qrCodes.filter(qr => {
    const matchesSearch = searchQuery === "" ||
      qr.employerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.outletName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.qrCodeId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEmployer = selectedEmployerFilter === "all" || qr.employerId === selectedEmployerFilter;

    return matchesSearch && matchesEmployer;
  });

  const getSelectedEmployerOutlets = () => {
    if (!selectedEmployerForGen) return [];
    const employer = employers.find(emp => emp._id === selectedEmployerForGen || emp.employerId === selectedEmployerForGen);
    return employer?.outlets || [];
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">QR Code Management</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Generate QR Code
          </button>
          <button
            onClick={fetchQRCodes}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by employer, outlet, or QR code ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-64">
            <select
              value={selectedEmployerFilter}
              onChange={(e) => setSelectedEmployerFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Employers</option>
              {employers.map((employer) => (
                <option key={employer._id} value={employer._id}>
                  {employer.companyLegalName || employer.employerId || "Unknown"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* QR Codes Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQRCodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    {searchQuery || selectedEmployerFilter !== "all"
                      ? "No QR codes found matching your filters"
                      : "No QR codes generated yet. Click 'Generate QR Code' to create one."}
                  </td>
                </tr>
              ) : (
                filteredQRCodes.map((qr) => (
                  <tr
                    key={qr.id}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedQRCode?.id === qr.id ? "bg-blue-50" : ""
                      }`}
                    onClick={() => setSelectedQRCode(qr)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-blue-600">{qr.qrCodeId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <QRCodeCanvas value={generateQRData(qr)} size={60} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {qr.employer?.companyLogo && (
                          <img
                            src={qr.employer.companyLogo.startsWith("http") ? qr.employer.companyLogo : `${IMAGE_BASE_URL}${qr.employer.companyLogo}`}
                            alt="Logo"
                            className="w-8 h-8 rounded object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        )}
                        <span className="text-sm font-medium text-gray-900">{qr.employerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{qr.outletName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{qr.outletAddress}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${qr.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                        {qr.status || "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadQRCode(qr);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQRCode(qr);
                            setTimeout(() => handlePrint(), 100);
                          }}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Print"
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQRCode(qr._id || qr.id || qr.qrCodeId);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected QR Code Preview */}
      {selectedQRCode && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
          <div className="flex justify-center mb-4" ref={qrRef}>
            <QRCodeCanvas value={generateQRData(selectedQRCode)} size={200} />
          </div>
          <div className="text-center space-y-2 mb-4">
            <p className="text-lg font-bold text-gray-900">QR Code: {selectedQRCode.qrCodeId}</p>
            <p className="text-md font-semibold text-gray-700">{selectedQRCode.employerName}</p>
            <p className="text-sm text-gray-600">Outlet: {selectedQRCode.outletName}</p>
            <p className="text-xs text-gray-500">{selectedQRCode.outletAddress}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => downloadQRCode()}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={18} />
              Download
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Printer size={18} />
              Print
            </button>
          </div>
        </div>
      )}

      {/* Print Component (Hidden) */}
      <div style={{ display: "none" }}>
        <div ref={printRef} className="p-8">
          {selectedQRCode && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">Attendance QR Code</h1>
                <QRCodeCanvas value={generateQRData(selectedQRCode)} size={300} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">QR Code ID: {selectedQRCode.qrCodeId}</p>
                <p className="text-md">Employer: {selectedQRCode.employerName}</p>
                <p className="text-md">Outlet: {selectedQRCode.outletName}</p>
                <p className="text-sm text-gray-600">{selectedQRCode.outletAddress}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Generate QR Code Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Generate QR Code</h3>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setSelectedEmployerForGen("");
                  setSelectedOutletForGen("");
                  setSelectedJobForGen("");
                  setJobsForGen([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employer <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEmployerForGen}
                  onChange={(e) => {
                    setSelectedEmployerForGen(e.target.value);
                    setSelectedOutletForGen("");
                    setSelectedJobForGen("");
                    setJobsForGen([]);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Employer</option>
                  {employers.map((employer) => (
                    <option key={employer._id} value={employer._id}>
                      {employer.companyLegalName || employer.employerId || "Unknown"}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEmployerForGen && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Outlet <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedOutletForGen}
                    onChange={async (e) => {
                      setSelectedOutletForGen(e.target.value);
                      setSelectedJobForGen("");
                      if (e.target.value && selectedEmployerForGen) {
                        await fetchJobsForOutlet(selectedEmployerForGen, e.target.value);
                      } else {
                        setJobsForGen([]);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Outlet</option>
                    {getSelectedEmployerOutlets().map((outlet) => (
                      <option key={outlet._id} value={outlet._id}>
                        {outlet.outletName || outlet.name || "Unknown"} - {outlet.outletAddress || outlet.address || ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedEmployerForGen && selectedOutletForGen && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Job <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedJobForGen}
                    onChange={(e) => setSelectedJobForGen(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Job</option>
                    {jobsForGen.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.jobTitle || job.jobName || "Unknown"} - {job.jobDate ? new Date(job.jobDate).toLocaleDateString() : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!selectedEmployerForGen && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                  Please select an employer to see available outlets.
                </div>
              )}

              {selectedEmployerForGen && getSelectedEmployerOutlets().length === 0 && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                  This employer has no outlets. Please add outlets first.
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setSelectedEmployerForGen("");
                  setSelectedOutletForGen("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateQRCode}
                disabled={!selectedEmployerForGen || !selectedOutletForGen || !selectedJobForGen}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Generate QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeManagement;
