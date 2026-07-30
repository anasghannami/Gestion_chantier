# 🏗️ Gestion de Chantier BTP — Application MVP

Application full-stack de gestion de chantiers BTP avec modules Fournisseurs, Commandes, Factures et Tableau de Bord analytique.

## 🛠️ Stack Technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 19 + Vite + Tailwind CSS v4 + Recharts + Lucide React |
| **Backend** | Node.js + Express 5 (RESTful API, architecture MVC) |
| **Base de données** | MySQL + Sequelize ORM |
| **Authentification** | JWT (JSON Web Tokens) avec RBAC (4 rôles) |

## 📋 Prérequis

- **Node.js** v18+ 
- **MySQL** 8.0+ (serveur local accessible)
- **npm** v9+

## 🚀 Installation & Démarrage

### 1. Cloner et installer les dépendances

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configurer la base de données

Éditer `server/.env` avec vos credentials MySQL :

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=gestion_chantier
DB_PORT=3306
JWT_SECRET=super_secret_jwt_chantier_2024
PORT=5000
```

### 3. Lancer les seeders (créer la BDD + données de test)

```bash
cd server
npm run seed
```

### 4. Démarrer l'application

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173) dans votre navigateur.

## 🔐 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@chantier.ma | password123 |
| Conducteur de travaux | conducteur@chantier.ma | password123 |
| Achats | achats@chantier.ma | password123 |
| Comptabilité | compta@chantier.ma | password123 |

## 📁 Structure du Projet

```
Projet-chantier/
├── server/                    # Backend Express.js
│   ├── src/
│   │   ├── app.js             # Point d'entrée
│   │   ├── config/            # Configuration BDD
│   │   ├── models/            # Modèles Sequelize
│   │   ├── controllers/       # Logique métier
│   │   ├── routes/            # Routes API
│   │   ├── middleware/        # Auth JWT + RBAC
│   │   └── seeders/           # Données de test
│   └── .env
│
├── client/                    # Frontend React
│   ├── src/
│   │   ├── api/               # Config Axios
│   │   ├── context/           # AuthContext
│   │   ├── components/        # Composants réutilisables
│   │   │   ├── layout/        # Sidebar, Header, Layout
│   │   │   ├── ui/            # KpiCard, Badge, Modal, etc.
│   │   │   └── charts/        # Graphiques Recharts
│   │   └── pages/             # Pages de l'application
│   └── vite.config.js
│
└── README.md
```

## 🔗 API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/auth/login` | POST | Connexion |
| `/api/auth/me` | GET | Profil utilisateur |
| `/api/chantiers` | GET/POST | Liste / Création chantier |
| `/api/chantiers/:id` | GET/PUT | Détails / Modification chantier |
| `/api/fournisseurs` | GET/POST | Liste / Création fournisseur |
| `/api/fournisseurs/:id` | GET/PUT | Détails / Modification fournisseur |
| `/api/commandes` | GET/POST | Liste / Création commande |
| `/api/commandes/:id` | PUT | Modification commande |
| `/api/dashboard/kpi` | GET | KPIs tableau de bord |

## 🎨 Charte Graphique

- **Thème** : Dark mode professionnel (Slate & Corporate Tech)
- **Bleu BTP** : `#0284C7` — Actions principales, confiance
- **Orange Chantier** : `#EA580C` — CTAs, alertes
- **Vert Validation** : `#16A34A` — Statuts positifs, budget OK
- **Rouge Alerte** : `#DC2626` — Retards, dépassements
