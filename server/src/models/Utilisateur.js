import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  mot_de_passe_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('Admin', 'Conducteur', 'Achats', 'Comptabilite'),
    defaultValue: 'Conducteur'
  },
  statut: {
    type: DataTypes.ENUM('Actif', 'Inactif'),
    defaultValue: 'Actif'
  },
  last_login: {
    type: DataTypes.DATE
  },
  reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_token_expires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'utilisateurs',
  timestamps: true
});

export default Utilisateur;
