# ==========================================================
# === Dockerfile Frontend oùquandquoi.fr ===================
# ==========================================================

# Étape 1 : Builder Vite
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Étape 2 : Serveur Nginx pour servir le build
FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

# ➕ Copier la config Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
