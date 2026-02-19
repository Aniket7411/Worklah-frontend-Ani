import { useState, useRef, useEffect } from "react";
import { MoreVertical, CheckCircle, XCircle, Eye, Download, Plus, X, EyeOff, Columns, CreditCard, RotateCcw, Loader2, Pencil } from "lucide-react";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import StripePaymentModal from "./StripePaymentModal";
import { getProfilePicUrl } from "../../utils/avatarUtils";

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
    totalAmount?: number;
    type?: "Salary" | "Incentive" | "Referral" | "Penalty" | "Others";
    shiftDate?: string;
    dateOfShiftCompleted?: string;
    transactionDateTime?: string;
    createdAt?: string;
    status?: "Paid" | "Pending" | "Rejected" | "Completed" | "Processing" | "Refunded";
    remarks?: string;
    rejectionReason?: string;
    /** Set when payment was made via Stripe; required to show Refund */
    paymentIntentId?: string;
    currency?: string;
    shift?: Record<string, unknown>;
    payment?: { startTime?: string; endTime?: string; breakDuration?: number; penaltyAmount?: number; totalAmount?: number };
    startTime?: string;
    endTime?: string;
    breakDuration?: number;
    penaltyAmount?: number;
}

interface StripeConfig {
    stripeEnabled: boolean;
    publishableKey?: string;
}

interface EnhancedPaymentsProps {
    data?: any;
    onRefresh?: () => void;
}

function getStripeErrorMessage(err: any): string {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const code = data?.code;
    const message = data?.message;
    if (status === 400) return message || "Invalid request.";
    if (status === 404) return "Payment / transaction not found.";
    if (status === 503 || code === "STRIPE_NOT_CONFIGURED")
        return "Payments are not configured. Contact support.";
    if (status === 500) return "Something went wrong. Please try again.";
    return message || err?.message || "Request failed.";
}

