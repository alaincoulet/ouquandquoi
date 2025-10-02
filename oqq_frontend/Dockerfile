# ====================================================================
# Chemin : oqq_frontend/Dockerfile
# Rôle   : Image Docker frontend oùquandquoi.fr (Vite + Nginx)
# ====================================================================

# Étape 1 : build du frontend
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Étape 2 : Nginx pour servir le frontend
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Optionnel : supprimer le fichier de config par défaut si conflit
RUN rm /etc/nginx/conf.d/default.conf || true

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
