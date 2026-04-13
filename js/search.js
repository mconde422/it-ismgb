// ============================================
// IT-ISMGB — Search
// ============================================

import { databases, Query } from './appwrite.js';
import { DATABASE_ID, COLLECTIONS } from './config.js';

// ---- Full search (tasks + workspaces) ----
export async function globalSearch(query, userId, filters = {}) {
  if (!query || query.trim().length < 2) return { tasks: [], workspaces: [] };

  const q = query.trim().toLowerCase();

  const [taskRes, wsRes] = await Promise.all([
    databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, [
      Query.orderDesc('created_at'),
      Query.limit(100),
    ]),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.WORKSPACES, [
      Query.contains('members', [userId]),
      Query.limit(50),
    ]),
  ]);

  // Filter tasks: only own private + group tasks in user's workspaces
  const tasks = taskRes.documents.filter(t => {
    const accessible = t.creator_id === userId || t.visibility === 'group';
    if (!accessible) return false;

    const statusMatch = filters.status ? t.status === filters.status : true;
    const catMatch    = filters.category ? t.category === filters.category : true;

    const textMatch = t.title?.toLowerCase().includes(q)
                   || t.description?.toLowerCase().includes(q)
                   || t.tags?.some(tag => tag.toLowerCase().includes(q));

    return textMatch && statusMatch && catMatch;
  });

  // Filter workspaces
  const workspaces = wsRes.documents.filter(ws =>
    ws.name?.toLowerCase().includes(q) || ws.description?.toLowerCase().includes(q)
  );

  return { tasks, workspaces };
}

// ---- Filter tasks client-side ----
export function filterTasks(tasks, filters = {}) {
  return tasks.filter(t => {
    if (filters.status   && t.status   !== filters.status)   return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.overdue  && !(new Date(t.due_date) < new Date() && t.status !== 'done')) return false;
    if (filters.assignee && t.assignee_id !== filters.assignee) return false;
    return true;
  });
}

// ---- Sort tasks client-side ----
export function sortTasks(tasks, sortBy = 'created_at', direction = 'desc') {
  const PRIO = { critical: 0, high: 1, normal: 2, low: 3 };
  const STATUS = { todo: 0, in_progress: 1, blocked: 2, done: 3 };

  return [...tasks].sort((a, b) => {
    let valA, valB;

    if (sortBy === 'priority') {
      valA = PRIO[a.priority] ?? 99;
      valB = PRIO[b.priority] ?? 99;
      return valA - valB;
    }

    if (sortBy === 'status') {
      valA = STATUS[a.status] ?? 99;
      valB = STATUS[b.status] ?? 99;
      return valA - valB;
    }

    valA = a[sortBy] ? new Date(a[sortBy]) : new Date(0);
    valB = b[sortBy] ? new Date(b[sortBy]) : new Date(0);
    return direction === 'desc' ? valB - valA : valA - valB;
  });
}
