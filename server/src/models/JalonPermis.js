import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const JalonPermis = sequelize.define('JalonPermis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chantier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  phase_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type_jalon: {
    type: DataTypes.ENUM('Autorisation de construire', 'Permis d\'habiter', 'Réception provisoire', 'Réception définitive', 'Livraison Matériaux', 'Inspection Sécurité', 'Autre'),
    defaultValue: 'Autre'
  },
  date_prevue: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_obtention: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  statut: {
    type: DataTypes.ENUM('En attente', 'Validé', 'En retard', 'Rejeté'),
    defaultValue: 'En attente'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'jalons_permis',
  timestamps: true
});

export default JalonPermis;
