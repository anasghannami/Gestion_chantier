# Application Mobile - Gestion Chantier (React Native / Expo)

Cette application mobile permet la gestion complète des chantiers de construction sur smartphone (Android / iOS / Web) en se connectant directement au backend Express et à la base de données PostgreSQL / Sequelize du projet.

## 🌟 Fonctionnalités Mobiles

- 🌙 **Mode Nuit / Jour (Dark / Light Mode)** : Basculement instantané depuis l'en-tête ou le menu, mémorisé sur l'appareil via `AsyncStorage`.
- 🔑 **Authentification Sécurisée** : Connexion via JWT, persistance de session mobile.
- 📊 **Tableau de bord** : Vue synthétique des chantiers actifs, volumes financiers, commandes et factures.
- 🏗️ **Gestion des Chantiers** : Liste, filtres, détails, modification du statut (En cours / Terminé) et création de nouveaux chantiers.
- 📦 **Commandes Matériaux** : Suivi des approvisionnements et mise à jour des livraisons.
- 🧾 **Factures & Règlements** : Suivi des factures clients/fournisseurs avec changement d'état de paiement.
- 🚚 **Fournisseurs** : Annuaire avec appel direct d'un clic depuis l'application.
- 👥 **Équipe & Ouvriers** : Liste du personnel, affectations et contacts.
- 📅 **Planning** : Calendrier et dates d'intervention.

---

## 🚀 Démarrage Rapide

### 1. Installation des Dépendances
Dans le dossier `mobile` :
```bash
cd mobile
npm install
```

### 2. Lancement du Serveur de Développement Mobile
```bash
npm start
# Ou pour le web:
npm run web
```

### 3. Connexion au Backend Server
Assurez-vous que le serveur backend (`server`) est lancé sur le port 5000 (`npm run dev` dans `server`).
Pour un test sur téléphone physique via l'application **Expo Go**, modifiez la variable d'environnement ou l'IP backend dans `mobile/src/api/axios.js`.
