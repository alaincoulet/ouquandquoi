#!/bin/bash

# === Script démarrage Docker + navigateur ===
# Lance frontend + backend dans Docker et ouvre 2 onglets navigateur (Windows 11 compatible)

echo ">>> Lancement des conteneurs Docker..."
docker-compose up --build -d

# Pause de 20 secondes pour laisser le temps aux services de démarrer
sleep 20

echo ">>> Ouverture du frontend (http://localhost:8080)"
start "" "http://localhost:8080"

echo ">>> Ouverture du backend API (http://localhost:4000)"
start "" "http://localhost:4000"
