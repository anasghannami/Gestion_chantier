import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

const COLORS = ['#0284C7', '#EA580C', '#16A34A', '#D97706', '#8B5CF6', '#EC4899'];

const formatMAD = (value) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(value);
};

export default function AvancementChart({ data }) {
  const [activeItem, setActiveItem] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center glass-card" style={{ color: 'var(--text-tertiary)' }}>
        Données insuffisantes pour le graphique
      </div>
    );
  }

  // Calculate total for center label
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }} 
          className="p-3 rounded-xl backdrop-blur-md opacity-100"
        >
          <p className="font-semibold text-sm mb-1">{payload[0].name}</p>
          <p className="text-sm font-bold" style={{ color: payload[0].color }}>
            {formatMAD(payload[0].value)}
          </p>
          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-tertiary)' }}>
            {total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0}% du total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 h-[400px]">
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Répartition des Dépenses</h3>
      <div className="h-[320px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              onMouseEnter={(_, index) => setActiveItem(data[index])}
              onMouseLeave={() => setActiveItem(null)}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Dynamic Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8 z-0">
          {activeItem ? (
            <div className="text-center px-4 max-w-[150px] transition-all duration-200">
              <span className="text-xs font-semibold block truncate" style={{ color: 'var(--text-tertiary)' }}>
                {activeItem.name}
              </span>
              <span className="text-base font-bold block my-0.5" style={{ color: 'var(--text-primary)' }}>
                {formatMAD(activeItem.value)}
              </span>
              <span className="text-xs font-medium block" style={{ color: 'var(--color-btp-blue)' }}>
                {total > 0 ? ((activeItem.value / total) * 100).toFixed(1) : 0}% du total
              </span>
            </div>
          ) : (
            <div className="text-center transition-all duration-200">
              <span className="text-xs font-semibold block" style={{ color: 'var(--text-tertiary)' }}>
                Total Dépenses
              </span>
              <span className="text-lg font-bold block mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {(total / 1000000).toFixed(1)}M MAD
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
