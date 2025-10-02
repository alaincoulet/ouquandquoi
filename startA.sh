#!/bin/bash

# === Script démarrage Docker + navigateur ===
# Lance frontend + backend dans Docker et ouvre 2 onglets navigateur

echo ">>> Lancement des conteneurs Docker..."
docker-compose up --build -d

# Pause courte pour s'assurer que les services démarrent
sleep 10

echo ">>> Ouverture du frontend (http://localhost:8080)"
xdg-open "http://localhost:8080" >/dev/null 2>&1 &

echo ">>> Ouverture du backend API (http://localhost:4000)"
xdg-open "http://localhost:4000" >/dev/null 2>&1 &
