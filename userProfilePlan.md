# User Profile & Collections — Plan

## Goal
Give each authenticated user a profile doc in Firestore that stores their
personal data (occupation, interests, …) and their curated lists
(bookmarks, favourites).

Auth still lives in Firebase Auth; this adds an **application-level**
user record on top of it, independent of Firebase Auth's user object.

---

## 1. Data model — `users/{uid}`

One document per user, keyed by Firebase UID.

```ts
interface UserDoc {
  // ── Identity (denormalized from Firebase Auth, cached for fast reads) ──
  uid:        string;          // doc id mirror
  email:      string;
  displayName:string;          // defaults to Google name, user can edit
  photoUrl:   string | null;   // defaults to Google picture

  // ── Profile — user-editable ─────────────────────────────────────────────
  bio:        string | null;
  occupation: string | null;
  country:    string | null;
  interests:  string[];        // tag list, e.g. ["history","poetry"] (display-only)
  socials: {
    website?:   string;
    twitter?:   string;
    linkedin?:  string;
  };

  // ── Curated lists (magazine slugs) ──────────────────────────────────────
  // Independent lists — an issue can be in both (favourited AND saved-for-later).
  bookmarks:  string[];        // "want to read later"
  favourites: string[];        // "loved it"

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Why arrays over subcollections?** Expected cardinality is low (tens, not
thousands). Arrays give atomic `arrayUnion` / `arrayRemove` writes and
one-read profile load. Move to subcollections only if a power user crosses
~500 items.

---

## 2. Backend — `api/src/modules/users/`

New module, Firestore-only (no Prisma path — this collection doesn't
exist in the old schema).

### Files
- `users.repo.firestore.ts` — Firestore CRUD
- `users.service.ts` — orchestration + `ensureUserDocument` helper
- `users.controller.ts`
- `users.routes.ts`
- `users.schema.ts` — zod validators

### Endpoints (all require `requireAuth`)
| Method | Path                          | Purpose                         |
|--------|-------------------------------|---------------------------------|
| GET    | `/api/me`                     | Full profile                    |
| PATCH  | `/api/me`                     | Update profile fields           |
| POST   | `/api/me/bookmarks/:slug`     | `arrayUnion(slug)`              |
| DELETE | `/api/me/bookmarks/:slug`     | `arrayRemove(slug)`             |
| POST   | `/api/me/favourites/:slug`    | `arrayUnion(slug)`              |
| DELETE | `/api/me/favourites/:slug`    | `arrayRemove(slug)`             |

**Eager creation on first login** — the `/auth/google` service
(`loginWithGoogle` in [google.service.ts](api/src/modules/auth/google.service.ts))
calls `ensureUserDocument({uid,email,name,picture})` right after verifying
the Firebase ID token. Uses `.set(..., {merge: true})` with a
`createdAt: serverTimestamp()` only set if missing, so repeat logins are
idempotent and don't clobber user-edited fields.

This guarantees every authenticated user has a doc — makes newsletter
targeting, analytics, and admin user lists trivial later.

**Validation** — interests capped at 20 items, each ≤32 chars; bio ≤500;
occupation ≤100; slugs validated against the magazine repo so users can't
bookmark garbage.

---

## 3. Frontend

### Pages (all under `/account`)
- `/account` — overview card (existing). Adds a **profile-completeness
  banner** when `bio`, `occupation`, or `interests` are empty, linking to
  `/account/profile`.
- `/account/profile` — edit form: displayName, bio, occupation, country,
  interests (tag input), socials.
- `/account/bookmarks` — grid of bookmarked issues (hydrate slugs →
  magazine summaries).
- `/account/favourites` — same pattern as bookmarks.

### Components
- `<BookmarkButton slug />` — toggles bookmark, optimistic update, only rendered when `isAuthenticated`.
- `<FavouriteButton slug />` — same.
- `<InterestPicker />` — chip input for tags.
- `<ProfileCompletenessBanner />` — dismissible nudge on `/account`.
- Wire bookmark/favourite buttons into the magazine detail page header.

### State
Profile + lists fetched once after auth via a `useProfile()` hook that
caches in context. Button actions dispatch optimistically, reconcile on
response.

---

## 4. Security

Firestore rules stay **deny-all**; only the backend writes via
`firebase-admin`. The backend is the enforcement boundary:
- `requireAuth` on every `/api/me/*` route
- Route handler reads `req.user.sub` — users cannot write to another user's doc
- Rate-limit bookmark/favourite toggles (cheap abuse surface)

---

## 5. Phases

**Phase A — minimum viable profile**
1. `users` collection + eager `ensureUserDocument` in `loginWithGoogle`
2. `GET /api/me`, `PATCH /api/me`
3. `/account/profile` page with form
4. Profile-completeness banner on `/account`

**Phase B — curated lists**
5. Bookmarks + favourites endpoints
6. BookmarkButton / FavouriteButton on magazine detail
7. `/account/bookmarks` and `/account/favourites` pages

**Phase C — polish** (stretch)
8. Comment history tab — re-query existing `comments` collection by `authorUid`.
9. Account deletion — purge user doc + anonymize comments.

---

## 6. Nice-to-haves worth considering (deferred)

- **Reading progress per issue** — store `{slug, lastPageViewed}` so the flipbook resumes where left off.
- **Per-issue ratings** — 1–5 stars, feeds a homepage "top rated" rail.
