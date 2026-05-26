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
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

`NEXT_PUBLIC_API_URL` must include the `/api` prefix.

The frontend runs on port `3001`.

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

- `npm run dev` - start Next.js on port `3001`
- `npm run build` - production build
- `npm run start` - run the production server
- `npm run lint` - lint the project

## Included In This Phase

- token-driven light and dark theming
- shared navbar and footer
- theme toggle and mobile sheet navigation
- consent-gated Google Analytics loader
- metadata helper utilities
- route-safe page skeletons for `/`, `/about`, and `/issue/[slug]`

## Notes

- All color tokens are defined in `app/globals.css` and mapped into Tailwind theme tokens.
- Images are configured for Cloudinary via `next/image`.
- The full editorial page implementations and API integrations are completed in later phases.

## Netlify Deployment

This repository is configured to deploy the Next.js frontend from `/web` as a static export.

1. Connect the repository to Netlify.
2. Keep the root `netlify.toml` in place. It sets the Netlify base directory to `web`, runs `npm run build`, and publishes `web/out`.
3. In Netlify, set these environment variables for the site:

```env
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_API_URL=https://your-api.vercel.app/api
```

4. Use your final custom domain instead of `*.netlify.app` once it is available so canonical metadata and share links stay correct.

The Express backend is deployed separately from `/api` on Vercel. Set the API deployment's `ALLOWED_ORIGIN` to the frontend URL you use on Netlify or Vercel.
