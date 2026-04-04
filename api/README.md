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

- `npm run docs:generate` - regenerate the magazine Swagger/OpenAPI JSON from route annotations
- `npm run dev` - start the API in watch mode
- `npm run build` - compile TypeScript to `dist/`
- `npm run start` - run the compiled server
- `npm run db:push` - push the Prisma schema to MongoDB and generate the client
- `npm run db:seed` - seed development data, including Issue 1

## Swagger UI

- `GET /api/docs/magazine` - interactive Swagger UI for the magazine reader and admin endpoints
- `GET /api/docs/magazine.json` - raw OpenAPI JSON for the same magazine endpoints

The current Swagger setup is intentionally scoped to the `magazine` module so reader and admin issue routes can be inspected and tested cleanly before the rest of the API is documented.

## Routes

- `POST /api/contact`
- `POST /api/newsletter`
- `GET /api/magazine/issues`
- `GET /api/magazine/issue/:id`
- `GET /api/magazine/issues/featured`
- `GET /api/magazine/issues/search?q=...`
- `POST /api/admin/magazine/issues`
- `GET /api/admin/magazine/issues`
- `GET /api/admin/magazine/issues/:id`
- `PATCH /api/admin/magazine/issues/:id`
- `PUT /api/admin/magazine/issues/:id`
- `DELETE /api/admin/magazine/issues/:id`
- `PATCH /api/admin/magazine/issues/:id/publish`
- `PATCH /api/admin/magazine/issues/:id/unpublish`
- `PATCH /api/admin/magazine/issues/:id/archive`
- `POST /api/admin/magazine/issues/:id/duplicate`

## API Notes

- Contact submissions use a honeypot field for bot filtering. Bot-like submissions return a generic success response and are not stored.
- Newsletter duplicate emails return success without exposing whether the address already exists.
- Magazine content is returned as issue metadata plus the flipbook URL needed by the current frontend reader.
- Backend feature code is organized under `api/src/modules/contact`, `api/src/modules/newsletter`, and `api/src/modules/magazine`.
- Magazine issues now use a `status` lifecycle (`draft`, `published`, `archived`) so reader routes expose published content only and admin routes handle editorial state transitions explicitly.
- The featured reader route currently returns the latest published issue by `publishedAt`.
- Admin magazine routes are not authenticated yet; access control still needs to be added before exposing this API publicly.
- Swagger docs for the magazine module are generated with `swagger-autogen` from route annotations and served with `swagger-ui-express`.
