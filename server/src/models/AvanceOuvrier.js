import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AvanceOuvrier = sequelize.define('AvanceOuvrier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ouvrier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  montant: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date_avance: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  semaine: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  annee: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Fiche de semaine qui a "consommé" cette avance (null = pas encore déduite).
  // Utilisé pour les intervenants à la tâche : une avance versée avant la fin
  // d'une tâche est reportée jusqu'à la clôture qui la règle.
  paiement_semaine_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'avances_ouvriers',
  timestamps: true
});

export default AvanceOuvrier;
