import { useRef } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { useLearnerStore } from "../store/useLearnerStore"
import type { Report } from "../types/report"

/** Counts how many times this component function ran (re-rendered). */
function useRenderCount(label: string) {
    const countRef = useRef(0)
    // Intentional: render-count demo must bump during render.
    // eslint-disable-next-line react-hooks/refs -- demo instrumentation
    countRef.current += 1
    // eslint-disable-next-line react-hooks/refs -- demo instrumentation
    return { label, renders: countRef.current }
}

function RenderBadge({ label, renders }: { label: string; renders: number }) {
    return (
        <p className="text-muted m-0 text-xs">
            <code>{label}</code> renders: <code>{renders}</code>
        </p>
    )
}

/** BAD: whole learner store — re-renders on name/count even while editing report. */
export function WideLearnerSubscriber() {
    const stats = useRenderCount("WideLearner (whole store)")
    const { name, count } = useLearnerStore()

    return (
        <div className="border-danger/30 bg-danger/5 rounded-lg border p-4">
            <RenderBadge {...stats} />
            <p className="text-ink mt-2 mb-0 text-sm">
                name=<code>{name}</code> · count=<code>{count}</code>
            </p>
            <p className="text-muted mt-1 mb-0 text-xs">
                Should stay still while you edit a user report.
            </p>
        </div>
    )
}

/** GOOD: only name from learner store. */
export function NarrowNameSubscriber() {
    const stats = useRenderCount("NarrowName (learner)")
    const name = useLearnerStore((state) => state.name)

    return (
        <div className="border-success/30 bg-success/5 rounded-lg border p-4">
            <RenderBadge {...stats} />
            <p className="text-ink mt-2 mb-0 text-sm">
                Name only: <code>{name}</code>
            </p>
        </div>
    )
}

/**
 * Small demo card: peeks into the SAME React Hook Form notebook.
 * useWatch("meta.title") = only care about the title line.
 * isDirty = did anyone change the notebook since reset?
 */
export function NarrowReportFormSubscriber({
    selectedId
}: {
    selectedId: string | null
}) {
    const stats = useRenderCount("NarrowForm (RHF watch)")
    const { formState } = useFormContext<Report>()
    const { isDirty } = formState
    const title = useWatch<Report, "meta.title">({ name: "meta.title" })

    return (
        <div className="border-primary/25 bg-primary/5 rounded-lg border p-4">
            <RenderBadge {...stats} />
            <p className="text-ink mt-2 mb-0 text-sm">
                {selectedId ? (
                    <>
                        title=<code>{title || "(empty)"}</code> · isDirty=
                        <code>{String(isDirty)}</code>
                    </>
                ) : (
                    "No user selected"
                )}
            </p>
            <p className="text-muted mt-1 mb-0 text-xs">
                <code>useWatch</code> / <code>formState.isDirty</code> — Query
                cache waits until Save.
            </p>
        </div>
    )
}
