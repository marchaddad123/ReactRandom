import { useEffect, type ReactNode } from "react"
import { useAuthStore } from "../store/useAuthStore"

/**
 * Turns on Firebase's "are we logged in?" listener once, when the app starts.
 * When this component unmounts, it turns the listener off (cleanup).
 */
export function AuthBootstrap({ children }: { children: ReactNode }) {
    const initAuthListener = useAuthStore((state) => state.initAuthListener)

    useEffect(() => {
        // initAuthListener returns an unsubscribe function — React runs it on cleanup.
        return initAuthListener()
    }, [initAuthListener])

    return children
}
