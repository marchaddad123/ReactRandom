import { Activity, useState } from "react"
import { cx, ui } from "../lib/ui"

function EphemeralPanel({ label }: { label: string }) {
    const [text, setText] = useState("")
    const [count, setCount] = useState(0)

    return (
        <div className={cx(ui.panelInset, "p-4")}>
            <p className="text-ink mb-2 font-semibold">{label}</p>
            <label
                className={ui.fieldLabel}
                htmlFor={`${label}-text`}
            >
                Text
                <input
                    id={`${label}-text`}
                    className={ui.field}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Type something"
                />
            </label>
            <p className={ui.hint}>
                Local count: <code>{count}</code>
            </p>
            <div className={ui.actions}>
                <button
                    type="button"
                    className={cx(ui.btn, ui.btnPrimary)}
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
        <section className={cx(ui.panel, "animate-rise")}>
            <p className={ui.eyebrow}>Compare</p>
            <h2 className={ui.title}>Unmount vs Activity</h2>
            <p className={ui.lede}>
                Left: conditional render (Vue without keep-alive) — state dies.
                Right: <code>&lt;Activity&gt;</code> (Vue keep-alive style) —
                state lives.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                    <div className={cx(ui.actions, "mt-0 mb-3")}>
                        <button
                            type="button"
                            className={cx(ui.btn, ui.btnSecondary)}
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
                        <p className={ui.hint}>
                            Unmounted — state was destroyed.
                        </p>
                    )}
                </div>

                <div>
                    <div className={cx(ui.actions, "mt-0 mb-3")}>
                        <button
                            type="button"
                            className={cx(ui.btn, ui.btnTertiary)}
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
                        <p className={ui.hint}>
                            Hidden with Activity — state should still be there
                            when you show it again.
                        </p>
                    ) : null}
                </div>
            </div>
        </section>
    )
}
