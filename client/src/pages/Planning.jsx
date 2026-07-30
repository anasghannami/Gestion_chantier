import { useState, useEffect } from 'react';
import { Calendar, Loader2, ArrowRight, User } from 'lucide-react';
import Badge from '../components/ui/Badge';
import api from '../api/axios';

export default function Planning() {
  const [chantiers, setChantiers] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatut, setFilterStatut] = useState('');
  const [filterChef, setFilterChef] = useState('');

  // Timeline Date Boundaries (Current year: Jan 1st to Dec 31st)
  const currentYear = new Date().getFullYear();
  const timelineStart = new Date(currentYear, 0, 1);
  const timelineEnd = new Date(currentYear, 11, 31);
  const timelineDuration = timelineEnd - timelineStart;

  // Month labels for the calendar header
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  useEffect(() => {
    fetchData();
  }, [filterStatut, filterChef]);

  const formatMAD = (val) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val || 0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatut) params.statut = filterStatut;
      if (filterChef) params.chef_chantier_id = filterChef;

      const chantiersRes = await api.get('/chantiers', { params });

      // Fetch all chantiers to extract unique chefs
      const allChantiers = chantiersRes.data;
      setChantiers(allChantiers);

      // Extract unique chef list
      const uniqueChefs = [];
      const chefIds = new Set();
      allChantiers.forEach(c => {
        if (c.chef_chantier && !chefIds.has(c.chef_chantier.id)) {
          chefIds.add(c.chef_chantier.id);
          uniqueChefs.push(c.chef_chantier);
        }
      });
      setChefs(uniqueChefs);
    } catch (e) {
      console.error("Erreur chargement planning:", e);
    } finally {
      setLoading(false);
    }
  };

  const getPositionStyles = (dateDebutStr, dateFinStr) => {
    if (!dateDebutStr) return { left: '0%', width: '0%' };
    
    const start = new Date(dateDebutStr);
    const end = dateFinStr ? new Date(dateFinStr) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days if no end date
    
    // Clamp values inside current year
    const startClamped = Math.max(timelineStart, start);
    const endClamped = Math.min(timelineEnd, end);
    
    if (startClamped > timelineEnd || endClamped < timelineStart) {
      return { left: '0%', width: '0%', hidden: true };
    }

    const leftPercent = ((startClamped - timelineStart) / timelineDuration) * 100;
    const widthPercent = ((endClamped - startClamped) / timelineDuration) * 100;

    return {
      left: `${Math.max(0, leftPercent)}%`,
      width: `${Math.max(2, widthPercent)}%`
    };
  };

  const getTodayMarkerOffset = () => {
    const today = new Date();
    if (today < timelineStart || today > timelineEnd) return null;
    return `${((today - timelineStart) / timelineDuration) * 100}%`;
  };

  const todayOffset = getTodayMarkerOffset();

  const getStatusColorClass = (statut) => {
    switch (statut) {
      case 'En préparation': return 'bg-amber-500';
      case 'En cours': return 'bg-sky-500';
      case 'En retard': return 'bg-red-500';
      case 'Terminé': return 'bg-emerald-500';
      case 'Suspendu': return 'bg-slate-400';
      default: return 'bg-sky-500';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-btp-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-btp-blue" />
          <h1 className="text-2xl font-bold text-white">Planning Chronologique ({currentYear})</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select 
          className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-btp-blue outline-none"
          value={filterStatut}
          onChange={e => setFilterStatut(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="En préparation">En préparation</option>
          <option value="En cours">En cours</option>
          <option value="En retard">En retard</option>
          <option value="Terminé">Terminé</option>
          <option value="Suspendu">Suspendu</option>
        </select>
        
        <select 
          className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-btp-blue outline-none"
          value={filterChef}
          onChange={e => setFilterChef(e.target.value)}
        >
          <option value="">Tous les chefs de chantier</option>
          {chefs.map(chef => (
            <option key={chef.id} value={chef.id}>
              {chef.prenom} {chef.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Gantt Timeline View */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px] relative pb-6">
            
            {/* Today vertical line */}
            {todayOffset && (
              <div 
                className="absolute top-12 bottom-0 w-[2px] z-20 pointer-events-none border-l-2 border-dashed border-red-500"
                style={{ left: todayOffset }}
                title="Aujourd'hui"
              >
                <span className="absolute -top-3 -translate-x-1/2 px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-red-600 text-white shadow-lg border border-red-400 whitespace-nowrap flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
                  Aujourd'hui
                </span>
              </div>
            )}

            {/* Calendar Month Header */}
            <div className="flex border-b border-slate-700/80 bg-slate-800/30">
              <div className="w-1/4 min-w-[220px] p-4 font-semibold border-r border-slate-700/80 text-white">
                Chantier
              </div>
              <div className="w-3/4 flex relative">
                {months.map((month, idx) => (
                  <div 
                    key={idx} 
                    className="flex-1 text-center py-4 text-xs font-semibold border-r border-slate-700/50 last:border-r-0 text-slate-300"
                  >
                    {month}
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt Rows */}
            <div className="divide-y divide-slate-800">
              {chantiers.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Aucun chantier ne correspond aux filtres appliqués.
                </div>
              ) : (
                chantiers.map(c => {
                  const pos = getPositionStyles(c.date_debut, c.date_fin_prevue);
                  if (pos.hidden) return null;

                  const budgetConsomme = parseFloat(c.budget_consomme) || 0;
                  const budgetPrev = parseFloat(c.budget_previsionnel) || 0;
                  const progression = budgetPrev > 0 ? Math.min(Math.round((budgetConsomme / budgetPrev) * 100), 100) : 0;
                  const chefNom = c.chef_chantier ? `${c.chef_chantier.prenom} ${c.chef_chantier.nom}` : 'Non assigné';

                  const barColor = getStatusColorClass(c.statut);

                  return (
                    <div key={c.id} className="flex hover:bg-slate-800/10 transition-colors">
                      {/* Left Item Description */}
                      <div className="w-1/4 min-w-[220px] p-4 border-r border-slate-700/80 flex flex-col justify-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-btp-blue">{c.code_chantier}</span>
                          <Badge status={c.statut} />
                        </div>
                        <span className="font-bold text-white text-sm truncate mt-1" title={c.nom}>{c.nom}</span>
                        <div className="flex items-center mt-1 text-xs text-slate-400">
                          <User className="h-3 w-3 mr-1" />
                          <span className="truncate">{chefNom}</span>
                        </div>
                      </div>

                      {/* Right Timeline Bar */}
                      <div className="w-3/4 relative flex items-center py-6 px-1">
                        {/* Light background grid lines for months */}
                        <div className="absolute inset-0 flex pointer-events-none">
                          {months.map((_, i) => (
                            <div key={i} className="flex-1 border-r border-slate-800/30 last:border-r-0 h-full"></div>
                          ))}
                        </div>

                        {/* Gantt Bar Element */}
                        <div 
                          className="absolute h-8 rounded-lg shadow-lg relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                          style={{ left: pos.left, width: pos.width }}
                        >
                          {/* Inner bar */}
                          <div className={`absolute inset-0 rounded-lg opacity-85 ${barColor}`}></div>
                          
                          {/* Progress indicators */}
                          <div 
                            className="absolute bottom-0 left-0 h-1.5 bg-white/40 rounded-bl-lg" 
                            style={{ width: `${progression}%`, borderBottomLeftRadius: '0.5rem' }}
                          ></div>

                          {/* Professional Hover Tooltip Card */}
                          <div 
                            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 hidden group-hover:block z-50 w-72 p-4 rounded-xl shadow-2xl text-xs space-y-2 border transition-all"
                            style={{ 
                              backgroundColor: '#0F172A', 
                              borderColor: '#334155',
                              color: '#F8FAFC',
                              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
                            }}
                          >
                            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-1">
                              <p className="font-bold text-sm truncate max-w-[180px]" style={{ color: '#FFFFFF' }}>{c.nom}</p>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700" style={{ color: '#0284C7' }}>
                                {c.code_chantier}
                              </span>
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span style={{ color: '#94A3B8' }}>Début :</span>
                                <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                                  {c.date_debut ? new Date(c.date_debut).toLocaleDateString('fr-FR') : '—'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span style={{ color: '#94A3B8' }}>Fin prévue :</span>
                                <span className="font-semibold" style={{ color: '#FFFFFF' }}>
                                  {c.date_fin_prevue ? new Date(c.date_fin_prevue).toLocaleDateString('fr-FR') : '—'}
                                </span>
                              </div>
                              {c.date_fin_reelle && (
                                <div className="flex justify-between">
                                  <span style={{ color: '#94A3B8' }}>Fin réelle :</span>
                                  <span className="font-semibold" style={{ color: '#10B981' }}>
                                    {new Date(c.date_fin_reelle).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between border-t border-slate-700/80 pt-2">
                                <span style={{ color: '#94A3B8' }}>Budget Consommé :</span>
                                <span className="font-bold" style={{ color: '#38BDF8' }}>{progression}% ({formatMAD(budgetConsomme)})</span>
                              </div>
                              <div className="flex justify-between">
                                <span style={{ color: '#94A3B8' }}>Chef de Chantier :</span>
                                <span className="font-medium truncate max-w-[130px]" style={{ color: '#FFFFFF' }}>{chefNom}</span>
                              </div>
                            </div>
                          </div>

                          {/* Text labels inside the bar if wide enough */}
                          {parseFloat(pos.width) > 12 && (
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white px-2 truncate pointer-events-none">
                              {c.code_chantier} | {progression}% budget
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
