import { useState } from "react"

export function CounterPage() {
    const [clicks, setClicks] = useState(0)

    return (
        <section className="card">
            <p className="eyebrow">Page: Counter</p>
            <h2>Another kept-alive page</h2>
            <p className="counter">Clicks: {clicks}</p>
            <p className="hint">
                Bump this, switch to Home/Notes, then come back — state should
                still be here because of <code>&lt;Activity&gt;</code>.
            </p>
            <div className="actions">
                <button
                    type="button"
                    onClick={() => setClicks((current) => current + 1)}
                >
                    Click
                </button>
                <button
                    type="button"
                    className="secondary"
                    onClick={() => setClicks(0)}
                >
                    Reset
                </button>
            </div>
        </section>
    )
}
