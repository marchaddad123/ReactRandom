import type { User } from "firebase/auth"
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where
} from "firebase/firestore"
import type { UserProfile } from "../types/userProfile"
import { db } from "./firebase"

/** Paths we already use — usernames must not steal these. */
const RESERVED_USERNAMES = new Set(["login", "register", "profile"])

/** Did they sign in with Google or with email/password? */
function resolveProvider(user: User): string {
    const providerId = user.providerData[0]?.providerId
    if (providerId === "google.com") return "google"
    if (providerId === "password") return "email"
    return providerId ?? "unknown"
}

/** Firestore timestamps → normal ISO date strings for the UI. */
function toIso(value: unknown): string {
    if (value instanceof Timestamp) return value.toDate().toISOString()
    if (typeof value === "string") return value
    if (value instanceof Date) return value.toISOString()
    return new Date().toISOString()
}

/** "Ada Lovelace" → "ada-lovelace" for /ada-lovelace URLs. */
export function slugifyUsername(raw: string): string {
    const slug = raw
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 24)

    return slug || "user"
}

/** Guess a URL handle from Auth (not uniqueness-checked — Firestore upsert fixes that). */
function suggestUsername(user: User): string {
    const base =
        user.displayName?.trim() ||
        user.email?.split("@")[0] ||
        `user-${user.uid.slice(0, 8)}`
    let slug = slugifyUsername(base)
    if (RESERVED_USERNAMES.has(slug) || slug.length < 2) {
        slug = `user-${user.uid.slice(0, 8)}`
    }
    return slug
}

/** Turn a Firestore document into our UserProfile shape. */
function mapUserDoc(uid: string, data: Record<string, unknown>): UserProfile {
    const fallbackUsername =
        typeof data.username === "string" && data.username.length > 0
            ? data.username
            : uid

    return {
        uid,
        username: fallbackUsername,
        email: (data.email as string | null | undefined) ?? null,
        displayName: (data.displayName as string | null | undefined) ?? null,
        photoURL: (data.photoURL as string | null | undefined) ?? null,
        provider: (data.provider as string | undefined) ?? "unknown",
        createdAt: toIso(data.createdAt),
        lastLoginAt: toIso(data.lastLoginAt)
    }
}

/**
 * Quick profile built only from Auth (no network wait).
 * Used so the UI can show a name/photo immediately after login.
 */
export function profileFromAuthUser(user: User): UserProfile {
    const createdAt = user.metadata.creationTime
        ? new Date(user.metadata.creationTime).toISOString()
        : new Date().toISOString()

    return {
        uid: user.uid,
        username: suggestUsername(user),
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: resolveProvider(user),
        createdAt,
        lastLoginAt: new Date().toISOString()
    }
}

/** Find a user by their URL handle (/username). */
export async function getUserProfileByUsername(
    username: string
): Promise<UserProfile | null> {
    const snap = await getDocs(
        query(
            collection(db, "users"),
            where("username", "==", username.toLowerCase()),
            limit(1)
        )
    )
    if (snap.empty) return null
    const d = snap.docs[0]!
    return mapUserDoc(d.id, d.data())
}

/** Pick a free username; keep the same one if this uid already owns it. */
async function allocateUsername(user: User): Promise<string> {
    const preferred = suggestUsername(user)
    const taken = await getUserProfileByUsername(preferred)
    if (!taken || taken.uid === user.uid) return preferred
    // Someone else has that name → add a short piece of the uid.
    return slugifyUsername(`${preferred}-${user.uid.slice(0, 6)}`)
}

/**
 * Save (or update) this user in the notebook: users/{uid}.
 * Keeps an existing username forever; assigns one on first save.
 */
export async function upsertUserProfile(user: User): Promise<UserProfile> {
    const ref = doc(db, "users", user.uid)
    const existing = await getDoc(ref)
    const base = profileFromAuthUser(user)

    const existingUsername = existing.exists()
        ? existing.data().username
        : undefined
    const username = (
        typeof existingUsername === "string" && existingUsername.length > 0
            ? existingUsername
            : await allocateUsername(user)
    ).toLowerCase()

    const createdAt = existing.exists()
        ? toIso(existing.data().createdAt)
        : base.createdAt

    await setDoc(
        ref,
        {
            uid: base.uid,
            username,
            email: base.email,
            displayName: base.displayName,
            photoURL: base.photoURL,
            provider: base.provider,
            createdAt: Timestamp.fromDate(new Date(createdAt)),
            lastLoginAt: serverTimestamp()
        },
        { merge: true }
    )

    return {
        ...base,
        username,
        createdAt
    }
}

/** Read one user page from the notebook by uid. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, "users", uid))
    if (!snap.exists()) return null
    return mapUserDoc(uid, snap.data())
}

/** Change only the display name field on that user's page (username stays put). */
export async function updateUserDisplayName(
    uid: string,
    displayName: string
): Promise<void> {
    await updateDoc(doc(db, "users", uid), { displayName })
}

/** Everyone in the users collection (for the Home directory list). */
export async function listUserProfiles(): Promise<UserProfile[]> {
    try {
        const snap = await getDocs(
            query(collection(db, "users"), orderBy("lastLoginAt", "desc"))
        )
        return snap.docs.map((d) => mapUserDoc(d.id, d.data()))
    } catch {
        const snap = await getDocs(collection(db, "users"))
        return snap.docs
            .map((d) => mapUserDoc(d.id, d.data()))
            .sort((a, b) => b.lastLoginAt.localeCompare(a.lastLoginAt))
    }
}
