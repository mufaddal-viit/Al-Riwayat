import nodemailer, { type Transporter } from "nodemailer";

import { env } from "../../lib/env";

// ─── Transporter ──────────────────────────────────────────────────────────────

/**
 * Lazily create a single transporter for the process lifetime.
 * If SMTP credentials are not configured (development), the transporter
 * is null and emails are printed to the console instead.
 */
let _transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (_transporter !== null) return _transporter;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null; // console fallback — no SMTP configured
  }

  _transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 465,
    secure: (env.SMTP_PORT ?? 465) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return _transporter;
}

// ─── Internal send helper ─────────────────────────────────────────────────────

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendMail(options: MailOptions): Promise<void> {
  const transporter = getTransporter();

  if (!transporter) {
    // Development fallback — never reaches production because SMTP is required there
    console.log("\n─── [EMAIL — dev console fallback] ─────────────────────");
    console.log(`  To:      ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    // Strip HTML tags for readable console output
    console.log(
      `  Body:    ${options.html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()}`,
    );
    console.log("────────────────────────────────────────────────────────\n");
    return;
  }

  await transporter.sendMail({
    from: `"Al-Riwayat Magazine" <${env.EMAIL_FROM}>`,
    ...options,
  });
}

// ─── Email templates ──────────────────────────────────────────────────────────

function buildVerificationEmail(link: string): string {
  return `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
      <h2 style="font-family:Georgia,serif;margin-bottom:8px">Verify your email</h2>
      <p style="color:#555;line-height:1.6">
        Thanks for signing up to <strong>Al-Riwayat Magazine</strong>.
        Click the button below to verify your email address.
        This link expires in <strong>24 hours</strong>.
      </p>
      <a href="${link}"
         style="display:inline-block;margin:24px 0;padding:12px 28px;background:#1a1a1a;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
        Verify Email
      </a>
      <p style="color:#999;font-size:13px">
        If you didn't create an account, you can safely ignore this email.<br>
        Or copy this link: <a href="${link}" style="color:#555">${link}</a>
      </p>
    </div>
  `;
}

function buildPasswordResetEmail(link: string): string {
  return `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
      <h2 style="font-family:Georgia,serif;margin-bottom:8px">Reset your password</h2>
      <p style="color:#555;line-height:1.6">
        We received a request to reset your <strong>Al-Riwayat Magazine</strong> password.
        Click the button below to choose a new one.
        This link expires in <strong>1 hour</strong> and can only be used once.
      </p>
      <a href="${link}"
         style="display:inline-block;margin:24px 0;padding:12px 28px;background:#1a1a1a;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
        Reset Password
      </a>
      <p style="color:#999;font-size:13px">
        If you didn't request a password reset, you can safely ignore this email.
        Your password will not change until you click the link above.<br>
        Or copy this link: <a href="${link}" style="color:#555">${link}</a>
      </p>
    </div>
  `;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  plainToken: string,
): Promise<void> {
  const link = `${env.FRONTEND_URL}/verify-email?token=${plainToken}`;
  await sendMail({
    to,
    subject: "Verify your Al-Riwayat Magazine account",
    html: buildVerificationEmail(link),
  });
}

export async function sendPasswordResetEmail(
  to: string,
  plainToken: string,
): Promise<void> {
  const link = `${env.FRONTEND_URL}/reset-password?token=${plainToken}`;
  await sendMail({
    to,
    subject: "Reset your Al-Riwayat Magazine password",
    html: buildPasswordResetEmail(link),
  });
}
