
# oùquandquoi.fr – Fullstack Monorepo

Plateforme complète pour découvrir, publier et réserver des activités locales (événements, loisirs, sorties) – France et Europe.

- **Frontend** : React + Vite + TypeScript + TailwindCSS
- **Backend** : Node.js + Express + TypeScript + MongoDB (Atlas ou local)
- **Monorepo** : gestion synchronisée des deux apps (frontend & backend)
- **Projet en cours – open to contributions**

---

## Sommaire

1. [Aperçu du projet](#aperçu-du-projet)
2. [Architecture & Stack](#architecture--stack)
3. [Démarrage rapide](#démarrage-rapide)
4. [Scripts disponibles](#scripts-disponibles)
5. [Variables d’environnement](#variables-denvironnement)
6. [Bonnes pratiques](#bonnes-pratiques)
7. [Roadmap & contributions](#roadmap--contributions)
8. [Contact](#contact)

---

## Aperçu du projet

oùquandquoi.fr centralise et rend accessibles toutes les activités et événements locaux, pour tous : habitants, touristes, familles, associations, entreprises, etc.  
**Fonctionnalités principales :**
- Recherche multi-critères : Où ? Quand ? Quoi ?
- Inscription, authentification, favoris
- Publication d’activités par les utilisateurs
- Filtrage par distance, catégories, dates…
- Mobile first & ultra rapide

---

## Architecture & Stack

```

/oqq\_frontend   → Front React, Vite, TS, Tailwind, atomic design
/oqq\_backend    → API REST Express, TS, MongoDB (Atlas/local)
/.vscode        → Fichiers de config équipe/projet
ouquandquoi.code-workspace → Workspace VS Code
.gitignore      → Fichiers/dossiers ignorés (temp, build, .env, etc)

````

### Technologies principales

- **Frontend** : React 18, Vite, TypeScript, TailwindCSS 3.x, atomic components
- **Backend** : Node 18+, Express, TypeScript, MongoDB (connexion Atlas ou locale)
- **Auth** : JWT, cookies sécurisés (front/back)
- **API** : REST, filtres dynamiques, RGPD
- **DevOps** : VS Code, scripts de build/test, CI/CD (à venir)
- **Hébergement** : en cours d'étude VPS ?

---

## Démarrage rapide

### 1. Prérequis

- [Node.js 18+](https://nodejs.org/)
- [npm 9+](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (Atlas ou local)

### 2. Cloner le repo

```bash
git clone https://github.com/alaincoulet/ouquandquoi.git
cd ouquandquoi
````

### 3. Installer les dépendances

```bash
cd oqq_frontend && npm install
cd ../oqq_backend && npm install
```

### 4. Configurer l’environnement

Copier les fichiers `.env.example` dans chaque dossier et adapter :

```bash
cp oqq_frontend/.env.example oqq_frontend/.env
cp oqq_backend/.env.example oqq_backend/.env
# ➔ Renseigner les clés (API URL, secrets, Mongo URI…)
```

### 5. Lancer le backend

```bash
cd oqq_backend
npm run dev        # en mode développement (nodemon, ts-node)
# ou
npm start          # en production (node dist/)
```

### 6. Lancer le frontend

```bash
cd ../oqq_frontend
npm run dev        # Accès: http://localhost:5173
```

---

## Scripts disponibles

### Frontend (`oqq_frontend`)

* `npm run dev`       – Lancer en mode dev (Vite)
* `npm run build`     – Build de prod (dist/)
* `npm run preview`   – Aperçu local du build de prod

### Backend (`oqq_backend`)

* `npm run dev`       – Lancer l’API en dev (ts-node, hot reload)
* `npm start`         – Lancer l’API en prod (node dist/)
* `npm run build`     – Compiler TypeScript (dist/)
* `npm test`          – Tests unitaires (à compléter)
* `npm run lint`      – Lint/format (ESLint, Prettier)

---

## Variables d’environnement

**À ne jamais versionner (voir `.gitignore`)**

Exemple :

* `oqq_frontend/.env.example`
* `oqq_backend/.env.example`

Variables typiques :

* FRONT : `VITE_API_URL=`
* BACK : `MONGO_URI=`, `JWT_SECRET=`, etc.

---

## Bonnes pratiques

* **Jamais de dev sur `main`** : créez une branche (feature/fix/refacto)
* **Pull request obligatoire** : code relu, testé, mergé
* **Respectez l’atomicité des commits** : un commit = une fonctionnalité/cohérence
* **Respect des conventions** : nommage, dossier, style, typage strict TypeScript
* **Mettez à jour le README** après chaque évolution majeure

---

## Roadmap & contributions

* [ ] Authentification avancée (OAuth2, social login)
* [ ] Module paiement (Stripe)
* [ ] I18n multilingue (FR, EN, ES…)
* [ ] CI/CD GitHub Actions
* [ ] Documentation API auto (OpenAPI/Swagger)
* [ ] Progressive Web App (PWA)
* [ ] Intégration d’images/vidéos pour les activités
* [ ] Optimisation mobile & SEO

*Contributions bienvenues (PR, issues, idées)*

---

## Contact

👤 Alain Coulet
✉️ [Contact direct](mailto:alain.coulet@gmail.com)
🌐 [oùquandquoi.fr](https://oùquandquoi.fr) *(bientôt public)*