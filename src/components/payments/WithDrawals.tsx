"use client";

import React, { useState } from "react";
import { ChevronDown, Plus, X, DollarSign, ArrowUpCircle, ArrowDownCircle, Filter, Download } from "lucide-react";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";

interface WithDrawalsProps {
  data?: any;
}

interface Transaction {
  id?: string;
  _id?: string;
  transactionId?: string;
  name?: string;
  employee?: {
    id?: string;
    name?: string;
    nric?: string;
  };
  worker?: {
    fullName?: string;
    name?: string;
    nric?: string;
    icNumber?: string;
  };
  nric?: string;
  icNumber?: string;
  transactionType?: "Cash In" | "Cash Out";
  type?: string;
  date?: string;
  createdAt?: string;
  details?: {
    type?: string;
    jobId?: string;
    description?: string;
  };
  amount?: {
    value?: number;
    display?: string;
    color?: string;
  };
  cashOutMethod?: "PayNow" | "Bank Account" | null;
  method?: {
    type?: string;
    description?: string;
  };
  paymentMethod?: string;
  status?: "Pending" | "Processed" | "Failed";
  eWalletBalance?: {
    before?: number;
    after?: number;
  };
  balance?: number;
  walletBalance?: number;
}

export default function WithDrawals({ data }: WithDrawalsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDetails, setFilterDetails] = useState<string>("all");
  const [newTransaction, setNewTransaction] = useState({
    employeeId: "",
    transactionType: "Cash In" as "Cash In" | "Cash Out",
    date: new Date().toISOString().split("T")[0],
    detailsType: "Job ID",
    jobId: "",
    amount: "",
    cashOutMethod: "PayNow" as "PayNow" | "Bank Account",
    description: "",
  });

  // Transform API data to component format
  const rawTransactions: Transaction[] = data?.withdrawals || data?.transactions || data?.data || [];

  const formatTransaction = (transaction: any): Transaction => {
    const amountValue = transaction.amount?.value || transaction.amount || 0;
    const isCashOut = amountValue < 0 || transaction.transactionType === "Cash Out" || transaction.type === "Cash Out";

    return {
      id: transaction._id || transaction.id || transaction.transactionId || "",
      transactionId: transaction.transactionId || transaction._id || transaction.id || "",
      employee: transaction.employee || {
        id: transaction.worker?.id || "",
        name: transaction.worker?.fullName || transaction.worker?.name || transaction.name || "Unknown",
        nric: transaction.worker?.nric || transaction.worker?.icNumber || transaction.nric || "N/A",
      },
      worker: transaction.worker || {
        fullName: transaction.employee?.name || transaction.name || "Unknown",
        name: transaction.employee?.name || transaction.name || "Unknown",
        nric: transaction.employee?.nric || transaction.nric || "N/A",
      },
      nric: transaction.employee?.nric || transaction.worker?.nric || transaction.nric || "N/A",
      transactionType: isCashOut ? "Cash Out" : "Cash In",
      type: isCashOut ? "Cash Out" : "Cash In",
      date: transaction.date || transaction.createdAt || new Date().toLocaleDateString("en-GB"),
      details: {
        type: transaction.details?.type || transaction.details || "Job ID",
        jobId: transaction.details?.jobId || transaction.jobId || "",
        description: transaction.details?.description || transaction.details || transaction.description || "",
      },
      amount: {
        value: Math.abs(amountValue),
        display: isCashOut ? `-$${Math.abs(amountValue).toFixed(2)}` : `+$${Math.abs(amountValue).toFixed(2)}`,
        color: isCashOut ? "red" : "green",
      },
      cashOutMethod: transaction.cashOutMethod || transaction.method?.type || transaction.paymentMethod || null,
      method: transaction.method || (transaction.paymentMethod ? {
        type: transaction.paymentMethod,
        description: transaction.paymentMethod === "PAYNOW" ? "PayNow via Mobile" : "Bank Transfer",
      } : null),
      status: transaction.status || "Processed",
      eWalletBalance: transaction.eWalletBalance || {
        before: transaction.balance || transaction.walletBalance || 0,
        after: (transaction.balance || transaction.walletBalance || 0) + (isCashOut ? -amountValue : amountValue),
      },
      balance: transaction.eWalletBalance?.after || transaction.balance || transaction.walletBalance || 0,
    };
  };

  const transactionsData = rawTransactions.map(formatTransaction);

  // Filter transactions
  const filteredTransactions = transactionsData.filter((transaction) => {
    if (filterType !== "all" && transaction.transactionType !== filterType) return false;
    if (filterDetails !== "all" && transaction.details?.type !== filterDetails) return false;
    return true;
  });

  const handleCreateTransaction = async () => {
    if (!newTransaction.employeeId) {
      toast.error("Please select an employee");
      return;
    }
    if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (newTransaction.transactionType === "Cash Out" && !newTransaction.cashOutMethod) {
      toast.error("Please select a cash out method");
      return;
    }
    if (newTransaction.detailsType === "Job ID" && !newTransaction.jobId) {
      toast.error("Please enter Job ID");
      return;
    }

    try {
      const transactionData = {
        employeeId: newTransaction.employeeId,
        transactionType: newTransaction.transactionType,
        date: newTransaction.date,
        details: {
          type: newTransaction.detailsType,
          jobId: newTransaction.detailsType === "Job ID" ? newTransaction.jobId : undefined,
          description: newTransaction.detailsType === "Job ID"
            ? `Job ID: ${newTransaction.jobId}`
            : newTransaction.description || newTransaction.detailsType,
        },
        amount: parseFloat(newTransaction.amount),
        cashOutMethod: newTransaction.transactionType === "Cash Out" ? newTransaction.cashOutMethod : null,
      };

      // Use admin cashout endpoint for creating withdrawal requests
      const response = await axiosInstance.post("/admin/cashout", transactionData);

      // Check for success field according to API spec
      if (response.data?.success === false) {
        toast.error(response.data?.message || "Failed to create transaction");
        return;
      }

      if (response.status === 201 || response.status === 200) {
        toast.success("Transaction created successfully!");
        setShowCreateModal(false);
        setNewTransaction({
          employeeId: "",
          transactionType: "Cash In",
          date: new Date().toISOString().split("T")[0],
          detailsType: "Job ID",
          jobId: "",
          amount: "",
          cashOutMethod: "PayNow",
          description: "",
        });
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create transaction");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Filters and Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Transactions</option>
            <option value="Cash In">Cash In</option>
            <option value="Cash Out">Cash Out</option>
          </select>
          <select
            value={filterDetails}
            onChange={(e) => setFilterDetails(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Details</option>
            <option value="Job ID">Job ID</option>
            <option value="Referral Fees">Referral Fees</option>
            <option value="Bonus Payout">Bonus Payout</option>
            <option value="Penalty">Penalty</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Transaction
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                NRIC
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cash In/Out
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Details
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Cash Out Method
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.transactionId?.slice(-6) || transaction.id?.slice(-6) || "N/A"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                        {transaction.employee?.name?.charAt(0)?.toUpperCase() || transaction.worker?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {transaction.employee?.name || transaction.worker?.name || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {transaction.employee?.nric || transaction.worker?.nric || transaction.nric || "N/A"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${transaction.transactionType === "Cash In"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {transaction.transactionType === "Cash In" ? (
                        <ArrowUpCircle className="w-3 h-3" />
                      ) : (
                        <ArrowDownCircle className="w-3 h-3" />
                      )}
                      {transaction.transactionType}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date ? new Date(transaction.date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 hidden md:table-cell max-w-xs truncate">
                    {transaction.details?.type === "Job ID" && transaction.details?.jobId
                      ? `Job ID: ${transaction.details.jobId}`
                      : transaction.details?.type || transaction.details?.description || "N/A"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-semibold ${transaction.transactionType === "Cash In" ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {transaction.amount?.display || `$${transaction.amount?.value?.toFixed(2) || "0.00"}`}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {transaction.transactionType === "Cash Out" ? (
                      transaction.cashOutMethod || transaction.method?.type || "N/A"
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap hidden xl:table-cell">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === "Processed"
                          ? "bg-green-100 text-green-700"
                          : transaction.status === "Failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {transaction.status || "Processed"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Transaction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Transaction</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTransaction.employeeId}
                  onChange={(e) => setNewTransaction((prev) => ({ ...prev, employeeId: e.target.value }))}
                  placeholder="Enter employee ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTransaction.transactionType}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({ ...prev, transactionType: e.target.value as "Cash In" | "Cash Out" }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Cash In">Cash In</option>
                  <option value="Cash Out">Cash Out</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cash In/Out Details <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTransaction.detailsType}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({ ...prev, detailsType: e.target.value, jobId: "" }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Job ID">Job ID (*With Job ID Number)</option>
                  <option value="Referral Fees">Referral Fees</option>
                  <option value="Bonus Payout">Bonus Payout</option>
                  <option value="Penalty">Penalty</option>
                </select>
              </div>

              {newTransaction.detailsType === "Job ID" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTransaction.jobId}
                    onChange={(e) => setNewTransaction((prev) => ({ ...prev, jobId: e.target.value }))}
                    placeholder="Enter Job ID (e.g., JOB-12345)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (SGD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {newTransaction.transactionType === "Cash Out" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cash Out Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newTransaction.cashOutMethod}
                    onChange={(e) =>
                      setNewTransaction((prev) => ({ ...prev, cashOutMethod: e.target.value as "PayNow" | "Bank Account" }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PayNow">PayNow</option>
                    <option value="Bank Account">Bank Account</option>
                  </select>
                </div>
              )}

              <div className="flex gap-4 justify-end pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTransaction}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
