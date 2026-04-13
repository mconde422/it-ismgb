# Guide de configuration Appwrite — IT-ISMGB

## Informations du projet
- **Project ID** : `it-ismgb`
- **Database ID** : `it_ismgb_db`
- **URL Appwrite** : https://cloud.appwrite.io

---

## COLLECTION 1 : workspaces

**Attributs à créer dans l'ordre :**

| # | Attribut Key | Type | Taille | Requis | Défaut |
|---|---|---|---|---|---|
| 1 | name | String | 100 | ✅ Oui | — |
| 2 | description | String | 500 | ❌ Non | — |
| 3 | created_by | String | 36 | ✅ Oui | — |
| 4 | members | String[] | 36 | ✅ Oui | — |
| 5 | pending_invites | String[] | 254 | ❌ Non | — |
| 6 | color | String | 7 | ❌ Non | #2F81F7 |
| 7 | icon | String | 50 | ❌ Non | 💻 |
| 8 | created_at | DateTime | — | ✅ Oui | — |
| 9 | updated_at | DateTime | — | ✅ Oui | — |

**Permissions (Settings > Permissions) :**
```
Any  → Read
Users → Create, Update, Delete
```

---

## COLLECTION 2 : tasks

> ⚠️ `category` est désormais un **String** (pas Enum) — les catégories sont dynamiques.

**Attributs :**

| # | Attribut Key | Type | Taille/Détails | Requis |
|---|---|---|---|---|
| 1 | title | String | 200 | ✅ |
| 2 | description | String | 2000 | ❌ |
| 3 | status | Enum | todo, in_progress, blocked, done | ✅ |
| 4 | priority | Enum | critical, high, normal, low | ✅ |
| 5 | category | String | 100 | ✅ |
| 6 | visibility | Enum | private, group | ✅ |
| 7 | workspace_id | String | 36 | ❌ |
| 8 | creator_id | String | 36 | ✅ |
| 9 | assignee_id | String | 36 | ❌ |
| 10 | assignee_name | String | 100 | ❌ |
| 11 | due_date | DateTime | — | ❌ |
| 12 | due_time | String | 5 | ❌ |
| 13 | tags | String[] | 50 | ❌ |
| 14 | attachments | String[] | 36 | ❌ |
| 15 | created_at | DateTime | — | ✅ |
| 16 | updated_at | DateTime | — | ✅ |

**Permissions :**
```
Any  → Read
Users → Create, Update, Delete
```

**Index (onglet Indexes > Create Index) :**

| Index Key | Type | Attribut | Ordre |
|---|---|---|---|
| idx_creator | Key | creator_id | ASC |
| idx_workspace | Key | workspace_id | ASC |
| idx_assignee | Key | assignee_id | ASC |
| idx_status | Key | status | ASC |
| idx_due_date | Key | due_date | ASC |
| idx_created | Key | created_at | DESC |

---

## COLLECTION 3 : subtasks

**Attributs :**

| # | Attribut Key | Type | Taille | Requis |
|---|---|---|---|---|
| 1 | task_id | String | 36 | ✅ |
| 2 | title | String | 200 | ✅ |
| 3 | is_done | Boolean | — | ✅ |
| 4 | created_by | String | 36 | ✅ |
| 5 | created_at | DateTime | — | ✅ |

**Permissions :**
```
Any  → Read
Users → Create, Update, Delete
```

**Index :**
- `idx_task_id` → Key → `task_id` → ASC

---

## COLLECTION 4 : comments

**Attributs :**

| # | Attribut Key | Type | Taille | Requis |
|---|---|---|---|---|
| 1 | task_id | String | 36 | ✅ |
| 2 | author_id | String | 36 | ✅ |
| 3 | author_name | String | 100 | ✅ |
| 4 | author_avatar | String | 10 | ❌ |
| 5 | content | String | 2000 | ✅ |
| 6 | created_at | DateTime | — | ✅ |

**Permissions :**
```
Any  → Read
Users → Create, Update, Delete
```

**Index :**
- `idx_task_id` → Key → `task_id` → ASC

---

## COLLECTION 5 : activity_logs

**Attributs :**

| # | Attribut Key | Type | Taille | Requis |
|---|---|---|---|---|
| 1 | task_id | String | 36 | ✅ |
| 2 | workspace_id | String | 36 | ❌ |
| 3 | user_id | String | 36 | ✅ |
| 4 | user_name | String | 100 | ✅ |
| 5 | action | String | 50 | ✅ |
| 6 | old_value | String | 200 | ❌ |
| 7 | new_value | String | 200 | ❌ |
| 8 | created_at | DateTime | — | ✅ |

**Permissions :**
```
Any  → Read
Users → Create
```

**Index :**
- `idx_task_id` → Key → `task_id` → ASC

---

## COLLECTION 6 : user_requests

**Attributs :**

