# ====================================================================
# Chemin : oqq_frontend/Dockerfile
# Rôle   : Image Docker frontend oùquandquoi.fr (Vite + Nginx)
#          - Étape 1 : build Vite en prod
#          - Étape 2 : servir avec nginx (léger et optimisé)
# ====================================================================

############### Étape 1 — Build Vite (Node) ###########################
FROM node:22-alpine AS builder
WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le code source
COPY . .

# Construire le frontend (Vite génère /dist)
RUN npm run build

############### Étape 2 — Serveur Nginx (runtime) ####################
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Supprimer les fichiers par défaut
RUN rm -rf ./*

# Copier le build Vite depuis le builder
COPY --from=builder /app/dist .

# Copier une configuration nginx personnalisée (si fournie)
# (optionnel — sinon nginx utilisera son fichier par défaut)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port utilisé par nginx (80)
EXPOSE 80

# Commande de démarrage par défaut
CMD ["nginx", "-g", "daemon off;"]
