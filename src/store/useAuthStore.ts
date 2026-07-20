import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    updateProfile,
    type User
} from "firebase/auth"
import { create } from "zustand"
import { auth, googleProvider } from "../lib/firebase"
import { isPasswordValid, validatePassword } from "../lib/password"
import {
    getUserProfile,
    profileFromAuthUser,
    updateUserDisplayName,
    upsertUserProfile
} from "../lib/userProfile"
import type { UserProfile } from "../types/userProfile"

/**
 * Zustand store = the app's short-term memory about login.
 * Firebase is still the boss; this store just makes the current user easy
 * for React components to read (user, profile, loading, error).
 */
type AuthState = {
    /** Firebase Auth user, or null if logged out */
    user: User | null
    /** Extra info we keep in Firestore (and a fast copy from Auth) */
    profile: UserProfile | null
    /** True while a sign-in / sign-up / sign-out request is running */
    loading: boolean
    /** False until the first onAuthStateChanged answer arrives */
    initialized: boolean
    /**
     * False until the Firestore profile save finishes for the current user.
     * Use this before trusting profile.username in the URL.
     */
    profileSynced: boolean
    /** Friendly error text for login/register forms */
    error: string | null
    initAuthListener: () => () => void
    signInEmail: (email: string, password: string) => Promise<void>
    signUpEmail: (
        email: string,
        password: string,
        displayName: string
    ) => Promise<void>
    signInGoogle: () => Promise<void>
    signOut: () => Promise<void>
    updateDisplayName: (displayName: string) => Promise<void>
    clearError: () => void
}

// Stops us from starting two Firestore saves for the same user at once.
const profileSyncInFlight = new Map<string, Promise<void>>()

/** Turn Firebase's cryptic error codes into short human messages. */
function authErrorMessage(error: unknown): string {
    if (typeof error === "object" && error !== null && "code" in error) {
        const code = String((error as { code: string }).code)
        switch (code) {
            case "auth/invalid-credential":
            case "auth/wrong-password":
            case "auth/user-not-found":
                return "Invalid email or password."
            case "auth/email-already-in-use":
                return "An account with this email already exists."
            case "auth/weak-password":
            case "auth/password-does-not-meet-requirements":
                return "Password must be 8–64 characters and include upper, lower, number, and symbol."
            case "auth/invalid-email":
                return "Please enter a valid email address."
            case "auth/popup-closed-by-user":
                return "Sign-in popup was closed before completing."
            case "auth/too-many-requests":
                return "Too many attempts. Try again later."
            default:
                break
        }
    }
    if (error instanceof Error) return error.message
    return "Something went wrong. Please try again."
}

/**
 * Write the user into Firestore WITHOUT blocking the login screen.
 * If they sign out before it finishes, we ignore the late result.
 */
function syncProfileInBackground(
    user: User,
    set: (partial: Partial<AuthState>) => void
) {
    const existing = profileSyncInFlight.get(user.uid)
    if (existing) return existing

    const task = upsertUserProfile(user)
        .then((profile) => {
            if (auth.currentUser?.uid === user.uid) {
                // Now profile.username is the real one saved in Firestore.
                set({ profile, profileSynced: true })
            }
        })
        .catch(() => {
            // Login already worked. Notebook save is "nice to have".
            if (auth.currentUser?.uid === user.uid) {
                set({ profileSynced: true })
            }
        })
        .finally(() => {
            profileSyncInFlight.delete(user.uid)
        })

    profileSyncInFlight.set(user.uid, task)
    return task
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    loading: false,
    initialized: false,
    profileSynced: false,
    error: null,

    // Used when switching between Login ↔ Register so old errors do not stick.
    clearError: () => set({ error: null }),

    /**
     * Subscribe to Firebase Auth.
     * Returns a cleanup function so we can stop listening later.
     */
    initAuthListener: () => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Logged out (or never logged in).
            if (!user) {
                set({
                    user: null,
                    profile: null,
                    initialized: true,
                    loading: false,
                    profileSynced: false
                })
                return
            }

            // Logged in: unlock the UI NOW using Auth data…
            // profileSynced stays false until Firestore upsert finishes.
            set({
                user,
                profile: profileFromAuthUser(user),
                initialized: true,
                loading: false,
                profileSynced: false,
                error: null
            })

            // …then quietly update the Firestore notebook in the background.
            syncProfileInBackground(user, set)
        })

        return unsubscribe
    },

    /** Existing account: email + password. */
    signInEmail: async (email, password) => {
        set({ loading: true, error: null })
        try {
            await signInWithEmailAndPassword(auth, email, password)
            // onAuthStateChanged will set user / profile next.
        } catch (error) {
            set({ loading: false, error: authErrorMessage(error) })
            throw error
        }
    },

    /** Brand-new account: create in Auth, set display name, then listener takes over. */
    signUpEmail: async (email, password, displayName) => {
        set({ loading: true, error: null })
        // Our rules first (Auth has its own rules too, but we check early for nicer UI).
        if (!isPasswordValid(password)) {
            const message =
                validatePassword(password) ??
                "Password does not meet requirements."
            set({ loading: false, error: message })
            throw new Error(message)
        }
        try {
            const credential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            )
            await updateProfile(credential.user, { displayName })
            // Firestore profile save happens in onAuthStateChanged (background).
        } catch (error) {
            set({ loading: false, error: authErrorMessage(error) })
            throw error
        }
    },

    /** Opens a Google popup; Firebase creates/links the Auth user. */
    signInGoogle: async () => {
        set({ loading: true, error: null })
        try {
            await signInWithPopup(auth, googleProvider)
        } catch (error) {
            set({ loading: false, error: authErrorMessage(error) })
            throw error
        }
    },

    /** Tell Firebase to forget this browser session. */
    signOut: async () => {
        set({ loading: true, error: null })
        try {
            await firebaseSignOut(auth)
            set({
                user: null,
                profile: null,
                loading: false,
                profileSynced: false
            })
        } catch (error) {
            set({ loading: false, error: authErrorMessage(error) })
            throw error
        }
    },

    /** Update name in Auth AND in the Firestore notebook. */
    updateDisplayName: async (displayName) => {
        const { user } = get()
        if (!user) throw new Error("Not signed in.")

        set({ loading: true, error: null })
        try {
            await updateProfile(user, { displayName })
            await updateUserDisplayName(user.uid, displayName)
            const profile =
                (await getUserProfile(user.uid)) ??
                profileFromAuthUser(auth.currentUser ?? user)
            set({
                user: auth.currentUser,
                profile: { ...profile, displayName },
                loading: false
            })
        } catch (error) {
            set({ loading: false, error: authErrorMessage(error) })
            throw error
        }
    }
}))
