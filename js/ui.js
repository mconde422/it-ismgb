// ============================================
// IT-ISMGB — UI Components & Renderers
// ============================================

import {
  formatDate, formatRelative, isOverdue, getInitials,
  escapeHtml, stringToColor, truncate, formatFileSize,
} from './utils.js';
import {
  STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS,
} from './config.js';

// ---- Dynamic category registry (populated via setCategoriesMap) ----
let _catMap = {};
export function setCategoriesMap(categories) {
  _catMap = {};
  for (const c of categories) _catMap[c.slug] = c;
}

// ============================================
// TOASTS
// ============================================

let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

const TOAST_ICONS = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error  : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info   : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

export function showToast(message, type = 'info', title = null) {
  const container = getToastContainer();
  const duration  = (type === 'error') ? 5000 : 3000;

  const defaultTitles = { success:'Succès', error:'Erreur', warning:'Attention', info:'Info' };
  const toastTitle = title || defaultTitles[type] || 'Notification';

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${TOAST_ICONS[type]}</div>
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(toastTitle)}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
    <button class="toast-close" aria-label="Fermer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
    <div class="toast-progress" style="animation-duration:${duration}ms"></div>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector('.toast-close');
  const remove = () => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  closeBtn.addEventListener('click', remove);
  setTimeout(remove, duration);
}

// ============================================
// MODALS
// ============================================

export function openModal(modalId) {
  const backdrop = document.getElementById(modalId);
  if (!backdrop) return;
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Close on backdrop click
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal(modalId);
  }, { once: true });
}

export function closeModal(modalId) {
  const backdrop = document.getElementById(modalId);
  if (!backdrop) return;
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

export function confirmDialog(message, onConfirm, title = 'Confirmer la suppression') {
  const MODAL_ID = 'confirm-modal';
  let modal = document.getElementById(MODAL_ID);

  if (!modal) {
    modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal modal-sm confirm-modal">
        <div class="modal-body">
          <div class="confirm-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h3 class="mb-2" id="confirm-title"></h3>
          <p class="text-secondary text-sm" id="confirm-message"></p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="confirm-cancel">Annuler</button>
          <button class="btn btn-danger" id="confirm-ok">Supprimer</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  modal.querySelector('#confirm-title').textContent = title;
  modal.querySelector('#confirm-message').textContent = message;

  openModal(MODAL_ID);

  const ok     = modal.querySelector('#confirm-ok');
  const cancel = modal.querySelector('#confirm-cancel');

  const cleanup = () => closeModal(MODAL_ID);
  const handleOk = () => { cleanup(); onConfirm(); };
  const handleCancel = () => cleanup();

  ok.replaceWith(ok.cloneNode(true));
  cancel.replaceWith(cancel.cloneNode(true));

  modal.querySelector('#confirm-ok').addEventListener('click', handleOk, { once: true });
  modal.querySelector('#confirm-cancel').addEventListener('click', handleCancel, { once: true });
}

// ============================================
// LOADERS
// ============================================

export function showPageLoader() {
  let loader = document.getElementById('page-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.className = 'page-loader';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
  }
  loader.classList.remove('hidden');
}

export function hidePageLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) loader.classList.add('hidden');
}

export function showLoader(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.dataset.originalHtml = el.innerHTML;
    el.innerHTML = '<div class="d-flex justify-center p-4"><div class="spinner spinner-sm"></div></div>';
  }
}

export function hideLoader(elementId) {
  const el = document.getElementById(elementId);
  if (el && el.dataset.originalHtml !== undefined) {
    el.innerHTML = el.dataset.originalHtml;
    delete el.dataset.originalHtml;
  }
}

// ============================================
// RENDERERS
// ============================================

export function renderCategoryBadge(category) {
  const dynamic = _catMap[category];
  if (dynamic) {
    const style = `background:${dynamic.color}22;color:${dynamic.color};border-color:${dynamic.color}44`;
    return `<span class="badge" style="${style}">${escapeHtml(dynamic.name)}</span>`;
  }
  const label = CATEGORY_LABELS[category] || category;
  return `<span class="badge badge-cat-${category}">${escapeHtml(label)}</span>`;
}

export function renderStatusBadge(status) {
  const label = STATUS_LABELS[status] || status;
  return `<span class="badge badge-status-${status}">${escapeHtml(label)}</span>`;
}

export function renderPriorityDot(priority, withLabel = false) {
  const label = PRIORITY_LABELS[priority] || priority;
  if (withLabel) {
    return `<span class="d-flex items-center gap-2">
      <span class="prio-dot prio-dot-${priority}"></span>
      <span class="text-sm">${escapeHtml(label)}</span>
    </span>`;
  }
  return `<span class="prio-dot prio-dot-${priority}" title="${escapeHtml(label)}"></span>`;
}

export function renderMemberAvatar(nameOrInitials, size = 'sm', color = null) {
  const initials = nameOrInitials.length <= 3 ? nameOrInitials : getInitials(nameOrInitials);
  const bg = color || stringToColor(nameOrInitials);
  return `<div class="avatar avatar-${size}" style="background:${bg}" title="${escapeHtml(nameOrInitials)}">${escapeHtml(initials)}</div>`;
}

