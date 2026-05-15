Branch: feat/page-reactions (created and checked out)

New files

web/lib/anonymous-reader.ts — stable per-device id via localStorage with in-memory fallback.
web/services/pageReactionService.ts — Firestore CRUD + live counts subscription. Collection: page_reactions, doc id {readerId}__{issueSlug}__p{page} enforces "one reaction per page per device".
web/components/issue/page-reaction-bar.tsx — floating bar overlaid on the flipbook with prev/next + page-number input, 5 emoji buttons (❤️ Love, 😮 Wow, 🤔 Think, 🔖 Bookmark, ✨ Inspire), live counts, optimistic toggle.
Modified

web/components/issue/issue-rich-content.tsx — made the iframe wrapper relative, gave the iframe an id, and mounted <PageReactionBar /> inside it.
Behavior

The page stepper updates the iframe's src to …/flipbook.html#page/N to navigate Heyzine (the most reliable cross-origin nudge — we can't read back which page the user flipped to, so it's user-driven).
Tapping an emoji writes one doc to Firestore; tapping the same one again removes it; switching reactions overwrites the doc.
Counts update live via onSnapshot for whatever page is currently selected.
Pre-existing TS diagnostics noted: the IDE flagged next/link and JSX errors — those are because node_modules isn't installed in this working copy, not from my changes. Run npm install in web/ to clear them and npm run build to typecheck. Nothing committed yet — let me know if you'd like me to commit.


Quick summary of the bookmark feature:

New files

web/lib/page-bookmark.ts — localStorage helpers: savePageBookmark, getPageBookmark, listPageBookmarks, clearPageBookmark, plus session-scoped dismissBookmark / isBookmarkDismissed so the toast isn't nagging within one session.
web/components/site/bookmark-return-toast.tsx — top-right toast, fades in 700ms after mount, shows the newest unread bookmark, CTA = "Jump to page N".
Modified

web/components/issue/page-reaction-bar.tsx — added an explicit "Save my page" / "Saved p.N" toggle button between the page stepper and the reactions. Also reads ?page=N from the URL on mount so the toast CTA deep-links straight to the saved page.
web/components/issue/issue-rich-content.tsx — passes issueTitle and a resolved issuePath (/issue-1 for Issue 1, /issue/[slug] for everything else) into the reactions bar.
web/app/layout.tsx — mounts <BookmarkReturnToast /> globally so it can fire on any page.
Behavior

User taps ☆ Save my page while on page 7 → state flips to ★ Saved p.7 and shows "Saved!" for ~1.6s. Stored as al_riwayat_page_bookmarks in localStorage.
Next visit to any page on the site → top-right toast appears: "Pick up where you left off — You bookmarked page 7 of {issue title}." with Jump to page 7 (deep-link to /issue-1?page=7) and Not now (dismisses for this tab session).
Toast is suppressed when the user is already on the exact bookmarked page+URL.
Tapping ★ Saved p.7 while on page 7 removes the bookmark.
Nothing committed yet. Let me know if you'd like me to commit, or tweak the toast styling/timing.

