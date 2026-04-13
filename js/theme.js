// ============================================
// IT-ISMGB — Theme (Dark / Light)
// ============================================

const STORAGE_KEY = 'it-ismgb-theme';

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
  applyTheme(saved);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(STORAGE_KEY, next);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcons(theme);
}

function updateThemeIcons(theme) {
  document.querySelectorAll('[data-theme-icon]').forEach(el => {
    const icon = el.getAttribute('data-theme-icon');
    if (icon === 'sun') {
      el.style.display = theme === 'dark' ? '' : 'none';
    } else if (icon === 'moon') {
      el.style.display = theme === 'light' ? '' : 'none';
    }
  });

  // Update toggle button title
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.title = theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre';
  });
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}
