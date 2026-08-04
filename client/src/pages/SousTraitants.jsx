import { useState, useEffect } from 'react';
import { 
  Plus, Search, Briefcase, Phone, Mail, MapPin, ShieldAlert, ShieldCheck, 
  Calendar, Loader2, FileSpreadsheet, Download, Trash2, Edit, FileText, CheckCircle
} from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import api from '../api/axios';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

export default function SousTraitants() {
  const [sousTraitants, setSousTraitants] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingSousTraitant, setEditingSousTraitant] = useState(null);
  const [selectedSousTraitant, setSelectedSousTraitant] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    nom_entreprise: '',
    corps_etat: 'Électricité',
    nom_contact: '',
    telephone: '',
    email: '',
    adresse: '',
    siret_rc: '',
    assurance_decennale_numero: '',
    assurance_decennale_expiration: '',
    statut: 'Actif',
    notes: ''
  });

  const [contractData, setContractData] = useState({
    chantier_id: '',
    objet_travaux: '',
    montant_ht: '',
    montant_ttc: '',
    date_debut: '',
    date_fin_prevue: ''
  });

  useEffect(() => {
    fetchSousTraitants();
    fetchChantiers();
  }, []);

  const fetchSousTraitants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sous-traitants');
      setSousTraitants(res.data);
    } catch (err) {
      console.error('Erreur chargement sous-traitants:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChantiers = async () => {
    try {
      const res = await api.get('/chantiers');
      setChantiers(res.data);
    } catch (err) {
      console.error('Erreur chargement chantiers:', err);
    }
  };

  const handleOpenModal = (st = null) => {
    if (st) {
      setEditingSousTraitant(st);
      setFormData({
        nom_entreprise: st.nom_entreprise || '',
        corps_etat: st.corps_etat || 'Électricité',
        nom_contact: st.nom_contact || '',
        telephone: st.telephone || '',
        email: st.email || '',
        adresse: st.adresse || '',
        siret_rc: st.siret_rc || '',
        assurance_decennale_numero: st.assurance_decennale_numero || '',
        assurance_decennale_expiration: st.assurance_decennale_expiration || '',
        statut: st.statut || 'Actif',
        notes: st.notes || ''
      });
    } else {
      setEditingSousTraitant(null);
      setFormData({
        nom_entreprise: '',
        corps_etat: 'Électricité',
        nom_contact: '',
        telephone: '',
        email: '',
        adresse: '',
        siret_rc: '',
        assurance_decennale_numero: '',
        assurance_decennale_expiration: '',
        statut: 'Actif',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingSousTraitant) {
        await api.put(`/sous-traitants/${editingSousTraitant.id}`, formData);
      } else {
        await api.post('/sous-traitants', formData);
      }
      setIsModalOpen(false);
      fetchSousTraitants();
    } catch (err) {
      console.error('Erreur enregistrement sous-traitant:', err);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce sous-traitant ?')) return;
    try {
      await api.delete(`/sous-traitants/${id}`);
      fetchSousTraitants();
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  const handleAddContract = (st) => {
    setSelectedSousTraitant(st);
    setContractData({
      chantier_id: chantiers[0]?.id || '',
      objet_travaux: '',
      montant_ht: '',
      montant_ttc: '',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin_prevue: ''
    });
    setIsContractModalOpen(true);
  };

  const handleContractSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/sous-traitants/contrats', {
        ...contractData,
        sous_traitant_id: selectedSousTraitant.id
      });
      setIsContractModalOpen(false);
      fetchSousTraitants();
    } catch (err) {
      console.error('Erreur création contrat:', err);
      alert('Erreur lors de la création du contrat');
    } finally {
      setSubmitting(false);
    }
  };

  const checkAssuranceStatus = (expDate) => {
    if (!expDate) return { label: 'Non renseignée', color: 'amber' };
    const today = new Date();
    const exp = new Date(expDate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Expirée', color: 'red' };
    } else if (diffDays <= 30) {
      return { label: `Expire dans ${diffDays}j`, color: 'amber' };
    }
    return { label: 'Valide', color: 'emerald' };
  };

  const filteredSousTraitants = sousTraitants.filter(st => {
    const matchSearch = searchTerm === '' || 
      st.nom_entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.corps_etat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (st.nom_contact && st.nom_contact.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchCat = selectedCategorie === '' || st.corps_etat === selectedCategorie;

    return matchSearch && matchCat;
  });

  const columns = [
    {
      header: 'Entreprise & Contact',
      accessor: 'nom_entreprise',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-white font-bold shadow-md">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{row.nom_entreprise}</p>
            <p className="text-xs text-slate-400">{row.nom_contact || 'Pas de contact attribué'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Specialité / Corps d\'État',
      accessor: 'corps_etat',
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20">
          {row.corps_etat}
        </span>
      )
    },
    {
      header: 'Coordonnées',
      accessor: 'telephone',
      cell: (row) => (
        <div className="text-xs space-y-1">
          {row.telephone && (
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>{row.telephone}</span>
            </div>
          )}
          {row.email && (
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{row.email}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Assurance Décennale',
      accessor: 'assurance_decennale_expiration',
      cell: (row) => {
        const status = checkAssuranceStatus(row.assurance_decennale_expiration);
        return (
          <div>
            <Badge variant={status.color}>
              {status.color === 'red' ? <ShieldAlert className="h-3.5 w-3.5 mr-1" /> : <ShieldCheck className="h-3.5 w-3.5 mr-1" />}
              {status.label}
            </Badge>
            {row.assurance_decennale_expiration && (
              <p className="text-[11px] text-slate-400 mt-1">Exp: {row.assurance_decennale_expiration}</p>
            )}
          </div>
        );
      }
    },
    {
      header: 'Chantiers en cours',
      accessor: 'contrats',
      cell: (row) => {
        const count = row.contrats ? row.contrats.length : 0;
        return (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-300">{count} contrat(s)</span>
            <button 
              onClick={() => handleAddContract(row)}
              className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              title="Affecter à un chantier"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleOpenModal(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Gestion des Sous-Traitants
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Répertoire des entreprises sous-traitantes et suivi des assurances décennales
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/20 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau Sous-Traitant</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl theme-transition" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
        <div className="flex flex-1 items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher sous-traitant, corps d'état..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>

          <select
            value={selectedCategorie}
            onChange={(e) => setSelectedCategorie(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
            style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
          >
            <option value="">Toutes spécialités</option>
            <option value="Électricité">Électricité</option>
            <option value="Plomberie">Plomberie</option>
            <option value="Maçonnerie">Maçonnerie</option>
            <option value="Carrelage">Carrelage</option>
            <option value="Peinture">Peinture</option>
            <option value="Étanchéité">Étanchéité</option>
            <option value="Menuiserie">Menuiserie</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0284C7]" />
        </div>
      ) : (
        <DataTable data={filteredSousTraitants} columns={columns} searchPlaceholder="Filtrer..." />
      )}

      {/* Modal Add/Edit Sous-Traitant */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSousTraitant ? 'Modifier Sous-Traitant' : 'Nouveau Sous-Traitant'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nom de l'entreprise *</label>
            <input
              type="text"
              required
              value={formData.nom_entreprise}
              onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              placeholder="Ex: SARL ElecBat"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Corps d'état / Spécialité *</label>
              <select
                value={formData.corps_etat}
                onChange={(e) => setFormData({ ...formData, corps_etat: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              >
                <option value="Électricité">Électricité</option>
                <option value="Plomberie">Plomberie</option>
                <option value="Maçonnerie">Maçonnerie</option>
                <option value="Carrelage">Carrelage</option>
                <option value="Peinture">Peinture</option>
                <option value="Étanchéité">Étanchéité</option>
                <option value="Menuiserie">Menuiserie</option>
                <option value="Gros Œuvre">Gros Œuvre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nom du Contact</label>
              <input
                type="text"
                value={formData.nom_contact}
                onChange={(e) => setFormData({ ...formData, nom_contact: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                placeholder="Ex: M. Dupont"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone</label>
              <input
                type="text"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                placeholder="06 12 34 56 78"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                placeholder="contact@elecbat.fr"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">N° Décennale</label>
              <input
                type="text"
                value={formData.assurance_decennale_numero}
                onChange={(e) => setFormData({ ...formData, assurance_decennale_numero: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                placeholder="AXA-8947291"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expiration Décennale</label>
              <input
                type="date"
                value={formData.assurance_decennale_expiration}
                onChange={(e) => setFormData({ ...formData, assurance_decennale_expiration: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{editingSousTraitant ? 'Mettre à jour' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Add Contract to Site */}
      <Modal isOpen={isContractModalOpen} onClose={() => setIsContractModalOpen(false)} title={`Affecter ${selectedSousTraitant?.nom_entreprise} à un chantier`}>
        <form onSubmit={handleContractSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Chantier *</label>
            <select
              required
              value={contractData.chantier_id}
              onChange={(e) => setContractData({ ...contractData, chantier_id: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            >
              {chantiers.map(c => (
                <option key={c.id} value={c.id}>{c.code_chantier} - {c.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Objet des travaux / Prestation *</label>
            <textarea
              required
              rows={3}
              value={contractData.objet_travaux}
              onChange={(e) => setContractData({ ...contractData, objet_travaux: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              placeholder="Ex: Pose du réseau électrique et pieuvres dans les logements 1 à 4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Montant HT (€)</label>
              <input
                type="number"
                step="0.01"
                value={contractData.montant_ht}
                onChange={(e) => {
                  const ht = parseFloat(e.target.value || 0);
                  const ttc = Math.round(ht * 1.2 * 100) / 100;
                  setContractData({ ...contractData, montant_ht: e.target.value, montant_ttc: ttc });
                }}
                className="w-full px-3 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                placeholder="5000.00"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Montant TTC (€)</label>
              <input
                type="number"
                step="0.01"
                value={contractData.montant_ttc}
                onChange={(e) => setContractData({ ...contractData, montant_ttc: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                placeholder="6000.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date Début</label>
              <input
                type="date"
                value={contractData.date_debut}
                onChange={(e) => setContractData({ ...contractData, date_debut: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date Fin Prévue</label>
              <input
                type="date"
                value={contractData.date_fin_prevue}
                onChange={(e) => setContractData({ ...contractData, date_fin_prevue: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsContractModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Valider le Contrat</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
