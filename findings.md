# Findings & Decisions

## Requirements
- Build a digital magazine MVP with `/web` for Next.js 14 and `/api` for Express.
- Use persistent planning files in the project root and work phase by phase.
- Frontend must use TypeScript, Tailwind CSS, shadcn/ui, next-themes, `Playfair Display`, and `Inter`.
- Required pages are `/`, `/about`, `/mission`, and `/issue-1`.
- Frontend must include SEO metadata per page, article JSON-LD, consent-gated GA4, responsive navigation, and theme switching.
- All frontend color usage must flow through CSS variables defined in `globals.css` and mapped into Tailwind.
- Backend must use Node.js, Express, TypeScript, Prisma, MongoDB, Zod, rate limiting, helmet, cors, and dotenv.
- Prisma must use a `db push` workflow for MongoDB, with development-ready Issue 1 bootstrap data.
- Contact and newsletter routes must validate inputs, rate limit by IP, and avoid leaking duplication or bot-detection details.
- The final scaffold must be runnable and MVP-clean, not a one-shot placeholder dump.

## Research Findings
- The `planning-with-files` skill requires restoring context first, creating `task_plan.md`, `findings.md`, and `progress.md`, and keeping them current after each phase.
- The `ui-ux-pro-max` skill is mandatory for interface work here because the task changes structure, typography, layout, interaction patterns, and responsive behavior.
- High-priority UI/UX checks from the skill for this project:
  - Accessibility: visible focus states, semantic hierarchy, sufficient contrast, and keyboard support.
  - Touch and interaction: minimum 44x44 touch targets and clear async feedback on form submission.
  - Layout and responsive behavior: mobile-first layout, predictable breakpoints, no horizontal scroll, consistent container widths.
  - Typography and readability: body line-height within the requested 1.7 range and controlled article measure around 65-75 characters.
