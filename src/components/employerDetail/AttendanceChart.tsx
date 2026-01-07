import React, { useState, useEffect } from "react";
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
import { useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import { Loader2 } from "lucide-react";

interface AttendanceChartProps {
  outletId?: string;
  averageAttendance?: number;
  attendanceData?: Array<{ name: string; uv: number }>;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ 
  outletId, 
  averageAttendance: propAverageAttendance,
  attendanceData: propAttendanceData 
}) => {
  const { jobId } = useParams();
  const [attendanceData, setAttendanceData] = useState<Array<{ name: string; uv: number }>>(propAttendanceData || []);
  const [averageAttendance, setAverageAttendance] = useState<number>(propAverageAttendance || 0);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(!propAttendanceData && !propAverageAttendance);
  const [error, setError] = useState<string | null>(null);

  const startYear = 2000;
  const endYear = new Date().getFullYear();
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  useEffect(() => {
    // If data is passed as props, use it
    if (propAttendanceData && propAverageAttendance !== undefined) {
      setAttendanceData(propAttendanceData);
      setAverageAttendance(propAverageAttendance);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch from API
    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const idToUse = outletId || jobId;
        if (!idToUse) {
          setAttendanceData([]);
          setIsLoading(false);
          return;
        }

        // Fetch attendance chart data from API
        const response = await axiosInstance.get(`/admin/outlets/${idToUse}/attendance/chart?year=${selectedYear}`);
        
        if (response.data?.success === false) {
          throw new Error(response.data?.message || "Failed to fetch attendance data");
        }

        const chartData = response.data?.chartData || response.data?.data || response.data?.attendanceChart || [];
        const avgAttendance = response.data?.averageAttendance || response.data?.averageAttendanceRate || 0;

        if (Array.isArray(chartData) && chartData.length > 0) {
          // Format data for chart: [{ name: "Jan", uv: 80 }, ...]
          const formattedData = chartData.map((item: any) => ({
            name: item.month || item.name || "N/A",
            uv: item.attendance || item.value || item.uv || 0,
          }));
          setAttendanceData(formattedData);
        } else {
          setAttendanceData([]);
        }

        setAverageAttendance(avgAttendance);
      } catch (err: any) {
        console.error("Error fetching attendance chart data:", err);
        setError(err?.response?.data?.message || "Failed to load attendance data");
        setAttendanceData([]);
        setAverageAttendance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [outletId, jobId, selectedYear, propAttendanceData, propAverageAttendance]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value) || endYear;
    setSelectedYear(year);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-600">
          Average Attendance: {isLoading ? "Loading..." : `${averageAttendance.toFixed(1)}%`}
        </h3>

        <div className="relative w-36">
          <select
            id="year"
            value={selectedYear}
            onChange={handleYearChange}
            disabled={isLoading}
            className="w-full appearance-none text-black bg-gray-300 border-gray-300 rounded-full px-6 py-2 pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 w-full">
        <div className="h-96 rounded">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No attendance data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={attendanceData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0099FF" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0099FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="uv"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorUv)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
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

