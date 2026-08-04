// ============================================================
// Données mockées complètes pour le module Planning BTP Manager
// Structure hiérarchique WBS avec phases, tâches, dépendances,
// ressources, jalons et chemin critique.
// ============================================================

// ─── Chantiers ───────────────────────────────────────────────
export const MOCK_CHANTIERS = [
  {
    id: 1,
    code: 'CH-VILLA-CASA',
    nom: 'Construction Villa Moderne - Casablanca',
    client: 'Groupe Addoha',
    adresse: 'Casablanca',
  },
  {
    id: 2,
    code: 'CH-RENO-RABAT',
    nom: 'Rénovation Bureau - Rabat',
    client: 'Marjane Holding',
    adresse: 'Rabat',
  },
  {
    id: 3,
    code: 'CH-ETANCH-RBT',
    nom: 'Étanchéité Toit Rabat',
    client: 'Société Immobilière Rabat',
    adresse: 'Rabat',
  },
];

// ─── Ressources ──────────────────────────────────────────────
export const MOCK_OUVRIERS = [
  { id: 1, nom: 'El Amrani', prenom: 'Ahmed', specialite: 'Maçon', avatar: 'AE', charge: 80 },
  { id: 2, nom: 'Bennani', prenom: 'Karim', specialite: 'Électricien', avatar: 'KB', charge: 100 },
  { id: 3, nom: 'Kabbaj', prenom: 'Youssef', specialite: 'Plombier', avatar: 'YK', charge: 60 },
  { id: 4, nom: 'Chraibi', prenom: 'Omar', specialite: 'Conducteur d\'Engins', avatar: 'OC', charge: 50 },
  { id: 5, nom: 'Tazi', prenom: 'Rachid', specialite: 'Peinture & Finitions', avatar: 'RT', charge: 40 },
];

// Matériels mockés
export const MOCK_MATERIELS = [
  { id: 101, nom: 'Camion benne', type: 'Véhicule' },
  { id: 102, nom: 'Bétonnière', type: 'Machine' },
];

// ─── Tâches WBS hiérarchiques ────────────────────────────────
// Dates fixes : Janvier → Avril 2026
// "Aujourd'hui" simulé = 15 février 2026

