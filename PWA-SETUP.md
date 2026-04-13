# Configuration PWA — IT-ISMGB

> **Progressive Web App (PWA)** : Transforme votre application web en une application installable sur mobile et Windows avec fonctionnement hors ligne.

---

## 📊 Fichiers PWA Ajoutés

### 1. **manifest.json**
Fichier de configuration de la PWA qui définit :
- Nom, description et icônes de l'application
- Couleur de thème et couleur de fond
- Éléments de lancement rapide (shortcuts)
- Supports d'affichage (mobile, desktop)

```json
{
  "name": "Service-Informatique",
  "short_name": "IT-ISMGB",
  "start_url": "/index.html",
  "display": "standalone",
  "theme_color": "#0D1117",
  "background_color": "#0D1117"
}
```

### 2. **service-worker.js**
Worker JavaScript en arrière-plan qui :
- ✅ Met en cache les assets (CSS, JS, HTML)
- 📱 Permet le fonctionnement **hors ligne** (mode offline-first)
- 🔄 Sync les données avec le serveur une fois connecté
- ⚡ Optimise les performances via cache-first strategy

### 3. **Modifications HTML**
Tous les fichiers HTML (.html) ont été modifiés pour :

#### Dans le `<head>` :
```html
<meta name="theme-color" content="#0D1117" />
<link rel="manifest" href="manifest.json" />
```

#### Avant la fermeture du `</body>` :
```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js');
  }
</script>
```

---

## 🚀 Installation PWA

### Sur Mobile (iOS/Android)

#### **Android** 
1. Ouvrir l'app dans Chrome
2. Menu ⋮ → "Installer l'app"
3. L'app s'ajoute à l'écran d'accueil

#### **iOS**
1. Safari → Partager → "Sur l'écran d'accueil"
2. Choisir un nom (par défaut: IT-ISMGB)
3. Ajouter à l'écran d'accueil

### Sur Windows

#### **Windows 11/10**
1. Dans Edge ou Chrome, accédez à votre app
2. Icône d'installation dans la barre d'adresse
3. Cliquer sur "Installer l'app"
4. L'app s'ajoute aux applications Windows

---

## 💾 Stratégie de Mise en Cache

### Cache Strategy: **Cache-First + Network Fallback**

```
Les assets CSS, JS, HTML sont d'abord cherchés dans le cache :
├─ Si disponible dans le cache → retourner immédiatement
├─ Sinon → faire une requête réseau
├─ Souvegarder en cache pour la prochaine fois
└─ En cas d'erreur réseau → fallback hors ligne
```

### Fichiers mis en cache lors de l'installation :
- ✅ Tous les fichiers HTML (`index.html`, `my-tasks.html`, etc.)
- ✅ Tous les CSS (`variables.css`, `base.css`, etc.)
- ✅ Tous les JS (`auth.js`, `tasks.js`, etc.)
- ✅ Le `manifest.json`

### Fichiers NON mis en cache :
- ❌ Appels API vers Appwrite (dynamic)
- ❌ Contenu utilisateur en temps réel
- ❌ Images et pièces jointes personnalisées

---

## 🔄 Synchronisation Données

### Mode Hors Ligne
Quand l'utilisateur est hors ligne :
- ✅ Les pages en cache s'affichent
- ✅ Les données UI restent intactes (localStorage)
- ❌ Les requêtes API échouent gracieusement
- ❌ Les mises à jour temps réel ne fonctionnent pas

### Reconnexion
Une fois reconnecté :
1. Le service worker détecte la connexion
2. Les requêtes API reprennent normalement
3. Les WebSockets Appwrite se réinitialisent
4. Les données se synchronisent

---

## 🔐 Cache Management

### Version du Cache
Le cache porte le nom : `it-ismgb-v1.0.0`

Pour **forcer un nouveau cache** (nouveau déploiement) :
```javascript
// Incrémenter la version dans service-worker.js
const CACHE_VERSION = 'v1.0.1'; // v1.0.0 → v1.0.1
```

Le service worker supprimera automatiquement les anciens caches.

### Vider le Cache Manuellement

Via la console du navigateur :
```javascript
navigator.serviceWorker.controller.postMessage({ 
  type: 'CLEAR_CACHE' 
});
```

---

## 📱 Icônes PWA

Les icônes sont générées en **SVG inline** :
- **Tailles:** 192px, 512px
- **Format:** SVG avec dégradé bleu → vert
- **Support:** Maskable icons pour notch/dynamic islands

Pour ajouter une vraie image PNG :
1. Créer un dossier `assets/icons/`
2. Ajouter vos fichiers `icon-192.png`, `icon-512.png`
3. Mettre à jour `manifest.json` avec les chemins relatifs

---

## ⚙️ Configuration Avancée

### HTTP Requirements
Pour déployer une PWA en production, vous avez besoin de :
- ✅ **HTTPS** obligatoire
- ✅ **Certificat SSL valide**
- ✅ **Headers de sécurité** (CORS, CSP, etc.)

### Vérification PWA (DevTools)
Pour vérifier que tout fonctionne :
1. F12 → Onglet "Application"
2. Section "Service Workers" → vérifier l'enregistrement
3. Section "Manifest" → vérifier le chargement
4. Section "Cache Storage" → vérifier les assets cachés

---

## 🐛 Dépannage

### Service Worker n'est pas enregistré
- Vérifier la console (F12 → Console)
- S'assurer que HTTPS est utilisé (ou localhost ok)
- Vérifier que le chemin `./service-worker.js` existe

### L'app ne fonctionne pas hors ligne
- Vérifier le cache storage (F12 → Application → Cache Storage)
- Vérifier que les assets sont bien dans la liste `ASSETS_TO_CACHE`
- Vérifier la batterie du navigateur (ne pas être en travail)

### Les mises à jour ne s'appliquent pas
- Vider Appdata → AppData/Roaming/Code cache si dev en local
- Incrémenter `CACHE_VERSION` dans `service-worker.js`
- Forcer le rafraîchissement (Ctrl+Maj+R)

---

## 📚 Ressources

- [MDN — Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev — PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Manifest Web App](https://developer.mozilla.org/en-US/docs/Web/Manifest)

---

## ✨ Avantages de la PWA

| Avant | Après (PWA) |
|-------|-----------|
| Web app classique | App installable |
| Toujours besoin d'internet | Fonctionne hors ligne |
| Pas d'icône bureau/mobile | Icône app native |
| Rechargement lent | Chargement instantané (cache) |
| Notifications navigateur | Notifications push |

---

**Auteur:** Configuration PWA · 2026  
**Version:** 1.0.0  
**Dernière mise à jour:** Avril 2026
