# Magazine API

Express + TypeScript + Prisma backend for the digital magazine MVP.

## Stack

- Node.js
- Express
- TypeScript
- Prisma
- MongoDB
- Zod
- Helmet
- CORS
- express-rate-limit

## Required Environment Variables

Create `api/.env` from `api/.env.example` and provide values for:

```env
DATABASE_URL=
ALLOWED_ORIGIN=
PORT=4000
```

Example local frontend origin:

```env
ALLOWED_ORIGIN=http://localhost:3000
```

When the frontend is deployed to Netlify, set `ALLOWED_ORIGIN` to that exact site URL instead, for example:

```env
ALLOWED_ORIGIN=https://your-site.netlify.app
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Push the Prisma schema to MongoDB:

```bash
npm run db:push
```

3. Seed Issue 1 so the article endpoint works immediately:

```bash
npm run db:seed
```

4. Start the development server:

```bash
npm run dev
```

The API runs on port `4000` by default.

## Scripts

- `npm run dev` - start the API in watch mode
- `npm run build` - compile TypeScript to `dist/`
- `npm run start` - run the compiled server
- `npm run db:push` - push the Prisma schema to MongoDB and generate the client
- `npm run db:seed` - seed development data, including Issue 1

## Routes

- `POST /api/contact`
- `POST /api/newsletter`
- `GET /api/magazine/issue/:id`

## API Notes

- Contact submissions use a honeypot field for bot filtering. Bot-like submissions return a generic success response and are not stored.
- Newsletter duplicate emails return success without exposing whether the address already exists.
- Magazine content is returned as structured JSON blocks so the frontend can render rich long-form content without coupling to database internals.
