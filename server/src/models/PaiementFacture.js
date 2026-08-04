import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PaiementFacture = sequelize.define('PaiementFacture', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  facture_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date_paiement: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  montant: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  mode_paiement: {
    type: DataTypes.ENUM('Virement', 'Chèque', 'Espèces', 'Carte', 'Autre'),
    defaultValue: 'Virement'
  },
  reference: {
    type: DataTypes.STRING(100)
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'paiement_factures',
  timestamps: true
});

export default PaiementFacture;
