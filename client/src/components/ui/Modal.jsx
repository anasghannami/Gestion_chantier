import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) {
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop Flou Plein Écran (Recouvre Header + Sidebar + Page) */}
      <div 
        className="fixed inset-0 z-[9999] backdrop-blur-md transition-opacity" 
        style={{ backgroundColor: 'var(--overlay-bg, rgba(0, 0, 0, 0.6))' }}
        onClick={onClose}
      ></div>

      <div 
        className={`relative z-[10000] w-full ${maxWidth} rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200`}
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-secondary)'
        }}
      >
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

