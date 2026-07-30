import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Fournisseur = sequelize.define('Fournisseur', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code_fournisseur: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  raison_sociale: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  categorie: {
    type: DataTypes.STRING(100)
  },
  adresse: {
    type: DataTypes.TEXT
  },
  telephone: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(255)
  },
  contact_referent: {
    type: DataTypes.STRING(255)
  },
  rc_if: {
    type: DataTypes.STRING(100)
  },
  conditions_paiement: {
    type: DataTypes.STRING(255)
  },
  note: {
    type: DataTypes.TEXT
  },
  statut: {
    type: DataTypes.ENUM('Actif', 'Inactif', 'Bloqué'),
    defaultValue: 'Actif'
  }
}, {
  tableName: 'fournisseurs',
  timestamps: true
});

export default Fournisseur;
