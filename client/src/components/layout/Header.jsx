import { Menu, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from 'react-router';
import NotificationDropdown from '../ui/NotificationDropdown';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Tableau de Bord';
    if (path.includes('/chantiers')) return 'Gestion des Chantiers';
    if (path.includes('/planning')) return 'Planning Chronologique';
    if (path.includes('/ouvriers')) return 'Ouvriers & Main d\'œuvre';
    if (path.includes('/fournisseurs')) return 'Annuaire Fournisseurs';
    if (path.includes('/commandes')) return 'Bons de Commande';
    if (path.includes('/factures')) return 'Gestion des Factures';
    return 'BTP Manager';
  };

  return (
    <header 
      className="h-16 backdrop-blur-md flex items-center justify-between px-6 sm:px-8 sticky top-0 z-50 theme-transition"
      style={{ 
        backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.85)',
        borderBottom: `1px solid var(--border-primary)`
      }}
    >
      <div className="flex items-center space-x-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-1 rounded-md focus:outline-none"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <Menu className="h-6 w-6" />
        </button>

        <h1 className="text-lg font-semibold hidden sm:block" style={{ color: 'var(--text-primary)' }}>
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="theme-toggle-btn p-2 rounded-full transition-colors relative w-9 h-9 flex items-center justify-center"
          style={{ 
            color: 'var(--text-tertiary)',
            backgroundColor: theme === 'light' ? 'var(--bg-tertiary)' : 'transparent'
          }}
          title={theme === 'dark' ? 'Mode Jour' : 'Mode Nuit'}
        >
          <span className="icon-sun flex items-center justify-center">
            <Sun className="h-5 w-5" />
          </span>
          <span className="icon-moon">
            <Moon className="h-5 w-5" />
          </span>
        </button>

        {/* Notifications System */}
        <NotificationDropdown />
        
        <div className="hidden sm:flex items-center text-sm">
          <span className="mr-4" style={{ color: 'var(--text-secondary)' }}>
            Bonjour, <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.nom || 'Admin'}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#0284C7]/20 text-[#0284C7] text-xs font-medium border border-[#0284C7]/30">
            {user?.role || 'Admin'}
          </span>
        </div>

        <div className="h-6 w-px hidden sm:block" style={{ backgroundColor: 'var(--border-primary)' }}></div>

        <button 
          onClick={logout}
          className="flex items-center hover:text-[#DC2626] transition-colors p-2 rounded-md"
          style={{ color: 'var(--text-tertiary)' }}
          title="Se déconnecter"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
