# Magazine Web

Next.js 14 frontend for the digital magazine MVP.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component setup
- next-themes

## Environment Setup

Create `web/.env.local` and define:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

The frontend runs on port `3000`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `web/.env.local` from `web/.env.example`.

3. Start the development server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - start Next.js on port `3000`
- `npm run build` - production build
- `npm run start` - run the production server
- `npm run lint` - lint the project

## Included In This Phase

- token-driven light and dark theming
- shared navbar and footer
- theme toggle and mobile sheet navigation
- consent-gated Google Analytics loader
- metadata helper utilities
- route-safe page skeletons for `/`, `/about`, `/mission`, and `/issue-1`

## Notes

- All color tokens are defined in `app/globals.css` and mapped into Tailwind theme tokens.
- Images are configured for Cloudinary via `next/image`.
- The full editorial page implementations and API integrations are completed in later phases.
