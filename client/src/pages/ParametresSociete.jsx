import { useState, useEffect } from 'react';
import { 
  Building, Upload, Save, Loader2, Image as ImageIcon, 
  CreditCard, FileText, CheckCircle2, ShieldAlert 
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ParametresSociete() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    ice: '',
    if_fiscal: '',
    patente: '',
    rc: '',
    capital: '',
    banque: '',
    rib: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchSociete();
  }, []);

  const fetchSociete = async () => {
    try {
      setLoading(true);
      const res = await api.get('/societe');
      if (res.data) {
        setFormData({
          nom: res.data.nom || '',
          adresse: res.data.adresse || '',
          telephone: res.data.telephone || '',
          email: res.data.email || '',
          ice: res.data.ice || '',
          if_fiscal: res.data.if_fiscal || '',
          patente: res.data.patente || '',
          rc: res.data.rc || '',
          capital: res.data.capital || '',
          banque: res.data.banque || '',
          rib: res.data.rib || ''
        });

        if (res.data.logo) {
          const backendUrl = 'http://localhost:5000';
          const fullLogoUrl = res.data.logo.startsWith('http') ? res.data.logo : `${backendUrl}${res.data.logo}`;
          setLogoPreview(fullLogoUrl);
        }
      }
    } catch (err) {
      console.error("Erreur chargement société:", err);
      setErrorMsg("Impossible de charger les coordonnées de l'entreprise.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      setSaving(true);
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      if (logoFile) {
        data.append('logo', logoFile);
      }

      const res = await api.put('/societe', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg("Paramètres de l'entreprise enregistrés avec succès !");
      if (res.data.societe?.logo) {
        const backendUrl = 'http://localhost:5000';
        setLogoPreview(`${backendUrl}${res.data.societe.logo}?t=${Date.now()}`);
      }
    } catch (err) {
      console.error("Erreur sauvegarde société:", err);
      setErrorMsg(err.response?.data?.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-btp-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Building className="h-6 w-6 text-btp-blue" /> Paramètres Entreprise & Coordonnées Officielles
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Configurez votre logo officiel, identifiants fiscaux (ICE, IF, RC) et RIB pour vos devis et factures.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 : Logo & Raison Sociale */}
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-700/50 pb-3 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-btp-blue" /> Logo Officiel & Identité
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Preview Card */}
            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/40 text-center">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Logo Entreprise" 
                  className="max-h-24 max-w-full object-contain rounded mb-2" 
                />
              ) : (
                <Building className="h-16 w-16 text-slate-600 mb-2" />
              )}
              <p className="text-xs text-slate-400">Aperçu du Logo Officiel</p>
            </div>

            {/* Upload Button & Fields */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Téléverser un nouveau Logo (PNG, JPG, SVG)
                </label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2 text-white text-xs outline-none focus:border-btp-blue file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-btp-blue file:text-white hover:file:bg-btp-blue-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Raison Sociale / Nom de la Société *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.nom}
                  onChange={e => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="ex: BTP MANAGER SARL"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-btp-blue"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Téléphone Officiel</label>
              <input 
                type="text"
                value={formData.telephone}
                onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="+212 5 22 00 00 00"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-btp-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Officiel</label>
              <input 
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@entreprise.ma"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-btp-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Capital Social</label>
              <input 
                type="text"
                value={formData.capital}
                onChange={e => setFormData({ ...formData, capital: e.target.value })}
                placeholder="ex: 100 000 MAD"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-btp-blue"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Adresse Siège Social</label>
              <textarea 
                rows={2}
                value={formData.adresse}
                onChange={e => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="ex: 123 Boulevard Mohammed V, Casablanca, Maroc"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-btp-blue"
              />
            </div>
          </div>
        </div>

        {/* Section 2 : Numéros Administratifs & Légaux (ICE, IF, Patente, RC) */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-700/50 pb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-btp-orange" /> Identifiants Fiscaux & Administratifs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">ICE (15 chiffres)</label>
              <input 
                type="text"
                value={formData.ice}
                onChange={e => setFormData({ ...formData, ice: e.target.value })}
                placeholder="001234567000089"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-btp-blue font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">IF (Identifiant Fiscal)</label>
              <input 
                type="text"
                value={formData.if_fiscal}
                onChange={e => setFormData({ ...formData, if_fiscal: e.target.value })}
                placeholder="45678901"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-btp-blue font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Patente N°</label>
              <input 
                type="text"
                value={formData.patente}
                onChange={e => setFormData({ ...formData, patente: e.target.value })}
                placeholder="12345678"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-btp-blue font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">RC (Registre Commerce)</label>
              <input 
                type="text"
                value={formData.rc}
                onChange={e => setFormData({ ...formData, rc: e.target.value })}
                placeholder="234567"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-btp-blue font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3 : Coordonnées Bancaires (Banque & RIB) */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-700/50 pb-3 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-400" /> Coordonnées Bancaires (RIB)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nom de la Banque</label>
              <input 
                type="text"
                value={formData.banque}
                onChange={e => setFormData({ ...formData, banque: e.target.value })}
                placeholder="ex: Attijariwafa Bank"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-btp-blue"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">RIB Bancaire (24 chiffres)</label>
              <input 
                type="text"
                value={formData.rib}
                onChange={e => setFormData({ ...formData, rib: e.target.value })}
                placeholder="007 780 0001234567890123 45"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-btp-blue font-mono tracking-wider"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        {user?.role === 'Admin' && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2.5 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-xl font-bold text-sm shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Enregistrer les Paramètres
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
