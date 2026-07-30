import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Phone, Mail, MapPin, Briefcase, FileText, Loader2, Edit, Trash2 } from 'lucide-react';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function FournisseurDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fournisseur, setFournisseur] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    raison_sociale: '',
    categorie: 'Matériaux',
    telephone: '',
    email: '',
    contact_referent: '',
    adresse: '',
    rc_if: '',
    conditions_paiement: '30 jours',
    note: '',
    statut: 'Actif'
  });

  const categories = ['Matériaux', 'Électricité', 'Plomberie', 'Location engins', 'Peinture', 'Menuiserie'];
  const canEdit = user?.role === 'Admin' || user?.role === 'Achats';

  const handleOpenEditModal = () => {
    setEditFormData({
      raison_sociale: fournisseur.raison_sociale || '',
      categorie: fournisseur.categorie || 'Matériaux',
      telephone: fournisseur.telephone || '',
      email: fournisseur.email || '',
      contact_referent: fournisseur.contact_referent || '',
      adresse: fournisseur.adresse || '',
      rc_if: fournisseur.rc_if || '',
      conditions_paiement: fournisseur.conditions_paiement || '30 jours',
      note: fournisseur.note || '',
      statut: fournisseur.statut || 'Actif'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/fournisseurs/${id}`, editFormData);
      setIsEditModalOpen(false);
      // Reload supplier details
      const res = await api.get(`/fournisseurs/${id}`);
      setFournisseur(res.data);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert(error.response?.data?.message || 'Erreur lors de la modification du fournisseur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/fournisseurs/${id}`);
      navigate('/fournisseurs');
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression du fournisseur');
    } finally {
      setSubmitting(false);
      setIsDeleteModalOpen(false);
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/fournisseurs/${id}`);
        setFournisseur(res.data);
      } catch (e) {
        console.error("Erreur chargement fournisseur:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading || !fournisseur) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-btp-blue animate-spin" />
      </div>
    );
  }

  const formatMAD = (val) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val || 0);

  const commandeColumns = [
    { header: 'N° Commande', accessor: 'num_commande', render: (row) => <span className="font-semibold text-white">{row.num_commande}</span> },
    { header: 'Date', accessor: 'date_commande', render: (row) => new Date(row.date_commande).toLocaleDateString('fr-FR') },
    { header: 'Chantier', accessor: 'chantier', render: (row) => <span className="text-slate-300">{row.chantier?.nom || '—'}</span> },
    { header: 'Montant TTC', accessor: 'montant_ttc', render: (row) => formatMAD(row.montant_ttc) },
    { header: 'Statut', accessor: 'statut', render: (row) => <Badge status={row.statut} /> }
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/fournisseurs')} className="flex items-center text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux fournisseurs
      </button>

      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-btp-blue font-semibold">{fournisseur.code_fournisseur}</span>
              <Badge status={fournisseur.statut} />
              {fournisseur.categorie && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">{fournisseur.categorie}</span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white">{fournisseur.raison_sociale}</h1>
          </div>
          {canEdit && (
            <div className="flex items-center space-x-3 self-start md:self-auto">
              <button 
                onClick={handleOpenEditModal}
                className="flex items-center px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors font-medium text-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </button>
              {user?.role === 'Admin' && (
                <button 
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex items-center px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700/50 pb-2">Coordonnées</h3>
          
          <div className="flex items-start text-slate-300">
            <Phone className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">{fournisseur.telephone || '—'}</p>
              <p className="text-xs text-slate-400">Téléphone</p>
            </div>
          </div>
          
          <div className="flex items-start text-slate-300">
            <Mail className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">{fournisseur.email || '—'}</p>
              <p className="text-xs text-slate-400">Email</p>
            </div>
          </div>

          <div className="flex items-start text-slate-300">
            <MapPin className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">{fournisseur.adresse || '—'}</p>
              <p className="text-xs text-slate-400">Adresse</p>
            </div>
          </div>
          
          <div className="flex items-start text-slate-300">
            <Briefcase className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">{fournisseur.contact_referent || '—'}</p>
              <p className="text-xs text-slate-400">Contact Référent</p>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700/50 pb-2">Informations Commerciales</h3>
          
          <div>
            <p className="text-xs text-slate-400 mb-1">RC / IF</p>
            <p className="text-sm font-medium text-white">{fournisseur.rc_if || '—'}</p>
          </div>
          
          <div>
            <p className="text-xs text-slate-400 mb-1">Conditions de Paiement</p>
            <p className="text-sm font-medium text-white">{fournisseur.conditions_paiement || '—'}</p>
          </div>

          {fournisseur.note && (
            <div className="pt-2">
              <p className="text-xs text-slate-400 mb-1 flex items-center"><FileText className="h-3 w-3 mr-1" /> Notes internes</p>
              <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 italic">
                "{fournisseur.note}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Commandes History */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Historique des Commandes ({fournisseur.commandes?.length || 0})
        </h3>
        <DataTable 
          columns={commandeColumns} 
          data={fournisseur.commandes || []}
          searchable
          searchPlaceholder="Rechercher une commande..."
        />
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier le fournisseur">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Raison Sociale</label>
              <input 
                type="text" 
                required 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.raison_sociale} 
                onChange={e => setEditFormData({...editFormData, raison_sociale: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Catégorie</label>
              <select 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.categorie} 
                onChange={e => setEditFormData({...editFormData, categorie: e.target.value})}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Téléphone</label>
              <input 
                type="tel" 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.telephone} 
                onChange={e => setEditFormData({...editFormData, telephone: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input 
                type="email" 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.email} 
                onChange={e => setEditFormData({...editFormData, email: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Contact Référent</label>
              <input 
                type="text" 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.contact_referent} 
                onChange={e => setEditFormData({...editFormData, contact_referent: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Conditions de paiement</label>
              <input 
                type="text" 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.conditions_paiement} 
                onChange={e => setEditFormData({...editFormData, conditions_paiement: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">RC / IF</label>
              <input 
                type="text" 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.rc_if} 
                onChange={e => setEditFormData({...editFormData, rc_if: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Statut</label>
              <select 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.statut} 
                onChange={e => setEditFormData({...editFormData, statut: e.target.value})}
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="Bloqué">Bloqué</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Note interne</label>
            <textarea 
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none h-20" 
              value={editFormData.note} 
              onChange={e => setEditFormData({...editFormData, note: e.target.value})} 
            />
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
        title="Supprimer le fournisseur"
        message="Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible et supprimera toutes ses commandes associées."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
