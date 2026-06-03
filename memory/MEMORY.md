# Memory Index

- [Reactions go through /api](reactions-go-through-api.md) — page reactions persist via the API backend (firebase-admin), not the browser Firestore SDK
- [Firebase access via /api only](firebase-access-via-api-only.md) — all Firebase/Firestore reads & writes must go through the Express /api backend, never directly from the web app
