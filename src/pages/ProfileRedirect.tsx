import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"

/**
 * /profile → /your-username
 * Waits until Firestore has finished saving the username so we do not
 * navigate to a guessed handle that is not in the database yet.
 */
export function ProfileRedirect() {
    const profile = useAuthStore((state) => state.profile)
    const initialized = useAuthStore((state) => state.initialized)
    const profileSynced = useAuthStore((state) => state.profileSynced)

    if (!initialized || !profileSynced || !profile?.username) {
        return (
            <div className="flex justify-center py-16">
                <div
                    className="border-primary h-9 w-9 animate-spin rounded-full border-2 border-t-transparent"
                    role="status"
                    aria-label="Loading"
                />
            </div>
        )
    }

    return (
        <Navigate
            to={`/${profile.username}`}
            replace
        />
    )
}
