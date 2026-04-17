# Firebase Plan — Auth + Data Layer (No Database)

> Status: **Draft v2** · Replaces the previous DB-based plan · No Prisma/MongoDB used while this plan is in effect.

---

## Goal

Run the product without a database:

1. **Auth** — Google sign-in via Firebase. No users table. No refresh-token table. Backend just verifies Firebase ID tokens and issues short-lived backend JWTs for its own API.
2. **Comments + Contacts** — stored in **Firestore**. Frontend never touches Firestore directly; backend uses `firebase-admin` and writes on its behalf.
3. **Magazines** — served from `api/src/data/mock-magazines.json`. Static, committed data.
4. **Admin auth + admin UI** — **out of scope for this pass.** Admin routes/controllers already in the repo stay on disk but are effectively unused (unreachable without admin auth).
5. **Existing Prisma code** — left untouched in its files. A single env flag (`DATA_BACKEND`) decides at request time whether a service reads from Firestore/JSON or from Prisma. Nothing is deleted.

Frontend keeps calling the backend exactly as it does today. Zero contract change on the frontend API surface.

---

## Architecture

```
  Browser                  Backend (Express)                  External
  ───────                  ─────────────────                   ────────
 ┌──────────┐             ┌──────────────────────────┐       ┌──────────┐
 │ Login    │──Google────►│ POST /auth/google        │──────►│ Firebase │
 │ button   │  popup      │ verify idToken           │       │ Auth     │
 │          │             │ return backend JWT       │       └──────────┘
 │ Our JWT ─┼────────────►│ GET /issues              │──read─►┌──────────┐
 │ for all  │             │ GET/POST /comments       │◄──────►│ Firestore│
 │ API      │             │ POST /contact            │──write►│          │
 │ calls    │             │                          │       └──────────┘
 │          │             │ GET /magazines           │──read─► mock-magazines.json
 └──────────┘             └──────────────────────────┘
```

- **Backend JWT** carries `{ uid, email, name, picture }` copied straight from the verified Firebase token. No User row exists anywhere — identity lives in Firebase.
- **No refresh tokens.** When our JWT expires, frontend asks Firebase SDK for a fresh ID token (`getIdToken(true)`) and re-calls `/auth/google` to get a fresh backend JWT. Firebase itself handles the real refresh loop.
- **Firestore writes go through backend only.** Firestore security rules stay at "deny all" (only admin SDK bypasses them). Much less surface to think about.

---

## Decisions confirmed

| # | Decision | Value |
|---|---|---|
| 1 | Auth provider | Google via Firebase only |
| 2 | Admin auth | **Skipped for now** — no admin login, no hardcoded creds. Add later when there is an admin feature. |
| 3 | Admin UI | **Skipped for now** |
| 4 | Magazines source | `api/src/data/mock-magazines.json` |
| 5 | Comments storage | Firestore collection `comments/{id}` with field `pageSlug` |
| 6 | Contacts storage | Firestore collection `contacts/{id}` |
| 7 | Existing Prisma code | Kept in place, gated by env flag, never deleted |
| 8 | Refresh tokens | Not used — Firebase handles refresh on the client; frontend re-exchanges on expiry |

---

## Risks

1. 🔴 **Firebase Admin private key leak.** Backend-only secret. `.env` must be gitignored; production uses host env vars (Netlify/Render). Never ship this to the browser bundle.
2. 🟡 **Vendor lock-in to Firestore.** Acceptable for now; mitigated by the repository pattern (swap the adapter later).
3. 🟡 **Popup blocked / user closes popup.** Friendly error, no stuck loading state.
4. 🟡 **Clock skew on serverless hosts.** `verifyIdToken` already tolerates small skew; log + surface a clear 401 otherwise.
5. 🟢 **Firestore quota / cost.** Free tier is very generous for this workload. Defer optimization.

---

## Phase 0 — Firebase Console setup (no code)

**Done when:** backend has Admin credentials, frontend has Web SDK config.

- [ ] Create (or reuse) a Firebase project.
- [ ] **Authentication → Sign-in method** → enable **Google** provider. Set support email.
- [ ] **Authentication → Settings → Authorized domains** → add `localhost` and production domain.
- [ ] **Firestore Database** → create database in Native mode → start in **production mode** (deny all rules).
- [ ] **Project Settings → General → Your apps** → register a Web app. Copy SDK config.
- [ ] **Project Settings → Service accounts** → generate new private key JSON. Store securely.

---

## Phase 1 — Backend: Firebase Admin + auth endpoint

**Done when:** `POST /auth/google` accepts a Firebase ID token and returns `{ accessToken, user }`.

### 1.1 Dependencies
- [ ] `cd api && npm install firebase-admin`

