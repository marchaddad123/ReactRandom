import { z } from "zod"

/** What the create-user form sends — no id / report (API adds those). */
const createUserFieldsSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required")
        // Letters, spaces, hyphen, apostrophe — no symbols/digits
        .regex(/^[\p{L}\s'-]+$/u, "Name cannot contain symbols"),
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Enter a valid email"),
    role: z.string().trim().min(1, "Role is required")
})

export type CreateUserInput = z.infer<typeof createUserFieldsSchema>

/** Form schema + unique email (like a DB unique index), case-insensitive. */
export function createUserSchema(existingEmails: readonly string[] = []) {
    const taken = new Set(
        existingEmails.map((email) => email.trim().toLowerCase())
    )

    return createUserFieldsSchema.superRefine((data, ctx) => {
        if (taken.has(data.email.toLowerCase())) {
            ctx.addIssue({
                code: "custom",
                path: ["email"],
                message: "Email already in use"
            })
        }
    })
}
