import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Societe = sequelize.define('Societe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'BTP MANAGER SARL'
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  adresse: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '123 Boulevard Mohammed V, Casablanca, Maroc'
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '+212 5 22 00 00 00'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'contact@btpmanager.ma'
  },
  ice: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '001234567000089'
  },
  if_fiscal: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '45678901'
  },
  patente: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '12345678'
  },
  rc: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '234567'
  },
  capital: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '100 000 MAD'
  },
  banque: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Attijariwafa Bank'
  },
  rib: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '007 780 0001234567890123 45'
  }
}, {
  tableName: 'societes',
  timestamps: true
});

export default Societe;
