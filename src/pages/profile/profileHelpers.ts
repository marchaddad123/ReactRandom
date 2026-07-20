import { getUserProfile, getUserProfileByUsername } from "../../lib/userProfile"
import type { UserProfile } from "../../types/userProfile"

export type ProfileOutletContext = {
    profile: UserProfile
    isOwn: boolean
}

export function formatDate(iso: string | undefined) {
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

export function initials(
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
export async function resolveProfileParam(
    param: string
): Promise<UserProfile | null> {
    const byUsername = await getUserProfileByUsername(param)
    if (byUsername) return byUsername
    return getUserProfile(param)
}
