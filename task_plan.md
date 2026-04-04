# Task Plan: Digital Magazine MVP

## Goal
Scaffold a production-ready MVP digital magazine web application with a Next.js 14 frontend in `/web` and an Express + Prisma + MongoDB backend in `/api`, delivered phase by phase with working article, newsletter, contact, theme, consent, and SEO flows.

## Current Phase
Phase 4 complete - backend reinforcement before Phase 5

## Phases

### Phase 1: Project setup
- [x] Capture requirements and constraints from the user prompt
- [x] Create persistent planning files in the project root
- [x] Decide scaffolding strategy for `/web` and `/api`
- [x] Confirm repo state before generating application code
- [x] Define the initial design-system direction and shared architecture boundaries
- **Status:** complete

### Phase 2: Backend setup
- [x] Initialize `/api` with TypeScript, Express, Prisma, and required middleware
- [x] Create Prisma MongoDB schema and `db push` workflow
- [x] Implement seed/bootstrap path for Issue 1
- [x] Build contact, newsletter, and magazine routes with Zod validation
- [x] Apply security middleware and rate limiting
- [x] Add `.env.example` and backend README
- [x] Review code structure and backend UX for error handling
- **Status:** complete

### Phase 3: Frontend foundation
- [x] Initialize `/web` with Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui, and next-themes
- [x] Set up fonts, design tokens, Tailwind theme mapping, and global layout
- [x] Build shared shell: navbar, footer, theme toggle, mobile sheet, cookie consent
- [x] Add metadata helpers and environment setup
- [x] Add frontend README and `.env.example`
- [x] Review layout rhythm, hierarchy, and responsiveness baseline
- **Status:** complete

### Phase 4: UI implementation
- [x] Build homepage sections and interactions
- [x] Build About page with editorial story, team, and contact form UI
- [x] Build Mission page with structured narrative and CTA
- [x] Build Issue 1 reading page optimized for long-form reading
- [x] Refine reusable components, spacing, and state design
- [x] Run UI/UX quality pass against mobile, tablet, and desktop targets
- **Status:** complete

### Phase 5: API integration
- [ ] Connect newsletter signup to backend with clear success and error feedback
- [ ] Connect contact form with validation, honeypot, and submission states
- [ ] Fetch and render Issue 1 content from the API
- [ ] Add GA consent-gated loading and social share behavior
- [ ] Verify explicit API contracts between frontend and backend
- [ ] Refine component boundaries where integration exposes coupling
- **Status:** pending

### Phase 6: Testing and polish
- [ ] Run linting and type checks for both apps
- [ ] Verify critical routes and forms manually
- [ ] Validate responsive behavior at 375px, 768px, and 1280px
- [ ] Verify light and dark themes, metadata, and JSON-LD output
- [ ] Review MVP quality, readability, and code cleanliness
- [ ] Update documentation for final runnable setup
- **Status:** pending

