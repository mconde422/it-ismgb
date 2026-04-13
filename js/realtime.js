// ============================================
// IT-ISMGB — Realtime Subscriptions
// ============================================

import { client } from './appwrite.js';
import { DATABASE_ID, COLLECTIONS } from './config.js';
import { showToast } from './ui.js';
import { truncate } from './utils.js';

const DB = DATABASE_ID;
const activeSubscriptions = new Map();

// ---- Subscribe to all tasks in a workspace ----
export function subscribeToGroupTasks(workspaceId, currentUserId, { onUpdate, onDelete } = {}) {
  const channel = `databases.${DB}.collections.${COLLECTIONS.TASKS}.documents`;
  const key = `group-tasks-${workspaceId}`;

  if (activeSubscriptions.has(key)) activeSubscriptions.get(key)();

  const unsub = client.subscribe(channel, response => {
    const task   = response.payload;
    const events = response.events;

    if (task.workspace_id !== workspaceId) return;

    // Ignore own actions
    if (task.creator_id === currentUserId && events.some(e => e.includes('create'))) return;

    if (events.some(e => e.includes('create'))) {
      showToast(`Nouvelle tâche : "${truncate(task.title, 40)}"`, 'info', 'Nouvelle tâche');
      onUpdate?.(task, 'create');
    }

    if (events.some(e => e.includes('update'))) {
      if (task.creator_id !== currentUserId) {
        showToast(`Tâche mise à jour : "${truncate(task.title, 40)}"`, 'info', 'Mise à jour');
      }
      onUpdate?.(task, 'update');
    }

    if (events.some(e => e.includes('delete'))) {
      showToast('Une tâche a été supprimée', 'warning', 'Suppression');
      onDelete?.(task, 'delete');
    }
  });

  activeSubscriptions.set(key, unsub);
  return unsub;
}

// ---- Subscribe to comments on a task ----
export function subscribeToComments(taskId, currentUserId, onNew) {
  const channel = `databases.${DB}.collections.${COLLECTIONS.COMMENTS}.documents`;
  const key = `comments-${taskId}`;

  if (activeSubscriptions.has(key)) activeSubscriptions.get(key)();

  const unsub = client.subscribe(channel, response => {
    const comment = response.payload;
    if (comment.task_id !== taskId) return;
    if (comment.author_id === currentUserId) return; // Ignore own comments

    const events = response.events;
    if (events.some(e => e.includes('create'))) {
      onNew?.(comment);
    }
  });

  activeSubscriptions.set(key, unsub);
  return unsub;
}

// ---- Subscribe to subtask changes ----
export function subscribeToSubtasks(taskId, onUpdate) {
  const channel = `databases.${DB}.collections.${COLLECTIONS.SUBTASKS}.documents`;
  const key = `subtasks-${taskId}`;

  if (activeSubscriptions.has(key)) activeSubscriptions.get(key)();

  const unsub = client.subscribe(channel, response => {
    const subtask = response.payload;
    if (subtask.task_id !== taskId) return;
    onUpdate?.(subtask, response.events);
  });

  activeSubscriptions.set(key, unsub);
  return unsub;
}

// ---- Subscribe to workspace membership changes ----
export function subscribeToWorkspace(workspaceId, onUpdate) {
  const channel = `databases.${DB}.collections.${COLLECTIONS.WORKSPACES}.documents`;
  const key = `workspace-${workspaceId}`;

  if (activeSubscriptions.has(key)) activeSubscriptions.get(key)();

  const unsub = client.subscribe(channel, response => {
    if (response.payload.$id !== workspaceId) return;
    onUpdate?.(response.payload, response.events);
  });

  activeSubscriptions.set(key, unsub);
  return unsub;
}

// ---- Unsubscribe all ----
export function unsubscribeAll() {
  activeSubscriptions.forEach(unsub => { try { unsub(); } catch {} });
  activeSubscriptions.clear();
}

// ---- Unsubscribe by key ----
export function unsubscribe(key) {
  if (activeSubscriptions.has(key)) {
    try { activeSubscriptions.get(key)(); } catch {}
    activeSubscriptions.delete(key);
  }
}
