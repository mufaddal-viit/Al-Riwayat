---
name: reactions-go-through-api
description: Page reactions persist via the /api backend (firebase-admin), not the browser Firestore SDK
metadata:
  type: project
---

Page reactions were failing to save because `web/services/pageReactionService.ts`
wrote directly to Firestore with the browser SDK — which requires client-side
security rules that the project never set up (default-deny blocks writes).

**Why:** Every other feature (comments, contact, newsletter, submissions) goes
through `/api`, which uses `firebase-admin` and bypasses Firestore security
rules. Direct client writes were the odd one out.

**How to apply:** Reactions now use the `/api/page-reactions` module
(`api/src/modules/page-reactions/`) — GET counts, GET /own, PUT set, DELETE
clear. `pageReactionService.ts` calls these via `apiClient`. Any new anonymous
engagement feature should follow the same API-backed pattern, not the browser
Firestore SDK. The `db` export in `web/lib/firebase.ts` is now effectively
unused by reactions.
