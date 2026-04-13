// ============================================
// IT-ISMGB — Comments
// ============================================

import { databases, Query, ID } from './appwrite.js';
import { DATABASE_ID, COLLECTIONS } from './config.js';
import { getInitials } from './utils.js';

// ---- Get comments for a task ----
export async function getComments(taskId) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.COMMENTS,
    [
      Query.equal('task_id', taskId),
      Query.orderAsc('created_at'),
      Query.limit(100),
    ]
  );
  return res.documents;
}

// ---- Add comment ----
export async function addComment(taskId, content, user) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.COMMENTS,
    ID.unique(),
    {
      task_id     : taskId,
      author_id   : user.$id,
      author_name : user.name || user.email,
      author_avatar: getInitials(user.name || user.email),
      content,
      created_at  : new Date().toISOString(),
    }
  );
}

// ---- Delete comment ----
export async function deleteComment(commentId) {
  return databases.deleteDocument(DATABASE_ID, COLLECTIONS.COMMENTS, commentId);
}
