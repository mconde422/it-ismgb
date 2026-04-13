// ============================================
// IT-ISMGB — Tasks CRUD
// ============================================

import { databases, Query, ID } from './appwrite.js';
import { DATABASE_ID, COLLECTIONS, PAGE_SIZE } from './config.js';
import { logActivity } from './activity.js';

// ---- Create ----
export async function createTask(taskData, user) {
  const now = new Date().toISOString();
  const doc = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.TASKS,
    ID.unique(),
    {
      title       : taskData.title,
      description : taskData.description || null,
      status      : taskData.status || 'todo',
      priority    : taskData.priority || 'normal',
      category    : taskData.category,
      visibility  : taskData.visibility || 'private',
      workspace_id: taskData.workspace_id || null,
      creator_id  : user.$id,
      assignee_id : taskData.assignee_id || null,
      assignee_name: taskData.assignee_name || null,
      due_date    : taskData.due_date || null,
      due_time    : taskData.due_time || null,
      tags        : taskData.tags || [],
      attachments : [],
      created_at  : now,
      updated_at  : now,
    }
  );

  await logActivity({
    task_id     : doc.$id,
    workspace_id: taskData.workspace_id || null,
    user_id     : user.$id,
    user_name   : user.name,
    action      : 'created',
    new_value   : taskData.title,
  });

  return doc;
}

// ---- Get my tasks (private) ----
export async function getMyTasks(userId, filters = {}) {
  const queries = [
    Query.equal('creator_id', userId),
    Query.equal('visibility', 'private'),
    Query.orderDesc('created_at'),
    Query.limit(PAGE_SIZE),
  ];

  if (filters.status)   queries.push(Query.equal('status', filters.status));
  if (filters.priority) queries.push(Query.equal('priority', filters.priority));
  if (filters.category) queries.push(Query.equal('category', filters.category));

  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, queries);
  return res.documents;
}

// ---- Get group tasks ----
export async function getGroupTasks(workspaceId, filters = {}) {
  const queries = [
    Query.equal('workspace_id', workspaceId),
    Query.orderDesc('created_at'),
    Query.limit(PAGE_SIZE),
  ];

  if (filters.status)   queries.push(Query.equal('status', filters.status));
  if (filters.priority) queries.push(Query.equal('priority', filters.priority));
  if (filters.category) queries.push(Query.equal('category', filters.category));

  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, queries);
  return res.documents;
}

// ---- Get all tasks (admin) ----
export async function getAllTasks(filters = {}) {
  const queries = [
    Query.orderDesc('created_at'),
    Query.limit(500),
  ];

  if (filters.status)   queries.push(Query.equal('status', filters.status));
  if (filters.priority) queries.push(Query.equal('priority', filters.priority));
  if (filters.category) queries.push(Query.equal('category', filters.category));

  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, queries);
  return res.documents;
}

// ---- Get task by ID ----
export async function getTaskById(taskId) {
  return databases.getDocument(DATABASE_ID, COLLECTIONS.TASKS, taskId);
}

// ---- Update task ----
export async function updateTask(taskId, updates, user) {
  const updated = await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.TASKS,
    taskId,
    { ...updates, updated_at: new Date().toISOString() }
  );
  return updated;
}

// ---- Change status ----
export async function changeTaskStatus(taskId, newStatus, oldStatus, user) {
  const updated = await updateTask(taskId, { status: newStatus }, user);
  await logActivity({
    task_id     : taskId,
    workspace_id: updated.workspace_id || null,
    user_id     : user.$id,
    user_name   : user.name,
    action      : 'status_changed',
    old_value   : oldStatus,
    new_value   : newStatus,
  });
  return updated;
}

// ---- Assign task ----
export async function assignTask(taskId, assigneeId, assigneeName, user) {
  const updated = await updateTask(taskId, {
    assignee_id  : assigneeId,
    assignee_name: assigneeName,
  }, user);
  await logActivity({
    task_id  : taskId,
    user_id  : user.$id,
    user_name: user.name,
    action   : 'assigned',
    new_value: assigneeName,
  });
  return updated;
}

// ---- Delete task ----
export async function deleteTask(taskId, user, taskTitle) {
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TASKS, taskId);

  // Delete related subtasks & comments (best-effort)
  try {
    const subtasks = await databases.listDocuments(
      DATABASE_ID, COLLECTIONS.SUBTASKS,
      [Query.equal('task_id', taskId), Query.limit(50)]
    );
    for (const s of subtasks.documents) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.SUBTASKS, s.$id);
    }

    const comments = await databases.listDocuments(
      DATABASE_ID, COLLECTIONS.COMMENTS,
      [Query.equal('task_id', taskId), Query.limit(50)]
    );
    for (const c of comments.documents) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.COMMENTS, c.$id);
    }
  } catch { /* Silently ignore cleanup errors */ }
}

// ---- Get overdue tasks ----
export async function getOverdueTasks() {
  const now = new Date().toISOString();
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, [
    Query.lessThan('due_date', now),
    Query.notEqual('status', 'done'),
    Query.orderAsc('due_date'),
    Query.limit(500),
  ]);
  return res.documents;
}

// ---- Search tasks ----
export async function searchTasks(searchQuery, userId, filters = {}) {
  const queries = [
    Query.orderDesc('created_at'),
    Query.limit(50),
  ];

  if (filters.status)   queries.push(Query.equal('status', filters.status));
  if (filters.category) queries.push(Query.equal('category', filters.category));

  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, queries);

  // Client-side fulltext filter (Appwrite free tier may not have fulltext search on all attributes)
  const q = searchQuery.toLowerCase();
  return res.documents.filter(t => {
    const accessible = t.creator_id === userId || t.visibility === 'group';
    const matches    = t.title?.toLowerCase().includes(q)
                    || t.description?.toLowerCase().includes(q)
                    || t.tags?.some(tag => tag.toLowerCase().includes(q));
    return accessible && matches;
  });
}

// ============================================
// SUBTASKS
// ============================================

export async function getSubtasks(taskId) {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SUBTASKS, [
    Query.equal('task_id', taskId),
    Query.orderAsc('created_at'),
  ]);
  return res.documents;
}

export async function createSubtask(taskId, title, userId) {
  return databases.createDocument(DATABASE_ID, COLLECTIONS.SUBTASKS, ID.unique(), {
    task_id   : taskId,
    title,
    is_done   : false,
    created_by: userId,
    created_at: new Date().toISOString(),
  });
}

export async function toggleSubtask(subtaskId, isDone) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.SUBTASKS, subtaskId, { is_done: isDone });
}

export async function deleteSubtask(subtaskId) {
  return databases.deleteDocument(DATABASE_ID, COLLECTIONS.SUBTASKS, subtaskId);
}

// ============================================
// STATS (for dashboard)
// ============================================

export async function getTaskStats() {
  const [allRes, doneRes, blockedRes, overdueRes] = await Promise.all([
    databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, [Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, [Query.equal('status','done'), Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, [Query.equal('status','blocked'), Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, [
      Query.lessThan('due_date', new Date().toISOString()),
      Query.notEqual('status', 'done'),
      Query.limit(1),
    ]),
  ]);

  return {
    total  : allRes.total,
    done   : doneRes.total,
    blocked: blockedRes.total,
    overdue: overdueRes.total,
  };
}
