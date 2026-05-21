/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; isUp: boolean };
  color?: 'teal' | 'blue' | 'orange' | 'green' | 'red';
  onClick?: () => void;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'teal',
  onClick,
  loading = false
}: StatCardProps) {
  // Color configuration mapping in compliance with design system guidelines
  const colorMap = {
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      iconBg: 'bg-teal-100'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      iconBg: 'bg-orange-100'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      iconBg: 'bg-red-100'
    }
  };

  const scheme = colorMap[color] || colorMap.teal;

  // Render skeleton placeholder loading animation
  if (loading) {
    return (
      <div 
        className="bg-white border border-[#bdc8ce]/50 rounded-[12px] p-5 shadow-sm animate-pulse flex items-center justify-between"
        id={`stat-card-skeleton-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
          <div className="space-y-2">
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-6 w-24 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="h-4 w-12 bg-slate-200 rounded" />
      </div>
    );
  }

  const cardId = `stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <button
      type="button"
      id={cardId}
      onClick={onClick}
      disabled={!onClick}
      className={`w-full flex items-center justify-between bg-white border border-[#bdc8ce]/50 rounded-[12px] p-5 shadow-sm transition-all duration-200 text-left ${
        onClick 
          ? 'hover:shadow-md cursor-pointer active:scale-[0.98]' 
          : 'cursor-default pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-4 overflow-hidden">
        {/* Left Side: Circular styled icon (48px size) */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${scheme.iconBg} ${scheme.text}`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Right Side: Title description + bold value metric */}
        <div className="overflow-hidden">
          <p className="text-xs text-[#545d62] font-semibold tracking-wide uppercase font-sans truncate">
            {title}
          </p>
          <h4 className="text-2xl font-bold text-[#0d1c2e] tracking-tight mt-1 truncate">
            {value}
          </h4>
        </div>
      </div>

      {/* Optional Trend percentages wrapper block */}
      {trend && (
        <div className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-bold font-mono self-end ${
          trend.isUp 
            ? 'bg-emerald-50 text-emerald-600' 
            : 'bg-red-50 text-red-600'
        }`}>
          {trend.isUp ? (
            <ArrowUpRight className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <ArrowDownRight className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{trend.value}%</span>
        </div>
      )}
    </button>
  );
}