| # | Attribut Key | Type | Taille | Requis |
|---|---|---|---|---|
| 1 | name | String | 100 | ✅ |
| 2 | email | String | 254 | ✅ |
| 3 | department | String | 100 | ❌ |
| 4 | message | String | 500 | ❌ |
| 5 | avatar_file_id | String | 36 | ❌ |
| 6 | status | Enum | pending, approved, rejected | ✅ |
| 7 | reject_reason | String | 500 | ❌ |
| 8 | reviewed_at | DateTime | — | ❌ |
| 9 | created_at | DateTime | — | ✅ |

**Permissions :**
```
Any  → Create, Read
Users → Update, Delete
```

**Index :**
- `idx_email` → Key → `email` → ASC
- `idx_status` → Key → `status` → ASC

---

## COLLECTION 7 : profiles

**Attributs :**

| # | Attribut Key | Type | Taille | Requis |
|---|---|---|---|---|
| 1 | user_id | String | 36 | ✅ |
| 2 | name | String | 100 | ✅ |
| 3 | email | String | 254 | ✅ |
| 4 | department | String | 100 | ❌ |
| 5 | avatar_file_id | String | 36 | ❌ |
| 6 | created_at | DateTime | — | ✅ |
| 7 | updated_at | DateTime | — | ✅ |

**Permissions :**
```
Any  → Read
Users → Create, Update, Delete
```

**Index :**
- `idx_user_id` → Key → `user_id` → ASC (marquer comme **Unique**)

---

## COLLECTION 8 : categories

**Attributs :**

| # | Attribut Key | Type | Taille | Requis | Défaut |
|---|---|---|---|---|---|
| 1 | name | String | 100 | ✅ | — |
| 2 | slug | String | 100 | ✅ | — |
| 3 | color | String | 7 | ❌ | #58A6FF |
| 4 | is_default | Boolean | — | ✅ | false |
| 5 | created_by | String | 36 | ✅ | — |
| 6 | created_at | DateTime | — | ✅ | — |

**Permissions :**
```
Any  → Read
Users → Create, Update, Delete
```

**Index :**
- `idx_slug` → Key → `slug` → ASC
- `idx_default` → Key → `is_default` → ASC

> 💡 Les catégories par défaut (Réseau, Matériel, Logiciel, Maintenance, Graphisme) sont créées automatiquement au premier login admin via `seedDefaultCategories()`.

---

## STORAGE BUCKET : task_attachments

1. Storage → Create Bucket
2. **Name** : `Task Attachments`
3. **Bucket ID** : `task_attachments`
4. **Max file size** : 10 MB (10485760 bytes)
5. **Allowed extensions** : jpg, jpeg, png, gif, webp, pdf, doc, docx, xls, xlsx

**Permissions :**
```
Any  → Read
Users → Create, Update, Delete
```

---

## STORAGE BUCKET : avatars

1. Storage → Create Bucket
2. **Name** : `Avatars`
3. **Bucket ID** : `avatars`
4. **Max file size** : 2 MB (2097152 bytes)
5. **Allowed extensions** : jpg, jpeg, png, webp, gif

**Permissions :**
```
Any  → Create, Read
Users → Update, Delete
```

---

## AUTH : Créer le premier compte Admin

1. Auth → Users → Create User
2. Remplir :
   - **Email** : admin@ismgb.edu
   - **Password** : (choisir mot de passe fort)
   - **Name** : Administrateur ISMGB
3. Cliquer sur l'utilisateur créé → **Labels** → Add Label : `admin`

---

## VÉRIFICATION FINALE

Checklist avant de tester l'application :

- [ ] Projet Appwrite créé avec ID `it-ismgb`
- [ ] Plateforme Web `localhost` ajoutée
- [ ] Plateforme Web `mconde422.github.io` ajoutée
- [ ] Database `it_ismgb_db` créée
- [ ] Collection `workspaces` créée avec 9 attributs
- [ ] Collection `tasks` créée avec **16 attributs** + 6 index (`due_time` ajouté, `category` = String)
- [ ] Collection `subtasks` créée avec 5 attributs + 1 index
- [ ] Collection `comments` créée avec 6 attributs + 1 index
- [ ] Collection `activity_logs` créée avec 8 attributs + 1 index
- [ ] Collection `user_requests` créée avec 9 attributs + 2 index
- [ ] Collection `profiles` créée avec 7 attributs + 1 index unique
- [ ] Collection `categories` créée avec 6 attributs + 2 index
- [ ] Bucket `task_attachments` créé
- [ ] Bucket `avatars` créé
- [ ] Premier compte admin créé avec label `admin`
- [ ] Code poussé sur GitHub : https://github.com/mconde422/it-ismgb
- [ ] GitHub Pages activé (Settings → Pages → main branch)
- [ ] Site accessible : https://mconde422.github.io/it-ismgb

---

## MIGRATION : collection tasks existante

Si vous avez déjà créé la collection `tasks` avec `category` en type **Enum** :

1. Appwrite → `it_ismgb_db` → `tasks` → Attributes
2. Trouver `category` (Enum) → **Delete**
3. **Create Attribute** → String → Key: `category`, Size: 100, Required: ✅
4. Ajouter aussi : Key: `due_time`, Type: String, Size: 5, Required: ❌
