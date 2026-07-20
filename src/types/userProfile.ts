/**
 * Shape of one row in Firestore: users/{uid}
 * Auth knows the password; this type is only the public-ish profile fields.
 */
export type UserProfile = {
    uid: string
    /** URL handle, e.g. /ada-lovelace — unique among users */
    username: string
    email: string | null
    displayName: string | null
    photoURL: string | null
    /** "google" or "email" (how they signed in) */
    provider: string
    createdAt: string
    lastLoginAt: string
}
