# IT-ISMGB — Gestionnaire de Tâches IT

> Application web collaborative dédiée au service informatique de l'**Institut Supérieur de Management et de Gestion des Affaires de Bissau (ISMGB)**.

![Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS%20Vanilla-blue)
![Backend](https://img.shields.io/badge/Backend-Appwrite-fd366e)
![Mode](https://img.shields.io/badge/Theme-Dark%20%2F%20Light-blueviolet)
![Realtime](https://img.shields.io/badge/Realtime-Appwrite%20WebSocket-green)

---

## Sommaire

1. [Présentation](#1-présentation)
2. [Fonctionnalités](#2-fonctionnalités)
3. [Architecture & Stack](#3-architecture--stack)
4. [Prérequis](#4-prérequis)
5. [Installation Appwrite Cloud](#5-installation-appwrite-cloud)
6. [Configuration de la base de données](#6-configuration-de-la-base-de-données)
7. [Configuration du stockage](#7-configuration-du-stockage)
8. [Configuration du projet local](#8-configuration-du-projet-local)
9. [Lancement de l'application](#9-lancement-de-lapplication)
10. [Création du premier compte Admin](#10-création-du-premier-compte-admin)
11. [Guide d'utilisation](#11-guide-dutilisation)
12. [Rôles & Permissions](#12-rôles--permissions)
13. [Structure des fichiers](#13-structure-des-fichiers)
14. [Dépannage](#14-dépannage)
15. [FAQ](#15-faq)

---

## 1. Présentation

**IT-ISMGB** est une plateforme de gestion de tâches conçue pour une équipe de techniciens IT. Elle permet de :

- Gérer des **tâches privées** et des **tâches de groupe** en temps réel
- Organiser le travail en **groupes de travail** thématiques (Réseau, Matériel, Logiciel…)
- Visualiser les tâches en **vue Liste** ou **vue Kanban** avec drag & drop
- Suivre l'avancement via un **dashboard administrateur** avec graphiques
- Collaborer via des **commentaires** et un **historique d'activité** en temps réel
- Gérer les **pièces jointes** (images, PDF, documents)

---

## 2. Fonctionnalités

### Pour tous les membres
| Fonctionnalité | Description |
|---|---|
| ✅ Tâches privées | Créer, modifier, supprimer ses propres tâches |
| ✅ Groupes de travail | Créer et rejoindre des groupes, inviter des membres |
| ✅ Tâches de groupe | Gérer les tâches au sein d'un groupe |
| ✅ Vue Kanban | Glisser-déposer pour changer le statut d'une tâche |
| ✅ Sous-tâches | Créer des checklists de sous-tâches avec progression |
| ✅ Commentaires | Fil de discussion sur chaque tâche |
| ✅ Recherche | Recherche globale dans les tâches et groupes |
| ✅ Temps réel | Mises à jour instantanées sans rechargement |
| ✅ Dark / Light mode | Basculement de thème persistant |
| ✅ Responsive | Compatible mobile, tablette, desktop |

### Pour les administrateurs uniquement
| Fonctionnalité | Description |
|---|---|
| 🔐 Dashboard global | KPIs, graphiques, statistiques complètes |
| 🔐 Gestion membres | Créer des comptes, voir tous les membres |
| 🔐 Gestion groupes | Voir et supprimer tous les groupes |
| 🔐 Tâches en retard | Liste des tâches dépassant leur échéance |
| 🔐 Activité globale | Historique de toutes les actions de l'équipe |

---

## 3. Architecture & Stack

```
Frontend  : HTML5 / CSS3 / JavaScript Vanilla ES6+ (modules)
Backend   : Appwrite Cloud (Auth, Database, Storage, Realtime)
SDK       : Appwrite Web SDK v16 (chargé via CDN)
Fonts     : Plus Jakarta Sans + JetBrains Mono (Google Fonts)
Déploiement : Tout hébergeur statique (Nginx, Apache, GitHub Pages, Netlify…)
```

### Pourquoi pas de framework ?
L'application utilise du **JavaScript Vanilla avec modules ES6** (`import/export`). Cela garantit :
- Aucune dépendance npm à gérer
- Chargement ultra-rapide
- Maintenabilité simple pour une équipe IT

---

## 4. Prérequis

| Outil | Version minimale | Usage |
|---|---|---|
| Navigateur moderne | Chrome 90+, Firefox 88+, Edge 90+ | Exécution de l'app |
| Serveur HTTP local | n'importe lequel | Servir les fichiers (requis pour les modules ES6) |
| Compte Appwrite | Gratuit (Cloud) | Backend base de données |

> ⚠️ **Important** : L'application utilise des modules ES6 (`type="module"`). Elle **ne fonctionne pas** en ouvrant directement le fichier `index.html` avec `file://`. Un serveur HTTP local est obligatoire.

### Installer un serveur HTTP local (choisir une option)

**Option A — Extension VS Code (recommandée)**
Installez l'extension **Live Server** dans VS Code, puis clic droit sur `index.html` → *Open with Live Server*.

**Option B — Node.js `serve`**
```bash
npm install -g serve
cd it-ismgb
serve .
# Accès sur http://localhost:3000
```

**Option C — Python**
```bash
cd it-ismgb
python -m http.server 8080
# Accès sur http://localhost:8080
```

**Option D — PHP**
```bash
cd it-ismgb
php -S localhost:8080
# Accès sur http://localhost:8080
```

---

## 5. Installation Appwrite Cloud

### Étape 1 — Créer un compte Appwrite

1. Rendez-vous sur [cloud.appwrite.io](https://cloud.appwrite.io)
2. Cliquez sur **Sign Up** et créez votre compte
3. Vérifiez votre email

### Étape 2 — Créer un projet

1. Dans le tableau de bord Appwrite, cliquez sur **Create Project**
2. Renseignez :
   - **Project Name** : `IT-ISMGB`
   - **Project ID** : `it-ismgb` (ou laissez générer automatiquement)
3. Cliquez sur **Create**

### Étape 3 — Ajouter une plateforme Web

1. Dans votre projet, allez dans **Settings** → **Platforms**
2. Cliquez sur **Add Platform** → **Web**
3. Renseignez :
   - **Name** : `IT-ISMGB Web`
   - **Hostname** : `localhost` (pour le développement local)
4. Cliquez sur **Next** jusqu'à la fin

> 💡 Pour la production, ajoutez une deuxième plateforme avec votre vrai nom de domaine (ex: `it-ismgb.ismgb.edu`).

### Étape 4 — Récupérer les identifiants

Dans **Settings** → **Overview** de votre projet, notez :
- **Project ID** (ex: `6789abcdef123456`)
- **API Endpoint** : `https://cloud.appwrite.io/v1`

---

## 6. Configuration de la base de données

### Étape 1 — Créer la base de données

1. Dans Appwrite, allez dans **Databases** (menu gauche)
2. Cliquez sur **Create Database**
3. Renseignez :
   - **Name** : `IT-ISMGB DB`
   - **Database ID** : `it_ismgb_db` ← **exactement ce nom**
4. Cliquez sur **Create**

---

### Étape 2 — Créer les collections

Créez les 5 collections suivantes avec **exactement** ces IDs :

---

#### Collection `workspaces`

1. Dans la base de données, cliquez **Create Collection**
2. **Name** : `Workspaces` | **Collection ID** : `workspaces`
3. Ajoutez les attributs suivants :

| Attribut | Type | Taille | Requis | Défaut |
|---|---|---|---|---|
| `name` | String | 100 | ✅ | — |
| `description` | String | 500 | ❌ | — |
| `created_by` | String | 36 | ✅ | — |
| `members` | String[] | 36 | ✅ | `[]` |
| `pending_invites` | String[] | 254 | ❌ | `[]` |
| `color` | String | 7 | ❌ | `#2F81F7` |
| `icon` | String | 50 | ❌ | `💻` |
| `created_at` | DateTime | — | ✅ | — |
| `updated_at` | DateTime | — | ✅ | — |

**Permissions** (onglet Settings → Permissions) :
```
Role: Users → Read, Create, Update, Delete
```

---

#### Collection `tasks`

**Collection ID** : `tasks`

| Attribut | Type | Taille / Enum | Requis | Notes |
|---|---|---|---|---|
| `title` | String | 200 | ✅ | — |
| `description` | String | 2000 | ❌ | — |
| `status` | Enum | `todo,in_progress,blocked,done` | ✅ | — |
| `priority` | Enum | `critical,high,normal,low` | ✅ | — |
| `category` | Enum | `reseau,materiel,logiciel,maintenance,graphisme` | ✅ | — |
| `visibility` | Enum | `private,group` | ✅ | — |
| `workspace_id` | String | 36 | ❌ | Null si privée |
| `creator_id` | String | 36 | ✅ | — |
| `assignee_id` | String | 36 | ❌ | — |
| `assignee_name` | String | 100 | ❌ | — |
| `due_date` | DateTime | — | ❌ | — |
| `tags` | String[] | 50 | ❌ | — |
| `attachments` | String[] | 36 | ❌ | — |
| `created_at` | DateTime | — | ✅ | — |
| `updated_at` | DateTime | — | ✅ | — |

**Permissions** :
```
Role: Users → Read, Create, Update, Delete
```

**Index à créer** (onglet Indexes) :

| Clé | Type | Attribut | Ordre |
|---|---|---|---|
| `creator_id` | Key | `creator_id` | ASC |
| `workspace_id` | Key | `workspace_id` | ASC |
| `assignee_id` | Key | `assignee_id` | ASC |
| `status` | Key | `status` | ASC |
| `due_date` | Key | `due_date` | ASC |
| `created_at` | Key | `created_at` | DESC |

---

#### Collection `subtasks`

**Collection ID** : `subtasks`

| Attribut | Type | Taille | Requis |
|---|---|---|---|
| `task_id` | String | 36 | ✅ |
| `title` | String | 200 | ✅ |
| `is_done` | Boolean | — | ✅ |
| `created_by` | String | 36 | ✅ |
| `created_at` | DateTime | — | ✅ |

**Permissions** :
```
Role: Users → Read, Create, Update, Delete
```

**Index** : `task_id` (Key, ASC)

---

#### Collection `comments`

**Collection ID** : `comments`

| Attribut | Type | Taille | Requis |
|---|---|---|---|
| `task_id` | String | 36 | ✅ |
| `author_id` | String | 36 | ✅ |
| `author_name` | String | 100 | ✅ |
| `author_avatar` | String | 10 | ❌ |
| `content` | String | 2000 | ✅ |
| `created_at` | DateTime | — | ✅ |

**Permissions** :
```
Role: Users → Read, Create, Update, Delete
```

**Index** : `task_id` (Key, ASC)

---

#### Collection `activity_logs`

**Collection ID** : `activity_logs`

| Attribut | Type | Taille | Requis |
|---|---|---|---|
| `task_id` | String | 36 | ✅ |
| `workspace_id` | String | 36 | ❌ |
| `user_id` | String | 36 | ✅ |
| `user_name` | String | 100 | ✅ |
| `action` | String | 50 | ✅ |
| `old_value` | String | 200 | ❌ |
| `new_value` | String | 200 | ❌ |
| `created_at` | DateTime | — | ✅ |

**Permissions** :
```
Role: Users → Read, Create
```

**Index** : `task_id` (Key, ASC)

---

## 7. Configuration du stockage

### Créer le bucket de pièces jointes

1. Dans Appwrite, allez dans **Storage** (menu gauche)
2. Cliquez sur **Create Bucket**
3. Renseignez :
   - **Name** : `Task Attachments`
   - **Bucket ID** : `task_attachments` ← **exactement ce nom**
4. Dans les paramètres du bucket :
   - **Maximum File Size** : `10 MB`
   - **Allowed File Extensions** : `jpg, jpeg, png, gif, webp, pdf, doc, docx, xls, xlsx`
5. **Permissions** :
   ```
   Role: Users → Read, Create, Update, Delete
   ```

---

## 8. Configuration du projet local

### Étape 1 — Télécharger / cloner le projet

Si vous avez les fichiers en local :
```bash
# Les fichiers sont dans :
C:\Users\CONDE\Desktop\IT\it-ismgb\
```

### Étape 2 — Modifier `js/config.js`

Ouvrez le fichier [js/config.js](js/config.js) et remplacez les valeurs :

```javascript
// AVANT (valeurs par défaut)
export const APPWRITE_ENDPOINT   = 'https://cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = 'YOUR_PROJECT_ID';  // ← À MODIFIER
export const DATABASE_ID         = 'it_ismgb_db';
```

```javascript
// APRÈS (vos vraies valeurs)
export const APPWRITE_ENDPOINT   = 'https://cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = '6789abcdef123456';  // ← Votre Project ID
export const DATABASE_ID         = 'it_ismgb_db';
```

> Le `DATABASE_ID` et les noms de collections **ne changent pas** si vous avez suivi exactement les instructions ci-dessus.

### Vérification de la configuration

Votre `config.js` final doit ressembler à :

```javascript
export const APPWRITE_ENDPOINT   = 'https://cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = 'votre-project-id-ici';
export const DATABASE_ID         = 'it_ismgb_db';

export const COLLECTIONS = {
  WORKSPACES   : 'workspaces',
  TASKS        : 'tasks',
  SUBTASKS     : 'subtasks',
  COMMENTS     : 'comments',
  ACTIVITY_LOGS: 'activity_logs',
};

export const STORAGE_BUCKET_ID = 'task_attachments';
// ... reste du fichier inchangé
```

---

## 9. Lancement de l'application

### Via VS Code Live Server (recommandé)

1. Ouvrez le dossier `it-ismgb` dans VS Code
2. Clic droit sur `index.html` dans l'explorateur
3. Sélectionnez **"Open with Live Server"**
4. L'application s'ouvre sur `http://127.0.0.1:5500`

### Via la ligne de commande

```bash
# Node.js
cd C:\Users\CONDE\Desktop\IT\it-ismgb
npx serve .
# → http://localhost:3000

# Python
cd C:\Users\CONDE\Desktop\IT\it-ismgb
python -m http.server 8080
# → http://localhost:8080

# PHP
cd C:\Users\CONDE\Desktop\IT\it-ismgb
php -S localhost:8080
# → http://localhost:8080
```

---

## 10. Création du premier compte Admin

Le premier compte doit être créé **directement dans Appwrite**, puis son label `admin` doit être ajouté manuellement.

### Étape 1 — Créer le compte via l'app

1. Accédez à `http://localhost:PORT`
2. Vous êtes redirigé vers la page de connexion
3. **Il n'y a pas de bouton "S'inscrire" public** — les comptes sont créés par un admin
4. Pour le **tout premier compte**, utilisez Appwrite directement

### Étape 2 — Créer l'utilisateur dans Appwrite

1. Dans Appwrite, allez dans **Auth** → **Users**
2. Cliquez sur **Create User**
3. Renseignez :
   - **User ID** : laisser auto-généré
   - **Email** : `admin@ismgb.edu`
   - **Password** : choisissez un mot de passe fort (min. 8 caractères)
   - **Name** : `Administrateur`
4. Cliquez sur **Create**

### Étape 3 — Attribuer le rôle Admin

1. Dans **Auth** → **Users**, cliquez sur l'utilisateur créé
2. Faites défiler jusqu'à la section **Labels**
3. Cliquez sur **Add Label**
4. Tapez `admin` et appuyez sur Entrée
5. Cliquez sur **Update**

### Étape 4 — Se connecter

1. Retournez sur l'application
2. Connectez-vous avec `admin@ismgb.edu` et votre mot de passe
3. Vous avez maintenant accès au **Dashboard** et à l'**Administration**

### Créer les comptes des membres

Une fois connecté en admin :
1. Allez dans **Administration** (menu gauche)
2. Cliquez sur **Créer un compte**
3. Renseignez le nom, email, mot de passe et rôle du membre
4. Le compte est créé — partagez les identifiants au technicien

---

## 11. Guide d'utilisation

### Page de connexion (`index.html`)

- Entrez votre **email** et **mot de passe**
- Cliquez sur **Se connecter**
- Redirection automatique vers "Mes tâches" si déjà connecté
- Bouton de changement de thème visible en haut à droite

---

### Mes tâches (`my-tasks.html`)

**Créer une tâche privée :**
1. Cliquez sur **+ Nouvelle tâche** (haut à droite)
2. Renseignez le titre, la catégorie, la priorité et le statut (obligatoires)
3. Ajoutez optionnellement une description, une date d'échéance et des tags
4. Cliquez sur **Créer la tâche**

**Changer la vue :**
- Boutons **Liste / Kanban** en haut à droite des filtres
- En vue Kanban, **glissez-déposez** les cartes pour changer leur statut

**Filtrer les tâches :**
- Utilisez les menus déroulants : Statut, Priorité, Catégorie, Tri
- Les filtres s'appliquent en temps réel

**Modifier une tâche :**
- Cliquez sur l'icône ✏️ sur la carte
- Ou cliquez sur la carte pour ouvrir le détail complet

**Supprimer une tâche :**
- Cliquez sur l'icône 🗑️ → confirmation requise

**Indicateurs :**
- 🔴 Tâche en **retard** : fond rouge subtil
- Compteurs en haut : À faire / En cours / Bloqué / Terminé

---

### Mes groupes (`groups.html`)

**Créer un groupe :**
1. Cliquez sur **+ Créer un groupe**
2. Choisissez un nom, une description optionnelle, un emoji et une couleur
3. Vous devenez automatiquement **Owner** du groupe

**Rejoindre un groupe :**
- Un admin ou owner doit vous inviter par email

**Accéder à un groupe :**
- Cliquez sur la card du groupe → page de détail

---

### Détail d'un groupe (`group-detail.html`)

**Onglet Tâches :**
- Créez des tâches de groupe avec **+ Nouvelle tâche**
- Assignez les tâches à des membres du groupe
- Basculez entre vue Liste et Kanban
- Les modifications des autres membres apparaissent **en temps réel** (toast de notification)

**Onglet Membres :**
- Voir la liste des membres avec leur rôle
- **Inviter** un nouveau membre (bouton visible si owner/admin)
- **Retirer** un membre (owner/admin uniquement)

**Onglet Activité :**
- Fil chronologique de toutes les actions dans le groupe

---

### Détail d'une tâche (`task-detail.html`)

**Éditer le titre / description :**
- Cliquez directement dans le champ — édition inline
- Cliquez sur **Sauvegarder** pour confirmer

**Panneau de droite (métadonnées) :**
- Changez le statut, la priorité, la catégorie directement depuis les menus
- Chaque modification est sauvegardée et loguée immédiatement

**Sous-tâches :**
- Cliquez sur **Ajouter** pour créer une sous-tâche
- Cochez/décochez pour marquer comme complétée
- La barre de progression se met à jour automatiquement

**Commentaires :**
- Tapez dans la zone de texte et appuyez sur **Entrée** (ou cliquez Envoyer)
- Vos commentaires peuvent être supprimés
- Les commentaires des autres membres arrivent **en temps réel**

**Marquer comme terminé :**
- Cliquez sur le bouton **Marquer terminée** (visible si statut ≠ done)
- Ou changez le statut dans le panneau de droite

---

### Recherche (`search.html`)

- Tapez au moins **2 caractères** — résultats en temps réel (300ms)
- Les résultats sont groupés : **Tâches** puis **Groupes**
- Les termes recherchés sont **surlignés** dans les résultats
- Filtrez par statut et catégorie pour affiner

---

### Dashboard Admin (`dashboard.html`)

> Accessible uniquement aux administrateurs.

- **KPIs** : 8 indicateurs clés (total, en cours, bloquées, terminées, en retard, groupes, membres, critiques)
- **Graphique barres** : distribution des tâches par catégorie
- **Graphique donut** : répartition par statut avec légende
- **Tâches en retard** : liste cliquable des tâches dépassées
- **Activité récente** : 15 dernières actions globales

---

### Administration (`admin.html`)

> Accessible uniquement aux administrateurs.

**Onglet Membres :**
- Liste de tous les membres présents dans les groupes
- Barre de recherche par nom ou email
- Bouton **Créer un compte** pour ajouter un nouveau technicien

**Onglet Groupes :**
- Tableau de tous les groupes avec owner, nb membres, date de création
- Lien **Voir** pour accéder au groupe
- Bouton **Supprimer** (avec confirmation) pour supprimer un groupe et toutes ses tâches

---

## 12. Rôles & Permissions

### Rôles globaux

| Action | Admin | Membre |
|---|---|---|
| Créer un compte utilisateur | ✅ | ❌ |
| Accéder au Dashboard global | ✅ | ❌ |
| Accéder à la page Administration | ✅ | ❌ |
| Supprimer n'importe quel groupe | ✅ | ❌ |
| Modifier/supprimer n'importe quelle tâche | ✅ | ❌ |
| Créer des tâches privées | ✅ | ✅ |
| Créer des tâches de groupe | ✅ | ✅ |
| Créer un groupe de travail | ✅ | ✅ |
| Modifier/supprimer ses propres tâches | ✅ | ✅ |
| Rechercher dans les tâches | ✅ | ✅ |

### Rôle Owner de groupe

Un membre qui **crée un groupe** en devient automatiquement **Owner**. Cela lui permet :
- D'inviter des membres dans ce groupe
- De retirer des membres de ce groupe
- De supprimer ce groupe

Sans être administrateur global.

### Attribuer le rôle Admin

Le rôle Admin s'attribue via **Appwrite** → Auth → Users → Labels → `admin`.
Cette opération ne peut être faite que par un administrateur Appwrite (propriétaire du projet).

---

## 13. Structure des fichiers

```
it-ismgb/
│
├── index.html              ← Page de connexion
├── dashboard.html          ← Dashboard admin (KPIs + graphiques)
├── my-tasks.html           ← Tâches privées (liste + kanban)
├── groups.html             ← Liste des groupes de travail
├── group-detail.html       ← Détail d'un groupe (temps réel)
├── task-detail.html        ← Détail complet d'une tâche
├── search.html             ← Recherche globale
├── admin.html              ← Gestion membres & groupes (admin)
│
├── css/
│   ├── variables.css       ← Tokens CSS dark/light (couleurs, typo, spacing)
│   ├── base.css            ← Reset, typographie, utilitaires
│   ├── layout.css          ← Sidebar, header, zone principale, responsive
│   ├── components.css      ← Boutons, badges, cards, modals, toasts, tabs
│   ├── forms.css           ← Inputs, selects, checkboxes, tags
│   ├── kanban.css          ← Vue Kanban + drag & drop
│   └── dashboard.css       ← Graphiques et statistiques
│
├── js/
│   ├── config.js           ← ⚙️ Constantes Appwrite (à modifier)
│   ├── appwrite.js         ← Initialisation SDK Appwrite
│   ├── auth.js             ← Login, logout, guards de page
│   ├── tasks.js            ← CRUD tâches + sous-tâches
│   ├── workspaces.js       ← CRUD groupes, invitations
│   ├── comments.js         ← Ajout/suppression commentaires
│   ├── activity.js         ← Logs d'activité
│   ├── realtime.js         ← Souscriptions WebSocket Appwrite
│   ├── search.js           ← Recherche et filtres client-side
│   ├── ui.js               ← Toasts, modals, renderers, SVG icons
│   ├── theme.js            ← Dark/light mode + persistance
│   └── utils.js            ← Utilitaires (dates, strings, DOM…)
│
└── assets/
    ├── logo.svg            ← Logo IT-ISMGB (dark mode)
    └── logo-dark.svg       ← Logo IT-ISMGB (light mode)
```

---

## 14. Dépannage

### ❌ "Failed to fetch" ou erreur CORS au login

**Cause** : Le Project ID dans `config.js` est incorrect, ou la plateforme Web n'a pas été ajoutée dans Appwrite.

**Solution** :
1. Vérifiez que `APPWRITE_PROJECT_ID` dans `config.js` correspond exactement au Project ID dans Appwrite → Settings → Overview
2. Dans Appwrite → Settings → Platforms, ajoutez une plateforme Web avec hostname `localhost`
3. Vérifiez que l'URL de votre serveur local correspond (ex: `localhost` et non `127.0.0.1`)

---

### ❌ La page reste blanche ou ne charge pas

**Cause** : Les modules ES6 ne fonctionnent pas avec le protocole `file://`.

**Solution** : Vous devez obligatoirement utiliser un serveur HTTP local (voir [section 4](#4-prérequis)).

---

### ❌ "Collection not found" ou erreur 404 sur les requêtes

**Cause** : Les IDs de collections ne correspondent pas.

**Solution** : Vérifiez dans Appwrite → Databases → votre DB que les Collection IDs sont **exactement** :
- `workspaces`
- `tasks`
- `subtasks`
- `comments`
- `activity_logs`

Et que le Database ID est `it_ismgb_db`.

---

### ❌ "Unauthorized" lors de la création de documents

**Cause** : Les permissions des collections sont mal configurées.

**Solution** : Pour chaque collection, dans l'onglet **Settings → Permissions** :
```
Role: Users → Read ✅  Create ✅  Update ✅  Delete ✅
```

---

### ❌ Le realtime ne fonctionne pas (pas de mises à jour en direct)

**Cause** : Les souscriptions WebSocket nécessitent que les permissions de lecture soient correctes.

**Solution** :
1. Vérifiez que la collection `tasks` a les permissions `Read` pour `users`
2. Ouvrez la console du navigateur (F12) et cherchez des erreurs WebSocket
3. Vérifiez votre connexion internet (le realtime d'Appwrite Cloud utilise des WebSockets)

---

### ❌ Je ne vois pas le menu Dashboard/Administration

**Cause** : Votre compte n'a pas le label `admin`.

**Solution** :
1. Connectez-vous à [cloud.appwrite.io](https://cloud.appwrite.io) avec votre compte Appwrite (propriétaire du projet)
2. Allez dans **Auth** → **Users**
3. Cliquez sur votre utilisateur
4. Dans **Labels**, ajoutez `admin`
5. Reconnectez-vous à l'application

---

### ❌ Le drag & drop Kanban ne fonctionne pas sur mobile

**Cause** : L'API HTML5 Drag and Drop ne supporte pas les événements tactiles nativement.

**Solution** : Le drag & drop fonctionne sur desktop. Sur mobile, changez le statut via la page de détail de la tâche (panneau de droite → Statut).

---

### ❌ Les fonts ne se chargent pas (texte en police système)

**Cause** : Pas de connexion internet ou Google Fonts bloqué.

**Solution** : Téléchargez les fonts localement depuis [fonts.google.com](https://fonts.google.com) et mettez à jour les imports dans `variables.css`.

---

## 15. FAQ

**Q : Peut-on utiliser Appwrite en self-hosted plutôt que Cloud ?**

Oui. Installez Appwrite sur votre serveur (Docker), puis remplacez dans `config.js` :
```javascript
export const APPWRITE_ENDPOINT = 'https://votre-serveur.com/v1';
```

---

**Q : Comment changer la langue de l'interface ?**

L'interface est entièrement en **français**. Pour changer, modifiez les textes dans chaque fichier HTML et dans `config.js` (les labels `STATUS_LABELS`, `PRIORITY_LABELS`, `CATEGORY_LABELS`).

---

**Q : Peut-on héberger l'application en production ?**

Oui. Copiez tout le dossier `it-ismgb` sur n'importe quel hébergeur de fichiers statiques :
- **Nginx / Apache** : copiez dans `/var/www/html/it-ismgb`
- **Netlify / Vercel** : glissez-déposez le dossier
- **GitHub Pages** : poussez sur un repo GitHub

N'oubliez pas d'ajouter votre domaine de production dans les **Platforms** d'Appwrite.

---

**Q : Comment sauvegarder les données ?**

Dans Appwrite Cloud, les données sont sauvegardées automatiquement. Pour une export manuelle : Appwrite → votre Database → Export (disponible dans les plans payants).

---

**Q : Combien d'utilisateurs l'application peut-elle gérer ?**

Le plan gratuit d'Appwrite Cloud inclut :
- 75 000 requêtes/mois
- 500 utilisateurs actifs
- 5 Go de stockage

Pour 30 techniciens avec une utilisation normale, le plan gratuit est largement suffisant.

---

**Q : Comment ajouter une nouvelle catégorie de tâche ?**

1. Dans Appwrite → Collection `tasks` → attribut `category` → modifiez l'Enum pour ajouter la valeur
2. Dans `js/config.js`, ajoutez la entrée dans `CATEGORY_LABELS`
3. Dans `css/variables.css`, ajoutez la couleur `--cat-NOM`
4. Dans `css/components.css`, ajoutez les classes `.badge-cat-NOM` et `.task-card.cat-NOM`

---

## Informations de contact

**Projet** : IT-ISMGB Task Manager
**Institution** : Institut Supérieur de Management et de Gestion des Affaires de Bissau
**Service** : Direction des Systèmes d'Information — Service Informatique
**Stack** : HTML · CSS · JavaScript Vanilla · Appwrite
**Version** : 1.0.0

---

*Documentation générée pour le projet IT-ISMGB — Tous droits réservés © 2025 ISMGB*
