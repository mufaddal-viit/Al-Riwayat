---
name: firebase-access-via-api-only
description: All Firebase/Firestore access must go through the Express /api backend, never directly from the Next.js web app
metadata:
  type: project
---

Firebase is initialized only in the Express backend under `/api` (firebase-admin in `api/src/lib/firebase-admin.ts`). All Firebase/Firestore reads and writes must go through `/api` endpoints — the Next.js `web` app must never call Firebase directly.

**Why:** The user explicitly requires this architecture; credentials and admin SDK live server-side in `/api`.

**How to apply:** When adding admin/data features in `web`, render data returned by an `/api` endpoint (e.g. admin dashboard data comes from `/api/admin/dashboard` proxied via `web/app/api/admin/dashboard/route.ts`). Add new Firebase queries as Express routes/repos in `api/src/modules/...`, not in the web app. Related: [[reactions-go-through-api]].
