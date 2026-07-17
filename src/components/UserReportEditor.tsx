import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateUserReport } from "../api/users"
import { USERS_QUERY_KEY } from "../lib/usersQuery"
import { cx, ui } from "../lib/ui"
import { useLearnerStore } from "../store/useLearnerStore"
import { useNotificationStore } from "../store/useNotificationStore"
import { selectIsReportModified, useUsersStore } from "../store/useUsersStore"
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

export function UserReportEditor() {
    const report = useUsersStore((state) => state.report)
    const userId = useUsersStore((state) => state.selectedUserId)
    const userName = useUsersStore((state) => state.selectedUserName)
    const isReportModified = useUsersStore(selectIsReportModified)
    const patchReport = useUsersStore((state) => state.patchReport)
    const syncBaseline = useUsersStore((state) => state.syncBaseline)
    const incrementCount = useLearnerStore((state) => state.incrementCount)
    const updateNotification = useNotificationStore(
        (state) => state.updateNotification
    )
    const queryClient = useQueryClient()

    const saveMutation = useMutation({
        mutationFn: () => {
            if (!userId || !report) {
                throw new Error("Nothing to save")
            }
            return updateUserReport(userId, report)
        },
        onSuccess: (user) => {
            void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
            syncBaseline()
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

    if (!report || !userId) {
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

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className={ui.eyebrow}>useUsersStore</p>
                    <h3 className="font-display text-ink m-0 text-lg leading-snug">
                        {userName}
                    </h3>
                    {/* Always render — invisible when clean — avoids CLS */}
                    <p
                        className={cx(
                            "mt-1 text-xs",
                            isReportModified ? "text-muted" : "invisible"
                        )}
                    >
                        Modified vs last saved — Save to push to the API
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
                    <button
                        type="button"
                        className={cx(ui.btn, ui.btnPrimary, "min-w-28")}
                        disabled={!isReportModified || saveMutation.isPending}
                        onClick={() => saveMutation.mutate()}
                    >
                        {saveMutation.isPending ? "Saving…" : "Save to API"}
                    </button>
                </div>
            </div>

            <label className={ui.fieldLabel}>
                Meta title
                <input
                    className={ui.field}
                    value={report.meta.title}
                    onChange={(event) =>
                        patchReport((r) => {
                            r.meta.title = event.target.value
                        })
                    }
                />
            </label>

            <label className={ui.fieldLabel}>
                Filter query
                <input
                    className={ui.field}
                    value={report.filters.query}
                    placeholder="Filter by label or note…"
                    onChange={(event) =>
                        patchReport((r) => {
                            r.filters.query = event.target.value
                        })
                    }
                />
            </label>

            <div className="text-ink flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={report.filters.showDone}
                        onChange={(event) =>
                            patchReport((r) => {
                                r.filters.showDone = event.target.checked
                            })
                        }
                    />
                    Show done (checked)
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={report.filters.showDraft}
                        onChange={(event) =>
                            patchReport((r) => {
                                r.filters.showDraft = event.target.checked
                            })
                        }
                    />
                    Show draft (unchecked)
                </label>
            </div>

            <div className="space-y-4">
                {report.sections.map((section) => {
                    const visibleRows = section.rows.filter((row) =>
                        rowVisible(row, report.filters)
                    )

                    return (
                        <div key={section.id}>
                            <p className="text-ink mb-2 text-sm font-semibold">
                                {section.name}
                                <span className="text-muted ml-2 font-normal">
                                    {visibleRows.length}/{section.rows.length}
                                </span>
                            </p>
                            {visibleRows.length === 0 ? (
                                <p className="text-muted m-0 text-sm">
                                    No rows match the filters.
                                </p>
                            ) : (
                                <ul className="m-0 list-none space-y-2 p-0">
                                    {visibleRows.map((row) => (
                                        <li
                                            key={row.id}
                                            className="border-line bg-surface flex flex-wrap items-center gap-3 rounded-md border px-3 py-3"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={row.checked}
                                                onChange={(event) =>
                                                    patchReport((r) => {
                                                        const target =
                                                            r.sections
                                                                .flatMap(
                                                                    (s) =>
                                                                        s.rows
                                                                )
                                                                .find(
                                                                    (item) =>
                                                                        item.id ===
                                                                        row.id
                                                                )
                                                        if (target) {
                                                            target.checked =
                                                                event.target.checked
                                                        }
                                                    })
                                                }
                                            />
                                            <span className="min-w-24 text-sm">
                                                {row.label}
                                            </span>
                                            <input
                                                className={cx(
                                                    ui.field,
                                                    "!mt-0 min-w-0 flex-1"
                                                )}
                                                value={row.note}
                                                placeholder="note…"
                                                onChange={(event) =>
                                                    patchReport((r) => {
                                                        const target =
                                                            r.sections
                                                                .flatMap(
                                                                    (s) =>
                                                                        s.rows
                                                                )
                                                                .find(
                                                                    (item) =>
                                                                        item.id ===
                                                                        row.id
                                                                )
                                                        if (target) {
                                                            target.note =
                                                                event.target.value
                                                        }
                                                    })
                                                }
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
