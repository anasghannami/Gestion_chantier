import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0284C7', '#EA580C', '#16A34A', '#D97706', '#8B5CF6', '#EC4899'];

const formatMAD = (value) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(value);
};

export default function AvancementChart({ data }) {
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
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)'
        }} className="p-3 rounded-lg shadow-xl">
          <p className="font-medium mb-1">{payload[0].name}</p>
          <p className="text-sm font-semibold" style={{ color: payload[0].color }}>
            {formatMAD(payload[0].value)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {((payload[0].value / total) * 100).toFixed(1)}% du total
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
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Total Dépenses</span>
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{(total / 1000000).toFixed(1)}M MAD</span>
        </div>
      </div>
    </div>
  );
}
