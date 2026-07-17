import { useState } from "react"
import { cx, ui } from "../lib/ui"

export function CounterPage() {
    const [clicks, setClicks] = useState(0)

    return (
        <section className={cx(ui.panel, "animate-rise")}>
            <p className={ui.eyebrow}>Page: Counter</p>
            <h2 className={ui.title}>Kept-alive page</h2>
            <p className={ui.counter}>Clicks: {clicks}</p>
            <p className={ui.lede}>
                Bump this, switch routes, then come back — state should still be
                here because of <code>&lt;Activity&gt;</code>.
            </p>
            <div className={ui.actions}>
                <button
                    type="button"
                    className={cx(ui.btn, ui.btnPrimary)}
                    onClick={() => setClicks((current) => current + 1)}
                >
                    Click
                </button>
                <button
                    type="button"
                    className={cx(ui.btn, ui.btnTertiary)}
                    onClick={() => setClicks(0)}
                >
                    Reset
                </button>
            </div>
        </section>
    )
}
