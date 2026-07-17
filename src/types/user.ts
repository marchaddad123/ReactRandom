import type { Report } from "./report"

/**
 * What the API returns: users with a fat nested `report` on each row.
 * Do NOT dump this whole tree into a Zustand store and patch it on every keystroke.
 */
export type User = {
    id: string
    name: string
    email: string
    role: string
    report: Report
}

/** Slim row for lists / sidebars — no report. */
export type UserSummary = Pick<User, "id" | "name" | "email" | "role">
