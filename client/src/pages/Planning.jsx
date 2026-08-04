// ============================================================
// Planning.jsx — Page principale Planning des Chantiers
// Intègre les 3 vues (Gantt, Liste, Calendrier), le drawer
// latéral, les filtres, et les KPI récapitulatifs en haut.
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight,
  Clock, AlertTriangle, Building2, Users, CheckCircle2,
  FileSpreadsheet, Download, Filter, Search, BarChart3,
  List, CalendarDays, GanttChart, LayoutGrid
} from 'lucide-react';
import KpiCard from '../components/ui/KpiCard';
import GanttView from '../components/planning/GanttView';
import CalendarView from '../components/planning/CalendarView';
import ListView from '../components/planning/ListView';
import TaskDrawer from '../components/planning/TaskDrawer';
import TaskModal from '../components/planning/TaskModal';
import {
  MOCK_CHANTIERS, MOCK_OUVRIERS, MOCK_TACHES, SIMULATED_TODAY
} from '../data/planningData';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import api from '../api/axios';

// ─── Vues disponibles ────────────────────────────────────────
const VIEW_OPTIONS = [
  { key: 'Liste', icon: List, label: 'Liste' },
  { key: 'Gantt', icon: BarChart3, label: 'Gantt' },
  { key: 'Calendrier', icon: CalendarDays, label: 'Calendrier' },
];

const LOCAL_STORAGE_KEY = 'btp_planning_taches';

