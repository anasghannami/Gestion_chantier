import { useState, useEffect } from 'react';
import { 
  Boxes, Plus, ArrowUpRight, ArrowDownLeft, AlertTriangle, 
  PackageCheck, PackageX, Search, Filter, History, Layers,
  Edit, Trash2, Loader2, Building2
} from 'lucide-react';
import KpiCard from '../components/ui/KpiCard';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import api from '../api/axios';

const formatMAD = (amount) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount || 0);
};

export default function Stocks() {
  const [materiaux, setMateriaux] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventaire'); // 'inventaire' | 'mouvements'

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isMouvementModalOpen, setIsMouvementModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data for Article
  const [articleForm, setArticleForm] = useState({
    code_article: '',
    designation: '',
    categorie: 'Matériaux',
    unite: 'Sac',
    quantite_stock: 0,
    seuil_alerte: 10,
    prix_unitaire_moyen: 0,
    emplacement: 'Dépôt principal',
    notes: ''
  });

  // Form data for Stock Movement
  const [mouvementForm, setMouvementForm] = useState({
    materiau_id: '',
    chantier_id: '',
    type_mouvement: 'Sortie',
    quantite: 1,
    date_mouvement: new Date().toISOString().split('T')[0],
    motif: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matRes, mouvRes, chantRes] = await Promise.allSettled([
        api.get('/stocks'),
        api.get('/stocks/mouvements'),
        api.get('/chantiers')
      ]);

      if (matRes.status === 'fulfilled' && Array.isArray(matRes.value?.data)) {
        setMateriaux(matRes.value.data);
      }
      if (mouvRes.status === 'fulfilled' && Array.isArray(mouvRes.value?.data)) {
        setMouvements(mouvRes.value.data);
      }
      if (chantRes.status === 'fulfilled' && Array.isArray(chantRes.value?.data)) {
        setChantiers(chantRes.value.data);
      }
    } catch (err) {
      console.error("Erreur chargement stocks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open modal to add or edit article
  const handleOpenArticleModal = (article = null) => {
    if (article) {
      setSelectedArticle(article);
      setArticleForm({
        code_article: article.code_article || '',
        designation: article.designation || '',
        categorie: article.categorie || 'Matériaux',
        unite: article.unite || 'Sac',
        quantite_stock: article.quantite_stock || 0,
        seuil_alerte: article.seuil_alerte || 10,
        prix_unitaire_moyen: article.prix_unitaire_moyen || 0,
        emplacement: article.emplacement || 'Dépôt principal',
        notes: article.notes || ''
      });
    } else {
      setSelectedArticle(null);
      setArticleForm({
        code_article: '',
        designation: '',
        categorie: 'Matériaux',
        unite: 'Sac',
        quantite_stock: 0,
        seuil_alerte: 10,
        prix_unitaire_moyen: 0,
        emplacement: 'Dépôt principal',
        notes: ''
      });
    }
    setIsArticleModalOpen(true);
  };

  // Save Article
  const handleSaveArticle = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (selectedArticle) {
        await api.put(`/stocks/${selectedArticle.id}`, articleForm);
      } else {
        await api.post('/stocks', articleForm);
      }
      setIsArticleModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Erreur sauvegarde article:", err);
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement de l'article.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Article
  const handleDeleteArticle = async () => {
    if (!selectedArticle) return;
    try {
      setSubmitting(true);
      await api.delete(`/stocks/${selectedArticle.id}`);
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Erreur suppression article:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Open modal to record stock movement
  const handleOpenMouvementModal = (article = null, type = 'Sortie') => {
    setMouvementForm({
      materiau_id: article ? article.id : (materiaux[0]?.id || ''),
      chantier_id: '',
      type_mouvement: type,
      quantite: 1,
      date_mouvement: new Date().toISOString().split('T')[0],
      motif: type === 'Sortie' ? 'Consommation sur chantier' : 'Réapprovisionnement stock',
      notes: ''
    });
    setIsMouvementModalOpen(true);
  };

  // Save Movement
  const handleSaveMouvement = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/stocks/mouvements', mouvementForm);
      setIsMouvementModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Erreur sauvegarde mouvement:", err);
      alert(err.response?.data?.message || "Erreur lors de la saisie du mouvement.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Materials
  const filteredMateriaux = materiaux.filter(m => {
    const matchCat = selectedCategory === 'Tous' || m.categorie === selectedCategory;
    const matchSearch = searchQuery === '' || 
      m.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code_article.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Calculate KPIs
  const totalArticles = materiaux.length;
  const articlesEnAlerte = materiaux.filter(m => m.quantite_stock <= m.seuil_alerte).length;
  const totalEntrees = mouvements.filter(m => m.type_mouvement === 'Entrée').reduce((acc, curr) => acc + parseFloat(curr.quantite || 0), 0);
  const totalSorties = mouvements.filter(m => m.type_mouvement === 'Sortie').reduce((acc, curr) => acc + parseFloat(curr.quantite || 0), 0);

  // DataTable columns for Inventaire
  const inventoryColumns = [
    {
      header: 'Code Article',
      accessor: 'code_article',
      render: (row) => <span className="font-semibold text-btp-blue">{row.code_article}</span>
    },
    {
      header: 'Désignation',
      accessor: 'designation',
      render: (row) => (
        <div>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{row.designation}</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{row.emplacement}</p>
        </div>
      )
    },
    {
      header: 'Catégorie',
      accessor: 'categorie',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
          {row.categorie}
        </span>
      )
    },
    {
      header: 'Stock Actuel',
      accessor: 'quantite_stock',
      render: (row) => (
        <div className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          {row.quantite_stock} <span className="text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>{row.unite}(s)</span>
        </div>
      )
    },
    {
      header: 'Seuil d\'Alerte',
      accessor: 'seuil_alerte',
      render: (row) => (
        <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          Min: {row.seuil_alerte} {row.unite}
        </span>
      )
    },
    {
      header: 'Statut Stock',
      accessor: 'statut_stock',
      render: (row) => {
        if (row.statut_stock === 'Rupture') {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
              <PackageX className="w-3.5 h-3.5 mr-1" /> Rupture
            </span>
          );
        }
        if (row.statut_stock === 'Alerte Stock Bas') {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Alerte Stock Bas
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <PackageCheck className="w-3.5 h-3.5 mr-1" /> Stock Normal
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleOpenMouvementModal(row, 'Sortie'); }}
            className="p-1.5 rounded-lg bg-btp-orange/10 text-btp-orange hover:bg-btp-orange hover:text-white transition-colors"
            title="Saisir une Sortie"
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); handleOpenMouvementModal(row, 'Entrée'); }}
            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
            title="Saisir une Entrée"
          >
            <ArrowDownLeft className="h-4 w-4" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); handleOpenArticleModal(row); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-[#0284C7]/10 transition-colors"
            title="Modifier l'article"
          >
            <Edit className="h-4 w-4" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedArticle(row); setIsDeleteModalOpen(true); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors"
            title="Supprimer l'article"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  // DataTable columns for Mouvements
  const mouvementColumns = [
    {
      header: 'Date',
      accessor: 'date_mouvement',
      render: (row) => <span className="text-xs font-medium">{row.date_mouvement}</span>
    },
    {
      header: 'Type',
      accessor: 'type_mouvement',
      render: (row) => {
        if (row.type_mouvement === 'Entrée') {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <ArrowDownLeft className="w-3.5 h-3.5 mr-1" /> Entrée
            </span>
          );
        }
        if (row.type_mouvement === 'Sortie') {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> Sortie
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
            Ajustement
          </span>
        );
      }
    },
    {
      header: 'Article',
      accessor: 'materiau',
      render: (row) => (
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {row.materiau?.designation || 'Article supprimé'}
          </p>
          <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
            {row.materiau?.code_article}
          </p>
        </div>
      )
    },
    {
      header: 'Quantité',
      accessor: 'quantite',
      render: (row) => (
        <span className={`font-bold text-sm ${row.type_mouvement === 'Entrée' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
          {row.type_mouvement === 'Entrée' ? '+' : '-'}{row.quantite} {row.materiau?.unite}
        </span>
      )
    },
    {
      header: 'Chantier Destinataire',
      accessor: 'chantier',
      render: (row) => (
        row.chantier ? (
          <span className="inline-flex items-center text-xs font-medium text-btp-blue">
            <Building2 className="w-3.5 h-3.5 mr-1" /> {row.chantier.nom}
          </span>
        ) : (
          <span className="text-xs text-slate-400 font-italic">Dépôt principal</span>
        )
      )
    },
    {
      header: 'Motif / Référence',
      accessor: 'motif',
      render: (row) => (
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {row.motif}
        </span>
      )
    }
  ];

  const categoriesList = ['Tous', 'Matériaux', 'Acier & Fer', 'Liants & Ciment', 'Carburant', 'Outillage', 'Sécurité', 'Autre'];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-btp-blue animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Chargement de la gestion des stocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Boxes className="h-7 w-7 text-btp-blue" /> Gestion des Stocks & Matériaux (Magasin)
          </h1>
          <p className="text-slate-400 mt-1">
            Suivi en temps réel des matériaux, consommations par chantier et réapprovisionnements
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleOpenMouvementModal(null, 'Sortie')}
            className="flex items-center px-3.5 py-2 bg-btp-orange hover:bg-orange-600 text-white rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
          >
            <ArrowUpRight className="h-4 w-4 mr-1.5" /> Saisir Mouvement
          </button>
          
          <button
            onClick={() => handleOpenArticleModal(null)}
            className="flex items-center px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg transition-all duration-200 font-semibold text-xs shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Nouveau Matériau
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Total Articles" 
          value={totalArticles} 
          icon={Layers} 
          color="blue" 
          subtitle="Catalogue inventaire"
        />
        <KpiCard 
          title="Articles en Alerte" 
          value={articlesEnAlerte} 
          icon={AlertTriangle} 
          color={articlesEnAlerte > 0 ? "red" : "green"} 
          subtitle={articlesEnAlerte > 0 ? "Sous le seuil minimal" : "Aucun sous le seuil"}
        />
        <KpiCard 
          title="Total Entrées" 
          value={`${totalEntrees} unités`} 
          icon={ArrowDownLeft} 
          color="green" 
          subtitle="Livraisons & réappro"
        />
        <KpiCard 
          title="Total Sorties" 
          value={`${totalSorties} unités`} 
          icon={ArrowUpRight} 
          color="orange" 
          subtitle="Consommées sur chantiers"
        />
      </div>

      {/* Main Card with Tabs */}
      <div className="glass-card p-6">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          {/* Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('inventaire')}
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'inventaire'
                  ? 'bg-btp-blue text-white shadow-lg shadow-btp-blue/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Boxes className="h-4 w-4 mr-2" /> Inventaire des Matériaux ({materiaux.length})
            </button>

            <button
              onClick={() => setActiveTab('mouvements')}
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'mouvements'
                  ? 'bg-btp-blue text-white shadow-lg shadow-btp-blue/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <History className="h-4 w-4 mr-2" /> Journal des Mouvements ({mouvements.length})
            </button>
          </div>

          {/* Search & Category Filter */}
          {activeTab === 'inventaire' && (
            <div className="flex items-center space-x-3">
              {/* Category selector */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-btp-blue"
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Rechercher article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-btp-blue"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'inventaire' ? (
          <DataTable 
            columns={inventoryColumns} 
            data={filteredMateriaux} 
            emptyMessage="Aucun matériel trouvé dans l'inventaire."
          />
        ) : (
          <DataTable 
            columns={mouvementColumns} 
            data={mouvements} 
            emptyMessage="Aucun mouvement de stock enregistré."
          />
        )}
      </div>

      {/* Modal: Nouveau / Modifier Article */}
      <Modal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        title={selectedArticle ? "Modifier l'Article de Stock" : "Ajouter un Nouvel Article au Catalogue"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveArticle} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Code Article</label>
              <input 
                type="text"
                placeholder="Auto (ex: MAT-007)"
                value={articleForm.code_article}
                onChange={e => setArticleForm({ ...articleForm, code_article: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Catégorie *</label>
              <select
                value={articleForm.categorie}
                onChange={e => setArticleForm({ ...articleForm, categorie: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none text-sm"
              >
                <option value="Matériaux">Matériaux</option>
                <option value="Acier & Fer">Acier & Fer</option>
                <option value="Liants & Ciment">Liants & Ciment</option>
                <option value="Carburant">Carburant</option>
                <option value="Outillage">Outillage</option>
                <option value="Sécurité">Sécurité</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Désignation de l'article *</label>
            <input 
              type="text"
              required
              placeholder="ex: Sac de Ciment CPJ 45"
              value={articleForm.designation}
              onChange={e => setArticleForm({ ...articleForm, designation: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Unité de mesure *</label>
              <select
                value={articleForm.unite}
                onChange={e => setArticleForm({ ...articleForm, unite: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none text-sm"
              >
                <option value="Sac">Sac</option>
                <option value="Tonne">Tonne</option>
                <option value="Kg">Kg</option>
                <option value="Unité">Unité</option>
                <option value="Litre">Litre</option>
                <option value="m³">m³</option>
                <option value="Boîte">Boîte</option>
                <option value="Mètre">Mètre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Stock Initial *</label>
              <input 
                type="number"
                step="0.01"
                required
                value={articleForm.quantite_stock}
                onChange={e => setArticleForm({ ...articleForm, quantite_stock: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Seuil d'Alerte *</label>
              <input 
                type="number"
                step="0.01"
                required
                value={articleForm.seuil_alerte}
                onChange={e => setArticleForm({ ...articleForm, seuil_alerte: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Prix Unitaire Moyen (MAD)</label>
              <input 
                type="number"
                step="0.01"
                placeholder="65.00"
                value={articleForm.prix_unitaire_moyen}
                onChange={e => setArticleForm({ ...articleForm, prix_unitaire_moyen: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Emplacement / Stockage</label>
              <input 
                type="text"
                placeholder="Dépôt principal, Citerne 1..."
                value={articleForm.emplacement}
                onChange={e => setArticleForm({ ...articleForm, emplacement: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={() => setIsArticleModalOpen(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Enregistrement...' : selectedArticle ? 'Mettre à jour' : 'Créer l\'Article'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Saisir un Mouvement de Stock */}
      <Modal
        isOpen={isMouvementModalOpen}
        onClose={() => setIsMouvementModalOpen(false)}
        title="Saisir un Mouvement de Stock (Entrée / Sortie)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveMouvement} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Article / Matériau *</label>
            <select
              required
              value={mouvementForm.materiau_id}
              onChange={e => setMouvementForm({ ...mouvementForm, materiau_id: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none text-sm"
            >
              <option value="">Sélectionner un article...</option>
              {materiaux.map(m => (
                <option key={m.id} value={m.id}>
                  {m.code_article} - {m.designation} (Stock: {m.quantite_stock} {m.unite})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Type Mouvement *</label>
              <select
                value={mouvementForm.type_mouvement}
                onChange={e => setMouvementForm({ ...mouvementForm, type_mouvement: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none text-sm"
              >
                <option value="Sortie">Sortie (Consommation)</option>
                <option value="Entrée">Entrée (Réapprovisionnement)</option>
                <option value="Ajustement">Ajustement (Inventaire)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Quantité *</label>
              <input 
                type="number"
                step="0.01"
                required
                min="0.01"
                value={mouvementForm.quantite}
                onChange={e => setMouvementForm({ ...mouvementForm, quantite: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Chantier Destinataire (Optionnel)</label>
            <select
              value={mouvementForm.chantier_id}
              onChange={e => setMouvementForm({ ...mouvementForm, chantier_id: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none text-sm"
            >
              <option value="">Aucun (Stock général / Dépôt)</option>
              {chantiers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nom} ({c.code_chantier})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Date Mouvement *</label>
            <input 
              type="date"
              required
              value={mouvementForm.date_mouvement}
              onChange={e => setMouvementForm({ ...mouvementForm, date_mouvement: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Motif / Déplacement *</label>
            <input 
              type="text"
              required
              placeholder="ex: Coulage voile béton étage 1"
              value={mouvementForm.motif}
              onChange={e => setMouvementForm({ ...mouvementForm, motif: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-btp-blue outline-none text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={() => setIsMouvementModalOpen(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-btp-orange hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Valider...' : 'Valider le Mouvement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmation Suppression */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteArticle}
        title="Supprimer l'article de stock ?"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedArticle?.designation}" de l'inventaire ?`}
        confirmText="Supprimer"
      />
    </div>
  );
}
