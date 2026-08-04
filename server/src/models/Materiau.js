import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Materiau = sequelize.define('Materiau', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code_article: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  designation: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  categorie: {
    type: DataTypes.ENUM('Matériaux', 'Acier & Fer', 'Liants & Ciment', 'Carburant', 'Outillage', 'Sécurité', 'Autre'),
    defaultValue: 'Matériaux'
  },
  unite: {
    type: DataTypes.ENUM('Sac', 'Tonne', 'Kg', 'Unité', 'Litre', 'm³', 'Boîte', 'Mètre'),
    defaultValue: 'Unité'
  },
  quantite_stock: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  seuil_alerte: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 10
  },
  prix_unitaire_moyen: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  emplacement: {
    type: DataTypes.STRING(100),
    defaultValue: 'Dépôt principal'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'materiaux',
  timestamps: true
});

export default Materiau;
