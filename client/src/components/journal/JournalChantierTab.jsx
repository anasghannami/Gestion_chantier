import { useState, useEffect } from 'react';
import { Plus, Sun, CloudRain, Snowflake, Wind, Users, AlertTriangle, Image as ImageIcon, Trash2, Calendar, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import api from '../../api/axios';

export default function JournalChantierTab({ chantierId }) {
  const [journaux, setJournaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    meteo: 'Soleil',
    effectif_present: 1,
    travaux_realises: '',
    incidents_retards: '',
    photos: []
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (chantierId) {
      fetchJournaux();
    }
  }, [chantierId]);

  const fetchJournaux = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/journal/chantier/${chantierId}`);
      setJournaux(res.data);
    } catch (err) {
      console.error('Erreur chargement journal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append('chantier_id', chantierId);
      submitData.append('date', formData.date);
      submitData.append('meteo', formData.meteo);
      submitData.append('effectif_present', formData.effectif_present);
      submitData.append('travaux_realises', formData.travaux_realises);
      submitData.append('incidents_retards', formData.incidents_retards);

      selectedFiles.forEach((file) => {
        submitData.append('photos', file);
      });

      await api.post('/journal', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setIsModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        meteo: 'Soleil',
        effectif_present: 1,
        travaux_realises: '',
        incidents_retards: '',
        photos: []
      });
      setSelectedFiles([]);
      fetchJournaux();
    } catch (err) {
      console.error('Erreur création rapport journal:', err);
      alert('Erreur lors de l\'enregistrement du compte-rendu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous supprimer ce compte-rendu journalier ?')) return;
    try {
      await api.delete(`/journal/${id}`);
      fetchJournaux();
    } catch (err) {
      console.error('Erreur suppression journal:', err);
    }
  };

  const renderMeteoIcon = (meteo) => {
    switch (meteo) {
      case 'Pluie':
        return <CloudRain className="h-5 w-5 text-blue-400" />;
      case 'Gel':
      case 'Neige':
        return <Snowflake className="h-5 w-5 text-cyan-300" />;
      case 'Vent':
        return <Wind className="h-5 w-5 text-slate-300" />;
      default:
        return <Sun className="h-5 w-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Journal de Chantier Quotidien</h3>
          <p className="text-xs text-slate-400">Compte-rendus journaliers des effectifs, météo et événements du terrain</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-2 bg-[#0284C7] hover:bg-[#0284C7]/90 text-white rounded-xl text-xs font-semibold shadow-md shadow-[#0284C7]/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Rédiger le Journal du Jour</span>
        </button>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#0284C7]" />
        </div>
      ) : journaux.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-slate-700 p-6">
          <Calendar className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Aucun journal de chantier rédigé pour le moment</p>
          <p className="text-xs text-slate-500 mt-1">Saisissez les effectifs et les faits marquants chaque jour.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {journaux.map((item) => (
            <div 
              key={item.id} 
              className="p-5 rounded-2xl theme-transition relative border"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}
            >
              <div className="flex items-center justify-between border-b pb-3 mb-3 border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 text-xs font-bold text-slate-200">
                    <Calendar className="h-3.5 w-3.5 text-[#0284C7]" />
                    <span>{item.date}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-300">
                    {renderMeteoIcon(item.meteo)}
                    <span>{item.meteo}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-300">
                    <Users className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{item.effectif_present} ouvrier(s) sur place</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {item.travaux_realises && (
                  <div>
                    <p className="font-semibold text-slate-300 mb-1">Travaux Réalisés :</p>
                    <p className="text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                      {item.travaux_realises}
                    </p>
                  </div>
                )}

                {item.incidents_retards && (
                  <div className="flex items-start space-x-2 text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Incidents / Retards signalés :</p>
                      <p className="mt-0.5">{item.incidents_retards}</p>
                    </div>
                  </div>
                )}

                {item.photos && item.photos.length > 0 && (
                  <div>
                    <p className="font-semibold text-slate-300 mb-2 flex items-center">
                      <ImageIcon className="h-3.5 w-3.5 mr-1.5 text-sky-400" /> Photos du jour ({item.photos.length}) :
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {item.photos.map((photo, idx) => (
                        <a key={idx} href={`http://localhost:5000${photo}`} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={`http://localhost:5000${photo}`} 
                            alt={`Photo ${idx+1}`} 
                            className="h-20 w-full object-cover rounded-xl border border-slate-700 hover:opacity-90 transition-opacity" 
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Journal Entry */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Rédiger un Journal de Chantier">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Météo</label>
              <select
                value={formData.meteo}
                onChange={(e) => setFormData({ ...formData, meteo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              >
                <option value="Soleil">☀️ Ensoleillé</option>
                <option value="Nuageux">☁️ Nuageux</option>
                <option value="Pluie">🌧️ Pluie</option>
                <option value="Vent">💨 Vent fort</option>
                <option value="Gel">❄️ Gel / Neige</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Effectif Présent *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.effectif_present}
                onChange={(e) => setFormData({ ...formData, effectif_present: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Travaux réalisés aujourd'hui *</label>
            <textarea
              required
              rows={4}
              value={formData.travaux_realises}
              onChange={(e) => setFormData({ ...formData, travaux_realises: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              placeholder="Ex: Coulage de la dalle R+1 terminé à 16h. Démarrage de la pose des agglos sur la façade Ouest."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Incidents / Retards éventuels</label>
            <textarea
              rows={2}
              value={formData.incidents_retards}
              onChange={(e) => setFormData({ ...formData, incidents_retards: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs theme-transition focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              placeholder="Ex: Retard de 2h sur la livraison de toupie béton."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Photos du jour (Max 5)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-1.5 text-xs text-slate-400 border border-slate-700 rounded-xl bg-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0284C7] hover:bg-[#0284C7]/90 text-white shadow-lg shadow-[#0284C7]/20 transition-all flex items-center space-x-2"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Publier le Journal</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