export default function Planning() {
  // ── State principal avec persistance LocalStorage ──
  const [chantiers, setChantiers] = useState(MOCK_CHANTIERS);
  const [ouvriers, setOuvriers] = useState(MOCK_OUVRIERS);

  const [taches, setTaches] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return MOCK_TACHES;
  });

  const [loading, setLoading] = useState(false);

  // ── Vue active (Gantt par défaut) ──
  const [viewMode, setViewMode] = useState('Gantt');

  // ── Filtres ──
  const [selectedChantierId, setSelectedChantierId] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // ── Drawer / Modal ──
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState(null);

  // ── Synchroniser avec localStorage ──
  const updateTachesState = (newTaches) => {
    setTaches(newTaches);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTaches));
  };

  // ── Fetch API (fallback mock + localStorage) ──
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [chantiersRes, ouvriersRes, tachesRes] = await Promise.all([
        api.get('/chantiers').catch(() => ({ data: null })),
        api.get('/ouvriers').catch(() => ({ data: null })),
        api.get('/taches').catch(() => ({ data: null })),
      ]);

      if (chantiersRes.data && chantiersRes.data.length > 0) setChantiers(chantiersRes.data);
      if (ouvriersRes.data && ouvriersRes.data.length > 0) setOuvriers(ouvriersRes.data);
      if (tachesRes.data && tachesRes.data.length > 0) {
        const mapped = tachesRes.data.map(t => ({
          ...t,
          duree: t.duree || 1,
          avancement: t.avancement !== undefined ? t.avancement : t.pourcentage_avancement || 0,
          priorite: t.priorite || 'Moyenne',
          ouvriers_ids: t.ouvriers_ids || [],
          dependances_ids: t.dependances_ids || [],
          is_milestone: t.is_milestone || false,
          is_critical: t.is_critical || false,
          historique: t.historique || [],
        }));
        updateTachesState(mapped);
      }
    } catch (err) {
      console.log('Utilisation des données de stockage local / mockées.', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Filtrage des tâches ──
  const filteredTaches = useMemo(() => {
    return taches.filter(t => {
      if (selectedChantierId && String(t.chantier_id) !== String(selectedChantierId)) return false;
      if (selectedStatut && t.statut !== selectedStatut) return false;
      if (dateFrom && t.date_debut < dateFrom) return false;
      if (dateTo && t.date_fin > dateTo) return false;
      return true;
    });
  }, [taches, selectedChantierId, selectedStatut, dateFrom, dateTo]);

  // ── Handlers ──
  const handleTaskClick = (task) => {
    setActiveTask(task);
    setIsNewTaskModalOpen(true);
  };

  const handleDayClick = (dateStr) => {
    setPrefilledDate(dateStr);
    setIsNewTaskModalOpen(true);
  };

  const handleSaveTask = async (savedTask) => {
    const updated = taches.map(t => t.id === savedTask.id ? savedTask : t);
    updateTachesState(updated);
    try {
      await api.put(`/taches/${savedTask.id}`, savedTask);
    } catch (e) {
      console.warn('Erreur mise à jour API:', e);
    }
  };

  const handleNewTask = async (savedTask) => {
    const updated = [savedTask, ...taches];
    updateTachesState(updated);

    try {
      const res = await api.post('/taches', savedTask);
      if (res.data && res.data.id) {
        const dbTask = {
          ...savedTask,
          ...res.data,
          avancement: res.data.avancement !== undefined ? res.data.avancement : savedTask.avancement,
        };
        updateTachesState([dbTask, ...taches.filter(t => t.id !== savedTask.id)]);
      }
    } catch (e) {
      console.warn('Erreur création API:', e);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const updated = taches.filter(t => t.id !== taskId);
    updateTachesState(updated);
    try {
      await api.delete(`/taches/${taskId}`);
    } catch (e) {
      console.warn('Erreur suppression API:', e);
    }
  };

  // ── KPI ──
  const kpi = useMemo(() => {
    const total = filteredTaches.length;
    const enRetard = filteredTaches.filter(t => t.statut === 'En retard').length;
    const terminees = filteredTaches.filter(t => t.statut === 'Terminé' || t.statut === 'Terminée').length;
    const enCours = filteredTaches.filter(t => t.statut === 'En cours').length;
    const avgAvancement = total > 0
      ? Math.round(filteredTaches.reduce((acc, t) => acc + (t.avancement || t.pourcentage_avancement || 0), 0) / total)
      : 0;

    return { total, enRetard, terminees, enCours, avgAvancement };
  }, [filteredTaches]);

  // ── Export ──
  const handleExportExcel = () => {
    const columns = [
      { header: 'Tâche', accessor: 'nom' },
      { header: 'Chantier', renderText: (row) => chantiers.find(c => String(c.id) === String(row.chantier_id))?.nom || '—' },
      { header: 'Statut', accessor: 'statut' },
      { header: 'Date Début', accessor: 'date_debut' },
      { header: 'Date Fin', accessor: 'date_fin' },
      { header: 'Durée (j)', accessor: 'duree' },
      { header: 'Avancement (%)', accessor: 'avancement' },
    ];
    exportToExcel(columns, filteredTaches, 'Planning_Taches_BTP');
  };

  const handleExportPDF = () => {
    const data = filteredTaches.map(t => ({
      Tache: t.nom,
      Chantier: chantiers.find(c => String(c.id) === String(t.chantier_id))?.nom || '—',
      Statut: t.statut,
      Debut: t.date_debut || '—',
      Fin: t.date_fin || '—',
      Avancement: `${t.avancement || 0}%`,
    }));
    exportToPDF({
      title: 'Planning des Chantiers — BTP Manager',
      subtitle: `${filteredTaches.length} tâches planifiées`,
      columns: [
        { header: 'Tâche', accessor: 'Tache' },
        { header: 'Chantier', accessor: 'Chantier' },
        { header: 'Statut', accessor: 'Statut' },
        { header: 'Début', accessor: 'Debut' },
        { header: 'Fin', accessor: 'Fin' },
        { header: 'Avancement', accessor: 'Avancement' },
      ],
      data,
      filename: 'Planning_Taches_BTP',
    });
  };

  const resetFilters = () => {
    setSelectedChantierId('');
    setSelectedStatut('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = selectedChantierId || selectedStatut || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════
          1. EN-TÊTE DE PAGE
          ═══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Planning des Chantiers
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Gestion et suivi des plannings de vos chantiers en cours
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Bouton Exporter */}
          <button
            onClick={handleExportPDF}
            className="flex items-center px-3.5 py-2 bg-white hover:bg-slate-50 rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm border whitespace-nowrap"
            style={{
              borderColor: 'var(--border-primary)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-secondary)',
            }}
            title="Exporter le planning"
          >
            <Download className="h-4 w-4 mr-1.5" /> Exporter
          </button>

          {/* Bouton Nouveau Planning */}
          <button
            onClick={() => { setActiveTask(null); setPrefilledDate(null); setIsNewTaskModalOpen(true); }}
            className="flex items-center px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nouveau Planning
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          2. SECTION KPI RÉCAPITULATIVE (EN HAUT)
          ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Tâches"
          value={kpi.total.toString()}
          icon={CalendarIcon}
          color="blue"
          subtitle={`${kpi.enCours} en cours`}
        />
        <KpiCard
          title="Tâches en Retard"
          value={kpi.enRetard.toString()}
          icon={AlertTriangle}
          color="red"
          subtitle="Attention requise"
        />
        <KpiCard
          title="Tâches Terminées"
          value={kpi.terminees.toString()}
          icon={CheckCircle2}
          color="green"
          subtitle={`${kpi.total > 0 ? Math.round((kpi.terminees / kpi.total) * 100) : 0}% du total`}
        />
        <KpiCard
          title="Avancement Moyen"
          value={`${kpi.avgAvancement}%`}
          icon={BarChart3}
          color="amber"
          subtitle="Toutes tâches confondues"
        />
      </div>

      {/* ═══════════════════════════════════════════
          3. SECTION FILTRES & VUE
          ═══════════════════════════════════════════ */}
      <div className="glass-card p-4 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        {/* Filtres gauche */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Chantier */}
          <select
            value={selectedChantierId}
            onChange={e => setSelectedChantierId(e.target.value)}
            className="rounded-xl px-3 py-2 text-xs font-medium outline-none border"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="">Tous les chantiers</option>
            {chantiers.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>

          {/* Statut */}
          <select
            value={selectedStatut}
            onChange={e => setSelectedStatut(e.target.value)}
            className="rounded-xl px-3 py-2 text-xs font-medium outline-none border"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="En cours">En cours</option>
            <option value="À faire">Planifié</option>
            <option value="Terminé">Terminé</option>
            <option value="En retard">En retard</option>
          </select>

          {/* Date Du */}
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-medium">Du</span>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="rounded-xl px-2.5 py-2 text-xs font-medium outline-none border"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Date Au */}
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-medium">Au</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="rounded-xl px-2.5 py-2 text-xs font-medium outline-none border"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Bouton Appliquer / Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
              style={{
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                color: '#0284C7',
              }}
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Toggle vue (pill buttons) */}
        <div
          className="flex p-1 rounded-xl border self-start lg:self-auto"
          style={{
            backgroundColor: 'var(--bg-hover)',
            borderColor: 'var(--border-secondary)',
          }}
        >
          {VIEW_OPTIONS.map(view => {
            const Icon = view.icon;
            const isActive = viewMode === view.key;
            return (
              <button
                key={view.key}
                onClick={() => setViewMode(view.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0284C7] text-white shadow-sm'
                    : 'hover:bg-[#0284C7]/10'
                }`}
                style={!isActive ? { color: 'var(--text-tertiary)' } : {}}
              >
                <Icon className="h-3.5 w-3.5" />
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          4. VUE PRINCIPALE
          ═══════════════════════════════════════════ */}
      {viewMode === 'Gantt' && (
        <GanttView
          taches={filteredTaches}
          chantiers={chantiers}
          ouvriers={ouvriers}
          onTaskClick={handleTaskClick}
          todayStr={SIMULATED_TODAY}
        />
      )}

      {viewMode === 'Liste' && (
        <ListView
          taches={filteredTaches}
          chantiers={chantiers}
          ouvriers={ouvriers}
          onTaskClick={handleTaskClick}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {viewMode === 'Calendrier' && (
        <CalendarView
          taches={filteredTaches}
          chantiers={chantiers}
          ouvriers={ouvriers}
          onTaskClick={handleTaskClick}
          onDayClick={handleDayClick}
          todayStr={SIMULATED_TODAY}
        />
      )}

      {/* ═══════════════════════════════════════════
          5. DRAWER LATÉRAL DÉTAILS TÂCHE
          ═══════════════════════════════════════════ */}
      <TaskDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setActiveTask(null); }}
        task={activeTask}
        chantiers={chantiers}
        ouvriers={ouvriers}
        allTasks={taches}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* ═══════════════════════════════════════════
          6. MODAL CRÉATION / ÉDITION TÂCHE
          ═══════════════════════════════════════════ */}
      <TaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => { setIsNewTaskModalOpen(false); setActiveTask(null); }}
        task={activeTask}
        prefilledDate={prefilledDate}
        chantiers={chantiers}
        ouvriers={ouvriers}
        allTasks={taches}
        onSave={activeTask ? handleSaveTask : handleNewTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
