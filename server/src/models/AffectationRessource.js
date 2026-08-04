import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AffectationRessource = sequelize.define('AffectationRessource', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phase_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ouvrier_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  engin_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  date_debut: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_fin: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  heures_prevues: {
    type: DataTypes.INTEGER,
    defaultValue: 8
  },
  taux_charge: {
    type: DataTypes.INTEGER,
    defaultValue: 100 // % of capacity allocated
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'affectations_ressources',
  timestamps: true
});

export default AffectationRessource;
