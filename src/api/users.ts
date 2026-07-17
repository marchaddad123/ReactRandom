import { createInitialReport } from "../types/report"
import type { Report } from "../types/report"
import type { User } from "../types/user"

/**
 * Fake backend: in-memory users, each with a fat `report`.
 * In a real app this would be sendRequest("/users") etc.
 */
let usersDb: User[] = [
    {
        id: "u1",
        name: "Ada Lovelace",
        email: "ada@example.com",
        role: "Engineer",
        report: createInitialReport("Ada")
    },
    {
        id: "u2",
        name: "Grace Hopper",
        email: "grace@example.com",
        role: "Lead",
        report: createInitialReport("Grace")
    },
    {
        id: "u3",
        name: "Alan Turing",
        email: "alan@example.com",
        role: "Research",
        report: createInitialReport("Alan")
    }
]

function delay(ms = 250) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function listUsers(): Promise<User[]> {
    await delay()
    // Clone so callers can't mutate the fake DB by accident.
    return structuredClone(usersDb)
}

export async function getUser(userId: string): Promise<User | null> {
    await delay()
    const user = usersDb.find((item) => item.id === userId)
    return user ? structuredClone(user) : null
}

/** Persist one user's report — like PATCH /users/:id/report */
export async function updateUserReport(
    userId: string,
    report: Report
): Promise<User> {
    await delay(400)
    const index = usersDb.findIndex((item) => item.id === userId)
    if (index === -1) {
        throw new Error("User not found")
    }
    usersDb = usersDb.map((user, i) =>
        i === index ? { ...user, report: structuredClone(report) } : user
    )
    return structuredClone(usersDb[index]!)
}
