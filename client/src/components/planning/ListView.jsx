// ============================================================
// ListView.jsx — Vue tableau classique des tâches
// Colonnes : Nom, Chantier, Début, Fin, Durée, Avancement,
// Statut, Ressources, Actions (éditer/supprimer)
// ============================================================

import { useState, useMemo } from 'react';
import {
  Search, Pencil, Trash2, ChevronUp, ChevronDown,
  User, ArrowUpDown, AlertTriangle
} from 'lucide-react';
import Badge from '../ui/Badge';

export default function ListView({
  taches = [],
  chantiers = [],
  ouvriers = [],
  onTaskClick,
  onDeleteTask,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('date_debut');
  const [sortDir, setSortDir] = useState('asc');

  // ── Filtrage et tri ──
  const filteredTasks = useMemo(() => {
    let list = [...taches];

    // Recherche
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t =>
        t.nom.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        chantiers.find(c => String(c.id) === String(t.chantier_id))?.nom.toLowerCase().includes(q)
      );
    }

    // Tri
    list.sort((a, b) => {
      let va = a[sortField];
      let vb = b[sortField];
      if (sortField === 'chantier') {
        va = chantiers.find(c => String(c.id) === String(a.chantier_id))?.nom || '';
        vb = chantiers.find(c => String(c.id) === String(b.chantier_id))?.nom || '';
      }
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [taches, searchQuery, sortField, sortDir, chantiers]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-[#0ea5e9]" />
      : <ChevronDown className="h-3 w-3 text-[#0ea5e9]" />;
  };

  const columns = [
    { key: 'nom', label: 'Nom de la tâche', sortable: true },
    { key: 'chantier', label: 'Chantier', sortable: true },
    { key: 'date_debut', label: 'Début', sortable: true },
    { key: 'date_fin', label: 'Fin', sortable: true },
    { key: 'duree', label: 'Durée', sortable: true },
    { key: 'avancement', label: 'Avancement', sortable: true },
    { key: 'statut', label: 'Statut', sortable: true },
    { key: 'ressources', label: 'Ressources', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  return (
    <div className="glass-card overflow-hidden">
      {/* ── Barre de recherche ── */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Rechercher une tâche, un chantier..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-colors border"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)',
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-hover)', borderBottom: '1px solid var(--border-secondary)' }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`text-left text-[10px] font-bold uppercase tracking-wider px-3 py-3 ${
                    col.sortable ? 'cursor-pointer select-none hover:text-[#0ea5e9]' : ''
                  }`}
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon field={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task, idx) => {
              const chantier = chantiers.find(c => String(c.id) === String(task.chantier_id));
              const assignedWorkers = ouvriers.filter(o => task.ouvriers_ids?.includes(o.id));
              const isParent = !task.parent_id && taches.some(t => t.parent_id === task.id);

              return (
                <tr
                  key={task.id}
                  className="transition-colors cursor-pointer group"
                  style={{
                    borderBottom: '1px solid var(--border-secondary)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-hover)',
                  }}
                  onClick={() => onTaskClick?.(task)}
                >
                  {/* Nom */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {task.is_milestone && <span className="text-red-500 text-xs">◆</span>}
                      {task.is_critical && task.statut !== 'Terminé' && (
                        <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                      )}
                      <span
                        className={`text-xs truncate max-w-[200px] ${isParent ? 'font-bold' : 'font-medium'}`}
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {task.parent_id && <span className="mr-1" style={{ color: 'var(--text-muted)' }}>└</span>}
                        {task.nom}
                      </span>
                    </div>
                  </td>

                  {/* Chantier */}
                  <td className="px-3 py-2.5">
                    <span className="text-[11px] font-medium" style={{ color: '#0ea5e9' }}>
                      {chantier?.nom || '—'}
                    </span>
                  </td>

                  {/* Début */}
                  <td className="px-3 py-2.5 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    {new Date(task.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>

                  {/* Fin */}
                  <td className="px-3 py-2.5 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    {new Date(task.date_fin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>

                  {/* Durée */}
                  <td className="px-3 py-2.5 text-[11px] font-semibold text-center" style={{ color: 'var(--text-secondary)' }}>
                    {task.duree}j
                  </td>

                  {/* Avancement */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${task.avancement}%`,
                            backgroundColor: task.avancement === 100 ? '#22c55e' : '#0ea5e9',
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>
                        {task.avancement}%
                      </span>
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="px-3 py-2.5">
                    <Badge status={task.statut} />
                  </td>

                  {/* Ressources */}
                  <td className="px-3 py-2.5">
                    {assignedWorkers.length > 0 ? (
                      <div className="flex -space-x-1">
                        {assignedWorkers.slice(0, 3).map(w => (
                          <div
                            key={w.id}
                            className="h-6 w-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white ring-1 ring-white/20"
                            style={{ backgroundColor: '#0ea5e9' }}
                            title={`${w.prenom} ${w.nom}`}
                          >
                            {w.avatar}
                          </div>
                        ))}
                        {assignedWorkers.length > 3 && (
                          <div
                            className="h-6 w-6 rounded-full flex items-center justify-center text-[8px] font-bold ring-1 ring-white/20"
                            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}
                          >
                            +{assignedWorkers.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick?.(task);
                        }}
                        className="p-1.5 rounded-lg transition-colors hover:bg-[#0ea5e9]/10"
                        style={{ color: 'var(--text-tertiary)' }}
                        title="Éditer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Supprimer cette tâche ?')) {
                            onDeleteTask?.(task.id);
                          }
                        }}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-500"
                        style={{ color: 'var(--text-tertiary)' }}
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div style={{ color: 'var(--text-muted)' }}>
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold">Aucune tâche trouvée</p>
                    <p className="text-[10px] mt-1">Modifiez vos critères de recherche ou vos filtres.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer résumé ── */}
      <div
        className="flex items-center justify-between px-4 py-3 text-[10px] font-semibold"
        style={{
          borderTop: '1px solid var(--border-secondary)',
          color: 'var(--text-muted)',
        }}
      >
        <span>{filteredTasks.length} tâche(s) affichée(s)</span>
        <span>
          {filteredTasks.filter(t => t.statut === 'En retard').length > 0 && (
            <span className="text-red-500 mr-3">
              ⚠ {filteredTasks.filter(t => t.statut === 'En retard').length} en retard
            </span>
          )}
          {filteredTasks.filter(t => t.statut === 'Terminé').length} terminée(s)
        </span>
      </div>
    </div>
  );
}
