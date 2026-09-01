import { useState, useEffect } from 'react';
import { Plus, Loader2, Edit, Trash2, Users, HardHat, DollarSign, CheckCircle, FileSpreadsheet, Download, Wallet } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import KpiCard from '../components/ui/KpiCard';
import PaiementOuvrierPanel from '../components/ui/PaiementOuvrierPanel';
import TachesIntervenantEditor from '../components/ui/TachesIntervenantEditor';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

const SPECIALITES = [
  "Chef d'équipe",
  "Maçon",
  "Électricien",
  "Plombier",
  "Peintre",
  "Menuisier",
  "Étancheur",
  "Plaquiste / Plâtrier",
  "Carreleur",
  "Coffreur / Ferrailleur",
  "Serrurier / Soudeur",
  "Climatisation / CVC",
  "Conducteur d'engin",
  "Manœuvre"
];

export default function Ouvriers() {
  const { user } = useAuth();
  const [ouvriers, setOuvriers] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOuvrier, setSelectedOuvrier] = useState(null);
  const [ouvrierToDelete, setOuvrierToDelete] = useState(null);
  const [paiementOuvrier, setPaiementOuvrier] = useState(null);

  // Filters
  const [filterSpecialite, setFilterSpecialite] = useState('');
  const [filterChantier, setFilterChantier] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  const handleExportExcel = () => {
    const exportColumns = [
      { header: 'Nom', accessor: 'nom' },
      { header: 'Prénom', accessor: 'prenom' },
      { header: 'CIN', accessor: 'cin' },
      { header: 'Spécialité', accessor: 'specialite' },
      { header: 'Téléphone', accessor: 'telephone' },
      { header: 'Type de rémunération', accessor: 'type_remuneration' },
      { header: 'Tarif Journalier (MAD)', renderText: (row) => row.type_remuneration === 'Tâche' ? 'À la tâche' : (row.tarif_journalier || 0) },
      { header: 'Chantier Affecté', renderText: (row) => row.chantier?.nom || 'Non affecté' },
      { header: 'Statut', accessor: 'statut' }
    ];
    exportToExcel(exportColumns, filteredOuvriers, 'Liste_Personnel_Ouvriers_BTP');
  };

  const handleExportPDF = () => {
    const exportColumns = [
      { header: 'Nom & Prénom', renderText: (row) => `${row.nom} ${row.prenom}` },
      { header: 'Spécialité', accessor: 'specialite' },
      { header: 'Téléphone', renderText: (row) => row.telephone || '—' },
      { header: 'Rémunération', renderText: (row) => row.type_remuneration === 'Tâche' ? 'À la tâche' : `${row.tarif_journalier || 0} MAD/jour` },
      { header: 'Chantier Affecté', renderText: (row) => row.chantier?.nom || 'Dépôt / Non affecté' },
      { header: 'Statut', accessor: 'statut' }
    ];
    exportToPDF({
      title: 'Répertoire Général du Personnel & Intervenants',
      subtitle: `Effectif total : ${filteredOuvriers.length} intervenants`,
      columns: exportColumns,
      data: filteredOuvriers,
      filename: 'Liste_Personnel_Ouvriers_BTP'
    });
  };

  // Form states
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    cin: '',
    telephone: '',
    specialite: 'Maçon',
    type_remuneration: 'Journalier',
    tarif_journalier: '',
    statut: 'Actif',
    chantier_id: ''
  });
  const [tachesLocal, setTachesLocal] = useState([]);

  const [editFormData, setEditFormData] = useState({
    nom: '',
    prenom: '',
    cin: '',
    telephone: '',
    specialite: 'Maçon',
    type_remuneration: 'Journalier',
    tarif_journalier: '',
    statut: 'Actif',
    chantier_id: ''
  });

  const canEdit = user?.role === 'Admin' || user?.role === 'Conducteur';

  useEffect(() => {
    fetchData();
  }, [filterSpecialite, filterChantier, filterStatut]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterSpecialite) params.specialite = filterSpecialite;
      if (filterChantier) params.chantier_id = filterChantier;
      if (filterStatut) params.statut = filterStatut;

      const [ouvriersRes, chantiersRes] = await Promise.all([
        api.get('/ouvriers', { params }),
        api.get('/chantiers')
      ]);

      setOuvriers(ouvriersRes.data);
      setChantiers(chantiersRes.data);
    } catch (error) {
      console.error("Erreur chargement ouvriers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (payload.type_remuneration === 'Tâche') payload.tarif_journalier = '';
      const { data: created } = await api.post('/ouvriers', payload);

      // Créer les tâches saisies pendant la création
      if (formData.type_remuneration === 'Tâche' && tachesLocal.length > 0) {
        await Promise.all(
          tachesLocal.map(t => api.post(`/paiement-ouvriers/${created.id}/taches`, t))
        );
      }

      setIsModalOpen(false);
      setFormData({
        nom: '',
        prenom: '',
        cin: '',
        telephone: '',
        specialite: 'Maçon',
        type_remuneration: 'Journalier',
        tarif_journalier: '',
        statut: 'Actif',
        chantier_id: ''
      });
      setTachesLocal([]);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la création de l\'ouvrier');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (ouvrier) => {
    setSelectedOuvrier(ouvrier);
    setEditFormData({
      nom: ouvrier.nom || '',
      prenom: ouvrier.prenom || '',
      cin: ouvrier.cin || '',
      telephone: ouvrier.telephone || '',
      specialite: ouvrier.specialite || 'Maçon',
      type_remuneration: ouvrier.type_remuneration || 'Journalier',
      tarif_journalier: ouvrier.tarif_journalier || '',
      statut: ouvrier.statut || 'Actif',
      chantier_id: ouvrier.chantier_id || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...editFormData };
      if (payload.type_remuneration === 'Tâche') payload.tarif_journalier = '';
      await api.put(`/ouvriers/${selectedOuvrier.id}`, payload);
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteConfirm = (id) => {
    setOuvrierToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!ouvrierToDelete) return;
    try {
      setSubmitting(true);
      await api.delete(`/ouvriers/${ouvrierToDelete}`);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setSubmitting(false);
      setOuvrierToDelete(null);
    }
  };

  const formatMAD = (val) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val || 0);

  // Stats
  const totalActifs = ouvriers.filter(o => o.statut === 'Actif').length;
  const totalAssignes = ouvriers.filter(o => o.chantier_id && o.statut === 'Actif').length;
  const masseSalarialeJour = ouvriers
    .filter(o => o.statut === 'Actif' && o.type_remuneration !== 'Tâche')
    .reduce((sum, o) => sum + parseFloat(o.tarif_journalier || 0), 0);

  const columns = [
    {
      header: 'Nom & Prénom',
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.nom} {row.prenom}</p>
          {row.cin && <p className="text-xs text-slate-400">CIN: {row.cin}</p>}
        </div>
      )
    },
    { header: 'Spécialité / Métier', accessor: 'specialite', render: (row) => <span className="text-slate-300 font-medium">{row.specialite}</span> },
    { header: 'Téléphone', accessor: 'telephone', render: (row) => row.telephone || '—' },
    { header: 'Chantier Assigné', accessor: 'chantier', render: (row) => row.chantier ? <span className="text-btp-blue font-medium">{row.chantier.nom}</span> : <span className="text-slate-500 italic">Non assigné</span> },
    {
      header: 'Rémunération',
      accessor: 'tarif_journalier',
      render: (row) => row.type_remuneration === 'Tâche'
        ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-btp-blue/15 text-btp-blue">À la tâche</span>
        : <span>{formatMAD(row.tarif_journalier)}<span className="text-slate-500 text-xs"> / jour</span></span>
    },
    { header: 'Statut', accessor: 'statut', render: (row) => <Badge status={row.statut} /> },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); setPaiementOuvrier(row); }}
            className="p-1 text-slate-400 hover:text-green-400 rounded transition-colors"
            title="Gestion du paiement"
          >
            <Wallet className="h-4 w-4" />
          </button>
          {canEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); handleOpenEditModal(row); }}
              className="p-1 text-slate-400 hover:text-[#0284C7] rounded transition-colors"
              title="Modifier"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {user?.role === 'Admin' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleOpenDeleteConfirm(row.id); }}
              className="p-1 text-slate-400 hover:text-[#DC2626] rounded transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-btp-blue animate-spin" />
      </div>
    );
  }

  const filteredOuvriers = ouvriers.filter(o => {
    if (filterSpecialite && o.specialite !== filterSpecialite) return false;
    if (filterChantier && String(o.chantier_id) !== String(filterChantier)) return false;
    if (filterStatut && o.statut !== filterStatut) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Gestion des Ouvriers</h1>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
            title="Exporter la liste des ouvriers sous Excel"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Export Excel
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
            title="Exporter la liste du personnel au format PDF"
          >
            <Download className="h-4 w-4 mr-1.5" /> Liste Personnel PDF
          </button>

          {canEdit && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Ajouter un ouvrier
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="Ouvriers / Artisans Actifs"
          value={totalActifs.toString()}
          icon={Users}
          color="blue"
          subtitle="Effectif total sur le terrain"
        />
        <KpiCard
          title="Intervenants Assignés"
          value={totalAssignes.toString()}
          icon={HardHat}
          color="green"
          subtitle="Actuellement affectés à un chantier"
        />
        <KpiCard
          title="Masse Salariale / Jour"
          value={formatMAD(masseSalarialeJour)}
          icon={DollarSign}
          color="orange"
          subtitle="Coût journalier du personnel"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-btp-blue outline-none"
          value={filterSpecialite}
          onChange={e => setFilterSpecialite(e.target.value)}
        >
          <option value="">Toutes les spécialités</option>
          {SPECIALITES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-btp-blue outline-none"
          value={filterChantier}
          onChange={e => setFilterChantier(e.target.value)}
        >
          <option value="">Tous les chantiers</option>
          {chantiers.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>

        <select
          className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-btp-blue outline-none"
          value={filterStatut}
          onChange={e => setFilterStatut(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
          <option value="En congé">En congé</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filteredOuvriers}
        searchable
        searchPlaceholder="Rechercher par nom, CIN, spécialité..."
      />

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter un Intervenant / Ouvrier">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nom</label>
              <input type="text" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} placeholder="Benali" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Prénom</label>
              <input type="text" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.prenom} onChange={e => setFormData({ ...formData, prenom: e.target.value })} placeholder="Karim" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">N° CIN</label>
              <input type="text" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.cin} onChange={e => setFormData({ ...formData, cin: e.target.value })} placeholder="AB123456" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Téléphone</label>
              <input type="text" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.telephone} onChange={e => setFormData({ ...formData, telephone: e.target.value })} placeholder="0661234567" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Spécialité / Métier</label>
              <select className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.specialite} onChange={e => setFormData({ ...formData, specialite: e.target.value })}>
                {SPECIALITES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Type de rémunération</label>
              <select className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.type_remuneration} onChange={e => setFormData({ ...formData, type_remuneration: e.target.value })}>
                <option value="Journalier">Journalier (payé au jour)</option>
                <option value="Tâche">À la tâche (mission ponctuelle)</option>
              </select>
            </div>
          </div>

          {formData.type_remuneration === 'Journalier' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tarif Journalier (MAD)</label>
                <input type="number" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.tarif_journalier} onChange={e => setFormData({ ...formData, tarif_journalier: e.target.value })} placeholder="250" />
              </div>
            </div>
          ) : (
            <TachesIntervenantEditor mode="local" value={tachesLocal} onChange={setTachesLocal} />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Chantier Assigné</label>
              <select className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.chantier_id} onChange={e => setFormData({ ...formData, chantier_id: e.target.value })}>
                <option value="">Aucun (Non assigné)</option>
                {chantiers.map(c => <option key={c.id} value={c.id}>{c.code_chantier} — {c.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Statut</label>
              <select className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.statut} onChange={e => setFormData({ ...formData, statut: e.target.value })}>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="En congé">En congé</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => { setIsModalOpen(false); setTachesLocal([]); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors disabled:opacity-50">
              {submitting ? 'Enregistrement...' : 'Ajouter l\'intervenant'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier l'Intervenant">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nom</label>
              <input type="text" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.nom} onChange={e => setEditFormData({ ...editFormData, nom: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Prénom</label>
              <input type="text" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.prenom} onChange={e => setEditFormData({ ...editFormData, prenom: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">N° CIN</label>
              <input type="text" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.cin} onChange={e => setEditFormData({ ...editFormData, cin: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Téléphone</label>
              <input type="text" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.telephone} onChange={e => setEditFormData({ ...editFormData, telephone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Spécialité / Métier</label>
              <select className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.specialite} onChange={e => setEditFormData({ ...editFormData, specialite: e.target.value })}>
                {SPECIALITES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Type de rémunération</label>
              <select className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.type_remuneration} onChange={e => setEditFormData({ ...editFormData, type_remuneration: e.target.value })}>
                <option value="Journalier">Journalier (payé au jour)</option>
                <option value="Tâche">À la tâche (mission ponctuelle)</option>
              </select>
            </div>
          </div>

          {editFormData.type_remuneration === 'Journalier' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tarif Journalier (MAD)</label>
                <input type="number" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.tarif_journalier} onChange={e => setEditFormData({ ...editFormData, tarif_journalier: e.target.value })} />
              </div>
            </div>
          ) : (
            selectedOuvrier && <TachesIntervenantEditor mode="api" ouvrierId={selectedOuvrier.id} canEdit={canEdit} />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Chantier Assigné</label>
              <select className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.chantier_id} onChange={e => setEditFormData({ ...editFormData, chantier_id: e.target.value })}>
                <option value="">Aucun (Non assigné)</option>
                {chantiers.map(c => <option key={c.id} value={c.id}>{c.code_chantier} — {c.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Statut</label>
              <select className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.statut} onChange={e => setEditFormData({ ...editFormData, statut: e.target.value })}>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="En congé">En congé</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors disabled:opacity-50">
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'ouvrier"
        message="Êtes-vous sûr de vouloir supprimer cet ouvrier ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      {/* Paiement Panel Modal */}
      <Modal
        isOpen={!!paiementOuvrier}
        onClose={() => setPaiementOuvrier(null)}
        title={paiementOuvrier ? `Paiement — ${paiementOuvrier.prenom} ${paiementOuvrier.nom}` : ''}
        maxWidth="max-w-xl"
      >
        {paiementOuvrier && (
          <PaiementOuvrierPanel
            ouvrier={paiementOuvrier}
            onClose={() => setPaiementOuvrier(null)}
          />
        )}
      </Modal>
    </div>
  );
}
