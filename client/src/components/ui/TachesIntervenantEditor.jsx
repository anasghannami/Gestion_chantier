import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Pencil, Loader2, ClipboardList, Check, X } from 'lucide-react';
import api from '../../api/axios';

const STATUTS = ['En cours', 'Terminée', 'Payée'];

const formatMAD = (val) =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 2 }).format(val || 0);

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const emptyForm = () => ({
  nom: '',
  description: '',
  montant: '',
  date_debut: new Date().toISOString().split('T')[0],
  date_fin: '',
  statut: 'En cours'
});

const statutStyle = (statut) => {
  if (statut === 'Payée') return { color: 'var(--success)', backgroundColor: 'var(--success-bg)' };
  if (statut === 'Terminée') return { color: 'var(--btp-blue, #0284C7)', backgroundColor: 'rgba(2,132,199,0.15)' };
  return { color: 'var(--warning)', backgroundColor: 'var(--warning-bg)' };
};

/**
 * Éditeur de tâches pour un intervenant payé "à la tâche".
 * - mode="local" : gère un tableau en mémoire (value / onChange) — utilisé à la création.
 * - mode="api"   : CRUD live via l'API (ouvrierId requis) — utilisé à l'édition.
 */
export default function TachesIntervenantEditor({
  mode = 'local',
  ouvrierId,
  value = [],
  onChange,
  onChanged,
  canEdit = true
}) {
  const isApi = mode === 'api';

  const [taches, setTaches] = useState(isApi ? [] : value);
  const [loading, setLoading] = useState(isApi);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  // ── Chargement (mode api) ──
  const fetchTaches = useCallback(async () => {
    if (!isApi || !ouvrierId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/paiement-ouvriers/${ouvrierId}/taches`);
      setTaches(data);
    } finally {
      setLoading(false);
    }
  }, [isApi, ouvrierId]);

  useEffect(() => { fetchTaches(); }, [fetchTaches]);

  // En mode local, refléter les changements externes
  useEffect(() => { if (!isApi) setTaches(value); /* eslint-disable-next-line */ }, [isApi]);

  const pushLocal = (next) => {
    setTaches(next);
    onChange?.(next);
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (t, idx) => {
    setForm({
      nom: t.nom || '',
      description: t.description || '',
      montant: t.montant ?? '',
      date_debut: t.date_debut || '',
      date_fin: t.date_fin || '',
      statut: t.statut || 'En cours'
    });
    setEditingId(isApi ? t.id : idx);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim()) return;

    const payload = {
      nom: form.nom.trim(),
      description: form.description || null,
      montant: form.montant === '' ? 0 : parseFloat(form.montant),
      date_debut: form.date_debut || null,
      date_fin: form.date_fin || null,
      statut: form.statut === 'Payée' ? 'Terminée' : form.statut
    };

    if (isApi) {
      setSaving(true);
      try {
        if (editingId != null) {
          await api.put(`/paiement-ouvriers/taches/${editingId}`, payload);
        } else {
          await api.post(`/paiement-ouvriers/${ouvrierId}/taches`, payload);
        }
        await fetchTaches();
        onChanged?.();
        resetForm();
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur lors de l\'enregistrement de la tâche');
      } finally {
        setSaving(false);
      }
    } else {
      if (editingId != null) {
        pushLocal(taches.map((t, i) => (i === editingId ? { ...t, ...payload } : t)));
      } else {
        pushLocal([...taches, payload]);
      }
      resetForm();
    }
  };

  const handleDelete = async (t, idx) => {
    if (!confirm('Supprimer cette tâche ?')) return;
    if (isApi) {
      setSaving(true);
      try {
        await api.delete(`/paiement-ouvriers/taches/${t.id}`);
        await fetchTaches();
        onChanged?.();
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur lors de la suppression');
      } finally {
        setSaving(false);
      }
    } else {
      pushLocal(taches.filter((_, i) => i !== idx));
    }
  };

  const quickStatut = async (t, statut) => {
    if (isApi) {
      setSaving(true);
      try {
        await api.put(`/paiement-ouvriers/taches/${t.id}`, { statut });
        await fetchTaches();
        onChanged?.();
      } finally {
        setSaving(false);
      }
    } else {
      pushLocal(taches.map((x) => (x === t ? { ...x, statut } : x)));
    }
  };

  const totalConvenu = taches.reduce((s, t) => s + parseFloat(t.montant || 0), 0);

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-secondary)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          <ClipboardList className="h-4 w-4 text-btp-blue" /> Tâche(s)
        </h3>
        {canEdit && !showForm && (
          <button
            type="button"
            onClick={() => { setForm(emptyForm()); setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-1 text-xs px-2.5 py-1 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Ajouter une tâche
          </button>
        )}
      </div>

      {/* Formulaire tâche */}
      {showForm && (
        <div className="mb-3 p-3 rounded-lg space-y-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nom de la tâche</label>
            <input
              type="text"
              required
              autoFocus
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-btp-blue outline-none"
              placeholder="Installation jardin"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description (optionnel)</label>
            <input
              type="text"
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-btp-blue outline-none"
              placeholder="Détails de la mission…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Montant convenu (MAD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-btp-blue outline-none"
                placeholder="1500"
                value={form.montant}
                onChange={(e) => setForm({ ...form, montant: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Statut</label>
              <select
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-btp-blue outline-none"
                value={form.statut === 'Payée' ? 'Terminée' : form.statut}
                onChange={(e) => setForm({ ...form, statut: e.target.value })}
              >
                <option value="En cours">En cours</option>
                <option value="Terminée">Terminée</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date de début</label>
              <input
                type="date"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-btp-blue outline-none"
                value={form.date_debut || ''}
                onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date de fin (si terminée)</label>
              <input
                type="date"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-btp-blue outline-none"
                value={form.date_fin || ''}
                onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={resetForm} className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !form.nom.trim()}
              className="px-3 py-1.5 text-xs bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Enregistrement…' : editingId != null ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

      {/* Liste des tâches */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-btp-blue" />
        </div>
      ) : taches.length === 0 ? (
        <p className="text-sm italic text-center py-3" style={{ color: 'var(--text-muted)' }}>
          Aucune tâche pour le moment.
        </p>
      ) : (
        <ul className="space-y-2">
          {taches.map((t, idx) => {
            const locked = t.statut === 'Payée';
            return (
              <li key={t.id ?? idx} className="rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--bg-input)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.nom}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={statutStyle(t.statut)}>
                        {t.statut}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-xs mt-0.5 italic" style={{ color: 'var(--text-muted)' }}>{t.description}</p>
                    )}
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {formatMAD(t.montant)} · {formatDate(t.date_debut)}
                      {t.date_fin ? ` → ${formatDate(t.date_fin)}` : ''}
                    </p>
                  </div>
                  {canEdit && !locked && (
                    <div className="flex items-center gap-1 shrink-0">
                      {t.statut === 'En cours' && (
                        <button
                          type="button"
                          title="Marquer terminée"
                          onClick={() => quickStatut(t, 'Terminée')}
                          className="p-1 hover:text-green-400 transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {t.statut === 'Terminée' && (
                        <button
                          type="button"
                          title="Repasser en cours"
                          onClick={() => quickStatut(t, 'En cours')}
                          className="p-1 hover:text-amber-400 transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Modifier"
                        onClick={() => startEdit(t, idx)}
                        className="p-1 hover:text-btp-blue transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Supprimer"
                        onClick={() => handleDelete(t, idx)}
                        className="p-1 hover:text-red-400 transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {taches.length > 0 && (
        <div className="flex justify-between text-xs mt-3 pt-2" style={{ borderTop: '1px solid var(--border-secondary)', color: 'var(--text-tertiary)' }}>
          <span>Total convenu ({taches.length} tâche{taches.length > 1 ? 's' : ''})</span>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatMAD(totalConvenu)}</span>
        </div>
      )}
    </div>
  );
}
