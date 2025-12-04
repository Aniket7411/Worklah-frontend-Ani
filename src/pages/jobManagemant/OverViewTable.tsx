import React from "react";

const OverViewTable = () => {
  return (
    <div className="p-4">
      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr className="">
            <th className="border border-gray-400 p-2 text-left font-medium bg-blue-60">Designer</th>
            <th className="border border-gray-400 p-2 text-left font-medium">Job</th>
            <th className="border border-gray-400 p-2 text-left font-medium">Status</th>
            <th className="border border-gray-400 p-2 text-left font-medium">SIZE / Size</th>
            <th className="border border-gray-400 p-2 text-left font-medium">Apprentices</th>
            <th className="border border-gray-400 p-2 text-left font-medium">PCCI</th>
            <th className="border border-gray-400 p-2 text-left font-medium">Approved</th>
            <th className="border border-gray-400 p-2 text-left font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-blue-50">
            <td className="border border-gray-300 p-2"></td>
            <td className="border border-gray-300 p-2 bg-blue-100 font-medium">4000</td>
            <td className="border border-gray-300 p-2 bg-green-100 font-medium">5000x</td>
            <td className="border border-gray-300 p-2 bg-yellow-100 font-medium">4000x</td>
            <td className="border border-gray-300 p-2 bg-purple-100 font-medium">Full/Unified</td>
          </tr>
          <tr className="bg-blue-50">
            <td className="border border-gray-300 p-2" ></td>
            <td className="border border-gray-300 p-2 bg-blue-100">450</td>
            <td className="border border-gray-300 p-2 bg-green-100">5124</td>
            <td className="border border-gray-300 p-2 bg-yellow-100">5204</td>
            <td className="border border-gray-300 p-2 bg-purple-100">7000</td>
          </tr>
          <tr className="bg-white hover:bg-gray-50">
            <td className="border border-gray-300 p-2 font-medium">01. KART ZONCE YE TEL</td>
            <td className="border border-gray-300 p-2">TM COLLECTOR</td>
            <td className="border border-gray-300 p-2">Collector</td>
            <td className="border border-gray-300 p-2">0</td>
            <td className="border border-gray-300 p-2 bg-blue-50">25</td>
            <td className="border border-gray-300 p-2 bg-green-50">45</td>
            <td className="border border-gray-300 p-2 bg-yellow-50">25</td>
            <td className="border border-gray-300 p-2 bg-purple-50 font-medium text-green-600">Yes</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default OverViewTable;