### 1.2 Firebase Admin init — `api/src/lib/firebase-admin.ts` (new)
- [ ] `initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })`.
- [ ] Read `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` from env. Normalize `\n` in private key.
- [ ] Export `adminAuth = getAuth()` and `adminDb = getFirestore()`.

### 1.3 Env schema — `api/src/lib/env.ts`
- [ ] Add three Firebase vars.
- [ ] Add `DATA_BACKEND: "firestore" | "prisma"` (default `"firestore"` for now).

### 1.4 Auth service — `api/src/modules/auth/auth.service.ts`
- [ ] New method `loginWithGoogle(idToken: string)`:
  1. `const decoded = await adminAuth.verifyIdToken(idToken)`.
  2. Reject if `!decoded.email_verified`.
  3. Build user object: `{ uid, email, name, picture }` from `decoded`.
  4. Sign backend JWT with same payload + `role: "USER"` (short-lived, e.g. 1h).
  5. Return `{ accessToken, user }`.
- [ ] **Do not touch** the existing email/password methods — they stay on disk, unused.

### 1.5 Schema — `api/src/modules/auth/auth.schema.ts`
- [ ] `googleLoginSchema = z.object({ idToken: z.string().min(10) })`.

### 1.6 Controller — `api/src/modules/auth/auth.controller.ts`
- [ ] `googleLogin(req, res, next)` → call service → return JSON.

### 1.7 Route — `api/src/modules/auth/auth.routes.ts`
- [ ] `router.post("/google", loginLimiter, validate(googleLoginSchema), authController.googleLogin);`
- [ ] Leave existing `/login`, `/register`, `/refresh` etc. routes in place but **do not rely on them** from the frontend.

### 1.8 `requireAuth` middleware
- [ ] Confirm it only validates JWT signature + expiry + extracts payload. No DB lookup. (If it currently does a DB lookup for the user, refactor it to trust the JWT payload — we have no users table now.)

### 1.9 Env vars
Add to `api/.env`:
```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@....iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
DATA_BACKEND=firestore
```

---

## Phase 2 — Backend data layer (repository pattern)

**Done when:** every `*.service.ts` that currently hits Prisma has a matching Firestore (or JSON) adapter, selected by `DATA_BACKEND` env flag. Existing Prisma code compiles and sits unused.

**Pattern (applied per module):**
```
modules/
  comments/
    comments.service.ts           ← thin router: picks repo by env.DATA_BACKEND
    repo/
      comments.repo.ts            ← interface
      comments.repo.prisma.ts     ← existing DB code, lifted out of comments.service.ts
      comments.repo.firestore.ts  ← new
```

The controller keeps calling `commentsService.list()` — it doesn't know which backend is live.

### 2.1 Magazines — `api/src/modules/magazine/`
- [ ] Extract existing Prisma logic into `repo/magazine.repo.prisma.ts` (unchanged behaviour).
- [ ] Add `repo/magazine.repo.mock.ts` that reads `data/mock-magazines.json`.
- [ ] `magazine.service.ts` routes to mock repo when `env.DATA_BACKEND !== "prisma"`.
- [ ] Admin routes (`magazine.admin.*`) continue to exist but return 403/501 when no admin auth. Simplest: leave them mounted; since `requireAuth` + admin guard is no longer satisfiable, they become unreachable.

### 2.2 Comments — `api/src/modules/comments/`
- [ ] Extract existing Prisma logic to `repo/comments.repo.prisma.ts`.
- [ ] Add `repo/comments.repo.firestore.ts` with:
  - `list(pageSlug)` → query `comments` where `pageSlug == X && status == "APPROVED"`, ordered by `createdAt`.
  - `create({ pageSlug, body, parentId, author: { uid, name, email, picture } })` → add doc with `status: "APPROVED"` (or `"PENDING"` if we want moderation) and `createdAt: serverTimestamp()`.
  - Reply threading uses `parentId` field just like the Prisma model.
- [ ] `comments.service.ts` switches by env.
- [ ] Post-a-comment route is **authenticated** (requires Bearer JWT). Author info is read from JWT payload, not the request body — prevents spoofing.

### 2.3 Contacts — `api/src/modules/contact/`
- [ ] Extract existing Prisma logic to `repo/contact.repo.prisma.ts`.
- [ ] Add `repo/contact.repo.firestore.ts`:
  - `create({ name, email, message })` → add doc + `createdAt: serverTimestamp()`.
- [ ] `contact.service.ts` switches by env.
- [ ] Route stays **public**.

### 2.4 Newsletter — same pattern, Firestore collection `newsletter/{id}`.

### 2.5 Don't delete Prisma
- [ ] `prisma/schema.prisma` stays.
- [ ] `prisma` client is still imported by `*.repo.prisma.ts` files — TS must still compile.
- [ ] If MongoDB is unreachable, that's fine — the prisma repos are not called while `DATA_BACKEND=firestore`.

