"use client";

import {
  ArrowLeft,
  Plus,
  Settings,
  MoreVertical,
  MapPin,
  Phone,
  Mail,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OutletDetail() {
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const navigate = useNavigate()
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Heaader */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button className="p-[14px] rounded-[26px] shadow-lg bg-[#FFFFFF] hover:bg-gray-50 " onClick={() => navigate(-1)}>
            <ArrowLeft className="w-[24px] h-[24px]"  />
          </button>
          <img
            src="/assets/dominos-logo.png"
            alt="Domino's"
            width={120}
            height={40}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-[14px] rounded-[26px] shadow-lg bg-[#FFFFFF] hover:bg-gray-50">
            <Settings className="w-[24px] h-[24px]" />
          </button>
          <button className="p-[14px] rounded-[26px] shadow-lg bg-[#FFFFFF] hover:bg-gray-50 ">
            <Plus className="w-[24px] h-[24px]" />
          </button>
        </div>
      </div>

      {/* Company Info */}
      <div className="mb-8 pb-6 flex justify-between border-b border-gray-200">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2 mb-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>123 Orchard Road, Singapore</span>
            </div>
            <button className="text-sm text-blue-600 hover:underline">
              Show on map
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>+65 1234 5678</span>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>dominos@gmail.com</span>
          </div>
        </div>
        <div className="text-end">
          <div className="text-sm text-gray-600">Employer:</div>
          <div className="text-sm font-medium flex items-center gap-2">
            <img src="/assets/company.png" />
            <span className=" uppercase text-sm">Right Service PTE. LTD</span>
          </div>
          <div className="text-sm text-gray-600">Operating Hours:</div>
          <div className=" uppercase font-medium text-sm">9 AM - 9 PM</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-gray-600">
            Total Jobs Posted:
          </div>
          <div className="text-sm font-medium text-gray-600">Active Jobs:</div>
          <div className="text-sm font-medium text-gray-600">
            Average Attendance Rate:
          </div>
          <div className="text-sm font-medium text-gray-600">No-Show Rate:</div>
          <div className="text-sm font-medium text-gray-600">
            Top Roles Posted:
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-gray-600">120</div>
          <div className="text-sm font-medium text-gray-600">2</div>
          <div className="text-sm font-medium text-gray-600">95%</div>
          <div className="text-sm font-medium text-gray-600">3%</div>
          <div className="text-sm font-medium text-gray-600 flex gap-28">
            <span>Cashier, Stock Handler, Cleaner</span>
            <div className="flex gap-2">
              <button className="p-[7px] rounded-[26px] border bg-[#FFFFFF] hover:bg-gray-50 ">
                <Trash2 className="w-[12px] h-[12px]" />
              </button>
              <div>
              <select
                id="role"
                value={selectedRole}
                // onChange={handleChange}
                className="px-8 border rounded-full bg-[#EDF8FF]"
              >
                <option value="all">All</option>
                <option value="cashier">Cashier</option>
              </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Roles */}
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Top Roles Posted:</div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Cashier, Stock Handler, Cleaner
          </span>
          <button className="p-1 hover:bg-gray-100 rounded">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm">
              <th className="py-3 px-4 font-medium">Jobs</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Shifts</th>
              <th className="py-3 px-4 font-medium">Total Duration</th>
              <th className="py-3 px-4 font-medium">Vacancy filled</th>
              <th className="py-3 px-4 font-medium">Total pay/shift</th>
              <th className="py-3 px-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((_, index) => (
              <tr key={index} className="border-t">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                    <div>
                      <div className="font-medium">Tray Collector</div>
                      <div className="text-sm text-gray-500">#12345</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      index % 2 === 0
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {index % 2 === 0 ? "Active" : "Completed"}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">16 Sept, 24</td>
                <td className="py-3 px-4 text-sm">3</td>
                <td className="py-3 px-4">
                  <div className="text-sm">4 Hrs</div>
                  <div className="text-xs text-gray-500">
                    1 Hrs (Unpaid Break)
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">3/5</span>
                    <span className="text-xs text-gray-500">Standby: 2</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">$75</div>
                  <div className="text-xs text-gray-500">$15/hr</div>
                </td>
                <td className="py-3 px-4">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
