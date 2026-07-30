import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Ouvrier = sequelize.define('Ouvrier', {
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
  cin: {
    type: DataTypes.STRING(50)
  },
  telephone: {
    type: DataTypes.STRING(50)
  },
  specialite: {
    type: DataTypes.STRING(100),
    defaultValue: 'Maçon'
  },
  tarif_journalier: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  statut: {
    type: DataTypes.ENUM('Actif', 'Inactif', 'En congé'),
    defaultValue: 'Actif'
  },
  chantier_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'ouvriers',
  timestamps: true
});

export default Ouvrier;