- The repo is currently almost empty aside from `.codex`, `prompt.md`, `layout_prompt.md`, and `layout.jpg`, so both apps will need to be scaffolded from scratch.
- The workspace is not currently a Git repository, so repo hygiene must be handled through the generated app files and documentation rather than existing Git metadata.
- Local runtime readiness for later phases is good for Node-based work: `node` is `v22.13.0` and `npm` is `10.9.2`.
- The Python entry required by the `ui-ux-pro-max` search script is not executable in this environment, so the design-system direction for Phase 1 must be synthesized manually from the skill guidance.
- `layout_prompt.md` confirms a card-based, compact, mobile-first editorial homepage with this preserved hierarchy: hero wrapper, embedded featured issue card, secondary CTA cards, then footer.
- Prisma's official MongoDB quickstart confirms that MongoDB projects should use `prisma db push` rather than SQL-style migrations.
- Prisma's seeding docs now recommend a `prisma.config.ts` file for seed configuration instead of the older `package.json#prisma` field.
- `npm install` completed successfully in `/api`, and the resolved Prisma version is `6.19.3`.
- TypeScript compilation for the backend passed.
- Prisma client generation also passed after switching from the blocked `npx.ps1` shim to `npx.cmd` and rerunning once outside the sandbox.
- A Git repository now exists at the workspace root, and the newly created frontend app currently appears as untracked changes.
- Frontend installation resolved Next.js `14.2.35`, satisfying the Next 14 requirement while confirming the exact installed patch version.
- `npm run lint` and `npm run build` both passed in `/web`.
- `npm audit --omit=dev` reports one remaining high-severity vulnerability in the pinned Next.js 14 runtime line; upgrading to the fixed major would violate the user's Next 14 requirement.
- The Next.js image-optimizer-related risk is partially mitigated by setting `images.unoptimized = true`, which is acceptable here because Cloudinary already handles optimization.
- The Phase 4 UI implementation composes cleanly into the existing frontend shell and still passes `npm run lint` and `npm run build`.
- The user explicitly requested feature-specific component architecture, so each major page section now lives in its own dedicated component file instead of being embedded inside long route files.
- Netlify's current Next.js docs state that Next.js 13.5+ is supported with zero configuration through the OpenNext adapter, including App Router support.
- Netlify's monorepo docs state that the base directory is where dependencies are installed and the build runs; because this repo has no root workspace package and the site lives in `/web`, the correct deploy base for this project is `/web`.
- Netlify's monorepo docs also state that `package directory` is only needed when the site files live in a different place from the build base, and that a root-level `netlify.toml` can set the base directory on first site setup.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Use separate `web` and `api` applications with explicit environment variables and no direct shared runtime dependency | Keeps the frontend and backend loosely coupled as requested |
| Plan around `npm`-based scaffolding per app unless the repo reveals an existing package-manager constraint later | Simplest production-ready default for a fresh workspace |
| Seed Issue 1 through Prisma-compatible application code rather than relying on manual database setup | Ensures article rendering works immediately in development |
| Model article body as structured JSON blocks that map cleanly to typed frontend renderers | Supports headings, paragraphs, emphasis, images, and pull quotes without over-engineering a CMS |
| Establish the editorial design system early: serif display headings, sans-serif body, restrained premium palette, 8px rhythm, and tokenized colors only | Prevents the MVP from drifting into a generic SaaS look |
| Backend scaffolding will be completed before frontend scaffolding | The frontend needs stable API contracts for article loading, newsletter signup, and contact submission |
| Frontend API access will be isolated behind small fetch helpers using `NEXT_PUBLIC_API_URL` | Keeps the UI independent from backend implementation details and makes environment switching trivial |
| The article endpoint will expose a presentation-friendly contract instead of the raw Prisma record | Reduces coupling and protects future schema evolution |
| The homepage visual system will preserve the wireframe composition from `layout_prompt.md` while upgrading typography, rhythm, and interaction quality | Satisfies the provided layout intent without producing a generic landing page |
| The backend will use Zod-validated environment parsing in `src/lib/env.ts` | Ensures bad startup configuration fails immediately rather than producing later runtime ambiguity |
| The API will include a small `/api/health` route | Provides a simple operational readiness check without coupling it to database state |
| Newsletter duplication will be handled by catching Prisma unique-constraint errors | Avoids leaking subscriber existence while keeping writes single-purpose and explicit |
| The Prisma seed path will upsert Issue 1 by slug | Makes repeated development seeding idempotent |
| The frontend foundation uses a manual shadcn-style component setup with `components.json` and local component files | Avoids CLI friction while still matching the requested design-system and component contract |
| All required routes are present as metadata-aware skeleton pages in Phase 3 | Keeps routing, navigation, and build verification complete before content-heavy implementation begins |
| Google Analytics loading is controlled by a client-side consent provider backed by `localStorage` | Meets the cookie-consent requirement without loading analytics before acceptance |
| The Next.js image optimizer is disabled in config while preserving `next/image` usage | Cloudinary is the intended image layer, and this reduces self-hosted exposure on the pinned Next 14 branch |
| Phase 4 page routes act only as composition layers | Keeps route files short and makes each page feature independently maintainable |
| Homepage, About, Mission, and Issue 1 UI are split into dedicated feature components under page-specific folders | Aligns with the requested one-feature-per-file architecture |
| Contact and newsletter forms use preview-mode validation and feedback before API integration | Preserves UX intent now without violating the phase boundary between UI and API work |
| Issue 1 rendering uses a local frontend article model that mirrors the API contract shape | Enables realistic long-form UI rendering now and reduces swap cost in Phase 5 |
| Frontend image assets are normalized under `web/public/images/...` and consumed via public URLs | Gives the Next app a stable static-asset structure and removes binary imports from the app root |
| Shared brand lockups now use the local `web/public/images/logo.jpg` asset through a reusable `SiteBrand` component | Replaces the temporary text monogram with a real logo while keeping header and footer branding consistent |
| Netlify deployment is configured around the Next.js frontend only | `/web` is already a valid Netlify target, while `/api` remains a separate Express service that should be deployed independently and allowed through CORS |
| The frontend site URL should come from `NEXT_PUBLIC_SITE_URL` instead of a hardcoded placeholder domain | Canonical metadata, OG URLs, JSON-LD, and share links need a real deploy URL in production |
| `NEXT_PUBLIC_API_URL` is optional for the current Netlify deploy | Phase 5 API integration has not been wired yet, so the frontend can be deployed by itself without a live backend |

