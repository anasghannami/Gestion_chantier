import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatMAD = (value) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(value);
};

export default function BudgetChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center glass-card" style={{ color: 'var(--text-tertiary)' }}>
        Données insuffisantes pour le graphique
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)'
        }} className="p-3 rounded-lg shadow-xl">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{formatMAD(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Read CSS variable values for chart colors
  const styles = getComputedStyle(document.documentElement);
  const gridColor = styles.getPropertyValue('--chart-grid').trim() || '#334155';
  const textColor = styles.getPropertyValue('--chart-text').trim() || '#94A3B8';
  const tickColor = styles.getPropertyValue('--chart-tick').trim() || '#CBD5E1';

  return (
    <div className="glass-card p-6 h-[400px]">
      <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Comparatif Budget par Chantier</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={true} vertical={false} />
            <XAxis type="number" stroke={textColor} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
            <YAxis dataKey="nom" type="category" stroke={textColor} width={120} tick={{ fill: tickColor, fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: gridColor, opacity: 0.4 }} wrapperStyle={{ zIndex: 1000 }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="budget_previsionnel" name="Budget Prévisionnel" fill="#0284C7" radius={[0, 4, 4, 0]} minPointSize={14} />
            <Bar dataKey="budget_consomme" name="Budget Consommé" fill="#EA580C" radius={[0, 4, 4, 0]} minPointSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
