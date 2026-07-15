import { Activity, useState } from "react"

function EphemeralPanel({ label }: { label: string }) {
    const [text, setText] = useState("")
    const [count, setCount] = useState(0)

    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 font-semibold text-slate-800">{label}</p>
            <label
                className="mb-1 block text-sm font-semibold"
                htmlFor={`${label}-text`}
            >
                Text
            </label>
            <input
                id={`${label}-text`}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Type something"
            />
            <p className="hint">
                Local count: <code>{count}</code>
            </p>
            <div className="actions">
                <button
                    type="button"
                    onClick={() => setCount((current) => current + 1)}
                >
                    +1
                </button>
            </div>
        </div>
    )
}

export function ComparePage() {
    const [showUnmount, setShowUnmount] = useState(true)
    const [showActivity, setShowActivity] = useState(true)

    return (
        <section className="card">
            <p className="eyebrow">Compare</p>
            <h2>Unmount vs Activity</h2>
            <p className="hint">
                Left: conditional render (Vue without keep-alive) — state dies.
                Right: <code>&lt;Activity&gt;</code> (Vue keep-alive style) —
                state lives.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                    <div className="actions mb-3">
                        <button
                            type="button"
                            onClick={() =>
                                setShowUnmount((current) => !current)
                            }
                        >
                            {showUnmount ? "Hide (unmount)" : "Show (remount)"}
                        </button>
                    </div>
                    {showUnmount ? (
                        <EphemeralPanel label="Without Activity" />
                    ) : (
                        <p className="hint">Unmounted — state was destroyed.</p>
                    )}
                </div>

                <div>
                    <div className="actions mb-3">
                        <button
                            type="button"
                            className="secondary"
                            onClick={() =>
                                setShowActivity((current) => !current)
                            }
                        >
                            {showActivity
                                ? "Hide (Activity)"
                                : "Show (Activity)"}
                        </button>
                    </div>
                    <Activity mode={showActivity ? "visible" : "hidden"}>
                        <EphemeralPanel label="With Activity" />
                    </Activity>
                    {!showActivity ? (
                        <p className="hint">
                            Hidden with Activity — state should still be there
                            when you show it again.
                        </p>
                    ) : null}
                </div>
            </div>
        </section>
    )
}