## Phase 1 Output

### Confirmed repo and environment state
- Root contents currently include only planning docs, the prompt files, the layout reference assets, and the local `.codex` skill folder.
- There is no existing `/web` or `/api` app yet.
- There is no `.git` directory at the workspace root.
- Node and npm are available for later scaffolding.

### Scaffolding strategy
- `/api`
  - Initialize as an independent npm package.
  - Use TypeScript with a fast dev runner such as `tsx` and a compile target suitable for Node 22.
  - Install runtime dependencies: `express`, `cors`, `helmet`, `dotenv`, `zod`, `@prisma/client`, `express-rate-limit`.
  - Install dev dependencies: `typescript`, `tsx`, `prisma`, `@types/express`, `@types/cors`, `@types/node`.
  - Configure scripts for `dev`, `build`, `start`, `db:push`, and `db:seed`.
- `/web`
  - Initialize as an independent Next.js 14 App Router app with TypeScript and Tailwind CSS.
  - Add `next-themes`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, and shadcn dependencies/components.
  - Use app-router layouts and shared UI components rather than page-local repetition.
  - Keep image usage exclusively through `next/image` with Cloudinary remote patterns.

### Shared architecture boundaries
- The backend owns validation, persistence, rate limiting, and API response shapes.
- The frontend owns rendering, interaction states, theme handling, metadata, and consent-gated analytics.
- Shared behavior is contract-based, not code-shared:
  - `POST /api/newsletter`
  - `POST /api/contact`
  - `GET /api/magazine/issue-1`
- The frontend should not assume Prisma model names or database-specific field shapes.

### API contract decisions
- `POST /api/newsletter`
  - Request body: `{ "email": string }`
  - Success response: `200 { "success": true, "message": "If eligible, the address has been recorded." }`
  - Duplicate emails return the same success shape to avoid exposing subscriber state.
- `POST /api/contact`
  - Request body: `{ "name": string, "email": string, "message": string, "honeypot": string }`
  - Success response for valid and honeypot-triggered submissions: `200 { "success": true, "message": "Message received." }`
  - Invalid user input returns validation errors from Zod in a safe client-facing shape.
- `GET /api/magazine/issue-1`
  - Success response: `{ "title": string, "issueNumber": number, "publishedAt": string, "coverImageUrl": string, "author": string, "body": MagazineBodyBlock[] }`

### Article body contract
- `MagazineBodyBlock[]` will use a block-based JSON structure:
  - `heading`: `{ "type": "heading", "level": 2 | 3, "content": RichTextSpan[] }`
  - `paragraph`: `{ "type": "paragraph", "content": RichTextSpan[] }`
  - `image`: `{ "type": "image", "imageUrl": string, "alt": string, "caption"?: string }`
  - `pullQuote`: `{ "type": "pullQuote", "quote": string, "attribution"?: string }`
- `RichTextSpan` shape:
  - `{ "text": string, "bold"?: boolean, "italic"?: boolean }`
- This structure is sufficient for the MVP feature set and maps directly to typed frontend renderers.

### Initial design-system direction
- Product style: premium editorial, readable, compact, and content-first.
- Typography:
  - `Playfair Display` for headings and issue titles.
  - `Inter` for body copy, UI labels, and form text.
  - Body line-height fixed around `1.7`.
  - Article measure capped at `72ch`.
