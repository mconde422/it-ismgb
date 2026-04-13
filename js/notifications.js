// ============================================
// IT-ISMGB — In-app & Browser Notifications
// ============================================

import { databases, Query } from './appwrite.js';
import { DATABASE_ID, COLLECTIONS } from './config.js';
import { escapeHtml, formatDate } from './utils.js';

const LS_DISMISSED   = 'it_ismgb_notif_dismissed';
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 min

let _bell     = null;
let _badge    = null;
let _dropdown = null;
let _list     = [];
const _sentBrowser = new Set();

// ---- Public init ----
export async function initNotifications(user) {
  _injectStyles();
  _injectBell();
  await _check(user);
  setInterval(() => _check(user), CHECK_INTERVAL);
  _requestBrowserPermission();
}

// ============================================
// PRIVATE — HTML injection
// ============================================

function _injectBell() {
  const actions = document.querySelector('.header-actions');
  if (!actions || document.getElementById('notif-bell')) return;

  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;display:flex;align-items:center';
  wrap.innerHTML = `
    <button class="header-btn notif-bell" id="notif-bell" title="Notifications" aria-label="Notifications">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span class="notif-badge" id="notif-badge" style="display:none">0</span>
    </button>
    <div class="notif-dropdown" id="notif-dropdown">
      <div class="notif-hdr">
        <span class="notif-hdr-title">Notifications</span>
        <button class="notif-clear-all" id="notif-clear">Tout effacer</button>
      </div>
      <div class="notif-body" id="notif-body"></div>
    </div>
  `;
  actions.insertBefore(wrap, actions.firstChild);

  _bell     = document.getElementById('notif-bell');
  _badge    = document.getElementById('notif-badge');
  _dropdown = document.getElementById('notif-dropdown');

  _bell.addEventListener('click', e => { e.stopPropagation(); _toggle(); });
  document.getElementById('notif-clear').addEventListener('click', e => { e.stopPropagation(); _clearAll(); });
  document.addEventListener('click', () => _close());
  _dropdown.addEventListener('click', e => e.stopPropagation());
}

// ============================================
// PRIVATE — Check tasks
// ============================================

async function _check(user) {
  try {
    const now   = new Date();
    const in1h  = new Date(now.getTime() + 3_600_000);
    const in24h = new Date(now.getTime() + 86_400_000);

    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, [
      Query.equal('creator_id', user.$id),
      Query.notEqual('status', 'done'),
      Query.isNotNull('due_date'),
      Query.orderAsc('due_date'),
      Query.limit(100),
    ]);

    const dismissed = _getDismissed();
    const notifs    = [];

    for (const task of res.documents) {
      const due = new Date(task.due_date);

      if (due < now) {
        _push(notifs, dismissed, 'overdue', task, 'Tâche en retard', due);
      } else if (due <= in1h) {
        _push(notifs, dismissed, 'urgent',  task, 'Échéance dans moins d\'1h', due);
      } else if (due <= in24h) {
        _push(notifs, dismissed, 'soon',    task, 'Échéance dans 24h', due);
      }
    }

    _list = notifs;
    _render();

    // Browser notifs for critical ones
    for (const n of notifs.filter(n => n.type !== 'soon')) {
      _sendBrowser(n);
    }
  } catch { /* silently fail */ }
}

function _push(arr, dismissed, type, task, title, due) {
  const id = `${type}_${task.$id}`;
  if (dismissed.includes(id)) return;
  arr.push({ id, type, title, message: task.title, due, taskId: task.$id });
}

// ============================================
// PRIVATE — Render
// ============================================

function _render() {
  const body  = document.getElementById('notif-body');
  const count = _list.length;
  if (!body) return;

  if (_badge) {
    _badge.textContent  = count > 9 ? '9+' : count;
    _badge.style.display = count > 0 ? 'flex' : 'none';
  }

  if (count === 0) {
    body.innerHTML = `
      <div class="notif-empty">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <p>Aucune notification</p>
      </div>`;
    return;
  }

  const ICONS = {
    overdue: { dot: 'var(--accent-danger)',  emoji: '🔴' },
    urgent : { dot: 'var(--accent-warning)', emoji: '🟠' },
    soon   : { dot: 'var(--accent-warning)', emoji: '🟡' },
  };

  body.innerHTML = _list.map(n => {
    const cfg = ICONS[n.type] || { dot: 'var(--accent-primary)', emoji: '🔵' };
    return `
      <div class="notif-item" data-id="${n.id}">
        <span class="notif-dot" style="background:${cfg.dot}">${cfg.emoji}</span>
        <div class="notif-item-body">
          <div class="notif-item-title">${escapeHtml(n.title)}</div>
          <div class="notif-item-task">${escapeHtml(n.message)}</div>
          <div class="notif-item-date">${formatDate(n.due.toISOString())}</div>
        </div>
        <div class="notif-item-btns">
          <a href="task-detail.html?id=${n.taskId}" class="notif-goto">Voir</a>
          <button class="notif-dismiss" onclick="window._dismissNotif('${n.id}')">×</button>
        </div>
      </div>`;
  }).join('');

  window._dismissNotif = id => {
    const dismissed = _getDismissed();
    if (!dismissed.includes(id)) { dismissed.push(id); localStorage.setItem(LS_DISMISSED, JSON.stringify(dismissed)); }
    _list = _list.filter(n => n.id !== id);
    _render();
  };
}

