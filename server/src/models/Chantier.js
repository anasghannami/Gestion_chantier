import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Chantier = sequelize.define('Chantier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code_chantier: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  nom: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  client_nom: {
    type: DataTypes.STRING(255)
  },
  adresse: {
    type: DataTypes.TEXT
  },
  date_debut: {
    type: DataTypes.DATEONLY
  },
  date_fin_prevue: {
    type: DataTypes.DATEONLY
  },
  date_fin_reelle: {
    type: DataTypes.DATEONLY
  },
  statut: {
    type: DataTypes.ENUM('En préparation', 'En cours', 'En retard', 'Terminé', 'Suspendu'),
    defaultValue: 'En préparation'
  },
  budget_previsionnel: {
    type: DataTypes.DECIMAL(15, 2)
  },
  chef_chantier_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  devis_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'chantiers',
  timestamps: true
});

export default Chantier;