export function renderTaskCard(task, options = {}) {
  const { showActions = true, showGroup = false } = options;
  const overdue    = isOverdue(task.due_date, task.status);
  const isDone     = task.status === 'done';
  const initials   = task.assignee_name ? getInitials(task.assignee_name) : null;
  const assigneeColor = task.assignee_name ? stringToColor(task.assignee_name) : null;

  return `
    <div class="task-card cat-${task.category} ${overdue ? 'overdue' : ''}"
         data-task-id="${task.$id}" onclick="window.location.href='task-detail.html?id=${task.$id}'">
      <div class="task-card-top">
        <div class="task-card-badges">
          ${renderCategoryBadge(task.category)}
          ${renderPriorityDot(task.priority)}
        </div>
        <span class="task-card-title ${isDone ? 'done-title' : ''}">${escapeHtml(task.title)}</span>
        ${showActions ? `
          <div class="task-card-actions" onclick="event.stopPropagation()">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="editTask('${task.$id}')" title="Modifier">
              ${SVG_ICONS.edit}
            </button>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="deleteTaskUI('${task.$id}','${escapeHtml(task.title)}')" title="Supprimer">
              ${SVG_ICONS.trash}
            </button>
          </div>
        ` : ''}
      </div>
      <div class="task-card-meta">
        <div class="task-card-assignee">
          ${initials
            ? `${renderMemberAvatar(task.assignee_name, 'sm', assigneeColor)} <span class="text-xs text-secondary">${escapeHtml(task.assignee_name)}</span>`
            : `<span class="text-xs text-muted">Non assigné</span>`
          }
        </div>
        <div class="d-flex items-center gap-2">
          ${renderStatusBadge(task.status)}
          ${task.due_date
            ? `<div class="task-card-date ${overdue ? 'overdue' : ''}">
                ${SVG_ICONS.calendar}
                ${formatDate(task.due_date)}${task.due_time ? ` à ${task.due_time}` : ''}
              </div>`
            : ''
          }
        </div>
      </div>
    </div>
  `;
}

export function renderKanbanBoard(tasks, containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const columns = {
    todo      : { label: 'À faire',    tasks: [] },
    in_progress:{ label: 'En cours',   tasks: [] },
    blocked   : { label: 'Bloqué',     tasks: [] },
    done      : { label: 'Terminé',    tasks: [] },
  };

  tasks.forEach(t => {
    if (columns[t.status]) columns[t.status].tasks.push(t);
  });

  container.innerHTML = `<div class="kanban-board" id="kanban-board">
    ${Object.entries(columns).map(([status, col]) => `
      <div class="kanban-column" data-status="${status}">
        <div class="kanban-column-header">
          <div class="kanban-col-title">
            <span class="kanban-col-dot"></span>
            ${escapeHtml(col.label)}
          </div>
          <span class="kanban-col-count">${col.tasks.length}</span>
        </div>
        <div class="kanban-cards" data-status="${status}" id="kanban-${status}">
          ${col.tasks.map(t => renderKanbanCard(t)).join('')}
        </div>
        ${options.allowAdd !== false ? `
          <button class="kanban-add-btn" onclick="quickAddTask('${status}')">
            ${SVG_ICONS.plus} Ajouter
          </button>
        ` : ''}
      </div>
    `).join('')}
  </div>`;

  initKanbanDragDrop(options.onMove);
}

