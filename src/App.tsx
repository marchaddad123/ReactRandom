import { type ChangeEvent, useEffect, useRef, useState } from "react"
import "./App.css"
import { WelcomeCard } from "./components/WelcomeCard"
import { useLearner } from "./store/LearnerContext"
import { useTheme } from "./store/ThemeContext"

function App() {
    // From LearnerContext — similar to useLearnerStore() in Pinia.
    const { name, setName, count, incrementCount, resetCount } = useLearner()
    const { theme, toggleTheme } = useTheme()

    // For a simple derived value, React usually calculates it during render.
    // Similar to a very basic Vue computed value.
    const doubledCount = count * 2

    // Vue watch gives (newVal, oldVal). React useEffect only has the new value,
    // so we keep the previous one in a ref ourselves.
    const previousCountRef = useRef(count)
    const [countWatch, setCountWatch] = useState({
        oldVal: count,
        newVal: count
    })

    useEffect(() => {
        const oldVal = previousCountRef.current
        const newVal = count

        // Skip the first run so this feels more like watch (not immediate).
        if (oldVal !== newVal) {
            setCountWatch({ oldVal, newVal })
            console.log("count watch", { oldVal, newVal })
        }

        previousCountRef.current = count
    }, [count])

    function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
        setName(event.target.value)
    }

    const themeBadgeClass =
        theme === "sky"
            ? "bg-sky-50 text-sky-800"
            : "bg-emerald-50 text-emerald-800"

    return (
        <main className="app">
            <h1>Learn React</h1>
            <WelcomeCard currentStack="Vue and Nuxt" />

            <section className="card">
                <h2>1. State and input (parent)</h2>
                <label htmlFor="name">Your name</label>
                <input
                    id="name"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Enter your name"
                />
                <p className="hint">
                    <code>name</code> now lives in <code>LearnerContext</code>{" "}
                    (shared store), not only in local <code>useState</code>{" "}
                    inside this file.
                </p>
                <p>
                    <span className="font-medium text-sky-600">{name}</span> is
                    Learning React!
                </p>
            </section>

            <section className="card">
                <h2>2. Counter</h2>
                <p className="counter">Count: {count}</p>
                <p>Derived value: {doubledCount}</p>
                <p className="hint">
                    useEffect watch demo: oldVal={" "}
                    <code>{countWatch.oldVal}</code>, newVal={" "}
                    <code>{countWatch.newVal}</code> (also logged in the
                    console)
                </p>

                <div className="actions">
                    <button
                        type="button"
                        onClick={incrementCount}
                    >
                        Add one
                    </button>
                    <button
                        type="button"
                        className="secondary"
                        onClick={resetCount}
                    >
                        Reset
                    </button>
                </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6">
                <p className="mb-2 text-sm font-semibold tracking-wide text-sky-600 uppercase">
                    Context stores
                </p>
                <h2 className="mb-2 text-lg font-semibold text-slate-900">
                    3. Multiple contexts
                </h2>
                <p className="mb-4 text-slate-600">
                    Yes — you can have many Contexts. This app uses{" "}
                    <code className="rounded bg-slate-100 px-1.5 py-0.5">
                        LearnerContext
                    </code>{" "}
                    and{" "}
                    <code className="rounded bg-slate-100 px-1.5 py-0.5">
                        ThemeContext
                    </code>
                    .
                </p>
                <div className="flex flex-wrap items-center gap-3">
                    <p
                        className={`inline-flex rounded-lg px-3 py-2 text-sm font-medium ${themeBadgeClass}`}
                    >
                        Theme: {theme}
                    </p>
                    <button
                        type="button"
                        onClick={toggleTheme}
                    >
                        Toggle theme context
                    </button>
                </div>
            </section>
        </main>
    )
}

export default App
