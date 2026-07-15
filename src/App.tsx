import { type ChangeEvent, useEffect, useRef, useState } from "react"
import "./App.css"
import { WelcomeCard } from "./components/WelcomeCard"

function App() {
    // Similar to: const name = ref('Mark')
    const [name, setName] = useState("Mark")

    // Similar to: const count = ref(0)
    const [count, setCount] = useState(0)

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

    function incrementCount() {
        setCount((currentCount) => currentCount + 1)
    }

    function resetCount() {
        setCount(0)
    }

    return (
        <main className="app">
            <h1>Learn React</h1>
            <WelcomeCard
                name={name}
                currentStack="Vue and Nuxt"
                onNameChange={setName}
            />

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
                    This input updates parent state immediately (
                    <code>value</code> + <code>onChange</code>, like Vue{" "}
                    <code>v-model</code>). The child above emits the same state
                    with a 300ms debounce.
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
                    Tailwind CSS
                </p>
                <h2 className="mb-2 text-lg font-semibold text-slate-900">
                    3. Utilities alongside CSS
                </h2>
                <p className="mb-4 text-slate-600">
                    Existing styles still come from{" "}
                    <code className="rounded bg-slate-100 px-1.5 py-0.5">
                        App.css
                    </code>
                    . This section is styled with Tailwind utilities.
                </p>
                <p className="inline-flex rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-sky-800">
                    Hello from Tailwind v4
                </p>
            </section>
        </main>
    )
}

export default App
