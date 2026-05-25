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
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=false
NEXT_PUBLIC_ENABLE_API=false
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

`NEXT_PUBLIC_ENABLE_API` should stay `false` in production until the backend URL
is live. `NEXT_PUBLIC_API_URL` can be the backend root URL or include `/api`; the
app normalizes either form. Set `NEXT_PUBLIC_ENABLE_API=true` when you want the
frontend to call a running local or deployed backend.
`NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS` should stay `false` unless Vercel Web
Analytics and Speed Insights are enabled for the project.
`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is public and only needed if frontend code
builds Cloudinary URLs. The API key and API secret belong in `api/.env`, not in
the web app.

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
NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=false
NEXT_PUBLIC_ENABLE_API=false
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

4. Use your final custom domain instead of `*.netlify.app` once it is available so canonical metadata and share links stay correct.

The current frontend deploy does not require the Express backend at all. `/api` can stay in the repository without being deployed.

When you later connect the backend, deploy `/api` separately and set its `ALLOWED_ORIGIN` to the frontend URL you use on Netlify.
