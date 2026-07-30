import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Facture = sequelize.define('Facture', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  num_facture: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  fournisseur_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  chantier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date_emission: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_echeance: {
    type: DataTypes.DATEONLY
  },
  montant_ht: {
    type: DataTypes.DECIMAL(15, 2)
  },
  montant_tva: {
    type: DataTypes.DECIMAL(15, 2)
  },
  montant_ttc: {
    type: DataTypes.DECIMAL(15, 2)
  },
  statut_paiement: {
    type: DataTypes.ENUM('En attente', 'Payée', 'Échue', 'Partiellement payée'),
    defaultValue: 'En attente'
  }
}, {
  tableName: 'factures',
  timestamps: true
});

export default Facture;
