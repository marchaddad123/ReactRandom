import { type ChangeEvent, useState } from "react"
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
            <WelcomeCard
                name={name || "Vue developer"}
                currentStack="Vue and Nuxt"
            />

            <section className="card">
                <h2>1. State and input</h2>
                <label htmlFor="name">Your name</label>
                <input
                    id="name"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Enter your name"
                />
                <p className="hint">
                    React uses <code>value</code> + <code>onChange</code> here,
                    similar to Vue&apos;s <code>v-model</code>.
                </p>
            </section>

            <section className="card">
                <h2>2. Counter</h2>
                <p className="counter">Count: {count}</p>
                <p>Derived value: {doubledCount}</p>

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
        </main>
    )
}

export default App
