import { NavLink } from 'react-router';
import {
  LayoutDashboard, Building2, Truck, ShoppingCart,
  X, FileText, Calendar, Users,
  PanelLeft, FileSpreadsheet, Boxes, Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const { user } = useAuth();
  const { theme } = useTheme();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de Bord' },
    { to: '/chantiers', icon: Building2, label: 'Chantiers' },
    { to: '/devis', icon: FileSpreadsheet, label: 'Devis' },
    { to: '/planning', icon: Calendar, label: 'Planning' },
    {
      to: '/ouvriers', icon: Users, label: 'Ouvriers '
    },
    { to: '/stocks', icon: Boxes, label: 'Stocks & Matériaux' },
    { to: '/fournisseurs', icon: Truck, label: 'Fournisseurs' },
    { to: '/commandes', icon: ShoppingCart, label: 'Commandes' },
    { to: '/factures', icon: FileText, label: 'Factures' }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm lg:hidden transition-opacity"
          style={{ backgroundColor: 'var(--overlay-bg)' }}
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col theme-transition ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} w-64`}
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRight: '1px solid var(--border-primary)'
        }}
      >

        {/* Top Header Area */}
        <div
          className={`h-16 flex items-center ${isCollapsed ? 'lg:justify-center px-2' : 'justify-between px-4'
            } transition-all duration-300`}
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          {isCollapsed ? (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 rounded-xl transition-all duration-200 hover:bg-[#0284C7]/10 hover:text-[#0284C7]"
              style={{ color: 'var(--text-tertiary)' }}
              title="Ouvrir la barre latérale"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          ) : (
            <>
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-1 rounded-xl bg-white shadow-md shadow-[#0284C7]/20 flex items-center justify-center flex-shrink-0">
                  <img src="/logo.png" alt="BTP Manager" className="h-7 w-7 object-contain" />
                </div>
                <span className="text-base font-bold tracking-tight whitespace-nowrap truncate" style={{ color: 'var(--text-primary)' }}>
                  BTP Manager
                </span>
              </div>

              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-xl transition-all duration-200 hover:bg-[#0284C7]/10 hover:text-[#0284C7] flex-shrink-0 ml-2"
                style={{ color: 'var(--text-tertiary)' }}
                title="Fermer la barre latérale"
              >
                <PanelLeft className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Close button (Mobile) */}
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section Title */}
        {!isCollapsed && (
          <div className="px-5 pt-4 pb-1">
            <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400/80">Menu principal</p>
          </div>
        )}

        {/* Navigation */}
        <nav className={`flex-1 ${isCollapsed ? 'px-2 py-4 space-y-2' : 'px-3 py-2 space-y-1.5'} overflow-y-auto`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-xl transition-all duration-200 group relative font-medium text-sm ${isCollapsed ? 'lg:justify-center lg:px-0 lg:py-3 px-3.5 py-3' : 'px-3.5 py-3'
                  } ${isActive
                    ? 'bg-[#0284C7] text-white shadow-lg shadow-[#0284C7]/25 font-semibold'
                    : 'hover:bg-[#0284C7]/10 hover:text-[#0284C7]'
                  }`
                }
                style={({ isActive }) => isActive ? {} : { color: 'var(--text-tertiary)' }}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${!isCollapsed ? 'mr-3 group-hover:translate-x-0.5' : ''
                      } ${isActive ? 'text-white' : ''}`} />

                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info Bottom (Simple Profile Badge) */}
        <div className={isCollapsed ? 'p-2' : 'p-3'} style={{ borderTop: '1px solid var(--border-primary)' }}>
          <div
            className={`flex items-center rounded-xl transition-all duration-200 ${isCollapsed ? 'lg:justify-center lg:p-2 p-3' : 'p-3'
              }`}
            style={{
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-secondary)'
            }}
            title={isCollapsed ? `${user?.nom || 'Utilisateur'} (${user?.role || 'Admin'})` : undefined}
          >
            <div className="relative flex-shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#0284C7]/70 flex items-center justify-center text-white font-bold shadow-md">
                {user?.nom?.charAt(0) || 'U'}
              </div>
              <span className="absolute bottom-0 right-[#2px] h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0F172A]"></span>
            </div>

            {!isCollapsed && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {user?.nom || 'Utilisateur'}
                </p>
                <p className="text-xs truncate font-medium mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  {user?.role || 'Administrateur'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
