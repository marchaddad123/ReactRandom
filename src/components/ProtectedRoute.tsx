import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"

/**
 * Gatekeeper for private pages (Home, Profile).
 *
 * - Still asking Firebase? → show a spinner
 * - No user?              → bounce to /login (remember where they wanted to go)
 * - User exists?          → render the child route via <Outlet />
 */
export function ProtectedRoute() {
    const initialized = useAuthStore((state) => state.initialized)
    const user = useAuthStore((state) => state.user)
    const location = useLocation()

    // Do not decide yet — AuthBootstrap may still be waiting on Firebase.
    if (!initialized) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div
                    className="border-primary h-9 w-9 animate-spin rounded-full border-2 border-t-transparent"
                    role="status"
                    aria-label="Loading"
                />
            </div>
        )
    }

    // Not logged in → login page. `state.from` lets us send them back after sign-in.
    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        )
    }

    // Logged in → show whatever nested route is inside this guard in App.tsx.
    return <Outlet />
}
