// ============================================
// IT-ISMGB — Authentication
// ============================================

import { account, ID } from './appwrite.js';
import { showToast } from './ui.js';
import { getInitials, stringToColor } from './utils.js';
import { upsertProfile } from './profiles.js';

let _currentUser = null;

// ---- Login ----
export async function login(email, password) {
  await account.createEmailPasswordSession(email, password);
  _currentUser = null; // Clear cache
}

// ---- Logout ----
export async function logout() {
  try {
    await account.deleteSession('current');
  } finally {
    _currentUser = null;
    window.location.href = 'index.html';
  }
}

// ---- Get current user (with cache) ----
export async function getCurrentUser() {
  if (_currentUser) return _currentUser;
  try {
    _currentUser = await account.get();
    return _currentUser;
  } catch (error) {
    // 401 Unauthorized est attendu quand l'utilisateur n'est pas connecté
    // Retourner null silencieusement sans aficher l'erreur
    if (error.code === 401) {
      return null;
    }
    // Autres erreurs: logguer
    console.warn('[Auth] Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}

// ---- Check admin label ----
export function isAdmin(user) {
  if (!user) return false;
  return Array.isArray(user.labels) && user.labels.includes('admin');
}

// ---- Page guards ----
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  // Fire-and-forget: keep profile in sync
  upsertProfile(user).catch(() => {});
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!user) return null;
  if (!isAdmin(user)) {
    window.location.href = 'my-tasks.html';
    return null;
  }
  return user;
}

// ---- Redirect if already logged in ----
export async function redirectIfLoggedIn(dest = 'my-tasks.html') {
  const user = await getCurrentUser();
  if (user) window.location.href = dest;
}

// ---- Admin SDK: create user account ----
export async function createUserAccount(name, email, password, role = 'member') {
  // Note: setting labels requires Admin API or a backend function
  const newUser = await account.create(ID.unique(), email, password, name);
  return newUser;
}

// ---- Update user role (label) ----
// This typically requires a server-side Appwrite Function
export async function updateUserRole(userId, role) {
  // Placeholder — implement via Appwrite Function or Admin SDK
  throw new Error('updateUserRole nécessite un accès Admin SDK côté serveur.');
}

// ---- Populate sidebar user info ----
export function populateSidebarUser(user) {
  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');
  const avatarEl = document.getElementById('sidebar-user-avatar');

  if (nameEl) nameEl.textContent = user.name || user.email;
  if (roleEl) roleEl.textContent = isAdmin(user) ? 'Administrateur' : 'Membre';
  if (avatarEl) {
    const initials = getInitials(user.name || user.email);
    const color    = stringToColor(user.$id);
    avatarEl.textContent = initials;
    avatarEl.style.background = color;
  }

  // Also populate header avatar
  const headerAvatar = document.getElementById('header-avatar');
  if (headerAvatar) {
    const initials = getInitials(user.name || user.email);
    const color    = stringToColor(user.$id);
    headerAvatar.textContent = initials;
    headerAvatar.style.background = color;
    headerAvatar.title = user.name || user.email;
  }

  // Show/hide admin nav items
  if (isAdmin(user)) {
    document.querySelectorAll('[data-admin-only]').forEach(el => {
      el.style.display = '';
    });
  }
}

// ---- Logout button ----
export function initLogoutBtn() {
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await logout();
      } catch {
        window.location.href = 'index.html';
      }
    });
  });
}
