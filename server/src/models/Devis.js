import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Devis = sequelize.define('Devis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  num_devis: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  client_nom: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  client_email: {
    type: DataTypes.STRING(255)
  },
  client_telephone: {
    type: DataTypes.STRING(50)
  },
  client_adresse: {
    type: DataTypes.TEXT
  },
  chantier_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  statut: {
    type: DataTypes.ENUM('Brouillon', 'Envoyé', 'Accepté', 'Refusé', 'Expiré'),
    defaultValue: 'Brouillon'
  },
  date_creation: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  date_validite: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  montant_ht: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  tva: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 20.00
  },
  montant_ttc: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'devis',
  timestamps: true
});

export default Devis;
