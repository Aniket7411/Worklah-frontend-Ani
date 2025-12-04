"use client";

import React, { useState } from "react";
import { ChevronDown, BanknoteIcon } from "lucide-react";

interface WithDrawalsProps {
  data?: any;
}

interface Transaction {
  id?: string;
  _id?: string;
  name?: string;
  worker?: {
    fullName?: string;
    name?: string;
  };
  nric?: string;
  icNumber?: string;
  type?: string;
  transactionType?: string;
  date?: string;
  createdAt?: string;
  jobId?: string;
  job?: {
    _id?: string;
  };
  details?: string;
  description?: string;
  amount?: number;
  balance?: number;
  walletBalance?: number;
  method?: {
    type?: string;
    description?: string;
  };
  paymentMethod?: string;
}

export default function WithDrawals({ data }: WithDrawalsProps) {
  // Transform API data to component format
  const rawTransactions: Transaction[] = data?.withdrawals || data?.transactions || data?.data || [];
  
  const formatTransaction = (transaction: any): Transaction => {
    const amount = transaction.amount || transaction.totalAmount || 0;
    const isCashOut = amount < 0 || transaction.type === 'Cash Out' || transaction.transactionType === 'withdrawal';
    
    return {
      id: transaction._id || transaction.id || '',
      name: transaction.worker?.fullName || transaction.worker?.name || transaction.name || 'Unknown',
      nric: transaction.worker?.nric || transaction.worker?.icNumber || transaction.nric || 'N/A',
      type: isCashOut ? 'Cash Out' : 'Cash In',
      date: transaction.date || transaction.createdAt || new Date().toLocaleDateString('en-GB'),
      jobId: transaction.job?._id?.slice(-4) || transaction.jobId || '',
      details: transaction.details || transaction.description || (isCashOut ? 'Cashout' : 'Payment'),
      amount: amount,
      balance: transaction.balance || transaction.walletBalance || 0,
      method: transaction.method || (transaction.paymentMethod ? {
        type: transaction.paymentMethod,
        description: transaction.paymentMethod === 'PAYNOW' ? 'PayNow via Mobile' : 'Bank Transfer'
      } : null),
    };
  };

  const transactionsData = rawTransactions.map(formatTransaction);
  return (
    <div className="overflow-x-auto border rounded-lg bg-white">
      <table className="min-w-full divide-y divide-[#E5E5E5]">
        <thead>
          <tr className="border-b bg-gray-50 text-sm">
            <th className="px-4 py-3 text-left whitespace-nowrap">Id ↓</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Worker name</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">NRIC</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Cash In/Out</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Cash In/Out Date</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Job Id</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Cash In/Out Details</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Cash In/Out Amount</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Available Wallet Balance</th>
            <th className="px-4 py-3 text-left whitespace-nowrap">Cash Out Method</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {transactionsData.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                No withdrawal transactions found
              </td>
            </tr>
          ) : (
            transactionsData.map((transaction, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-3 whitespace-nowrap">{transaction.id}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                    {transaction.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  {transaction.name}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{transaction.nric}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`rounded px-2 py-1 ${
                    transaction.type === "Cash In"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {transaction.type}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{transaction.date}</td>
              <td className="px-4 py-3 whitespace-nowrap">{transaction.jobId}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                  >
                    {transaction.details}
                    <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </td>
              <td
                className={`px-4 py-3 whitespace-nowrap ${
                  transaction.amount < 0 ? "text-red-500" : "text-green-500"
                }`}
              >
                {transaction.amount < 0 ? "-" : "+"}$
                {Math.abs(transaction.amount)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">${transaction.balance}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {transaction.method && (
                  <div className="flex items-center gap-1 text-gray-600">
                    {transaction.method.type === "PAYNOW" ? (
                      <span className="font-semibold text-purple-600">
                        {transaction.method.type}
                      </span>
                    ) : (
                      <BanknoteIcon className="h-4 w-4" />
                    )}
                    <span>
                      {transaction.method.type !== "PAYNOW" &&
                        transaction.method.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {transaction.method.description}
                    </span>
                  </div>
                )}
              </td>
            </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
