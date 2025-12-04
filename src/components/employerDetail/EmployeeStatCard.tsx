import React from "react";

interface EmployeeStatCardProps {
  value: number; // The percentage value to be displayed (0-100)
  label: string; // Label for the statistic
  color: string; // The color of the circular progress bar
  size?: number; // Diameter of the circular progress bar
  strokeWidth?: number; // Thickness of the circular progress bar
}

const EmployeeStatCard: React.FC<EmployeeStatCardProps> = ({
  value,
  label,
  color,
  size = 202,
  strokeWidth = 8,
}) => {
  const radius = (size - strokeWidth) / 2.5; // Radius of the circle
  const circumference = 2 * Math.PI * radius; // Total circumference
  const offset = circumference - (value / 100) * circumference; // Stroke offset for progress

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Wrapper for circular progress bar */}
      <div className="relative">
        {/* Circular Progress Bar */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb" // Gray background
            strokeWidth={12}
          />
          {/* Foreground Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        {/* Percentage Value in Center */}
        <div
          className="absolute inset-0 flex items-center justify-center text-lg font-bold"
        >
          {value}%
        </div>
      </div>
      {/* Label */}
      <p className="text-[#4C4C4C] text-xl text-center font-medium">{label}</p>
    </div>
  );
};

export default EmployeeStatCard;
