import { debounce } from "lodash-es"
import { type ChangeEvent, useEffect, useMemo, useState } from "react"

type WelcomeCardProps = {
    name: string
    currentStack: string
    // Similar to Vue: emit('nameChange', value)
    onNameChange: (name: string) => void
}

export function WelcomeCard({
    name,
    currentStack,
    onNameChange
}: WelcomeCardProps) {
    // Local draft so typing stays snappy while the parent update is debounced.
    const [draft, setDraft] = useState(name)
    const [previousName, setPreviousName] = useState(name)

    // Keep local draft in sync if the parent changes `name` from elsewhere.
    if (name !== previousName) {
        setPreviousName(name)
        setDraft(name)
    }

    const emitNameChange = useMemo(
        () => debounce((nextName: string) => onNameChange(nextName), 300),
        [onNameChange]
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
                You already know {currentStack}. This small project shows the
                React equivalents of props, reactive state, derived values, and
                events.
            </p>

            <label htmlFor="welcome-name">
                Name from child (debounced emit)
            </label>
            <input
                id="welcome-name"
                value={draft}
                onChange={handleDraftChange}
                placeholder="Type here in the child"
            />
            <p className="hint">
                In Vue you&apos;d{" "}
                <code>emit(&apos;nameChange&apos;, value)</code>. In React you
                call a callback prop like <code>onNameChange(value)</code>.
                Debounce comes from <code>lodash-es</code>.
            </p>
        </section>
    )
}
