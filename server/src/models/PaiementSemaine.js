import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PaiementSemaine = sequelize.define('PaiementSemaine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ouvrier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  semaine: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  annee: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type_remuneration: {
    type: DataTypes.ENUM('Journalier', 'Tâche'),
    defaultValue: 'Journalier'
  },
  jours_travailles: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 0
  },
  tarif_journalier: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  total_taches: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_brut: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_avances: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  reste_paye: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  date_paiement: {
    type: DataTypes.DATEONLY
  },
  statut: {
    type: DataTypes.ENUM('En cours', 'Payé'),
    defaultValue: 'En cours'
  }
}, {
  tableName: 'paiements_semaine',
  timestamps: true
});

export default PaiementSemaine;
