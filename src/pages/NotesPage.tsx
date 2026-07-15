import { useEffect, useState } from "react"

export function NotesPage() {
    const [note, setNote] = useState("Type a draft note…")

    useEffect(() => {
        console.log("NotesPage effect mounted")

        return () => {
            console.log("NotesPage effect cleaned up (hidden or unmounted)")
        }
    }, [])

    return (
        <section className="card">
            <p className="eyebrow">Page: Notes</p>
            <h2>Local page state</h2>
            <p className="hint">
                With <code>&lt;Activity&gt;</code>, this text should survive
                when you leave and come back. Open the console: the effect
                cleans up while hidden, then mounts again when visible (state
                still kept).
            </p>
            <label htmlFor="note">Draft</label>
            <textarea
                id="note"
                className="min-h-32 w-full rounded-lg border border-slate-300 p-3"
                value={note}
                onChange={(event) => setNote(event.target.value)}
            />
        </section>
    )
}
