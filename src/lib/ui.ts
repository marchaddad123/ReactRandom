/** Shared Tailwind class strings — use these instead of custom CSS classes. */

export function cx(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ")
}

export const ui = {
    shell: "mx-auto w-[min(100%-2rem,1080px)]",
    panel: "rounded-2xl border border-line bg-surface/90 px-6 py-5 shadow-[0_1px_0_color-mix(in_oklab,white_55%,transparent)] backdrop-blur-sm",
    eyebrow:
        "mb-1.5 text-[0.72rem] font-bold tracking-[0.14em] text-secondary uppercase",
    title: "font-display m-0 overflow-visible text-xl leading-snug font-bold tracking-tight text-ink",
    brand: "font-display m-0 overflow-visible text-[clamp(2.25rem,5vw,3.25rem)] leading-none font-bold tracking-tight text-ink",
    brandMark:
        "font-display text-lg font-bold tracking-tight text-ink no-underline",
    lede: "mt-3 max-w-md text-[1rem] leading-relaxed text-muted",
    hint: "mt-2 text-sm leading-relaxed text-muted",
    fieldLabel: "mb-3 block text-sm font-semibold text-ink",
    field: "mt-1.5 block w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-ink transition-[border-color,box-shadow,background] focus:border-primary focus:bg-white focus:ring-[3px] focus:ring-primary/20 focus:outline-none",
    actions: "mt-5 flex flex-wrap gap-2.5",
    btn: "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-[0.9rem] leading-tight font-semibold transition-[background,color,border-color,transform] active:enabled:translate-y-px disabled:cursor-not-allowed disabled:opacity-50",
    btnPrimary: "bg-primary text-primary-fg hover:enabled:bg-primary/90",
    btnSecondary: "border-line bg-white text-ink hover:enabled:bg-tertiary",
    btnGoogle:
        "border-ink/20 bg-white text-ink shadow-sm hover:enabled:bg-tertiary/60",
    btnGhost:
        "bg-transparent text-muted hover:enabled:bg-tertiary hover:enabled:text-ink",
    btnDanger: "bg-danger text-white hover:enabled:bg-danger/90",
    navLink:
        "inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold no-underline transition-colors",
    navLinkInactive: "text-muted hover:bg-tertiary/70 hover:text-ink",
    navLinkActive: "bg-primary/10 text-primary"
} as const
