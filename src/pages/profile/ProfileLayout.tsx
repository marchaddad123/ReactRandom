import { useEffect, useState } from "react"
import {
    Link,
    NavLink,
    Navigate,
    Outlet,
    useLocation,
    useParams
} from "react-router-dom"
import { cx, ui } from "../../lib/ui"
import { useAuthStore } from "../../store/useAuthStore"
import type { UserProfile } from "../../types/userProfile"
import {
    initials,
    resolveProfileParam,
    type ProfileOutletContext
} from "./profileHelpers"

/**
 * Shared chrome for /:username and /:username/posts
 * Loads the profile once, then child routes render in <Outlet />.
 */
export function ProfileLayout() {
    const { username: usernameParam } = useParams<{ username: string }>()
    const param = usernameParam?.toLowerCase() ?? ""
    const location = useLocation()

    const authUser = useAuthStore((state) => state.user)
    const myProfile = useAuthStore((state) => state.profile)
    const profileSynced = useAuthStore((state) => state.profileSynced)

    const [viewed, setViewed] = useState<UserProfile | null>(null)
    const [fetchState, setFetchState] = useState<
        "loading" | "ready" | "missing"
    >("loading")

    const isOwn = Boolean(viewed && authUser && viewed.uid === authUser.uid)
    const profile: UserProfile | null = isOwn && myProfile ? myProfile : viewed

    useEffect(() => {
        let cancelled = false

        async function load() {
            if (!param) {
                setFetchState("missing")
                setViewed(null)
                return
            }

            if (
                myProfile &&
                (myProfile.username === param || myProfile.uid === param)
            ) {
                setViewed(myProfile)
                setFetchState(profileSynced ? "ready" : "loading")
                return
            }

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

    if (
        profileSynced &&
        myProfile?.username &&
        authUser &&
        (param === myProfile.uid ||
            (viewed?.uid === authUser.uid && param !== myProfile.username))
    ) {
        const suffix = location.pathname.replace(/^\/[^/]+/, "") || ""
        return (
            <Navigate
                to={`/${myProfile.username}${suffix}`}
                replace
            />
        )
    }

    const base = `/${profile.username}`
    const outletContext: ProfileOutletContext = { profile, isOwn }

    return (
        <div className="animate-rise space-y-6">
            <section className={ui.panel}>
                <p className={ui.eyebrow}>
                    {isOwn ? "Your profile" : "Member profile"}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                    {profile.photoURL ? (
                        <img
                            src={profile.photoURL}
                            alt=""
                            className="border-line h-16 w-16 rounded-2xl border object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div
                            className="bg-primary/15 text-primary font-display flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold"
                            aria-hidden
                        >
                            {initials(profile.displayName, profile.email)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h2 className={cx(ui.title, "text-[1.65rem]")}>
                            {profile.displayName || "Profile"}
                        </h2>
                        <p className="text-primary m-0 text-sm font-semibold">
                            /{profile.username}
                        </p>
                        {isOwn && profile.email ? (
                            <p className="text-muted m-0 truncate text-sm">
                                {profile.email}
                            </p>
                        ) : null}
                    </div>
                </div>

                <nav
                    className="mt-5 flex flex-wrap gap-1"
                    aria-label="Profile sections"
                >
                    <NavLink
                        to={base}
                        end
                        className={({ isActive }) =>
                            cx(
                                ui.navLink,
                                isActive ? ui.navLinkActive : ui.navLinkInactive
                            )
                        }
                    >
                        About
                    </NavLink>
                    <NavLink
                        to={`${base}/posts`}
                        className={({ isActive }) =>
                            cx(
                                ui.navLink,
                                isActive ? ui.navLinkActive : ui.navLinkInactive
                            )
                        }
                    >
                        Posts
                    </NavLink>
                </nav>
            </section>

            <Outlet context={outletContext} />
        </div>
    )
}
