import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill"
import lazySizes from "lazysizes"
import { StrictMode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.tsx"
import { AuthBootstrap } from "./components/AuthBootstrap"
import "./index.css"

/*
 * Flag emoji polyfill (Windows etc.): loads "Twemoji Country Flags".
 * emoji-picker-element / body text then fall back through the emoji font stack
 * in index.css (--font-sans), same approach as the Nuxt app.
 */
polyfillCountryFlagEmojis("Twemoji Mozilla")

// Ready for lazy-loaded images later: <img class="lazyload" data-src="..." />
lazySizes.cfg.expand = 100

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
 *   /, /:username, /:username/posts → ProtectedRoute (must be logged in)
 *   /profile                        → shortcut that redirects to /your-username
 *
 *   Zustand (useAuthStore) is the app's memory of "logged in or not".
 *   Firebase is the source of truth; Zustand just mirrors it for React.
 * =============================================================================
 */

const container = document.getElementById("root")!
// Reuse the root on Vite HMR so we do not call createRoot() twice on #root.
const root: Root =
    (import.meta.hot?.data.root as Root | undefined) ?? createRoot(container)

if (import.meta.hot) {
    import.meta.hot.data.root = root
}

root.render(
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
