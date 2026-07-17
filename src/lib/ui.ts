/** Shared Tailwind class strings — use these instead of custom CSS classes. */

export function cx(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ")
}

export const ui = {
    shell: "mx-auto w-[min(100%-2rem,960px)] py-10 pb-16",
    panel: "mb-4 rounded-[0.85rem] border border-line bg-surface px-6 py-5 shadow-[0_1px_0_color-mix(in_oklab,white_70%,transparent)]",
    panelInset: "rounded-xl border border-dashed border-line bg-tertiary/45",
    eyebrow:
        "mb-1.5 text-[0.72rem] font-bold tracking-[0.14em] text-secondary uppercase",
    title: "font-display m-0 overflow-visible text-xl leading-snug font-bold tracking-tight text-ink",
    brand: "font-display m-0 mb-2 overflow-visible text-[clamp(2rem,4vw,2.75rem)] leading-snug font-bold tracking-tight text-primary",
    lede: "mt-2 max-w-xl text-[0.95rem] leading-relaxed text-muted",
    hint: "mt-2 text-[0.95rem] leading-relaxed text-muted",
    fieldLabel: "mb-3 block text-sm font-semibold text-ink",
    field: "mt-1.5 block w-full rounded-[0.55rem] border border-line bg-surface px-3.5 py-2.5 text-ink transition-[border-color,box-shadow,background] focus:border-primary focus:bg-white focus:ring-[3px] focus:ring-primary/20 focus:outline-none",
    textarea: "min-h-32 resize-y",
    actions: "mt-4 flex flex-wrap gap-2.5",
    counter:
        "font-display m-0 mb-1 text-[1.65rem] leading-snug font-bold tracking-tight text-primary",
    btn: "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[0.55rem] border border-transparent px-4 py-2.5 text-[0.9rem] leading-tight font-semibold transition-[background,color,border-color,transform] active:enabled:translate-y-px disabled:cursor-not-allowed disabled:opacity-50",
    btnPrimary: "bg-primary text-primary-fg hover:enabled:bg-primary/90",
    btnSecondary:
        "bg-secondary text-secondary-fg hover:enabled:bg-secondary/90",
    btnTertiary:
        "border-line bg-tertiary text-tertiary-fg hover:enabled:bg-tertiary/80",
    btnDanger: "bg-danger text-white hover:enabled:bg-danger/90",
    navLink:
        "inline-flex items-center rounded-full border border-transparent px-3.5 py-2 text-[0.85rem] font-semibold no-underline transition-[background,color,border-color]",
    navLinkInactive: "text-secondary hover:bg-tertiary hover:text-ink",
    navLinkActive:
        "border-primary bg-primary text-white hover:bg-primary/90 hover:text-white"
} as const
