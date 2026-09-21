# DocuMind — Multimodal RAG

> **AI-powered document intelligence.** Upload PDFs and chat with their contents using a hybrid retrieval pipeline — vector search + keyword overlap + reranking — grounded in a strict "answer only from the PDF" LLM policy.

DocuMind is a full-stack, production-ready RAG application: a React frontend, five Node.js/Express services, BullMQ job workers over Redis, Pinecone vector search, Gemini embeddings, and Groq-powered generation — complete with auth (JWT cookies), document lifecycle tracking, and a Stripe-backed Premium subscription.

---

## Features

- **PDF document upload** — drag-and-drop or click-to-upload (PDF only, up to 50 MB), stored in Supabase Storage.
- **Hybrid retrieval chat** — vector similarity (Pinecone) blended with a lexical keyword score and a final lexicographic rerank before the LLM.
- **Grounded answers** — the system prompt forces the model to answer *only* from the retrieved PDF context and to say so when the answer is not present.
- **Chat with sources** — every assistant message persists its retrieved sources for transparency.
- **Live document status** — `UPLOADING → DOWNLOADING → CHUNKING → EMBEDDING → INDEXING → COMPLETED`, driven by Redis-backed workers.
- **Accounts & plans** — JWT auth via httpOnly cookie; Free (3 documents) vs Premium (30 documents).
- **Premium payments** — Stripe Elements card form with masked card preview, decline handling and "Try again" retry; price is fetched from the backend and rendered dynamically (no hardcoded amounts).
- **Resilient AI calls** — exponential-backoff retries for embeddings; async message/save via queues so the API stays fast.

---

## System architecture

```
                        ┌─────────────────────────────────────────────┐
                        │                 Frontend (Vite + React)      │
                        │         AuthContext → App → components       │
                        └──────┬──────────┬──────────┬──────────┬──────┘
                               │          │          │          │
                        /api/auth, /api/document, /api/chat, /api/payment
                               │          │          │          │
                        ┌──────▼──────────▼──────────▼──────────▼──────┐
                        │            User Server (Express, :3003)      │
                        │  auth · documents · payments · chat proxy    │
                        └──────┬───────▲───────┬──────────────┬────────┘
                               │       │       │              │
                     queues    │       │       │              │  HTTP + cookie
                        ┌──────▼───────┴───────▼──────────────▼────────┐
                        │           Upload Worker (:3001)               │
                        │   Supabase Storage → pdf-parse → chunk →      │
                        │   Gemini embeddings → Pinecone upsert         │
                        └──────┬──────────────────────┬─────────────────┘
                               │                      │
                        ┌──────▼──────┐      ┌────────▼────────┐
                        │ Status      │      │ Message         │
                        │ Worker      │      │ Worker          │
                        │ (:3004)     │      │ (:3005)         │
                        └──────┬──────┘      └────────┬────────┘
                               │                    │
                        ┌──────▼────────────────────▼──────┐
                        │      Chat Server (Express, :3002) │
                        │   hybrid search → rerank → Groq   │
                        └───────────────────────────────────┘
```

Five services run concurrently (all inside `backend/`), coordinated by **BullMQ queues on Upstash Redis**:

| Process | Location | Port (env override) | Responsibilities |
| --- | --- | --- | --- |
| User server | `src/user-server/` | `3003` (`USER_SERVER_PORT`) | Auth, documents CRUD, payments, chat proxy |
| Chat server | `src/chat-server/` | `3002` (`CHAT_SERVER_PORT`) | Hybrid search, rerank, Groq completion |
| Upload worker | `src/upload-server/` | `3001` (`UPLOAD_SERVER_PORT`) | PDF parse → chunk → embed → index |
| Status worker | `src/user-server/workers/` | `3004` (`STATUS_SERVER_PORT`) | Document status + chat record creation |
| Message worker | `src/user-server/workers/` | `3005` (`MESSAGE_SERVER_PORT`) | Persists chat messages |

**Queues** (`BullMQ`): `document-processing` · `document-status` · `message-save`.

---

## Tech stack

### Frontend
- **React 19** + **Vite 8** + **Tailwind CSS 4** (`@tailwindcss/vite`)
- `framer-motion`, `lucide-react`, `react-markdown`, `react-type-animation`
- `@stripe/stripe-js` for card Elements
- App is deployed to **Vercel** (`SPA` rewrite in `frontend/vercel.json`)

### Backend
- **Node.js 20+ / Express 5** (ES Modules)
- **Prisma** + **PostgreSQL** (Supabase) — `User`, `Document`, `Chat`, `Message`
- **BullMQ + ioredis** (Upstash Redis) job queues
- **Pinecone** vector database (`rag` index, 768-dims)
- **Google Gemini** embeddings (`gemini-embedding-001`, 768 dims)
- **Groq** LLM completions
- **Supabase** object storage + (optionally) auth/JWKS
- **Stripe** payments · **jsonwebtoken** cookie auth · **zod**-friendly Express JSON

---

## Repository layout

