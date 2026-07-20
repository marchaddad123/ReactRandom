import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { listUserProfiles } from "../lib/userProfile"
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

function initials(name: string | null, email: string | null) {
    const source = name?.trim() || email?.trim() || "?"
    const parts = source.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
        return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
    }
    return source.slice(0, 2).toUpperCase()
}

export function HomePage() {
    const user = useAuthStore((state) => state.user)
    const profile = useAuthStore((state) => state.profile)
    const profileSynced = useAuthStore((state) => state.profileSynced)
    const signOut = useAuthStore((state) => state.signOut)
    const notify = useNotificationStore((state) => state.updateNotification)

    const [users, setUsers] = useState<UserProfile[]>([])
    const [usersLoading, setUsersLoading] = useState(true)
    const [usersError, setUsersError] = useState<string | null>(null)

    const name =
        profile?.displayName ||
        user?.displayName ||
        user?.email?.split("@")[0] ||
        "there"

    useEffect(() => {
        let cancelled = false

        async function loadUsers() {
            setUsersLoading(true)
            setUsersError(null)
            try {
                const list = await listUserProfiles()
                if (!cancelled) setUsers(list)
            } catch {
                if (!cancelled) {
                    setUsersError(
                        "Could not load users. If this persists, allow signed-in reads on the users collection in Firestore rules."
                    )
                }
            } finally {
                if (!cancelled) setUsersLoading(false)
            }
        }

        void loadUsers()
        return () => {
            cancelled = true
        }
    }, [])

    async function handleSignOut() {
        try {
            await signOut()
            notify({ message: "Signed out.", error: false })
        } catch {
            notify({ message: "Could not sign out.", error: true })
        }
    }

    return (
        <div className="animate-rise space-y-6">
            <section className={ui.panel}>
                <p className={ui.eyebrow}>Home</p>
                <h2 className={cx(ui.title, "text-[1.65rem]")}>
                    Welcome back, {name}
                </h2>
                <p className={ui.hint}>
                    You are signed in
                    {user?.email ? (
                        <>
                            {" "}
                            as{" "}
                            <strong className="text-ink">{user.email}</strong>
                        </>
                    ) : null}
                    . Your session is managed by Firebase Auth; profile details
                    live in Firestore.
                </p>

                <div className={ui.actions}>
                    <Link
                        to={
                            profileSynced && profile?.username
                                ? `/${profile.username}`
                                : "/profile"
                        }
                        className={cx(ui.btn, ui.btnPrimary, "no-underline")}
                    >
                        View profile
                    </Link>
                    <button
                        type="button"
                        className={cx(ui.btn, ui.btnSecondary)}
                        onClick={handleSignOut}
                    >
                        Sign out
                    </button>
                </div>
            </section>

            <section className={cx(ui.panel, "grid gap-4 sm:grid-cols-3")}>
                <div>
                    <p className={ui.eyebrow}>Provider</p>
                    <p className="text-ink m-0 font-medium capitalize">
                        {profile?.provider ?? "—"}
                    </p>
                </div>
                <div>
                    <p className={ui.eyebrow}>Last login</p>
                    <p className="text-ink m-0 font-medium">
                        {formatDate(profile?.lastLoginAt)}
                    </p>
                </div>
                <div>
                    <p className={ui.eyebrow}>Member since</p>
                    <p className="text-ink m-0 font-medium">
                        {formatDate(profile?.createdAt)}
                    </p>
                </div>
            </section>

            <section className={ui.panel}>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <p className={ui.eyebrow}>Directory</p>
                        <h3 className={ui.title}>Users</h3>
                    </div>
                    {!usersLoading && !usersError ? (
                        <p className="text-muted m-0 text-sm">
                            {users.length}{" "}
                            {users.length === 1 ? "member" : "members"}
                        </p>
                    ) : null}
                </div>

                {usersLoading ? (
                    <p className="text-muted m-0 text-sm">Loading users…</p>
                ) : null}

                {usersError ? (
                    <p
                        className="text-danger m-0 text-sm"
                        role="alert"
                    >
                        {usersError}
                    </p>
                ) : null}

                {!usersLoading && !usersError && users.length === 0 ? (
                    <p className="text-muted m-0 text-sm">
                        No users in Firestore yet. Sign-ins create profiles
                        under <code>users/&#123;uid&#125;</code>.
                    </p>
                ) : null}

                {!usersLoading && !usersError && users.length > 0 ? (
                    <ul className="m-0 list-none space-y-2 p-0">
                        {users.map((member) => {
                            const isYou = member.uid === user?.uid
                            const label =
                                member.displayName ||
                                member.email ||
                                "Unknown user"

                            return (
                                <li key={member.uid}>
                                    <Link
                                        to={`/${member.username}`}
                                        className="border-line hover:bg-tertiary/50 flex items-center gap-3 rounded-xl border px-3 py-2.5 no-underline transition-colors"
                                    >
                                        {member.photoURL ? (
                                            <img
                                                src={member.photoURL}
                                                alt=""
                                                className="border-line h-10 w-10 shrink-0 rounded-full border object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div
                                                className="bg-primary/15 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-medium"
                                                aria-hidden
                                            >
                                                {initials(
                                                    member.displayName,
                                                    member.email
                                                )}
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <p className="text-ink m-0 truncate font-medium">
                                                {label}
                                                {isYou ? (
                                                    <span className="text-primary ml-2 text-xs font-medium tracking-wide uppercase">
                                                        You
                                                    </span>
                                                ) : null}
                                            </p>
                                            <p className="text-muted m-0 truncate text-sm">
                                                /{member.username}
                                                <span className="text-line mx-1.5">
                                                    ·
                                                </span>
                                                <span className="capitalize">
                                                    {member.provider}
                                                </span>
                                            </p>
                                        </div>

                                        <p className="text-muted m-0 hidden shrink-0 text-xs sm:block">
                                            {formatDate(member.lastLoginAt)}
                                        </p>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                ) : null}
            </section>
        </div>
    )
}
