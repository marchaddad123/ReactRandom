import { createInitialReport } from "../types/report"
import type { CreateUserInput } from "../types/createUser"
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

/** Next id like u4 from existing u1, u2, u3… */
function nextUserId(): string {
    let max = 0
    for (const user of usersDb) {
        const match = /^u(\d+)$/.exec(user.id)
        if (match) {
            max = Math.max(max, Number(match[1]))
        }
    }
    return `u${max + 1}`
}

/**
 * Create user from form fields only.
 * API assigns id (uN+1) and builds the default report from name.
 */
export async function createUser(input: CreateUserInput): Promise<User> {
    await delay()
    // Unique email — same idea as a UNIQUE constraint in a DB
    const emailKey = input.email.trim().toLowerCase()
    if (usersDb.some((user) => user.email.toLowerCase() === emailKey)) {
        throw new Error("Email already in use")
    }
    const user: User = {
        id: nextUserId(),
        name: input.name,
        email: input.email.trim(),
        role: input.role,
        report: createInitialReport(input.name)
    }
    usersDb = [...usersDb, user]
    return structuredClone(user)
}

/** Remove a user by id — like DELETE /users/:id */
export async function deleteUser(userId: string): Promise<string> {
    await delay(500)
    const exists = usersDb.some((user) => user.id === userId)
    if (!exists) {
        throw new Error("User not found")
    }
    usersDb = usersDb.filter((user) => user.id !== userId)
    return userId
}
