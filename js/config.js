// ============================================
// IT-ISMGB — Appwrite Configuration
// ============================================

export const APPWRITE_ENDPOINT   = 'https://cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = 'it-ismgb';
export const DATABASE_ID         = 'it_ismgb_db';

export const COLLECTIONS = {
  WORKSPACES   : 'workspaces',
  TASKS        : 'tasks',
  SUBTASKS     : 'subtasks',
  COMMENTS     : 'comments',
  ACTIVITY_LOGS: 'activity_logs',
  USERS_REQUESTS: 'users_requests',
  PROFILES     : 'profiles',
  CATEGORIES   : 'categories',
};

export const STORAGE_BUCKET_ID        = 'task_attachments';
export const STORAGE_AVATARS_BUCKET_ID = 'avatars';

// ---- Labels ----
export const STATUS_LABELS = {
  todo       : 'À faire',
  in_progress: 'En cours',
  blocked    : 'Bloqué',
  done       : 'Terminé',
};

export const PRIORITY_LABELS = {
  critical: 'Critique',
  high    : 'Haute',
  normal  : 'Normale',
  low     : 'Basse',
};

export const CATEGORY_LABELS = {
  reseau     : 'Réseau',
  materiel   : 'Matériel',
  logiciel   : 'Logiciel',
  maintenance: 'Maintenance',
  graphisme  : 'Graphisme',
};

export const VISIBILITY_LABELS = {
  private: 'Privée',
  group  : 'Groupe',
};

// ---- Emojis groupes ----
export const GROUP_EMOJIS = ['💻','🖥️','🔧','⚙️','🌐','📡','🔒','🛡️','📊','🖨️','📱','🔌','💾','🖱️','⌨️','🔑','📂','🗃️','📋','✅'];

// ---- Couleurs groupes ----
export const GROUP_COLORS = [
  '#2F81F7','#3FB950','#F85149','#D29922','#BC8CFF',
  '#58A6FF','#F0883E','#FF7B72','#56D364','#79C0FF',
];

// ---- Pagination ----
export const PAGE_SIZE = 25;