- Layout:
  - Mobile-first with validated breakpoints at `375px`, `768px`, and `1280px`.
  - Hero section remains dominant on the homepage.
  - Shared container strategy will use predictable content widths and an 8px spacing rhythm.
  - Long-form article content uses a narrower reading column than the homepage shell.
- Components:
  - Rounded cards and pills, but restrained rather than playful.
  - Buttons, inputs, and CTA blocks need distinct hover, pressed, disabled, and focus-visible states.
  - Mobile navigation prioritizes large tap targets and a clean sheet layout.
- Color system:
  - Define semantic tokens only in `globals.css`.
  - Use muted editorial neutrals for surfaces with a small set of premium accents.
  - No hardcoded component colors; Tailwind will consume CSS variables only.
- Motion:
  - Keep transitions in the subtle 150-250ms range.
  - Favor opacity, transform, and shadow changes over layout-shifting motion.
- Homepage composition guidance from the layout brief:
  - Large rounded hero wrapper.
  - Embedded featured issue card.
  - Two strong CTA/supporting cards beneath.
  - Full-width rounded footer bar.

## Phase 2 Output

### Backend scaffold created
- `/api/package.json` with scripts for development, build, Prisma push, and Prisma seed.
- `/api/tsconfig.json` for strict TypeScript compilation targeting Node 22.
- `/api/.env.example` with `DATABASE_URL`, `ALLOWED_ORIGIN`, and `PORT`.
- `/api/README.md` with setup, scripts, and route documentation.
- Root `.gitignore` now ignores `.env`, build artifacts, and dependency directories.

### Prisma and MongoDB setup
- Added `/api/prisma/schema.prisma` with the three required MongoDB models:
  - `Magazine`
  - `ContactSubmission`
  - `NewsletterSubscriber`
- Added `/api/prisma/seed.ts` to upsert Issue 1 development content.
- Added `/api/prisma.config.ts` so Prisma seed configuration uses the current file-based config style.

### Backend implementation details
- Added startup env validation in `/api/src/lib/env.ts`.
- Added shared Prisma client management in `/api/src/lib/prisma.ts`.
- Added Issue 1 content and block types in `/api/src/lib/issue1.ts`.
- Added Zod schemas for contact and newsletter payloads.
- Added reusable validation and rate-limiter middleware.
- Implemented controllers and routes for:
  - `POST /api/contact`
  - `POST /api/newsletter`
  - `GET /api/magazine/issue-1`
- Added global security middleware in `/api/src/app.ts`:
  - `helmet()`
  - CORS restricted to `ALLOWED_ORIGIN`
  - JSON parsing
  - 404 handler
  - central error handler

### Verification status
- Verified:
  - `npm install`
  - `npm run build`
  - `prisma generate` with a temporary local MongoDB URL string
- Not yet verified:
  - `npm run db:push`
  - `npm run db:seed`
  - live endpoint execution against MongoDB
- Reason:
  - No running MongoDB instance or real `DATABASE_URL` is available in the workspace at this stage.

## Phase 3 Output

### Frontend scaffold created
- `/web/package.json` with Next.js 14, Tailwind, next-themes, and the required shadcn-style dependencies.
- `/web/tsconfig.json`, `next.config.mjs`, `postcss.config.js`, `tailwind.config.ts`, `.eslintrc.json`, and `components.json`.
- `/web/.env.example` and `/web/README.md`.
- `/web/package-lock.json` generated by `npm install`.

### Design system and shared shell
- Added `Playfair Display` and `Inter` via `next/font`.
- Added editorial CSS variables in `/web/app/globals.css` and mapped them into Tailwind theme tokens.
- Added shared providers for:
  - theme management via `next-themes`
  - consent state via `localStorage`
- Added shared shell components for:
  - navbar with centered links, More dropdown, and mobile sheet
  - footer
  - theme toggle with sun and moon icons
  - cookie consent banner
  - consent-gated GA loader

