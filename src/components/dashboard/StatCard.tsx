import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  trend: number;
  trendLabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, trend, trendLabel }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
        title.includes('Total Job') ? 'bg-blue-50' :
        title.includes('Activated') ? 'bg-green-50' :
        title.includes('Vacancy') ? 'bg-purple-50' :
        title.includes('Pending Ver') ? 'bg-yellow-50' :
        title.includes('Pending Pay') ? 'bg-orange-50' :
        title.includes('Amount') ? 'bg-emerald-50' :
        title.includes('No Show') ? 'bg-red-50' :
        'bg-teal-50'
      }`}>
        <Icon className={`${
          title.includes('Total Job') ? 'text-blue-500' :
          title.includes('Activated') ? 'text-green-500' :
          title.includes('Vacancy') ? 'text-purple-500' :
          title.includes('Pending Ver') ? 'text-yellow-500' :
          title.includes('Pending Pay') ? 'text-orange-500' :
          title.includes('Amount') ? 'text-emerald-500' :
          title.includes('No Show') ? 'text-red-500' :
          'text-teal-500'
        }`} size={24} />
      </div>
    </div>
    <div className="flex items-center mt-2">
      <span className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </span>
      {trendLabel && <span className="text-sm text-gray-500 ml-1">{trendLabel}</span>}
    </div>
  </div>
);

export default StatCard;