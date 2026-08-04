import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Loader2, FileSpreadsheet, Download } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import api from '../api/axios';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

export default function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const navigate = useNavigate();

  const handleExportExcel = () => {
    const exportColumns = [
      { header: 'Code', accessor: 'code_fournisseur' },
      { header: 'Raison Sociale', accessor: 'raison_sociale' },
      { header: 'Catégorie', accessor: 'categorie' },
      { header: 'Contact Référent', accessor: 'contact_referent' },
      { header: 'Téléphone', accessor: 'telephone' },
      { header: 'Email', accessor: 'email' },
      { header: 'Conditions Paiement', accessor: 'conditions_paiement' },
      { header: 'Statut', accessor: 'statut' }
    ];
    exportToExcel(exportColumns, fournisseurs, 'Annuaire_Fournisseurs_BTP');
  };

  const handleExportPDF = () => {
    const exportColumns = [
      { header: 'Code', accessor: 'code_fournisseur' },
      { header: 'Raison Sociale', accessor: 'raison_sociale' },
      { header: 'Catégorie', accessor: 'categorie' },
      { header: 'Téléphone', accessor: 'telephone' },
      { header: 'Conditions Paiement', accessor: 'conditions_paiement' },
      { header: 'Statut', accessor: 'statut' }
    ];
    exportToPDF({
      title: 'Annuaire Répertoire des Fournisseurs',
      subtitle: `Total partenaires référencés : ${fournisseurs.length}`,
      columns: exportColumns,
      data: fournisseurs,
      filename: 'Annuaire_Fournisseurs_BTP'
    });
  };

  const [formData, setFormData] = useState({
    code_fournisseur: '', raison_sociale: '', categorie: 'Matériaux', telephone: '', email: '', contact_referent: '', adresse: '', rc_if: '', conditions_paiement: '30 jours', note: '', statut: 'Actif'
  });

  const categories = ['Matériaux', 'Électricité', 'Plomberie', 'Location engins', 'Peinture', 'Menuiserie'];

  useEffect(() => {
    fetchFournisseurs();
  }, [selectedCategorie]);

  const fetchFournisseurs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategorie) params.categorie = selectedCategorie;
      const response = await api.get('/fournisseurs', { params });
      setFournisseurs(response.data);
    } catch (error) {
      console.error("Erreur chargement fournisseurs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/fournisseurs', formData);
      setIsModalOpen(false);
      setFormData({ code_fournisseur: '', raison_sociale: '', categorie: 'Matériaux', telephone: '', email: '', contact_referent: '', adresse: '', rc_if: '', conditions_paiement: '30 jours', note: '', statut: 'Actif' });
      fetchFournisseurs();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'Code', accessor: 'code_fournisseur', render: (row) => <span className="text-btp-blue font-medium">{row.code_fournisseur}</span> },
    { header: 'Raison Sociale', accessor: 'raison_sociale', render: (row) => <span className="font-semibold text-white">{row.raison_sociale}</span> },
    { header: 'Catégorie', accessor: 'categorie', render: (row) => <span className="text-slate-300">{row.categorie || '—'}</span> },
    { header: 'Téléphone', accessor: 'telephone', render: (row) => <span className="text-slate-300">{row.telephone || '—'}</span> },
    { header: 'Email', accessor: 'email', render: (row) => <span className="text-slate-300">{row.email || '—'}</span> },
    { header: 'Statut', accessor: 'statut', render: (row) => <Badge status={row.statut} /> }
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
        <h1 className="text-2xl font-bold text-white">Annuaire Fournisseurs</h1>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:border-btp-blue outline-none"
            value={selectedCategorie}
            onChange={e => setSelectedCategorie(e.target.value)}
          >
            <option value="">Toutes catégories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <button 
            onClick={handleExportExcel}
            className="flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
            title="Exporter la liste des fournisseurs sous Excel"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Export Excel
          </button>

          <button 
            onClick={handleExportPDF}
            className="flex items-center px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
            title="Exporter l'annuaire des fournisseurs au format PDF"
          >
            <Download className="h-4 w-4 mr-1.5" /> Annuaire PDF
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nouveau Fournisseur
          </button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={fournisseurs} 
        searchable 
        searchPlaceholder="Rechercher un fournisseur..."
        onRowClick={(row) => navigate(`/fournisseurs/${row.id}`)}
      />

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouveau Fournisseur">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Code Fournisseur</label>
              <input type="text" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" placeholder="FRN-009" value={formData.code_fournisseur} onChange={e => setFormData({...formData, code_fournisseur: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Raison Sociale</label>
              <input type="text" required className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.raison_sociale} onChange={e => setFormData({...formData, raison_sociale: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Catégorie</label>
              <select className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.categorie} onChange={e => setFormData({...formData, categorie: e.target.value})}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Conditions de paiement</label>
              <input type="text" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.conditions_paiement} onChange={e => setFormData({...formData, conditions_paiement: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Téléphone</label>
              <input type="tel" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input type="email" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Contact Référent</label>
            <input type="text" className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none" value={formData.contact_referent} onChange={e => setFormData({...formData, contact_referent: e.target.value})} />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-colors disabled:opacity-50">
              {submitting ? 'Création...' : 'Créer Fournisseur'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
