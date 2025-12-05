import { ArrowRight } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  defs,
  linearGradient,
} from "recharts";

interface DashboardCardProps {
  title: string;
  value: string;
  chartData: number[];
  chartColor: string[];
  icon: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  chartData,
  chartColor,
  icon,
}) => {
  const gradientId = `gradient-${title.replace(/\s+/g, "")}`;
  const formattedData = chartData.map((value, index) => ({ index, value }));

  const navigate = useNavigate()

  const handleNaviagtion = (title:string) =>{
      if(title === "No. of Active Job now"){
          navigate('/jobs/job-management?filter=active')
      } else if (title === "Activated Hustle Heroes"){
        navigate('/hustle-heroes?filter=activated')
    } else if (title === "Current Headcount Fulfilment"){
        navigate('/jobs/job-management?filter=headcount-fulfillment')
    } else if (title === "Pending Verifications"){
        navigate('/hustle-heroes?filter=pending-verification')
    } else if (title === "Pending Wages Transfer"){
        navigate('/payments?filter=pending')
    } else if (title === "No Show"){
        navigate('/hustle-heroes?filter=no-show')
    } else if (title === "Outstanding Payment"){
        navigate('/payments?filter=outstanding')
    } else if (title === "Verified Hustle Heroes"){
        navigate('/hustle-heroes?filter=verified')
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-[16px] leading-[20px] font-medium text-black">{title}</h3>
        </div>
        <div className="w-10 h-10 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <div className="mt-4 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient
                id={`${gradientId}-line`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                {chartColor.map((color, index) => (
                  <stop
                    key={index}
                    offset={`${(index / (chartColor.length - 1)) * 100}%`}
                    stopColor={color}
                  />
                ))}
              </linearGradient>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                {chartColor.map((color, index) => (
                  <stop
                    key={index}
                    offset={`${(index / (chartColor.length - 1)) * 100}%`}
                    stopColor={color}
                    stopOpacity={1}
                  />
                ))}
              </linearGradient>
            </defs>
            <Tooltip
              cursor={{ stroke: chartColor[0], strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "6px 12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={`url(#${gradientId}-line)`}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-[40px] leading-[50px] font-medium text-black mt-1">{value}</p>
        <div className="flex items-center gap-2 p-2 rounded-full bg-[#f6f6f6]" onClick={() => handleNaviagtion(title)}>
          <p className="text-sm font-normal text-black ">Detailed View</p>
          <ArrowRight className="w-4 h-4"/>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;