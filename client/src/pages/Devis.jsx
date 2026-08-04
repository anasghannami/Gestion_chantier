import { useState, useEffect } from 'react';
import {
  Plus, Loader2, Edit, Trash2, Clock, CheckCircle, DollarSign, FileText, Building2, Trash, PlusCircle, FileSpreadsheet, Download
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import KpiCard from '../components/ui/KpiCard';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

export default function Devis() {
  const { user } = useAuth();
  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConvertFactureModalOpen, setIsConvertFactureModalOpen] = useState(false);
  const [isConvertChantierModalOpen, setIsConvertChantierModalOpen] = useState(false);

  const [selectedDevis, setSelectedDevis] = useState(null);
  const [devisToDelete, setDevisToDelete] = useState(null);
  const [devisToConvert, setDevisToConvert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [converting, setConverting] = useState(false);

  const handleExportExcel = () => {
    const exportColumns = [
      { header: 'N° Devis', accessor: 'num_devis' },
      { header: 'Client', accessor: 'client_nom' },
      { header: 'Email Client', accessor: 'client_email' },
      { header: 'Date Émission', renderText: (row) => row.date_emission ? new Date(row.date_emission).toLocaleDateString('fr-FR') : '—' },
      { header: 'Montant HT (MAD)', accessor: 'montant_ht' },
      { header: 'Montant TTC (MAD)', accessor: 'montant_ttc' },
      { header: 'Statut', accessor: 'statut' }
    ];
    exportToExcel(exportColumns, filteredDevis, 'Liste_Devis_BTP');
  };

  const handleExportPDF = () => {
    const exportColumns = [
      { header: 'N° Devis', accessor: 'num_devis' },
      { header: 'Client', accessor: 'client_nom' },
      { header: 'Date', renderText: (row) => row.date_emission ? new Date(row.date_emission).toLocaleDateString('fr-FR') : '—' },
      { header: 'Montant Total', renderText: (row) => `${parseFloat(row.montant_ht || row.montant_ttc || 0).toLocaleString('fr-FR')} DH` },
      { header: 'Statut', accessor: 'statut' }
    ];
    exportToPDF({
      title: 'Registre Général des Devis',
      subtitle: `Total devis émis : ${filteredDevis.length}`,
      columns: exportColumns,
      data: filteredDevis,
      filename: 'Registre_Devis_BTP'
    });
  };

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
    icon: null
  });

  // Filters
  const [filterStatut, setFilterStatut] = useState('');

  // Initial Line Template
  const emptyLine = { designation: '', quantite: 1, unite: 'u', prix_unitaire: 0 };

  // Form State (New Devis)
  const [formData, setFormData] = useState({
    client_nom: '',
    client_email: '',
    client_telephone: '',
    client_adresse: '',
    statut: 'Brouillon',
    date_creation: new Date().toISOString().split('T')[0],
    date_validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tva: 20,
    notes: '',
    lignes: [{ ...emptyLine }]
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    client_nom: '',
    client_email: '',
    client_telephone: '',
    client_adresse: '',
    statut: 'Brouillon',
    date_creation: '',
    date_validite: '',
    tva: 20,
    notes: '',
    lignes: []
  });

  useEffect(() => {
    fetchDevis();
  }, [filterStatut]);

  const fetchDevis = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatut) params.statut = filterStatut;

      const response = await api.get('/devis', { params });
      setDevisList(response.data);
    } catch (error) {
      console.error("Erreur chargement devis:", error);
    } finally {
      setLoading(false);
    }
  };

  // Line calculations helper
  const calculateTotals = (lignes, tva) => {
    const ht = lignes.reduce((acc, line) => {
      const q = parseFloat(line.quantite) || 0;
      const pu = parseFloat(line.prix_unitaire) || 0;
      return acc + (q * pu);
    }, 0);
    const tvaRate = parseFloat(tva) || 20;
    const ttc = ht * (1 + tvaRate / 100);
    return { ht, ttc };
  };

  // Handlers for Add Form Lignes
  const handleAddLine = (isEdit = false) => {
    if (isEdit) {
      setEditFormData(prev => ({
        ...prev,
        lignes: [...prev.lignes, { ...emptyLine }]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        lignes: [...prev.lignes, { ...emptyLine }]
      }));
    }
  };

  const handleRemoveLine = (index, isEdit = false) => {
    if (isEdit) {
      setEditFormData(prev => ({
        ...prev,
        lignes: prev.lignes.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        lignes: prev.lignes.filter((_, i) => i !== index)
      }));
    }
  };

  const handleLineChange = (index, field, value, isEdit = false) => {
    const updateLignes = (lignesList) => {
      return lignesList.map((line, i) => {
        if (i === index) {
          return { ...line, [field]: value };
        }
        return line;
      });
    };

    if (isEdit) {
      setEditFormData(prev => ({ ...prev, lignes: updateLignes(prev.lignes) }));
    } else {
      setFormData(prev => ({ ...prev, lignes: updateLignes(prev.lignes) }));
    }
  };

  // Submit Create
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.client_nom) {
      alert("Veuillez saisir le nom du client.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/devis', formData);
      setIsModalOpen(false);
      setFormData({
        client_nom: '',
        client_email: '',
        client_telephone: '',
        client_adresse: '',
        statut: 'Brouillon',
        date_creation: new Date().toISOString().split('T')[0],
        date_validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tva: 20,
        notes: '',
        lignes: [{ ...emptyLine }]
      });
      fetchDevis();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la création du devis');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (devis) => {
    setSelectedDevis(devis);
    setEditFormData({
      client_nom: devis.client_nom || '',
      client_email: devis.client_email || '',
      client_telephone: devis.client_telephone || '',
      client_adresse: devis.client_adresse || '',
      statut: devis.statut || 'Brouillon',
      date_creation: devis.date_creation || '',
      date_validite: devis.date_validite || '',
      tva: devis.tva || 20,
      notes: devis.notes || '',
      lignes: devis.lignes && devis.lignes.length > 0 ? devis.lignes : [{ ...emptyLine }]
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/devis/${selectedDevis.id}`, editFormData);
      setIsEditModalOpen(false);
      fetchDevis();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour du devis');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/devis/${devisToDelete.id}`);
      setIsDeleteModalOpen(false);
      fetchDevis();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression du devis');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Convert to Facture Modal
  const openConvertFactureModal = (devis) => {
    setDevisToConvert(devis);
    setIsConvertFactureModalOpen(true);
  };

  const handleConfirmConvertFacture = async () => {
    if (!devisToConvert) return;
    try {
      setConverting(true);
      const res = await api.post(`/devis/${devisToConvert.id}/convert-facture`);
      fetchDevis();
      setSuccessModal({
        isOpen: true,
        title: 'Facture créée avec succès !',
        message: res.data.message || 'Le devis a été converti en facture et enregistré.',
        type: 'success',
        icon: FileText
      });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la conversion en facture.');
    } finally {
      setConverting(false);
      setDevisToConvert(null);
    }
  };

  // Open Convert to Chantier Modal
  const openConvertChantierModal = (devis) => {
    setDevisToConvert(devis);
    setIsConvertChantierModalOpen(true);
  };

  const handleConfirmConvertChantier = async () => {
    if (!devisToConvert) return;
    try {
      setConverting(true);
      const res = await api.post(`/devis/${devisToConvert.id}/convert-chantier`);
      fetchDevis();
      setSuccessModal({
        isOpen: true,
        title: 'Chantier créé avec succès !',
        message: res.data.message || 'Un nouveau chantier pré-rempli a été créé à partir du devis.',
        type: 'info',
        icon: Building2
      });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la conversion en chantier.');
    } finally {
      setConverting(false);
      setDevisToConvert(null);
    }
  };

  const handleGenerateAcompte = async (devis) => {
    try {
      setConverting(true);
      await api.post('/factures/acompte', {
        devis_id: devis.id,
        pourcentage_acompte: 30
      });
      alert(`Facture d'acompte de 30% générée pour le devis ${devis.num_devis} ! Retrouvez-la dans la page Factures.`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la génération de la facture d\'acompte.');
    } finally {
      setConverting(false);
    }
  };

  const filteredDevis = devisList.filter(d => {
    if (filterStatut && d.statut !== filterStatut) return false;
    return true;
  });

  // Stats KPI Calculation
  const totalDevisCount = devisList.length;
  const enCoursCount = devisList.filter(d => d.statut === 'Brouillon' || d.statut === 'Envoyé').length;
  const accepteCount = devisList.filter(d => d.statut === 'Accepté').length;
  const refuseCount = devisList.filter(d => d.statut === 'Refusé').length;
  const decidedCount = accepteCount + refuseCount;
  const tauxAcceptation = decidedCount > 0 ? Math.round((accepteCount / decidedCount) * 100) : 0;
  const montantTotalDevise = devisList.reduce((acc, d) => acc + (parseFloat(d.montant_ttc) || 0), 0);

  // Table Columns
  const columns = [
    {
      header: 'N° Devis',
      accessor: 'num_devis',
      render: (row) => <span className="text-[#0284C7] font-semibold">{row.num_devis}</span>
    },
    {
      header: 'Client',
      accessor: 'client_nom',
      render: (row) => (
        <div>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{row.client_nom}</p>
          {row.client_email && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{row.client_email}</p>}
        </div>
      )
    },
    {
      header: 'Montant Total',
      accessor: 'montant_ht',
      render: (row) => (
        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
          {parseFloat(row.montant_ht || row.montant_ttc || 0).toLocaleString('fr-FR')} DH
        </span>
      )
    },
    {
      header: 'Date Validité',
      accessor: 'date_validite',
      render: (row) => <span>{row.date_validite ? new Date(row.date_validite).toLocaleDateString('fr-FR') : '—'}</span>
    },
    {
      header: 'Statut',
      accessor: 'statut',
      render: (row) => <Badge status={row.statut} />
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center space-x-2">
          {/* Edit / View */}
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-[#0284C7]/10 transition-colors"
            title="Modifier / Consulter"
          >
            <Edit className="h-4 w-4" />
          </button>


          {/* Convert to Facture */}
          <button
            onClick={() => openConvertFactureModal(row)}
            disabled={converting}
            className="p-1.5 rounded-lg text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
            title="Convertir en Facture"
          >
            <FileText className="h-4 w-4" />
          </button>

          {/* Convert to Chantier */}
          <button
            onClick={() => openConvertChantierModal(row)}
            disabled={converting}
            className="p-1.5 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
            title="Convertir en Chantier"
          >
            <Building2 className="h-4 w-4" />
          </button>

          {/* Delete */}
          {user?.role === 'Admin' && (
            <button
              onClick={() => {
                setDevisToDelete(row);
                setIsDeleteModalOpen(true);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  // Helper form line totals
  const totalsNew = calculateTotals(formData.lignes, formData.tva);
  const totalsEdit = calculateTotals(editFormData.lignes, editFormData.tva);

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Gestion des Devis
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Établissez des devis professionnels, suivez les validations et convertissez-les en factures ou chantiers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleExportExcel}
            className="flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
            title="Exporter la liste des devis sous Excel"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Export Excel
          </button>

          <button 
            onClick={handleExportPDF}
            className="flex items-center px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
            title="Exporter le registre des devis au format PDF"
          >
            <Download className="h-4 w-4 mr-1.5" /> Registre PDF
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold text-xs shadow-sm hover:shadow transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nouveau Devis
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KpiCard
          title="Devis en cours"
          value={enCoursCount}
          subtitle={`Sur un total de ${totalDevisCount} devis`}
          icon={Clock}
          color="amber"
        />
        <KpiCard
          title="Taux d'acceptation"
          value={`${tauxAcceptation}%`}
          subtitle={`${accepteCount} devis acceptés sur ${decidedCount} traités`}
          icon={CheckCircle}
          color="green"
        />
        <KpiCard
          title="Montant total devisé"
          value={`${montantTotalDevise.toLocaleString('fr-FR')} DH`}
          subtitle="Volume global de l'ensemble des devis"
          icon={DollarSign}
          color="blue"
        />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-3.5 py-2 rounded-xl text-sm font-medium outline-none focus:ring-1 focus:ring-[#0284C7] transition-colors"
          style={{
            backgroundColor: 'var(--bg-input)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)',
            borderWidth: '1px'
          }}
        >
          <option value="">Tous les statuts</option>
          <option value="Brouillon">Brouillon</option>
          <option value="Envoyé">Envoyé</option>
          <option value="Accepté">Accepté</option>
          <option value="Refusé">Refusé</option>
          <option value="Expiré">Expiré</option>
        </select>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredDevis}
        loading={loading}
        searchable={true}
        searchPlaceholder="Rechercher par client ou n° devis..."
        emptyMessage="Aucun devis trouvé."
      />

      {/* Modal Créer Devis */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Créer un nouveau Devis"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Nom du Client *
              </label>
              <input
                type="text"
                required
                value={formData.client_nom}
                onChange={(e) => setFormData({ ...formData, client_nom: e.target.value })}
                placeholder="Ex: Société Immobilière Rabat"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Email Client
              </label>
              <input
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                placeholder="contact@client.com"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Téléphone
              </label>
              <input
                type="text"
                value={formData.client_telephone}
                onChange={(e) => setFormData({ ...formData, client_telephone: e.target.value })}
                placeholder="06 12 34 56 78"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Statut
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
              >
                <option value="Brouillon">Brouillon</option>
                <option value="Envoyé">Envoyé</option>
                <option value="Accepté">Accepté</option>
                <option value="Refusé">Refusé</option>
                <option value="Expiré">Expiré</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Date Création *
              </label>
              <input
                type="date"
                required
                value={formData.date_creation}
                onChange={(e) => setFormData({ ...formData, date_creation: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Date de Validité *
              </label>
              <input
                type="date"
                required
                value={formData.date_validite}
                onChange={(e) => setFormData({ ...formData, date_validite: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
              Adresse Client
            </label>
            <input
              type="text"
              value={formData.client_adresse}
              onChange={(e) => setFormData({ ...formData, client_adresse: e.target.value })}
              placeholder="Adresse complète..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0284C7]"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
            />
          </div>

          {/* Lignes du Devis Table */}
          <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--border-secondary)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Lignes de Prestation & Matériaux
              </h3>
              <button
                type="button"
                onClick={() => handleAddLine(false)}
                className="inline-flex items-center text-xs font-semibold text-[#0284C7] hover:underline"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Ajouter une ligne
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-secondary)' }}>
              <table className="w-full text-left text-sm">
                <thead style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-secondary)' }}>
                  <tr>
                    <th className="px-3 py-2 text-xs uppercase font-semibold">Désignation</th>
                    <th className="px-3 py-2 text-xs uppercase font-semibold w-24">Qté</th>
                    <th className="px-3 py-2 text-xs uppercase font-semibold w-24">Unité</th>
                    <th className="px-3 py-2 text-xs uppercase font-semibold w-32">P.U (DH)</th>
                    <th className="px-3 py-2 text-xs uppercase font-semibold w-32 text-right">Total (DH)</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.lignes.map((line, idx) => {
                    const lineTotal = (parseFloat(line.quantite) || 0) * (parseFloat(line.prix_unitaire) || 0);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            value={line.designation}
                            onChange={(e) => handleLineChange(idx, 'designation', e.target.value, false)}
                            placeholder="Description de la prestation..."
                            className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            required
                            value={line.quantite}
                            onChange={(e) => handleLineChange(idx, 'quantite', e.target.value, false)}
                            className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={line.unite}
                            onChange={(e) => handleLineChange(idx, 'unite', e.target.value, false)}
                            placeholder="u, m², h..."
                            className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            required
                            value={line.prix_unitaire}
                            onChange={(e) => handleLineChange(idx, 'prix_unitaire', e.target.value, false)}
                            className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
                          />
                        </td>
                        <td className="p-2 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {lineTotal.toLocaleString('fr-FR')} DH
                        </td>
                        <td className="p-2 text-center">
                          {formData.lignes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx, false)}
                              className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux summary */}
          <div 
            className="flex justify-end items-center p-4 rounded-xl"
            style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-secondary)' }}
          >
            <div className="text-right space-y-1">
              <p className="text-base font-bold text-[#0284C7]">
                Montant Total : <span>{totalsNew.ht.toLocaleString('fr-FR')} DH</span>
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4" style={{ borderTop: '1px solid var(--border-secondary)' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{ color: 'var(--text-tertiary)', backgroundColor: 'transparent' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-semibold shadow-md transition-colors flex items-center"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer le Devis
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Éditer Devis */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Modifier le Devis ${selectedDevis?.num_devis || ''}`}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Nom du Client *
              </label>
              <input
                type="text"
                required
                value={editFormData.client_nom}
                onChange={(e) => setEditFormData({ ...editFormData, client_nom: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Email Client
              </label>
              <input
                type="email"
                value={editFormData.client_email}
                onChange={(e) => setEditFormData({ ...editFormData, client_email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Téléphone
              </label>
              <input
                type="text"
                value={editFormData.client_telephone}
                onChange={(e) => setEditFormData({ ...editFormData, client_telephone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Statut
              </label>
              <select
                value={editFormData.statut}
                onChange={(e) => setEditFormData({ ...editFormData, statut: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
              >
                <option value="Brouillon">Brouillon</option>
                <option value="Envoyé">Envoyé</option>
                <option value="Accepté">Accepté</option>
                <option value="Refusé">Refusé</option>
                <option value="Expiré">Expiré</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Date Création *
              </label>
              <input
                type="date"
                required
                value={editFormData.date_creation}
                onChange={(e) => setEditFormData({ ...editFormData, date_creation: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Date de Validité *
              </label>
              <input
                type="date"
                required
                value={editFormData.date_validite}
                onChange={(e) => setEditFormData({ ...editFormData, date_validite: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)' }}>
              Adresse Client
            </label>
            <input
              type="text"
              value={editFormData.client_adresse}
              onChange={(e) => setEditFormData({ ...editFormData, client_adresse: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0284C7]"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
            />
          </div>

          {/* Lignes du Devis Table (Edit) */}
          <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--border-secondary)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Lignes de Prestation & Matériaux
              </h3>
              <button
                type="button"
                onClick={() => handleAddLine(true)}
                className="inline-flex items-center text-xs font-semibold text-[#0284C7] hover:underline"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Ajouter une ligne
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-secondary)' }}>
              <table className="w-full text-left text-sm">
                <thead style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-secondary)' }}>
                  <tr>
                    <th className="px-3 py-2 text-xs uppercase font-semibold">Désignation</th>
                    <th className="px-3 py-2 text-xs uppercase font-semibold w-24">Qté</th>
                    <th className="px-3 py-2 text-xs uppercase font-semibold w-24">Unité</th>
                    <th className="px-3 py-2 text-xs uppercase font-semibold w-32">P.U (DH)</th>
                    <th className="px-3 py-2 text-xs uppercase font-semibold w-32 text-right">Total (DH)</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {editFormData.lignes.map((line, idx) => {
                    const lineTotal = (parseFloat(line.quantite) || 0) * (parseFloat(line.prix_unitaire) || 0);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            value={line.designation}
                            onChange={(e) => handleLineChange(idx, 'designation', e.target.value, true)}
                            className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            required
                            value={line.quantite}
                            onChange={(e) => handleLineChange(idx, 'quantite', e.target.value, true)}
                            className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={line.unite}
                            onChange={(e) => handleLineChange(idx, 'unite', e.target.value, true)}
                            className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            required
                            value={line.prix_unitaire}
                            onChange={(e) => handleLineChange(idx, 'prix_unitaire', e.target.value, true)}
                            className="w-full px-2.5 py-1.5 rounded text-sm outline-none"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', borderWidth: '1px' }}
                          />
                        </td>
                        <td className="p-2 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {lineTotal.toLocaleString('fr-FR')} DH
                        </td>
                        <td className="p-2 text-center">
                          {editFormData.lignes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx, true)}
                              className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totaux summary (Edit) */}
          <div 
            className="flex justify-end items-center p-4 rounded-xl"
            style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-secondary)' }}
          >
            <div className="text-right space-y-1">
              <p className="text-base font-bold text-[#0284C7]">
                Montant Total : <span>{totalsEdit.ht.toLocaleString('fr-FR')} DH</span>
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4" style={{ borderTop: '1px solid var(--border-secondary)' }}>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{ color: 'var(--text-tertiary)', backgroundColor: 'transparent' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-semibold shadow-md transition-colors flex items-center"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Mettre à jour le Devis
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Supprimer */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le Devis"
        message={`Êtes-vous sûr de vouloir supprimer définitivement le devis "${devisToDelete?.num_devis}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      {/* Modal Conversion Facture */}
      <ConfirmModal
        isOpen={isConvertFactureModalOpen}
        onClose={() => setIsConvertFactureModalOpen(false)}
        onConfirm={handleConfirmConvertFacture}
        title="Convertir en Facture"
        message={`Voulez-vous vraiment convertir le devis "${devisToConvert?.num_devis}" en une nouvelle facture ?`}
        confirmText="Convertir"
        cancelText="Annuler"
        type="success"
      />

      {/* Modal Conversion Chantier */}
      <ConfirmModal
        isOpen={isConvertChantierModalOpen}
        onClose={() => setIsConvertChantierModalOpen(false)}
        onConfirm={handleConfirmConvertChantier}
        title="Convertir en Chantier"
        message={`Voulez-vous vraiment créer un nouveau chantier à partir du devis "${devisToConvert?.num_devis}" ?`}
        confirmText="Créer le Chantier"
        cancelText="Annuler"
        type="info"
      />

      {/* Modal Succès Notification Stylisée */}
      <ConfirmModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        onConfirm={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
        confirmText="D'accord"
        cancelText={null}
        type={successModal.type}
        icon={successModal.icon}
      />
    </div>
  );
}
