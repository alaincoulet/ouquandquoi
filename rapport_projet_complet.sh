#!/bin/bash

EXPORT_DIR="dev_exports"
NOW=$(date +"%Y-%m-%d_%H%M")
EXPORT_FILE="$EXPORT_DIR/rapport_projet_complet_${NOW}.txt"

mkdir -p "$EXPORT_DIR"

echo "=== RAPPORT COMPLET PROJET oùquandquoi.fr ===" > "$EXPORT_FILE"
echo "Généré le : $(date)" >> "$EXPORT_FILE"
echo "Node.js version : $(node -v 2>/dev/null || echo 'non détecté')" >> "$EXPORT_FILE"
echo "NPM version    : $(npm -v 2>/dev/null || echo 'non détecté')" >> "$EXPORT_FILE"
echo "" >> "$EXPORT_FILE"

echo "----- ARBORESCENCE RACINE (1er niveau) -----" >> "$EXPORT_FILE"
ls -lah --group-directories-first >> "$EXPORT_FILE"
echo "" >> "$EXPORT_FILE"

echo "----- ARBORESCENCE COMPLÈTE -----" >> "$EXPORT_FILE"
if command -v tree &> /dev/null; then
    tree -L 4 -a -I 'node_modules|.git|dist|coverage|dev_exports' >> "$EXPORT_FILE"
else
    find . -maxdepth 4 \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -not -path "*/dist/*" \
        -not -path "*/coverage/*" \
        -not -path "*/dev_exports/*" | sort >> "$EXPORT_FILE"
fi
echo "" >> "$EXPORT_FILE"

echo "----- FICHIERS CLÉS À LA RACINE -----" >> "$EXPORT_FILE"
for f in docker-compose.yml .env .gitignore README.md; do
    if [[ -f "$f" ]]; then
        echo "--- $f (hash MD5 & contenu complet) ---" >> "$EXPORT_FILE"
        md5sum "$f" >> "$EXPORT_FILE"
        cat "$f" >> "$EXPORT_FILE"
        echo "" >> "$EXPORT_FILE"
    else
        echo "--- $f non présent ---" >> "$EXPORT_FILE"
    fi
done
echo "" >> "$EXPORT_FILE"

if [[ -f "docker-compose.yml" ]]; then
    echo "----- DOCKER COMPOSE -----" >> "$EXPORT_FILE"
    echo "--- docker-compose.yml (hash MD5 & contenu complet) ---" >> "$EXPORT_FILE"
    md5sum docker-compose.yml >> "$EXPORT_FILE"
    cat docker-compose.yml >> "$EXPORT_FILE"
    echo "" >> "$EXPORT_FILE"
else
    echo "docker-compose.yml absent !" >> "$EXPORT_FILE"
fi
echo "" >> "$EXPORT_FILE"

if [ -d oqq_backend ]; then
    echo "----- EXPORT BACKEND -----" >> "$EXPORT_FILE"
    (
        cd oqq_backend

        echo "----- DERNIER COMMIT GIT -----" >> "../$EXPORT_FILE"
        git log -1 --pretty=format:"%h | %an | %ad | %s" --date=iso >> "../$EXPORT_FILE"
        echo -e "\n" >> "../$EXPORT_FILE"

        echo "----- package.json (résumé) -----" >> "../$EXPORT_FILE"
        grep -E '"name"|"version"|"scripts"|"dependencies"|"devDependencies"' package.json >> "../$EXPORT_FILE"
        echo "" >> "../$EXPORT_FILE"

        echo "----- FORMAT MODULES -----" >> "../$EXPORT_FILE"
        if grep -q "type.*module" package.json; then
            echo "Format ESModules" >> "../$EXPORT_FILE"
        else
            echo "Format CommonJS" >> "../$EXPORT_FILE"
        fi
        echo "" >> "../$EXPORT_FILE"

        echo "----- VARIABLES D'ENVIRONNEMENT -----" >> "../$EXPORT_FILE"
        grep -R "process.env" src --include="*.ts" --include="*.js" >> "../$EXPORT_FILE" || true
        echo "" >> "../$EXPORT_FILE"

        echo "----- ARBORESCENCE BACKEND -----" >> "../$EXPORT_FILE"
        if command -v tree &> /dev/null; then
            tree -a -I 'node_modules|.git|dist|coverage|dev_exports' >> "../$EXPORT_FILE"
        fi
        echo "" >> "../$EXPORT_FILE"

        echo "----- LISTE DES FICHIERS .ts/.js -----" >> "../$EXPORT_FILE"
        find src -type f \( -name "*.ts" -o -name "*.js" \) | sort >> "../$EXPORT_FILE"
        echo "" >> "../$EXPORT_FILE"

        echo "----- IMAGES BACKEND/public/images -----" >> "../$EXPORT_FILE"
        if [ -d public/images ]; then
            ls -lh public/images >> "../$EXPORT_FILE"
            md5sum public/images/* >> "../$EXPORT_FILE"
        fi
        echo "" >> "../$EXPORT_FILE"
    )
else
    echo "Dossier oqq_backend absent !" >> "$EXPORT_FILE"
fi

if [ -d oqq_frontend ]; then
    echo "----- EXPORT FRONTEND -----" >> "$EXPORT_FILE"
    (
        cd oqq_frontend

        echo "----- DERNIER COMMIT GIT -----" >> "../$EXPORT_FILE"
        git log -1 --pretty=format:"%h | %an | %ad | %s" --date=iso >> "../$EXPORT_FILE"
        echo -e "\n" >> "../$EXPORT_FILE"

        echo "----- package.json (résumé) -----" >> "../$EXPORT_FILE"
        grep -E '"name"|"version"|"scripts"|"dependencies"|"devDependencies"' package.json >> "../$EXPORT_FILE"
        echo "" >> "../$EXPORT_FILE"

        echo "----- FICHIERS CONFIG (.js/.ts/.json) -----" >> "../$EXPORT_FILE"
        ls *.js *.ts *.json 2>/dev/null >> "../$EXPORT_FILE"
        echo "" >> "../$EXPORT_FILE"

        echo "----- CONTENU public/ -----" >> "../$EXPORT_FILE"
        if [ -d public ]; then
            ls -lh public >> "../$EXPORT_FILE"
            md5sum public/* >> "../$EXPORT_FILE"
        fi
        echo "" >> "../$EXPORT_FILE"

        echo "----- LOGOS & FAVICONS -----" >> "../$EXPORT_FILE"
        find src/assets/images -type f -exec md5sum {} \; >> "../$EXPORT_FILE" 2>/dev/null
        echo "" >> "../$EXPORT_FILE"

        echo "----- BUILD dist/ -----" >> "../$EXPORT_FILE"
        if [ -d dist ]; then
            du -sh dist >> "../$EXPORT_FILE"
            md5sum dist/* >> "../$EXPORT_FILE" 2>/dev/null
        fi
        echo "" >> "../$EXPORT_FILE"

        echo "----- ARBORESCENCE src/ -----" >> "../$EXPORT_FILE"
        if command -v tree &> /dev/null; then
            tree -a src -I 'node_modules|.git|dist|coverage|dev_exports' >> "../$EXPORT_FILE"
        fi
        echo "" >> "../$EXPORT_FILE"
    )
else
    echo "Dossier oqq_frontend absent !" >> "$EXPORT_FILE"
fi

echo "=== FIN DU RAPPORT ===" >> "$EXPORT_FILE"
echo
echo "Rapport généré : $EXPORT_FILE"