### Metadata and routing foundation
- Added metadata helpers in `/web/lib/metadata.ts`.
- Added site and env helpers in `/web/lib/site.ts` and `/web/lib/public-env.ts`.
- Added route-safe pages for:
  - `/`
  - `/about`
  - `/mission`
  - `/issue-1`
- Each current route includes `generateMetadata`.

### Verification status
- Verified:
  - `npm install`
  - `npm run lint`
  - `npm run build`
- Verified runtime characteristics:
  - Next.js installed as `14.2.35`
  - all current app routes prerender successfully
- Residual risk:
  - `npm audit --omit=dev` reports a high-severity Next.js advisory affecting the pinned Next 14 line
  - the project remains on Next 14 to satisfy the user requirement
  - image-optimizer exposure is reduced by using `images.unoptimized = true`

## Phase 4 Output

### Component architecture
- Homepage features:
  - `/web/components/home/home-hero.tsx`
  - `/web/components/home/featured-issue-card.tsx`
  - `/web/components/home/about-preview-section.tsx`
  - `/web/components/home/newsletter-preview-section.tsx`
- About page features:
  - `/web/components/about/about-story-section.tsx`
  - `/web/components/about/about-team-section.tsx`
  - `/web/components/about/contact-form-section.tsx`
- Mission page features:
  - `/web/components/mission/mission-statement-section.tsx`
  - `/web/components/mission/mission-values-section.tsx`
  - `/web/components/mission/mission-stance-section.tsx`
  - `/web/components/mission/mission-cta-section.tsx`
- Issue 1 features:
  - `/web/components/issue/issue-cover-hero.tsx`
  - `/web/components/issue/issue-share-actions.tsx`
  - `/web/components/issue/issue-rich-content.tsx`
  - `/web/components/issue/article-structured-data.tsx`

### Page implementation details
- Homepage now includes:
  - editorial hero
  - featured issue card
  - about preview section
  - newsletter CTA section
- About page now includes:
  - magazine story section
  - team grid with photos
  - contact form UI including hidden honeypot field
- Mission page now includes:
  - mission statement
  - editorial values grid
  - publication stance section
  - CTA section
- Issue 1 page now includes:
  - full-width cover hero
  - article metadata
  - rich body rendering from block content
  - pull quote and embedded image support
  - social share actions
  - bottom newsletter CTA
  - Article JSON-LD

### Supporting content modules
- Added page-oriented content files:
  - `/web/lib/content/home-content.ts`
  - `/web/lib/content/about-content.ts`
  - `/web/lib/content/mission-content.ts`
  - `/web/lib/content/issue-content.ts`
- Preview-only reader comments now follow the same pattern through `/web/lib/content/comments.ts`
- The comments composer works best as an inset editorial panel inside `CardFooter` rather than a bare border-top form row
- Raw editorial copy that should not be wired into the app yet can live as markdown source files beside the typed content modules in `/web/lib/content`
- Reader engagement surfaces work best as paired editorial cards: comments on the left and a lighter contact/composer form on the right
- The paired reader-engagement layout is now mounted on the homepage and collapses to a vertical stack on mobile
- `web/lib/content/about-content-source.md` is now the source reference for the typed `editorialTeam` list in `web/lib/content/about-content.ts`
- Team cards read better with a smaller centered avatar treatment when placeholder imagery is used, instead of a large full-width portrait block
- Header logo sizing should continue to flow through `SiteBrand` so shell refinements stay centralized
- Mobile sheet navigation should dismiss immediately on link tap rather than waiting for route transition behavior
- The app shell should default to light theme unless a user has already saved a different preference
- The Heyzine issue reader can be embedded directly as a responsive iframe, with a direct-link fallback in case browser or provider framing rules interfere
- The issue page should reuse the shared newsletter section instead of maintaining a second issue-only newsletter CTA component
- The flipbook iframe needs viewport-based height on mobile; aspect-ratio alone makes the reader too short for comfortable reading
- Share actions should stay seamless: no card wrapper, no shadows, just compact outline buttons in a mobile-friendly grid
- These keep the UI realistic in Phase 4 without coupling page components directly to the backend.

