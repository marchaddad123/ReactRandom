import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.tsx"
import { AuthBootstrap } from "./components/AuthBootstrap"
import "./index.css"

/*
 * =============================================================================
 * HOW LOGIN WORKS IN THIS APP (simple version)
 * =============================================================================
 *
 * Think of two lockers:
 *
 *   1) Firebase Auth  = the security guard
 *      - Remembers WHO you are (email/password or Google).
 *      - Keeps a "wristband" in the browser so you stay logged in after refresh.
 *
 *   2) Firestore      = a shared notebook
 *      - Stores extra info about you (name, photo, last login, …).
 *      - Document path looks like:  users/{your-user-id}
 *
 * Password rules (8+ chars, upper, lower, number, symbol) are checked in OUR
 * React code before we ask Auth to create an account. Firestore rules do NOT
 * check passwords — they only say who may read/write notebook pages.
 *
 * -----------------------------------------------------------------------------
 * STARTUP STEPS (what happens when the site loads)
 * -----------------------------------------------------------------------------
 *
 *   1. main.tsx mounts the app.
 *   2. AuthBootstrap turns on a Firebase listener: onAuthStateChanged.
 *      - "Hey Firebase, tell me if someone is already signed in."
 *   3. Firebase answers:
 *      - Nobody  → store.user = null  → ProtectedRoute sends you to /login
 *      - Someone → store.user = that person → you can open Home / Profile
 *   4. We show the UI right away from Auth data.
 *      Then, in the background, we save/update your Firestore profile
 *      (so login does not feel slow waiting on the notebook).
 *
 * -----------------------------------------------------------------------------
 * SIGN-IN / SIGN-UP STEPS
 * -----------------------------------------------------------------------------
 *
 *   Email login:     signInWithEmailAndPassword  → Auth checks email+password
 *   Email register:  createUserWithEmailAndPassword → Auth creates the account
 *   Google:          signInWithPopup             → Google window, then Auth
 *
 *   After ANY of those succeed, onAuthStateChanged fires again with the user.
 *   That is the single place that updates Zustand (useAuthStore).
 *
 * -----------------------------------------------------------------------------
 * WHO GUARDS THE PAGES?
 * -----------------------------------------------------------------------------
 *
 *   /login, /register  → public (anyone)
 *   /, /:username       → ProtectedRoute: must have store.user, else → /login
 *   /profile            → shortcut that redirects to /your-username
 *
 *   Zustand (useAuthStore) is the app's memory of "logged in or not".
 *   Firebase is the source of truth; Zustand just mirrors it for React.
 * =============================================================================
 */

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {/* URLs like /login and /profile */}
        <BrowserRouter>
            {/* Start listening to Firebase Auth before the rest of the UI runs */}
            <AuthBootstrap>
                <App />
            </AuthBootstrap>
        </BrowserRouter>
    </StrictMode>
)
