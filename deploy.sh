#!/bin/bash
# =========================================================
# Script de déploiement AIF-C01 sur VPS OVH
# Usage : ./deploy.sh
# =========================================================
set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Déploiement AIF-C02 Exam App${NC}"

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé.${NC}"
    echo -e "${YELLOW}Installation : curl -fsSL https://get.docker.com | sudo sh${NC}"
    exit 1
fi

# Vérifier docker compose (v2)
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose v2 requis.${NC}"
    exit 1
fi

# Vérifier que les fichiers nécessaires sont là
required_files=("Dockerfile" "docker-compose.yml" "Caddyfile" "nginx.conf" "package.json" "src/App.jsx")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Fichier manquant : $file${NC}"
        exit 1
    fi
done

# Vérifier que node_modules est présent (requis pour le build Docker)
if [ ! -x "node_modules/.bin/vite" ]; then
    echo -e "${YELLOW}📦 node_modules absent — installation en cours...${NC}"
    npm ci --include=dev --no-audit --no-fund
fi

# Avertir si le Caddyfile contient encore le domaine placeholder
if grep -q "aif.tondomaine.com" Caddyfile; then
    echo -e "${YELLOW}⚠️  Le Caddyfile contient encore 'aif.tondomaine.com'.${NC}"
    echo -e "${YELLOW}   Pense à le remplacer par ton vrai domaine !${NC}"
    read -p "Continuer quand même ? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}📦 Build et démarrage des containers...${NC}"
docker compose down 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

echo -e "${GREEN}⏳ Attente que les containers soient prêts (10s)...${NC}"
sleep 10

# Statut
echo -e "${GREEN}📊 Statut des containers :${NC}"
docker compose ps

echo ""
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo -e "${YELLOW}📱 Accès : https://$(grep -E '^[a-z]' Caddyfile | grep -v '^{' | head -1 | awk '{print $1}')${NC}"
echo ""
echo -e "${YELLOW}🔍 Logs en temps réel : docker compose logs -f${NC}"
echo -e "${YELLOW}🛑 Arrêter : docker compose down${NC}"
echo -e "${YELLOW}🔄 Redéployer : ./deploy.sh${NC}"
