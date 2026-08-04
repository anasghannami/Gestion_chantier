import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@btp_cache_';
const READ_ALERTS_KEY = '@btp_read_alerts_ids';
const ALERTS_LIST_KEY = '@btp_alerts_list';

// Mock d'alertes initiales pour démonstration résiliente
const INITIAL_ALERTS = [
  {
    id: 'alt-101',
    title: 'Rupture de Stock Ciment',
    message: 'Le stock de Ciment CPJ 45 au Dépôt Principal est inférieur au seuil critique (12 sacs restants).',
    priority: 'CRITIQUE',
    type: 'Stock',
    chantierNom: 'Résidence Palmier',
    chantierId: '1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: false,
  },
  {
    id: 'alt-102',
    title: 'Retard Phase Fondation',
    message: 'La phase terrassement & coulage béton accuse 2 jours de retard sur le planning initial.',
    priority: 'CRITIQUE',
    type: 'Planning',
    chantierNom: 'Tour Casa Finance',
    chantierId: '2',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    isRead: false,
  },
  {
    id: 'alt-103',
    title: 'Livraison de Fer à Béton',
    message: 'Commande #CMD-2026-044 validée et en cours d\'acheminement par le fournisseur SOFADEX.',
    priority: 'ALERTE',
    type: 'Commande',
    chantierNom: 'Villa Anfa Sky',
    chantierId: '3',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    isRead: false,
  },
  {
    id: 'alt-104',
    title: 'Pointage Ouvriers Validé',
    message: '14 ouvriers pointés aujourd\'hui sur le chantier Centre Commercial Marina.',
    priority: 'INFO',
    type: 'Effectif',
    chantierNom: 'Centre Commercial Marina',
    chantierId: '4',
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    isRead: true,
  },
];

export const CacheService = {
  // ── Cache des réponses API ──
  async getCache(key) {
    try {
      const data = await AsyncStorage.getItem(CACHE_PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Erreur lecture cache:', key, e);
      return null;
    }
  },

  async setCache(key, value) {
    try {
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('Erreur écriture cache:', key, e);
    }
  },

  // ── Gestion des Alertes ──
  async getAlerts() {
    try {
      const stored = await AsyncStorage.getItem(ALERTS_LIST_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Première utilisation : initialiser avec les alertes de démonstration
      await AsyncStorage.setItem(ALERTS_LIST_KEY, JSON.stringify(INITIAL_ALERTS));
      return INITIAL_ALERTS;
    } catch (e) {
      return INITIAL_ALERTS;
    }
  },

  async saveAlerts(alerts) {
    try {
      await AsyncStorage.setItem(ALERTS_LIST_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Erreur sauvegarde alertes:', e);
    }
  },

  async markAlertAsRead(alertId) {
    const alerts = await this.getAlerts();
    const updated = alerts.map(a => a.id === alertId ? { ...a, isRead: true } : a);
    await this.saveAlerts(updated);
    return updated;
  },

  async markAllAlertsAsRead() {
    const alerts = await this.getAlerts();
    const updated = alerts.map(a => ({ ...a, isRead: true }));
    await this.saveAlerts(updated);
    return updated;
  },

  async addAlert(newAlert) {
    const alerts = await this.getAlerts();
    const updated = [newAlert, ...alerts];
    await this.saveAlerts(updated);
    return updated;
  },

  async deleteAlert(alertId) {
    const alerts = await this.getAlerts();
    const updated = alerts.filter(a => a.id !== alertId);
    await this.saveAlerts(updated);
    return updated;
  }
};
