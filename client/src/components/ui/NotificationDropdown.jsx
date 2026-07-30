import { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Clock, FileText, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import api from '../../api/axios';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAlerts = async () => {
    try {
      const [chantiersRes, facturesRes, commandesRes] = await Promise.all([
        api.get('/chantiers'),
        api.get('/factures'),
        api.get('/commandes')
      ]);

      const alerts = [];
      const today = new Date();

      // 1. Chantiers alerts
      chantiersRes.data.forEach(c => {
        if (c.statut === 'En retard') {
          alerts.push({
            id: `chantier-retard-${c.id}`,
            title: 'Chantier en retard',
            message: `Le chantier "${c.nom}" à dépassé le délai prévu.`,
            type: 'danger',
            link: `/chantiers/${c.id}`,
            date: new Date()
          });
        } else if (c.date_fin_prevue) {
          const endDate = new Date(c.date_fin_prevue);
          const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays <= 7 && c.statut !== 'Terminé') {
            alerts.push({
              id: `chantier-echeance-${c.id}`,
              title: 'Échéance proche',
              message: `Le chantier "${c.nom}" se termine dans ${diffDays} jour(s).`,
              type: 'warning',
              link: `/chantiers/${c.id}`,
              date: new Date()
            });
          }
        }
      });

      // 2. Factures alerts
      facturesRes.data.forEach(f => {
        if (f.statut_paiement === 'Échue') {
          alerts.push({
            id: `facture-echue-${f.id}`,
            title: 'Facture impayée échue',
            message: `La facture N° ${f.num_facture} est en retard de paiement.`,
            type: 'danger',
            link: '/factures',
            date: new Date()
          });
        } else if (f.statut_paiement === 'En attente') {
          alerts.push({
            id: `facture-attente-${f.id}`,
            title: 'Facture à régler',
            message: `Facture N° ${f.num_facture} en attente de règlement.`,
            type: 'info',
            link: '/factures',
            date: new Date()
          });
        }
      });

      // 3. Commandes alerts
      commandesRes.data.forEach(cmd => {
        if (cmd.statut === 'En attente' || cmd.statut === 'Brouillon') {
          alerts.push({
            id: `cmd-attente-${cmd.id}`,
            title: 'Commande à valider',
            message: `La commande N° ${cmd.num_commande} requiert une validation.`,
            type: 'warning',
            link: '/commandes',
            date: new Date()
          });
        }
      });

      setNotifications(alerts);
      setUnreadCount(alerts.length);
    } catch (e) {
      console.error("Erreur chargement notifications:", e);
    }
  };

  const handleNotificationClick = (link) => {
    setIsOpen(false);
    navigate(link);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full transition-colors hover:bg-slate-800/20"
        style={{ color: 'var(--text-tertiary)' }}
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full shadow-md leading-none select-none"
            style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
          >
            <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '10px' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-3 w-80 sm:w-96 rounded-xl shadow-2xl z-50 border overflow-hidden theme-transition"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-btp-blue" />
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications & Alertes</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-btp-orange/20 text-btp-orange font-semibold">
                  {unreadCount}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button 
                onClick={clearAll}
                className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }}
              >
                Tout effacer
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: 'var(--border-primary)' }}>
            {notifications.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                <p className="text-sm font-medium">Toutes les alertes sont traitées !</p>
                <p className="text-xs mt-1">Aucune action urgente en attente.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => handleNotificationClick(n.link)}
                  className="p-3.5 flex items-start space-x-3 cursor-pointer transition-colors hover:bg-slate-500/10"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {n.type === 'danger' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    {n.type === 'warning' && <Clock className="h-5 w-5 text-amber-500" />}
                    {n.type === 'info' && <FileText className="h-5 w-5 text-sky-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                  </div>

                  <ChevronRight className="h-4 w-4 self-center flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t text-center text-xs" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-tertiary)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Mise à jour automatique en temps réel</span>
          </div>
        </div>
      )}
    </div>
  );
}
