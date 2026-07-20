import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Static web config for now (swap to VITE_* env later if you want).
const firebaseConfig = {
    apiKey: "AIzaSyCZsYsCtomDUklYb9LPJbx-ZxMNtsZNKXk",
    authDomain: "reactrandom.firebaseapp.com",
    projectId: "reactrandom",
    storageBucket: "reactrandom.firebasestorage.app",
    messagingSenderId: "76175378193",
    appId: "1:76175378193:web:4faabc174317114d542eb0"
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
