// ============================================
// IT-ISMGB — User Registration Requests
// ============================================

import { databases, Query, ID } from './appwrite.js';
import { DATABASE_ID, COLLECTIONS } from './config.js';
import { upsertProfile } from './profiles.js';

const COL = COLLECTIONS.USER_REQUESTS;

// ---- Submit a registration request (public, no auth required) ----
export async function submitRequest(data) {
  return databases.createDocument(DATABASE_ID, COL, ID.unique(), {
    name          : data.name,
    email         : data.email.toLowerCase().trim(),
    department    : data.department    || null,
    message       : data.message      || null,
    avatar_file_id: data.avatar_file_id || null,
    status        : 'pending',
    created_at    : new Date().toISOString(),
  });
}

// ---- Check request status by email (public) ----
export async function checkRequestByEmail(email) {
  const res = await databases.listDocuments(DATABASE_ID, COL, [
    Query.equal('email', email.toLowerCase().trim()),
    Query.orderDesc('created_at'),
    Query.limit(1),
  ]);
  return res.documents[0] || null;
}

// ---- Get all requests (admin) ----
export async function getAllRequests(statusFilter = null) {
  const filters = [Query.orderDesc('created_at'), Query.limit(100)];
  if (statusFilter) filters.push(Query.equal('status', statusFilter));
  const res = await databases.listDocuments(DATABASE_ID, COL, filters);
  return res.documents;
}

// ---- Count pending requests (admin) ----
export async function countPendingRequests() {
  const res = await databases.listDocuments(DATABASE_ID, COL, [
    Query.equal('status', 'pending'),
    Query.limit(1),
  ]);
  return res.total;
}

// ---- Approve a request (admin): creates account + profile + marks approved ----
export async function approveRequest(requestId, tempPassword) {
  const { ID: AppwriteID } = window.Appwrite;
  const { account } = await import('./appwrite.js');

  // Fetch the request
  const req = await databases.getDocument(DATABASE_ID, COL, requestId);

  // Validation
  if (!req.email || !req.name) {
    throw new Error('Email et nom sont requis');
  }

  if (req.status !== 'pending') {
    throw new Error(`Cette demande a déjà été ${req.status === 'approved' ? 'approuvée' : 'rejetée'}`);
  }

  // Check if account already exists
  let newUser = null;
  try {
    // Try to create the account
    newUser = await account.create(AppwriteID.unique(), req.email, tempPassword, req.name);
  } catch (error) {
    // If account already exists, try to use it (error code 409 = Conflict)
    if (error.code === 409 || (error.message && error.message.includes('already'))) {
      console.warn('[requests.js] Compte existe déjà pour', req.email);
      // Mark as approved anyway
      return databases.updateDocument(DATABASE_ID, COL, requestId, {
        status: 'approved',
      });
    }
    // For other errors, re-throw
    throw error;
  }

  // Auto-create the public profile (best-effort)
  try {
    await upsertProfile(
      { $id: newUser.$id, name: req.name, email: req.email },
      req.avatar_file_id || null
    );
  } catch { /* non-blocking */ }

  // Mark as approved
  return databases.updateDocument(DATABASE_ID, COL, requestId, {
    status: 'approved',
  });
}

// ---- Reject a request (admin) ----
export async function rejectRequest(requestId, reason = '') {
  return databases.updateDocument(DATABASE_ID, COL, requestId, {
    status: 'rejected',
  });
}

// ---- Delete a request (admin cleanup) ----
export async function deleteRequest(requestId) {
  return databases.deleteDocument(DATABASE_ID, COL, requestId);
}
