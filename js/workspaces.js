// ============================================
// IT-ISMGB — Workspaces (Groups) CRUD
// ============================================

import { databases, Query, ID } from './appwrite.js';
import { DATABASE_ID, COLLECTIONS } from './config.js';

// ---- Create workspace ----
export async function createWorkspace(data, user) {
  const now = new Date().toISOString();
  return databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.WORKSPACES,
    ID.unique(),
    {
      name           : data.name,
      description    : data.description || null,
      created_by     : user.$id,
      members        : [user.$id],
      pending_invites: [],
      color          : data.color || '#2F81F7',
      icon           : data.icon || '💻',
      created_at     : now,
      updated_at     : now,
    }
  );
}

// ---- Get workspaces where user is a member ----
export async function getMyWorkspaces(userId) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.WORKSPACES,
    [
      Query.contains('members', [userId]),
      Query.orderDesc('created_at'),
      Query.limit(50),
    ]
  );
  return res.documents;
}

// ---- Get all workspaces (admin) ----
export async function getAllWorkspaces() {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.WORKSPACES,
    [Query.orderDesc('created_at'), Query.limit(100)]
  );
  return res.documents;
}

// ---- Get workspace by ID ----
export async function getWorkspaceById(workspaceId) {
  return databases.getDocument(DATABASE_ID, COLLECTIONS.WORKSPACES, workspaceId);
}

// ---- Update workspace ----
export async function updateWorkspace(workspaceId, data) {
  return databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.WORKSPACES,
    workspaceId,
    { ...data, updated_at: new Date().toISOString() }
  );
}

// ---- Delete workspace ----
export async function deleteWorkspace(workspaceId) {
  // Delete all group tasks first
  const tasks = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.TASKS,
    [Query.equal('workspace_id', workspaceId), Query.limit(100)]
  );
  for (const t of tasks.documents) {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TASKS, t.$id);
  }
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.WORKSPACES, workspaceId);
}

// ---- Invite member by email ----
// Note: Appwrite doesn't expose user lookup by email without Admin SDK.
// We store the email in pending_invites and resolve when the user logs in.
export async function inviteMemberByEmail(workspaceId, email, workspace) {
  const pending = workspace.pending_invites || [];
  if (pending.includes(email)) throw new Error('Invitation déjà envoyée à cet email.');

  return databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.WORKSPACES,
    workspaceId,
    {
      pending_invites: [...pending, email],
      updated_at     : new Date().toISOString(),
    }
  );
}

// ---- Add member directly by user ID ----
export async function addMember(workspaceId, userId, workspace) {
  if (workspace.members.includes(userId)) throw new Error('Cet utilisateur est déjà membre.');
  return databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.WORKSPACES,
    workspaceId,
    {
      members   : [...workspace.members, userId],
      updated_at: new Date().toISOString(),
    }
  );
}

// ---- Remove member ----
export async function removeMember(workspaceId, userId, workspace) {
  if (workspace.created_by === userId) {
    throw new Error('Le propriétaire du groupe ne peut pas être retiré.');
  }
  const updated = workspace.members.filter(id => id !== userId);
  return databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.WORKSPACES,
    workspaceId,
    { members: updated, updated_at: new Date().toISOString() }
  );
}

// ---- Leave workspace ----
export async function leaveWorkspace(workspaceId, userId, workspace) {
  if (workspace.created_by === userId) {
    throw new Error('Transférez la propriété avant de quitter le groupe.');
  }
  return removeMember(workspaceId, userId, workspace);
}

// ---- Check pending invite and accept ----
export async function acceptPendingInvite(user, workspace) {
  const email   = user.email;
  const pending = workspace.pending_invites || [];
  if (!pending.includes(email)) return false;

  const newPending = pending.filter(e => e !== email);
  const newMembers = workspace.members.includes(user.$id)
    ? workspace.members
    : [...workspace.members, user.$id];

  await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.WORKSPACES,
    workspace.$id,
    {
      members        : newMembers,
      pending_invites: newPending,
      updated_at     : new Date().toISOString(),
    }
  );
  return true;
}
