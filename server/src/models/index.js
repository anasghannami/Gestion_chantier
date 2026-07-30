import sequelize from '../config/database.js';
import Utilisateur from './Utilisateur.js';
import Chantier from './Chantier.js';
import Fournisseur from './Fournisseur.js';
import Commande from './Commande.js';
import Facture from './Facture.js';
import Ouvrier from './Ouvrier.js';

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

export {
  sequelize,
  Utilisateur,
  Chantier,
  Fournisseur,
  Commande,
  Facture,
  Ouvrier
};
