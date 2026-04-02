You are a senior full-stack developer. Scaffold a production-ready MVP web application for a digital magazine website.

Follow every instruction exactly.

## Mandatory Execution Workflow

You MUST use the `planning-with-files` skill.

If the skill is unavailable in the current session, follow the same workflow manually.

Before writing any code:

1. Create and maintain these project-root files:
   - `task_plan.md` for the detailed execution plan and phase tracking
   - `findings.md` for architecture decisions, research, constraints, and tradeoffs
   - `progress.md` for the step-by-step implementation log

2. Always read existing planning markdown files before continuing work.

3. Break the project into phases and work on only one phase at a time. Use this default sequence unless dependency order requires a slight adjustment:
   - Project setup
   - Backend setup
   - Frontend foundation
   - UI implementation
   - API integration
   - Testing and polish

4. Complete each phase fully before moving to the next one.

5. Update `progress.md` after each meaningful step.

6. Record important decisions, research findings, and tradeoffs in `findings.md`.

7. Never attempt to generate the entire project in a single response.

8. After each major phase:
   - Review UI/UX quality
   - Improve spacing, alignment, hierarchy, and readability
   - Refactor components for reusability where justified
   - Improve code structure if needed

Repeat this cycle until the result is production-quality for an MVP.

## Project Structure

```text
/Magazine  #folder already created
  /web        # Next.js frontend
  /api        # Express backend
```

## Architecture Expectations

- Keep the frontend and backend loosely coupled.
- Use clean, explicit API contracts.
- Structure code for future scalability without over-engineering.
- Keep the implementation MVP-focused, clean, and runnable.

## Frontend Requirements

### Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- next-themes

### Pages To Build

#### `/` - Homepage

- Hero section with magazine name and tagline
- Featured issue card for Issue 1 with cover image and CTA button: `Read Issue 1`
- Brief about section with a `Read More` link to `/about`
- Newsletter signup section with email input and submit button calling the API
- Footer with social links and copyright

#### `/about` - About Us

- Magazine story and editorial background section
- Team section with name, role, and photo
- Contact form with:
  - `name`
  - `email`
  - `message`
  - hidden honeypot field
  - API submission
- Footer

#### `/mission` - Mission

- Mission statement section
- Editorial values or publishing principles section
- Short section explaining what the magazine stands for
- CTA linking to Issue 1 or About page
- Footer

#### `/issue-1` - Full Magazine Read

- Full scrollable long-form reading page
- Full-width cover image at the top using `next/image`
- Magazine title, issue number, publish date, and author
- Rich body content rendered from the database
- Support these rich content elements:
  - headings
  - paragraphs
  - bold text
  - italic text
  - embedded images
  - pull quotes
- Social share actions for:
  - Twitter/X
  - WhatsApp
  - LinkedIn
  - copy link
- Newsletter signup section at the bottom
- Footer

### Shared Frontend Requirements

- Light and dark theme using `next-themes`
- Use CSS variables only for colors
- Do not hardcode colors anywhere
- Define all color tokens in `globals.css` and map them into Tailwind config
- Navbar must include:
  - magazine logo or name on the left
  - nav links centered: `Home`, `About`, `Mission`, `More`
  - `More` must be a dropdown menu
  - `More` should include at minimum `Issue 1`
  - additional dropdown items may be simple secondary links and are not core MVP scope
  - theme toggle on the right
  - mobile hamburger menu using shadcn `Sheet`
- Theme toggle uses sun and moon icons
- Use `next/image` everywhere images are rendered
- Use Cloudinary URLs as image sources
- Mobile-first responsive design
- Validate layouts at:
  - mobile: 375px
  - tablet: 768px
  - desktop: 1280px
- Typography:
  - `Playfair Display` via `next/font` for headings
  - `Inter` via `next/font` for body text
  - body line height: `1.7`
  - max reading width for article content: `72ch`
- SEO on every page using `generateMetadata`:
  - unique title
  - unique description
  - `og:image`
  - `og:title`
  - `og:description`
  - canonical URL
  - Twitter card metadata
- The article page must include Article structured data as JSON-LD

### Analytics And Consent

- Add Google Analytics 4
- Load GA only after cookie consent is accepted
- Add a simple cookie consent banner fixed to the bottom of the screen with:
  - `We use cookies for analytics.`
  - `Accept`
  - `Decline`
- Store consent in `localStorage`
- Load and fire the GA script only when the user accepts

### shadcn/ui Components To Install

- Button
- Badge
- Card
- DropdownMenu
- Sheet
- Separator
- Input
- Textarea
- Label

### Frontend Environment Variables

Use `.env.local` and include:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

Nothing sensitive should be prefixed with `NEXT_PUBLIC_`.

## UI/UX Requirements

You MUST apply advanced UI/UX principles using `ui-ux-pro-max`.

If that skill is unavailable, apply the same principles manually.

Design direction:

