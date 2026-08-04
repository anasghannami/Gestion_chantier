import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SousTraitant = sequelize.define('SousTraitant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom_entreprise: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  corps_etat: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nom_contact: {
    type: DataTypes.STRING(255)
  },
  telephone: {
    type: DataTypes.STRING(50)
  },
  email: {
    type: DataTypes.STRING(255)
  },
  adresse: {
    type: DataTypes.TEXT
  },
  siret_rc: {
    type: DataTypes.STRING(100)
  },
  assurance_decennale_numero: {
    type: DataTypes.STRING(100)
  },
  assurance_decennale_expiration: {
    type: DataTypes.DATEONLY
  },
  statut: {
    type: DataTypes.ENUM('Actif', 'Inactif'),
    defaultValue: 'Actif'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'sous_traitants',
  timestamps: true
});

export default SousTraitant;
