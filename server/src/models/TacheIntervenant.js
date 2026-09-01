import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TacheIntervenant = sequelize.define('TacheIntervenant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ouvrier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nom: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  montant: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  date_debut: {
    type: DataTypes.DATEONLY
  },
  date_fin: {
    type: DataTypes.DATEONLY
  },
  statut: {
    type: DataTypes.ENUM('En cours', 'Terminée', 'Payée'),
    defaultValue: 'En cours'
  },
  // Fiche de semaine qui a réglé cette tâche
  paiement_semaine_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  semaine_paiement: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  annee_paiement: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'taches_intervenants',
  timestamps: true
});

export default TacheIntervenant;
