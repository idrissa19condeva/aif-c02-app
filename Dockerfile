# =========================================
# Stage 1 — Build l'app React avec Vite
# =========================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app
ENV NODE_ENV=development

# Copie de tout le projet (node_modules inclus depuis le contexte local)
# Prérequis : avoir exécuté "npm ci" en local avant de builder l'image
COPY . .
RUN test -x node_modules/.bin/vite || (echo "ERROR: node_modules manquant — lance 'npm ci' en local d'abord" && exit 1)

# Build de production
RUN npm exec vite build

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
