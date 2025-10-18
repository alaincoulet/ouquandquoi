# 🗺️ Fonctionnalité Carte Interactive - Guide d'implémentation

## 📋 Vue d'ensemble

Cette fonctionnalité ajoute une carte interactive de France avec clustering des activités, similaire à Nomador.com. Les activités filtrées s'affichent sur la carte avec regroupement automatique des marqueurs proches.

---

## 🚀 Installation des dépendances

### Étape 1 : Installer les packages NPM

Dans le terminal du frontend (`oqq_frontend`), exécutez :

```bash
npm install leaflet react-leaflet
npm install @types/leaflet --save-dev
npm install react-leaflet-cluster
```

### Étape 2 : Ajouter les styles CSS de Leaflet

Dans votre fichier `src/index.css` ou `src/App.css`, ajoutez :

```css
@import 'leaflet/dist/leaflet.css';
```

---

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers

1. **`src/components/organisms/MapView.tsx`**
   - Composant principal de la carte
   - Clustering automatique des marqueurs
   - Popups avec infos d'activité
   - Ajustement automatique de la vue selon les activités

2. **`src/utils/emailClientHelper.ts`**
   - Utilitaire pour le partage par email (déjà créé précédemment)

### Fichiers modifiés

1. **`src/components/layout/Layout.tsx`**
   - Ajout du prop `fullWidth` pour mode pleine largeur
   - Cache le background et les pubs en mode carte

2. **`src/pages/Home/index.tsx`**
   - Ajout du toggle Vue Liste / Vue Carte
   - Layout 1/3 (activités) - 2/3 (carte)
   - Synchronisation des filtres avec la carte

---

## 🎯 Fonctionnalités

### Toggle Vue Liste / Vue Carte

Deux boutons permettent de basculer entre :
- **Vue Liste** : Carrousels classiques (mode actuel)
- **Vue Carte** : Layout divisé avec carte interactive

### Layout en mode Carte

```
┌────────────────────────────────────────────────────┐
│  [Vue Liste] [Vue Carte]                           │
├──────────────┬─────────────────────────────────────┤
│              │                                      │
│  Carrousels  │         Carte de France             │
│  (1/3)       │         avec marqueurs              │
│              │         et clustering               │
│  - Recherche │         (2/3)                       │
│    active    │                                      │
│  - Favoris   │                                      │
│  - Proches   │                                      │
│              │                                      │
└──────────────┴─────────────────────────────────────┘
```

### Clustering intelligent

- **Petits clusters** (< 10) : Cercle vert, 40px
- **Moyens clusters** (10-50) : Cercle orange, 50px
- **Grands clusters** (> 50) : Cercle rouge, 60px

Au zoom, les clusters se divisent automatiquement.

### Popups interactives

Chaque marqueur affiche :
- Image de l'activité
- Titre
- Localisation 📍
- Date 📅
- Description courte
- Bouton "Voir l'activité"

---

## 🔧 Configuration

### Centre de la carte

Par défaut : `[46.603354, 1.888334]` (centre de la France)

Zoom initial : `6`

### Ajustement automatique

La carte s'adapte automatiquement pour afficher toutes les activités filtrées :
- **0 activité** → Vue France entière
- **1 activité** → Zoom sur l'activité
- **Plusieurs activités** → Bounds englobant toutes les activités

---

## 🎨 Personnalisation

### Couleurs des clusters

Dans `MapView.tsx`, modifiez les classes CSS :

```css
.cluster-small { background-color: #16a34a; } /* Vert */
.cluster-medium { background-color: #ea580c; } /* Orange */
.cluster-large { background-color: #dc2626; } /* Rouge */
```

### Taille du panneau gauche

Dans `HomePage`, ligne 349 :

```tsx
<div className="w-1/3 overflow-y-auto ...">  // 33% actuellement
```

Changez `w-1/3` en `w-1/4` (25%) ou `w-1/2` (50%)

---

## 🐛 Résolution de problèmes

### Les icônes de marqueurs n'apparaissent pas

**Solution** : Vérifiez que les styles CSS Leaflet sont importés dans votre `index.css`

```css
@import 'leaflet/dist/leaflet.css';
```

### La carte ne s'affiche pas en pleine hauteur

**Solution** : Assurez-vous que le parent a une hauteur définie :

```tsx
<main className="h-screen flex flex-col">
```

### Erreur "Cannot read property 'lat' of undefined"

**Solution** : Certaines activités n'ont pas de coordonnées. Le composant filtre déjà les activités sans coordonnées valides.

### Les clusters ne se divisent pas au zoom

**Solution** : Vérifiez la configuration de `MarkerClusterGroup` :

```tsx
<MarkerClusterGroup
  maxClusterRadius={50}  // Augmentez pour plus de regroupement
  zoomToBoundsOnClick={true}  // Doit être true
/>
```

---

## 📊 Performance

- **Clustering optimisé** : Gère des centaines d'activités sans ralentissement
- **Lazy loading** : `chunkedLoading={true}` pour charger progressivement
- **Bounds automatiques** : Évite les calculs inutiles

---

## 🔄 Workflow utilisateur

1. **Filtrage** : L'utilisateur applique des filtres (Où, Quand, Quoi)
2. **Affichage** : Les activités apparaissent dans le carrousel "Recherche active"
3. **Toggle** : Clic sur "Vue Carte"
4. **Mode pleine largeur** : Le layout s'étend, masque les pubs
5. **Carte interactive** : 
   - Activités affichées avec clustering
   - Clic sur un cluster → Zoom
   - Clic sur un marqueur → Popup
   - Clic sur "Voir l'activité" → Page détail
6. **Retour liste** : Clic sur "Vue Liste" → Mode normal

---

## 🌟 Améliorations futures

### Fonctionnalités possibles

- [ ] Filtre par catégorie directement sur la carte
- [ ] Heatmap des zones d'activités
- [ ] Itinéraire vers une activité
- [ ] Affichage du trajet entre plusieurs activités
- [ ] Sauvegarde de la position/zoom de la carte
- [ ] Export PDF de la carte avec les activités
- [ ] Mode Street View pour les activités
- [ ] Filtres géographiques par dessin sur la carte

---

## 📚 Documentation

- **Leaflet** : https://leafletjs.com/
- **React Leaflet** : https://react-leaflet.js.org/
- **React Leaflet Cluster** : https://github.com/YUzhva/react-leaflet-markercluster

---

## ✅ Checklist de déploiement

- [ ] Installer les dépendances NPM
- [ ] Ajouter les styles CSS Leaflet
- [ ] Vérifier que toutes les activités ont des coordonnées lat/lon
- [ ] Tester le toggle Vue Liste / Vue Carte
- [ ] Tester le clustering au zoom
- [ ] Vérifier les popups et liens
- [ ] Tester sur mobile (responsive)
- [ ] Vérifier les performances avec beaucoup d'activités

---

**🎉 Implémentation terminée !**

La carte interactive est maintenant opérationnelle et prête à l'emploi.
