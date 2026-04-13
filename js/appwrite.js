// ============================================
// IT-ISMGB — Appwrite Client Initialization
// ============================================

import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from './config.js';

const { Client, Account, Databases, Storage, Realtime, Query, ID, Permission, Role } =
  window.Appwrite;

// Singleton client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const account   = new Account(client);
const databases = new Databases(client);
const storage   = new Storage(client);

export { client, account, databases, storage, Query, ID, Permission, Role };
