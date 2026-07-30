import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, LayoutGrid, List, MapPin, Calendar, Loader2 } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import api from '../api/axios';

export default function Chantiers() {
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    code_chantier: '', nom: '', client_nom: '', adresse: '', date_debut: '', date_fin_prevue: '', budget_previsionnel: '', statut: 'En préparation'
  });

  useEffect(() => {
    fetchChantiers();
  }, []);

  const fetchChantiers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chantiers');
      setChantiers(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des chantiers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/chantiers', formData);
      setIsModalOpen(false);
      setFormData({ code_chantier: '', nom: '', client_nom: '', adresse: '', date_debut: '', date_fin_prevue: '', budget_previsionnel: '', statut: 'En préparation' });
      fetchChantiers();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculer la progression du budget
  const getProgression = (chantier) => {
    const budget = parseFloat(chantier.budget_previsionnel) || 0;
    const consomme = parseFloat(chantier.budget_consomme) || 0;
    if (budget === 0) return 0;
    return Math.min(Math.round((consomme / budget) * 100), 100);
  };

  const formatMAD = (value) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(value || 0);
  };

  const columns = [
    { header: 'Code', accessor: 'code_chantier', render: (row) => <span className="font-semibold text-white">{row.code_chantier}</span> },
    { header: 'Nom', accessor: 'nom' },
    { header: 'Client', accessor: 'client_nom' },
    { header: 'Statut', accessor: 'statut', render: (row) => <Badge status={row.statut} /> },
    { header: 'Budget', accessor: 'budget_previsionnel', render: (row) => formatMAD(row.budget_previsionnel) },
    { header: 'Consommé', accessor: 'budget_consomme', render: (row) => {
      const prog = getProgression(row);
      return (
        <div className="flex items-center gap-3">
          <div className="w-full max-w-[80px] bg-slate-700 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${prog >= 100 ? 'bg-btp-red' : prog > 70 ? 'bg-btp-orange' : 'bg-btp-blue'}`} style={{ width: `${prog}%` }}></div>
          </div>
          <span className="text-xs text-slate-400">{prog}%</span>
        </div>
      );
    }}
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
        <h1 className="text-2xl font-bold text-white">Chantiers</h1>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-btp-blue text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-btp-blue text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau Chantier
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <DataTable 
          columns={columns} 
          data={chantiers} 
          searchable 
          searchPlaceholder="Rechercher un chantier..."
          onRowClick={(row) => navigate(`/chantiers/${row.id}`)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {chantiers.map(chantier => {
            const prog = getProgression(chantier);
            return (
              <div 
                key={chantier.id} 
                onClick={() => navigate(`/chantiers/${chantier.id}`)}
                className="glass-card p-6 cursor-pointer hover:border-btp-blue/50 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-medium text-btp-blue">{chantier.code_chantier}</span>
                    <h3 className="text-lg font-semibold text-white group-hover:text-btp-blue transition-colors">{chantier.nom}</h3>
                    <p className="text-sm text-slate-400">{chantier.client_nom}</p>
                  </div>
                  <Badge status={chantier.statut} />
                </div>
                
                <div className="space-y-2 mb-6">
                  {chantier.adresse && (
                    <div className="flex items-center text-sm text-slate-400">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      {chantier.adresse}
                    </div>
                  )}
                  {chantier.date_debut && (
                    <div className="flex items-center text-sm text-slate-400">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      {new Date(chantier.date_debut).toLocaleDateString('fr-FR')}
                      {chantier.date_fin_prevue && ` — ${new Date(chantier.date_fin_prevue).toLocaleDateString('fr-FR')}`}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Budget</span>
                    <span className="font-medium text-white">{formatMAD(chantier.budget_previsionnel)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Consommé</span>
                    <span className="font-medium text-white">{prog}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${prog >= 100 ? 'bg-btp-red' : prog > 70 ? 'bg-btp-orange' : 'bg-btp-blue'}`} style={{ width: `${prog}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouveau Chantier">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Code Chantier</label>
              <input type="text" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" placeholder="CH-2024-006" value={formData.code_chantier} onChange={e => setFormData({...formData, code_chantier: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nom du chantier</label>
              <input type="text" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Client</label>
            <input type="text" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.client_nom} onChange={e => setFormData({...formData, client_nom: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Adresse</label>
            <input type="text" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date de début</label>
              <input type="date" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.date_debut} onChange={e => setFormData({...formData, date_debut: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date de fin prévue</label>
              <input type="date" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.date_fin_prevue} onChange={e => setFormData({...formData, date_fin_prevue: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Budget Prévisionnel (MAD)</label>
              <input type="number" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.budget_previsionnel} onChange={e => setFormData({...formData, budget_previsionnel: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Statut</label>
              <select className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.statut} onChange={e => setFormData({...formData, statut: e.target.value})}>
                <option value="En préparation">En préparation</option>
                <option value="En cours">En cours</option>
                <option value="Suspendu">Suspendu</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors disabled:opacity-50">
              {submitting ? 'Création...' : 'Créer le chantier'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
