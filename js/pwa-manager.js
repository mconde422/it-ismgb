/**
 * IT-ISMGB PWA Utilities
 * Fonctionnalités avancées pour la Progressive Web App
 */

class PWAManager {
  constructor() {
    this.swRegistration = null;
    this.updateCheckInterval = 60000; // 60 secondes
    this.isOnline = navigator.onLine;
    
    this.init();
  }

  /**
   * Initialisation du gestionnaire PWA
   */
  async init() {
    this.setupNetworkListeners();
    this.checkForUpdates();
    this.setupPeriodicUpdates();
  }

  /**
   * Écouteurs de connexion réseau
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[PWA] Mode en ligne');
      this.showOfflineIndicator(false);
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[PWA] Mode hors ligne');
      this.showOfflineIndicator(true);
    });
  }

  /**
   * Vérifier les mises à jour du service worker
   */
  checkForUpdates() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistration().then(registration => {
      if (!registration) return;

      this.swRegistration = registration;

      // Écouter les mises à jour
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            this.notifyUpdate();
          }
        });
      });

      // Vérifier les mises à jour maintenant
      registration.update().catch(err => {
        console.warn('[PWA] Erreur lors de la vérification des mises à jour:', err);
      });
    });
  }

  /**
   * Vérification périodique des mises à jour
   */
  setupPeriodicUpdates() {
    setInterval(() => {
      if (this.swRegistration) {
        this.swRegistration.update();
      }
    }, this.updateCheckInterval);
  }

  /**
   * Notifier l'utilisateur d'une mise à jour disponible
   */
  notifyUpdate() {
    // Créer une notification visuelle
    const updateBanner = document.createElement('div');
    updateBanner.className = 'pwa-update-banner';
    updateBanner.innerHTML = `
      <div class="pwa-banner-content">
        <span class="pwa-banner-text">Mise à jour disponible</span>
        <button class="pwa-banner-btn" onclick="pwaMgr.reload()">Recharger</button>
        <button class="pwa-banner-close" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
    `;

    // Ajouter les styles
    if (!document.getElementById('pwa-styles')) {
      const style = document.createElement('style');
      style.id = 'pwa-styles';
      style.textContent = `
        .pwa-update-banner {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: linear-gradient(135deg, #2f81f7 0%, #3fb950 100%);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .pwa-banner-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pwa-banner-text {
          flex: 1;
          font-weight: 500;
        }

        .pwa-banner-btn,
        .pwa-banner-close {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .pwa-banner-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .pwa-banner-close {
          padding: 6px 8px;
          font-size: 16px;
        }

        .pwa-offline-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #d32f2f;
          color: white;
          padding: 8px 16px;
          text-align: center;
          font-size: 14px;
          z-index: 9999;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(updateBanner);
  }

  /**
   * Afficher/masquer l'indicateur hors ligne
   */
  showOfflineIndicator(show) {
    let banner = document.getElementById('pwa-offline-banner');

    if (show && !banner) {
      banner = document.createElement('div');
      banner.id = 'pwa-offline-banner';
      banner.className = 'pwa-offline-banner';
      banner.textContent = '⚠️ Mode hors ligne — Certaines fonctionnalités ne sont pas disponibles';
      document.body.insertBefore(banner, document.body.firstChild);
    } else if (!show && banner) {
      banner.remove();
    }
  }

  /**
   * Recharger pour appliquer la mise à jour
   */
  reload() {
    window.location.reload();
  }

  /**
   * Synchroniser les données en attente
   */
  syncPendingData() {
    console.log('[PWA] Synchronisation des données en attente...');
    
    // Récupérer les données en attente depuis localStorage
    const pendingData = JSON.parse(localStorage.getItem('pendingSync') || '{}');

    if (Object.keys(pendingData).length === 0) {
      console.log('[PWA] Aucune donnée en attente de synchronisation');
      return;
    }

    // TODO: Implémenter la logique de sync avec votre backend
    // Exemple:
    // for (const [key, data] of Object.entries(pendingData)) {
    //   await savePendingData(data);
    //   delete pendingData[key];
    // }

    // localStorage.setItem('pendingSync', JSON.stringify(pendingData));
  }

  /**
   * Installer l'app manuellement
   */
  async installApp() {
    if (!this.deferredPrompt) {
      console.log('[PWA] Installation non disponible');
      return;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`[PWA] Choix utilisateur: ${outcome}`);
    this.deferredPrompt = null;
  }

  /**
   * Effacer le cache
   */
  async clearCache() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('[PWA] Cache vidé avec succès');
      window.location.reload();
    } catch (error) {
      console.error('[PWA] Erreur lors de la suppression du cache:', error);
    }
  }

  /**
   * Obtenir les informations PWA
   */
  getInfo() {
    return {
      isOnline: this.isOnline,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasNotifications: 'Notification' in window,
      hasCache: 'caches' in window,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Enregistrer un événement beforeinstallprompt
   */
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('[PWA] Installation disponible');
      
      // Vous pouvez afficher un bouton "Installer"
      const installBtn = document.getElementById('pwa-install-btn');
      if (installBtn) {
        installBtn.style.display = 'block';
      }
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installée avec succès');
      this.deferredPrompt = null;
      
      const installBtn = document.getElementById('pwa-install-btn');
      if (installBtn) {
        installBtn.style.display = 'none';
      }
    });
  }
}

// Initialiser le gestionnaire PWA une fois le DOM chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pwaMgr = new PWAManager();
  });
} else {
  window.pwaMgr = new PWAManager();
}