## Key Questions
1. What is the leanest runnable scaffold that still keeps `/web` and `/api` loosely coupled and production-oriented?
2. How should Issue 1 content be modeled so the backend can seed it immediately and the frontend can render the current flipbook-first reader cleanly?
3. Which shared design tokens and layout rules best support an editorial reading experience without introducing unnecessary complexity?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Use file-based planning docs in the repo root before code generation | Required by the user and useful for long multi-phase work |
| Follow six explicit phases: setup, backend, frontend foundation, UI, integration, testing | Matches the requested workflow and enforces one-phase-at-a-time delivery |
| Keep `/web` and `/api` as separate apps with independent `package.json` files | Satisfies the required structure and keeps deployment boundaries clean |
| Treat UI direction as editorial and premium from the start, not as a later cosmetic pass | Prevents a generic scaffold that would need heavy redesign later |
| Scaffold `/api` before `/web` | The frontend depends on the magazine and form endpoints, so backend contracts need to be fixed first |
| Use explicit JSON contracts instead of frontend knowledge of Prisma models | Preserves loose coupling and avoids leaking backend persistence details into the client |
| Keep the Issue 1 API contract focused on metadata plus the flipbook URL | Matches the current frontend reading flow and avoids carrying unused article-body data through the backend |
| Use manual UI/UX synthesis from the skill guidance for Phase 1 | The local Python entry required by the skill search script is not runnable in this environment |
| Use a file-based `prisma.config.ts` instead of deprecated `package.json#prisma` config | Keeps the backend aligned with the current Prisma configuration path and removes a known deprecation warning |
| Validate environment variables at startup with Zod | Fails fast for missing `DATABASE_URL`, `ALLOWED_ORIGIN`, or invalid `PORT` values |
| Keep Phase 2 verification to dependency install, TypeScript build, and Prisma client generation | There is no live MongoDB instance in the workspace, so endpoint execution and seed insertion cannot be fully exercised yet |
| Scaffold the frontend manually instead of relying on `create-next-app` or the shadcn CLI | Keeps the phase deterministic in this workspace and still produces a clean Next.js 14 + shadcn-style foundation |
| Create route-safe page skeletons for all required paths during Phase 3 | Lets the frontend compile and navigate cleanly before the full page implementations land in Phase 4 |
| Set `images.unoptimized = true` in Next config while still using `next/image` | Cloudinary already handles image transformation, and this avoids the self-hosted Next image optimizer path on the pinned Next 14 line |
| Keep route files short and move each major UI feature into its own component file during Phase 4 | Matches the requested component architecture and keeps page-level composition readable |
| Use local preview-mode form logic in Phase 4 for newsletter and contact components | Lets the UI demonstrate validation and feedback without prematurely coupling the pages to Phase 5 API logic |
| Implement article structured data during Phase 4 | JSON-LD is page-specific and can be rendered from the local article model before API wiring is swapped in |
| Prepare Netlify deployment around `/web` only for now | The frontend is already deployable as a standalone Next.js app, while moving the Express API into Netlify Functions would be a separate architecture change outside the current scope |
| Refactor the backend into feature-first modules before Phase 5 | Keeps domain code together and gives the API a stronger structure before integration work starts |
| Add a `status` lifecycle and separate reader/admin magazine routes before Phase 5 | Lets public routes expose published content only while admin routes manage draft, publish, unpublish, archive, and duplicate workflows explicitly |
| Add Swagger UI for the magazine module before Phase 5 | Gives the backend a fast visual contract-checking surface for reader and admin issue endpoints before frontend integration starts |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| Windows sandbox `CreateProcessWithLogonW failed: 1056` on one parallel shell batch | 1 | Re-ran the inspection commands in smaller independent calls instead of relying on the failed combined batch |
| `python.exe` could not be executed in this environment when attempting the UI/UX design-system script | 1 | Switched to a manual design-system definition using the loaded `ui-ux-pro-max` guidance instead of repeating the failed command |
| PowerShell blocked the `npx.ps1` shim when validating Prisma generation | 1 | Switched to `npx.cmd` instead of repeating the same failing shim |
| Prisma generation hit a sandbox `EPERM` path-resolution failure | 1 | Re-ran the generate command with approval outside the sandbox and verified client generation successfully |
| Initial frontend `npm install` timed out before finishing | 1 | Checked partial install state and reran the same command with a longer timeout |
| First frontend build failed on a `next-themes` type import path | 1 | Switched the import to `ThemeProviderProps` from `next-themes` itself and rebuilt successfully |
| Netlify failed to prepare the repo because `.codex/skills/ui-ux-pro-max-skill` was committed as a gitlink without a matching `.gitmodules` entry | 1 | Removed the broken submodule gitlink from the repository index and ignored the local skill folder so Netlify can clone the repo without submodule checkout |

## Notes
- Re-read this file before major implementation decisions.
- Update phase status immediately after phase completion.
- After each major phase, run a UI/UX quality pass and record the outcome.
- Phase 1 deliverables are documentation-only: confirmed environment state, implementation sequence, API/content contracts, and design-system direction.
- Phase 2 deliverables are complete for the backend scaffold and stop short of Phase 3 frontend work.
- Phase 3 deliverables are complete for the frontend foundation and stop short of Phase 4's full page implementation work.
- Phase 4 deliverables are complete for the modular page UI and stop short of Phase 5 API integration.
