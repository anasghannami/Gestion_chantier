import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PhaseChantier = sequelize.define('PhaseChantier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ordre: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  date_debut: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  date_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  duree_jours: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  pourcentage_avancement: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  statut: {
    type: DataTypes.ENUM('À faire', 'En cours', 'En retard', 'En attente', 'Terminée'),
    defaultValue: 'À faire'
  },
  est_critique: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  predecesseur_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  chantier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  commande_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  responsable_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cout_prevu: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  cout_reel: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'phase_chantiers',
  timestamps: true
});

export default PhaseChantier;
