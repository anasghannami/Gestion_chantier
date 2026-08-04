import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EvenementCalendrier = sequelize.define('EvenementCalendrier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Réunion', 'Visite', 'Livraison', 'Contrôle', 'Congé', 'Intervention', 'Échéance'),
    defaultValue: 'Réunion'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_evenement: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  heure: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lieu: {
    type: DataTypes.STRING,
    allowNull: true
  },
  chantier_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'evenements_calendrier',
  timestamps: true
});

export default EvenementCalendrier;
