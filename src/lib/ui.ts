/** Shared Tailwind class strings — use these instead of one-off styles. */

export function cx(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ")
}

/**
 * Type & spacing hierarchy (use everywhere — do not invent local weights).
 *
 * Color
 *   ink (#102028)     — titles, body, primary values
 *   muted (#5a6b74)   — supporting copy, meta, hints
 *   secondary         — eyebrows / section labels only
 *   primary           — links, active nav, accents
 *
 * Type (no bold — weight via size/color/tracking only)
 *   brand     → hero wordmark
 *   title     → section / panel heading
 *   body      → main readable copy
 *   lede      — short support under a brand/title (muted)
 *   hint      — quieter help under a title
 *   meta      — timestamps, counts, secondary facts
 *   eyebrow   — uppercase section label above a title
 *   value     — labeled field value (dt/dd pairs)
 *   fieldLabel
 *
 * Spacing (vertical)
 *   eyebrow → title     : eyebrow’s mb-1.5
 *   title → lede/hint   : lede mt-3 / hint mt-2
 *   body → action row   : mt-4 (afterBody)
 *   major blocks        : stack (space-y-6)
 *   related controls    : stackTight (space-y-3)
 *   section after block : sectionGap (mt-6)
 */
export const ui = {
    shell: "mx-auto w-[min(100%-2rem,1080px)]",
    panel: "rounded-2xl border border-line bg-surface/90 px-6 py-5 shadow-[0_1px_0_color-mix(in_oklab,white_55%,transparent)] backdrop-blur-sm",

    eyebrow:
        "mb-1.5 text-[0.72rem] font-medium tracking-[0.14em] text-secondary uppercase",
    title: "font-display m-0 overflow-visible text-xl leading-snug font-medium tracking-tight text-ink",
    brand: "font-display m-0 overflow-visible text-[clamp(2.25rem,5vw,3.25rem)] leading-none font-medium tracking-tight text-ink",
    brandMark:
        "font-display text-lg font-medium tracking-tight text-ink no-underline",

    body: "text-ink m-0 text-base leading-relaxed",
    lede: "text-muted mt-3 max-w-md text-[1rem] leading-relaxed",
    hint: "text-muted mt-2 text-sm leading-relaxed",
    meta: "text-muted m-0 text-xs leading-snug",
    value: "text-ink m-0 text-sm",

    fieldLabel: "text-ink mb-3 block text-sm font-medium",
    field: "border-line bg-surface text-ink focus:border-primary focus:ring-primary/20 mt-1.5 block w-full rounded-xl border px-3.5 py-2.5 transition-[border-color,box-shadow,background] focus:bg-white focus:ring-[3px] focus:outline-none",

    /** Vertical rhythm */
    stack: "space-y-6",
    stackTight: "space-y-3",
    afterBody: "mt-4",
    sectionGap: "mt-6",

    actions: "mt-5 flex flex-wrap gap-2.5",
    btn: "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-[0.9rem] leading-tight font-medium transition-[background,color,border-color,transform] active:enabled:translate-y-px disabled:cursor-not-allowed disabled:opacity-50",
    btnPrimary: "bg-primary text-primary-fg hover:enabled:bg-primary/90",
    btnSecondary: "border-line text-ink hover:enabled:bg-tertiary bg-white",
    btnGoogle:
        "border-ink/20 text-ink hover:enabled:bg-tertiary/60 bg-white shadow-sm",
    btnGhost:
        "text-muted hover:enabled:bg-tertiary hover:enabled:text-ink bg-transparent",
    btnDanger: "bg-danger hover:enabled:bg-danger/90 text-white",
    navLink:
        "inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors",
    navLinkInactive: "text-muted hover:bg-tertiary/70 hover:text-ink",
    navLinkActive: "bg-primary/10 text-primary"
} as const
