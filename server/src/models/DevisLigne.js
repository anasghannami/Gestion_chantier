import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DevisLigne = sequelize.define('DevisLigne', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  devis_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  quantite: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1.00
  },
  unite: {
    type: DataTypes.STRING(50),
    defaultValue: 'u'
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_ligne: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  }
}, {
  tableName: 'devis_lignes',
  timestamps: true
});

export default DevisLigne;
