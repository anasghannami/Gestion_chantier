import sequelize from '../config/database.js';
import Utilisateur from './Utilisateur.js';
import Chantier from './Chantier.js';
import Fournisseur from './Fournisseur.js';
import Commande from './Commande.js';
import Facture from './Facture.js';
import Ouvrier from './Ouvrier.js';
import Devis from './Devis.js';
import DevisLigne from './DevisLigne.js';
import Materiau from './Materiau.js';
import MouvementStock from './MouvementStock.js';
import Document from './Document.js';
import Societe from './Societe.js';
import JournalChantier from './JournalChantier.js';
import PaiementFacture from './PaiementFacture.js';
import SousTraitant from './SousTraitant.js';
import ContratSousTraitance from './ContratSousTraitance.js';
import PhaseChantier from './PhaseChantier.js';
import Tache from './Tache.js';
import EvenementCalendrier from './EvenementCalendrier.js';
import EnginEquipement from './EnginEquipement.js';
import AffectationRessource from './AffectationRessource.js';
import JalonPermis from './JalonPermis.js';

// Utilisateur <-> Chantier
Utilisateur.hasMany(Chantier, { foreignKey: 'chef_chantier_id', as: 'chantiers' });
Chantier.belongsTo(Utilisateur, { foreignKey: 'chef_chantier_id', as: 'chef_chantier' });

// Chantier <-> Commande
Chantier.hasMany(Commande, { foreignKey: 'chantier_id', as: 'commandes' });
Commande.belongsTo(Chantier, { foreignKey: 'chantier_id', as: 'chantier' });

// Chantier <-> Facture
Chantier.hasMany(Facture, { foreignKey: 'chantier_id', as: 'factures' });
Facture.belongsTo(Chantier, { foreignKey: 'chantier_id', as: 'chantier' });

// Chantier <-> Ouvrier
Chantier.hasMany(Ouvrier, { foreignKey: 'chantier_id', as: 'ouvriers' });
Ouvrier.belongsTo(Chantier, { foreignKey: 'chantier_id', as: 'chantier' });

// Fournisseur <-> Commande
Fournisseur.hasMany(Commande, { foreignKey: 'fournisseur_id', as: 'commandes' });
Commande.belongsTo(Fournisseur, { foreignKey: 'fournisseur_id', as: 'fournisseur' });

// Fournisseur <-> Facture
Fournisseur.hasMany(Facture, { foreignKey: 'fournisseur_id', as: 'factures' });
Facture.belongsTo(Fournisseur, { foreignKey: 'fournisseur_id', as: 'fournisseur' });
Facture.belongsTo(Fournisseur, { foreignKey: 'fournisseur_id', as: 'facture' });

// Devis <-> DevisLigne
Devis.hasMany(DevisLigne, { foreignKey: 'devis_id', as: 'lignes', onDelete: 'CASCADE' });
DevisLigne.belongsTo(Devis, { foreignKey: 'devis_id', as: 'devis' });

// Devis <-> Chantier
Devis.belongsTo(Chantier, { foreignKey: 'chantier_id', as: 'chantier' });
Chantier.hasMany(Devis, { foreignKey: 'chantier_id', as: 'devis_associes' });
Chantier.belongsTo(Devis, { foreignKey: 'devis_id', as: 'devis_origine' });

// Materiau <-> MouvementStock
Materiau.hasMany(MouvementStock, { foreignKey: 'materiau_id', as: 'mouvements', onDelete: 'CASCADE' });
MouvementStock.belongsTo(Materiau, { foreignKey: 'materiau_id', as: 'materiau' });

// Chantier <-> MouvementStock
Chantier.hasMany(MouvementStock, { foreignKey: 'chantier_id', as: 'mouvements_stock' });
MouvementStock.belongsTo(Chantier, { foreignKey: 'chantier_id', as: 'chantier' });

// Commande <-> MouvementStock
Commande.hasMany(MouvementStock, { foreignKey: 'commande_id', as: 'mouvements_stock' });
MouvementStock.belongsTo(Commande, { foreignKey: 'commande_id', as: 'commande' });

