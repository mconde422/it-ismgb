# Guide d'Intégration PWA — IT-ISMGB

## 📦 Fichiers Ajoutés

```
it-ismgb/
├── manifest.json              # Configuration PWA
├── service-worker.js          # Cache et synchronisation
├── js/pwa-manager.js          # Utilitaires PWA avancés
├── PWA-SETUP.md              # Documentation complète
└── PWA-INTEGRATION.md        # Ce fichier
```

---

## 🔧 Utilisation des Fonctionnalités PWA

### 1. **Ajouter le PWA Manager (Optionnel)**

Si vous voulez utiliser les fonctionnalités avancées de `pwa-manager.js`, ajoutez cet import dans vos fichiers HTML :

```html
<!-- Avant la fermeture du </body> -->
<script src="js/pwa-manager.js"></script>
```

### 2. **Indicateurs Hors Ligne**

Une bannière rouge s'affiche automatiquement quand l'utilisateur perd la connexion :

```javascript
// Vérifié automatiquement par PWAManager
// Aucune action requise
```

### 3. **Notifications de Mise à Jour**

Quand une nouvelle version est disponible, une notification s'affiche :

```javascript
// Automatique - PWAManager vérifie chaque 60 secondes
// Utilisateur peut cliquer "Recharger" pour appliquer
```

### 4. **Vérifier le Statut PWA**

```javascript
// Dans la console navigateur
pwaMgr.getInfo()
// Retourne:
// {
//   isOnline: true,
//   hasServiceWorker: true,
//   hasNotifications: true,
//   hasCache: true,
//   ...
// }
```

### 5. **Vider le Cache Manuellement**

```javascript
// Dans la console navigateur
await pwaMgr.clearCache()
// Vide tout le cache et recharge la page
```

### 6. **Installation Manually**

Ajouter un bouton optionnel pour installer l'app :

```html
<button id="pwa-install-btn" style="display:none;">
  📱 Installer l'app
</button>

<script>
  document.getElementById('pwa-install-btn').addEventListener('click', () => {
    pwaMgr.installApp();
  });
</script>
```

---

## 🌐 Déploiement en Production

### Checklist de Déploiement

- [ ] Vérifier que le serveur utilise **HTTPS**
- [ ] Vérifier que `manifest.json` est accessible
- [ ] Vérifier que `service-worker.js` est accessible
- [ ] Tester l'installation PWA sur mobile (Chrome, Android)
- [ ] Tester l'installation PWA sur Windows (Edge, Chrome)
- [ ] Tester le mode hors ligne (F12 → Network → Offline)
- [ ] Vérifier les caches dans DevTools (Application → Cache Storage)

### Configuration Serveur (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # Certificat SSL
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Headers de sécurité
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "DENY";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Racine du site
    root /var/www/it-ismgb;
    index index.html;

    # Service Worker - Cache busting
    location = /service-worker.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Manifest - Cache court
    location = /manifest.json {
        add_header Cache-Control "public, max-age=3600";
        add_header Content-Type "application/manifest+json";
    }

    # Assets statiques - Cache long
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|eot|ttf)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # HTML - Cache court
    location ~* \.html$ {
        add_header Cache-Control "public, max-age=3600";
    }

    # Fallback pour SPA
    error_page 404 =200 /index.html;
}
```

### Configuration Serveur (Apache)

```apache
<IfModule mod_ssl.c>
    <VirtualHost *:443>
        ServerName your-domain.com
        DocumentRoot /var/www/it-ismgb

        # SSL
        SSLEngine on
        SSLCertificateFile /path/to/cert.pem
        SSLCertificateKeyFile /path/to/key.pem

        # Headers
        Header always set X-Content-Type-Options "nosniff"
        Header always set X-Frame-Options "DENY"
        Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

        # Service Worker
        <FilesMatch "^service-worker\.js$">
            Header set Cache-Control "no-cache, no-store, must-revalidate"
            Header set Pragma "no-cache"
            Header set Expires "0"
        </FilesMatch>

        # Manifest
        <FilesMatch "^manifest\.json$">
            Header set Cache-Control "public, max-age=3600"
            Header set Content-Type "application/manifest+json"
        </FilesMatch>

        # Assets
        <FilesMatch "\.(css|js|jpg|png|gif|svg|woff|woff2)$">
            Header set Cache-Control "public, max-age=31536000, immutable"
        </FilesMatch>

        # HTML
        <FilesMatch "\.html$">
            Header set Cache-Control "public, max-age=3600"
        </FilesMatch>
    </VirtualHost>
