import { useState, useEffect } from 'react';
import { Building2, TrendingDown, ShoppingCart, FileText, Loader2, AlertTriangle } from 'lucide-react';
import KpiCard from '../components/ui/KpiCard';
import AlertCard from '../components/ui/AlertCard';
import BudgetChart from '../components/charts/BudgetChart';
import AvancementChart from '../components/charts/AvancementChart';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/kpi');
        const kpiData = response.data;

        // Formater le budget en format lisible
        const formatBudget = (amount) => {
          if (!amount) return '0 MAD';
          if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M MAD`;
          if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K MAD`;
          return `${amount} MAD`;
        };

        setData({
          kpi: {
            chantiersActifs: kpiData.chantiersActifs || 0,
            budgetConsomme: formatBudget(kpiData.budgetConsomme),
            commandesEnCours: kpiData.commandesEnCours || 0,
            facturesAttente: kpiData.facturesEnAttente || 0
          },
          budgetData: (kpiData.avancementParChantier || []).map(c => ({
            nom: c.nom,
            budget_previsionnel: parseFloat(c.budget_previsionnel) || 0,
            budget_consomme: parseFloat(c.budget_consomme) || 0
          })),
          depensesData: (kpiData.depensesParChantier || []).map(c => ({
            name: c.nom,
            value: parseFloat(c.total_depenses) || 0
          })),
          alertes: (kpiData.alertes || []).map((a, index) => ({
            id: index + 1,
            type: a.severity === 'critical' ? 'danger' : a.severity === 'high' ? 'warning' : 'info',
            title: a.type,
            message: a.message
          })),
          stats: {
            chantiersEnRetard: kpiData.chantiersEnRetard || 0,
            totalChantiers: kpiData.totalChantiers || 0,
            budgetPrevisionnel: formatBudget(kpiData.budgetPrevisionnel),
            facturesEchues: kpiData.facturesEchues || 0,
            montantFacturesEchues: formatBudget(kpiData.montantFacturesEchues)
          }
        });
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
        setError("Impossible de charger les données du tableau de bord. Vérifiez que le serveur backend est démarré.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-btp-blue animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="glass-card p-8 max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-btp-orange mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Erreur de connexion</h3>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Bienvenue, {user?.prenom || user?.nom || 'Utilisateur'} 👋
        </h1>
        <p className="text-slate-400 mt-1">
          Vue d'ensemble de vos chantiers et activités
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Chantiers Actifs" 
          value={data.kpi.chantiersActifs} 
          icon={Building2} 
          color="blue" 
          subtitle={`${data.stats.chantiersEnRetard} en retard`}
        />
        <KpiCard 
          title="Budget Consommé" 
          value={data.kpi.budgetConsomme} 
          icon={TrendingDown} 
          color="orange" 
          subtitle={`Prévisionnel: ${data.stats.budgetPrevisionnel}`}
        />
        <KpiCard 
          title="Commandes en Cours" 
          value={data.kpi.commandesEnCours} 
          icon={ShoppingCart} 
          color="amber" 
          subtitle="Brouillons et validées"
        />
        <KpiCard 
          title="Factures en Attente" 
          value={data.kpi.facturesAttente} 
          icon={FileText} 
          color="red" 
          subtitle={`${data.stats.facturesEchues} échues (${data.stats.montantFacturesEchues})`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetChart data={data.budgetData} />
        <AvancementChart data={data.depensesData} />
      </div>

      {/* Alerts Section */}
      {data.alertes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-btp-orange" />
            Alertes Récentes
            <span className="ml-2 bg-btp-red/20 text-btp-red text-xs font-medium px-2.5 py-0.5 rounded-full">
              {data.alertes.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.alertes.map(alert => (
              <AlertCard 
                key={alert.id}
                type={alert.type}
                title={alert.title}
                message={alert.message}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