### Verification status
- Verified:
  - `npm run lint`
  - `npm run build`
- Quality pass performed in code:
  - mobile-first section stacking
  - clear desktop grid expansion
  - consistent 8px-derived spacing rhythm
  - visible focus and hover states on interactive controls
- Remaining boundary:
  - newsletter and contact submissions are still preview-mode in this phase
  - live API wiring remains intentionally deferred to Phase 5
- Asset refinement:
  - Homepage and Issue 1 cover image references now resolve from the public asset path `web/public/images/hero/home-hero.webp` instead of placeholder remote URLs
  - Metadata and article structured data convert that relative asset path into absolute URLs for SEO output
  - The backend seed data remains unchanged for now because `/api` should not depend on a private file path inside `/web`; if the same image must come from the API in Phase 5, it needs a public asset URL or a shared static-serving decision
- Brand refinement:
  - The current logo asset now lives at `web/public/images/logo.jpg` and is used in the shared site brand treatment
  - Header and footer brand areas now render through `next/image` via a reusable site-brand component
  - Build verification was intentionally skipped for this change because the user explicitly asked not to run build unless requested
- Asset structure note:
  - The proposed `about-hero` and `menu.svg` files are not present in the workspace yet
  - The `hero` and `icons` directories now exist under `web/public/images` so future assets can drop into the expected structure without another refactor

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| One parallel shell invocation failed with a Windows sandbox process error | Retried the commands in smaller independent batches and continued successfully |
| The local Python command failed with `The file cannot be accessed by the system` | Avoided repeating the failed attempt and derived the design-system direction manually from the skill guidance |
| PowerShell execution policy blocked `npx.ps1` | Switched to the `npx.cmd` entry point |
| Prisma generation failed inside the sandbox with an `EPERM` path error | Re-ran the command outside the sandbox and verified generation |
| The initial frontend install timed out | Re-ran the install with a longer timeout and it succeeded |
| The first frontend build failed on an invalid `next-themes` type import path | Corrected the import and rebuilt successfully |
| Frontend production dependency audit reports one high-severity Next.js advisory | Kept the user-required Next 14 line, disabled the image optimizer path, and recorded the remaining risk for review |

## Resources
- User requirements source: `prompt.md`
- Planning workflow: `.codex/skills/planning-with-files/SKILL.md`
- UI/UX workflow: `.codex/skills/ui-ux-pro-max/SKILL.md`
- Homepage layout brief: `layout_prompt.md`
- Prisma MongoDB quickstart: https://www.prisma.io/docs/v6/prisma-orm/quickstart/mongodb
- Prisma seeding docs: https://www.prisma.io/docs/v6/orm/prisma-migrate/workflows/seeding
- Next.js 14 docs: https://nextjs.org/docs/14
- shadcn/ui docs: https://ui.shadcn.com/docs
- next-themes repository: https://github.com/pacocoursey/next-themes

## Visual/Browser Findings
- No visual reference has been reviewed yet. `layout.jpg` exists in the repo and may be useful later if the implementation needs to align with a provided composition or art direction.
- `layout_prompt.md` describes a compact editorial homepage with a large rounded hero container, a tall vertical image block, a featured issue card inside the hero, two equal CTA cards below, and a rounded full-width footer.
- The frontend foundation currently presents a consistent editorial shell with centered desktop navigation, a restrained card system, rounded containers, and responsive spacing that already reads coherently at the shell level before the full UI pages are built.
- The implemented page UI now follows that shell with stronger feature-specific hierarchy: hero first, supporting sections second, and calmer CTA surfaces at the bottom of each flow.
