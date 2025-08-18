// firebase/client.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCI-prfSNMFEOFYxNwgbMROUWi8KuaRIsk",
  authDomain: "echoprep-281b4.firebaseapp.com",
  projectId: "echoprep-281b4",
  storageBucket: "echoprep-281b4.appspot.com",   // ⚠️ small fix: should end with .appspot.com
  messagingSenderId: "430070487247",
  appId: "1:430070487247:web:927219cc8014afced33fba",
  measurementId: "G-1HEPTVCTVM",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
