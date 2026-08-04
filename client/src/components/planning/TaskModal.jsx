import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { User, Trash2, Check, Clock, AlertTriangle, Building2, Calendar, X, Plus } from 'lucide-react';

export default function TaskModal({
  isOpen,
  onClose,
  task = null, // null for new, object for edit
  prefilledDate = null,
  chantiers = [],
  ouvriers = [],
  allTasks = [],
  onSave,
  onDelete
}) {
  const isEditing = Boolean(task && task.id);

  const [formData, setFormData] = useState({
    nom: '',
    chantier_id: '',
    description: '',
    date_debut: '',
    date_fin: '',
    heures_estimees: 8,
    heures_realisees: 0,
    statut: 'À faire',
    ouvriers_ids: [],
    dependances_ids: []
  });

  const [newDepInput, setNewDepInput] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        nom: task.nom || '',
        chantier_id: task.chantier_id || (chantiers[0]?.id || ''),
        description: task.description || '',
        date_debut: task.date_debut || prefilledDate || new Date().toISOString().split('T')[0],
        date_fin: task.date_fin || prefilledDate || new Date().toISOString().split('T')[0],
        heures_estimees: task.heures_estimees || 8,
        heures_realisees: task.heures_realisees || 0,
        statut: task.statut || 'À faire',
        ouvriers_ids: task.ouvriers_ids || [],
        dependances_ids: task.dependances_ids || []
      });
    } else {
      const defaultDate = prefilledDate || new Date().toISOString().split('T')[0];
      setFormData({
        nom: '',
        chantier_id: chantiers[0]?.id || '',
        description: '',
        date_debut: defaultDate,
        date_fin: defaultDate,
        heures_estimees: 8,
        heures_realisees: 0,
        statut: 'À faire',
        ouvriers_ids: [],
        dependances_ids: []
      });
    }
    setNewDepInput('');
  }, [task, prefilledDate, chantiers, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nom || !formData.chantier_id || !formData.date_debut) {
      alert('Veuillez remplir les champs obligatoires (Titre, Chantier, Date de début).');
      return;
    }
    onSave({
      ...(task || {}),
      ...formData,
      id: task?.id || Date.now()
    });
    onClose();
  };

  const handleAddDependency = (e) => {
    if (e) e.preventDefault();
    const val = newDepInput.trim();
    if (!val) return;

    setFormData(prev => ({
      ...prev,
      dependances_ids: [...(prev.dependances_ids || []), val]
    }));
    setNewDepInput('');
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-input)',
    borderColor: 'var(--border-primary)',
    color: 'var(--text-primary)'
  };

  const labelStyle = {
    color: 'var(--text-secondary)'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Détail / Édition de la Tâche" : "Nouvelle Tâche de Chantier"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={labelStyle}>
            Nom de la tâche <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="ex: Coulage béton fondations"
            className="w-full rounded-lg px-3 py-2 text-xs border outline-none focus:border-[#0284C7] transition-colors"
            style={inputStyle}
            value={formData.nom}
            onChange={e => setFormData({ ...formData, nom: e.target.value })}
          />
        </div>

        {/* Chantier & Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1" style={labelStyle}>
              Chantier associé <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full rounded-lg px-3 py-2 text-xs border outline-none focus:border-[#0284C7] transition-colors"
              style={inputStyle}
              value={formData.chantier_id}
              onChange={e => setFormData({ ...formData, chantier_id: e.target.value })}
            >
              <option value="">Sélectionner un chantier</option>
              {chantiers.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={labelStyle}>
              Statut
            </label>
            <select
              className="w-full rounded-lg px-3 py-2 text-xs border outline-none focus:border-[#0284C7] transition-colors"
              style={inputStyle}
              value={formData.statut}
              onChange={e => setFormData({ ...formData, statut: e.target.value })}
            >
              <option value="À faire">À faire</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
              <option value="En retard">En retard</option>
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1" style={labelStyle}>
              Date Début <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              className="w-full rounded-lg px-3 py-2 text-xs border outline-none focus:border-[#0284C7] transition-colors"
              style={inputStyle}
              value={formData.date_debut}
              onChange={e => setFormData({ ...formData, date_debut: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={labelStyle}>
              Date Fin
            </label>
            <input
              type="date"
              className="w-full rounded-lg px-3 py-2 text-xs border outline-none focus:border-[#0284C7] transition-colors"
              style={inputStyle}
              value={formData.date_fin}
              onChange={e => setFormData({ ...formData, date_fin: e.target.value })}
            />
          </div>
        </div>

        {/* Hours */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1" style={labelStyle}>
              Heures Estimées
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-lg px-3 py-2 text-xs border outline-none focus:border-[#0284C7] transition-colors"
              style={inputStyle}
              value={formData.heures_estimees}
              onChange={e => setFormData({ ...formData, heures_estimees: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={labelStyle}>
              Heures Réalisées
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-lg px-3 py-2 text-xs border outline-none focus:border-[#0284C7] transition-colors"
              style={inputStyle}
              value={formData.heures_realisees}
              onChange={e => setFormData({ ...formData, heures_realisees: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={labelStyle}>
            Description / Consignes
          </label>
          <textarea
            rows="2"
            placeholder="Précisions sur la méthode, matériaux ou spécifications..."
            className="w-full rounded-lg px-3 py-2 text-xs border outline-none focus:border-[#0284C7] transition-colors resize-none"
            style={inputStyle}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          ></textarea>
        </div>

        {/* Assigned Workers (Select Dropdown + List) */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>
            Ouvriers assignés
          </label>

          <div className="flex gap-2 mb-2">
            <select
              className="w-full rounded-lg px-3 py-2 text-xs border outline-none focus:border-[#0284C7] transition-colors"
              style={inputStyle}
              value=""
              onChange={(e) => {
                const workerId = Number(e.target.value);
                if (workerId && !formData.ouvriers_ids.includes(workerId)) {
                  setFormData(prev => ({
                    ...prev,
                    ouvriers_ids: [...prev.ouvriers_ids, workerId]
                  }));
                }
              }}
            >
              <option value="">+ Affecter un ouvrier à cette tâche...</option>
              {ouvriers
                .filter(o => !formData.ouvriers_ids.includes(o.id))
                .map(o => (
                  <option key={o.id} value={o.id}>
                    {o.prenom} {o.nom} ({o.specialite || 'Ouvrier'})
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {formData.ouvriers_ids.map(workerId => {
              const o = ouvriers.find(w => Number(w.id) === Number(workerId));
              if (!o) return null;
              return (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-2 rounded-lg border text-xs transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center text-white bg-[#0284C7]">
                      {o.avatar || o.prenom.slice(0, 1) + o.nom.slice(0, 1)}
                    </span>
                    <div>
                      <span className="font-semibold">{o.prenom} {o.nom}</span>
                      {o.specialite && (
                        <span className="text-[10px] ml-2 opacity-75">({o.specialite})</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        ouvriers_ids: prev.ouvriers_ids.filter(id => id !== workerId)
                      }));
                    }}
                    className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                    title="Retirer l'ouvrier"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}

            {formData.ouvriers_ids.length === 0 && (
              <p className="text-xs italic text-center py-2" style={{ color: 'var(--text-tertiary)' }}>
                Aucun ouvrier affecté. Sélectionnez un ouvrier ci-dessus.
              </p>
            )}
          </div>
        </div>

        {/* Dependencies (Text Input + Add Button + List) */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>
            Dépendances (Tâches préalables)
          </label>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="ex: Terrassement, Coulage béton..."
              className="flex-1 rounded-lg px-3 py-2 text-xs border outline-none focus:border-[#0284C7] transition-colors"
              style={inputStyle}
              value={newDepInput}
              onChange={(e) => setNewDepInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDependency(e);
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddDependency}
              className="px-3.5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" /> Ajouter
            </button>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {(formData.dependances_ids || []).map((dep, index) => {
              const taskObj = typeof dep === 'number' ? allTasks.find(item => Number(item.id) === Number(dep)) : null;
              const depName = taskObj ? taskObj.nom : String(dep);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg border text-xs transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span className="font-semibold truncate">{depName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        dependances_ids: prev.dependances_ids.filter((_, i) => i !== index)
                      }));
                    }}
                    className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors flex-shrink-0 ml-2"
                    title="Supprimer la dépendance"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}

            {(!formData.dependances_ids || formData.dependances_ids.length === 0) && (
              <p className="text-xs italic text-center py-2" style={{ color: 'var(--text-tertiary)' }}>
                Aucune dépendance ajoutée. Saisissez une tâche préalable ci-dessus.
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="flex justify-between items-center pt-4 border-t"
          style={{ borderColor: 'var(--border-secondary)' }}
        >
          <div></div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)'
              }}
            >
              Fermer
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </div>

      </form>
    </Modal>
  );
}
