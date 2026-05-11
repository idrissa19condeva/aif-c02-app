# 📱 Déploiement AIF-C01 Exam App sur VPS OVH

Déploiement Docker propre avec HTTPS automatique (Let's Encrypt via Caddy).

---

## 🎯 Prérequis

- ✅ VPS Ubuntu/Debian avec accès SSH root ou sudo
- ✅ Nom de domaine pointant vers l'IP du VPS (enregistrement DNS de type A)
- ✅ Ports 80 et 443 ouverts dans le firewall

---

## 📦 Structure des fichiers

```
aif-c01-app/                  ← Ton projet Vite/React
├── src/
│   └── App.jsx               ← Le code de l'app (fichier que je t'ai livré)
├── public/
├── package.json
├── vite.config.js
│
├── Dockerfile                ← (livré ici)
├── docker-compose.yml        ← (livré ici)
├── Caddyfile                 ← (livré ici, À PERSONNALISER)
├── nginx.conf                ← (livré ici)
├── .dockerignore             ← (livré ici)
└── deploy.sh                 ← (livré ici)
```

---

## 🚀 Procédure complète

### Étape 1 — En local : créer et tester l'app

```bash
npm create vite@latest aif-c01-app -- --template react
cd aif-c01-app
npm install
npm install lucide-react recharts papaparse
```

Remplace `src/App.jsx` par le fichier `aif-c01-exam-app-v2.jsx` que je t'ai livré.

Place les 5 fichiers de déploiement (`Dockerfile`, `docker-compose.yml`, `Caddyfile`, `nginx.conf`, `.dockerignore`, `deploy.sh`) à la racine du projet.

Teste en local :
```bash
npm run dev      # vérifie que ça marche → http://localhost:5173
npm run build    # vérifie que le build passe
```

### Étape 2 — Configurer le DNS chez OVH

Dans l'espace client OVH → Domaines → ton domaine → Zone DNS :

| Type | Sous-domaine | Cible (IP de ton VPS) | TTL |
|------|--------------|----------------------|-----|
| A    | aif          | `XXX.XXX.XXX.XXX`    | 600 |

⏱️ Attends quelques minutes pour que la propagation DNS soit effective. Vérifie avec :
```bash
dig aif.tondomaine.com +short
```

### Étape 3 — Personnaliser le Caddyfile

Édite le fichier `Caddyfile` et remplace :
- `aif.tondomaine.com` → ton vrai domaine (ex: `aif.monsupersite.fr`)
- `ton@email.com` → ton email (utilisé par Let's Encrypt)

### Étape 4 — Préparer le VPS

Connecte-toi en SSH :
```bash
ssh ton_user@IP_DU_VPS
```

Installe Docker (si pas déjà fait) :
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# Déconnecte/reconnecte-toi pour appliquer le groupe
```

Configure le firewall (UFW) :
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP (nécessaire pour Let's Encrypt)
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Étape 5 — Envoyer le projet sur le VPS

**Option A — via Git (recommandé) :**
```bash
# Push ton projet sur GitHub/GitLab puis sur le VPS :
git clone https://github.com/tonuser/aif-c01-app.git
cd aif-c01-app
```

**Option B — via rsync depuis ta machine locale :**
```bash
rsync -avz --exclude 'node_modules' --exclude 'dist' \
  ./aif-c01-app/ ton_user@IP_DU_VPS:~/aif-c01-app/
```

**Option C — via scp :**
```bash
scp -r ./aif-c01-app ton_user@IP_DU_VPS:~/
```

### Étape 6 — Déployer 🚀

Sur le VPS :
```bash
cd aif-c01-app
chmod +x deploy.sh
./deploy.sh
```

Le script va :
1. Vérifier les prérequis
2. Build l'image Docker (build Vite inclus)
3. Lancer Caddy + l'app
4. Caddy va automatiquement obtenir un certificat Let's Encrypt
5. Afficher le statut

### Étape 7 — Accéder depuis ton téléphone 📱

Ouvre `https://aif.tondomaine.com` sur Safari/Chrome mobile.

**Pour installer comme une app (PWA-like) :**
- **iOS Safari** : bouton Partager → "Sur l'écran d'accueil"
- **Android Chrome** : menu (⋮) → "Ajouter à l'écran d'accueil"

---

## 🔧 Commandes utiles

```bash
# Voir les logs en temps réel
docker compose logs -f

# Voir les logs Caddy uniquement
docker compose logs -f caddy

# Redémarrer les containers
docker compose restart

# Arrêter tout
docker compose down

# Mettre à jour après une modification du code
git pull  # ou rsync depuis local
./deploy.sh

# Voir l'usage CPU/RAM
docker stats

# Entrer dans le container pour debug
docker compose exec aif-app sh
docker compose exec caddy sh
```

---

## 🐛 Troubleshooting

### Le certificat HTTPS n'est pas généré
- Vérifie que le DNS est bien propagé : `dig aif.tondomaine.com +short` doit renvoyer ton IP
- Vérifie que les ports 80 et 443 sont ouverts sur le VPS
- Regarde les logs Caddy : `docker compose logs caddy`

### "502 Bad Gateway"
- Le container `aif-app` n'est probablement pas prêt. Attends ~30s ou check : `docker compose ps`
- Vérifie les logs : `docker compose logs aif-app`

### Erreur de build npm
- Souvent un cache corrompu. Force un build propre : `docker compose build --no-cache`

### L'app charge mais ne fonctionne pas
- Ouvre la console du navigateur (F12 ou outils dev mobile)
- Vérifie les erreurs JS

---

## 🔄 Mise à jour de l'app

À chaque modification du code source :

```bash
# 1. En local : modifie le code, commit, push
git add . && git commit -m "update" && git push

# 2. Sur le VPS :
cd aif-c01-app
git pull
./deploy.sh
```

Le script redéploie en ~1-2 min (le cache Docker accélère).

---

## 💡 Optimisations bonus

### Automatiser les déploiements avec GitHub Actions
Push sur `main` → déploiement auto sur le VPS (webhook + SSH).

### Ajouter un Watchtower pour auto-update
Container qui surveille et met à jour automatiquement les images.

### Backup des données Caddy (certificats)
```bash
docker run --rm -v aif-c01-app_caddy_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/caddy-backup.tar.gz /data
```

---

## 📊 Ressources nécessaires

L'app est ultra-légère :
- **RAM** : ~50 Mo total (Caddy ~20 + Nginx ~30)
- **CPU** : négligeable (statique)
- **Disque** : ~30 Mo (build + images Docker)

Ça tourne sans problème sur le plus petit VPS OVH (Starter à ~3€/mois).

---

Bon déploiement ! 🚀
