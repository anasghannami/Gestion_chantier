import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Building2, MapPin, Calendar, Users, Loader2, Edit, Trash2 } from 'lucide-react';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ChantierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chantier, setChantier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nom: '',
    client_nom: '',
    adresse: '',
    date_debut: '',
    date_fin_prevue: '',
    date_fin_reelle: '',
    budget_previsionnel: '',
    statut: ''
  });

  const canEdit = user?.role === 'Admin' || user?.role === 'Conducteur';

  const handleOpenEditModal = () => {
    setEditFormData({
      nom: chantier.nom || '',
      client_nom: chantier.client_nom || '',
      adresse: chantier.adresse || '',
      date_debut: chantier.date_debut ? chantier.date_debut.split('T')[0] : '',
      date_fin_prevue: chantier.date_fin_prevue ? chantier.date_fin_prevue.split('T')[0] : '',
      date_fin_reelle: chantier.date_fin_reelle ? chantier.date_fin_reelle.split('T')[0] : '',
      budget_previsionnel: chantier.budget_previsionnel || '',
      statut: chantier.statut || 'En préparation'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/chantiers/${id}`, editFormData);
      setIsEditModalOpen(false);
      // Reload chantier details
      const res = await api.get(`/chantiers/${id}`);
      setChantier(res.data);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert(error.response?.data?.message || 'Erreur lors de la modification du chantier');
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
      await api.delete(`/chantiers/${id}`);
      navigate('/chantiers');
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression du chantier');
    } finally {
      setSubmitting(false);
      setIsDeleteModalOpen(false);
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/chantiers/${id}`);
        setChantier(res.data);
      } catch (e) {
        console.error("Erreur chargement chantier:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading || !chantier) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-btp-blue animate-spin" />
      </div>
    );
  }

  const formatMAD = (val) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val || 0);

  const budgetConsomme = parseFloat(chantier.budget_consomme) || 0;
  const budgetPrev = parseFloat(chantier.budget_previsionnel) || 0;
  const progression = budgetPrev > 0 ? Math.min(Math.round((budgetConsomme / budgetPrev) * 100), 100) : 0;

  const chefNom = chantier.chef_chantier ? `${chantier.chef_chantier.prenom} ${chantier.chef_chantier.nom}` : 'Non assigné';

  const commandeColumns = [
    { header: 'N° Commande', accessor: 'num_commande', render: (row) => <span className="font-semibold text-white">{row.num_commande}</span> },
    { header: 'Date', accessor: 'date_commande', render: (row) => new Date(row.date_commande).toLocaleDateString('fr-FR') },
    { header: 'Livraison prévue', accessor: 'date_livraison_prevue', render: (row) => row.date_livraison_prevue ? new Date(row.date_livraison_prevue).toLocaleDateString('fr-FR') : '—' },
    { header: 'Montant TTC', accessor: 'montant_ttc', render: (row) => formatMAD(row.montant_ttc) },
    { header: 'Statut', accessor: 'statut', render: (row) => <Badge status={row.statut} /> }
  ];

  const factureColumns = [
    { header: 'N° Facture', accessor: 'num_facture', render: (row) => <span className="font-semibold text-white">{row.num_facture}</span> },
    { header: 'Date émission', accessor: 'date_emission', render: (row) => new Date(row.date_emission).toLocaleDateString('fr-FR') },
    { header: 'Échéance', accessor: 'date_echeance', render: (row) => row.date_echeance ? new Date(row.date_echeance).toLocaleDateString('fr-FR') : '—' },
    { header: 'Montant TTC', accessor: 'montant_ttc', render: (row) => formatMAD(row.montant_ttc) },
    { header: 'Paiement', accessor: 'statut_paiement', render: (row) => <Badge status={row.statut_paiement} /> }
  ];

  const ouvrierColumns = [
    { header: 'Nom & Prénom', render: (row) => <span className="font-semibold text-white">{row.nom} {row.prenom}</span> },
    { header: 'Spécialité', accessor: 'specialite', render: (row) => <span className="text-slate-300 font-medium">{row.specialite}</span> },
    { header: 'Téléphone', accessor: 'telephone', render: (row) => row.telephone || '—' },
    { header: 'Tarif Jour', accessor: 'tarif_journalier', render: (row) => formatMAD(row.tarif_journalier) },
    { header: 'Statut', accessor: 'statut', render: (row) => <Badge status={row.statut} /> }
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={() => navigate('/chantiers')} className="flex items-center text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux chantiers
      </button>

      {/* Header Card */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-btp-blue font-semibold">{chantier.code_chantier}</span>
              <Badge status={chantier.statut} />
            </div>
            <h1 className="text-2xl font-bold text-white">{chantier.nom}</h1>
            {chantier.client_nom && <p className="text-slate-400 mt-1">{chantier.client_nom}</p>}
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

        {/* Budget Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-700/50">
          <div>
            <p className="text-sm text-slate-400 mb-1">Budget Prévisionnel</p>
            <p className="text-xl font-semibold text-white">{formatMAD(budgetPrev)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Budget Consommé</p>
            <p className={`text-xl font-semibold ${budgetConsomme > budgetPrev ? 'text-btp-red' : 'text-btp-orange'}`}>{formatMAD(budgetConsomme)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Progression ({progression}%)</p>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
              <div className={`h-2.5 rounded-full transition-all ${progression >= 100 ? 'bg-btp-red' : progression > 70 ? 'bg-btp-orange' : 'bg-btp-blue'}`} style={{ width: `${progression}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <nav className="flex space-x-8">
          {['overview', 'commandes', 'factures', 'ouvriers'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab 
                  ? 'border-btp-blue text-btp-blue' 
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              {tab === 'overview' 
                ? "Vue d'ensemble" 
                : tab === 'commandes' 
                ? `Commandes (${chantier.commandes?.length || 0})` 
                : tab === 'factures' 
                ? `Factures (${chantier.factures?.length || 0})`
                : `Ouvriers (${chantier.ouvriers?.length || 0})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Informations Générales</h3>
            <div className="flex items-start">
              <Building2 className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">{chantier.client_nom || '—'}</p>
                <p className="text-xs text-slate-400">Client</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">{chantier.adresse || '—'}</p>
                <p className="text-xs text-slate-400">Adresse</p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">{chefNom}</p>
                <p className="text-xs text-slate-400">Chef de chantier</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">
                  {chantier.date_debut ? new Date(chantier.date_debut).toLocaleDateString('fr-FR') : '—'}
                  {chantier.date_fin_prevue ? ` au ${new Date(chantier.date_fin_prevue).toLocaleDateString('fr-FR')}` : ''}
                </p>
                <p className="text-xs text-slate-400">Planning prévu</p>
              </div>
            </div>
            {chantier.date_fin_reelle && (
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-btp-green mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-btp-green">{new Date(chantier.date_fin_reelle).toLocaleDateString('fr-FR')}</p>
                  <p className="text-xs text-slate-400">Date de fin réelle</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Résumé Financier</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-400">Commandes totales</span>
                <span className="text-white font-semibold">{chantier.commandes?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-400">Factures totales</span>
                <span className="text-white font-semibold">{chantier.factures?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-400">Reste à consommer</span>
                <span className={`font-semibold ${budgetPrev - budgetConsomme < 0 ? 'text-btp-red' : 'text-btp-green'}`}>
                  {formatMAD(budgetPrev - budgetConsomme)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'commandes' && (
        <DataTable 
          columns={commandeColumns} 
          data={chantier.commandes || []}
          searchable
          searchPlaceholder="Rechercher une commande..."
        />
      )}

      {activeTab === 'factures' && (
        <DataTable 
          columns={factureColumns} 
          data={chantier.factures || []}
          searchable
        />
      )}

      {activeTab === 'ouvriers' && (
        <DataTable 
          columns={ouvrierColumns} 
          data={chantier.ouvriers || []}
          searchable
          searchPlaceholder="Rechercher un ouvrier..."
        />
      )}

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier le chantier">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nom du chantier</label>
              <input 
                type="text" 
                required 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.nom} 
                onChange={e => setEditFormData({...editFormData, nom: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Client</label>
              <input 
                type="text" 
                required 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.client_nom} 
                onChange={e => setEditFormData({...editFormData, client_nom: e.target.value})} 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Adresse</label>
            <input 
              type="text" 
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
              value={editFormData.adresse} 
              onChange={e => setEditFormData({...editFormData, adresse: e.target.value})} 
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date début</label>
              <input 
                type="date" 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.date_debut} 
                onChange={e => setEditFormData({...editFormData, date_debut: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Fin prévue</label>
              <input 
                type="date" 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.date_fin_prevue} 
                onChange={e => setEditFormData({...editFormData, date_fin_prevue: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Fin réelle</label>
              <input 
                type="date" 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.date_fin_reelle} 
                onChange={e => setEditFormData({...editFormData, date_fin_reelle: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Budget Prévisionnel (MAD)</label>
              <input 
                type="number" 
                required 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.budget_previsionnel} 
                onChange={e => setEditFormData({...editFormData, budget_previsionnel: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Statut</label>
              <select 
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" 
                value={editFormData.statut} 
                onChange={e => setEditFormData({...editFormData, statut: e.target.value})}
              >
                <option value="En préparation">En préparation</option>
                <option value="En cours">En cours</option>
                <option value="En retard">En retard</option>
                <option value="Terminé">Terminé</option>
                <option value="Suspendu">Suspendu</option>
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
        title="Supprimer le chantier"
        message="Êtes-vous sûr de vouloir supprimer ce chantier ? Cette action est irréversible et supprimera toutes ses commandes et factures associées."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
