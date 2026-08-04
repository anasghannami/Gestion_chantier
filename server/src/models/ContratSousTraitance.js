import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ContratSousTraitance = sequelize.define('ContratSousTraitance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sous_traitant_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  chantier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  objet_travaux: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  montant_ht: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  montant_ttc: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  date_debut: {
    type: DataTypes.DATEONLY
  },
  date_fin_prevue: {
    type: DataTypes.DATEONLY
  },
  statut: {
    type: DataTypes.ENUM('En cours', 'Terminé', 'Suspendu', 'Résilié'),
    defaultValue: 'En cours'
  }
}, {
  tableName: 'contrat_sous_traitance',
  timestamps: true
});

export default ContratSousTraitance;
