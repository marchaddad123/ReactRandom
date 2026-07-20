/**
 * Password rules for NEW email accounts (register).
 * These run in our app BEFORE Firebase Auth — Firestore is not involved.
 */

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 64

export type PasswordRuleId =
    | "minLength"
    | "maxLength"
    | "lowercase"
    | "uppercase"
    | "number"
    | "symbol"

export type PasswordRule = {
    id: PasswordRuleId
    label: string
    test: (password: string) => boolean
}

export const passwordRules: PasswordRule[] = [
    {
        id: "minLength",
        label: `At least ${PASSWORD_MIN_LENGTH} characters`,
        test: (password) => password.length >= PASSWORD_MIN_LENGTH
    },
    {
        id: "maxLength",
        label: `At most ${PASSWORD_MAX_LENGTH} characters`,
        test: (password) => password.length <= PASSWORD_MAX_LENGTH
    },
    {
        id: "lowercase",
        label: "One lowercase letter",
        test: (password) => /[a-z]/.test(password)
    },
    {
        id: "uppercase",
        label: "One uppercase letter",
        test: (password) => /[A-Z]/.test(password)
    },
    {
        id: "number",
        label: "One number",
        test: (password) => /[0-9]/.test(password)
    },
    {
        id: "symbol",
        label: "One symbol (e.g. !@#$%)",
        // "Not a letter or digit" = symbol / punctuation
        test: (password) => /[^A-Za-z0-9]/.test(password)
    }
]

/** For the green/red checklist under the register password field. */
export function getPasswordRuleResults(password: string) {
    return passwordRules.map((rule) => ({
        id: rule.id,
        label: rule.label,
        passed: rule.test(password)
    }))
}

/** null = password is OK; otherwise a sentence listing what is missing. */
export function validatePassword(password: string): string | null {
    const failed = getPasswordRuleResults(password).filter(
        (rule) => !rule.passed
    )
    if (failed.length === 0) return null
    return `Password must include: ${failed.map((rule) => rule.label.toLowerCase()).join(", ")}.`
}

export function isPasswordValid(password: string): boolean {
    return validatePassword(password) === null
}