export default function EnhancedPayments({ data, onRefresh }: EnhancedPaymentsProps) {
    const navigate = useNavigate();
    const [stripeConfig, setStripeConfig] = useState<StripeConfig>({ stripeEnabled: false });
    const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showColumnSettings, setShowColumnSettings] = useState(false);
    const [hoveredProfilePic, setHoveredProfilePic] = useState<string | null>(null);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
    const [stripePayment, setStripePayment] = useState<{
        clientSecret: string;
        amount: number;
        currency: string;
        transactionId: string;
    } | null>(null);
    const [refundingId, setRefundingId] = useState<string | null>(null);
    const [editModalTransaction, setEditModalTransaction] = useState<Transaction | null>(null);
    const [regenerateForm, setRegenerateForm] = useState({ startTime: "", endTime: "", breakDuration: 0.5, penaltyAmount: 0 });
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const [refundModal, setRefundModal] = useState<{ id: string; reason: string } | null>(null);

    useEffect(() => {
        let cancelled = false;
        axiosInstance
            .get("/stripe/config")
            .then((res) => {
                if (cancelled) return;
                if (res.data?.success !== false && res.data?.stripeEnabled) {
                    setStripeConfig({
                        stripeEnabled: true,
                        publishableKey: res.data.publishableKey || "",
                    });
                }
            })
            .catch(() => {
                if (!cancelled) setStripeConfig({ stripeEnabled: false });
            });
        return () => { cancelled = true; };
    }, []);

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
                const remaining = response.data?.remainingToDeduct;
                const msg =
                    remaining != null && remaining > 0
                        ? `Credit released to worker's wallet. Remaining to deduct from next credit: $${Number(remaining).toFixed(2)}`
                        : "Credit released to worker's wallet.";
                toast.success(msg, { duration: 4000 });
                refreshList();
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
                onRefresh ? onRefresh() : window.location.reload();
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to reject transaction");
        }
    };

    const handlePayWithCard = async (transaction: Transaction) => {
        const transactionId = transaction._id || transaction.id || transaction.transactionId || "";
        const amount = typeof transaction.amount === "number" ? transaction.amount : Number(transaction.totalAmount) || 0;
        const currency = (transaction.currency || "SGD").toUpperCase();

        try {
            const response = await axiosInstance.post("/stripe/create-payment-intent", {
                paymentId: transactionId,
                amount: amount || undefined,
                currency: currency === "MYR" ? "MYR" : "SGD",
            });
            if (response.data?.success === false) {
                toast.error(response.data?.message || "Failed to create payment");
                return;
            }
            const clientSecret = response.data?.clientSecret;
            if (!clientSecret) {
                toast.error("Invalid response from server");
                return;
            }
            setStripePayment({
                clientSecret,
                amount: response.data?.amount ?? amount,
                currency: response.data?.currency ?? currency,
                transactionId,
            });
        } catch (err: any) {
            toast.error(getStripeErrorMessage(err));
        }
    };

    const handleRefundClick = (transactionId: string) => {
        setRefundModal({ id: transactionId, reason: "" });
    };

    const handleRefundConfirm = async () => {
        if (!refundModal) return;
        const { id, reason } = refundModal;
        setRefundingId(id);
        try {
            const response = await axiosInstance.post(`/admin/payments/transactions/${id}/refund`, {
                reason: reason.trim() || undefined,
            });
            if (response.data?.success !== false) {
                const remaining = response.data?.remainingToDeduct;
                toast.success(
                    remaining != null && remaining > 0
                        ? (response.data?.message || "Refund initiated.") + " The rest will be deducted from the worker's next credit."
                        : response.data?.message || "Refund initiated successfully",
                    { duration: 5000 }
                );
                setRefundModal(null);
                refreshList();
            }
        } catch (err: any) {
            toast.error(getStripeErrorMessage(err));
        } finally {
            setRefundingId(null);
        }
    };

    const handleRegenerate = async () => {
        if (!editModalTransaction) return;
        const paymentId = editModalTransaction._id || editModalTransaction.id || "";
        if (!regenerateForm.startTime || !regenerateForm.endTime) {
            toast.error("Start time and end time are required");
            return;
        }
        setRegeneratingId(paymentId);
        try {
            const response = await axiosInstance.post(`/admin/transactions/${paymentId}/regenerate`, {
                startTime: regenerateForm.startTime,
                endTime: regenerateForm.endTime,
                breakDuration: regenerateForm.breakDuration ?? 0,
                penaltyAmount: regenerateForm.penaltyAmount ?? 0,
            });
            if (response.data?.success !== false) {
                toast.success("Payment updated. You can now approve to release credit.");
                setEditModalTransaction(null);
                setRegenerateForm({ startTime: "", endTime: "", breakDuration: 0.5, penaltyAmount: 0 });
                refreshList();
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update payment");
        } finally {
            setRegeneratingId(null);
        }
    };

    const refreshList = () => {
        setStripePayment(null);
        onRefresh ? onRefresh() : window.location.reload();
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
                refreshList();
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
                                    const profilePic = getProfilePicUrl(worker.profilePicture);
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
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        transaction.status === "Paid" || transaction.status === "Completed"
                                                            ? "bg-green-100 text-green-800"
                                                            : transaction.status === "Refunded"
                                                                ? "bg-gray-100 text-gray-800"
                                                                : transaction.status === "Pending" || transaction.status === "Processing"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-red-100 text-red-800"
                                                    }`}>
                                                        {transaction.status || "Pending"}
                                                    </span>
                                                </td>
                                            )}
                                            {visibleColumns.remarks && (
                                                <td className="px-4 py-4 text-sm text-gray-600">{transaction.remarks || "-"}</td>
                                            )}
                                            <td className="px-4 py-4 text-center sticky right-0 bg-white">
                                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                                    {(transaction.status === "Pending" || transaction.status === "Processing") && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    const pay = transaction.payment;
                                                                    const st = (transaction as any).startTime || pay?.startTime;
                                                                    const et = (transaction as any).endTime || pay?.endTime;
                                                                    setRegenerateForm({
                                                                        startTime: st || "",
                                                                        endTime: et || "",
                                                                        breakDuration: (transaction as any).breakDuration ?? transaction.payment?.breakDuration ?? 0.5,
                                                                        penaltyAmount: (transaction as any).penaltyAmount ?? transaction.payment?.penaltyAmount ?? 0,
                                                                    });
                                                                    setEditModalTransaction(transaction);
                                                                }}
                                                                className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                                                title="Edit / Regenerate"
                                                            >
                                                                <Pencil size={18} />
                                                            </button>
                                                            {stripeConfig.stripeEnabled && (
                                                                <button
                                                                    onClick={() => handlePayWithCard(transaction)}
                                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                                    title="Pay with card"
                                                                >
                                                                    <CreditCard size={18} />
                                                                </button>
                                                            )}
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
                                                    {(transaction.status === "Paid" || transaction.status === "Completed") && (
                                                        <>
                                                            <button
                                                                onClick={() => handleGeneratePayslip(transaction._id || transaction.id || "")}
                                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                                title="Generate Payslip"
                                                            >
                                                                <Download size={18} />
                                                            </button>
                                                            {stripeConfig.stripeEnabled && (transaction.paymentIntentId || true) && (
                                                                <button
                                                                    onClick={() => handleRefundClick(transaction._id || transaction.id || "")}
                                                                    disabled={!!refundingId}
                                                                    className="p-1 text-amber-600 hover:bg-amber-50 rounded disabled:opacity-50"
                                                                    title="Refund (Stripe)"
                                                                >
                                                                    {refundingId === (transaction._id || transaction.id) ? (
                                                                        <Loader2 size={18} className="animate-spin" />
                                                                    ) : (
                                                                        <RotateCcw size={18} />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    {transaction.status === "Refunded" && (
                                                        <span className="text-xs text-gray-500">Refunded</span>
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

            {/* Stripe Pay with card modal */}
            {stripePayment && stripeConfig.publishableKey && (
                <StripePaymentModal
                    publishableKey={stripeConfig.publishableKey}
                    clientSecret={stripePayment.clientSecret}
                    amount={stripePayment.amount}
                    currency={stripePayment.currency}
                    onSuccess={refreshList}
                    onClose={() => setStripePayment(null)}
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

            {/* Edit / Regenerate Modal */}
            {editModalTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setEditModalTransaction(null)}>
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Edit / Regenerate Payment</h3>
                            <button onClick={() => setEditModalTransaction(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Update times and optional break/penalty, then submit to regenerate. After that you can Approve to release credit.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                                <input
                                    type="time"
                                    value={regenerateForm.startTime}
                                    onChange={(e) => setRegenerateForm((f) => ({ ...f, startTime: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
                                <input
                                    type="time"
                                    value={regenerateForm.endTime}
                                    onChange={(e) => setRegenerateForm((f) => ({ ...f, endTime: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Break duration (hours)</label>
                                <input
                                    type="number"
                                    min={0}
                                    step={0.25}
                                    value={regenerateForm.breakDuration}
                                    onChange={(e) => setRegenerateForm((f) => ({ ...f, breakDuration: parseFloat(e.target.value) || 0 }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Penalty amount (SGD)</label>
                                <input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={regenerateForm.penaltyAmount}
                                    onChange={(e) => setRegenerateForm((f) => ({ ...f, penaltyAmount: parseFloat(e.target.value) || 0 }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setEditModalTransaction(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
                                Cancel
                            </button>
                            <button
                                onClick={handleRegenerate}
                                disabled={regeneratingId !== null || !regenerateForm.startTime || !regenerateForm.endTime}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {regeneratingId ? "Updating..." : "Update & Regenerate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Refund confirmation modal */}
            {refundModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setRefundModal(null)}>
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-2">Refund transaction</h3>
                        <p className="text-sm text-gray-600 mb-4">Refund this transaction? The worker&apos;s wallet will be debited.</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                            <input
                                type="text"
                                value={refundModal.reason}
                                onChange={(e) => setRefundModal((m) => m ? { ...m, reason: e.target.value } : null)}
                                placeholder="e.g. Duplicate payment"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setRefundModal(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
                                Cancel
                            </button>
                            <button
                                onClick={handleRefundConfirm}
                                disabled={!!refundingId}
                                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                            >
                                {refundingId ? "Refunding..." : "Refund"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add Transaction Modal – POST /admin/payments/transactions
// Required: userId, jobId, shiftDate, startTime, endTime, rateType, rates, totalAmount
// Optional: breakDuration, totalWorkingHours, penaltyAmount
function AddTransactionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [nric, setNric] = useState("");
    const [workerData, setWorkerData] = useState<any>(null);
    const [jobId, setJobId] = useState("");
    const [jobOptions, setJobOptions] = useState<{ _id: string; jobTitle?: string; jobId?: string }[]>([]);
    const [shiftDate, setShiftDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [rateType, setRateType] = useState<"Hourly" | "Weekly" | "Monthly">("Hourly");
    const [rates, setRates] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [breakDuration, setBreakDuration] = useState("");
    const [totalWorkingHours, setTotalWorkingHours] = useState("");
    const [penaltyAmount, setPenaltyAmount] = useState("");
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

    const loadJobs = async () => {
        try {
            const response = await axiosInstance.get("/admin/jobs?limit=100");
            const list = response.data?.jobs ?? response.data?.data ?? [];
            setJobOptions(Array.isArray(list) ? list : []);
        } catch {
            setJobOptions([]);
        }
    };

    const handleSubmit = async () => {
        const userId = workerData?._id || workerData?.id;
        if (!userId || !jobId.trim()) {
            toast.error("Worker and Job are required");
            return;
        }
        if (!shiftDate || !startTime || !endTime) {
            toast.error("Shift date, start time and end time are required");
            return;
        }
        const rateNum = parseFloat(rates);
        const totalNum = parseFloat(totalAmount);
        if (isNaN(rateNum) || rateNum < 0 || isNaN(totalNum) || totalNum < 0) {
            toast.error("Valid rate and total amount are required");
            return;
        }

        try {
            setLoading(true);
            // NEW_END_TO_END_API_DOCUMENTATION.md §7.2: nric, jobId, shiftDate, startTime, endTime, breakDuration, penaltyAmount, totalAmount, type, remarks
            const body: Record<string, unknown> = {
                userId,
                nric: (workerData?.nric || workerData?.icNumber || nric || "").trim() || undefined,
                jobId: jobId.trim(),
                shiftDate,
                startTime,
                endTime,
                rateType,
                rates: rateNum,
                totalAmount: totalNum,
                type: "Salary",
                remarks: "",
            };
            if (breakDuration.trim() !== "") {
                const br = parseFloat(breakDuration);
                if (!isNaN(br) && br >= 0) body.breakDuration = br;
            }
            if (totalWorkingHours.trim() !== "") {
                const th = parseFloat(totalWorkingHours);
                if (!isNaN(th) && th >= 0) body.totalWorkingHours = th;
            }
            if (penaltyAmount.trim() !== "") {
                const pa = parseFloat(penaltyAmount);
                if (!isNaN(pa) && pa >= 0) body.penaltyAmount = pa;
            }

            const response = await axiosInstance.post("/admin/payments/transactions", body);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 my-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Add New Transaction</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Worker (NRIC) <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nric}
                                onChange={(e) => setNric(e.target.value)}
                                placeholder="Enter NRIC"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <button onClick={handleSearchByNRIC} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                {loading ? "..." : "Search"}
                            </button>
                        </div>
                        {workerData && (
                            <div className="mt-2 bg-gray-50 p-3 rounded-lg text-sm">
                                {workerData.fullName || workerData.name} · NRIC: {workerData.nric || workerData.icNumber}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={jobId}
                                onChange={(e) => setJobId(e.target.value)}
                                placeholder="Job ID"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <button type="button" onClick={loadJobs} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Load jobs
                            </button>
                        </div>
                        {jobOptions.length > 0 && (
                            <select
                                value={jobId}
                                onChange={(e) => setJobId(e.target.value)}
                                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">Select a job</option>
                                {jobOptions.map((j) => (
                                    <option key={j._id} value={j._id}>{j.jobTitle || j.jobId || j._id}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Shift date <span className="text-red-500">*</span></label>
                        <input type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start time <span className="text-red-500">*</span></label>
                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End time <span className="text-red-500">*</span></label>
                            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rate type <span className="text-red-500">*</span></label>
                            <select value={rateType} onChange={(e) => setRateType(e.target.value as "Hourly" | "Weekly" | "Monthly")} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="Hourly">Hourly</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rate (SGD) <span className="text-red-500">*</span></label>
                            <input type="number" min={0} step={0.01} value={rates} onChange={(e) => setRates(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="0" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total amount (SGD) <span className="text-red-500">*</span></label>
                        <input type="number" min={0} step={0.01} value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="0.00" />
                    </div>

                    <div className="text-sm text-gray-500">Optional</div>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Break (hrs)</label>
                            <input type="number" min={0} step={0.25} value={breakDuration} onChange={(e) => setBreakDuration(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Working hrs</label>
                            <input type="number" min={0} step={0.25} value={totalWorkingHours} onChange={(e) => setTotalWorkingHours(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Penalty (SGD)</label>
                            <input type="number" min={0} step={0.01} value={penaltyAmount} onChange={(e) => setPenaltyAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !workerData || !jobId.trim() || !shiftDate || !startTime || !endTime || !rates || !totalAmount}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Transaction"}
                    </button>
                </div>
            </div>
        </div>
    );
}

