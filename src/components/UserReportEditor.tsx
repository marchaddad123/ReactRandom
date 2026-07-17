import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useFormContext, useWatch } from "react-hook-form"
import { updateUserReport } from "../api/users"
import { USERS_QUERY_KEY } from "../lib/usersQuery"
import { cx, ui } from "../lib/ui"
import { useLearnerStore } from "../store/useLearnerStore"
import { useNotificationStore } from "../store/useNotificationStore"
import type { Report } from "../types/report"
import type { User } from "../types/user"

function rowVisible(
    row: Report["sections"][number]["rows"][number],
    filters: Report["filters"]
) {
    if (row.checked && !filters.showDone) return false
    if (!row.checked && !filters.showDraft) return false
    const q = filters.query.trim().toLowerCase()
    if (!q) return true
    return (
        row.label.toLowerCase().includes(q) ||
        row.note.toLowerCase().includes(q)
    )
}

export function UserList({
    users,
    selectedId,
    onSelect
}: {
    users: User[]
    selectedId: string | null
    onSelect: (user: User) => void
}) {
    return (
        <ul className="divide-line m-0 list-none divide-y p-0">
            {users.map((user) => {
                const active = user.id === selectedId
                return (
                    <li key={user.id}>
                        <button
                            type="button"
                            onClick={() => onSelect(user)}
                            className={[
                                "flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition",
                                active
                                    ? "bg-primary text-primary-fg"
                                    : "text-ink hover:bg-tertiary bg-transparent"
                            ].join(" ")}
                        >
                            <span className="text-sm font-semibold">
                                {user.name}
                            </span>
                            <span
                                className={[
                                    "text-xs",
                                    active ? "text-primary-fg/80" : "text-muted"
                                ].join(" ")}
                            >
                                {user.email} · {user.role}
                            </span>
                        </button>
                    </li>
                )
            })}
        </ul>
    )
}

export function UserReportEditor({
    userId,
    userName
}: {
    userId: string | null
    userName: string | null
}) {
    const incrementCount = useLearnerStore((state) => state.incrementCount)
    const updateNotification = useNotificationStore(
        (state) => state.updateNotification
    )
    const queryClient = useQueryClient()

    /*
     * STEP 5 — open the shared notebook
     * useFormContext = "give me the form from FormProvider above"
     *   (we did NOT call useForm again here)
     *
     * register("path") = glue this <input> to one field in the notebook
     * handleSubmit     = when the form submits, gather all values safely
     * reset            = set a new "clean starting page"
     * isDirty          = true after any change vs that starting page
     */
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { isDirty, isSubmitting }
    } = useFormContext<Report>()

    /*
     * STEP 6 — peek at some pages while typing
     * useWatch = "tell me when filters/sections change so the list can update"
     * (register alone updates the notebook; watch makes THIS screen re-render)
     */
    const filters = useWatch({ control, name: "filters" })
    const sections = useWatch({ control, name: "sections" })

    /*
     * STEP 7 — Save to API
     * handleSubmit gives us the full Report object from the notebook.
     * We send THAT to the server. We do not read Zustand for the report.
     */
    const saveMutation = useMutation({
        mutationFn: (report: Report) => {
            if (!userId) throw new Error("Nothing to save")
            return updateUserReport(userId, report)
        },
        onSuccess: (user, report) => {
            // Refresh the users list in React Query (server truth)
            void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })

            /*
             * STEP 8 — after a good save
             * reset(report) = "this saved version is the new clean starting page"
             * → isDirty becomes false → Save button turns off again
             */
            reset(report)
            updateNotification({
                message: `Saved report for ${user.name}`,
                error: false
            })
        },
        onError: (error) => {
            updateNotification({
                message: error instanceof Error ? error.message : "Save failed",
                error: true
            })
        }
    })

    if (!userId) {
        return (
            <div
                className={cx(
                    ui.panelInset,
                    "flex min-h-48 items-center justify-center p-6"
                )}
            >
                <p className="text-muted m-0 text-sm">
                    Select a user to edit their report.
                </p>
            </div>
        )
    }

    const activeFilters = filters ?? {
        showDone: true,
        showDraft: true,
        query: ""
    }

    return (
        <form
            className="space-y-4"
            // handleSubmit runs our function with all notebook values
            onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
        >
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className={ui.eyebrow}>React Hook Form</p>
                    <h3 className="font-display text-ink m-0 text-lg leading-snug">
                        {userName}
                    </h3>
                    {/* Keep space even when clean so the layout does not jump */}
                    <p
                        className={cx(
                            "mt-1 text-xs",
                            isDirty ? "text-muted" : "invisible"
                        )}
                    >
                        formState.isDirty — Save to push to the API
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        className={cx(ui.btn, ui.btnTertiary)}
                        onClick={() => incrementCount()}
                    >
                        Bump learner count
                    </button>
                    {/* Save stays off until something really changed (isDirty) */}
                    <button
                        type="submit"
                        className={cx(ui.btn, ui.btnPrimary, "min-w-28")}
                        disabled={
                            !isDirty || isSubmitting || saveMutation.isPending
                        }
                    >
                        {saveMutation.isPending ? "Saving…" : "Save to API"}
                    </button>
                </div>
            </div>

            {/*
              STEP 9 — register
              {...register("meta.title")} wires this box to report.meta.title
              Dot paths = nested objects. No useState needed for each field.
            */}
            <label className={ui.fieldLabel}>
                Meta title
                <input
                    className={ui.field}
                    {...register("meta.title")}
                />
            </label>

            <label className={ui.fieldLabel}>
                Filter query
                <input
                    className={ui.field}
                    placeholder="Filter by label or note…"
                    {...register("filters.query")}
                />
            </label>

            <div className="text-ink flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        {...register("filters.showDone")}
                    />
                    Show done (checked)
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        {...register("filters.showDraft")}
                    />
                    Show draft (unchecked)
                </label>
            </div>

            <div className="space-y-4">
                {(sections ?? []).map((section, sectionIndex) => {
                    const rowsToShow = section.rows
                        .map((row, rowIndex) => ({ row, rowIndex }))
                        .filter(({ row }) => rowVisible(row, activeFilters))

                    return (
                        <div key={section.id}>
                            <p className="text-ink mb-2 text-sm font-semibold">
                                {section.name}
                                <span className="text-muted ml-2 font-normal">
                                    {rowsToShow.length}/{section.rows.length}
                                </span>
                            </p>
                            {rowsToShow.length === 0 ? (
                                <p className="text-muted m-0 text-sm">
                                    No rows match the filters.
                                </p>
                            ) : (
                                <ul className="m-0 list-none space-y-2 p-0">
                                    {rowsToShow.map(({ row, rowIndex }) => (
                                        <li
                                            key={row.id}
                                            className="border-line bg-surface flex flex-wrap items-center gap-3 rounded-md border px-3 py-3"
                                        >
                                            {/*
                                              Nested path with numbers:
                                              sections[0].rows[3].checked
                                            */}
                                            <input
                                                type="checkbox"
                                                {...register(
                                                    `sections.${sectionIndex}.rows.${rowIndex}.checked`
                                                )}
                                            />
                                            <span className="min-w-24 text-sm">
                                                {row.label}
                                            </span>
                                            <input
                                                className={cx(
                                                    ui.field,
                                                    "!mt-0 min-w-0 flex-1"
                                                )}
                                                placeholder="note…"
                                                {...register(
                                                    `sections.${sectionIndex}.rows.${rowIndex}.note`
                                                )}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )
                })}
            </div>
        </form>
    )
}
