import { useState, useEffect } from 'react';
import { Plus, Loader2, Edit, Trash2, FileText, TrendingDown, CheckCircle, AlertCircle, Printer } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import KpiCard from '../components/ui/KpiCard';
import InvoicePrintTemplate from '../components/ui/InvoicePrintTemplate';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Factures() {
  const { user } = useAuth();
  const [factures, setFactures] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [factureToDelete, setFactureToDelete] = useState(null);
  const [printFacture, setPrintFacture] = useState(null);

  const handlePrint = (facture) => {
    setPrintFacture(facture);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Filters
  const [filterStatut, setFilterStatut] = useState('');
  const [filterChantier, setFilterChantier] = useState('');
  const [filterFournisseur, setFilterFournisseur] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    num_facture: '',
    fournisseur_id: '',
    chantier_id: '',
    date_emission: '',
    date_echeance: '',
    montant_ht: '',
    montant_tva: '',
    montant_ttc: '',
    statut_paiement: 'En attente'
  });

  const [editFormData, setEditFormData] = useState({
    num_facture: '',
    fournisseur_id: '',
    chantier_id: '',
    date_emission: '',
    date_echeance: '',
    montant_ht: '',
    montant_tva: '',
    montant_ttc: '',
    statut_paiement: 'En attente'
  });

  const canEdit = user?.role === 'Admin' || user?.role === 'Achats';

  useEffect(() => {
    fetchData();
  }, [filterStatut, filterChantier, filterFournisseur]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatut) params.statut_paiement = filterStatut;
      if (filterChantier) params.chantier_id = filterChantier;
      if (filterFournisseur) params.fournisseur_id = filterFournisseur;

      const [facturesRes, chantiersRes, fournisseursRes] = await Promise.all([
        api.get('/factures', { params }),
        api.get('/chantiers'),
        api.get('/fournisseurs')
      ]);

      setFactures(facturesRes.data);
      setChantiers(chantiersRes.data);
      setFournisseurs(fournisseursRes.data);
    } catch (error) {
      console.error("Erreur chargement factures:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHtChange = (val, formType = 'create') => {
    const ht = parseFloat(val) || 0;
    const tva = Math.round(ht * 0.20 * 100) / 100; // 20% default TVA
    const ttc = Math.round((ht + tva) * 100) / 100;

    if (formType === 'create') {
      setFormData(prev => ({
        ...prev,
        montant_ht: val,
        montant_tva: tva.toString(),
        montant_ttc: ttc.toString()
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        montant_ht: val,
        montant_tva: tva.toString(),
        montant_ttc: ttc.toString()
      }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/factures', formData);
      setIsModalOpen(false);
      setFormData({
        num_facture: '',
        fournisseur_id: '',
        chantier_id: '',
        date_emission: '',
        date_echeance: '',
        montant_ht: '',
        montant_tva: '',
        montant_ttc: '',
        statut_paiement: 'En attente'
      });
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (facture) => {
    setSelectedFacture(facture);
    setEditFormData({
      num_facture: facture.num_facture || '',
      fournisseur_id: facture.fournisseur_id || '',
      chantier_id: facture.chantier_id || '',
      date_emission: facture.date_emission ? facture.date_emission.split('T')[0] : '',
      date_echeance: facture.date_echeance ? facture.date_echeance.split('T')[0] : '',
      montant_ht: facture.montant_ht || '',
      montant_tva: facture.montant_tva || '',
      montant_ttc: facture.montant_ttc || '',
      statut_paiement: facture.statut_paiement || 'En attente'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/factures/${selectedFacture.id}`, editFormData);
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
    setFactureToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!factureToDelete) return;
    try {
      setSubmitting(true);
      await api.delete(`/factures/${factureToDelete}`);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setSubmitting(false);
      setFactureToDelete(null);
    }
  };

  const formatMAD = (val) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val || 0);

  // Calculate stats
  const totalDues = factures
    .filter(f => f.statut_paiement === 'En attente' || f.statut_paiement === 'Partiellement payée')
    .reduce((sum, f) => sum + parseFloat(f.montant_ttc || 0), 0);

  const totalPayees = factures
    .filter(f => f.statut_paiement === 'Payée')
    .reduce((sum, f) => sum + parseFloat(f.montant_ttc || 0), 0);

  const totalEchues = factures
    .filter(f => f.statut_paiement === 'Échue')
    .reduce((sum, f) => sum + parseFloat(f.montant_ttc || 0), 0);

  const columns = [
    { header: 'N° Facture', accessor: 'num_facture', render: (row) => <span className="font-semibold text-white">{row.num_facture}</span> },
    { header: 'Fournisseur', accessor: 'fournisseur', render: (row) => <span className="text-slate-300">{row.fournisseur?.raison_sociale || '—'}</span> },
    { header: 'Chantier', accessor: 'chantier', render: (row) => <span className="text-slate-300">{row.chantier?.nom || '—'}</span> },
    { header: 'Émission', accessor: 'date_emission', render: (row) => new Date(row.date_emission).toLocaleDateString('fr-FR') },
    { header: 'Échéance', accessor: 'date_echeance', render: (row) => row.date_echeance ? new Date(row.date_echeance).toLocaleDateString('fr-FR') : '—' },
    { header: 'Montant TTC', accessor: 'montant_ttc', render: (row) => formatMAD(row.montant_ttc) },
    { header: 'Statut', accessor: 'statut_paiement', render: (row) => <Badge status={row.statut_paiement} /> },
    { 
      header: 'Actions', 
      render: (row) => (
        <div className="flex items-center space-x-2">
          {canEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleOpenEditModal(row); }}
              className="p-1 text-slate-400 hover:text-[#0284C7] rounded transition-colors"
              title="Modifier"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrint(row); }}
            className="p-1 text-slate-400 hover:text-[#16A34A] rounded transition-colors"
            title="Imprimer la Facture"
          >
            <Printer className="h-4 w-4" />
          </button>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Gestion des Factures</h1>
        {canEdit && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle Facture
          </button>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          title="Factures en Attente" 
          value={formatMAD(totalDues)} 
          icon={TrendingDown} 
          color="orange" 
          subtitle="Montant restant à régler"
        />
        <KpiCard 
          title="Règlements Effectués" 
          value={formatMAD(totalPayees)} 
          icon={CheckCircle} 
          color="green" 
          subtitle="Montant payé validé"
        />
        <KpiCard 
          title="Factures Échues" 
          value={formatMAD(totalEchues)} 
          icon={AlertCircle} 
          color="red" 
          subtitle="Paiements en retard"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select 
          className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-btp-blue outline-none"
          value={filterStatut}
          onChange={e => setFilterStatut(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="En attente">En attente</option>
          <option value="Payée">Payée</option>
          <option value="Échue">Échue</option>
          <option value="Partiellement payée">Partiellement payée</option>
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
          value={filterFournisseur}
          onChange={e => setFilterFournisseur(e.target.value)}
        >
          <option value="">Tous les fournisseurs</option>
          {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.raison_sociale}</option>)}
        </select>
      </div>

      <DataTable 
        columns={columns} 
        data={factures} 
        searchable 
        searchPlaceholder="Rechercher une facture..."
      />

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Facture">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">N° Facture</label>
            <input type="text" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" placeholder="FAC-2024-001" value={formData.num_facture} onChange={e => setFormData({...formData, num_facture: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Chantier</label>
              <select required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.chantier_id} onChange={e => setFormData({...formData, chantier_id: e.target.value})}>
                <option value="">Sélectionner...</option>
                {chantiers.map(c => <option key={c.id} value={c.id}>{c.code_chantier} — {c.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Fournisseur</label>
              <select required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.fournisseur_id} onChange={e => setFormData({...formData, fournisseur_id: e.target.value})}>
                <option value="">Sélectionner...</option>
                {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.code_fournisseur} — {f.raison_sociale}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date d'émission</label>
              <input type="date" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.date_emission} onChange={e => setFormData({...formData, date_emission: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date d'échéance</label>
              <input type="date" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.date_echeance} onChange={e => setFormData({...formData, date_echeance: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Montant HT (MAD)</label>
              <input type="number" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.montant_ht} onChange={e => handleHtChange(e.target.value, 'create')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">TVA (MAD)</label>
              <input type="number" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.montant_tva} onChange={e => setFormData({...formData, montant_tva: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Montant TTC (MAD)</label>
              <input type="number" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.montant_ttc} onChange={e => setFormData({...formData, montant_ttc: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Statut Paiement</label>
              <select className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.statut_paiement} onChange={e => setFormData({...formData, statut_paiement: e.target.value})}>
                <option value="En attente">En attente</option>
                <option value="Payée">Payée</option>
                <option value="Échue">Échue</option>
                <option value="Partiellement payée">Partiellement payée</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors disabled:opacity-50">
              {submitting ? 'Création...' : 'Créer la facture'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier la Facture">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">N° Facture</label>
            <input type="text" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.num_facture} onChange={e => setEditFormData({...editFormData, num_facture: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Chantier</label>
              <select required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.chantier_id} onChange={e => setEditFormData({...editFormData, chantier_id: e.target.value})}>
                <option value="">Sélectionner...</option>
                {chantiers.map(c => <option key={c.id} value={c.id}>{c.code_chantier} — {c.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Fournisseur</label>
              <select required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.fournisseur_id} onChange={e => setEditFormData({...editFormData, fournisseur_id: e.target.value})}>
                <option value="">Sélectionner...</option>
                {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.code_fournisseur} — {f.raison_sociale}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date d'émission</label>
              <input type="date" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.date_emission} onChange={e => setEditFormData({...editFormData, date_emission: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date d'échéance</label>
              <input type="date" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.date_echeance} onChange={e => setEditFormData({...editFormData, date_echeance: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Montant HT (MAD)</label>
              <input type="number" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.montant_ht} onChange={e => handleHtChange(e.target.value, 'edit')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">TVA (MAD)</label>
              <input type="number" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.montant_tva} onChange={e => setEditFormData({...editFormData, montant_tva: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Montant TTC (MAD)</label>
              <input type="number" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.montant_ttc} onChange={e => setEditFormData({...editFormData, montant_ttc: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Statut Paiement</label>
              <select className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={editFormData.statut_paiement} onChange={e => setEditFormData({...editFormData, statut_paiement: e.target.value})}>
                <option value="En attente">En attente</option>
                <option value="Payée">Payée</option>
                <option value="Échue">Échue</option>
                <option value="Partiellement payée">Partiellement payée</option>
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
        title="Supprimer la facture"
        message="Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      {/* Printable Invoice Area */}
      <InvoicePrintTemplate facture={printFacture} />
    </div>
  );
}