- editorial, premium, readable
- not generic SaaS
- optimized for long-form magazine reading
- cohesive across homepage, about page, and article page

Mandatory UI/UX expectations:

1. Visual hierarchy
   - clear content prioritization: Hero -> Featured -> Supporting Content -> CTA
   - strong typography contrast
   - consistent spacing using an 8px-based rhythm

2. Layout system
   - consistent container widths
   - grid-based alignment
   - predictable vertical spacing rhythm

3. Interaction design
   - smooth hover, focus, and transition states
   - clear button states: hover, active, disabled
   - visible and accessible focus states

4. UX flows
   - frictionless newsletter signup with clear success and error feedback
   - contact form with validation, error handling, and success state
   - long-form reading experience optimized for comfort and scanning

5. Mobile UX
   - thumb-friendly interactions
   - clean navigation
   - strong tap targets and spacing

6. Accessibility
   - semantic HTML throughout
   - ARIA only where needed
   - sufficient color contrast

7. Consistency
   - reusable UI patterns
   - design tokens via CSS variables only

Do not just assemble components. Design a cohesive user experience.

## Backend Requirements

### Tech Stack

- Node.js
- Express
- TypeScript
- Prisma
- MongoDB
- Zod
- express-rate-limit
- helmet
- cors
- dotenv

### Backend Folder Structure

```text
/api
  /src
    /routes
      contact.ts
      newsletter.ts
      magazine.ts
    /controllers
      contact.controller.ts
      newsletter.controller.ts
      magazine.controller.ts
    /middleware
      validate.ts
      rateLimiter.ts
    /lib
      prisma.ts
    /schemas
      contact.schema.ts
      newsletter.schema.ts
    app.ts
    server.ts
  .env
  prisma/
    schema.prisma
```

### API Endpoints

#### `POST /api/contact`

Fields:

- `name`
- `email`
- `message`
- `honeypot`

Requirements:

- validate with Zod
- honeypot must be empty or the request should be silently rejected
- save valid submissions to `ContactSubmission`
- rate limit to 5 requests per 15 minutes per IP

#### `POST /api/newsletter`

Fields:

- `email`

Requirements:

- validate with Zod
- if the email already exists, return success silently without exposing duplication
- save new emails to `NewsletterSubscriber`
- rate limit to 5 requests per 15 minutes per IP

#### `GET /api/magazine/issue-1`

Requirements:

- return the full Issue 1 content from the database
- response fields:
  - `title`
  - `issueNumber`
  - `publishedAt`
  - `coverImageUrl`
  - `author`
  - `body`

### Backend Security Requirements

- apply `helmet()` globally
- configure CORS to allow only the frontend origin from env via `ALLOWED_ORIGIN`
- apply rate limiting to contact and newsletter routes
- validate all inputs with Zod before touching the database
- use Prisma only, no raw SQL
- store secrets in `.env`, never hardcode them
- ensure `.env` is ignored by git

## Database Requirements

Use Prisma with MongoDB.

Important:

- Prisma Migrate is not supported for MongoDB
- use a `prisma db push` workflow instead of SQL-style migrations
- include a seed or bootstrap path for Issue 1 content so development works immediately

### Models

```prisma
model Magazine {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  title         String
  issueNumber   Int
  slug          String   @unique
  publishedAt   DateTime
  coverImageUrl String
  author        String
  body          Json
  createdAt     DateTime @default(now())
}

model ContactSubmission {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  email     String
  message   String
  createdAt DateTime @default(now())
}

model NewsletterSubscriber {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  email        String   @unique
  subscribedAt DateTime @default(now())
  isActive     Boolean  @default(true)
}
```

Additional database requirement:

- Include a `prisma db push`-ready initial schema
- Include development-ready bootstrap data for Issue 1 so the article flow works without manual database entry

## Development Setup Requirements

- `/web` and `/api` must each have their own `package.json`
- each app must have a README with setup instructions
- `/web` runs on port `3000`
- `/api` runs on port `4000`
- both apps must include a `.env.example` listing required variable names only, with no values
- backend `.env.example` must include at minimum:
  - `DATABASE_URL`
  - `ALLOWED_ORIGIN`
- the generated code must be runnable as scaffolded

## Output Rules

- Do not dump all files at once
- Work step by step using the planning workflow
- Prioritize correctness over speed
- Ensure generated code is runnable
- Do not leave unimplemented TODOs
- Avoid placeholder content unless necessary
- Where placeholder content is necessary, keep the workflow fully functional

## Definition Of Done

The scaffold is complete only when all of the following are true:

- frontend and backend are both scaffolded and runnable
- Issue 1 can be fetched from the API and rendered on `/issue-1`
- homepage, about page, and article page are functional
- newsletter signup and contact form submit to the backend successfully
- theming works in both light and dark mode
- cookie consent correctly gates GA loading
- responsive layouts work at 375px, 768px, and 1280px
- the code is clean, cohesive, and MVP-appropriate
