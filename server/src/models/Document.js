import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom_fichier: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  chemin_fichier: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  type_mime: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  taille: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  entity_type: {
    type: DataTypes.ENUM('Chantier', 'Facture', 'Commande', 'Devis', 'Fournisseur'),
    allowNull: false
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  categorie: {
    type: DataTypes.ENUM('Photo d\'avancement', 'Bon de livraison', 'Plan & Schéma', 'Contrat & Devis', 'Facture / Reçu', 'Autre'),
    defaultValue: 'Autre'
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'documents',
  timestamps: true
});

export default Document;
