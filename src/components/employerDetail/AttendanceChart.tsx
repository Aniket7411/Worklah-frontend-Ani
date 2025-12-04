import React from "react";
import { FaChevronDown } from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const startYear = 2000; // Starting year
const endYear = new Date().getFullYear(); // Current year
const years = Array.from(
  { length: endYear - startYear + 1 },
  (_, i) => startYear + i
);

const data = [
  { name: "Jan", uv: 4000 },
  { name: "Feb", uv: 3000 },
  { name: "Mar", uv: 5000 },
  { name: "Apr", uv: 4000 },
  { name: "May", uv: 3000 },
  { name: "Jun", uv: 6000 },
  { name: "Jul", uv: 7000 },
  { name: "Aug", uv: 8000 },
  { name: "Sep", uv: 4000 },
  { name: "Oct", uv: 5000 },
  { name: "Nov", uv: 6000 },
  { name: "Dec", uv: 7000 },
];

const AttendanceChart: React.FC = () => {
  return (
    <div className="w-full">
      <div className="flex justify-between">
        <h3 className="font-medium text-gray-600">Average Attendance: 80%</h3>

        <div className="relative w-36">
          <select
            id="year"
            className="w-full appearance-none text-black bg-gray-300 border-gray-300 rounded-full px-6 py-2 pr-10"
          >
            <option value="">{endYear}</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>
      <div className="mt-4 w-full">
        <div className=" h-96 rounded">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                {/* Gradient Definition for the Area */}
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0099FF" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0099FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              {/* Axes */}
              <XAxis dataKey="name" />
              <YAxis />
              {/* Grid Lines */}
              {/* Tooltip */}
              <Tooltip />
              {/* Area with Gradient */}
              <Area
                type="monotone"
                dataKey="uv"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorUv)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;







// import React from "react";
// import { FaChevronDown } from "react-icons/fa";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// const startYear = 2000; // Starting year
// const endYear = new Date().getFullYear(); // Current year
// const years = Array.from(
//   { length: endYear - startYear + 1 },
//   (_, i) => startYear + i
// );

// interface AttendanceChartProps {
//   data: { name: string; uv: number }[];
//   averageAttendance: string;
// }

// const AttendanceChart: React.FC<AttendanceChartProps> = ({ data, averageAttendance }) => {
//   return (
//     <div className="w-full">
//       <div className="flex justify-between">
//         <h3 className="font-medium text-gray-600">Average Attendance: {averageAttendance}</h3>

//         <div className="relative w-36">
//           <select
//             id="year"
//             className="w-full appearance-none text-black bg-gray-300 border-gray-300 rounded-full px-6 py-2 pr-10"
//           >
//             <option value="">{endYear}</option>
//             {years.map((year) => (
//               <option key={year} value={year}>
//                 {year}
//               </option>
//             ))}
//           </select>
//           <FaChevronDown className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
//         </div>
//       </div>

//       <div className="mt-4 w-full">
//         <div className="h-96 rounded">
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart
//               data={data}
//               margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
//             >
//               <defs>
//                 <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#0099FF" stopOpacity={0.8} />
//                   <stop offset="95%" stopColor="#0099FF" stopOpacity={0} />
//                 </linearGradient>
//               </defs>
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Area type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AttendanceChart;

