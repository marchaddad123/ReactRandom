import { debounce } from "lodash-es"
import { type ChangeEvent, useEffect, useMemo, useState } from "react"
import { cx, ui } from "../lib/ui"
import { useLearnerStore } from "../store/useLearnerStore"

type WelcomeCardProps = {
    currentStack: string
}

export function WelcomeCard({ currentStack }: WelcomeCardProps) {
    const name = useLearnerStore((state) => state.name)
    const setName = useLearnerStore((state) => state.setName)

    const [draft, setDraft] = useState(name)
    const [previousName, setPreviousName] = useState(name)

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
        <section className={cx(ui.panel, "animate-rise")}>
            <p className={ui.eyebrow}>React + TypeScript + Tailwind</p>
            <h1 className="font-display text-ink m-0 text-2xl tracking-tight">
                Welcome, {name || "Vue developer"}
            </h1>
            <p className={ui.lede}>
                You already know {currentStack}. This panel reads{" "}
                <code>name</code> from <code>useLearnerStore</code> (Zustand).
            </p>

            <label
                className={cx(ui.fieldLabel, "mt-4")}
                htmlFor="welcome-name"
            >
                Name from child (debounced store update)
                <input
                    id="welcome-name"
                    className={ui.field}
                    value={draft}
                    onChange={handleDraftChange}
                    placeholder="Type here in the child"
                />
            </label>
            <p className={ui.hint}>
                Before: callback prop / Context. Now: Zustand{" "}
                <code>setName</code> (still debounced).
            </p>
        </section>
    )
}
