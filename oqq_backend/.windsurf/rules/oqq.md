---
trigger: manual
---

## 📜 INSTRUCTIONS INTERNES — AGENT / OÙQUANDQUOI.FR

### ✍️ 1. **Documentation et propreté du code**

#### 🟩 Général

* Chaque fichier doit impérativement commencer par un **commentaire en français** indiquant :

  * le **chemin complet** du fichier dans le projet ;
  * le **rôle précis** du fichier dans l’architecture générale.

* Tous les autres commentaires à l’intérieur du code doivent être **rédigés uniquement en français**.

* Ne commenter que les **grands blocs logiques** ou les **structures importantes** (éviter le sur-commentaire de lignes triviales).

* Respecter scrupuleusement :

  * l’**indentation** ;
  * le **typage TypeScript** ;
  * les **conventions de nommage du projet** (`camelCase`, `PascalCase`, alias `@`, etc.).

* Toute modification structurelle doit être suivie d’une mise à jour du **README.md**, si nécessaire.

---

#### 🟨 Spécifique aux composants React (`.tsx`)

Chaque composant React doit comporter trois sections distinctes, clairement commentées en français :

```ts
// ==========================================================
// === ÉTAT (useState, useEffect, useContext, etc.) =========
// ==========================================================

// ==========================================================
// === COMPORTEMENT (fonctions, callbacks, logique métier) ===
// ==========================================================

// ==========================================================
// === AFFICHAGE (rendu JSX, mapping état => UI) ============
// ==========================================================
```

* Cette structure est **obligatoire** dans tous les fichiers React complets.
* Elle doit être respectée même pour les composants simples ou les futurs ajouts.

---

### 🧼 2. **Conventions et contrôle qualité**

* Toujours vérifier :

  * la conformité des **noms de branches, fichiers et dossiers** ;
  * l’absence de **fichiers inutilisés** ou redondants ;
  * la qualité et la **complétude du `README.md`** (instructions d’installation, commandes Docker, variables d’environnement, etc.).
* Tout manquement détecté doit être **signalé immédiatement** et accompagné d’une **proposition corrective** claire.

#### Commandes utiles à la vérification :

```bash
docker compose exec backend npm run lint
docker compose exec frontend npm run build
docker compose exec backend cat README.md | head -n 20
```

---

### 🛡️ 3. **Respect des règles RGPD**

* Vérifier systématiquement la présence et la visibilité de :

  * la **bannière cookies** (outil OSS tel que `Klaro`) ;
  * la **page de politique de confidentialité** ;
  * le **lien ou bouton “Gérer mes données”** dans le menu profil ;
  * l’absence totale de **trackers actifs sans consentement préalable**.
* Ces vérifications doivent être réalisées sur **le frontend et le backend**.

#### Commandes de contrôle recommandées :

```bash
docker compose exec frontend grep -R "klaro" src/
docker compose exec backend grep -R "cookie" src/middleware
```

* Tout manquement RGPD doit être notifié immédiatement et accompagné d’une solution technique conforme.

---

### 🧩 4. **Analyse des rapports et contexte Docker**

* Avant toute tâche, **analyser les rapports attachés** (`rapport_projet_complet`, etc.) pour connaître :

  * la **structure MongoDB** (collections, schémas, champs, relations) ;
  * les **liens front/back** ;
  * les **routes Express** et dépendances installées.
* Toujours travailler en tenant compte de la **stack conteneurisée** (`frontend`, `backend`, `mongodb`) et de leurs interactions réseau internes (via le `docker-compose.yml`).
* Si une incohérence est détectée entre le rapport et l’environnement Docker, la signaler avant toute proposition de code.
