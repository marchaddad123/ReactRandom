import { NavLink, Navigate, Outlet, Route, Routes } from "react-router-dom"
import { Notifications } from "./components/Notifications"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { cx, ui } from "./lib/ui"
import { HomePage } from "./pages/HomePage"
import { LoginPage } from "./pages/LoginPage"
import { ProfileAboutPage } from "./pages/profile/ProfileAboutPage"
import { ProfileLayout } from "./pages/profile/ProfileLayout"
import { ProfilePostsPage } from "./pages/profile/ProfilePostsPage"
import { ProfileRedirect } from "./pages/ProfileRedirect"
import { RegisterPage } from "./pages/RegisterPage"
import { useAuthStore } from "./store/useAuthStore"
import { useNotificationStore } from "./store/useNotificationStore"

/**
 * Top bar + page hole for logged-in users only
 * (Home and Profile render inside <Outlet /> below).
 */
function AppShell() {
    const user = useAuthStore((state) => state.user)
    const profile = useAuthStore((state) => state.profile)
    const profileSynced = useAuthStore((state) => state.profileSynced)
    const signOut = useAuthStore((state) => state.signOut)
    const notify = useNotificationStore((state) => state.updateNotification)

    const label =
        profile?.displayName ||
        user?.displayName ||
        user?.email?.split("@")[0] ||
        "Account"
    const photoURL = profile?.photoURL ?? user?.photoURL
    // Wait for Firestore sync before using /username (avoids "not found" race).
    const profilePath =
        profileSynced && profile?.username ? `/${profile.username}` : "/profile"

    async function handleSignOut() {
        try {
            await signOut()
            notify({ message: "Signed out.", error: false })
        } catch {
            notify({ message: "Could not sign out.", error: true })
        }
    }

    return (
        <div className="min-h-screen">
            <header className="border-line/80 bg-surface/75 animate-nav sticky top-0 z-40 border-b backdrop-blur-md">
                <div
                    className={cx(
                        ui.shell,
                        "flex items-center justify-between gap-4 py-3.5"
                    )}
                >
                    <NavLink
                        to="/"
                        end
                        className={ui.brandMark}
                    >
                        ReactRandom
                    </NavLink>

                    <nav
                        className="flex flex-wrap items-center gap-1"
                        aria-label="Primary"
                    >
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                cx(
                                    ui.navLink,
                                    isActive
                                        ? ui.navLinkActive
                                        : ui.navLinkInactive
                                )
                            }
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to={profilePath}
                            className={({ isActive }) =>
                                cx(
                                    ui.navLink,
                                    isActive
                                        ? ui.navLinkActive
                                        : ui.navLinkInactive
                                )
                            }
                        >
                            Profile
                        </NavLink>
                    </nav>

                    <div className="flex items-center gap-2.5">
                        {photoURL ? (
                            <img
                                src={photoURL}
                                alt=""
                                className="border-line h-8 w-8 rounded-full border object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div
                                className="bg-primary/15 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
                                aria-hidden
                            >
                                {label.slice(0, 1).toUpperCase()}
                            </div>
                        )}
                        <span className="text-ink hidden max-w-[10rem] truncate text-sm font-medium sm:inline">
                            {label}
                        </span>
                        <button
                            type="button"
                            className={cx(
                                ui.btn,
                                ui.btnGhost,
                                "px-2.5 py-1.5 text-sm"
                            )}
                            onClick={handleSignOut}
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className={cx(ui.shell, "py-8 pb-16")}>
                <Outlet />
            </main>
        </div>
    )
}

function App() {
    return (
        <>
            <Notifications />
            <Routes>
                {/* Anyone can open these (no login required). */}
                <Route
                    path="/login"
                    element={<LoginPage />}
                />
                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                {/*
                  Nested private area:
                  ProtectedRoute checks "are we logged in?"
                  AppShell draws the top bar
                  then Home or Profile fills the middle
                */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AppShell />}>
                        <Route
                            path="/"
                            element={<HomePage />}
                        />
                        {/* Shortcut: /profile → /your-username */}
                        <Route
                            path="/profile"
                            element={<ProfileRedirect />}
                        />
                        {/* /:username (About) and /:username/posts */}
                        <Route
                            path="/:username"
                            element={<ProfileLayout />}
                        >
                            <Route
                                index
                                element={<ProfileAboutPage />}
                            />
                            <Route
                                path="posts"
                                element={<ProfilePostsPage />}
                            />
                        </Route>
                    </Route>
                </Route>

                {/* Unknown URL → send them home (Home is still protected). */}
                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />
            </Routes>
        </>
    )
}

export default App
