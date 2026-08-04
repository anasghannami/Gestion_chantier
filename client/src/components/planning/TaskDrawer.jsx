// ============================================================
// TaskDrawer.jsx — Drawer latéral droit avec détails de tâche
// Onglets : Détails, Ressources, Dépendances, Historique
// ============================================================

import { useState, useEffect } from 'react';
import {
  X, Save, Trash2, User, Link2, Clock, History,
  Plus, Minus, ChevronRight, AlertTriangle, Diamond,
  FileText, Calendar, Users
} from 'lucide-react';
import Badge from '../ui/Badge';

const TABS = [
  { key: 'details', label: 'Détails', icon: FileText },
  { key: 'ressources', label: 'Ressources', icon: Users },
  { key: 'dependances', label: 'Dépendances', icon: Link2 },
  { key: 'historique', label: 'Historique', icon: History },
];

const PRIORITY_OPTIONS = ['Basse', 'Moyenne', 'Haute'];
const STATUS_OPTIONS = ['À faire', 'En cours', 'Terminé', 'En retard'];

function safeFormatDate(d) {
  if (!d) return '—';
  const dateObj = new Date(d);
  return isNaN(dateObj.getTime()) ? '—' : dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TaskDrawer({
  isOpen,
  onClose,
  task,
  chantiers = [],
  ouvriers = [],
  allTasks = [],
  onSave,
  onDelete,
}) {
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({});

  // ── Initialiser le formulaire quand la tâche change ──
  useEffect(() => {
    if (task) {
      setFormData({
        nom: task.nom || '',
        description: task.description || '',
        date_debut: task.date_debut || '',
        date_fin: task.date_fin || '',
        duree: task.duree || 1,
        avancement: task.avancement !== undefined ? task.avancement : task.pourcentage_avancement || 0,
        statut: task.statut || 'À faire',
        priorite: task.priorite || 'Moyenne',
        notes: task.notes || '',
        ouvriers_ids: Array.isArray(task.ouvriers_ids) ? task.ouvriers_ids : [],
        dependances_ids: Array.isArray(task.dependances_ids) ? task.dependances_ids : [],
        is_milestone: Boolean(task.is_milestone),
        is_critical: Boolean(task.is_critical),
      });
      setActiveTab('details');
    }
  }, [task]);

  // ── Gérer le body overflow ──
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const chantier = chantiers.find(c => String(c.id) === String(task.chantier_id));
  const assignedWorkers = (ouvriers || []).filter(o => (formData.ouvriers_ids || []).includes(o.id));

  const handleSave = () => {
    onSave?.({ ...task, ...formData });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      onDelete?.(task.id);
      onClose();
    }
  };

  const toggleWorker = (workerId) => {
    setFormData(prev => {
      const ids = prev.ouvriers_ids || [];
      return {
        ...prev,
        ouvriers_ids: ids.includes(workerId)
          ? ids.filter(id => id !== workerId)
          : [...ids, workerId],
      };
    });
  };

  const toggleDependency = (taskId) => {
    setFormData(prev => {
      const ids = prev.dependances_ids || [];
      return {
        ...prev,
        dependances_ids: ids.includes(taskId)
          ? ids.filter(id => id !== taskId)
          : [...ids, taskId],
      };
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="relative w-full max-w-lg flex flex-col shadow-2xl z-10"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-primary)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between p-5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-secondary)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {task.is_milestone && <Diamond className="h-4 w-4 text-red-500 flex-shrink-0" />}
            <h2
              className="text-base font-bold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {task.nom}
            </h2>
            <Badge status={task.statut} />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-[#0284C7]/10 flex-shrink-0"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Chantier info ── */}
        {chantier && (
          <div
            className="px-5 py-2 text-xs flex items-center gap-2"
            style={{
              backgroundColor: 'var(--bg-hover)',
              borderBottom: '1px solid var(--border-secondary)',
              color: '#0284C7',
            }}
          >
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold">{chantier.nom}</span>
          </div>
        )}

        {/* ── Onglets ── */}
        <div
          className="flex px-5 pt-2 gap-1 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-secondary)' }}
        >
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
                  isActive
                    ? 'border-[#0284C7] text-[#0284C7]'
                    : 'border-transparent hover:text-[#0284C7]/70'
                }`}
                style={!isActive ? { color: 'var(--text-muted)' } : {}}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Contenu des onglets ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ─────── ONGLET DÉTAILS ─────── */}
          {activeTab === 'details' && (
            <>
              {/* Nom */}
              <FieldGroup label="Nom de la tâche">
                <input
                  type="text"
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none border"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                  value={formData.nom || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                />
              </FieldGroup>

              {/* Description */}
              <FieldGroup label="Description">
                <textarea
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none border resize-none"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </FieldGroup>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <FieldGroup label="Date début">
                  <input
                    type="date"
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none border"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                    value={formData.date_debut || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_debut: e.target.value }))}
                  />
                </FieldGroup>
                <FieldGroup label="Date fin">
                  <input
                    type="date"
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none border"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                    value={formData.date_fin || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_fin: e.target.value }))}
                  />
                </FieldGroup>
              </div>

              {/* Durée */}
              <FieldGroup label="Durée (jours)">
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none border"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                  value={formData.duree || 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, duree: parseInt(e.target.value) || 1 }))}
                />
              </FieldGroup>

              {/* Avancement slider */}
              <FieldGroup label={`Avancement : ${formData.avancement || 0}%`}>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.avancement || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, avancement: parseInt(e.target.value) || 0 }))}
                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #0284C7 ${formData.avancement || 0}%, var(--bg-tertiary) ${formData.avancement || 0}%)`,
                    }}
                  />
                  <span
                    className="text-sm font-bold w-12 text-right"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formData.avancement || 0}%
                  </span>
                </div>
              </FieldGroup>

              {/* Priorité et Statut */}
              <div className="grid grid-cols-2 gap-3">
                <FieldGroup label="Priorité">
                  <select
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none border"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                    value={formData.priorite || 'Moyenne'}
                    onChange={(e) => setFormData(prev => ({ ...prev, priorite: e.target.value }))}
                  >
                    {PRIORITY_OPTIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </FieldGroup>
                <FieldGroup label="Statut">
                  <select
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none border"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                    value={formData.statut || 'À faire'}
                    onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value }))}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </FieldGroup>
              </div>

              {/* Notes */}
              <FieldGroup label="Notes">
                <textarea
                  rows={2}
                  placeholder="Remarques, consignes particulières..."
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none border resize-none"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </FieldGroup>
            </>
          )}

          {/* ─────── ONGLET RESSOURCES ─────── */}
          {activeTab === 'ressources' && (
            <>
              <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                Ressources assignées ({assignedWorkers.length})
              </h4>

              <div className="space-y-2">
                {assignedWorkers.map(worker => (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between p-3 rounded-xl border transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      borderColor: 'var(--border-secondary)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: '#0284C7' }}
                      >
                        {worker.avatar || worker.prenom?.slice(0, 1) + worker.nom?.slice(0, 1)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {worker.prenom} {worker.nom}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {worker.specialite || 'Ouvrier'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleWorker(worker.id)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold text-red-500 hover:bg-red-500/10 transition-colors border border-red-500/20"
                    >
                      Retirer
                    </button>
                  </div>
                ))}

                {assignedWorkers.length === 0 && (
                  <div className="p-6 text-center rounded-xl" style={{ backgroundColor: 'var(--bg-hover)' }}>
                    <User className="h-6 w-6 mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                      Aucune ressource assignée
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h5 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                  + Ajouter une ressource
                </h5>
                <div className="space-y-1.5">
                  {(ouvriers || []).filter(o => !(formData.ouvriers_ids || []).includes(o.id)).map(worker => (
                    <button
                      key={worker.id}
                      onClick={() => toggleWorker(worker.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors border"
                      style={{
                        borderColor: 'var(--border-secondary)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                          style={{ backgroundColor: 'var(--bg-tertiary)' }}
                        >
                          {worker.avatar || worker.prenom?.slice(0, 1)}
                        </div>
                        <span>{worker.prenom} {worker.nom}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          ({worker.specialite || 'Ouvrier'})
                        </span>
                      </div>
                      <Plus className="h-3.5 w-3.5 text-[#0284C7]" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─────── ONGLET DÉPENDANCES ─────── */}
          {activeTab === 'dependances' && (
            <>
              <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                Dépendances ({formData.dependances_ids?.length || 0})
              </h4>

              <div className="space-y-2">
                {(formData.dependances_ids || []).map((depId, idx) => {
                  const depTask = typeof depId === 'number' ? (allTasks || []).find(t => t.id === depId) : null;
                  const depName = depTask ? depTask.nom : String(depId);

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border"
                      style={{
                        backgroundColor: 'var(--bg-hover)',
                        borderColor: 'var(--border-secondary)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Link2 className="h-3.5 w-3.5" style={{ color: '#0284C7' }} />
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {depName}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleDependency(depId)}
                        className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}

                {(!formData.dependances_ids || formData.dependances_ids.length === 0) && (
                  <div className="p-6 text-center rounded-xl" style={{ backgroundColor: 'var(--bg-hover)' }}>
                    <Link2 className="h-6 w-6 mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                      Aucune dépendance configurée
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ─────── ONGLET HISTORIQUE ─────── */}
          {activeTab === 'historique' && (
            <>
              <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                Historique des modifications
              </h4>

              {Array.isArray(task.historique) && task.historique.length > 0 ? (
                <div className="relative pl-6">
                  <div
                    className="absolute left-2 top-2 bottom-2 w-0.5"
                    style={{ backgroundColor: 'var(--border-primary)' }}
                  />

                  <div className="space-y-4">
                    {task.historique.map((entry, idx) => (
                      <div key={idx} className="relative">
                        <div
                          className="absolute -left-[18px] top-1 h-2.5 w-2.5 rounded-full border-2"
                          style={{
                            backgroundColor: '#0284C7',
                            borderColor: 'var(--bg-secondary)',
                          }}
                        />
                        <div
                          className="p-3 rounded-xl border"
                          style={{
                            backgroundColor: 'var(--bg-hover)',
                            borderColor: 'var(--border-secondary)',
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold" style={{ color: '#0284C7' }}>
                              {entry.user || 'Système'}
                            </span>
                            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                              {safeFormatDate(entry.date)}
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {entry.action || 'Modification'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center rounded-xl" style={{ backgroundColor: 'var(--bg-hover)' }}>
                  <History className="h-6 w-6 mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    Aucun historique disponible
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer actions ── */}
        <div
          className="flex items-center justify-between p-5 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border-secondary)' }}
        >
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-500 border border-red-500/20 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
              }}
            >
              Fermer
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] transition-colors shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