// Chantier <-> JournalChantier
Chantier.hasMany(JournalChantier, { foreignKey: 'chantier_id', as: 'journaux', onDelete: 'CASCADE' });
JournalChantier.belongsTo(Chantier, { foreignKey: 'chantier_id', as: 'chantier' });

// Facture <-> PaiementFacture
Facture.hasMany(PaiementFacture, { foreignKey: 'facture_id', as: 'paiements', onDelete: 'CASCADE' });
PaiementFacture.belongsTo(Facture, { foreignKey: 'facture_id', as: 'facture' });

// SousTraitant <-> ContratSousTraitance <-> Chantier
SousTraitant.hasMany(ContratSousTraitance, { foreignKey: 'sous_traitant_id', as: 'contrats', onDelete: 'CASCADE' });
ContratSousTraitance.belongsTo(SousTraitant, { foreignKey: 'sous_traitant_id', as: 'sous_traitant' });

Chantier.hasMany(ContratSousTraitance, { foreignKey: 'chantier_id', as: 'contrats_sous_traitance', onDelete: 'CASCADE' });
ContratSousTraitance.belongsTo(Chantier, { foreignKey: 'chantier_id', as: 'chantier' });

// Chantier <-> PhaseChantier
Chantier.hasMany(PhaseChantier, { foreignKey: 'chantier_id', as: 'phases', onDelete: 'CASCADE' });
PhaseChantier.belongsTo(Chantier, { foreignKey: 'chantier_id', as: 'chantier' });

// Phase dependencies & relations
PhaseChantier.belongsTo(PhaseChantier, { foreignKey: 'predecesseur_id', as: 'predecesseur' });
PhaseChantier.belongsTo(Commande, { foreignKey: 'commande_id', as: 'commande' });
PhaseChantier.belongsTo(Ouvrier, { foreignKey: 'responsable_id', as: 'responsable' });

// Phase <-> AffectationRessource <-> Ouvrier / Engin
PhaseChantier.hasMany(AffectationRessource, { foreignKey: 'phase_id', as: 'affectations', onDelete: 'CASCADE' });
AffectationRessource.belongsTo(PhaseChantier, { foreignKey: 'phase_id', as: 'phase' });
AffectationRessource.belongsTo(Ouvrier, { foreignKey: 'ouvrier_id', as: 'ouvrier' });
AffectationRessource.belongsTo(EnginEquipement, { foreignKey: 'engin_id', as: 'engin' });

// Chantier <-> JalonPermis
Chantier.hasMany(JalonPermis, { foreignKey: 'jalons', as: 'jalons', onDelete: 'CASCADE' });
JalonPermis.belongsTo(Chantier, { foreignKey: 'chantier_id', as: 'chantier' });
JalonPermis.belongsTo(PhaseChantier, { foreignKey: 'phase_id', as: 'phase' });

// Chantier & Phase <-> Tache
Chantier.hasMany(Tache, { foreignKey: 'chantier_id', as: 'taches', onDelete: 'CASCADE' });
Tache.belongsTo(Chantier, { foreignKey: 'chantier_id', as: 'chantier' });

PhaseChantier.hasMany(Tache, { foreignKey: 'phase_id', as: 'taches', onDelete: 'CASCADE' });
Tache.belongsTo(PhaseChantier, { foreignKey: 'phase_id', as: 'phase' });

Tache.belongsTo(Ouvrier, { foreignKey: 'responsable_id', as: 'responsable' });

// Chantier <-> EvenementCalendrier
Chantier.hasMany(EvenementCalendrier, { foreignKey: 'chantier_id', as: 'evenements', onDelete: 'CASCADE' });
EvenementCalendrier.belongsTo(Chantier, { foreignKey: 'chantier_id', as: 'chantier' });

export {
  sequelize,
  Utilisateur,
  Chantier,
  Fournisseur,
  Commande,
  Facture,
  Ouvrier,
  Devis,
  DevisLigne,
  Materiau,
  MouvementStock,
  Document,
  Societe,
  JournalChantier,
  PaiementFacture,
  SousTraitant,
  ContratSousTraitance,
  PhaseChantier,
  Tache,
  EvenementCalendrier,
  EnginEquipement,
  AffectationRessource,
  JalonPermis
};
