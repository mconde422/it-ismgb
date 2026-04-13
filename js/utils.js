// ============================================
// IT-ISMGB — Utilities
// ============================================

// ---- Date formatting ----
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatRelative(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;

  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);

  if (minutes < 1)  return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24)   return `Il y a ${hours}h`;
  if (days < 7)     return `Il y a ${days}j`;
  return formatDate(dateStr);
}

export function isOverdue(dateStr, status) {
  if (!dateStr || status === 'done') return false;
  return new Date(dateStr) < new Date();
}

export function toISODate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toISOString();
}

// ---- String utilities ----
export function truncate(str, length = 80) {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '…' : str;
}

export function getInitials(name = '') {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export function highlight(text, query) {
  if (!query || !text) return escapeHtml(text || '');
  const escaped = escapeHtml(text);
  const re = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escaped.replace(re, '<mark>$1</mark>');
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---- Color utilities ----
export function stringToColor(str) {
  const COLORS = [
    '#2F81F7','#3FB950','#F85149','#D29922','#BC8CFF',
    '#58A6FF','#F0883E','#FF7B72','#56D364','#79C0FF',
    '#FFA198','#B3F0BC','#FFDBA0','#FFB3B0','#B8D0FB',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return { r, g, b };
}

// ---- Functional utilities ----
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, limit = 200) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= limit) {
      last = now;
      fn(...args);
    }
  };
}

// ---- ID generation ----
export function generateId(prefix = '') {
  const rand = Math.random().toString(36).slice(2, 10);
  return prefix ? `${prefix}_${rand}` : rand;
}

// ---- File utilities ----
export function formatFileSize(bytes) {
  if (bytes < 1024)       return `${bytes} o`;
  if (bytes < 1048576)    return `${(bytes/1024).toFixed(1)} Ko`;
  return `${(bytes/1048576).toFixed(1)} Mo`;
}

export function getFileIcon(mimeType = '') {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('docx')) return 'doc';
  if (mimeType.includes('excel') || mimeType.includes('xlsx')) return 'table';
  return 'file';
}

// ---- DOM utilities ----
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

export function el(tag, attrs = {}, ...children) {
  const elem = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') elem.className = v;
    else if (k.startsWith('data-')) elem.setAttribute(k, v);
    else elem[k] = v;
  }
  for (const child of children) {
    if (typeof child === 'string') elem.appendChild(document.createTextNode(child));
    else if (child) elem.appendChild(child);
  }
  return elem;
}

export function setHtml(selector, html, parent = document) {
  const elem = parent.querySelector(selector);
  if (elem) elem.innerHTML = html;
}

export function setText(selector, text, parent = document) {
  const elem = parent.querySelector(selector);
  if (elem) elem.textContent = text;
}

export function show(selector, parent = document) {
  const elem = typeof selector === 'string' ? parent.querySelector(selector) : selector;
  if (elem) elem.style.display = '';
}

export function hide(selector, parent = document) {
  const elem = typeof selector === 'string' ? parent.querySelector(selector) : selector;
  if (elem) elem.style.display = 'none';
}

// ---- Pagination ----
export function buildPaginationQueries(page = 1, pageSize = 25, offset = null) {
  const { Query } = window.Appwrite;
  return [
    Query.limit(pageSize),
    Query.offset(offset !== null ? offset : (page - 1) * pageSize),
  ];
}

// ---- Sort comparators ----
export function sortByDate(a, b, field = 'created_at', desc = true) {
  const da = new Date(a[field] || 0);
  const db = new Date(b[field] || 0);
  return desc ? db - da : da - db;
}

export function sortByPriority(a, b) {
  const order = { critical: 0, high: 1, normal: 2, low: 3 };
  return (order[a.priority] ?? 99) - (order[b.priority] ?? 99);
}

// ---- URL params ----
export function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function setUrlParam(name, value) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(name, value);
  else url.searchParams.delete(name);
  window.history.replaceState({}, '', url);
}