export function renderKanbanCard(task) {
  const overdue = isOverdue(task.due_date, task.status);
  const isDone  = task.status === 'done';
  return `
    <div class="kanban-card cat-${task.category} ${overdue ? 'overdue' : ''}"
         draggable="true" data-task-id="${task.$id}"
         onclick="window.location.href='task-detail.html?id=${task.$id}'">
      <div class="kanban-card-title ${isDone ? 'done-title' : ''}">${escapeHtml(task.title)}</div>
      <div class="kanban-card-badges">
        ${renderCategoryBadge(task.category)}
        ${renderPriorityDot(task.priority)}
      </div>
      <div class="kanban-card-footer">
        <div class="kanban-card-assignee">
          ${task.assignee_name ? renderMemberAvatar(task.assignee_name, 'sm') : ''}
        </div>
        ${task.due_date
          ? `<div class="kanban-card-date ${overdue ? 'overdue' : ''}">
              ${SVG_ICONS.calendar} ${formatDate(task.due_date)}
            </div>`
          : ''
        }
        <div class="kanban-card-actions" onclick="event.stopPropagation()">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editTask('${task.$id}')" title="Modifier">
            ${SVG_ICONS.edit}
          </button>
          <button class="btn btn-ghost btn-sm btn-icon" onclick="deleteTaskUI('${task.$id}','${escapeHtml(task.title)}')" title="Supprimer">
            ${SVG_ICONS.trash}
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderActivityLog(log) {
  const actionIcons = {
    created         : SVG_ICONS.plus,
    status_changed  : SVG_ICONS.refresh,
    assigned        : SVG_ICONS.user,
    commented       : SVG_ICONS.comment,
    deleted         : SVG_ICONS.trash,
    priority_changed: SVG_ICONS.flag,
  };

  const actionText = {
    created         : 'a créé la tâche',
    status_changed  : `a changé le statut en <strong>${STATUS_LABELS[log.new_value] || log.new_value}</strong>`,
    assigned        : `a assigné à <strong>${escapeHtml(log.new_value || '')}</strong>`,
    commented       : 'a ajouté un commentaire',
    deleted         : 'a supprimé la tâche',
    priority_changed: `a changé la priorité en <strong>${PRIORITY_LABELS[log.new_value] || log.new_value}</strong>`,
  };

  const icon    = actionIcons[log.action] || SVG_ICONS.activity;
  const text    = actionText[log.action] || log.action;
  const initials = getInitials(log.user_name);
  const bg       = stringToColor(log.user_name);

  return `
    <div class="activity-item">
      <div class="activity-dot" style="background:${bg}20;border-color:${bg}40;color:${bg}">
        ${icon}
      </div>
      <div class="activity-content">
        <div class="activity-text">
          <strong>${escapeHtml(log.user_name)}</strong> ${text}
        </div>
        <div class="activity-time">${formatRelative(log.created_at)}</div>
      </div>
    </div>
  `;
}

// ============================================
// KANBAN DRAG & DROP
// ============================================

function initKanbanDragDrop(onMove) {
  const cards = document.querySelectorAll('.kanban-card');
  const zones = document.querySelectorAll('.kanban-cards');

  let draggedCard = null;
  let draggedTaskId = null;

  cards.forEach(card => {
    card.addEventListener('dragstart', e => {
      draggedCard   = card;
      draggedTaskId = card.dataset.taskId;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      draggedCard?.classList.remove('dragging');
      document.querySelectorAll('.kanban-drop-placeholder').forEach(p => p.remove());
      zones.forEach(z => z.classList.remove('drag-over'));
      draggedCard = null;
    });
  });

  zones.forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', e => {
      if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove('drag-over');
      }
    });

    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');

      const newStatus = zone.dataset.status;
      if (!draggedTaskId || !newStatus) return;

      if (draggedCard && !zone.contains(draggedCard)) {
        zone.appendChild(draggedCard);
      }

      if (onMove) onMove(draggedTaskId, newStatus);
    });
  });
}

// ============================================
// SIDEBAR & LAYOUT HELPERS
// ============================================

export function initSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  const toggleBtn = document.getElementById('sidebar-toggle');

  if (!sidebar) return;

  toggleBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay?.classList.toggle('open');
  });

  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });

  // Mark active nav item
  const currentPath = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item[href]').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
}

export function initThemeToggle(toggleFn) {
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', toggleFn);
  });
}

export function initHeaderSearch() {
  const input = document.getElementById('header-search');
  if (!input) return;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) {
      window.location.href = `search.html?q=${encodeURIComponent(input.value.trim())}`;
    }
  });
}

// ============================================
// TABS
// ============================================

export function initTabs(tabsContainerId) {
  const container = document.getElementById(tabsContainerId);
  if (!container) return;

  const btns   = container.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      btns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${target}`)?.classList.add('active');
    });
  });
}

// ============================================
// EMPTY STATE
// ============================================

export function renderEmptyState(icon, title, description, btnLabel = null, btnAction = null) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
      ${btnLabel
        ? `<button class="btn btn-primary" onclick="${btnAction}">${escapeHtml(btnLabel)}</button>`
        : ''
      }
    </div>
  `;
}

// ============================================
// FORM HELPERS
// ============================================

export function setButtonLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.classList.add('loading');
    btn.innerHTML = `<div class="btn-spinner"></div> ${btn.dataset.loadingText || 'Chargement...'}`;
  } else {
    btn.disabled = false;
    btn.classList.remove('loading');
    if (btn.dataset.originalText) {
      btn.innerHTML = btn.dataset.originalText;
      delete btn.dataset.originalText;
    }
  }
}

export function validateForm(formEl) {
  let valid = true;
  formEl.querySelectorAll('[required]').forEach(input => {
    input.classList.remove('error');
    const errEl = input.parentNode.querySelector('.form-error');
    if (errEl) errEl.remove();

    if (!input.value.trim()) {
      valid = false;
      input.classList.add('error');
      const err = document.createElement('span');
      err.className = 'form-error';
      err.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Ce champ est requis`;
      input.parentNode.appendChild(err);
    }
  });
  return valid;
}

export function clearFormErrors(formEl) {
  formEl.querySelectorAll('.form-error').forEach(e => e.remove());
  formEl.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
}

// ============================================
// SVG ICONS (inline)
// ============================================

export const SVG_ICONS = {
  edit    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash   : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  plus    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  check   : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  calendar: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  user    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  comment : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  refresh : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  flag    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
  activity: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  logout  : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  search  : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  sun     : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  settings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  list    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  kanban  : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="11" rx="1"/></svg>`,
  chevron : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  paperclip:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,
  download: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  upload  : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  people  : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  dashboard:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  tasks   : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  groups  : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  admin   : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  bell    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
};
