import { QueryClient } from "@tanstack/react-query"

// Similar to Nuxt's shared fetch cache — one client for the whole app.
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Keep data "fresh" for a bit (like useFetch caching).
            staleTime: 30_000,
            // Don't spam refetch when you tab back during learning.
            refetchOnWindowFocus: false
        }
    }
})
