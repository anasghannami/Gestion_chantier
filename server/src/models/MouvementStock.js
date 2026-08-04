import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MouvementStock = sequelize.define('MouvementStock', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  materiau_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  chantier_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  commande_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  type_mouvement: {
    type: DataTypes.ENUM('Entrée', 'Sortie', 'Ajustement'),
    allowNull: false
  },
  quantite: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  date_mouvement: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  motif: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Mouvement de stock'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'mouvements_stock',
  timestamps: true
});

export default MouvementStock;
