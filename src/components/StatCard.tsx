import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  subtextColor?: string;
  icon: LucideIcon;
  iconColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  subtextColor = 'text-emerald-400',
  icon: Icon,
  iconColor,
}) => {
  return (
    <div className="glass-card p-5 relative overflow-hidden group hover:border-[#374151] transition-all">
      <div className="absolute top-0 left-0 right-0 h-[2px] ig-gradient-bg opacity-80" />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#1f2937] flex items-center justify-center">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight mb-1 text-[#f9fafb]">{value}</div>
      <div className={`text-xs ${subtextColor}`}>{subtext}</div>
    </div>
  );
};
