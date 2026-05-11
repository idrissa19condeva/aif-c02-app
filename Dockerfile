# =========================================
# Stage 1 — Build l'app React avec Vite
# =========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances pour optimiser le cache Docker
COPY package*.json ./
RUN npm ci --include=dev

# Copie du reste du code source et build
COPY . .
RUN npm run build

# =========================================
# Stage 2 — Servir avec Nginx Alpine
# =========================================
FROM nginx:alpine

# Copie de la config Nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie du build statique depuis le stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Healthcheck simple
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
