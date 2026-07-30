import { useState, useEffect } from 'react';
import { Plus, Loader2, Edit, Trash2, Printer } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import OrderPrintTemplate from '../components/ui/OrderPrintTemplate';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Commandes() {
  const { user } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [printCommande, setPrintCommande] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commandeToDelete, setCommandeToDelete] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [editFormData, setEditFormData] = useState({
    num_commande: '',
    fournisseur_id: '',
    chantier_id: '',
    date_commande: '',
    date_livraison_prevue: '',
    montant_ht: '',
    montant_ttc: '',
    statut: 'Brouillon'
  });

  const canEdit = user?.role === 'Admin' || user?.role === 'Achats';

  const handleOpenEditModal = (commande) => {
    setSelectedCommande(commande);
    setEditFormData({
      num_commande: commande.num_commande || '',
      fournisseur_id: commande.fournisseur_id || '',
      chantier_id: commande.chantier_id || '',
      date_commande: commande.date_commande ? commande.date_commande.split('T')[0] : '',
      date_livraison_prevue: commande.date_livraison_prevue ? commande.date_livraison_prevue.split('T')[0] : '',
      montant_ht: commande.montant_ht || '',
      montant_ttc: commande.montant_ttc || '',
      statut: commande.statut || 'Brouillon'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/commandes/${selectedCommande.id}`, editFormData);
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = (commande) => {
    setPrintCommande(commande);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleOpenDeleteConfirm = (id) => {
    setCommandeToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!commandeToDelete) return;
    try {
      setSubmitting(true);
      await api.delete(`/commandes/${commandeToDelete}`);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setSubmitting(false);
      setCommandeToDelete(null);
    }
  };

  // Filters
  const [filterStatut, setFilterStatut] = useState('');
  const [filterChantier, setFilterChantier] = useState('');
  const [filterFournisseur, setFilterFournisseur] = useState('');

  const [formData, setFormData] = useState({
    num_commande: '', fournisseur_id: '', chantier_id: '', date_commande: '', date_livraison_prevue: '', montant_ht: '', montant_ttc: '', statut: 'Brouillon'
  });

  useEffect(() => {
    fetchData();
  }, [filterStatut, filterChantier, filterFournisseur]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatut) params.statut = filterStatut;
      if (filterChantier) params.chantier_id = filterChantier;
      if (filterFournisseur) params.fournisseur_id = filterFournisseur;

      const [commandesRes, chantiersRes, fournisseursRes] = await Promise.all([
        api.get('/commandes', { params }),
        api.get('/chantiers'),
        api.get('/fournisseurs')
      ]);

      setCommandes(commandesRes.data);
      setChantiers(chantiersRes.data);
      setFournisseurs(fournisseursRes.data);
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/commandes', formData);
      setIsModalOpen(false);
      setFormData({ num_commande: '', fournisseur_id: '', chantier_id: '', date_commande: '', date_livraison_prevue: '', montant_ht: '', montant_ttc: '', statut: 'Brouillon' });
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const formatMAD = (val) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val || 0);

  const columns = [
    { header: 'N° Commande', accessor: 'num_commande', render: (row) => <span className="font-semibold text-white">{row.num_commande}</span> },
    { header: 'Fournisseur', accessor: 'fournisseur', render: (row) => <span className="text-slate-300">{row.fournisseur?.raison_sociale || '—'}</span> },
    { header: 'Chantier', accessor: 'chantier', render: (row) => <span className="text-slate-300">{row.chantier?.nom || '—'}</span> },
    { header: 'Date', accessor: 'date_commande', render: (row) => new Date(row.date_commande).toLocaleDateString('fr-FR') },
    { header: 'Montant TTC', accessor: 'montant_ttc', render: (row) => formatMAD(row.montant_ttc) },
    { header: 'Statut', accessor: 'statut', render: (row) => <Badge status={row.statut} /> },
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
            title="Imprimer le Bon de Commande"
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
        <h1 className="text-2xl font-bold text-white">Bons de Commande</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle Commande
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select 
          className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-btp-blue outline-none"
          value={filterStatut}
          onChange={e => setFilterStatut(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="Brouillon">Brouillon</option>
          <option value="Validée">Validée</option>
          <option value="Livrée">Livrée</option>
          <option value="Annulée">Annulée</option>
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
        data={commandes} 
        searchable 
        searchPlaceholder="Rechercher une commande..."
      />

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouveau Bon de Commande">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">N° Commande</label>
            <input type="text" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" placeholder="CMD-016" value={formData.num_commande} onChange={e => setFormData({...formData, num_commande: e.target.value})} />
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
              <label className="block text-sm font-medium text-slate-300 mb-1">Date commande</label>
              <input type="date" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.date_commande} onChange={e => setFormData({...formData, date_commande: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Livraison prévue</label>
              <input type="date" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.date_livraison_prevue} onChange={e => setFormData({...formData, date_livraison_prevue: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Montant HT (MAD)</label>
              <input type="number" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.montant_ht} onChange={e => setFormData({...formData, montant_ht: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Montant TTC (MAD)</label>
              <input type="number" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.montant_ttc} onChange={e => setFormData({...formData, montant_ttc: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors disabled:opacity-50">
              {submitting ? 'Création...' : 'Créer la commande'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier le Bon de Commande">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">N° Commande</label>
            <input 
              type="text" 
              required 
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
              value={editFormData.num_commande} 
              onChange={e => setEditFormData({...editFormData, num_commande: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Chantier</label>
              <select 
                required 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.chantier_id} 
                onChange={e => setEditFormData({...editFormData, chantier_id: e.target.value})}
              >
                <option value="">Sélectionner...</option>
                {chantiers.map(c => <option key={c.id} value={c.id}>{c.code_chantier} — {c.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Fournisseur</label>
              <select 
                required 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.fournisseur_id} 
                onChange={e => setEditFormData({...editFormData, fournisseur_id: e.target.value})}
              >
                <option value="">Sélectionner...</option>
                {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.code_fournisseur} — {f.raison_sociale}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date commande</label>
              <input 
                type="date" 
                required 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.date_commande} 
                onChange={e => setEditFormData({...editFormData, date_commande: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Livraison prévue</label>
              <input 
                type="date" 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.date_livraison_prevue} 
                onChange={e => setEditFormData({...editFormData, date_livraison_prevue: e.target.value})} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Montant HT (MAD)</label>
              <input 
                type="number" 
                required 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.montant_ht} 
                onChange={e => setEditFormData({...editFormData, montant_ht: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Montant TTC (MAD)</label>
              <input 
                type="number" 
                required 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.montant_ttc} 
                onChange={e => setEditFormData({...editFormData, montant_ttc: e.target.value})} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Statut</label>
              <select 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.statut} 
                onChange={e => setEditFormData({...editFormData, statut: e.target.value})}
              >
                <option value="Brouillon">Brouillon</option>
                <option value="Validée">Validée</option>
                <option value="Livrée">Livrée</option>
                <option value="Annulée">Annulée</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button" 
              onClick={() => setIsEditModalOpen(false)} 
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors disabled:opacity-50"
            >
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
        title="Supprimer la commande"
        message="Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      {/* Printable Area */}
      <OrderPrintTemplate commande={printCommande} />
    </div>
  );
}
