// ============================================
// IT-ISMGB — Dynamic Categories
// ============================================

import { databases, Query, ID } from './appwrite.js';
import { DATABASE_ID, COLLECTIONS } from './config.js';

export const DEFAULT_CATEGORIES = [
  { slug: 'reseau',      name: 'Réseau',      color: '#2F81F7', is_default: true },
  { slug: 'materiel',    name: 'Matériel',    color: '#3FB950', is_default: true },
  { slug: 'logiciel',    name: 'Logiciel',    color: '#BC8CFF', is_default: true },
  { slug: 'maintenance', name: 'Maintenance', color: '#D29922', is_default: true },
  { slug: 'graphisme',   name: 'Graphisme',   color: '#F0883E', is_default: true },
];

let _cache = null;

// ---- Get all categories (DB + defaults fallback) ----
export async function getCategories(forceRefresh = false) {
  if (_cache && !forceRefresh) return _cache;
  try {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CATEGORIES, [
      Query.orderAsc('name'),
      Query.limit(200),
    ]);
    _cache = res.documents;
    return _cache;
  } catch {
    // Return static defaults if DB not yet set up
    return DEFAULT_CATEGORIES.map(c => ({ ...c, $id: c.slug }));
  }
}

// ---- Create a new category ----
export async function createCategory(name, color, userId) {
  const slug = name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+|_+$/g, '');

  // Check slug uniqueness
  const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CATEGORIES, [
    Query.equal('slug', slug),
    Query.limit(1),
  ]);
  if (existing.total > 0) {
    throw new Error(`Une catégorie avec le nom "${name}" existe déjà.`);
  }

  _cache = null; // Invalidate cache

  return databases.createDocument(DATABASE_ID, COLLECTIONS.CATEGORIES, ID.unique(), {
    name,
    slug,
    color     : color || '#58A6FF',
    is_default: false,
    created_by: userId,
    created_at: new Date().toISOString(),
  });
}

// ---- Delete a category ----
export async function deleteCategory(categoryId) {
  _cache = null;
  return databases.deleteDocument(DATABASE_ID, COLLECTIONS.CATEGORIES, categoryId);
}

// ---- Seed default categories (first admin login) ----
export async function seedDefaultCategories(userId) {
  try {
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CATEGORIES, [
      Query.equal('is_default', true),
      Query.limit(1),
    ]);
    if (existing.total > 0) return; // Already seeded

    for (const cat of DEFAULT_CATEGORIES) {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.CATEGORIES, ID.unique(), {
        name      : cat.name,
        slug      : cat.slug,
        color     : cat.color,
        is_default: true,
        created_by: userId,
        created_at: new Date().toISOString(),
      });
    }
    _cache = null;
  } catch (e) {
    console.warn('[categories] seed failed:', e?.message);
  }
}

// ---- Helpers ----
export function getCategoryName(slug, categories = []) {
  const found = categories.find(c => c.slug === slug);
  if (found) return found.name;
  const def = DEFAULT_CATEGORIES.find(c => c.slug === slug);
  return def?.name || slug;
}

export function getCategoryColor(slug, categories = []) {
  const found = categories.find(c => c.slug === slug);
  if (found) return found.color || '#58A6FF';
  const def = DEFAULT_CATEGORIES.find(c => c.slug === slug);
  return def?.color || '#58A6FF';
}

// ---- Populate a <select> element with categories ----
export function populateCategorySelect(selectEl, categories, selectedSlug = '', addNewOption = true) {
  const current = selectEl.value;
  selectEl.innerHTML = '<option value="">Choisir…</option>';
  for (const cat of categories) {
    const opt = document.createElement('option');
    opt.value = cat.slug;
    opt.textContent = cat.name;
    if ((selectedSlug || current) === cat.slug) opt.selected = true;
    selectEl.appendChild(opt);
  }
  if (addNewOption) {
    const sep = document.createElement('option');
    sep.disabled = true;
    sep.textContent = '──────────';
    selectEl.appendChild(sep);

    const addOpt = document.createElement('option');
    addOpt.value = '__new__';
    addOpt.textContent = '➕ Créer une catégorie…';
    selectEl.appendChild(addOpt);
  }
}
