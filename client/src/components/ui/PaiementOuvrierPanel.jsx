import { useState, useEffect, useCallback } from 'react';
import {
  Wallet, Plus, Trash2, CheckCircle2, Clock,
  Loader2, AlertCircle, History, ClipboardList
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import TachesIntervenantEditor from './TachesIntervenantEditor';

const formatMAD = (val) =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 2 }).format(val || 0);

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Retourne les dates lundi–samedi de la semaine ISO donnée
function getWeekRange(semaine, annee) {
  const simple = new Date(annee, 0, 1 + (semaine - 1) * 7);
  const dow = simple.getDay();
  const lundi = new Date(simple);
  lundi.setDate(simple.getDate() - ((dow + 6) % 7));
  const samedi = new Date(lundi);
  samedi.setDate(lundi.getDate() + 5);
  return {
    lundi: lundi.toLocaleDateString('fr-MA', { day: '2-digit', month: 'short' }),
    samedi: samedi.toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' })
  };
}

// ── Styles thème (cohérents avec Modal / TaskDrawer) ──
const cardStyle = {
  backgroundColor: 'var(--bg-hover)',
  border: '1px solid var(--border-secondary)',
};
const inputStyle = {
  backgroundColor: 'var(--bg-input)',
  borderColor: 'var(--border-primary)',
  color: 'var(--text-primary)',
};

