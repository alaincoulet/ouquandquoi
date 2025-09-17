# oùquandquoi.fr — Frontend

## Stack utilisée

- React 19
- Vite 7
- TailwindCSS **3.4.3**
- TypeScript

---

## Commandes principales

- `npm install` : installe toutes les dépendances
- `npm run dev` : lance le serveur de développement local
- `npm run build` : génère le build de production dans `/dist`
- `npm run preview` : sert le build localement (pré-prod)
- `npm run lint` : vérifie la qualité du code (ESLint)

---

## Fichiers principaux et leur utilité

### `vite.config.ts`
Ce fichier gère la configuration de Vite.  
Il dit à Vite d’utiliser React et permet de raccourcir les imports grâce à l’alias `@` (qui pointe vers `src`).  
**Exemple :**  
Au lieu d’écrire  
`import MonComposant from '../../components/MonComposant'`,  
on peut écrire :  
`import MonComposant from '@/components/MonComposant'`.

---

### `tailwind.config.ts`
Fichier de réglage de TailwindCSS (**version : 3.4.3**).  
Il indique dans quels fichiers chercher les classes CSS (dans `src` et `index.html`).  
Ici, tu peux aussi personnaliser les couleurs, polices ou ajouter des plugins Tailwind si besoin.

---

### `postcss.config.js`
Liste les outils qui modifient le CSS avant de l’envoyer au navigateur.  
Dans ce projet, il utilise TailwindCSS et Autoprefixer (pour la compatibilité avec tous les navigateurs).

---

### `tsconfig.json`
Configuration de TypeScript.  
Elle définit comment le code TypeScript doit être compilé, où sont les fichiers à inclure, et autorise les imports avec `@/`.

---

### `src/index.css`
Fichier principal pour les styles CSS.  
Il importe la police utilisée sur le site et active Tailwind.  
Organisation des styles en :
- **Base** : styles de base (body, titres, paragraphes)
- **Composants** : classes réutilisables (ex : .btn-primary)
- **Utilitaires** : petits styles ponctuels

---

### `src/main.tsx`
Point de départ de l’application.  
Affiche le composant principal `<App />` sur la page.  
Importe aussi les styles globaux.

---

### `src/App.tsx`
Composant racine.  
Affiche tout ce qui compose la page principale, comme le Header et le contenu.

---

### `src/components/layout/Header.tsx`
Composant qui affiche le haut du site (logo, menus, navigation…).

---

### `.gitignore`
Indique à Git de ne pas suivre certains dossiers ou fichiers (ex : `node_modules`, fichiers temporaires…).

---

### `node_modules`
Dossier où sont installées toutes les librairies du projet.  
À ne jamais modifier à la main.

---

## Build & Déploiement OVH

### 1. **Build local**
```bash
npm install
npm run build
