# oùquandquoi.fr – Fullstack Monorepo

Plateforme pour découvrir, publier et réserver des activités locales (événements, loisirs, sorties) – France/Europe.

- **Frontend** : React + Vite + TypeScript + TailwindCSS
- **Backend** : Node.js + Express + TypeScript + MongoDB
- **Monorepo** : synchro front/back
- **Projet en évolution – contributions bienvenues**

---

## Sommaire

1. [🚀 Démarrage rapide (Docker)](#-démarrage-rapide-docker)
2. [🗂️ Architecture & Stack](#architecture--stack)
3. [💻 Démarrage manuel (Node.js)](#démarrage-manuel-nodejs)
4. [⚡ Scripts disponibles](#scripts-disponibles)
5. [🔑 Variables d’environnement](#variables-denvironnement)
6. [🛡️ Bonnes pratiques](#bonnes-pratiques)
7. [🛣️ Roadmap & contributions](#roadmap--contributions)
8. [📬 Contact](#contact)

---

## 🚀 Démarrage rapide (Docker)

**Tout lancer :**

```bash
# À la racine
docker compose up --build
````

* **Frontend** : [http://localhost:8080](http://localhost:8080)
* **Backend API** : [http://localhost:4000](http://localhost:4000)

💡 **Astuce** :
Utilise le script `startA.sh` pour lancer Docker *et* ouvrir les navigateurs (compatible bash Windows) :

```bash
./startA.sh
```

Arrêt :

```bash
docker compose down
```

**Pré-requis :**

* Docker Desktop
* Variables `.env` renseignées (`oqq_backend/.env` pour MONGO_URI...)

---

### Structure du projet (Docker)

```
/docker-compose.yml           → Orchestration front/back
/startA.sh                    → Script lancement auto + navigateurs
/cleanA.sh                    → Nettoyage profond Docker & fichiers locaux
/oqq_frontend/Dockerfile      → Build frontend (Vite+Nginx)
/oqq_backend/Dockerfile       → Build backend (Node/TS)
```

#### Ports exposés

* **Frontend** : [http://localhost:8080](http://localhost:8080)
* **Backend** : [http://localhost:4000](http://localhost:4000)

---

## 🗂️ Architecture & Stack

```
/oqq_frontend   → Front React, Vite, TS, Tailwind
/oqq_backend    → API Express, TS, MongoDB
/.vscode        → Fichiers config équipe
ouquandquoi.code-workspace → Espace de travail VS Code
.gitignore      → Exclusions build/temp/.env, etc.
```

### Techno principales

* **Frontend** : React 18, Vite, TypeScript, Tailwind, atomic design
* **Backend** : Node 18+, Express, TS, MongoDB (Atlas/local)
* **Auth** : JWT, cookies
* **API** : REST, RGPD
* **DevOps** : Docker, scripts, CI/CD (à venir)

---

## 💻 Démarrage manuel (Node.js)

### Prérequis

* Node.js 18+
* npm 9+
* MongoDB (Atlas ou local)

### Clonage & install

```bash
git clone https://github.com/alaincoulet/ouquandquoi.git
cd ouquandquoi
cd oqq_frontend && npm install
cd ../oqq_backend && npm install
```

### Configuration

```bash
cp oqq_frontend/.env.example oqq_frontend/.env
cp oqq_backend/.env.example oqq_backend/.env
# → Renseigner les clés (API URL, Mongo, etc.)
```

### Lancer le backend

```bash
cd oqq_backend
npm run dev   # dev (nodemon)
# ou
npm start     # prod (buildé)
```

### Lancer le frontend

```bash
cd ../oqq_frontend
npm run dev   # http://localhost:5173
```

---

## ⚡ Scripts disponibles

### Global

* `startA.sh` : Démarre Docker, ouvre les navigateurs (front/back)
* `cleanA.sh` : Nettoyage complet (conteneurs, images, exports, caches)
* `rapport_projet_complet.sh` : Audit/export du projet (txt)

### Frontend (`oqq_frontend`)

* `npm run dev` : Mode dev (Vite)
* `npm run build` : Build prod (dist/)
* `npm run preview` : Preview buildé

### Backend (`oqq_backend`)

* `npm run dev` : API dev (hot reload)
* `npm start` : API prod (dist/)
* `npm run build` : Compile TS
* `npm test` : Tests (à compléter)
* `npm run lint` : Lint/format (ESLint, Prettier)

---

## 🔑 Variables d’environnement

Ne jamais versionner de vrai `.env` !

* Exemple : `oqq_frontend/.env.example`, `oqq_backend/.env.example`

Principales :

* **FRONT** : `VITE_API_URL=`
* **BACK** : `MONGO_URI=`, `JWT_SECRET=`, etc.

---

## 🛡️ Bonnes pratiques

* Jamais de dev direct sur `main` : crée une branche (feature/fix/…)
* Toujours une Pull Request : relu, testé, mergé
* Atomicité des commits
* Respect conventions : nommage, typage, structure
* README à jour après chaque évolution majeure

---

## 🛣️ Roadmap & contributions

* [ ] Authentification avancée (OAuth2/social login)
* [ ] Paiement (Stripe)
* [ ] Multilingue (FR, EN, ES…)
* [ ] CI/CD (GitHub Actions)
* [ ] Documentation API (OpenAPI/Swagger)
* [ ] PWA
* [ ] Upload d’images/vidéos
* [ ] Optimisation mobile/SEO

*PR, issues, suggestions bienvenues !*

---

## 📬 Contact

👤 Alain Coulet
✉️ [alain.coulet@gmail.com](mailto:alain.coulet@gmail.com)
🌐 [oùquandquoi.fr](https://oùquandquoi.fr) *(en cours)*
