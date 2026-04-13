const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `it-ismgb-${CACHE_VERSION}`;

// Fichiers à mettre en cache lors de l'installation
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './my-tasks.html',
  './groups.html',
  './group-detail.html',
  './task-detail.html',
  './search.html',
  './dashboard.html',
  './admin.html',
  './register.html',
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/dashboard.css',
  './css/forms.css',
  './css/kanban.css',
  './css/layout.css',
  './js/activity.js',
  './js/appwrite.js',
  './js/auth.js',
  './js/categories.js',
  './js/comments.js',
  './js/config.js',
  './js/notifications.js',
  './js/profiles.js',
  './js/realtime.js',
  './js/requests.js',
  './js/search.js',
  './js/tasks.js',
  './js/theme.js',
  './js/ui.js',
  './js/utils.js',
  './js/workspaces.js',
  './manifest.json'
];

/**
 * INSTALLATION - Mise en cache des assets
 */
self.addEventListener('install', event => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log(`[Service Worker] Mise en cache de ${ASSETS_TO_CACHE.length} fichiers`);
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.warn('[Service Worker] Erreur lors de la mise en cache:', error);
        // L'installation continue même si le cache échoue
      })
  );
  // Force le service worker à devenir actif
  self.skipWaiting();
});

/**
 * ACTIVATION - Nettoyage des anciens caches
 */
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activation...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[Service Worker] Suppression du cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Prendre le contrôle des pages immédiatement
  self.clients.claim();
});

/**
 * FETCH - Stratégie de mise en cache et requêtes réseau
 */
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers des domaines externes (Appwrite)
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request));
    return;
  }

  // Stratégie: Cache primeiro, puis réseau avec fallback
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Retourner depuis le cache si disponible
        if (response) {
          return response;
        }

        // Sinon, faire la requête réseau
        return fetch(request)
          .then(response => {
            // Vérifier que c'est une réponse valide
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Mettre en cache les assets CSS et JS
            const shouldCache = 
              url.pathname.endsWith('.css') ||
              url.pathname.endsWith('.js') ||
              url.pathname.endsWith('.html');

            if (shouldCache) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
              });
            }

            return response;
          });
      })
      .catch(() => {
        // En cas d'erreur réseau et pas de cache, retourner une page offline
        if (request.destination === 'document') {
          // Retourner une réponse simple si disponible
          return caches.match('./index.html')
            .catch(() => new Response('Mode hors ligne', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            }));
        }
      })
  );
});

/**
 * MESSAGE - Communication avec les clients
 */
self.addEventListener('message', event => {
  console.log('[Service Worker] Message reçu:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[Service Worker] Cache vidé');
      event.ports[0].postMessage({ success: true });
    });
  }
});
