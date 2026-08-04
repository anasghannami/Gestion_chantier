import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Paperclip, Upload, FileText, Image, File, Trash2, 
  ExternalLink, Eye, Loader2, Plus, CheckCircle2, AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import ConfirmModal from './ConfirmModal';


export default function DocumentManager({ entityType, entityId, title = "Pièces Jointes & Documents (GED)" }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal de confirmation de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [categorie, setCategorie] = useState('Photo d\'avancement');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (entityType && entityId) {
      fetchDocuments();
    }
  }, [entityType, entityId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/documents?entity_type=${entityType}&entity_id=${entityId}`);
      setDocuments(res.data);
    } catch (err) {
      console.error("Erreur chargement documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('entity_type', entityType);
      formData.append('entity_id', entityId);
      formData.append('categorie', categorie);
      formData.append('description', description);

      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSelectedFile(null);
      setDescription('');
      setIsModalOpen(false);
      fetchDocuments();
    } catch (err) {
      console.error("Erreur upload document:", err);
      alert(err.response?.data?.message || "Erreur lors du téléversement du fichier.");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDeleteModal = (doc) => {
    setDocToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    try {
      await api.delete(`/documents/${docToDelete.id}`);
      fetchDocuments();
    } catch (err) {
      console.error("Erreur suppression document:", err);
    } finally {
      setIsDeleteModalOpen(false);
      setDocToDelete(null);
    }
  };


  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <Image className="h-6 w-6 text-sky-500 flex-shrink-0" />;
    if (mimeType === 'application/pdf') return <FileText className="h-6 w-6 text-red-500 flex-shrink-0" />;
    return <File className="h-6 w-6 text-btp-blue flex-shrink-0" />;
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Paperclip className="h-5 w-5 text-btp-blue" /> {title} ({documents.length})
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Photos du chantier, bons de livraison scannés, plans et documents administratifs
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg text-xs font-semibold shadow-md transition-colors self-start sm:self-auto"
        >
          <Upload className="h-4 w-4 mr-2" /> Joindre un Fichier
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-btp-blue mb-2" />
          <p className="text-xs">Chargement des documents...</p>
        </div>
      ) : documents.length === 0 ? (
        /* Empty State */
        <div className="py-10 border-2 border-dashed rounded-xl text-center" style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-tertiary)' }}>
          <Paperclip className="h-10 w-10 mx-auto mb-2 opacity-50 text-btp-blue" />
          <p className="text-sm font-semibold mb-1">Aucune pièce jointe</p>
          <p className="text-xs max-w-sm mx-auto mb-4">
            Attachez des photos d'avancement, des plans ou des factures pour conserver un historique complet.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors border border-slate-700"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5 text-btp-blue" /> Téléverser un premier fichier
          </button>
        </div>
      ) : (
        /* Document Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const isImage = doc.type_mime?.startsWith('image/');
            const backendUrl = 'http://localhost:5000';
            const fileUrl = doc.chemin_fichier.startsWith('http') ? doc.chemin_fichier : `${backendUrl}${doc.chemin_fichier}`;

            return (
              <div 
                key={doc.id}
                className="p-4 rounded-xl border flex flex-col justify-between transition-all hover:border-btp-blue/50"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border-primary)' 
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      {getFileIcon(doc.type_mime)}
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }} title={doc.nom_fichier}>
                          {doc.nom_fichier}
                        </p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-btp-blue/10 text-btp-blue">
                          {doc.categorie}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenDeleteModal(doc)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors flex-shrink-0"
                      title="Supprimer la pièce jointe"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Thumbnail Preview for Images */}
                  {isImage && (
                    <div className="h-32 w-full rounded-lg overflow-hidden mb-3 border bg-black/10" style={{ borderColor: 'var(--border-secondary)' }}>
                      <img 
                        src={fileUrl} 
                        alt={doc.nom_fichier} 
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" 
                      />
                    </div>
                  )}

                  {doc.description && (
                    <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t flex items-center justify-between text-[11px]" style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-tertiary)' }}>
                  <span>{formatFileSize(doc.taille)}</span>
                  
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-btp-blue font-semibold hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> Ouvrir
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Upload */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md" style={{ backgroundColor: 'var(--overlay-bg, rgba(0, 0, 0, 0.6))' }}>
          <div className="relative z-[10000] w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>

            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Joindre un Fichier / Document
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Catégorie du document *</label>
                <select
                  value={categorie}
                  onChange={(e) => setCategorie(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-btp-blue"
                >
                  <option value="Photo d'avancement">Photo d'avancement de chantier</option>
                  <option value="Bon de livraison">Bon de livraison (BL) scanné</option>
                  <option value="Plan & Schéma">Plan d'architecte & Schéma</option>
                  <option value="Contrat & Devis">Contrat & Devis signé</option>
                  <option value="Facture / Reçu">Facture / Reçu</option>
                  <option value="Autre">Autre document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Sélectionner Fichier (PDF, JPG, PNG, DOCX) *</label>
                <input 
                  type="file"
                  required
                  onChange={handleFileChange}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg p-2 text-white text-xs outline-none focus:border-btp-blue file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-btp-blue file:text-white hover:file:bg-btp-blue-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Description / Notes (Optionnel)</label>
                <textarea
                  rows={2}
                  placeholder="ex: Photo coulage fondation béton armé..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-btp-blue"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-btp-blue hover:bg-btp-blue-dark text-white rounded-lg text-xs font-medium transition-colors flex items-center disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Téléversement...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-1.5" /> Téléverser
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}


      {/* Modal de Confirmation de Suppression */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDocToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer le document"
        message={`Êtes-vous sûr de vouloir supprimer définitivement le document "${docToDelete?.nom_fichier || 'cette pièce jointe'}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}

