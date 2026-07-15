import { debounce } from "lodash-es"
import { type ChangeEvent, useEffect, useMemo, useState } from "react"
import { useLearner } from "../store/LearnerContext"

type WelcomeCardProps = {
    currentStack: string
}

export function WelcomeCard({ currentStack }: WelcomeCardProps) {
    // Read/write shared store — no props needed for name anymore.
    // Similar to: const learnerStore = useLearnerStore()
    const { name, setName } = useLearner()

    // Local draft so typing stays snappy while the store update is debounced.
    const [draft, setDraft] = useState(name)
    const [previousName, setPreviousName] = useState(name)

    // Keep local draft in sync if something else changes `name` in the store.
    if (name !== previousName) {
        setPreviousName(name)
        setDraft(name)
    }

    const emitNameChange = useMemo(
        () => debounce((nextName: string) => setName(nextName), 300),
        [setName]
    )

    useEffect(() => {
        return () => {
            emitNameChange.cancel()
        }
    }, [emitNameChange])

    function handleDraftChange(event: ChangeEvent<HTMLInputElement>) {
        const nextName = event.target.value
        setDraft(nextName)
        emitNameChange(nextName)
    }

    return (
        <section className="card">
            <p className="eyebrow">React + TypeScript + Tailwind</p>
            <h1>Welcome, {name || "Vue developer"}</h1>
            <p>
                You already know {currentStack}. This card reads{" "}
                <code>name</code> from <code>LearnerContext</code> instead of
                props.
            </p>

            <label htmlFor="welcome-name">
                Name from child (debounced store update)
            </label>
            <input
                id="welcome-name"
                value={draft}
                onChange={handleDraftChange}
                placeholder="Type here in the child"
            />
            <p className="hint">
                Before: callback prop like <code>onNameChange</code>. Now:
                update the shared context with <code>setName</code> (still
                debounced).
            </p>
        </section>
    )
}
