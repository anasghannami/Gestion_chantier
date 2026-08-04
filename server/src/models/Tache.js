import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Tache = sequelize.define('Tache', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priorite: {
    type: DataTypes.ENUM('Basse', 'Moyenne', 'Haute', 'Urgente'),
    defaultValue: 'Moyenne'
  },
  statut: {
    type: DataTypes.ENUM('À faire', 'En cours', 'En attente', 'Terminée', 'Terminé', 'Annulée', 'En retard'),
    defaultValue: 'À faire'
  },
  date_debut: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  date_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  duree: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  avancement: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  pourcentage_avancement: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  cout_estime: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  cout_reel: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  chantier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  phase_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  responsable_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ouvriers_ids: {
    type: DataTypes.JSON,
    allowNull: true
  },
  dependances_ids: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'taches',
  timestamps: true
});

export default Tache;
