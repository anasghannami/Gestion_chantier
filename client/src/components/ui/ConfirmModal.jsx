import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmation", 
  message = "Êtes-vous sûr de vouloir effectuer cette action ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = "danger" // danger, warning, info
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const colorConfig = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20',
      btnBg: 'bg-[#DC2626] hover:bg-[#B91C1C] focus:ring-[#DC2626]'
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20',
      btnBg: 'bg-[#EA580C] hover:bg-[#C2410C] focus:ring-[#EA580C]'
    },
    info: {
      icon: AlertTriangle,
      iconBg: 'bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/20',
      btnBg: 'bg-[#0284C7] hover:bg-[#0369A1] focus:ring-[#0284C7]'
    }
  };

  const config = colorConfig[type] || colorConfig.danger;
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-sm transition-opacity" 
        style={{ backgroundColor: 'var(--overlay-bg)' }}
        onClick={onClose}
      ></div>
      
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-md rounded-2xl shadow-2xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-secondary)'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center mt-2">
          {/* Circular Icon */}
          <div className={`p-4 rounded-full border mb-4 ${config.iconBg}`}>
            <IconComponent className="h-8 w-8" />
          </div>

          <h3 
            className="text-lg font-bold mb-2" 
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h3>
          
          <p 
            className="text-sm mb-6 max-w-sm" 
            style={{ color: 'var(--text-secondary)' }}
          >
            {message}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex space-x-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border"
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${config.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
