import { type FormEvent, useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { getUserProfile, getUserProfileByUsername } from "../lib/userProfile"
import { cx, ui } from "../lib/ui"
import { useAuthStore } from "../store/useAuthStore"
import { useNotificationStore } from "../store/useNotificationStore"
import type { UserProfile } from "../types/userProfile"

function formatDate(iso: string | undefined) {
    if (!iso) return "—"
    try {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(new Date(iso))
    } catch {
        return iso
    }
}

function initials(
    name: string | null | undefined,
    email: string | null | undefined
) {
    const source = name?.trim() || email?.trim() || "?"
    const parts = source.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
        return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
    }
    return source.slice(0, 2).toUpperCase()
}

/** Load by /username first; if that misses, try treating the param as a uid. */
async function resolveProfileParam(param: string): Promise<UserProfile | null> {
    const byUsername = await getUserProfileByUsername(param)
    if (byUsername) return byUsername
    return getUserProfile(param)
}

/**
 * /:username — your page (editable) or someone else's (read-only basics).
 */
export function ProfilePage() {
    const { username: usernameParam } = useParams<{ username: string }>()
    const param = usernameParam?.toLowerCase() ?? ""

    const authUser = useAuthStore((state) => state.user)
    const myProfile = useAuthStore((state) => state.profile)
    const profileSynced = useAuthStore((state) => state.profileSynced)
    const loading = useAuthStore((state) => state.loading)
    const updateDisplayName = useAuthStore((state) => state.updateDisplayName)
    const signOut = useAuthStore((state) => state.signOut)
    const notify = useNotificationStore((state) => state.updateNotification)

    const [viewed, setViewed] = useState<UserProfile | null>(null)
    const [fetchState, setFetchState] = useState<
        "loading" | "ready" | "missing"
    >("loading")
    const [draftName, setDraftName] = useState<string | null>(null)

    const isOwn = Boolean(viewed && authUser && viewed.uid === authUser.uid)

    // When viewing yourself, prefer the live Zustand profile (stays fresh after edits).
    const profile: UserProfile | null = isOwn && myProfile ? myProfile : viewed

    const displayName = draftName ?? profile?.displayName ?? ""

    useEffect(() => {
        let cancelled = false

        async function load() {
            if (!param) {
                setFetchState("missing")
                setViewed(null)
                return
            }

            setDraftName(null)

            // Own profile: use the store. If Firestore is still saving, keep spinning
            // so we do not flash "not found" for a username that is not written yet.
            if (
                myProfile &&
                (myProfile.username === param || myProfile.uid === param)
            ) {
                setViewed(myProfile)
                setFetchState(profileSynced ? "ready" : "loading")
                return
            }

            // Still syncing our own notebook — wait instead of declaring missing.
            if (authUser && !profileSynced) {
                setFetchState("loading")
                return
            }

            setFetchState("loading")

            try {
                const found = await resolveProfileParam(param)
                if (cancelled) return
                setViewed(found)
                setFetchState(found ? "ready" : "missing")
            } catch {
                if (!cancelled) {
                    setViewed(null)
                    setFetchState("missing")
                }
            }
        }

        void load()
        return () => {
            cancelled = true
        }
    }, [param, myProfile, profileSynced, authUser])

    async function handleSave(event: FormEvent) {
        event.preventDefault()
        const next = displayName.trim()
        if (!next) {
            notify({ message: "Display name cannot be empty.", error: true })
            return
        }
        try {
            await updateDisplayName(next)
            setDraftName(null)
            notify({ message: "Profile updated.", error: false })
        } catch {
            notify({ message: "Could not update profile.", error: true })
        }
    }

    async function handleSignOut() {
        try {
            await signOut()
            notify({ message: "Signed out.", error: false })
        } catch {
            notify({ message: "Could not sign out.", error: true })
        }
    }

    if (fetchState === "loading") {
        return (
            <div className="flex justify-center py-16">
                <div
                    className="border-primary h-9 w-9 animate-spin rounded-full border-2 border-t-transparent"
                    role="status"
                    aria-label="Loading profile"
                />
            </div>
        )
    }

    if (fetchState === "missing" || !profile) {
        return (
            <section className={cx(ui.panel, "animate-rise")}>
                <p className={ui.eyebrow}>Not found</p>
                <h2 className={ui.title}>No profile for @{param}</h2>
                <p className={ui.hint}>
                    That username is not in Firestore yet. Ask them to sign in
                    once so a username is saved.
                </p>
                <div className={ui.actions}>
                    <Link
                        to="/"
                        className={cx(ui.btn, ui.btnPrimary, "no-underline")}
                    >
                        Back to Home
                    </Link>
                </div>
            </section>
        )
    }

    // After sync, jump from a guessed handle or /uid to the real /username.
    if (
        profileSynced &&
        myProfile?.username &&
        authUser &&
        (param === myProfile.uid ||
            (viewed?.uid === authUser.uid && param !== myProfile.username))
    ) {
        return (
            <Navigate
                to={`/${myProfile.username}`}
                replace
            />
        )
    }

    const photoURL = profile.photoURL
    const email = profile.email

    return (
        <div className="animate-rise space-y-6">
            <section className={ui.panel}>
                <p className={ui.eyebrow}>
                    {isOwn ? "Your profile" : "Member profile"}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                    {photoURL ? (
                        <img
                            src={photoURL}
                            alt=""
                            className="border-line h-16 w-16 rounded-2xl border object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div
                            className="bg-primary/15 text-primary font-display flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold"
                            aria-hidden
                        >
                            {initials(
                                displayName || profile.displayName,
                                email
                            )}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h2 className={cx(ui.title, "text-[1.65rem]")}>
                            {displayName || profile.displayName || "Profile"}
                        </h2>
                        <p className="text-primary m-0 text-sm font-semibold">
                            /{profile.username}
                        </p>
                        {isOwn && email ? (
                            <p className="text-muted m-0 truncate text-sm">
                                {email}
                            </p>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className={ui.panel}>
                <h3 className={ui.title}>Basics</h3>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt className={ui.eyebrow}>Username</dt>
                        <dd className="text-ink m-0 font-semibold">
                            @{profile.username}
                        </dd>
                    </div>
                    <div>
                        <dt className={ui.eyebrow}>Provider</dt>
                        <dd className="text-ink m-0 font-semibold capitalize">
                            {profile.provider}
                        </dd>
                    </div>
                    <div>
                        <dt className={ui.eyebrow}>Member since</dt>
                        <dd className="text-ink m-0 font-semibold">
                            {formatDate(profile.createdAt)}
                        </dd>
                    </div>
                    <div>
                        <dt className={ui.eyebrow}>Last login</dt>
                        <dd className="text-ink m-0 font-semibold">
                            {formatDate(profile.lastLoginAt)}
                        </dd>
                    </div>
                    {isOwn ? (
                        <div className="sm:col-span-2">
                            <dt className={ui.eyebrow}>User ID</dt>
                            <dd className="text-ink m-0 font-mono text-sm break-all">
                                {profile.uid}
                            </dd>
                        </div>
                    ) : null}
                </dl>
            </section>

            {isOwn ? (
                <section className={ui.panel}>
                    <h3 className={ui.title}>Edit display name</h3>
                    <p className={ui.hint}>
                        Your URL stays <strong>/{profile.username}</strong> —
                        only the display name changes.
                    </p>
                    <form
                        className="mt-4 max-w-md space-y-4"
                        onSubmit={handleSave}
                    >
                        <label className={ui.fieldLabel}>
                            Display name
                            <input
                                className={ui.field}
                                value={displayName}
                                onChange={(e) => setDraftName(e.target.value)}
                                required
                            />
                        </label>
                        <div className={ui.actions}>
                            <button
                                type="submit"
                                className={cx(ui.btn, ui.btnPrimary)}
                                disabled={loading}
                            >
                                {loading ? "Saving…" : "Save changes"}
                            </button>
                            <button
                                type="button"
                                className={cx(ui.btn, ui.btnDanger)}
                                onClick={handleSignOut}
                            >
                                Sign out
                            </button>
                        </div>
                    </form>
                </section>
            ) : (
                <div className={ui.actions}>
                    <Link
                        to="/"
                        className={cx(ui.btn, ui.btnSecondary, "no-underline")}
                    >
                        Back to Home
                    </Link>
                </div>
            )}
        </div>
    )
}
