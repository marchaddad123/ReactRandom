import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Keys come from .env.local (VITE_FIREBASE_*). They tell the SDK which Firebase project to use.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// One Firebase app for the whole site.
export const firebaseApp = initializeApp(firebaseConfig)

// Auth = "who is logged in?" (email / Google). Not the notebook.
export const auth = getAuth(firebaseApp)

// Firestore = the notebook where we store user profiles under users/{uid}.
export const db = getFirestore(firebaseApp)

// Used by "Continue with Google".
export const googleProvider = new GoogleAuthProvider()
// Always show the account picker (handy if you have more than one Google account).
googleProvider.setCustomParameters({ prompt: "select_account" })