// ============================================
// PRIVATE — Helpers
// ============================================

function _toggle() {
  if (_dropdown.classList.contains('open')) _close();
  else { _dropdown.classList.add('open'); _bell?.classList.add('active'); }
}

function _close() {
  _dropdown?.classList.remove('open');
  _bell?.classList.remove('active');
}

function _clearAll() {
  const dismissed = _getDismissed();
  _list.forEach(n => { if (!dismissed.includes(n.id)) dismissed.push(n.id); });
  localStorage.setItem(LS_DISMISSED, JSON.stringify(dismissed));
  _list = [];
  _render();
  _close();
}

function _getDismissed() {
  try { return JSON.parse(localStorage.getItem(LS_DISMISSED) || '[]'); }
  catch { return []; }
}

function _requestBrowserPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function _sendBrowser(n) {
  if (_sentBrowser.has(n.id)) return;
  _sentBrowser.add(n.id);
  if ('Notification' in window && Notification.permission === 'granted') {
    const notif = new Notification(`IT-ISMGB — ${n.title}`, {
      body: n.message,
      tag : n.id,
    });
    notif.onclick = () => { window.focus(); window.location.href = `task-detail.html?id=${n.taskId}`; };
  }
}

// ============================================
// PRIVATE — CSS injection
// ============================================

function _injectStyles() {
  if (document.getElementById('notif-styles')) return;
  const s = document.createElement('style');
  s.id = 'notif-styles';
  s.textContent = `
    .notif-bell { position:relative; }
    .notif-badge {
      position:absolute; top:-4px; right:-4px;
      min-width:16px; height:16px; padding:0 3px;
      background:var(--accent-danger); color:#fff;
      border-radius:10px; font-size:10px; font-weight:700;
      display:flex !important; align-items:center; justify-content:center;
      pointer-events:none;
    }
    .notif-bell.active svg { stroke:var(--accent-primary); }

    .notif-dropdown {
      display:none; position:absolute; top:calc(100% + 10px); right:0;
      width:320px; background:var(--bg-overlay);
      border:1px solid var(--border-default); border-radius:var(--radius-md);
      box-shadow:var(--shadow-lg); z-index:999; overflow:hidden;
    }
    .notif-dropdown.open { display:block; }

    .notif-hdr {
      display:flex; align-items:center; justify-content:space-between;
      padding:0.75rem 1rem; border-bottom:1px solid var(--border-default);
    }
    .notif-hdr-title { font-weight:600; font-size:var(--text-sm); }
    .notif-clear-all {
      background:none; border:none; font-size:var(--text-xs);
      color:var(--accent-primary); cursor:pointer; padding:0;
    }
    .notif-clear-all:hover { text-decoration:underline; }

    .notif-body { max-height:360px; overflow-y:auto; }

    .notif-empty {
      display:flex; flex-direction:column; align-items:center;
      gap:0.5rem; padding:2rem 1rem; color:var(--text-muted);
      font-size:var(--text-sm);
    }

    .notif-item {
      display:flex; align-items:flex-start; gap:0.75rem;
      padding:0.75rem 1rem; border-bottom:1px solid var(--border-muted);
      transition:background 0.1s;
    }
    .notif-item:hover { background:var(--bg-secondary); }
    .notif-item:last-child { border-bottom:none; }

    .notif-dot { font-size:0.85rem; flex-shrink:0; margin-top:2px; }

    .notif-item-body { flex:1; min-width:0; }
    .notif-item-title { font-size:var(--text-xs); font-weight:600; color:var(--text-primary); }
    .notif-item-task  { font-size:var(--text-xs); color:var(--text-secondary); margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .notif-item-date  { font-size:11px; color:var(--text-muted); margin-top:2px; }

    .notif-item-btns { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
    .notif-goto {
      font-size:var(--text-xs); color:var(--accent-primary);
      text-decoration:none; white-space:nowrap;
    }
    .notif-goto:hover { text-decoration:underline; }
    .notif-dismiss {
      background:none; border:none; color:var(--text-muted);
      cursor:pointer; font-size:1rem; line-height:1; padding:0;
    }
    .notif-dismiss:hover { color:var(--text-primary); }
  `;
  document.head.appendChild(s);
}
