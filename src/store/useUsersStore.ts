import { create } from "zustand"
import type { Report } from "../types/report"
import type { User } from "../types/user"

function reportsMatch(a: Report | null, b: Report | null) {
    if (a === b) return true
    if (!a || !b) return false
    return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Selected user + their report while editing.
 * Full users list still comes from React Query (server).
 * Edits stay here until Save → mutation → invalidate Query.
 */
type UsersState = {
    selectedUserId: string | null
    selectedUserName: string | null
    /** Working copy while editing */
    report: Report | null
    /** Last loaded / saved snapshot — compare to detect real edits */
    baselineReport: Report | null
    selectUser: (user: User) => void
    patchReport: (recipe: (report: Report) => void) => void
    /** After a successful API save — baseline catches up to current */
    syncBaseline: () => void
    clearSelection: () => void
}

/** true when the working report differs from the last saved/loaded snapshot */
export function selectIsReportModified(state: UsersState) {
    return !reportsMatch(state.report, state.baselineReport)
}

export const useUsersStore = create<UsersState>((set, get) => ({
    selectedUserId: null,
    selectedUserName: null,
    report: null,
    baselineReport: null,

    selectUser: (user) => {
        const snapshot = structuredClone(user.report)
        set({
            selectedUserId: user.id,
            selectedUserName: user.name,
            report: structuredClone(snapshot),
            baselineReport: snapshot
        })
    },

    patchReport: (recipe) => {
        const current = get().report
        if (!current) return
        const next = structuredClone(current)
        recipe(next)
        set({ report: next })
    },

    syncBaseline: () => {
        const report = get().report
        set({
            baselineReport: report ? structuredClone(report) : null
        })
    },

    clearSelection: () =>
        set({
            selectedUserId: null,
            selectedUserName: null,
            report: null,
            baselineReport: null
        })
}))
