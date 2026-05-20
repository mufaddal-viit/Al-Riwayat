import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

import { publicEnv } from "./public-env";

const REQUIRED_KEYS = ["apiKey", "authDomain", "projectId", "appId"] as const;

function envVarName(key: (typeof REQUIRED_KEYS)[number]): string {
  return `NEXT_PUBLIC_FIREBASE_${key
    .replace(/([A-Z])/g, "_$1")
    .toUpperCase()}`;
}

function initFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();

  const missing = REQUIRED_KEYS.filter(
    (key) => !publicEnv.firebase[key] || publicEnv.firebase[key].trim() === "",
  );
  if (missing.length > 0) {
    throw new Error(
      `[firebase] Missing required config: ${missing
        .map(envVarName)
        .join(", ")}. Set these in the frontend env (Vercel dashboard or .env.local).`,
    );
  }

  return initializeApp({
    apiKey: publicEnv.firebase.apiKey,
    authDomain: publicEnv.firebase.authDomain,
    projectId: publicEnv.firebase.projectId,
    appId: publicEnv.firebase.appId,
  });
}

const app = initFirebaseApp();

export const firebaseAuth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const db: Firestore = getFirestore(app);
