import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Commande = sequelize.define('Commande', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  num_commande: {
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
  date_commande: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_livraison_prevue: {
    type: DataTypes.DATEONLY
  },
  montant_ht: {
    type: DataTypes.DECIMAL(15, 2)
  },
  montant_ttc: {
    type: DataTypes.DECIMAL(15, 2)
  },
  statut: {
    type: DataTypes.ENUM('Brouillon', 'Validée', 'Livrée', 'Annulée'),
    defaultValue: 'Brouillon'
  }
}, {
  tableName: 'commandes',
  timestamps: true
});

export default Commande;