export const MOCK_TACHES = [
  // ═══════════════════════════════════════════
  // CHANTIER 1 : Villa Moderne Casablanca
  // ═══════════════════════════════════════════

  // ── Phase 1 : Terrassement (parent) ──
  {
    id: 1,
    nom: 'Phase 1 : Terrassement',
    chantier_id: 1,
    parent_id: null,
    description: 'Phase de terrassement et préparation du terrain',
    date_debut: '2026-01-05',
    date_fin: '2026-01-11',
    duree: 5,
    avancement: 100,
    statut: 'Terminé',
    priorite: 'Haute',
    ouvriers_ids: [1, 4],
    materiels_ids: [101],
    dependances_ids: [],
    is_milestone: false,
    is_critical: false,
    notes: 'Phase achevée sans retard.',
    historique: [
      { date: '2026-01-05', user: 'Znidi', action: 'Création de la phase' },
      { date: '2026-01-11', user: 'Znidi', action: 'Marquée comme terminée' },
    ],
  },
  // Tâche 1.1
  {
    id: 11,
    nom: 'Démolition existant',
    chantier_id: 1,
    parent_id: 1,
    description: 'Démolition des structures existantes sur le terrain',
    date_debut: '2026-01-05',
    date_fin: '2026-01-07',
    duree: 2,
    avancement: 100,
    statut: 'Terminé',
    priorite: 'Haute',
    ouvriers_ids: [1, 4],
    materiels_ids: [101],
    dependances_ids: [],
    is_milestone: false,
    is_critical: false,
    notes: '',
    historique: [
      { date: '2026-01-05', user: 'Ahmed', action: 'Début des travaux de démolition' },
      { date: '2026-01-07', user: 'Ahmed', action: 'Démolition terminée' },
    ],
  },
  // Tâche 1.2
  {
    id: 12,
    nom: 'Terrassement & fondations',
    chantier_id: 1,
    parent_id: 1,
    description: 'Terrassement du sol et préparation des fondations',
    date_debut: '2026-01-08',
    date_fin: '2026-01-11',
    duree: 3,
    avancement: 100,
    statut: 'Terminé',
    priorite: 'Haute',
    ouvriers_ids: [1, 4],
    materiels_ids: [101, 102],
    dependances_ids: [11],
    is_milestone: false,
    is_critical: true,
    notes: '',
    historique: [
      { date: '2026-01-08', user: 'Ahmed', action: 'Début terrassement' },
      { date: '2026-01-11', user: 'Ahmed', action: 'Fondations coulées avec succès' },
    ],
  },

  // Jalon fin terrassement
  {
    id: 19,
    nom: '◆ Jalon : Fin Terrassement',
    chantier_id: 1,
    parent_id: null,
    description: 'Validation de la fin du terrassement',
    date_debut: '2026-01-12',
    date_fin: '2026-01-12',
    duree: 0,
    avancement: 100,
    statut: 'Terminé',
    priorite: 'Haute',
    ouvriers_ids: [],
    materiels_ids: [],
    dependances_ids: [12],
    is_milestone: true,
    is_critical: true,
    notes: 'Jalon validé par le conducteur de travaux.',
    historique: [
      { date: '2026-01-12', user: 'Znidi', action: 'Jalon validé' },
    ],
  },

  // ── Phase 2 : Gros Œuvre (parent) ──
  {
    id: 2,
    nom: 'Phase 2 : Gros Œuvre',
    chantier_id: 1,
    parent_id: null,
    description: 'Construction du gros œuvre : murs, dalles, poteaux',
    date_debut: '2026-01-13',
    date_fin: '2026-02-28',
    duree: 15,
    avancement: 60,
    statut: 'En cours',
    priorite: 'Haute',
    ouvriers_ids: [1, 2],
    materiels_ids: [102],
    dependances_ids: [19],
    is_milestone: false,
    is_critical: true,
    notes: 'Phase en cours avec léger retard sur les murs étage.',
    historique: [
      { date: '2026-01-13', user: 'Znidi', action: 'Début du gros œuvre' },
      { date: '2026-02-10', user: 'Znidi', action: 'Avancement mis à jour à 60%' },
    ],
  },
  // Tâche 2.1
  {
    id: 21,
    nom: 'Élévation murs RDC',
    chantier_id: 1,
    parent_id: 2,
    description: 'Construction des murs porteurs du rez-de-chaussée',
    date_debut: '2026-01-13',
    date_fin: '2026-01-19',
    duree: 5,
    avancement: 100,
    statut: 'Terminé',
    priorite: 'Haute',
    ouvriers_ids: [1],
    materiels_ids: [102],
    dependances_ids: [19],
    is_milestone: false,
    is_critical: true,
    notes: '',
    historique: [
      { date: '2026-01-13', user: 'Ahmed', action: 'Début élévation murs RDC' },
      { date: '2026-01-19', user: 'Ahmed', action: 'Murs RDC terminés' },
    ],
  },
  // Tâche 2.2
  {
    id: 22,
    nom: 'Dalle étage',
    chantier_id: 1,
    parent_id: 2,
    description: 'Coffrage et coulage de la dalle du 1er étage',
    date_debut: '2026-01-20',
    date_fin: '2026-01-25',
    duree: 4,
    avancement: 80,
    statut: 'En cours',
    priorite: 'Haute',
    ouvriers_ids: [1, 4],
    materiels_ids: [102],
    dependances_ids: [21],
    is_milestone: false,
    is_critical: true,
    notes: 'Reste le coulage final prévu lundi.',
    historique: [
      { date: '2026-01-20', user: 'Ahmed', action: 'Début coffrage dalle' },
      { date: '2026-02-05', user: 'Znidi', action: 'Avancement 80%' },
    ],
  },
  // Tâche 2.3 (En retard)
  {
    id: 23,
    nom: 'Élévation murs étage',
    chantier_id: 1,
    parent_id: 2,
    description: 'Construction des murs du 1er étage — en retard de 3 jours',
    date_debut: '2026-01-26',
    date_fin: '2026-02-28',
    duree: 6,
    avancement: 10,
    statut: 'En retard',
    priorite: 'Haute',
    ouvriers_ids: [1],
    materiels_ids: [],
    dependances_ids: [22],
    is_milestone: false,
    is_critical: true,
    notes: 'Retard causé par mauvais temps et pénurie de briques.',
    historique: [
      { date: '2026-01-26', user: 'Ahmed', action: 'Début murs étage' },
      { date: '2026-02-10', user: 'Znidi', action: 'Signalement retard — 10% seulement' },
    ],
  },

  // ── Phase 3 : Second Œuvre (parent) ──
  {
    id: 3,
    nom: 'Phase 3 : Second Œuvre',
    chantier_id: 1,
    parent_id: null,
    description: 'Électricité, plomberie, finitions intérieures',
    date_debut: '2026-03-01',
    date_fin: '2026-03-14',
    duree: 10,
    avancement: 0,
    statut: 'À faire',
    priorite: 'Moyenne',
    ouvriers_ids: [2, 3],
    materiels_ids: [],
    dependances_ids: [23],
    is_milestone: false,
    is_critical: false,
    notes: 'En attente de la fin du gros œuvre.',
    historique: [
      { date: '2026-01-05', user: 'Znidi', action: 'Phase planifiée' },
    ],
  },
  // Tâche 3.1
  {
    id: 31,
    nom: 'Électricité',
    chantier_id: 1,
    parent_id: 3,
    description: 'Installation du réseau électrique complet',
    date_debut: '2026-03-01',
    date_fin: '2026-03-07',
    duree: 5,
    avancement: 0,
    statut: 'À faire',
    priorite: 'Moyenne',
    ouvriers_ids: [2],
    materiels_ids: [],
    dependances_ids: [23],
    is_milestone: false,
    is_critical: false,
    notes: '',
    historique: [],
  },
  // Tâche 3.2
  {
    id: 32,
    nom: 'Plomberie',
    chantier_id: 1,
    parent_id: 3,
    description: 'Installation de la plomberie et sanitaires',
    date_debut: '2026-03-08',
    date_fin: '2026-03-14',
    duree: 5,
    avancement: 0,
    statut: 'À faire',
    priorite: 'Moyenne',
    ouvriers_ids: [3],
    materiels_ids: [],
    dependances_ids: [31],
    is_milestone: false,
    is_critical: false,
    notes: '',
    historique: [],
  },

  // Jalon fin chantier 1
  {
    id: 39,
    nom: '◆ Jalon : Réception Villa',
    chantier_id: 1,
    parent_id: null,
    description: 'Réception provisoire de la villa',
    date_debut: '2026-03-15',
    date_fin: '2026-03-15',
    duree: 0,
    avancement: 0,
    statut: 'À faire',
    priorite: 'Haute',
    ouvriers_ids: [],
    materiels_ids: [],
    dependances_ids: [32],
    is_milestone: true,
    is_critical: true,
    notes: '',
    historique: [],
  },

  // ═══════════════════════════════════════════
  // CHANTIER 2 : Rénovation Bureau Rabat
  // ═══════════════════════════════════════════

  // Phase 1 : Démolition
  {
    id: 4,
    nom: 'Phase 1 : Démolition',
    chantier_id: 2,
    parent_id: null,
    description: 'Dépose cloisons et nettoyage',
    date_debut: '2026-01-15',
    date_fin: '2026-01-18',
    duree: 3,
    avancement: 100,
    statut: 'Terminé',
    priorite: 'Haute',
    ouvriers_ids: [1, 5],
    materiels_ids: [101],
    dependances_ids: [],
    is_milestone: false,
    is_critical: false,
    notes: '',
    historique: [
      { date: '2026-01-15', user: 'Znidi', action: 'Début démolition bureau' },
      { date: '2026-01-18', user: 'Znidi', action: 'Démolition terminée' },
    ],
  },

  // Phase 2 : Cloisonnement
  {
    id: 5,
    nom: 'Phase 2 : Cloisonnement',
    chantier_id: 2,
    parent_id: null,
    description: 'Mise en place des nouvelles cloisons placo',
    date_debut: '2026-01-20',
    date_fin: '2026-01-25',
    duree: 4,
    avancement: 50,
    statut: 'En cours',
    priorite: 'Moyenne',
    ouvriers_ids: [1, 5],
    materiels_ids: [],
    dependances_ids: [4],
    is_milestone: false,
    is_critical: false,
    notes: 'Avancement à mi-parcours.',
    historique: [
      { date: '2026-01-20', user: 'Znidi', action: 'Début cloisonnement' },
      { date: '2026-02-01', user: 'Znidi', action: 'Avancement 50%' },
    ],
  },

  // Phase 3 : Finitions
  {
    id: 6,
    nom: 'Phase 3 : Finitions',
    chantier_id: 2,
    parent_id: null,
    description: 'Peinture, sols, éclairage',
    date_debut: '2026-02-01',
    date_fin: '2026-02-07',
    duree: 5,
    avancement: 0,
    statut: 'À faire',
    priorite: 'Basse',
    ouvriers_ids: [2, 3, 5],
    materiels_ids: [],
    dependances_ids: [5],
    is_milestone: false,
    is_critical: false,
    notes: '',
    historique: [],
  },

  // Jalon fin chantier 2
  {
    id: 69,
    nom: '◆ Jalon : Réception Bureau',
    chantier_id: 2,
    parent_id: null,
    description: 'Remise des clés au client',
    date_debut: '2026-02-08',
    date_fin: '2026-02-08',
    duree: 0,
    avancement: 0,
    statut: 'À faire',
    priorite: 'Haute',
    ouvriers_ids: [],
    materiels_ids: [],
    dependances_ids: [6],
    is_milestone: true,
    is_critical: false,
    notes: '',
    historique: [],
  },
];

// ─── Date simulée "aujourd'hui" ──────────────────────────────
export const SIMULATED_TODAY = '2026-02-15';
