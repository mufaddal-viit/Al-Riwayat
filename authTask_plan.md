# Auth Task Plan — Production Authentication System

## Goal

Implement a production-grade, role-based authentication system for the magazine API supporting two user types: **ADMIN** and **CUSTOMER**. Customers self-register and manage their own profiles. Admins are seeded or promoted manually.

## Security Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  POST /auth/login                                                │
│  → Access Token  (JWT, 15 min)     → JSON response body         │
│  → Refresh Token (random, 7 days)  → httpOnly Secure cookie     │
└──────────────────────────────────────────────────────────────────┘
          ↓ every request
┌──────────────────────────────────────────────────────────────────┐
│  Authorization: Bearer <accessToken>                             │
│  requireAuth middleware verifies JWT signature + expiry          │
│  attaches req.user = { id, email, role }                         │
└──────────────────────────────────────────────────────────────────┘
          ↓ access token expires (401)
┌──────────────────────────────────────────────────────────────────┐
│  POST /auth/refresh  (cookie sent automatically)                 │
│  → hash incoming token, look up DB, verify not revoked/expired   │
│  → rotate: delete old token, issue new token + cookie            │
└──────────────────────────────────────────────────────────────────┘
          ↓ logout or reuse attack detected
┌──────────────────────────────────────────────────────────────────┐
│  POST /auth/logout                                               │
│  → revoke token family in DB + clear cookie                      │
└──────────────────────────────────────────────────────────────────┘
```

**Key security decisions:**
- Refresh tokens stored as **SHA-256 hash** in DB — never plain text
- Refresh token **rotation** on every use — reuse triggers full family revocation
- Access tokens are **stateless JWTs** — no DB lookup on every request
- Passwords hashed with **bcrypt** at cost factor 12
- Email must be verified before login is allowed
- All auth routes are **rate-limited** independently from the API global limiter
- `httpOnly + Secure + SameSite=Strict` cookie for refresh token

---

## Route Surface

### Public (no token required)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Customer self-registration |
| POST | `/api/auth/verify-email` | Confirm email with token |
| POST | `/api/auth/resend-verification` | Re-send verification email |
| POST | `/api/auth/login` | Login for both roles |
| POST | `/api/auth/refresh` | Rotate refresh token, issue new access token |
| POST | `/api/auth/forgot-password` | Request password reset email |
| POST | `/api/auth/reset-password` | Confirm reset with token + new password |

### Authenticated (any verified user)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/auth/me` | Get own profile |
| PATCH | `/api/auth/me` | Update profile (name, avatar) |
| PATCH | `/api/auth/me/password` | Change password (requires current password) |
| POST | `/api/auth/logout` | Revoke refresh token, clear cookie |
| DELETE | `/api/auth/me` | Soft-delete own account (customer only) |

### Admin only (`/api/admin/users`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/users` | List all users with pagination + filters |
| GET | `/api/admin/users/:id` | Get single user |
| PATCH | `/api/admin/users/:id` | Update role or isActive status |
| DELETE | `/api/admin/users/:id` | Hard delete user and all tokens |

---

## Module Structure

```
api/src/modules/auth/
  auth.schema.ts          ← Zod schemas for all auth payloads
  auth.service.ts         ← register, login, logout, reset logic
  token.service.ts        ← JWT sign/verify, refresh token CRUD
  email.service.ts        ← send verification and reset emails
  auth.controller.ts      ← thin HTTP handlers
  auth.routes.ts          ← route wiring

api/src/modules/users/
  users.service.ts        ← admin user queries and mutations
  users.controller.ts     ← admin HTTP handlers
  users.routes.ts         ← admin route wiring

api/src/middleware/
  requireAuth.ts          ← verify JWT, attach req.user
  requireRole.ts          ← RBAC guard factory
```

---

## Step-by-Step Implementation

### Step 1 — Prisma models

**Status: done** — `User`, `RefreshToken`, `EmailVerificationToken`, `PasswordResetToken` added to `schema.prisma`.

