/** Compact counts for UI: 999 → "999", 1000 → "1K", 1_500_000 → "1.5M". */
export function formatCompactCount(value: number): string {
    const n = Math.max(0, Math.floor(value))
    if (n < 1_000) return String(n)

    const tiers = [
        { size: 1_000_000_000, suffix: "B" },
        { size: 1_000_000, suffix: "M" },
        { size: 1_000, suffix: "K" }
    ] as const

    for (const { size, suffix } of tiers) {
        if (n < size) continue
        const scaled = n / size
        const rounded =
            scaled >= 100 ? Math.round(scaled) : Math.round(scaled * 10) / 10
        const text = Number.isInteger(rounded)
            ? String(rounded)
            : rounded.toFixed(1)
        return `${text}${suffix}`
    }

    return String(n)
}

/** Vote scores may be negative (Reddit-style). */
export function formatScore(value: number): string {
    const n = Math.trunc(value)
    if (n < 0) return `-${formatCompactCount(Math.abs(n))}`
    return formatCompactCount(n)
}

export function formatPointsLabel(score: number): string {
    return Math.abs(score) === 1 ? "point" : "points"
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

/** Reddit-style relative time: 5m, 2h, 3d, … */
export function formatRelativeTime(iso: string | undefined): string {
    if (!iso) return "—"
    const then = new Date(iso).getTime()
    if (Number.isNaN(then)) return "—"

    const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000))
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo`
    return `${Math.floor(months / 12)}y`
}
