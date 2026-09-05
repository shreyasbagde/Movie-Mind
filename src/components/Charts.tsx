import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { AnalyticsData } from '../types';

const GENRE_COLORS = [
  '#f43f5e', // rose
  '#fb7185',
  '#ec4899',
  '#d946ef',
  '#a855f7',
  '#8b5cf6',
  '#6366f1',
  '#3b82f6',
  '#0ea5e9',
  '#14b8a6',
  '#10b981',
  '#eab308',
];

const INDUSTRY_COLORS: Record<string, string> = {
  Bollywood: '#ef4444',
  Tollywood: '#f59e0b',
  Kollywood: '#3b82f6',
  Mollywood: '#10b981',
  Sandalwood: '#a855f7',
  Hollywood: '#64748b',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name?: string }>;
  label?: string;
  suffix?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, suffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl text-xs">
        <p className="font-bold text-gray-200 mb-1">{label || payload[0].name}</p>
        <p className="text-red-400 font-semibold">
          Count: <span className="text-white font-extrabold">{payload[0].value}</span> {suffix}
        </p>
      </div>
    );
  }
  return null;
};

export const GenreDistributionChart: React.FC<{ data: AnalyticsData['genresDistribution'] }> = ({ data }) => {
  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="genre"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            interval={0}
            angle={-35}
            textAnchor="end"
            stroke="#3f3f46"
          />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} stroke="#3f3f46" allowDecimals={false} />
          <Tooltip content={<CustomTooltip suffix="movies" />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={GENRE_COLORS[index % GENRE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const IndustryDistributionChart: React.FC<{ data: { industry: string; count: number }[] }> = ({ data }) => {
  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="industry"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            stroke="#3f3f46"
          />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} stroke="#3f3f46" allowDecimals={false} />
          <Tooltip content={<CustomTooltip suffix="titles" />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.industry} fill={INDUSTRY_COLORS[entry.industry] || '#e11d48'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LanguageDistributionChart: React.FC<{ data: { language: string; count: number }[] }> = ({ data }) => {
  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="language"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            stroke="#3f3f46"
          />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} stroke="#3f3f46" allowDecimals={false} />
          <Tooltip content={<CustomTooltip suffix="titles" />} />
          <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const RatingDistributionChart: React.FC<{ data: AnalyticsData['ratingsDistribution'] }> = ({ data }) => {
  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="range" tick={{ fill: '#a1a1aa', fontSize: 11 }} stroke="#3f3f46" />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} stroke="#3f3f46" allowDecimals={false} />
          <Tooltip content={<CustomTooltip suffix="titles" />} />
          <Bar dataKey="count" fill="#e11d48" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const YearDistributionChart: React.FC<{ data: AnalyticsData['yearDistribution'] }> = ({ data }) => {
  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 10 }}>
          <defs>
            <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="period" tick={{ fill: '#a1a1aa', fontSize: 11 }} stroke="#3f3f46" />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} stroke="#3f3f46" allowDecimals={false} />
          <Tooltip content={<CustomTooltip suffix="records" />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#f43f5e"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#yearGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
