// ============================================
// IT-ISMGB — Activity Logs
// ============================================

import { databases, Query, ID } from './appwrite.js';
import { DATABASE_ID, COLLECTIONS } from './config.js';

// ---- Write activity log ----
export async function logActivity(data) {
  try {
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ACTIVITY_LOGS,
      ID.unique(),
      {
        task_id     : data.task_id || null,
        workspace_id: data.workspace_id || null,
        user_id     : data.user_id,
        user_name   : data.user_name,
        action      : data.action,
        old_value   : data.old_value || null,
        new_value   : data.new_value || null,
        created_at  : new Date().toISOString(),
      }
    );
  } catch {
    // Non-critical — silently fail
  }
}

// ---- Get activity logs for a task ----
export async function getTaskActivity(taskId) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.ACTIVITY_LOGS,
    [
      Query.equal('task_id', taskId),
      Query.orderDesc('created_at'),
      Query.limit(50),
    ]
  );
  return res.documents;
}

// ---- Get activity logs for a workspace ----
export async function getWorkspaceActivity(workspaceId) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.ACTIVITY_LOGS,
    [
      Query.equal('workspace_id', workspaceId),
      Query.orderDesc('created_at'),
      Query.limit(50),
    ]
  );
  return res.documents;
}

// ---- Get global activity (admin) ----
export async function getGlobalActivity(limit = 20) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.ACTIVITY_LOGS,
    [Query.orderDesc('created_at'), Query.limit(limit)]
  );
  return res.documents;
}
