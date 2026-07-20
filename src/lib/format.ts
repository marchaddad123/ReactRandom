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