</IfModule>
```

---

## 🧪 Tests en Développement Local

### Tester HTTPS en Local (avec mkcert)

```bash
# Installer mkcert
npm install -g mkcert
# Sur macOS: brew install mkcert

# Créer un certificat local
mkcert localhost 127.0.0.1 ::1

# Créer un serveur HTTPS simple (Node.js)
npm install -g http-server
http-server -S -C localhost.pem -K localhost-key.pem
```

### Tester le Service Worker

1. Ouvrir DevTools (F12)
2. Aller dans **Application** → **Service Workers**
3. Cocher "Update on reload" pour tester les changements
4. Aller dans **Cache Storage** pour voir les fichiers cachés

### Tester le Mode Hors Ligne

1. DevTools → **Network**
2. Cocher "Offline"
3. Rafraîchir la page
4. L'app devrait charger depuis le cache

---

## 📊 Monitoring & Analytics

### Enregistrer les Erreurs Service Worker

```javascript
// Ajouter dans votre code d'initialisation
navigator.serviceWorker.addEventListener('error', (event) => {
  console.error('[Service Worker Error]', event);
  
  // Envoyer à votre système de logging
  // logToServer({
  //   type: 'sw_error',
  //   message: event.message,
  //   timestamp: new Date()
  // });
});
```

### Tracker l'Utilisation Offline

```javascript
// Ajouter dans pwa-manager.js ou votre app
if (!navigator.onLine) {
  // User is offline - track this
  console.log('[Analytics] User went offline');
  // Envoyer un événement une fois en ligne
}
```

---

## 🚀 Optimisations Futures

### 1. **Synchronisation en Arrière-Plan**
```javascript
// Quand l'utilisateur revient en ligne
if ('SyncManager' in window) {
  registration.sync.register('sync-pending-tasks');
}
```

### 2. **Notifications Push**
```javascript
// Demander la permission
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    // Activer les push notifications
  }
});
```

### 3. **Partage de Fichiers**
```javascript
// Web Share API
if (navigator.share) {
  navigator.share({
    title: 'IT-ISMGB',
    text: 'Partager une tâche',
    url: window.location.href
  });
}
```

### 4. **Icônes Dynamiques**
```javascript
// Changer l'icône du tab en fonction du nombre de tâches
const updateAppBadge = (count) => {
  if ('setAppBadge' in navigator) {
    navigator.setAppBadge(count);
  }
};
```

---

## ⚠️ Dépannage

### Problem: Service Worker ne s'enregistre pas

**Solution:**
- Vérifier HTTPS (ou localhost)
- F12 → Application → Service Workers
- Vérifier la console pour les erreurs
- Rafraîchir avec Ctrl+Maj+R

### Problem: App ne fonctionne pas hors ligne

**Solution:**
- Vérifier que les assets sont dans `ASSETS_TO_CACHE`
- Vérifier F12 → Application → Cache Storage
- Vérifier que le cache name correspond à `CACHE_VERSION`

### Problem: Les mises à jour s'appliquent pas

**Solution:**
1. Incrémenter `CACHE_VERSION` dans service-worker.js
2. Redéployer
3. Les clients verront une notification de mise à jour
4. Forcer Ctrl+Maj+R pour recharger

---

## 📞 Support

Pour des questions supplémentaires sur les PWA:
- [Google PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Manifest Spec](https://www.w3.org/TR/appmanifest/)

---

**Version:** 1.0.0  
**Dernière mise à jour:** Avril 2026
