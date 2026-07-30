import { NavLink } from 'react-router';
import { LayoutDashboard, Building2, Truck, ShoppingCart, Settings, X, HardHat, FileText, Calendar, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de Bord' },
    { to: '/chantiers', icon: Building2, label: 'Chantiers' },
    { to: '/planning', icon: Calendar, label: 'Planning' },
    { to: '/ouvriers', icon: Users, label: 'Ouvriers & Main d\'œuvre' },
    { to: '/fournisseurs', icon: Truck, label: 'Fournisseurs' },
    { to: '/commandes', icon: ShoppingCart, label: 'Commandes' },
    { to: '/factures', icon: FileText, label: 'Factures' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
          style={{ backgroundColor: 'var(--overlay-bg)' }}
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col theme-transition ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          borderRight: '1px solid var(--border-primary)'
        }}
      >
        
        {/* Logo area */}
        <div className="h-16 flex items-center px-6" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <HardHat className="h-8 w-8 text-[#0284C7] mr-3" />
          <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>BTP Manager</span>
          <button onClick={onClose} className="ml-auto lg:hidden" style={{ color: 'var(--text-tertiary)' }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center px-3 py-3 rounded-lg transition-colors group ${
                    isActive 
                      ? 'bg-[#0284C7] text-white font-medium shadow-md shadow-[#0284C7]/20' 
                      : ''
                  }`
                }
                style={({ isActive }) => isActive ? {} : { color: 'var(--text-tertiary)' }}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info Bottom */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <div 
            className="flex items-center p-3 rounded-xl"
            style={{ 
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-secondary)'
            }}
          >
            <div className="h-10 w-10 rounded-full bg-[#0284C7] flex items-center justify-center text-white font-bold shadow-inner">
              {user?.nom?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.nom || 'Utilisateur'}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{user?.role || 'Administrateur'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
