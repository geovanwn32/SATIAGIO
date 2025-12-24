
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start">
      <div className={`p-3 rounded-lg mr-4 ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline mt-1">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {trend && (
            <span className={`ml-2 text-xs font-semibold ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isUp ? '↑' : '↓'} {trend.value}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
