import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

import { publicEnv } from "./public-env";

function initFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
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
