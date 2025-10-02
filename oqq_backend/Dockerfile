# ==========================================================
# === Dockerfile Backend oùquandquoi.fr ====================
# ==========================================================

# Étape 1 : utiliser une image légère de Node.js
FROM node:22-alpine

# Étape 2 : définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3 : copier uniquement les fichiers package.json / package-lock.json
# Cela permet de mettre en cache les dépendances si elles ne changent pas
COPY package*.json ./

# Étape 4 : installer les dépendances
RUN npm install --production

# Étape 5 : copier le reste du code backend dans le conteneur
COPY . .

# Étape 6 : compiler le TypeScript en JavaScript (si nécessaire)
RUN npm run build

# Étape 7 : exposer le port du backend (4000 dans votre projet)
EXPOSE 4000

# Étape 8 : démarrer le serveur
CMD ["node", "dist/server.js"]
