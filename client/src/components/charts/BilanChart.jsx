import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const formatMAD = (value) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(value || 0);
};

export default function BilanChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center glass-card" style={{ color: 'var(--text-tertiary)' }}>
        Données insuffisantes pour le bilan mensuel
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)'
          }} 
          className="p-3 rounded-xl shadow-2xl backdrop-blur-md"
        >
          <p className="font-bold text-sm mb-2 border-b pb-1" style={{ borderColor: 'var(--border-primary)' }}>
            Mois de {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs flex items-center justify-between gap-4 py-0.5" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span>
              <span className="font-bold">{formatMAD(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const styles = getComputedStyle(document.documentElement);
  const gridColor = styles.getPropertyValue('--chart-grid').trim() || '#334155';
  const textColor = styles.getPropertyValue('--chart-text').trim() || '#94A3B8';

  return (
    <div className="glass-card p-6 h-[420px] flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Bilan Financier Mensuel (CA vs Coûts & Bénéfice)
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            Évolution mensuelle des recettes, dépenses et marge nette
          </p>
        </div>
      </div>

      <div className="h-[310px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="mois" stroke={textColor} tick={{ fontSize: 12 }} />
            <YAxis stroke={textColor} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: gridColor, opacity: 0.2 }} wrapperStyle={{ zIndex: 1000 }} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            <Bar dataKey="chiffre_affaires" name="Chiffre d'Affaires (CA)" fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={45} />
            <Bar dataKey="depenses_totales" name="Coûts Totaux (Achats + Main d'œuvre)" fill="#EA580C" radius={[4, 4, 0, 0]} maxBarSize={45} />
            <Line type="monotone" dataKey="benefice_net" name="Bénéfice Net (Marge)" stroke="#0284C7" strokeWidth={3} dot={{ r: 5, fill: '#0284C7' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