- `User` — core identity, role, email-verification flag, soft-delete flag
- `RefreshToken` — hashed token, userId, expiry, revocation, device metadata
- `EmailVerificationToken` — hashed token, userId, expiry
- `PasswordResetToken` — hashed token, userId, expiry, single-use flag

Run after completing schema:
```bash
npx prisma db push
```

---

### Step 2 — Environment variables

Add to `api/.env` and `api/.env.example`:

```env
# JWT
JWT_ACCESS_SECRET=<strong-random-64-char-hex>
JWT_REFRESH_SECRET=<strong-random-64-char-hex>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookie
COOKIE_DOMAIN=localhost

# Email (use Resend, Nodemailer+SMTP, or console stub for dev)
EMAIL_FROM=noreply@alriwayat.com
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=<resend-api-key>

# App
FRONTEND_URL=http://localhost:3000
```

Update `api/src/lib/env.ts` Zod schema to validate the new variables at startup.

---

### Step 3 — Install packages

```bash
cd api
npm install bcryptjs jsonwebtoken cookie-parser
npm install -D @types/bcryptjs @types/jsonwebtoken @types/cookie-parser
```

Optional but recommended for emails:
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

---

### Step 4 — `token.service.ts`

Responsibilities:
- `signAccessToken(payload)` → signed JWT string (15 min)
- `verifyAccessToken(token)` → decoded payload or throws
- `issueRefreshToken(userId, meta)` → generate `crypto.randomBytes(64)`, hash with SHA-256, store in DB, return plain token (sent to client once)
- `rotateRefreshToken(plainToken, meta)` → hash incoming → look up DB → verify not revoked/expired → delete old record → issue new refresh token
- `revokeRefreshToken(plainToken)` → hash → mark `isRevoked = true` or delete
- `revokeAllUserTokens(userId)` → delete all `RefreshToken` records for user (used on password change, account deactivation)

Implementation notes:
```ts
// Store the hash, never the plain token
const hash = crypto.createHash("sha256").update(plainToken).digest("hex");

// JWT payload — keep minimal
type AccessTokenPayload = { sub: string; email: string; role: Role };
```

---

### Step 5 — `email.service.ts`

Responsibilities:
- `sendVerificationEmail(to, token)` → link: `${FRONTEND_URL}/verify-email?token=<plain>`
- `sendPasswordResetEmail(to, token)` → link: `${FRONTEND_URL}/reset-password?token=<plain>`

Dev fallback: if `SMTP_HOST` is not set, log the email content to the console instead of throwing.

---

### Step 6 — `auth.schema.ts`

Zod schemas:
```ts
RegisterSchema      // firstName, lastName, email, password (min 8, complexity)
LoginSchema         // email, password
VerifyEmailSchema   // token (string)
ForgotPasswordSchema // email
ResetPasswordSchema  // token, newPassword
ChangePasswordSchema // currentPassword, newPassword
UpdateProfileSchema  // firstName?, lastName?, avatarUrl?
ResendVerificationSchema // email
```

Password complexity rule: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit.

---

### Step 7 — `auth.service.ts`

**`register(input)`**
1. Check email not already taken
2. Hash password with `bcrypt.hash(password, 12)`
3. Create `User` with `role: CUSTOMER`, `isEmailVerified: false`
4. Generate plain email verification token → hash → store `EmailVerificationToken` (expires 24h)
5. Call `email.service.sendVerificationEmail`
6. Return `{ message: "Registration successful. Check your email." }` — never return the token in the response

**`verifyEmail(token)`**
1. Hash incoming token
2. Find `EmailVerificationToken` where `tokenHash = hash` and `expiresAt > now`
3. Mark `User.isEmailVerified = true`
4. Delete the `EmailVerificationToken` record
5. Return `{ message: "Email verified." }`