```
multimodal_rag/
├── backend/
│   ├── prisma/schema.prisma         # PostgreSQL data model
│   ├── src/
│   │   ├── user-server/             # user API + status & message workers
│   │   ├── chat-server/             # RAG chat pipeline
│   │   └── upload-server/           # PDF processing worker + services
│   ├── supabase/                    # Supabase scratch/temp
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                     # auth, user, document, chat, payment clients
│   │   ├── components/              # Chat, Sidebar, UpgradePage, DocumentList, …
│   │   ├── context/AuthContext.jsx  # auth lifecycle + plan state
│   │   ├── lib/stripe.js            # Stripe.js lazy loader
│   │   └── App.jsx                  # app shell + routing
│   ├── vercel.json                  # SPA rewrite for Vercel
│   └── package.json
├── test documents/                  # sample PDFs for trying the pipeline
└── README.md
```

---

## Prerequisites

- **Node.js ≥ 20** (ESM projects)
- **PostgreSQL** (a Supabase Postgres instance works)
- **Redis** (an Upstash instance works — used by BullMQ)
- Accounts/keys for: **Pinecone**, **Google Gemini**, **Groq**, **Supabase**, and (for payments) **Stripe**

---

## Getting started

### 1. Backend

```bash
cd backend
npm install
# create a .env in backend/ — see "Environment variables" below
npx prisma generate
npx prisma migrate dev --name init   # applies the schema to DATABASE_URL
npm run dev                          # starts all 5 services in parallel
```

Individual services can be started separately with `npm run dev:user`, `dev:chat`, `dev:doc_worker`, `dev:status_worker`, `dev:message_worker` (or `start:*` for production).

### 2. Frontend

```bash
cd frontend
npm install
# create a .env in frontend/ — see "Environment variables" below
npm run dev            # Vite dev server on http://localhost:5173
```

- With `VITE_USER_API_URL` set, the frontend talks to the backend directly.
- Without it, the Vite dev proxies (`/user-api`, `/chat-api`, `/upload-api` — see `vite.config.js`) forward to the default local backend ports.

Then open the app, create an account, upload a PDF from `test documents/`, wait for it to reach **COMPLETED**, and start chatting.

---

## Environment variables

> `.env` files are git-ignored — never commit real secrets. Only the names are listed here; fill in your own values.

### Backend `backend/.env`

| Variable | Description |
| --- | --- |
| `PORT` | Default port (3000) used when a server-specific port is absent |
| `USER_SERVER_PORT` | User API server port (default 3003) |
| `CHAT_SERVER_PORT` | Chat server port (default 3002) |
| `UPLOAD_SERVER_PORT` | Upload worker port (default 3001) |
| `STATUS_SERVER_PORT` | Status worker port (default 3004) |
| `MESSAGE_SERVER_PORT` | Message worker port (default 3005) |
| `CHAT_SERVER_URL` | URL the user server uses to forward chat requests |
| `REDIS_URL` | Upstash/Redis connection string for BullMQ |
| `PINECONE_API_KEY` | Pinecone project API key |
| `PINECONE_INDEX_NAME` | Pinecone index name (e.g. `rag`) |
| `GEMINI_API_KEY` | Google Gemini API key (embeddings) |
| `GEMINI_EMBEDDING_MODEL` | Embedding model (default `gemini-embedding-001`) |
| `GROQ_API_KEY` | Groq API key (chat completions) |
| `GROQ_MODEL` | Groq model id (default from code: `llama-3.1-8b-instant`) |
| `DATABASE_URL` | Prisma connect URL (PostgreSQL) |
| `DIRECT_URL` | Prisma direct (non-pooled) URL |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `SUPABASE_SECRET_KEY` | Supabase service-role key (storage) |
| `SUPABASE_JWKS_URL` | Supabase JWKS endpoint (optional auth) |
| `STRIPE_SECRET_KEY` | Stripe *test* secret key (payments) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (payments) |
| `FRONTEND_URL` | Allowed frontend origin (CORS) |

### Frontend `frontend/.env`

| Variable | Description |
| --- | --- |
| `VITE_USER_API_URL` | User server base URL (e.g. `http://localhost:3003`) |
| `VITE_CHAT_API_URL` | Chat server base URL (unused directly today; kept for convenience) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe **publishable** key (safe to expose client-side) |

> The publishable key must belong to the same Stripe account as the backend secret key.

### CORS

Backend CORS allows: `https://doc-u-mind.vercel.app` and `http://localhost:5173` (credentials enabled). Add your own origins in each service's `config/cors.js` when deploying.

---

## Data model (`prisma/schema.prisma`)

- **User** — `name`, `email` (unique), hashed `password`, `plan` (`FREE` | `PREMIUM`), optional `stripeCustomerId`.
- **Document** — `userId`, `filename`, `fileUrl` (Supabase), `status` lifecycle enum.
- **Chat** — one per document (`documentId` unique), cascade-deleted with the document.
- **Message** — `role` (`USER` | `ASSISTANT`), `content`, `sources` (JSON — retrieved chunks).

