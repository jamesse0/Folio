# VibeFrame

A self-hosted photographer portfolio platform. Photographers create private portfolios, share them via access codes, and organize their work using AI-powered face detection, scene recognition, and custom vibe/style classification — all running locally with no third-party API costs.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Database Schema](#database-schema)
5. [User Flow Diagrams](#user-flow-diagrams)
6. [Feature List](#feature-list)
7. [API Reference](#api-reference)
8. [ML Pipeline](#ml-pipeline)
9. [Security](#security)
10. [Local Setup Guide](#local-setup-guide)
11. [Design Notes](#design-notes)
12. [Roadmap](#roadmap)

---

## Project Overview

VibeFrame lets photographers:
- Create a private account and upload photos with captions
- Share their portfolio via a unique 8-character access code
- Organize photos using albums, face grouping, scene detection, and custom vibe/style categories
- Control visibility — portfolios are private by default; the access code is the only key

Viewers with a valid code can browse and filter the portfolio but cannot modify anything.

---

## Architecture

```
[Browser]
    |
    | HTTPS
    v
[Cloudflare Tunnel] ──► [React SPA          – Vite,    port 5173]
                    ──► [FastAPI Backend     – Uvicorn, port 8000, localhost only]
                                  |
                        ┌─────────┴──────────┐
                        ▼                    ▼
                 [PostgreSQL DB]    [Local Filesystem]
                 (metadata, auth,   (original images +
                  ML results)        thumbnails)
                        |
                        ▼
                 [ML Background Tasks]
                 • DeepFace   – face detection & embedding
                 • CLIP       – scene/place classification & vibe embeddings
                 • KNN / SVM  – custom vibe classifier (trained per user)
```

The Cloudflare Tunnel provides public HTTPS access to the locally hosted server with no port forwarding or cloud infrastructure required. FastAPI is bound to `127.0.0.1` only and is unreachable except through the tunnel.

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + Vite | Fast builds, large ecosystem, component-based UI |
| Styling | Tailwind CSS | Utility-first, consistent design without a heavy framework |
| Backend | FastAPI (Python) | Async-native, automatic OpenAPI docs, native ML library support |
| ORM | SQLAlchemy + Alembic | Robust schema management and migrations |
| Database | PostgreSQL | Relational integrity for users, photos, albums, ML results |
| Image processing | Pillow | Thumbnail generation, EXIF stripping, image validation |
| Face ML | DeepFace + DBSCAN | Local face embedding and unsupervised clustering |
| Scene/Vibe ML | OpenCLIP (ViT-B/32) | General-purpose image embeddings, ~350 MB, CPU-capable |
| Vibe classifier | scikit-learn KNN/SVM | Trained on CLIP embeddings from manually labeled photos |
| Auth | python-jose + passlib | JWT token signing, bcrypt password hashing |
| Tunnel | Cloudflare Tunnel | Public HTTPS access to locally hosted server, free tier |

---

## Database Schema

```mermaid
erDiagram
    users {
        int id PK
        string username UK
        string password_hash
        string name
        string bio
        string avatar_path
        string portfolio_code UK
        timestamp created_at
        timestamp deleted_at
    }

    photos {
        int id PK
        int user_id FK
        string file_path
        string thumbnail_path
        string original_filename
        string caption
        timestamp uploaded_at
    }

    albums {
        int id PK
        int user_id FK
        string name
        timestamp created_at
    }

    photo_albums {
        int photo_id FK
        int album_id FK
    }

    face_clusters {
        int id PK
        int user_id FK
        string cluster_label
        int size
        string representative_thumbnail_path
    }

    photo_face_clusters {
        int photo_id FK
        int face_cluster_id FK
        float similarity_score
    }

    place_tags {
        int id PK
        int photo_id FK
        string tag
    }

    vibe_labels {
        int id PK
        int user_id FK
        string name
        int labeled_photo_count
    }

    photo_vibes {
        int photo_id FK
        int vibe_label_id FK
        bool is_manual
        float confidence
    }

    vibe_models {
        int id PK
        int user_id FK
        string model_blob_path
        timestamp trained_at
        int version
    }

    users ||--o{ photos : uploads
    users ||--o{ albums : owns
    users ||--o{ face_clusters : has
    users ||--o{ vibe_labels : defines
    users ||--o{ vibe_models : trains
    photos ||--o{ photo_albums : in
    albums ||--o{ photo_albums : contains
    photos ||--o{ photo_face_clusters : tagged_with
    face_clusters ||--o{ photo_face_clusters : groups
    photos ||--o{ place_tags : has
    photos ||--o{ photo_vibes : classified_as
    vibe_labels ||--o{ photo_vibes : defines
```

---

## User Flow Diagrams

### 1. Photographer Auth Flow

```mermaid
flowchart TD
    A[Landing Page] --> B{User Choice}
    B -->|Login| C[Username + Password Form]
    B -->|Register| D[Register Form]
    B -->|View Portfolio| E[Enter Portfolio Code]
    C --> F{Valid Credentials?}
    F -->|No| C
    F -->|Yes| G{Any vibe label below threshold?}
    G -->|Yes| H[Show degradation toast - dismissible]
    G -->|No| I[Dashboard]
    H --> I
    D --> I
```

### 2. Photo Upload & ML Pipeline

```mermaid
flowchart TD
    A[Click Upload] --> B[Select Image from Disk]
    B --> C[Add Caption - optional]
    C --> D[POST /photos]
    D --> E{Validation}
    E -->|Not an image or exceeds 25 MB| F[Reject with error message]
    E -->|Pass| G[Rename to UUID\nStrip EXIF\nSave original + thumbnail]
    G --> H[200 OK - Photo appears in gallery]
    G --> I[Background ML Task spawned]
    I --> J[DeepFace: detect + embed faces]
    I --> K[CLIP: classify scene and place]
    I --> L{Vibe model trained?}
    L -->|Yes| M[Run classifier - store vibe prediction]
    L -->|No| N[Skip vibe tagging]
    J --> O[DBSCAN cluster\nassign face_cluster_id + similarity score]
    K --> P[Store place_tags]
```

### 3. Vibe Setup Wizard

```mermaid
flowchart TD
    A[User opens Vibe sort] --> B{Vibes already set up?}
    B -->|Yes| C[Show gallery sorted by vibe]
    B -->|No| D[Vibe Creation UI]
    D --> E[User enters vibe names\ne.g. Golden Hour - Urban - Wild]
    E --> F[System queues labeling session]
    F --> G[Show photo - Which vibe does this belong to?]
    G --> H{Min 5 labels per vibe met?}
    H -->|No| G
    H -->|Yes| I[POST /vibes/train]
    I --> J[Extract CLIP embeddings for labeled photos]
    J --> K[Train KNN/SVM classifier]
    K --> L[Run on all unlabeled photos - store predictions]
    L --> C
```

### 4. Viewer Flow

```mermaid
flowchart TD
    A[Landing Page] --> B[Enter 8-char Portfolio Code]
    B --> C{Code valid?}
    C -->|No| D[Error: invalid or expired code]
    C -->|Yes| E[Load Viewer Gallery - read only]
    E --> F[Browse and filter photos]
    F --> G{Filter type}
    G -->|Albums| H[Filter by album]
    G -->|Face| I[Group by face cluster\nthreshold-filtered]
    G -->|Place| J[Group by scene tag]
    G -->|Vibe| K{Vibes trained by owner?}
    K -->|Yes| L[Filter by vibe]
    K -->|No| M[Option disabled]
    F --> N[Click photo - enlarged view]
    N --> O[See caption + vibe label\nread only - no editing]
```

---

## Feature List

### Authentication
- [x] Register with unique username + password
- [x] Login with JWT session
- [x] Logout (client-side token discard)
- [ ] Admin password reset via DB (no self-service recovery in v1)

### Photo Management
- [x] Upload photos with optional caption (max 25 MB)
- [x] View all photos, newest-first, in a masonry/grid layout
- [x] Edit caption on any photo
- [x] Delete individual photos

### Portfolio Sharing
- [x] Unique 8-character alphanumeric access code per photographer
- [x] Share code with confirmation dialog
- [x] Regenerate code (invalidates previous code for all viewers)
- [x] Rate-limited public portfolio endpoint

### Albums
- [x] Create albums
- [x] Assign photos to albums
- [x] Rename albums
- [x] Delete albums
- [x] Filter gallery by album

### Sorting & Filtering
- [x] Face grouping (photos clustered by detected faces, threshold-filtered)
- [x] Place/scene detection (beach, mountains, urban, forest, etc.)
- [x] Vibe/style categories (custom, user-defined, ML-classified)

### Vibe Classification
- [x] Vibe creation wizard (name vibes → manually label photos → train model)
- [x] Minimum 5 manually-labeled photos per vibe before training
- [x] Auto-classify unlabeled photos after training
- [x] Manual reclassification of individual photos
- [x] Warning icon on vibes below the training threshold
- [x] Dismissible toast notification (once per session) when vibe quality degrades

### Image Viewing
- [x] Enlarged image detail view
- [x] Caption display (editable for photographer, read-only for viewer)
- [x] Vibe label display (reclassifiable for photographer, read-only for viewer)
- [x] Arrow navigation between photos

### Profile
- [x] Edit display name, bio, avatar photo
- [x] GDPR-style account deletion (purges all photos, albums, ML data, and account)

### Viewer Experience
- [x] Anonymous access via portfolio code (no account required)
- [x] Full filter functionality (face, place, album, vibe) in read-only mode
- [x] Vibe filter disabled if photographer has not completed vibe setup

---

## API Reference

### Auth — `/auth`

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register with unique username + password |
| POST | `/auth/login` | Login; returns JWT + vibe degradation flag |
| POST | `/auth/logout` | Client discards token |

### Photos — `/photos`

| Method | Path | Description |
|---|---|---|
| GET | `/photos` | All photos for authenticated user, paginated, newest-first |
| GET | `/photos?album_id={id}` | Filter by album |
| GET | `/photos?cluster_id={id}` | Filter by face cluster (threshold-enforced) |
| GET | `/photos?place_tag={tag}` | Filter by scene tag |
| GET | `/photos?vibe_id={id}` | Filter by vibe label |
| POST | `/photos` | Upload image + caption; triggers async ML analysis |
| PATCH | `/photos/{id}` | Update caption |
| DELETE | `/photos/{id}` | Delete photo + associated ML data |

### Albums — `/albums`

| Method | Path | Description |
|---|---|---|
| GET | `/albums` | List all albums for authenticated user |
| POST | `/albums` | Create album |
| PATCH | `/albums/{id}` | Rename album |
| DELETE | `/albums/{id}` | Delete album |
| PUT | `/albums/{id}/photos` | Set photo membership for an album |

### Portfolio / Sharing — `/portfolio`

| Method | Path | Description |
|---|---|---|
| GET | `/portfolio/code` | Returns current 8-char access code |
| POST | `/portfolio/code/regenerate` | Generates new code, invalidates old |
| GET | `/portfolio/{code}` | Public endpoint — returns portfolio data if code is valid. Rate limited. |

### ML & Vibes — `/ml`, `/vibes`

| Method | Path | Description |
|---|---|---|
| GET | `/ml/faces` | Returns face clusters meeting size (≥3) + similarity thresholds |
| GET | `/ml/places` | Returns place tag summary for user's photos |
| POST | `/vibes/setup` | Initialize vibe labels and start labeling session |
| GET | `/vibes/label-queue` | Returns next batch of photos for manual labeling |
| POST | `/vibes/label` | Submit a manual label for a photo; updates `labeled_photo_count` |
| POST | `/vibes/train` | Train classifier (requires ≥5 labels per vibe) |
| PATCH | `/vibes/photo/{id}` | Manually reclassify a single photo's vibe |

### Profile — `/profile`

| Method | Path | Description |
|---|---|---|
| GET | `/profile` | Get profile data |
| PATCH | `/profile` | Update name, bio, avatar |
| DELETE | `/profile` | GDPR purge — deletes all photos, albums, ML data, and account |

---

## ML Pipeline

### Face Grouping (DeepFace + DBSCAN)

1. On photo upload, DeepFace detects all faces in the image and produces a numeric embedding for each
2. Embeddings are stored in `photo_face_clusters` with a similarity score
3. DBSCAN runs across all face embeddings for a given user, grouping faces that are geometrically close
4. Only clusters with ≥3 photos and above a minimum similarity score are surfaced in the UI — uncertain groupings are silently excluded
5. A single photo can belong to multiple face clusters (group shots)

**Model:** ArcFace backend via DeepFace (~100 MB, CPU-capable)

### Scene / Place Detection (CLIP)

1. On photo upload, CLIP generates an image embedding
2. The embedding is compared against text prompts for common scene categories (beach, mountains, urban, forest, indoor, etc.)
3. The highest-scoring categories above a confidence threshold are stored as `place_tags`

**Model:** ViT-B/32 via OpenCLIP (~350 MB, CPU-capable, cached after first download)

### Vibe / Style Classification (CLIP embeddings + KNN/SVM)

1. User defines custom vibe names (e.g. "Golden Hour", "Urban Grit", "Minimalist")
2. User manually labels a set of their own photos with these vibes
3. CLIP embeddings for labeled photos become the training set
4. A KNN or SVM classifier is trained on these embeddings and serialized to disk (`vibe_models.model_blob_path`)
5. The classifier runs on all unlabeled photos and stores predictions with confidence scores
6. When a user manually reclassifies a photo, `labeled_photo_count` is updated and the model can be retrained

**Degradation tracking:** If any vibe label's `labeled_photo_count` drops below 5 (due to photo deletion), a toast notification is shown once per login session prompting the user to re-run vibe setup.

---

## Security

### JWT Secret
- Generated once: `openssl rand -hex 32`
- Stored in `.env` only — never hardcoded, never committed to git
- `.env` is added to `.gitignore` on project initialization
- Changing the secret invalidates all active sessions

### File Upload Validation
All four checks run server-side before any file is written to disk:
1. **Size limit** — requests exceeding 25 MB are rejected before processing begins
2. **Image verification** — Pillow `.verify()` confirms the file bytes are a valid image format; a renamed script or binary will fail this check
3. **UUID rename** — the original filename is discarded; files are stored as `{uuid}.{ext}`. Original filename is kept as metadata in the DB only. Eliminates path traversal entirely.
4. **EXIF strip** — GPS coordinates, device model, and other metadata are removed on save via Pillow re-encode. Protects photographer and subject privacy.

### Cloudflare Tunnel
- FastAPI is bound to `127.0.0.1` (localhost), not `0.0.0.0`
- The server is unreachable from the local network or internet except through the tunnel
- TLS termination is handled by Cloudflare

### Portfolio Code
- 8-character alphanumeric (~218 trillion combinations)
- Collision check on generation; regenerates on conflict (extremely rare at this scale)
- The public portfolio endpoint is rate-limited per IP

---

## Local Setup Guide

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) (`cloudflared` CLI)

### Environment Variables

Create a `.env` file in the backend directory (never commit this file):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/vibeframe
JWT_SECRET=<output of: openssl rand -hex 32>
UPLOAD_DIR=/absolute/path/to/vibeframe/uploads
THUMBNAIL_DIR=/absolute/path/to/vibeframe/thumbnails
MAX_UPLOAD_MB=25
FACE_CLUSTER_MIN_SIZE=3
FACE_SIMILARITY_THRESHOLD=0.6
VIBE_DEGRADATION_THRESHOLD=5
```

### Running the Stack

```bash
# 1. Database
createdb vibeframe
cd backend && alembic upgrade head

# 2. Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000

# 3. Frontend
cd frontend
npm install
npm run dev

# 4. Cloudflare Tunnel (public access)
cloudflared tunnel run vibeframe
```

### First-Time ML Setup

CLIP model weights (~350 MB) download automatically on first image upload. DeepFace model weights (~100 MB) also download on first upload. Both are cached locally after the initial download and do not require an internet connection for subsequent runs.

When migrating to a new machine, copy the model cache directories along with your image uploads and database.

---

## Design Notes

1. **Portfolio code collision** — 8-char alphanumeric = ~218 trillion combinations. A collision check is still performed on generation; a new code is generated if a conflict is detected.

2. **ML processing is async** — Face, place, and vibe analysis runs as a background task after upload. Photos appear in the gallery immediately; ML tags populate within seconds.

3. **Group photos / multiple faces** — One photo can contain several faces. The schema uses a many-to-many relationship (photo ↔ face_cluster) to handle this correctly.

4. **Vibe model cold start** — A minimum of 5 manually-labeled photos per vibe is required before the classifier can be trained. The training button is disabled until this threshold is met.

5. **Image upload validation** — Four layers: size check, Pillow `.verify()`, UUID rename, EXIF strip. All enforced server-side regardless of what the client sends.

6. **JWT secret management** — Stored in `.env` only. Changing it invalidates all active sessions. Generate it once and keep it stable.

7. **Cloudflare Tunnel binding** — FastAPI must be bound to `127.0.0.1`, not `0.0.0.0`, so it is only reachable through the tunnel.

8. **No password recovery** — By design for v1. No email is collected. Forgotten passwords require an admin reset directly in the database. Email-based recovery is a planned future addition.

9. **CLIP model size** — ViT-B/32 is ~350 MB. It is downloaded once and cached. It must be present when migrating the server to a new machine.

10. **Face cluster accuracy (v1)** — Only clusters with ≥3 photos and above a similarity threshold are surfaced. Uncertain groupings are silently excluded. No merge/split UI in v1.

11. **Vibe model degradation** — Tracked via `labeled_photo_count` per vibe label. When any vibe drops below 5, a dismissible toast is shown once per login session. The Vibe sort panel shows a warning icon on degraded labels.

12. **No per-viewer access control** — Regenerating the portfolio code is the only way to revoke access, and it revokes for all viewers simultaneously. Fine-grained viewer control is a future feature.

13. **Single machine, no redundancy** — If the host machine is down, the portfolio is offline. This is an accepted trade-off for local hosting in v1.

---

## Roadmap

### v1 (Current Scope)
- Username/password auth with JWT
- Photo upload, caption, delete
- Albums (create, rename, delete, assign photos)
- 8-char portfolio sharing code
- Face grouping (threshold-filtered, no management UI)
- Scene/place detection
- Vibe/style classification wizard + auto-classification
- Vibe degradation warning toast
- Profile editing + GDPR account deletion
- Viewer gallery (read-only, full filter access)
- Local hosting via Cloudflare Tunnel

### Future
- Email-based password recovery
- Face cluster management UI (merge, split, name clusters)
- Per-viewer access control (unique codes per viewer, revoke individually)
- Cloud deployment option (Docker Compose, Railway, Render)
- Mobile-responsive UI improvements
- Photographer profile page (public, visible to viewers)
- Photo analytics (view counts per portfolio session)
- Bulk photo upload
- Video support
