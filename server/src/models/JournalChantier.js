import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const JournalChantier = sequelize.define('JournalChantier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chantier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  meteo: {
    type: DataTypes.STRING(50),
    defaultValue: 'Soleil'
  },
  effectif_present: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  travaux_realises: {
    type: DataTypes.TEXT
  },
  incidents_retards: {
    type: DataTypes.TEXT
  },
  photos: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'journal_chantiers',
  timestamps: true
});

export default JournalChantier;
