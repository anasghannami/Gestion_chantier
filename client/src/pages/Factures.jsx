import { useState, useEffect } from 'react';
import { Plus, Loader2, Edit, Trash2, FileText, TrendingDown, CheckCircle, AlertCircle, Printer, FileSpreadsheet, Download, CreditCard, DollarSign } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import KpiCard from '../components/ui/KpiCard';
import InvoicePrintTemplate from '../components/ui/InvoicePrintTemplate';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

export default function Factures() {
  const { user } = useAuth();
  const [factures, setFactures] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [factureToDelete, setFactureToDelete] = useState(null);
  const [printFacture, setPrintFacture] = useState(null);

  const [paymentData, setPaymentData] = useState({
    date_paiement: new Date().toISOString().split('T')[0],
    montant: '',
    mode_paiement: 'Virement',
    reference: '',
    notes: ''
  });

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

  const handleExportExcel = () => {
    const exportColumns = [
      { header: 'N° Facture', accessor: 'num_facture' },
      { header: 'Fournisseur', renderText: (row) => row.fournisseur?.raison_sociale || '—' },
      { header: 'Chantier', renderText: (row) => row.chantier?.nom || '—' },
      { header: 'Date Émission', renderText: (row) => new Date(row.date_emission).toLocaleDateString('fr-FR') },
      { header: 'Date Échéance', renderText: (row) => row.date_echeance ? new Date(row.date_echeance).toLocaleDateString('fr-FR') : '—' },
      { header: 'Montant HT (MAD)', accessor: 'montant_ht' },
      { header: 'Montant TTC (MAD)', accessor: 'montant_ttc' },
      { header: 'Statut Paiement', accessor: 'statut_paiement' }
    ];
    exportToExcel(exportColumns, filteredFactures, 'Journal_Factures_BTP');
  };

  const handleExportPDF = () => {
    const exportColumns = [
      { header: 'N° Facture', accessor: 'num_facture' },
      { header: 'Fournisseur', renderText: (row) => row.fournisseur?.raison_sociale || '—' },
      { header: 'Chantier', renderText: (row) => row.chantier?.nom || '—' },
      { header: 'Date Émission', renderText: (row) => new Date(row.date_emission).toLocaleDateString('fr-FR') },
      { header: 'Montant TTC (MAD)', renderText: (row) => formatMAD(row.montant_ttc) },
      { header: 'Statut Paiement', accessor: 'statut_paiement' }
    ];
    exportToPDF({
      title: 'Journal Général des Factures & Règlements',
      subtitle: `Exportation comptable • Total Factures : ${filteredFactures.length}`,
      columns: exportColumns,
      data: filteredFactures,
      filename: 'Journal_Factures_BTP'
    });
  };

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

  const handleOpenPaymentModal = (facture) => {
    setSelectedFacture(facture);
    setPaymentData({
      date_paiement: new Date().toISOString().split('T')[0],
      montant: (facture.reste_a_payer || facture.montant_ttc || 0).toString(),
      mode_paiement: 'Virement',
      reference: '',
      notes: ''
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacture) return;
    try {
      setSubmitting(true);
      await api.post(`/factures/${selectedFacture.id}/paiements`, paymentData);
      setIsPaymentModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors du règlement');
    } finally {
      setSubmitting(false);
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
    { 
      header: 'N° Facture', 
      accessor: 'num_facture', 
      render: (row) => (
        <div>
          <span className="font-semibold text-white">{row.num_facture}</span>
          {row.type_facture === 'Acompte' && (
            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Acompte {row.pourcentage_acompte}%
            </span>
          )}
        </div>
      ) 
    },
    { header: 'Tier / Client / Fournisseur', accessor: 'fournisseur', render: (row) => <span className="text-slate-300">{row.client_nom || row.fournisseur?.raison_sociale || '—'}</span> },
    { header: 'Chantier', accessor: 'chantier', render: (row) => <span className="text-slate-300">{row.chantier?.nom || '—'}</span> },
    { header: 'Émission', accessor: 'date_emission', render: (row) => new Date(row.date_emission).toLocaleDateString('fr-FR') },
    { header: 'Montant TTC', accessor: 'montant_ttc', render: (row) => formatMAD(row.montant_ttc) },
    { 
      header: 'Reste à Payer', 
      accessor: 'reste_a_payer', 
      render: (row) => {
        const reste = row.reste_a_payer !== undefined ? row.reste_a_payer : parseFloat(row.montant_ttc || 0);
        return (
          <span className={`font-semibold text-xs ${reste === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {formatMAD(reste)}
          </span>
        );
      } 
    },
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

  const filteredFactures = factures.filter(f => {
    if (filterStatut && f.statut_paiement !== filterStatut) return false;
    if (filterChantier && String(f.chantier_id) !== String(filterChantier)) return false;
    if (filterFournisseur && String(f.fournisseur_id) !== String(filterFournisseur)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Gestion des Factures</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleExportExcel}
            className="flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
            title="Exporter le journal des factures sous Excel"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Export Excel
          </button>

          <button 
            onClick={handleExportPDF}
            className="flex items-center px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
            title="Exporter le rapport PDF du journal des factures"
          >
            <Download className="h-4 w-4 mr-1.5" /> Journal PDF
          </button>

          {canEdit && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Nouvelle Facture
            </button>
          )}
        </div>
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
        data={filteredFactures} 
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

      {/* Modal Enregistrer un règlement */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={`Enregistrer un règlement pour ${selectedFacture?.num_facture}`}>
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1 text-xs mb-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Facture TTC :</span>
              <span className="font-semibold text-white">{selectedFacture ? formatMAD(selectedFacture.montant_ttc) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Déjà Payé :</span>
              <span className="font-semibold text-emerald-400">{selectedFacture ? formatMAD(selectedFacture.total_paye || 0) : '—'}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1 text-sm">
              <span className="font-bold text-amber-300">Reste à payer :</span>
              <span className="font-bold text-amber-400">{selectedFacture ? formatMAD(selectedFacture.reste_a_payer || selectedFacture.montant_ttc) : '—'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Montant à régler (MAD) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={paymentData.montant}
                onChange={(e) => setPaymentData({ ...paymentData, montant: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-btp-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date du paiement *</label>
              <input
                type="date"
                required
                value={paymentData.date_paiement}
                onChange={(e) => setPaymentData({ ...paymentData, date_paiement: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-btp-blue outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mode de règlement *</label>
              <select
                value={paymentData.mode_paiement}
                onChange={(e) => setPaymentData({ ...paymentData, mode_paiement: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-btp-blue outline-none"
              >
                <option value="Virement">Virement bancaire</option>
                <option value="Chèque">Chèque</option>
                <option value="Espèces">Espèces</option>
                <option value="Carte">Carte bancaire</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Référence / N° Chèque</label>
              <input
                type="text"
                placeholder="Ex: CHQ-948271"
                value={paymentData.reference}
                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:border-btp-blue outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Valider le Règlement</span>
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