**`login(email, password, meta)`**
1. Find user by email — if not found return generic `"Invalid credentials"` (never leak existence)
2. `bcrypt.compare(password, user.passwordHash)` — if false, same generic error
3. If `!user.isEmailVerified` → `403 "Please verify your email before logging in."`
4. If `!user.isActive` → `403 "Account suspended."`
5. Issue access token and refresh token
6. Return `{ accessToken, user: { id, email, role, firstName, lastName } }`

**`refresh(plainToken, meta)`**
1. Call `token.service.rotateRefreshToken`
2. Issue new access token
3. Return `{ accessToken }`

**`logout(plainToken)`**
1. Call `token.service.revokeRefreshToken`
2. Clear cookie

**`forgotPassword(email)`**
1. Find user — if not found, return the same success message (prevent email enumeration)
2. Delete existing unused `PasswordResetToken` for this user
3. Generate plain reset token → hash → store `PasswordResetToken` (expires 1h)
4. Send email
5. Always return `{ message: "If an account exists, a reset link has been sent." }`

**`resetPassword(token, newPassword)`**
1. Hash incoming token
2. Find `PasswordResetToken` where `tokenHash = hash`, `isUsed = false`, `expiresAt > now`
3. Hash new password
4. Update `User.passwordHash`
5. Mark token `isUsed = true`
6. Revoke all refresh tokens for the user (security: all devices logged out)
7. Return `{ message: "Password updated." }`

---

### Step 8 — `requireAuth.ts` middleware

```ts
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ ... });
  try {
    const payload = token.service.verifyAccessToken(header.slice(7));
    req.user = payload;   // { sub, email, role }
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) return res.status(401).json({ code: "TOKEN_EXPIRED" });
    return res.status(401).json({ code: "INVALID_TOKEN" });
  }
}
```

The frontend `client.ts` already handles `TOKEN_EXPIRED` → triggers `/auth/refresh` → retries the original request.

---

### Step 9 — `requireRole.ts` middleware

```ts
export function requireRole(...roles: Role[]) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions." });
    }
    next();
  };
}
```

Usage:
```ts
router.get("/admin/users", requireAuth, requireRole("ADMIN"), listUsers);
```

---

### Step 10 — Rate limiting for auth routes

Create a dedicated auth rate limiter in `api/src/middleware/authRateLimiter.ts`:

```ts
// Strict: login and forgot-password — 5 attempts per 15 min per IP
export const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, ... });

// Moderate: register — 3 per hour per IP
export const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, ... });

// Light: token refresh — 30 per 15 min per IP
export const refreshLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, ... });
```

---

### Step 11 — `auth.routes.ts`

```ts
// Public
router.post("/register",              registerLimiter, validate(RegisterSchema), register);
router.post("/verify-email",          validate(VerifyEmailSchema), verifyEmail);
router.post("/resend-verification",   validate(ResendVerificationSchema), resendVerification);
router.post("/login",                 loginLimiter, validate(LoginSchema), login);
router.post("/refresh",               refreshLimiter, refresh);
router.post("/forgot-password",       loginLimiter, validate(ForgotPasswordSchema), forgotPassword);
router.post("/reset-password",        validate(ResetPasswordSchema), resetPassword);

// Authenticated
router.get("/me",                     requireAuth, getMe);
router.patch("/me",                   requireAuth, validate(UpdateProfileSchema), updateProfile);
router.patch("/me/password",          requireAuth, validate(ChangePasswordSchema), changePassword);
router.post("/logout",                requireAuth, logout);
router.delete("/me",                  requireAuth, deleteOwnAccount);
```

---

### Step 12 — `users.routes.ts` (admin)

```ts
router.use(requireAuth, requireRole("ADMIN"));

router.get("/",       listUsers);     // ?page=1&limit=20&role=CUSTOMER&search=email
router.get("/:id",    getUserById);
router.patch("/:id",  validate(AdminUpdateUserSchema), updateUser);
router.delete("/:id", deleteUser);
```

---

### Step 13 — Wire into `app.ts`

```ts
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import adminUsersRoutes from "./modules/users/users.routes";

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminUsersRoutes);
```

---

### Step 14 — Seed first admin user

Add to `api/prisma/seed.ts`:

```ts
// Upsert default admin — change password immediately after first login
await prisma.user.upsert({
  where: { email: "admin@alriwayat.com" },
  update: {},
  create: {
    email: "admin@alriwayat.com",
    passwordHash: await bcrypt.hash("Admin@1234!", 12),
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN",
    isEmailVerified: true,
    isActive: true,
  },
});
```

---

### Step 15 — Frontend integration

Update `web/lib/api/client.ts`:

The refresh queue is already built. Wire the cookie credential flag:
```ts
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,   // ← sends httpOnly refresh token cookie automatically
  ...
});
```

Add auth service at `web/services/authService.ts`:
```ts
login(email, password)     → POST /auth/login → store accessToken
register(input)            → POST /auth/register
logout()                   → POST /auth/logout → clear local accessToken
getMe()                    → GET /auth/me
updateProfile(input)       → PATCH /auth/me
changePassword(input)      → PATCH /auth/me/password
forgotPassword(email)      → POST /auth/forgot-password
resetPassword(token, pw)   → POST /auth/reset-password
verifyEmail(token)         → POST /auth/verify-email
```

---

## Completion Checklist

### Backend
- [x] **Step 1** — Schema: User, RefreshToken, EmailVerificationToken, PasswordResetToken models — run `prisma db push` once DB is connected
- [x] **Step 2** — Env: add JWT secrets, cookie domain, SMTP, frontend URL to `.env` and Zod validator
- [x] **Step 3** — Packages: bcryptjs, jsonwebtoken, cookie-parser, nodemailer
- [x] **Step 4** — `token.service.ts`: sign/verify JWT, issue/rotate/revoke refresh tokens
- [x] **Step 5** — `email.service.ts`: verification and reset emails with console fallback
- [x] **Step 6** — `auth.schema.ts`: Zod schemas for all payloads
- [x] **Step 7** — `auth.service.ts`: register, verifyEmail, login, refresh, logout, forgotPassword, resetPassword, changePassword
- [x] **Step 8** — `requireAuth.ts` middleware: JWT verification, req.user attachment
- [x] **Step 9** — `requireRole.ts` middleware: RBAC guard factory
- [x] **Step 10** — Auth rate limiters: login (5/15min), register (10/hr), refresh (60/15min)
- [x] **Step 11** — `auth.controller.ts` + `auth.routes.ts`: all public and authenticated routes
- [x] **Step 12** — `users.controller.ts` + `users.routes.ts`: admin user management
- [x] **Step 13** — Wire into `app.ts`: cookieParser, auth routes, admin user routes
- [x] **Step 14** — `prisma/seed.ts`: seed first admin user
- [x] **Step 15** — Build check: `npm run build` passes with zero type errors

### Frontend
- [ ] Add `withCredentials: true` to axios instance
- [ ] `web/services/authService.ts`: all auth calls
- [ ] Login page (`/login`)
- [ ] Register page (`/register`)
- [ ] Email verification page (`/verify-email`)
- [ ] Forgot/reset password pages
- [ ] User profile page (`/account`)
- [ ] Auth context/store (Zustand or React Context) with `getMe` on mount
- [ ] Protected route wrapper for customer-only pages
- [ ] Admin guard for admin-only pages

---

## Security Notes for Production

| Item | Action |
|------|--------|
| JWT secrets | Use 64-char random hex, rotated periodically |
| HTTPS only | Set `Secure` flag on cookie — never works on HTTP in prod |
| Refresh token reuse | If a revoked token is presented, revoke the entire family immediately |
| Password reset link | Single-use, 1-hour expiry, invalidate all sessions after use |
| Email enumeration | Always return the same message for register/forgot regardless of existence |
| Admin seed password | Change immediately after first login |
| Admin routes | All `/api/admin/**` require ADMIN role — double check at route AND service layer |
| Logging | Never log passwordHash, access tokens, or refresh tokens |
| Rate limiting | Use Redis-backed limiter in production (`rate-limit-redis`) instead of in-memory |
