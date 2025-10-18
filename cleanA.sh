#!/bin/bash

# === cleanA.sh — Nettoyage complet projet oùquandquoi.fr ===

echo ">>> Nettoyage profond Docker : suppression conteneurs, volumes et images inutilisées..."
docker compose down -v
docker system prune -af --volumes

echo ">>> Suppression des exports, rapports, logs et caches locaux..."

rm -rf dev_exports/
rm -f arbo_frontend.txt arbo_backend.txt arbo_*.txt
rm -f localhost_*.html localhost_*.json
rm -f rapport_frontend.sh rapport_backend.sh rapport_*.sh
rm -rf logs/
rm -rf coverage/
rm -rf oqq_backend/data/
rm -rf oqq_backend/scripts/
rm -rf oqq_backend/public/images/*
rm -rf node_modules/
rm -rf dist/
rm -rf .vite/

echo ">>> Nettoyage terminé !"
