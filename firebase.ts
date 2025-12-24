
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA-IUUeMGHFEeF0dXM32dmjvjAKjE2WG2I",
  authDomain: "sati-agio.firebaseapp.com",
  databaseURL: "https://sati-agio-default-rtdb.firebaseio.com",
  projectId: "sati-agio",
  storageBucket: "sati-agio.firebasestorage.app",
  messagingSenderId: "900443208772",
  appId: "1:900443208772:web:43a256582c03a913465011",
  measurementId: "G-HG83GRM5Z7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services passing the app instance explicitly to avoid "Component not registered" errors
const auth = getAuth(app);
const db = getFirestore(app); // Keeping for legacy/migration if needed, or can be removed if full switch
const database = getDatabase(app); // Realtime Database
const googleProvider = new GoogleAuthProvider();

let analytics = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, auth, db, database, googleProvider, analytics };
