import { useQuery, useQueryClient } from "@tanstack/react-query"
import { UserList, UserReportEditor } from "../components/UserReportEditor"
import {
    NarrowNameSubscriber,
    NarrowUsersSubscriber,
    WideLearnerSubscriber
} from "../components/ReportSubscribers"
import { USERS_QUERY_KEY } from "../lib/usersQuery"
import { cx, ui } from "../lib/ui"
import { listUsers } from "../api/users"
import { selectIsReportModified, useUsersStore } from "../store/useUsersStore"
import type { User } from "../types/user"

export function ReportPage() {
    const queryClient = useQueryClient()
    const selectUser = useUsersStore((state) => state.selectUser)
    const selectedId = useUsersStore((state) => state.selectedUserId)
    const isReportModified = useUsersStore(selectIsReportModified)

    const { data: users = [], isPending } = useQuery({
        queryKey: USERS_QUERY_KEY,
        queryFn: listUsers
    })

    function handleSelect(user: User) {
        if (isReportModified) {
            const ok = window.confirm(
                "Discard modified report changes for the current user?"
            )
            if (!ok) return
        }
        const cached = queryClient
            .getQueryData<User[]>(USERS_QUERY_KEY)
            ?.find((item) => item.id === user.id)
        selectUser(cached ?? user)
    }

    return (
        <section className={cx(ui.panel, "animate-rise")}>
            <p className={ui.eyebrow}>Query + useUsersStore</p>
            <h2 className={ui.title}>Users & reports</h2>
            <p className={ui.lede}>
                API returns users (each with a <code>report</code>). List stays
                in <strong>React Query</strong>. The selected user&apos;s report
                is edited in <code>useUsersStore</code>. Save → mutation →
                invalidate.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <WideLearnerSubscriber />
                <NarrowNameSubscriber />
                <NarrowUsersSubscriber />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
                <div className="border-line overflow-hidden rounded-lg border">
                    <div className="border-line bg-tertiary border-b px-4 py-2">
                        <p className="text-secondary m-0 text-xs font-semibold tracking-wide uppercase">
                            useQuery users
                        </p>
                    </div>
                    {isPending ? (
                        <p className="text-muted p-4 text-sm">Loading…</p>
                    ) : (
                        <UserList
                            users={users}
                            selectedId={selectedId}
                            onSelect={handleSelect}
                        />
                    )}
                </div>

                <UserReportEditor />
            </div>
        </section>
    )
}