---

## Phase 3 — Frontend

**Done when:** "Continue with Google" on login page completes sign-in, stores our backend JWT, and routes to `/account`. Comments + contact forms still submit successfully via the same service calls.

### 3.1 Dependencies
- [ ] `cd web && npm install firebase`

### 3.2 Public env — `web/.env.local` + `web/lib/public-env.ts`
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3.3 Firebase init — `web/lib/firebase.ts` (new)
- [ ] Guarded `initializeApp` (Next dev HMR re-init safe).
- [ ] Export `auth`, `googleProvider`.

### 3.4 Endpoint — `web/lib/api/endpoints.ts`
- [ ] Add `auth.google: "/auth/google"`.

### 3.5 Service — `web/services/authService.ts`
- [ ] `loginWithGoogle()`: `signInWithPopup` → `getIdToken()` → POST `/auth/google` → return `{ accessToken, user }`.
- [ ] Wrap Firebase errors (`auth/popup-closed-by-user`, `auth/network-request-failed`) into `AppError` with readable messages.
- [ ] `refreshBackendToken()` (used by axios interceptor): `await auth.currentUser?.getIdToken(true)` → POST `/auth/google` → set new backend token.
- [ ] Keep existing `register`/`login`/`verifyEmail`/etc. exports so TS doesn't break, but the login page will stop calling them.

### 3.6 Auth context — `web/context/auth-context.tsx`
- [ ] Replace the "get user on mount via `getMe`" path with "subscribe to `onAuthStateChanged`; if there's a Firebase user, exchange for backend token + set user from token payload".
- [ ] Add `loginWithGoogle` to the context value.
- [ ] `logout()` now calls `signOut(auth)` **and** clears our JWT.

### 3.7 API client — `web/lib/api/client.ts`
- [ ] On 401: call `authService.refreshBackendToken()` once; retry the original request. If refresh fails, clear token, redirect to `/login`.

### 3.8 Login page — `web/app/(auth)/login/page.tsx`
- [ ] Replace the email/password form with a single **"Continue with Google"** button.
- [ ] (Optional interim: keep email/password form visible but disabled, with a note — simpler to just remove for now.)

### 3.9 Register / forgot-password / reset-password / verify-email pages
- [ ] Repurpose `/register` to redirect to `/login` (Google handles both). Or delete the route. Confirm preference.
- [ ] Remove links to forgot-password / verify-email from the UI. Files can stay on disk for when DB comes back.

### 3.10 Comment submission
- [ ] No change needed in `services/commentService.ts` — it still POSTs to the backend. Backend now writes to Firestore instead of Prisma.
- [ ] Comment form must require the user to be signed in (show "Sign in to comment" otherwise).

### 3.11 Contact form
- [ ] No change needed. Public POST to backend, which writes to Firestore.

---

## Phase 4 — Testing

| Scenario | Expected |
|---|---|
| New user clicks Google button | Popup → select account → lands on `/account` with user's name + photo visible. |
| Close popup mid-flow | Friendly error, no stuck loading. |
| Token expires, user hits any API | Axios interceptor refreshes via Firebase, retries, succeeds. Transparent. |
| Sign out, sign in again | No duplicate state. `signOut(auth)` clears Firebase session. |
| Submit comment while signed in | Firestore `comments` collection gets a new doc with correct author fields. |
| Submit comment while signed out | Blocked on frontend AND backend returns 401. |
| Submit contact form | Firestore `contacts` collection gets a new doc. Works unauthenticated. |
| View issue page | Renders magazines from `mock-magazines.json`. |
| Hit any admin route | 401/403/404. No way in. |

---

## Rollout

- [ ] Backend deploy first (additive — new `/auth/google`, Firestore repos). Old `/auth/*` endpoints still resolve but are effectively dead.
- [ ] Set `DATA_BACKEND=firestore` in backend env.
- [ ] Frontend deploy with Google button.
- [ ] Monitor Firestore writes + backend 401/500 rate for 24h.

---

## Out of scope (explicit)

- Admin auth, admin UI, admin-only endpoints.
- Other auth providers (Apple, email link, phone).
- Migrating existing DB data (there is none in use).
- Firestore security rules beyond "deny all" — backend is the only writer.
- Multi-factor auth.
- Deleting any existing Prisma code or routes.

---

## First move

Get **Firebase project credentials** in hand (Phase 0). Once I have:
- Web SDK config (for `web/.env.local`)
- Service account JSON (for `api/.env`)

…I'll start Phase 1 (backend `/auth/google` + repository scaffolding). Tell me when Phase 0 is done and paste the creds (privately — don't commit), and I'll move.
