import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EnginEquipement = sequelize.define('EnginEquipement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Grue', 'Bétonnière', 'Pelleteuse', 'Coffrage', 'Camion Benne', 'Compacteur', 'Générateur', 'Autre'),
    defaultValue: 'Autre'
  },
  immatriculation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cout_journalier: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  statut: {
    type: DataTypes.ENUM('Disponible', 'En service', 'En maintenance'),
    defaultValue: 'Disponible'
  }
}, {
  tableName: 'engins_equipements',
  timestamps: true
});

export default EnginEquipement;
