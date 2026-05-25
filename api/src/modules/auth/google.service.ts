import { AppError } from "../../lib/AppError";
import { getAdminAuth } from "../../lib/firebase-admin";
import { ensureUserDocument } from "../users/me.service";
import { signAccessToken } from "./token.service";

export interface GoogleAuthUser {
  id: string;      // Firebase UID
  email: string;
  name: string;
  picture: string | null;
  role: "CUSTOMER";
}

interface GoogleLoginResult {
  accessToken: string;
  user: GoogleAuthUser;
}

/**
 * Verify a Firebase ID token from the Google provider and issue a backend JWT.
 * No database write — identity lives in Firebase, our JWT is the session proof.
 */
export async function loginWithGoogle(idToken: string): Promise<GoogleLoginResult> {
  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(idToken);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[auth.google] verifyIdToken failed:", message);
    throw new AppError(
      `Invalid Google sign-in token: ${message}`,
      401,
      "INVALID_ID_TOKEN",
    );
  }

  if (!decoded.email || !decoded.email_verified) {
    throw new AppError(
      "Google account email is not verified.",
      401,
      "EMAIL_NOT_VERIFIED",
    );
  }

  const user: GoogleAuthUser = {
    id: decoded.uid,
    email: decoded.email,
    name: decoded.name ?? decoded.email.split("@")[0],
    picture: decoded.picture ?? null,
    role: "CUSTOMER",
  };

  // Idempotent upsert — ensures every authenticated user has a profile doc.
  try {
    await ensureUserDocument({
      uid: user.id,
      email: user.email,
      displayName: user.name,
      photoUrl: user.picture,
    });
  } catch (err) {
    // Failure here shouldn't block login; log and continue.
    const message = err instanceof Error ? err.message : String(err);
    console.error("[auth.google] ensureUserDocument failed:", message);
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    picture: user.picture ?? undefined,
  });

  return { accessToken, user };
}