export default function PaiementOuvrierPanel({ ouvrier }) {
  const { user } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'Conducteur';

  const [tab, setTab] = useState('semaine'); // 'semaine' | 'historique'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Données semaine courante
  const [paiement, setPaiement] = useState(null);
  const [avances, setAvances] = useState([]);
  const [taches, setTaches] = useState([]);
  const [semaine, setSemaine] = useState(null);
  const [annee, setAnnee] = useState(null);
  const [jours, setJours] = useState('0');

  // Formulaire avance
  const [showAvanceForm, setShowAvanceForm] = useState(false);
  const [avanceForm, setAvanceForm] = useState({
    montant: '',
    date_avance: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Historique
  const [historique, setHistorique] = useState([]);
  const [loadingHisto, setLoadingHisto] = useState(false);

  const typeRem = paiement?.type_remuneration || ouvrier.type_remuneration || 'Journalier';
  const isTache = typeRem === 'Tâche';

  const fetchSemaine = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/paiement-ouvriers/${ouvrier.id}/semaine-courante`);
      setPaiement(data.paiement);
      setAvances(data.avances);
      setTaches(data.taches || []);
      setSemaine(data.semaine);
      setAnnee(data.annee);
      setJours(String(data.paiement.jours_travailles ?? '0'));
    } finally {
      setLoading(false);
    }
  }, [ouvrier.id]);

  useEffect(() => { fetchSemaine(); }, [fetchSemaine]);

  useEffect(() => {
    if (tab === 'historique' && historique.length === 0) {
      setLoadingHisto(true);
      api.get(`/paiement-ouvriers/${ouvrier.id}/historique`)
        .then(({ data }) => setHistorique(data))
        .finally(() => setLoadingHisto(false));
    }
  }, [tab, ouvrier.id, historique.length]);

  const handleJoursBlur = async () => {
    if (!canEdit || paiement?.statut === 'Payé') return;
    const val = parseFloat(jours);
    if (isNaN(val) || val < 0 || val > 7) return;
    try {
      setSaving(true);
      await api.put(`/paiement-ouvriers/${ouvrier.id}/jours`, { jours_travailles: val });
      await fetchSemaine();
    } finally {
      setSaving(false);
    }
  };

  const handleAddAvance = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    try {
      setSaving(true);
      await api.post(`/paiement-ouvriers/${ouvrier.id}/avances`, {
        montant: parseFloat(avanceForm.montant),
        date_avance: avanceForm.date_avance,
        notes: avanceForm.notes
      });
      setAvanceForm({ montant: '', date_avance: new Date().toISOString().split('T')[0], notes: '' });
      setShowAvanceForm(false);
      await fetchSemaine();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAvance = async (avanceId) => {
    if (!canEdit) return;
    if (!confirm('Supprimer cette avance ?')) return;
    try {
      setSaving(true);
      await api.delete(`/paiement-ouvriers/avances/${avanceId}`);
      await fetchSemaine();
    } finally {
      setSaving(false);
    }
  };

  const handlePayer = async () => {
    if (!canEdit) return;
    if (!confirm(`Confirmer le paiement de ${formatMAD(resteLive)} à ${ouvrier.prenom} ${ouvrier.nom} ?`)) return;
    try {
      setSaving(true);
      await api.post(`/paiement-ouvriers/${ouvrier.id}/payer`);
      await fetchSemaine();
      setHistorique([]); // forcer le rechargement de l'historique
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du paiement');
    } finally {
      setSaving(false);
    }
  };

  const dejaPayee = paiement?.statut === 'Payé';
  const weekRange = semaine && annee ? getWeekRange(semaine, annee) : null;

  // Calcul live à l'affichage
  const tarif = parseFloat(ouvrier.tarif_journalier || 0);
  const joursVal = parseFloat(jours || 0);
  const tachesTerminees = taches.filter(t => t.statut === 'Terminée');
  const totalTachesLive = isTache
    ? (dejaPayee
        ? parseFloat(paiement?.total_taches || 0)
        : tachesTerminees.reduce((s, t) => s + parseFloat(t.montant || 0), 0))
    : 0;
  const brutLive = isTache ? totalTachesLive : tarif * joursVal;
  const totalAvancesLive = avances.reduce((s, a) => s + parseFloat(a.montant || 0), 0);
  const resteLive = brutLive - totalAvancesLive;
  // Intervenant à la tâche : une avance versée avant la fin d'une tâche est
  // reportée. On ne bloque pas, mais on ne peut clôturer que si le solde est positif.
  const avanceReportee = isTache && resteLive < 0;
  const payDisabled = dejaPayee || saving || (isTache ? (tachesTerminees.length === 0 || resteLive < 0) : joursVal === 0);

  return (
    <div className="flex flex-col h-full">
      {/* Sous-titre intervenant */}
      <p className="flex items-center gap-1.5 text-sm mb-5" style={{ color: 'var(--text-tertiary)' }}>
        <Wallet className="h-4 w-4 text-btp-blue" />
        {ouvrier.specialite} ·{' '}
        {isTache ? (
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Payé à la tâche</span>
        ) : (
          <>Tarif : <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatMAD(ouvrier.tarif_journalier)}/jour</span></>
        )}
      </p>

      {/* Onglets */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
        <button
          onClick={() => setTab('semaine')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'semaine' ? 'bg-btp-blue text-white' : ''}`}
          style={tab === 'semaine' ? {} : { color: 'var(--text-tertiary)' }}
        >
          Semaine courante
        </button>
        <button
          onClick={() => setTab('historique')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${tab === 'historique' ? 'bg-btp-blue text-white' : ''}`}
          style={tab === 'historique' ? {} : { color: 'var(--text-tertiary)' }}
        >
          <History className="h-3.5 w-3.5" /> Historique
        </button>
      </div>

      {tab === 'semaine' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-btp-blue" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Badge semaine */}
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Semaine {semaine} · {weekRange?.lundi} → {weekRange?.samedi}
                </span>
                {dejaPayee ? (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: 'var(--success)', backgroundColor: 'var(--success-bg)' }}>
                    <CheckCircle2 className="h-3 w-3" /> Payée le {formatDate(paiement.date_paiement)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: 'var(--warning)', backgroundColor: 'var(--warning-bg)' }}>
                    <Clock className="h-3 w-3" /> En cours
                  </span>
                )}
              </div>

              {/* Jours travaillés (Journalier) OU Tâches (À la tâche) */}
              {isTache ? (
                <TachesIntervenantEditor
                  mode="api"
                  ouvrierId={ouvrier.id}
                  canEdit={canEdit && !dejaPayee}
                  onChanged={fetchSemaine}
                />
              ) : (
                <div className="rounded-xl p-4" style={cardStyle}>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Jours travaillés cette semaine
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="7"
                      step="0.5"
                      disabled={dejaPayee || !canEdit}
                      className="w-28 border rounded-lg px-3 py-2 text-center text-lg font-bold focus:border-btp-blue outline-none disabled:opacity-50"
                      style={inputStyle}
                      value={jours}
                      onChange={e => setJours(e.target.value)}
                      onBlur={handleJoursBlur}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>jours (0 à 7, demi-journées acceptées)</span>
                    {saving && <Loader2 className="h-4 w-4 animate-spin text-btp-blue" />}
                  </div>
                </div>
              )}

              {/* Avances */}
              <div className="rounded-xl p-4" style={cardStyle}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {isTache ? 'Avances non encore déduites' : 'Avances de la semaine'}
                  </h3>
                  {canEdit && !dejaPayee && (
                    <button
                      onClick={() => setShowAvanceForm(v => !v)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Donner une avance
                    </button>
                  )}
                </div>

                {/* Formulaire avance inline */}
                {showAvanceForm && (
                  <form onSubmit={handleAddAvance} className="mb-3 p-3 rounded-lg space-y-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Montant (MAD)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          step="0.01"
                          className="w-full border rounded-lg px-3 py-2 focus:border-btp-blue outline-none text-sm"
                          style={{ ...inputStyle, backgroundColor: 'var(--bg-secondary)' }}
                          placeholder="200"
                          value={avanceForm.montant}
                          onChange={e => setAvanceForm({ ...avanceForm, montant: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Date</label>
                        <input
                          type="date"
                          required
                          className="w-full border rounded-lg px-3 py-2 focus:border-btp-blue outline-none text-sm"
                          style={{ ...inputStyle, backgroundColor: 'var(--bg-secondary)' }}
                          value={avanceForm.date_avance}
                          onChange={e => setAvanceForm({ ...avanceForm, date_avance: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Note (optionnel)</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 focus:border-btp-blue outline-none text-sm"
                        style={{ ...inputStyle, backgroundColor: 'var(--bg-secondary)' }}
                        placeholder="Avance exceptionnelle..."
                        value={avanceForm.notes}
                        onChange={e => setAvanceForm({ ...avanceForm, notes: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setShowAvanceForm(false)} className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                        Annuler
                      </button>
                      <button type="submit" disabled={saving} className="px-3 py-1.5 text-xs bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors disabled:opacity-50">
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  </form>
                )}

                {avances.length === 0 ? (
                  <p className="text-sm italic text-center py-3" style={{ color: 'var(--text-muted)' }}>
                    {isTache ? 'Aucune avance en cours' : 'Aucune avance cette semaine'}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {avances.map(a => (
                      <li key={a.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--bg-input)' }}>
                        <div>
                          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{formatMAD(a.montant)}</span>
                          <span className="text-xs ml-2" style={{ color: 'var(--text-tertiary)' }}>{formatDate(a.date_avance)}</span>
                          {a.notes && <span className="text-xs ml-2 italic" style={{ color: 'var(--text-muted)' }}>— {a.notes}</span>}
                        </div>
                        {canEdit && !dejaPayee && (
                          <button
                            onClick={() => handleDeleteAvance(a.id)}
                            className="p-1 hover:text-red-400 transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Récapitulatif */}
              <div className="rounded-xl p-4 space-y-2" style={cardStyle}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Récapitulatif</h3>
                <div className="flex justify-between text-sm">
                  {isTache ? (
                    <span style={{ color: 'var(--text-tertiary)' }}>
                      Tâches terminées ({tachesTerminees.length})
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-tertiary)' }}>
                      Salaire brut ({joursVal} j × {formatMAD(tarif)})
                    </span>
                  )}
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatMAD(brutLive)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-tertiary)' }}>{isTache ? 'Avances déjà versées' : 'Total avances'}</span>
                  <span className="font-medium" style={{ color: 'var(--warning)' }}>− {formatMAD(totalAvancesLive)}</span>
                </div>
                <div className="pt-2 mt-2 flex justify-between" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {avanceReportee ? 'Avance à reporter' : 'Reste à payer le samedi'}
                  </span>
                  <span className="text-lg font-bold" style={{ color: avanceReportee ? 'var(--warning)' : (resteLive < 0 ? 'var(--danger)' : 'var(--success)') }}>
                    {formatMAD(resteLive)}
                  </span>
                </div>
                {avanceReportee && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Cette avance sera déduite automatiquement dès qu'une tâche terminée sera réglée.
                  </p>
                )}
              </div>

              {/* Bouton Payer */}
              {canEdit && (
                <button
                  onClick={handlePayer}
                  disabled={payDisabled}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={
                    dejaPayee
                      ? { backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--border-secondary)', cursor: 'not-allowed' }
                      : { backgroundColor: '#15803D', color: '#FFFFFF' }
                  }
                >
                  {dejaPayee ? (
                    <><CheckCircle2 className="h-4 w-4" /> Semaine clôturée — Payée</>
                  ) : avanceReportee ? (
                    <><CheckCircle2 className="h-4 w-4" /> Clôture indisponible — avance à reporter</>
                  ) : isTache ? (
                    <><CheckCircle2 className="h-4 w-4" /> Régler {formatMAD(resteLive)} — Clôturer la semaine</>
                  ) : (
                    <><CheckCircle2 className="h-4 w-4" /> Payer {formatMAD(resteLive)} — Clôturer la semaine</>
                  )}
                </button>
              )}

              {!dejaPayee && isTache && tachesTerminees.length === 0 && (
                <p className="flex items-center gap-1.5 text-xs justify-center text-center" style={{ color: 'var(--warning)' }}>
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {totalAvancesLive > 0
                    ? 'Avance enregistrée. Elle sera déduite dès qu\'une tâche terminée sera réglée.'
                    : 'Marquez au moins une tâche comme « Terminée » avant de régler.'}
                </p>
              )}

              {!dejaPayee && avanceReportee && tachesTerminees.length > 0 && (
                <p className="flex items-center gap-1.5 text-xs justify-center text-center" style={{ color: 'var(--warning)' }}>
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Les avances versées dépassent les tâches terminées. Terminez d'autres tâches ou supprimez une avance pour clôturer.
                </p>
              )}

              {!dejaPayee && !isTache && joursVal === 0 && (
                <p className="flex items-center gap-1.5 text-xs justify-center" style={{ color: 'var(--warning)' }}>
                  <AlertCircle className="h-3.5 w-3.5" />
                  Saisissez le nombre de jours travaillés avant de payer.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'historique' && (
        <div>
          {loadingHisto ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-btp-blue" />
            </div>
          ) : historique.length === 0 ? (
            <p className="text-sm italic text-center py-10" style={{ color: 'var(--text-muted)' }}>Aucun historique disponible.</p>
          ) : (
            <div className="space-y-3">
              {historique.map(p => {
                const range = getWeekRange(p.semaine, p.annee);
                const semaineTache = p.type_remuneration === 'Tâche';
                return (
                  <div key={p.id} className="rounded-xl p-4" style={cardStyle}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Semaine {p.semaine} / {p.annee}</span>
                        <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{range.lundi} → {range.samedi}</span>
                      </div>
                      {p.statut === 'Payé' ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1" style={{ color: 'var(--success)', backgroundColor: 'var(--success-bg)' }}>
                          <CheckCircle2 className="h-3 w-3" /> Payé
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ color: 'var(--warning)', backgroundColor: 'var(--warning-bg)' }}>En cours</span>
                      )}
                    </div>

                    {semaineTache ? (
                      <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                        <div className="text-center">
                          <div style={{ color: 'var(--text-tertiary)' }}>Tâches réglées</div>
                          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.taches_reglees?.length || 0}</div>
                        </div>
                        <div className="text-center">
                          <div style={{ color: 'var(--text-tertiary)' }}>Avances</div>
                          <div className="font-semibold" style={{ color: 'var(--warning)' }}>{formatMAD(p.total_avances)}</div>
                        </div>
                        <div className="text-center">
                          <div style={{ color: 'var(--text-tertiary)' }}>Payé</div>
                          <div className="font-bold" style={{ color: 'var(--success)' }}>{formatMAD(p.reste_paye)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 text-xs mt-2">
                        <div className="text-center">
                          <div style={{ color: 'var(--text-tertiary)' }}>Jours</div>
                          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.jours_travailles}</div>
                        </div>
                        <div className="text-center">
                          <div style={{ color: 'var(--text-tertiary)' }}>Brut</div>
                          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatMAD(p.total_brut)}</div>
                        </div>
                        <div className="text-center">
                          <div style={{ color: 'var(--text-tertiary)' }}>Avances</div>
                          <div className="font-semibold" style={{ color: 'var(--warning)' }}>{formatMAD(p.total_avances)}</div>
                        </div>
                        <div className="text-center">
                          <div style={{ color: 'var(--text-tertiary)' }}>Payé</div>
                          <div className="font-bold" style={{ color: 'var(--success)' }}>{formatMAD(p.reste_paye)}</div>
                        </div>
                      </div>
                    )}

                    {semaineTache && p.taches_reglees?.length > 0 && (
                      <div className="mt-2 pt-2 space-y-1" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                        <p className="flex items-center gap-1 text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                          <ClipboardList className="h-3 w-3" /> Tâches réglées :
                        </p>
                        {p.taches_reglees.map(t => (
                          <div key={t.id} className="flex items-center justify-between text-xs rounded-md px-2 py-1" style={{ backgroundColor: 'var(--bg-input)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              {t.nom}
                              <span className="ml-1" style={{ color: 'var(--text-muted)' }}>
                                ({formatDate(t.date_debut)}{t.date_fin ? ` → ${formatDate(t.date_fin)}` : ''})
                              </span>
                            </span>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatMAD(t.montant)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {p.avances?.length > 0 && (
                      <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Avances :</p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.avances.map(a => (
                            <span key={a.id} className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                              {formatMAD(a.montant)} · {formatDate(a.date_avance)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