Plan document limits are enforced server-side in `docController.uploadDocument`: **FREE = 3**, **PREMIUM = 30**.

---

## How it works

### Document ingestion pipeline

1. Client uploads a PDF → user server stores it in **Supabase Storage** (`${userId}/${timestamp}-${filename}`), creates a `Document` row (`UPLOADED`), and enqueues `document-processing`.
2. **Upload worker:** downloads the file (`DOWNLOADING`), extracts text with `pdf-parse`, chunks with a LangChain `TokenTextSplitter` (500 tokens / 50 overlap), and embeds every chunk via **Gemini** (768 dims) with rate-limit + exponential-backoff retries (`CHUNKING` → `EMBEDDING`).
3. Vectors (id `<documentId>-<index>`, metadata `text` + `documentId`) are upserted to **Pinecone** in batches of 100 (`INDEXING`).
4. Status worker flips the document to `COMPLETED` and upserts a `Chat` row. Failures are marked `FAILED`.

### Chat / RAG pipeline

1. `POST /api/chat` on the user server proxies (with the auth cookie) to the **chat server**.
2. Hybrid search: Pinecone vector query (top 5, filtered by `documentId`) is combined with a token-overlap keyword score (`vector × 0.7 + keyword × 0.3`).
3. Results are reranked lexicographically and the top 4 become the LLM context.
4. **Groq** generates an answer strictly from the context (system prompt enforces "answer only from the PDF" and a numbered format for multi-part questions).
5. Both the user and assistant messages are enqueued to `message-save` and persisted by the message worker; responses return `{ answer, sources }`.

### Payments & Premium

- The UI renders the plan price from `GET /api/payment/price` (source of truth is `PREMIUM_PRICE` in `paymentController.js`) — no hardcoded amounts.
- The card form uses real **Stripe Elements** (`@stripe/stripe-js`) with a masked card preview, card-flip animation and decline → "Try again" retry flow.
- `POST /api/payment/add-card` attaches a card token to the user's Stripe customer; `POST /api/payment/create-charges` charges it and, on success, upgrades the user to `PREMIUM`.

Stripe test cards:

| Card | Result |
| --- | --- |
| `4242 4242 4242 4242` | Success (any future expiry, any CVC) |
| `4000000000000002` | Declined — "Your card has insufficient funds." |

---

## API reference

All user-server routes are mounted under `/api`; document/chat/payment endpoints require the JWT httpOnly cookie (`token`).

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | – | Create account |
| `POST` | `/api/auth/login` | – | Login (sets cookie) |
| `POST` | `/api/auth/logout` | – | Clear session |
| `GET` | `/api/auth/me` | ✓ | Current user |
| `POST` | `/api/document` | ✓ | Upload PDF (multipart field `document`) |
| `GET` | `/api/document` | ✓ | List documents |
| `GET` | `/api/document/:id` | ✓ | Document detail |
| `DELETE` | `/api/document/:id` | ✓ | Delete file, vectors, chat & messages |
| `GET` | `/api/chat/:id` | ✓ | Load a chat + messages |
| `POST` | `/api/chat` | ✓ | Ask a question (proxied to chat server) |
| `GET` | `/api/payment/price` | – | Current Premium price (amount + currency) |
| `POST` | `/api/payment/add-card` | ✓ | Attach a tokenized card to the customer |
| `POST` | `/api/payment/create-charges` | ✓ | Charge the card & upgrade the user |
| `GET` | `/health` | – | Liveness probe (every service) |

---

## Production

### Frontend (Vercel)
`frontend/vercel.json` contains an SPA rewrite so `/upgrade` and deep links fall back to `index.html`. Build with `npm run build`; the output lives in `frontend/dist`.

### Backend & workers
Each service can be deployed independently (e.g. Render/Railway/AWS). Make sure:
- All services share the same `JWT_SECRET` and Redis.
- `CHAT_SERVER_URL` points from the user server to the chat server.
- CORS includes your deployed frontend origin.
- Secrets live in the host's environment, not the repository.

---

## Troubleshooting / notes

- **"Port X is already in use"** — the five local services bind ports `3001–3005`; stop conflicting processes or override the ports via env.
- **Embedding failures** — verify `GEMINI_API_KEY` and that `PINECONE_INDEX_NAME` exists with dimension **768**.
- **Chat returns 502** — the user server cannot reach `CHAT_SERVER_URL` (chat server not running or wrong URL).
- **Login "Invalid token"** — JWT was signed with a different `JWT_SECRET`, or the cookie cleared.
- **Payments not available** — `VITE_STRIPE_PUBLISHABLE_KEY` must be set in the frontend `.env`; it must match the account of the backend `STRIPE_SECRET_KEY`.

---

## Security

- `.env` files are **git-ignored** (`backend/.gitignore`, `frontend/.gitignore`).
- Passwords are hashed with **bcrypt**; sessions use a signed JWT in an httpOnly cookie.
- Document plan limits and file-type/size constraints are enforced server-side.
- Only the **publishable** Stripe key is ever shipped to the browser; card numbers are tokenized by Stripe and never touch the server.