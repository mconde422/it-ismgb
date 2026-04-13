// ============================================
// IT-ISMGB — User Profiles
// ============================================

import { databases, storage, Query, ID } from './appwrite.js';
import {
  DATABASE_ID, COLLECTIONS,
  APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID,
  STORAGE_AVATARS_BUCKET_ID,
} from './config.js';

// ---- Upsert profile on login (fire-and-forget) ----
export async function upsertProfile(user, avatarFileId = null) {
  try {
    const existing = await getProfileByUserId(user.$id);
    const now = new Date().toISOString();

    if (existing) {
      const updates = {
        name      : user.name || user.email,
        email     : user.email,
        updated_at: now,
      };
      if (avatarFileId) updates.avatar_file_id = avatarFileId;
      return databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, existing.$id, updates);
    } else {
      return databases.createDocument(DATABASE_ID, COLLECTIONS.PROFILES, ID.unique(), {
        user_id       : user.$id,
        name          : user.name || user.email,
        email         : user.email,
        department    : null,
        avatar_file_id: avatarFileId || null,
        created_at    : now,
        updated_at    : now,
      });
    }
  } catch (e) {
    // Profile is secondary — never crash the app for this
    console.warn('[profiles] upsert failed:', e?.message);
  }
}

// ---- Get one profile by user ID ----
export async function getProfileByUserId(userId) {
  try {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
      Query.equal('user_id', userId),
      Query.limit(1),
    ]);
    return res.documents[0] || null;
  } catch { return null; }
}

// ---- Get all profiles (for member picker) ----
export async function getAllProfiles() {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
    Query.orderAsc('name'),
    Query.limit(500),
  ]);
  return res.documents;
}

// ---- Update department on profile ----
export async function updateProfileDepartment(profileId, department) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profileId, {
    department,
    updated_at: new Date().toISOString(),
  });
}

// ---- Build avatar preview URL ----
export function getAvatarUrl(fileId, size = 80) {
  if (!fileId) return null;
  return `${APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_AVATARS_BUCKET_ID}/files/${fileId}/preview`
       + `?project=${APPWRITE_PROJECT_ID}&width=${size}&height=${size}&gravity=center&borderRadius=100`;
}

// ---- Upload avatar to storage ----
export async function uploadAvatar(file) {
  const res = await storage.createFile(STORAGE_AVATARS_BUCKET_ID, ID.unique(), file);
  return res.$id;
}
