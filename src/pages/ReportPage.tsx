import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { listUsers } from "../api/users"
import {
    NarrowNameSubscriber,
    NarrowReportFormSubscriber,
    WideLearnerSubscriber
} from "../components/ReportSubscribers"
import { UserList, UserReportEditor } from "../components/UserReportEditor"
import { USERS_QUERY_KEY } from "../lib/usersQuery"
import { cx, ui } from "../lib/ui"
import type { Report } from "../types/report"
import type { User } from "../types/user"

export function ReportPage() {
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const { data: users = [], isPending } = useQuery({
        queryKey: USERS_QUERY_KEY,
        queryFn: listUsers
    })

    // On render: keep the chosen id if it still exists, otherwise the first user.
    const selectedUser =
        users.find((user) => user.id === selectedId) ?? users[0] ?? null

    return (
        <section className={cx(ui.panel, "animate-rise")}>
            <p className={ui.eyebrow}>Query + React Hook Form</p>
            <h2 className={ui.title}>Users & reports</h2>
            <p className={ui.lede}>
                List in <strong>React Query</strong>. Selected report edited
                with <code>react-hook-form</code> (
                <code>formState.isDirty</code>). Selection is page state — if
                the id is gone, we pick the first user. Save → mutation →
                invalidate + <code>reset</code>.
            </p>

            {isPending ? (
                <p className="text-muted mt-6 text-sm">Loading…</p>
            ) : (
                /*
                 * key = remount the form when the user changes.
                 * Fresh defaultValues, no useEffect / reset sync needed.
                 */
                <ReportWorkspace
                    key={selectedUser?.id ?? "none"}
                    users={users}
                    selectedUser={selectedUser}
                    onSelectUser={setSelectedId}
                />
            )}
        </section>
    )
}

function ReportWorkspace({
    users,
    selectedUser,
    onSelectUser
}: {
    users: User[]
    selectedUser: User | null
    onSelectUser: (id: string) => void
}) {
    const form = useForm<Report>({
        defaultValues: selectedUser
            ? structuredClone(selectedUser.report)
            : undefined,
        shouldUnregister: false
    })
    const { isDirty } = form.formState
    const selectedId = selectedUser?.id ?? null

    function handleSelect(user: User) {
        if (user.id === selectedId) return
        if (isDirty) {
            const ok = window.confirm(
                "Discard modified report changes for the current user?"
            )
            if (!ok) return
        }
        onSelectUser(user.id)
    }

    return (
        <FormProvider {...form}>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <WideLearnerSubscriber />
                <NarrowNameSubscriber />
                <NarrowReportFormSubscriber selectedId={selectedId} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
                <div className="border-line overflow-hidden rounded-lg border">
                    <div className="border-line bg-tertiary border-b px-4 py-2">
                        <p className="text-secondary m-0 text-xs font-semibold tracking-wide uppercase">
                            useQuery users
                        </p>
                    </div>
                    <UserList
                        users={users}
                        selectedId={selectedId}
                        onSelect={handleSelect}
                    />
                </div>

                <UserReportEditor
                    userId={selectedUser?.id ?? null}
                    userName={selectedUser?.name ?? null}
                />
            </div>
        </FormProvider>
    )
}
