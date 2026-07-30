import React from 'react';

const typeColors = {
  blue: 'from-[#0284C7]/20 to-transparent border-[#0284C7]/30 text-[#0284C7]',
  orange: 'from-[#EA580C]/20 to-transparent border-[#EA580C]/30 text-[#EA580C]',
  green: 'from-[#16A34A]/20 to-transparent border-[#16A34A]/30 text-[#16A34A]',
  red: 'from-[#DC2626]/20 to-transparent border-[#DC2626]/30 text-[#DC2626]',
  amber: 'from-[#D97706]/20 to-transparent border-[#D97706]/30 text-[#D97706]',
};

const iconColors = {
  blue: 'bg-[#0284C7]/20 text-[#0284C7]',
  orange: 'bg-[#EA580C]/20 text-[#EA580C]',
  green: 'bg-[#16A34A]/20 text-[#16A34A]',
  red: 'bg-[#DC2626]/20 text-[#DC2626]',
  amber: 'bg-[#D97706]/20 text-[#D97706]',
};

export default function KpiCard({ title, value, subtitle, icon: Icon, trend, trendLabel, color = 'blue' }) {
  const gradientClass = typeColors[color] || typeColors.blue;
  const iconClass = iconColors[color] || iconColors.blue;
  
  return (
    <div className={`glass-card p-6 bg-gradient-to-br ${gradientClass} hover:-translate-y-1 transition-transform duration-300`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>{title}</p>
          <h3 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {(trend || subtitle) && (
        <div className="mt-4 flex items-center text-sm">
          {trend && (
            <span className={`flex items-center font-medium mr-2 ${trend === 'up' ? 'text-[#16A34A]' : trend === 'down' ? 'text-[#DC2626]' : ''}`}
              style={!['up', 'down'].includes(trend) ? { color: 'var(--text-tertiary)' } : {}}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendLabel}
            </span>
          )}
          {subtitle && <span style={{ color: 'var(--text-tertiary)' }}>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
