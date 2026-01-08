"use client";

import { useState, useRef } from "react";
import { MoreVertical, CheckCircle, XCircle, Eye, Download, Plus, X, EyeOff, Columns } from "lucide-react";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const IMAGE_BASE_URL = "https://worklah.onrender.com";

interface Transaction {
    id?: string;
    _id?: string;
    transactionId?: string;
    shiftId?: string;
    worker?: {
        id?: string;
        name?: string;
        fullName?: string;
        profilePicture?: string;
        nric?: string;
        mobileNumber?: string;
    };
    amount?: number;
    type?: "Salary" | "Incentive" | "Referral" | "Penalty" | "Others";
    shiftDate?: string;
    dateOfShiftCompleted?: string;
    transactionDateTime?: string;
    createdAt?: string;
    status?: "Paid" | "Pending" | "Rejected";
    remarks?: string;
    rejectionReason?: string;
}

interface EnhancedPaymentsProps {
    data?: any;
}

export default function EnhancedPayments({ data }: EnhancedPaymentsProps) {
    const navigate = useNavigate();
    const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showColumnSettings, setShowColumnSettings] = useState(false);
    const [hoveredProfilePic, setHoveredProfilePic] = useState<string | null>(null);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

    // Column visibility state
    const [visibleColumns, setVisibleColumns] = useState({
        transactionId: true,
        shiftId: true,
        profilePic: true,
        fullName: true,
        nric: true,
        mobileNumber: true,
        amount: true,
        type: true,
        shiftDate: true,
        transactionDateTime: true,
        status: true,
        remarks: true,
    });

    // Transform API data
    const transactions: Transaction[] = data?.transactions || data?.payments || [];

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTransactions(transactions.map(t => t._id || t.id || ""));
        } else {
            setSelectedTransactions([]);
        }
    };

    const handleSelectTransaction = (id: string) => {
        setSelectedTransactions(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const handleApprove = async (transactionId: string) => {
        try {
            const response = await axiosInstance.put(`/admin/payments/transactions/${transactionId}/approve`);
            if (response.data?.success !== false) {
                toast.success("Transaction approved successfully");
                // Refresh data
                window.location.reload();
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to approve transaction");
        }
    };

    const handleReject = async (transactionId: string) => {
        if (!rejectionReason.trim()) {
            toast.error("Please enter a rejection reason");
            return;
        }

        try {
            const response = await axiosInstance.put(`/admin/payments/transactions/${transactionId}/reject`, {
                reason: rejectionReason,
            });
            if (response.data?.success !== false) {
                toast.success("Transaction rejected");
                setShowRejectModal(null);
                setRejectionReason("");
                window.location.reload();
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to reject transaction");
        }
    };

    const handleGeneratePayslip = async (transactionId: string) => {
        try {
            const response = await axiosInstance.post(`/admin/payments/generate-payslip/${transactionId}`);
            if (response.data?.success !== false) {
                // Download payslip
                const payslipUrl = response.data.payslipUrl || response.data.url;
                if (payslipUrl) {
                    window.open(payslipUrl, "_blank");
                    toast.success("Payslip generated successfully");
                }
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to generate payslip");
        }
    };

    const handleBulkApprove = async () => {
        if (selectedTransactions.length === 0) {
            toast.error("Please select at least one transaction");
            return;
        }

        try {
            const response = await axiosInstance.post("/admin/payments/transactions/bulk-approve", {
                transactionIds: selectedTransactions,
            });
            if (response.data?.success !== false) {
                toast.success(`${selectedTransactions.length} transactions approved`);
                setSelectedTransactions([]);
                window.location.reload();
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to approve transactions");
        }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} />
                        Add New Transaction
                    </button>
                    {selectedTransactions.length > 0 && (
                        <button
                            onClick={handleBulkApprove}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <CheckCircle size={18} />
                            Approve Selected ({selectedTransactions.length})
                        </button>
                    )}
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowColumnSettings(!showColumnSettings)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <Columns size={18} />
                        Columns
                    </button>
                    {showColumnSettings && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50 p-4">
                            <h4 className="font-semibold mb-3">Visible Columns</h4>
                            {Object.entries(visibleColumns).map(([key, visible]) => (
                                <label key={key} className="flex items-center gap-2 mb-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={visible}
                                        onChange={(e) => setVisibleColumns(prev => ({ ...prev, [key]: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                {visibleColumns.transactionId && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                                )}
                                {visibleColumns.shiftId && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift ID</th>
                                )}
                                {visibleColumns.profilePic && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile</th>
                                )}
                                {visibleColumns.fullName && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                                )}
                                {visibleColumns.nric && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NRIC</th>
                                )}
                                {visibleColumns.mobileNumber && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile Number</th>
                                )}
                                {visibleColumns.amount && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                )}
                                {visibleColumns.type && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                )}
                                {visibleColumns.shiftDate && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date of Shift Completed</th>
                                )}
                                {visibleColumns.transactionDateTime && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction DateTime</th>
                                )}
                                {visibleColumns.status && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                )}
                                {visibleColumns.remarks && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                                )}
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => {
                                    const worker = transaction.worker || {};
                                    const profilePic = worker.profilePicture || "";
                                    const isSelected = selectedTransactions.includes(transaction._id || transaction.id || "");

                                    return (
                                        <tr key={transaction._id || transaction.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectTransaction(transaction._id || transaction.id || "")}
                                                    className="rounded border-gray-300"
                                                />
                                            </td>
                                            {visibleColumns.transactionId && (
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                    {transaction.transactionId || transaction._id?.slice(-8) || "N/A"}
                                                </td>
                                            )}
                                            {visibleColumns.shiftId && (
                                                <td className="px-4 py-4 text-sm">
                                                    <button
                                                        onClick={() => navigate(`/jobs/${transaction.shiftId}`)}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {transaction.shiftId?.slice(-6) || "N/A"}
                                                    </button>
                                                </td>
                                            )}
                                            {visibleColumns.profilePic && (
                                                <td className="px-4 py-4">
                                                    {profilePic && (
                                                        <div
                                                            className="relative"
                                                            onMouseEnter={(e) => {
                                                                setHoveredProfilePic(transaction._id || transaction.id || "");
                                                                setHoverPosition({ x: e.clientX, y: e.clientY });
                                                            }}
                                                            onMouseLeave={() => setHoveredProfilePic(null)}
                                                            onMouseMove={(e) => setHoverPosition({ x: e.clientX, y: e.clientY })}
                                                        >
                                                            <img
                                                                src={profilePic.startsWith("http") ? profilePic : `${IMAGE_BASE_URL}${profilePic}`}
                                                                alt="Profile"
                                                                className="h-10 w-10 rounded-full object-cover cursor-pointer"
                                                            />
                                                            {hoveredProfilePic === (transaction._id || transaction.id) && (
                                                                <div
                                                                    className="fixed z-50 pointer-events-none"
                                                                    style={{ left: hoverPosition.x + 10, top: hoverPosition.y + 10 }}
                                                                >
                                                                    <img
                                                                        src={profilePic.startsWith("http") ? profilePic : `${IMAGE_BASE_URL}${profilePic}`}
                                                                        alt="Profile"
                                                                        className="h-32 w-32 rounded-lg object-cover border-2 border-white shadow-lg"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                            {visibleColumns.fullName && (
                                                <td className="px-4 py-4 text-sm">
                                                    <button
                                                        onClick={() => navigate(`/hustle-heroes/${worker.id}`)}
                                                        className="text-blue-600 hover:underline font-medium"
                                                    >
                                                        {worker.fullName || worker.name || "N/A"}
                                                    </button>
                                                </td>
                                            )}
                                            {visibleColumns.nric && (
                                                <td className="px-4 py-4 text-sm text-gray-600">{worker.nric || "N/A"}</td>
                                            )}
                                            {visibleColumns.mobileNumber && (
                                                <td className="px-4 py-4 text-sm text-gray-600">{worker.mobileNumber || "N/A"}</td>
                                            )}
                                            {visibleColumns.amount && (
                                                <td className="px-4 py-4 text-sm font-semibold">
                                                    ${typeof transaction.amount === "number" ? transaction.amount.toFixed(2) : transaction.amount || "0.00"}
                                                </td>
                                            )}
                                            {visibleColumns.type && (
                                                <td className="px-4 py-4 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === "Salary" ? "bg-blue-100 text-blue-800" :
                                                        transaction.type === "Incentive" ? "bg-green-100 text-green-800" :
                                                            transaction.type === "Penalty" ? "bg-red-100 text-red-800" :
                                                                "bg-gray-100 text-gray-800"
                                                        }`}>
                                                        {transaction.type || "Salary"}
                                                    </span>
                                                </td>
                                            )}
                                            {visibleColumns.shiftDate && (
                                                <td className="px-4 py-4 text-sm text-gray-600">
                                                    {transaction.dateOfShiftCompleted || transaction.shiftDate
                                                        ? new Date(transaction.dateOfShiftCompleted || transaction.shiftDate).toLocaleDateString()
                                                        : transaction.type === "Incentive" ? "-" : "N/A"}
                                                </td>
                                            )}
                                            {visibleColumns.transactionDateTime && (
                                                <td className="px-4 py-4 text-sm text-gray-600">
                                                    {transaction.transactionDateTime || transaction.createdAt
                                                        ? new Date(transaction.transactionDateTime || transaction.createdAt).toLocaleString()
                                                        : "N/A"}
                                                </td>
                                            )}
                                            {visibleColumns.status && (
                                                <td className="px-4 py-4 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === "Paid" ? "bg-green-100 text-green-800" :
                                                        transaction.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                                            "bg-red-100 text-red-800"
                                                        }`}>
                                                        {transaction.status || "Pending"}
                                                    </span>
                                                </td>
                                            )}
                                            {visibleColumns.remarks && (
                                                <td className="px-4 py-4 text-sm text-gray-600">{transaction.remarks || "-"}</td>
                                            )}
                                            <td className="px-4 py-4 text-center sticky right-0 bg-white">
                                                <div className="flex items-center justify-center gap-2">
                                                    {transaction.status === "Pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(transaction._id || transaction.id || "")}
                                                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setShowRejectModal(transaction._id || transaction.id || "")}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                                title="Reject"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {transaction.status === "Paid" && (
                                                        <button
                                                            onClick={() => handleGeneratePayslip(transaction._id || transaction.id || "")}
                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                            title="Generate Payslip"
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Transaction Modal */}
            {showAddModal && (
                <AddTransactionModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        window.location.reload();
                    }}
                />
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Reject Transaction</h3>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(null);
                                    setRejectionReason("");
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReject(showRejectModal)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add Transaction Modal Component
function AddTransactionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [nric, setNric] = useState("");
    const [workerData, setWorkerData] = useState<any>(null);
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"Salary" | "Incentive" | "Referral" | "Penalty" | "Others">("Salary");
    const [shiftDate, setShiftDate] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSearchByNRIC = async () => {
        if (!nric.trim()) {
            toast.error("Please enter NRIC");
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.get(`/admin/users?search=${nric}&nric=${nric}`);
            if (response.data?.success !== false && response.data?.users?.length > 0) {
                setWorkerData(response.data.users[0]);
            } else {
                toast.error("Worker not found");
                setWorkerData(null);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to find worker");
            setWorkerData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!workerData || !amount || !type) {
            toast.error("Please fill all required fields");
            return;
        }

        if (type !== "Incentive" && !shiftDate) {
            toast.error("Shift date is required for this transaction type");
            return;
        }

        try {
            setLoading(true);
            const response = await axiosInstance.post("/admin/payments/transactions", {
                userId: workerData._id || workerData.id,
                amount: parseFloat(amount),
                type: type,
                shiftDate: shiftDate || null,
                dateOfShiftCompleted: shiftDate || null,
            });

            if (response.data?.success !== false) {
                toast.success("Transaction created successfully");
                onSuccess();
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to create transaction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Add New Transaction</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search by NRIC <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nric}
                                onChange={(e) => setNric(e.target.value)}
                                placeholder="Enter NRIC"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                                onClick={handleSearchByNRIC}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {loading ? "..." : "Search"}
                            </button>
                        </div>
                    </div>

                    {workerData && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <p className="font-semibold">Name: {workerData.fullName || workerData.name}</p>
                            <p className="text-sm">NRIC: {workerData.nric || workerData.icNumber}</p>
                            <p className="text-sm">Mobile: {workerData.mobileNumber || workerData.phoneNumber || "N/A"}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount (SGD) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="Salary">Salary</option>
                            <option value="Incentive">Incentive</option>
                            <option value="Referral">Referral</option>
                            <option value="Penalty">Penalty</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>

                    {type !== "Incentive" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Shift Completed <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={shiftDate}
                                onChange={(e) => setShiftDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    )}

                    {type === "Incentive" && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm">
                            Note: Shift date is not required for Incentive transactions.
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !workerData || !amount}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Transaction"}
                    </button>
                </div>
            </div>
        </div>
    );
}

