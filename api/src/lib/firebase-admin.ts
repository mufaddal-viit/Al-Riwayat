import {
  initializeApp,
  getApps,
  cert,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { env } from "./env";
import { AppError } from "./AppError";

let app: App | undefined;

function initAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]!;

  const projectId = env.FIREBASE_PROJECT_ID;
  const clientEmail = env.FIREBASE_CLIENT_EMAIL;
  const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new AppError(
      "Firebase Admin credentials are not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
      500,
      "FIREBASE_NOT_CONFIGURED",
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
}

export function getAdminAuth(): Auth {
  if (!app) app = initAdminApp();
  return getAuth(app);
}

export function getAdminDb(): Firestore {
  if (!app) app = initAdminApp();
  return getFirestore(app);
}
