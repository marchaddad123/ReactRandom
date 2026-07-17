import { useEffect, useState } from "react"
import { cx, ui } from "../lib/ui"

export function NotesPage() {
    const [note, setNote] = useState("Type a draft note…")

    useEffect(() => {
        console.log("NotesPage effect mounted")

        return () => {
            console.log("NotesPage effect cleaned up (hidden or unmounted)")
        }
    }, [])

    return (
        <section className={cx(ui.panel, "animate-rise")}>
            <p className={ui.eyebrow}>Page: Notes</p>
            <h2 className={ui.title}>Local page state</h2>
            <p className={ui.lede}>
                With <code>&lt;Activity&gt;</code>, this text should survive
                when you leave and come back. Open the console: the effect
                cleans up while hidden, then mounts again when visible (state
                still kept).
            </p>
            <label
                className={cx(ui.fieldLabel, "mt-4")}
                htmlFor="note"
            >
                Draft
                <textarea
                    id="note"
                    className={cx(ui.field, ui.textarea)}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                />
            </label>
        </section>
    )
}
