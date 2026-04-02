# Task Plan: Digital Magazine MVP

## Goal
Scaffold a production-ready MVP digital magazine web application with a Next.js 14 frontend in `/web` and an Express + Prisma + MongoDB backend in `/api`, delivered phase by phase with working article, newsletter, contact, theme, consent, and SEO flows.

## Current Phase
Phase 2 complete - awaiting user review

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
- [ ] Initialize `/web` with Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui, and next-themes
- [ ] Set up fonts, design tokens, Tailwind theme mapping, and global layout
- [ ] Build shared shell: navbar, footer, theme toggle, mobile sheet, cookie consent
- [ ] Add metadata helpers and environment setup
- [ ] Add frontend README and `.env.example`
- [ ] Review layout rhythm, hierarchy, and responsiveness baseline
- **Status:** pending

### Phase 4: UI implementation
- [ ] Build homepage sections and interactions
- [ ] Build About page with editorial story, team, and contact form UI
- [ ] Build Mission page with structured narrative and CTA
- [ ] Build Issue 1 reading page optimized for long-form reading
- [ ] Refine reusable components, spacing, and state design
- [ ] Run UI/UX quality pass against mobile, tablet, and desktop targets
- **Status:** pending

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
2. How should Issue 1 content be modeled in JSON so the backend can seed it immediately and the frontend can render rich long-form blocks cleanly?
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
| Represent article content as block-based JSON with inline text marks | Cleanly supports headings, paragraphs, images, and pull quotes while remaining easy to seed and render |
| Use manual UI/UX synthesis from the skill guidance for Phase 1 | The local Python entry required by the skill search script is not runnable in this environment |
| Use a file-based `prisma.config.ts` instead of deprecated `package.json#prisma` config | Keeps the backend aligned with the current Prisma configuration path and removes a known deprecation warning |
| Validate environment variables at startup with Zod | Fails fast for missing `DATABASE_URL`, `ALLOWED_ORIGIN`, or invalid `PORT` values |
| Keep Phase 2 verification to dependency install, TypeScript build, and Prisma client generation | There is no live MongoDB instance in the workspace, so endpoint execution and seed insertion cannot be fully exercised yet |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| Windows sandbox `CreateProcessWithLogonW failed: 1056` on one parallel shell batch | 1 | Re-ran the inspection commands in smaller independent calls instead of relying on the failed combined batch |
| `python.exe` could not be executed in this environment when attempting the UI/UX design-system script | 1 | Switched to a manual design-system definition using the loaded `ui-ux-pro-max` guidance instead of repeating the failed command |
| PowerShell blocked the `npx.ps1` shim when validating Prisma generation | 1 | Switched to `npx.cmd` instead of repeating the same failing shim |
| Prisma generation hit a sandbox `EPERM` path-resolution failure | 1 | Re-ran the generate command with approval outside the sandbox and verified client generation successfully |

## Notes
- Re-read this file before major implementation decisions.
- Update phase status immediately after phase completion.
- After each major phase, run a UI/UX quality pass and record the outcome.
- Phase 1 deliverables are documentation-only: confirmed environment state, implementation sequence, API/content contracts, and design-system direction.
- Phase 2 deliverables are complete for the backend scaffold and stop short of Phase 3 frontend work.
