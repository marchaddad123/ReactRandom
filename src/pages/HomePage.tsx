import { type ChangeEvent, useEffect, useRef, useState } from "react"
import { WelcomeCard } from "../components/WelcomeCard"
import { cx, ui } from "../lib/ui"
import { useLearnerStore } from "../store/useLearnerStore"
import { useThemeStore } from "../store/useThemeStore"

export function HomePage() {
    const name = useLearnerStore((state) => state.name)
    const setName = useLearnerStore((state) => state.setName)
    const count = useLearnerStore((state) => state.count)
    const incrementCount = useLearnerStore((state) => state.incrementCount)
    const resetCount = useLearnerStore((state) => state.resetCount)
    const { theme, toggleTheme } = useThemeStore()

    const doubledCount = count * 2

    const previousCountRef = useRef(count)
    const [countWatch, setCountWatch] = useState({
        oldVal: count,
        newVal: count
    })

    useEffect(() => {
        const oldVal = previousCountRef.current
        const newVal = count

        if (oldVal !== newVal) {
            setCountWatch({ oldVal, newVal })
            console.log("count watch", { oldVal, newVal })
        }

        previousCountRef.current = count
    }, [count])

    function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
        setName(event.target.value)
    }

    return (
        <>
            <WelcomeCard currentStack="Vue and Nuxt" />

            <section
                className={cx(ui.panel, "animate-rise")}
                style={{ animationDelay: "50ms" }}
            >
                <p className={ui.eyebrow}>Parent state</p>
                <h2 className={ui.title}>1. State and input</h2>
                <label
                    className={ui.fieldLabel}
                    htmlFor="name"
                >
                    Your name
                    <input
                        id="name"
                        className={ui.field}
                        value={name}
                        onChange={handleNameChange}
                        placeholder="Enter your name"
                    />
                </label>
                <p className={ui.hint}>
                    <code>name</code> lives in <code>useLearnerStore</code>{" "}
                    (Zustand — like Pinia).
                </p>
                <p className="text-ink mt-3 mb-0">
                    <span className="text-primary font-semibold">{name}</span>{" "}
                    is learning React.
                </p>
            </section>

            <section
                className={cx(ui.panel, "animate-rise")}
                style={{ animationDelay: "100ms" }}
            >
                <p className={ui.eyebrow}>Derived + effect</p>
                <h2 className={ui.title}>2. Counter</h2>
                <p className={ui.counter}>Count: {count}</p>
                <p className="text-ink m-0">Derived value: {doubledCount}</p>
                <p className={ui.hint}>
                    useEffect watch: oldVal=<code>{countWatch.oldVal}</code>,
                    newVal=<code>{countWatch.newVal}</code>
                </p>
                <div className={ui.actions}>
                    <button
                        type="button"
                        className={cx(ui.btn, ui.btnPrimary)}
                        onClick={incrementCount}
                    >
                        Add one
                    </button>
                    <button
                        type="button"
                        className={cx(ui.btn, ui.btnTertiary)}
                        onClick={resetCount}
                    >
                        Reset
                    </button>
                </div>
            </section>

            <section
                className={cx(ui.panel, "animate-rise")}
                style={{ animationDelay: "150ms" }}
            >
                <p className={ui.eyebrow}>Zustand stores</p>
                <h2 className={ui.title}>3. Multiple stores</h2>
                <p className={ui.lede}>
                    App uses <code>useLearnerStore</code> and{" "}
                    <code>useThemeStore</code>. No Provider wrapper.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="bg-tertiary text-tertiary-fg inline-flex rounded-md px-3 py-2 text-sm font-medium">
                        Theme: {theme}
                    </span>
                    <button
                        type="button"
                        className={cx(ui.btn, ui.btnSecondary)}
                        onClick={toggleTheme}
                    >
                        Toggle theme store
                    </button>
                </div>
            </section>
        </>
    )
}
